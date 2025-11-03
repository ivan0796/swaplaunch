import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { ArrowLeftRight, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const BridgePage = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);

  const handleBridge = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    toast.info(t('bridge.integratingPartners'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <ArrowLeftRight className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold dark:text-white">{t('bridge.title')}</h1>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <strong>{t('bridge.integratingPartners')}</strong><br />
                {t('bridge.integratingDesc')}
              </div>
            </div>
          </div>

          <Button
            onClick={handleBridge}
            disabled
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-50 cursor-not-allowed"
          >
            {t('bridge.bridgeAssets')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BridgePage;