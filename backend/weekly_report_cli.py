"""
Weekly Revenue Report CLI
=========================

Commands:
- dry-run: Generate report preview without sending
- send-now: Generate and send report immediately
- test-email: Send test email to verify configuration

Security: All secrets from ENV only.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from revenue_report import RevenueReportGenerator
from email_service import EmailService, generate_html_report, generate_plain_report
import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load ENV
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'swaplaunch_db')


async def dry_run():
    """Generate report preview without sending."""
    logger.info("=== DRY RUN: Generating Report Preview ===")
    
    client = AsyncIOMotorClient(MONGO_URL)
    generator = RevenueReportGenerator(client)
    
    try:
        report = await generator.generate_report(days=7, dry_run=True)
        
        # Print report to console
        print("\n" + "="*80)
        print("REVENUE REPORT PREVIEW")
        print("="*80)
        print(json.dumps(report, indent=2, default=str))
        print("="*80)
        
        # Generate email bodies
        html = generate_html_report(report)
        plain = generate_plain_report(report)
        
        # Save to files
        preview_dir = Path("/tmp/revenue_report_preview")
        preview_dir.mkdir(exist_ok=True)
        
        with open(preview_dir / "report.json", "w") as f:
            json.dump(report, f, indent=2, default=str)
        
        with open(preview_dir / "email.html", "w") as f:
            f.write(html)
        
        with open(preview_dir / "email.txt", "w") as f:
            f.write(plain)
        
        logger.info(f"Preview saved to: {preview_dir}")
        logger.info("✅ Dry run completed successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Dry run failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        client.close()


async def send_report_now():
    """Generate and send report immediately."""
    logger.info("=== SENDING WEEKLY REVENUE REPORT ===")
    
    # Validate ENV configuration
    recipient = os.getenv('REPORT_RECIPIENT')
    if not recipient:
        logger.error("❌ REPORT_RECIPIENT not set in environment")
        return False
    
    mail_provider = os.getenv('MAIL_PROVIDER', 'sendgrid')
    mail_api_key = os.getenv('MAIL_API_KEY')
    
    if not mail_api_key and mail_provider != 'smtp':
        logger.error(f"❌ MAIL_API_KEY not set for provider: {mail_provider}")
        return False
    
    logger.info(f"Configuration:")
    logger.info(f"  Provider: {mail_provider}")
    logger.info(f"  Recipient: {recipient[:3]}***{recipient[-10:]}")  # Partial mask
    
    client = AsyncIOMotorClient(MONGO_URL)
    generator = RevenueReportGenerator(client)
    email_service = EmailService()
    
    try:
        # Generate report
        logger.info("Generating report...")
        report = await generator.generate_report(days=7, dry_run=False)
        
        logger.info(f"Report generated:")
        logger.info(f"  Revenue: ${report['kpis']['revenue']:.2f}")
        logger.info(f"  Volume: ${report['kpis']['volume']:.2f}")
        logger.info(f"  Swaps: {report['kpis']['executed_swaps']}")
        
        # Generate email content
        html_body = generate_html_report(report)
        plain_body = generate_plain_report(report)
        subject = f"📊 Wöchentlicher Revenue Report - {datetime.now().strftime('%d.%m.%Y')}"
        
        # Send email
        logger.info("Sending email...")
        success = await email_service.send_report(subject, html_body, plain_body)
        
        if success:
            logger.info("✅ Report sent successfully")
            
            # Update report snapshot status
            await generator.reports_collection.update_one(
                {'generated_at': report['generated_at']},
                {'$set': {'status': 'sent', 'sent_at': datetime.utcnow().isoformat()}}
            )
            
            return True
        else:
            logger.error("❌ Failed to send report")
            return False
            
    except Exception as e:
        logger.error(f"❌ Report sending failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        client.close()


async def test_email():
    """Send test email to verify configuration."""
    logger.info("=== TESTING EMAIL CONFIGURATION ===")
    
    recipient = os.getenv('REPORT_RECIPIENT')
    if not recipient:
        logger.error("❌ REPORT_RECIPIENT not set")
        return False
    
    email_service = EmailService()
    
    test_html = """
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #667eea;">✅ Email Configuration Test</h2>
        <p>This is a test email from SwapLaunch Revenue Report System.</p>
        <p>If you received this, your email configuration is working correctly.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
            Provider: {provider}<br>
            Timestamp: {timestamp}
        </p>
    </body>
    </html>
    """.format(
        provider=os.getenv('MAIL_PROVIDER', 'sendgrid'),
        timestamp=datetime.utcnow().isoformat()
    )
    
    test_plain = f"""
    ✅ Email Configuration Test
    
    This is a test email from SwapLaunch Revenue Report System.
    If you received this, your email configuration is working correctly.
    
    Provider: {os.getenv('MAIL_PROVIDER', 'sendgrid')}
    Timestamp: {datetime.utcnow().isoformat()}
    """
    
    try:
        success = await email_service.send_report(
            "Test: SwapLaunch Revenue Report System",
            test_html,
            test_plain
        )
        
        if success:
            logger.info("✅ Test email sent successfully")
            return True
        else:
            logger.error("❌ Test email failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python weekly_report_cli.py dry-run     # Preview without sending")
        print("  python weekly_report_cli.py send-now    # Generate and send now")
        print("  python weekly_report_cli.py test-email  # Test email configuration")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "dry-run":
        success = asyncio.run(dry_run())
    elif command == "send-now":
        success = asyncio.run(send_report_now())
    elif command == "test-email":
        success = asyncio.run(test_email())
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
