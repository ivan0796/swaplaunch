import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from './CurrencyContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

/**
 * Default settings according to user requirements
 */
const DEFAULT_SETTINGS = {
  // Swaps & Liquidity
  slippage: 0.5,
  deadline: 20,
  
  // Interface Settings
  autoRouter: true,
  expertMode: false,
  language: 'en',
  currency: 'eur',
  theme: 'system', // system, light, dark
  highImpactConfirm: true, // default on
  lowLiquidityWarning: true, // default on
  gasOption: 'standard', // standard, fast, max
  mevProtection: true, // default on
  showRouteDetails: true, // default on
};

export const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { setCurrency } = useCurrency();

  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('swapLaunch_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('swapLaunch_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply language change
  useEffect(() => {
    if (settings.language && i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  // Apply currency change
  useEffect(() => {
    if (settings.currency) {
      setCurrency(settings.currency);
    }
  }, [settings.currency, setCurrency]);

  // Apply theme
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else { // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Listen for system theme changes if theme is 'system'
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    i18n.changeLanguage(DEFAULT_SETTINGS.language);
    setCurrency(DEFAULT_SETTINGS.currency);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
