import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Info } from 'lucide-react';

const MEVProtectionToggle = ({ enabled, onToggle, slippageMode, onSlippageModeChange }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      {/* MEV Protection Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-sm">{t('mev.protection')}</span>
          </div>
          <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-blue-800">
          {enabled ? t('mev.protected') : t('mev.notProtected')}
        </p>
      </div>

      {/* Auto Slippage */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-sm">{t('slippage.title')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSlippageModeChange('auto')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                slippageMode === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {t('slippage.auto')}
            </button>
            <button
              onClick={() => onSlippageModeChange('custom')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                slippageMode === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {t('slippage.custom')}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          {slippageMode === 'auto' ? t('slippage.autoDesc') : t('slippage.customDesc')}
        </p>
      </div>
    </div>
  );
};

export default MEVProtectionToggle;