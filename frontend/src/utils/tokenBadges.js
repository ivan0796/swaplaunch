import React from 'react';
import { AlertTriangle, Droplet, Sparkles, TrendingDown } from 'lucide-react';

// Badge Component für Token-Warnungen
export const TokenBadge = ({ type, value }) => {
  const badges = {
    low_liquidity: {
      icon: <Droplet className="w-3 h-3" />,
      text: 'Low Liquidity',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    not_tradable: {
      icon: <TrendingDown className="w-3 h-3" />,
      text: 'Not Tradable',
      color: 'bg-red-100 text-red-700 border-red-200',
    },
    new_listing: {
      icon: <Sparkles className="w-3 h-3" />,
      text: 'NEW',
      color: 'bg-green-100 text-green-700 border-green-200',
    },
    tax_token: {
      icon: <AlertTriangle className="w-3 h-3" />,
      text: `Tax ${value}%`,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
    },
  };

  const badge = badges[type];
  if (!badge) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
      {badge.icon}
      <span>{badge.text}</span>
    </div>
  );
};

// Prüfe ob Token geringe Liquidität hat
export const hasLowLiquidity = (liquidity) => {
  return liquidity && liquidity < 10000; // < $10K
};

// Prüfe ob Token tradebar ist
export const isTradable = (liquidity, volume24h) => {
  if (!liquidity) return false;
  if (liquidity < 1000) return false; // < $1K = nicht tradebar
  if (volume24h !== undefined && volume24h < 100) return false; // < $100 Volume
  return true;
};

// Prüfe ob Token neu ist (< 7 Tage)
export const isNewListing = (createdAt) => {
  if (!createdAt) return false;
  const ageInSeconds = Date.now() / 1000 - createdAt;
  const ageInDays = ageInSeconds / 86400;
  return ageInDays < 7;
};

// Extrahiere Tax-Info (aus GoPlus oder Dexscreener)
export const getTaxInfo = (tokenData) => {
  if (!tokenData) return null;
  
  // Von GoPlus Security
  if (tokenData.buy_tax || tokenData.sell_tax) {
    const maxTax = Math.max(
      parseFloat(tokenData.buy_tax || 0),
      parseFloat(tokenData.sell_tax || 0)
    );
    return maxTax > 0 ? maxTax * 100 : null;
  }
  
  return null;
};

export default TokenBadge;
