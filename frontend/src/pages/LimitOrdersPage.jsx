import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { TrendingUp, Calendar, Info, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const LimitOrdersPage = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [orderType, setOrderType] = useState('limit'); // 'limit' or 'dca'
  const [tokenFrom, setTokenFrom] = useState('');
  const [tokenTo, setTokenTo] = useState('');
  const [amount, setAmount] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [dcaInterval, setDcaInterval] = useState('once');

  const executionFee = '0.1%';

  const handleCreateOrder = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    toast.info('Feature in beta testing - Smart contract deployment in progress.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold dark:text-white">Limit Orders & DCA</h1>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm font-bold">BETA</span>
          </div>

          {/* Beta Notice */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-900 dark:text-orange-200">
                <strong>Beta Feature:</strong> Limit orders and DCA strategies are in beta. Smart contracts are being deployed and tested.
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setOrderType('limit')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Limit Order
            </button>
            <button
              onClick={() => setOrderType('dca')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                orderType === 'dca' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              DCA (Dollar Cost Average)
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Execution Fee: {executionFee}</strong><br />
              {orderType === 'limit' 
                ? 'Your order executes automatically when price reaches target.'
                : dcaInterval === 'once'
                ? 'Order wird einmalig ausgeführt, sobald der Zielpreis erreicht wird.'
                : 'Automate recurring buys at set intervals (DCA strategy).'}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">From Token</label>
              <Input placeholder="ETH" value={tokenFrom} onChange={(e) => setTokenFrom(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Token</label>
              <Input placeholder="USDC" value={tokenTo} onChange={(e) => setTokenTo(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            {orderType === 'limit' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Target Price</label>
                <Input type="number" placeholder="0.0" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
              </div>
            ) : (
              <>
                {dcaInterval === 'once' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Price (Optional)</label>
                    <Input 
                      type="number" 
                      placeholder="Leer lassen für Market Order" 
                      value={targetPrice} 
                      onChange={(e) => setTargetPrice(e.target.value)} 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Interval</label>
                  <select
                    value={dcaInterval}
                    onChange={(e) => setDcaInterval(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="once">Einmalig (One-Time)</option>
                    <option value="daily">Täglich (Daily)</option>
                    <option value="weekly">Wöchentlich (Weekly)</option>
                    <option value="monthly">Monatlich (Monthly)</option>
                  </select>
                  {dcaInterval === 'once' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Order wird nur einmal ausgeführt. Mit Zielpreis = Limit Order, ohne = Market Order.
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              onClick={handleCreateOrder}
              disabled={!isConnected}
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isConnected ? `Create ${orderType === 'limit' ? 'Limit Order' : 'DCA Strategy'}` : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitOrdersPage;