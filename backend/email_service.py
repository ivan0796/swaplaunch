"""
Secure Email Service
====================

Multi-provider email service for sending revenue reports.
ALL secrets from ENV only - NO cleartext in code.

Supported Providers:
- SendGrid
- AWS SES
- Mailgun
- SMTP (generic)

Security:
- MAIL_API_KEY from ENV only
- REPORT_RECIPIENT from ENV only
- Retry logic with exponential backoff
- Alert on failure via webhook
"""

import os
import asyncio
import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Security: Load from ENV only
MAIL_PROVIDER = os.getenv('MAIL_PROVIDER', 'sendgrid')
MAIL_API_KEY = os.getenv('MAIL_API_KEY')
REPORT_RECIPIENT = os.getenv('REPORT_RECIPIENT')
REPORT_SENDER = os.getenv('REPORT_SENDER', 'reports@swaplaunch.io')
ALERT_WEBHOOK_URL = os.getenv('ALERT_WEBHOOK_URL')

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAYS = [30, 60, 120]  # Exponential backoff in seconds


class EmailService:
    """Secure email service with multi-provider support."""
    
    def __init__(self):
        self.provider = MAIL_PROVIDER.lower()
        self.api_key = MAIL_API_KEY
        self.recipient = REPORT_RECIPIENT
        self.sender = REPORT_SENDER
        
        # Validate configuration
        if not self.recipient:
            raise ValueError("REPORT_RECIPIENT environment variable not set")
        if not self.api_key and self.provider != 'smtp':
            raise ValueError(f"MAIL_API_KEY required for provider: {self.provider}")
    
    async def send_report(
        self, 
        subject: str, 
        html_body: str, 
        plain_body: str,
        attachments: Optional[list] = None
    ) -> bool:
        """
        Send email with retry logic.
        
        Returns:
            bool: True if sent successfully, False otherwise
        """
        for attempt in range(MAX_RETRIES):
            try:
                if self.provider == 'sendgrid':
                    success = await self._send_sendgrid(subject, html_body, plain_body)
                elif self.provider == 'ses':
                    success = await self._send_ses(subject, html_body, plain_body)
                elif self.provider == 'mailgun':
                    success = await self._send_mailgun(subject, html_body, plain_body)
                elif self.provider == 'smtp':
                    success = await self._send_smtp(subject, html_body, plain_body)
                else:
                    raise ValueError(f"Unsupported mail provider: {self.provider}")
                
                if success:
                    logger.info(f"Email sent successfully via {self.provider}")
                    return True
                    
            except Exception as e:
                logger.error(f"Email send attempt {attempt + 1} failed: {e}")
                
                if attempt < MAX_RETRIES - 1:
                    delay = RETRY_DELAYS[attempt]
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                else:
                    logger.error("All retry attempts exhausted")
                    await self._send_alert(f"Email delivery failed after {MAX_RETRIES} attempts: {str(e)}")
        
        return False
    
    async def _send_sendgrid(self, subject: str, html_body: str, plain_body: str) -> bool:
        """Send via SendGrid API."""
        url = "https://api.sendgrid.com/v3/mail/send"
        
        payload = {
            "personalizations": [{
                "to": [{"email": self.recipient}]
            }],
            "from": {"email": self.sender},
            "subject": subject,
            "content": [
                {"type": "text/plain", "value": plain_body},
                {"type": "text/html", "value": html_body}
            ]
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 202]:
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.text}")
                return False
    
    async def _send_ses(self, subject: str, html_body: str, plain_body: str) -> bool:
        """Send via AWS SES (requires boto3)."""
        try:
            import boto3
            from botocore.exceptions import ClientError
            
            ses_client = boto3.client(
                'ses',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION', 'eu-central-1')
            )
            
            response = ses_client.send_email(
                Source=self.sender,
                Destination={'ToAddresses': [self.recipient]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {
                        'Text': {'Data': plain_body},
                        'Html': {'Data': html_body}
                    }
                }
            )
            
            return response['ResponseMetadata']['HTTPStatusCode'] == 200
            
        except ImportError:
            logger.error("boto3 not installed. Install with: pip install boto3")
            return False
        except ClientError as e:
            logger.error(f"SES error: {e}")
            return False
    
    async def _send_mailgun(self, subject: str, html_body: str, plain_body: str) -> bool:
        """Send via Mailgun API."""
        domain = os.getenv('MAILGUN_DOMAIN', 'mg.swaplaunch.io')
        url = f"https://api.mailgun.net/v3/{domain}/messages"
        
        data = {
            "from": self.sender,
            "to": self.recipient,
            "subject": subject,
            "text": plain_body,
            "html": html_body
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                auth=("api", self.api_key),
                data=data
            )
            
            if response.status_code == 200:
                return True
            else:
                logger.error(f"Mailgun error: {response.status_code} - {response.text}")
                return False
    
    async def _send_smtp(self, subject: str, html_body: str, plain_body: str) -> bool:
        """Send via generic SMTP."""
        smtp_host = os.getenv('SMTP_HOST', 'localhost')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_user = os.getenv('SMTP_USER', '')
        smtp_password = os.getenv('SMTP_PASSWORD', '')
        smtp_tls = os.getenv('SMTP_TLS', 'true').lower() == 'true'
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender
            msg['To'] = self.recipient
            
            part1 = MIMEText(plain_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                if smtp_tls:
                    server.starttls()
                if smtp_user and smtp_password:
                    server.login(smtp_user, smtp_password)
                
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            logger.error(f"SMTP error: {e}")
            return False
    
    async def _send_alert(self, message: str):
        """Send alert via webhook (Telegram/Slack) on email failure."""
        if not ALERT_WEBHOOK_URL:
            logger.warning("ALERT_WEBHOOK_URL not configured, skipping alert")
            return
        
        try:
            payload = {
                "text": f"🚨 Revenue Report Alert\n\n{message}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(ALERT_WEBHOOK_URL, json=payload)
                
                if response.status_code == 200:
                    logger.info("Alert sent successfully")
                else:
                    logger.error(f"Alert webhook failed: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Failed to send alert: {e}")


def generate_html_report(report: Dict[str, Any]) -> str:
    """Generate HTML email body (Minimal Clean Style S1)."""
    kpis = report['kpis']
    period = report['period']
    
    # Format numbers with locale
    from revenue_report import format_currency, format_number_locale
    locale = os.getenv('REPORT_LOCALE', 'de-DE')
    
    revenue_str = format_currency(kpis['revenue'], 'USD', locale)
    volume_str = format_currency(kpis['volume'], 'USD', locale)
    avg_fee_str = f"{kpis['avg_fee_percent']:.3f}%"
    
    # Chain breakdown table
    chain_rows = ""
    for chain in report['chain_breakdown']:
        chain_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{chain['chain']}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{format_currency(chain['revenue'], 'USD', locale)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{format_currency(chain['volume'], 'USD', locale)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{chain['count']}</td>
        </tr>
        """
    
    # Tier breakdown table
    tier_rows = ""
    for tier in report['tier_breakdown']:
        tier_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{tier['tier']}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{tier['avg_fee_percent']:.3f}%</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{format_currency(tier['revenue'], 'USD', locale)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{tier['count']}</td>
        </tr>
        """
    
    # Top pairs
    pair_rows = ""
    for pair in report['top_pairs']:
        pair_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{pair['chain']}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{pair['pair']}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{format_currency(pair['revenue'], 'USD', locale)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">{pair['count']}</td>
        </tr>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; }}
            .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }}
            .kpi-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }}
            .kpi-card {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }}
            .kpi-value {{ font-size: 28px; font-weight: bold; color: #667eea; }}
            .kpi-label {{ font-size: 14px; color: #6b7280; margin-top: 8px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ background: #f3f4f6; padding: 12px 8px; text-align: left; font-weight: 600; font-size: 14px; color: #374151; }}
            .section {{ margin: 40px 0; }}
            .section-title {{ font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #111827; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; }}
            .recommendation {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">📊 Wöchentlicher Revenue Report</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">
                    Zeitraum: {period['start'][:10]} bis {period['end'][:10]} ({period['timezone']})
                </p>
            </div>
            
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-value">{revenue_str}</div>
                    <div class="kpi-label">Gesamt Revenue</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">{volume_str}</div>
                    <div class="kpi-label">Gesamt Volume</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">{kpis['executed_swaps']}</div>
                    <div class="kpi-label">Ausgeführte Swaps</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">{avg_fee_str}</div>
                    <div class="kpi-label">Durchschn. Gebühr</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Chain Breakdown</div>
                <table>
                    <thead>
                        <tr>
                            <th>Chain</th>
                            <th style="text-align: right;">Revenue</th>
                            <th style="text-align: right;">Volume</th>
                            <th style="text-align: right;">Anzahl</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chain_rows}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Fee Tier Breakdown</div>
                <table>
                    <thead>
                        <tr>
                            <th>Tier</th>
                            <th style="text-align: right;">Avg. Fee %</th>
                            <th style="text-align: right;">Revenue</th>
                            <th style="text-align: right;">Anzahl</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tier_rows}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Top 5 Trading Pairs</div>
                <table>
                    <thead>
                        <tr>
                            <th>Chain</th>
                            <th>Pair</th>
                            <th style="text-align: right;">Revenue</th>
                            <th style="text-align: right;">Trades</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pair_rows}
                    </tbody>
                </table>
            </div>
            
            <div class="recommendation">
                <strong>💡 Empfehlung:</strong> Beobachte BNB/Polygon-Fees für Volumenhebel. 
                Höhere Volumen auf günstigen Chains können Gesamt-Revenue steigern.
            </div>
            
            <div class="footer">
                <p><strong>Non-custodial:</strong> Alle Transaktionen wurden ausschließlich per Nutzer-Wallet signiert.</p>
                <p>Generiert am: {report['generated_at'][:19]} UTC</p>
                <p style="color: #9ca3af; margin-top: 12px;">
                    SwapLaunch Revenue Report System • Keine PII in diesem Report
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


def generate_plain_report(report: Dict[str, Any]) -> str:
    """Generate plain text email body."""
    kpis = report['kpis']
    period = report['period']
    
    from revenue_report import format_currency
    locale = os.getenv('REPORT_LOCALE', 'de-DE')
    
    text = f"""
📊 Wöchentlicher Revenue Report
================================

Zeitraum: {period['start'][:10]} bis {period['end'][:10]} ({period['timezone']})

KPIs
----
Gesamt Revenue:     {format_currency(kpis['revenue'], 'USD', locale)}
Gesamt Volume:      {format_currency(kpis['volume'], 'USD', locale)}
Ausgeführte Swaps:  {kpis['executed_swaps']}
Durchschn. Gebühr:  {kpis['avg_fee_percent']:.3f}%

Chain Breakdown
---------------
"""
    
    for chain in report['chain_breakdown']:
        text += f"{chain['chain']:15} | Revenue: {format_currency(chain['revenue'], 'USD', locale):12} | Volume: {format_currency(chain['volume'], 'USD', locale):12} | Count: {chain['count']:4}\n"
    
    text += "\n\nFee Tier Breakdown\n------------------\n"
    for tier in report['tier_breakdown']:
        text += f"{tier['tier']:20} | {tier['avg_fee_percent']:.3f}% | Revenue: {format_currency(tier['revenue'], 'USD', locale):12} | Count: {tier['count']:4}\n"
    
    text += "\n\nTop 5 Trading Pairs\n-------------------\n"
    for pair in report['top_pairs']:
        text += f"{pair['chain']:10} | {pair['pair']:20} | Revenue: {format_currency(pair['revenue'], 'USD', locale):12} | Trades: {pair['count']:4}\n"
    
    text += """

💡 Empfehlung
-------------
Beobachte BNB/Polygon-Fees für Volumenhebel. Höhere Volumen auf günstigen Chains 
können Gesamt-Revenue steigern.

Non-custodial
-------------
Alle Transaktionen wurden ausschließlich per Nutzer-Wallet signiert.

Generiert am: """ + report['generated_at'][:19] + """ UTC
SwapLaunch Revenue Report System
"""
    
    return text
