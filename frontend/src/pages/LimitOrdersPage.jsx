import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const LimitOrdersPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [orderType, setOrderType] = useState('limit'); // 'limit' or 'dca'
  const [tokenFrom, setTokenFrom] = useState('');
  const [tokenTo, setTokenTo] = useState('');
  const [amount, setAmount] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [dcaInterval, setDcaInterval] = useState('daily');

  const executionFee = '0.1%';

  const handleCreateOrder = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    toast.info('Limit Orders & DCA coming soon! Smart contract deployment in progress.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SwapLaunch v2.0
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Trade</Link>
            <Link to="/launchpad" className="text-gray-600 hover:text-blue-600">Launchpad</Link>
            <Link to="/token-locker" className="text-gray-600 hover:text-blue-600">Token Locker</Link>
            <Link to="/limit-orders" className="text-blue-600 font-semibold">Limit & DCA</Link>
            <Link to="/bridge" className="text-gray-600 hover:text-blue-600">Bridge</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Limit Orders & DCA</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setOrderType('limit')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
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
                : 'Automate recurring buys at set intervals.'}
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
              <div>
                <label className="block text-sm font-medium mb-2">Interval</label>
                <select
                  value={dcaInterval}
                  onChange={(e) => setDcaInterval(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
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