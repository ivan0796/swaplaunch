import React, { useState, useEffect } from 'react';
import { getTokenSecurity, parseSecurityRisks } from '../services/tokenSecurity';
import { AlertTriangle, Shield, X } from 'lucide-react';

const CombinedSecurityWarning = ({ sellToken, buyToken, chainId, onWarningChange }) => {
  const [sellSecurity, setSellSecurity] = useState(null);
  const [buySecurity, setBuySecurity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkSecurityForBothTokens();
  }, [sellToken?.address, buyToken?.address, chainId]);

  const checkSecurityForBothTokens = async () => {
    if (!sellToken && !buyToken) {
      onWarningChange?.(null);
      return;
    }

    setLoading(true);
    let highestRisk = 'low';

    try {
      // Check sell token security
      if (sellToken && sellToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        const sellData = await getTokenSecurity(sellToken.address, chainId);
        if (sellData) {
          const sellRisk = parseSecurityRisks(sellData);
          setSellSecurity(sellRisk);
          
          if (sellRisk.level === 'critical') highestRisk = 'critical';
          else if (sellRisk.level === 'high' && highestRisk !== 'critical') highestRisk = 'high';
          else if (sellRisk.level === 'medium' && highestRisk === 'low') highestRisk = 'medium';
        }
      }

      // Check buy token security
      if (buyToken && buyToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        const buyData = await getTokenSecurity(buyToken.address, chainId);
        if (buyData) {
          const buyRisk = parseSecurityRisks(buyData);
          setBuySecurity(buyRisk);
          
          if (buyRisk.level === 'critical') highestRisk = 'critical';
          else if (buyRisk.level === 'high' && highestRisk !== 'critical') highestRisk = 'high';
          else if (buyRisk.level === 'medium' && highestRisk === 'low') highestRisk = 'medium';
        }
      }

      onWarningChange?.(highestRisk);
    } catch (error) {
      console.error('Security check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get highest risk level between both tokens
  const getHighestRisk = () => {
    if (!sellSecurity && !buySecurity) return null;
    
    const risks = [sellSecurity?.level, buySecurity?.level].filter(Boolean);
    if (risks.includes('critical')) return 'critical';
    if (risks.includes('high')) return 'high';
    if (risks.includes('medium')) return 'medium';
    return 'low';
  };

  const highestRisk = getHighestRisk();

  // Only show warning if there's a medium or higher risk
  if (!highestRisk || highestRisk === 'low' || dismissed) return null;

  const getWarningConfig = () => {
    switch (highestRisk) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          title: '🚨 CRITICAL RISK DETECTED',
          message: 'One or both tokens have critical security risks. DO NOT PROCEED with this swap!'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          text: 'text-orange-900',
          title: '⚠️ HIGH RISK WARNING',
          message: 'One or both tokens have high security risks. Proceed with extreme caution.'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-900',
          title: '⚠️ Security Notice',
          message: 'One or both tokens have some security concerns. Review details before swapping.'
        };
      default:
        return null;
    }
  };

  const config = getWarningConfig();
  if (!config) return null;

  return (
    <div className={`rounded-xl border-2 p-4 ${config.bg} relative`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-6 h-6 ${config.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-bold text-sm mb-1 ${config.text}`}>{config.title}</h4>
          <p className={`text-xs ${config.text}`}>{config.message}</p>
          
          {/* Show which tokens have issues */}
          <div className="mt-2 space-y-1 text-xs">
            {sellSecurity && sellSecurity.level !== 'low' && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{sellToken?.symbol}:</span>
                <span>Security Level {sellSecurity.level.toUpperCase()}</span>
              </div>
            )}
            {buySecurity && buySecurity.level !== 'low' && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{buyToken?.symbol}:</span>
                <span>Security Level {buySecurity.level.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedSecurityWarning;
