import React, { useState } from 'react';
import { X, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { useSettings } from '../contexts/SettingsContext';

const SwapSettingsModal = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSetting, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('swaps');
  const [customSlippage, setCustomSlippage] = useState('');
  const [showExpertWarning, setShowExpertWarning] = useState(false);

  if (!isOpen) return null;

  const handleSlippageSelect = (value) => {
    updateSetting('slippage', value);
    setCustomSlippage('');
  };

  const handleCustomSlippage = (value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      updateSetting('slippage', numValue);
      setCustomSlippage(value);
    }
  };

  const handleExpertModeToggle = () => {
    if (!settings.expertMode) {
      // Show warning when enabling
      setShowExpertWarning(true);
    } else {
      // Disable directly
      updateSetting('expertMode', false);
    }
  };

  const confirmExpertMode = () => {
    updateSetting('expertMode', true);
    setShowExpertWarning(false);
  };

  const handleLanguageChange = (lang) => {
    updateSetting('language', lang);
    i18n.changeLanguage(lang);
  };

  const handleReset = () => {
    if (window.confirm(t('settings.confirmReset') || 'Alle Einstellungen auf Standardwerte zurücksetzen?')) {
      resetSettings();
      setCustomSlippage('');
    }
  };

  const ToggleSwitch = ({ value, onChange, label, tooltip }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium dark:text-white text-sm">{label}</div>
          {tooltip && (
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const Dropdown = ({ value, onChange, options, label, tooltip }) => (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium dark:text-white">{label}</label>
        {tooltip && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl outline-none text-sm dark:text-white cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">{t('settings.title') || 'Einstellungen'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('swaps')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'swaps'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('settings.swapsTab') || 'Swaps & Liquidität'}
          </button>
          <button
            onClick={() => setActiveTab('interface')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'interface'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('settings.interfaceTab') || 'Interface'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'swaps' && (
            <div className="space-y-6">
              {/* Default Transaction Deadline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-semibold dark:text-white">
                    {t('settings.deadline') || 'Standard-Transaktionsfrist'}
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {t('settings.deadlineTooltip') || 'Ihre Transaktion wird rückgängig gemacht, wenn sie länger als diese Zeit aussteht.'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.deadline}
                    onChange={(e) => updateSetting('deadline', parseInt(e.target.value) || 20)}
                    min="1"
                    max="180"
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl outline-none text-lg dark:text-white"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {t('settings.minutes') || 'Minuten'}
                  </span>
                </div>
              </div>

              {/* Slippage Tolerance */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-semibold dark:text-white">
                    {t('settings.slippage') || 'Slippage-Toleranz'}
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {t('settings.slippageTooltip') || 'Ihre Transaktion wird rückgängig gemacht, wenn sich der Preis ungünstig um mehr als diesen Prozentsatz ändert.'}
                    </div>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.1, 0.5, 1.0].map(value => (
                    <button
                      key={value}
                      onClick={() => handleSlippageSelect(value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        settings.slippage === value && !customSlippage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Custom"
                      value={customSlippage}
                      onChange={(e) => handleCustomSlippage(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-sm text-center outline-none transition-colors ${
                        customSlippage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      step="0.1"
                      min="0.1"
                      max="50"
                    />
                  </div>
                </div>

                {/* Warning Messages */}
                {settings.slippage < 0.5 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-xs text-orange-800 dark:text-orange-200">
                    ⚠️ {t('settings.slippageLowWarning') || 'Ihre Transaktion könnte fehlschlagen'}
                  </div>
                )}
                {settings.slippage > 5 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-xs text-red-800 dark:text-red-200">
                    ⚠️ {t('settings.slippageHighWarning') || 'Ihre Transaktion könnte frontrun werden'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'interface' && (
            <div className="space-y-4">
              {/* Auto Router API */}
              <ToggleSwitch
                value={settings.autoRouter}
                onChange={() => updateSetting('autoRouter', !settings.autoRouter)}
                label={t('settings.autoRouter') || 'Auto Router API'}
                tooltip={t('settings.autoRouterTooltip') || 'Automatisch beste Route über mehrere DEXs finden'}
              />

              {/* Expert Mode */}
              <ToggleSwitch
                value={settings.expertMode}
                onChange={handleExpertModeToggle}
                label={t('settings.expertMode') || 'Expertenmodus'}
                tooltip={t('settings.expertModeTooltip') || 'Bestätigungen überspringen und erweiterte Optionen aktivieren'}
              />

              {/* Language */}
              <Dropdown
                value={settings.language}
                onChange={(val) => handleLanguageChange(val)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'zh', label: '中文' }
                ]}
                label={t('settings.language') || 'Sprache'}
                tooltip={t('settings.languageTooltip') || 'UI-Sprache auswählen'}
              />

              {/* Currency */}
              <Dropdown
                value={settings.currency}
                onChange={(val) => updateSetting('currency', val)}
                options={[
                  { value: 'usd', label: 'USD ($)' },
                  { value: 'eur', label: 'EUR (€)' },
                  { value: 'gbp', label: 'GBP (£)' }
                ]}
                label={t('settings.currency') || 'Währungsanzeige'}
                tooltip={t('settings.currencyTooltip') || 'Bevorzugte Fiat-Währung für Preisanzeige'}
              />

              {/* Theme */}
              <Dropdown
                value={settings.theme}
                onChange={(val) => updateSetting('theme', val)}
                options={[
                  { value: 'system', label: t('settings.themeSystem') || 'System' },
                  { value: 'light', label: t('settings.themeLight') || 'Hell' },
                  { value: 'dark', label: t('settings.themeDark') || 'Dunkel' }
                ]}
                label={t('settings.theme') || 'Theme'}
                tooltip={t('settings.themeTooltip') || 'Farbschema der Benutzeroberfläche'}
              />

              {/* High Impact Confirm */}
              <ToggleSwitch
                value={settings.highImpactConfirm}
                onChange={() => updateSetting('highImpactConfirm', !settings.highImpactConfirm)}
                label={t('settings.highImpactConfirm') || 'Bestätigung bei hohem Price Impact (>2%)'}
                tooltip={t('settings.highImpactTooltip') || 'Zusätzliche Bestätigung, wenn der Trade den Preis stark beeinflusst'}
              />

              {/* Low Liquidity Warning */}
              <ToggleSwitch
                value={settings.lowLiquidityWarning}
                onChange={() => updateSetting('lowLiquidityWarning', !settings.lowLiquidityWarning)}
                label={t('settings.lowLiquidityWarning') || 'Warnung bei geringer Liquidität'}
                tooltip={t('settings.lowLiquidityTooltip') || 'Warnung anzeigen bei Paaren mit niedriger Liquidität'}
              />

              {/* Gas Option */}
              <Dropdown
                value={settings.gasOption}
                onChange={(val) => updateSetting('gasOption', val)}
                options={[
                  { value: 'standard', label: t('settings.gasStandard') || 'Standard' },
                  { value: 'fast', label: t('settings.gasFast') || 'Schnell' },
                  { value: 'max', label: t('settings.gasMax') || 'Maximal' }
                ]}
                label={t('settings.gasOption') || 'Gas-Priorität'}
                tooltip={t('settings.gasOptionTooltip') || 'Gas-Preis-Voreinstellung für Transaktionen'}
              />

              {/* MEV Protection */}
              <ToggleSwitch
                value={settings.mevProtection}
                onChange={() => updateSetting('mevProtection', !settings.mevProtection)}
                label={t('settings.mevProtection') || 'MEV-Schutz'}
                tooltip={t('settings.mevProtectionTooltip') || 'Schutz vor Maximal Extractable Value (MEV) Angriffen'}
              />

              {/* Show Route Details */}
              <ToggleSwitch
                value={settings.showRouteDetails}
                onChange={() => updateSetting('showRouteDetails', !settings.showRouteDetails)}
                label={t('settings.showRouteDetails') || 'Erweiterte Route-Details anzeigen'}
                tooltip={t('settings.showRouteDetailsTooltip') || 'Vollständige Route und Gebührenaufschlüsselung anzeigen'}
              />

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-200">
                    <p className="font-semibold mb-1">{t('settings.infoTitle') || 'Einstellungen'}</p>
                    <p>
                      {t('settings.infoText') || 'Einstellungen werden lokal gespeichert und gelten für alle Ihre Transaktionen.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            onClick={handleReset}
            className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            {t('settings.resetButton') || '↻ Auf Standardwerte zurücksetzen'}
          </button>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {t('settings.closeButton') || 'Schließen'}
          </Button>
        </div>
      </div>

      {/* Expert Mode Confirmation Modal */}
      {showExpertWarning && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold dark:text-white">
                {t('settings.expertWarningTitle') || 'Expertenmodus aktivieren?'}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('settings.expertWarningText') || 'Der Expertenmodus überspringt Bestätigungen und erlaubt Trades mit hohem Slippage. Sie können Geld verlieren. Verwenden Sie dies auf eigenes Risiko.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExpertWarning(false)}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('settings.cancel') || 'Abbrechen'}
              </button>
              <button
                onClick={confirmExpertMode}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
              >
                {t('settings.confirm') || 'Aktivieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapSettingsModal;
