import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

/**
 * Detect user's currency based on browser locale and region
 */
const detectCurrency = () => {
  // Check localStorage first
  const saved = localStorage.getItem('preferred_currency');
  if (saved && ['usd', 'eur', 'gbp'].includes(saved)) {
    return saved;
  }

  // Detect from browser locale
  const locale = navigator.language || navigator.userLanguage || 'en-US';
  
  // Map locales to currencies
  const currencyMap = {
    // EUR countries
    'de': 'eur', 'at': 'eur', 'be': 'eur', 'cy': 'eur',
    'ee': 'eur', 'fi': 'eur', 'fr': 'eur', 'gr': 'eur',
    'ie': 'eur', 'it': 'eur', 'lv': 'eur', 'lt': 'eur',
    'lu': 'eur', 'mt': 'eur', 'nl': 'eur', 'pt': 'eur',
    'sk': 'eur', 'si': 'eur', 'es': 'eur',
    
    // GBP countries
    'gb': 'gbp', 'uk': 'gbp',
    
    // Default to USD for others
  };
  
  const countryCode = locale.split('-')[1]?.toLowerCase() || locale.split('_')[1]?.toLowerCase();
  
  return currencyMap[countryCode] || 'usd';
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => detectCurrency());

  useEffect(() => {
    // Save to localStorage when changed
    localStorage.setItem('preferred_currency', currency);
  }, [currency]);

  const getCurrencySymbol = () => {
    const symbols = { usd: '$', eur: '€', gbp: '£' };
    return symbols[currency] || '$';
  };

  const getCurrencyName = () => {
    const names = { usd: 'USD', eur: 'EUR', gbp: 'GBP' };
    return names[currency] || 'USD';
  };

  // Exchange rates (updated periodically, USD base)
  const [exchangeRates, setExchangeRates] = useState({ usd: 1, eur: 0.92, gbp: 0.79 });

  const formatPrice = (priceUSD, showSymbol = true) => {
    if (!priceUSD && priceUSD !== 0) return 'N/A';
    
    // Convert from USD to selected currency
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = priceUSD * rate;
    
    const formatted = Number(convertedPrice).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return showSymbol ? `${getCurrencySymbol()}${formatted}` : formatted;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        getCurrencySymbol,
        getCurrencyName,
        formatPrice
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
