import React, { useState, useEffect } from 'react';
import { getTokenSecurity, parseSecurityRisks, getRiskColor, getRiskBadgeColor, getSecurityLabel } from '../services/tokenSecurity';
import { Shield, AlertTriangle, Info, ExternalLink, RefreshCw } from 'lucide-react';

const TokenSecurityPanel = ({ tokenAddress, chainId, tokenSymbol }) => {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);

  useEffect(() => {
    if (tokenAddress && chainId) {
      fetchSecurityData();
    }
  }, [tokenAddress, chainId]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const data = await getTokenSecurity(chainId, tokenAddress);
      setSecurityData(data);
      
      if (data) {
        const assessment = parseSecurityRisks(data);
        setRiskAssessment(assessment);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Scanning token security...
        </div>
      </div>
    );
  }

  if (!securityData || !riskAssessment) {
    return null;
  }

  const { level, risks, buyTax, sellTax } = riskAssessment;

  return (
    <div className={`rounded-lg p-4 border-2 ${getRiskColor(level)}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Token Security</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRiskBadgeColor(level)}`}>
            {getSecurityLabel(level)}
          </span>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          {expanded ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Summary */}
      {!expanded && (
        <div className="mt-2 text-sm">
          {level === 'critical' && (
            <div className="flex items-start gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Critical risks detected! Do not trade this token.</span>
            </div>
          )}
          {level === 'high' && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>High risk token. Trade with extreme caution.</span>
            </div>
          )}
          {level === 'medium' && (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Some risks detected. Review before trading.</span>
            </div>
          )}
          {level === 'low' && (
            <div className="flex items-start gap-2 text-green-700">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Low risk token. Appears safe to trade.</span>
            </div>
          )}
        </div>
      )}

      {/* Detailed View */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Tax Information */}
          {(buyTax > 0 || sellTax > 0) && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-sm font-medium mb-2">Tax Information</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Buy Tax:</span>
                  <span className={`ml-2 font-medium ${buyTax > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {buyTax}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Sell Tax:</span>
                  <span className={`ml-2 font-medium ${sellTax > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {sellTax}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Risk List */}
          <div className="space-y-2">
            {risks.map((risk, index) => {
              const getRiskIcon = (type) => {
                switch (type) {
                  case 'critical':
                  case 'high':
                    return <AlertTriangle className="w-4 h-4 text-red-600" />;
                  case 'medium':
                    return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
                  default:
                    return <Info className="w-4 h-4 text-blue-600" />;
                }
              };

              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {getRiskIcon(risk.type)}
                  <span>{risk.message}</span>
                </div>
              );
            })}
          </div>

          {/* Contract Info */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Contract:</span>
              <a
                href={`https://gopluslabs.io/token-security/${chainId}/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Report
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 bg-white rounded p-2 border border-gray-200">
            <strong>Disclaimer:</strong> This is automated analysis. Always DYOR (Do Your Own Research) before trading.
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSecurityPanel;