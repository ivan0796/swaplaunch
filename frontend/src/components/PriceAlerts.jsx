import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

const PriceAlerts = ({ walletAddress }) => {
  const [alerts, setAlerts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    token: '',
    targetPrice: '',
    condition: 'above' // 'above' or 'below'
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    // Load from localStorage (works without wallet)
    try {
      const stored = localStorage.getItem('swapLaunchAlerts');
      if (stored) {
        setAlerts(JSON.parse(stored));
      } else {
        // Demo alerts
        const mockAlerts = [
          {
            id: '1',
            token: { symbol: 'ETH', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
            currentPrice: 3234.56,
            targetPrice: 3500,
            condition: 'above',
            active: true
          }
        ];
        setAlerts(mockAlerts);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const saveAlerts = (updatedAlerts) => {
    localStorage.setItem('swapLaunchAlerts', JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  const handleAddAlert = async () => {
    if (!newAlert.token || !newAlert.targetPrice) {
      toast.error('Please fill all fields');
      return;
    }

    const alert = {
      id: Date.now().toString(),
      token: { 
        symbol: newAlert.token.toUpperCase(), 
        logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png` // Generic
      },
      currentPrice: 0, // Will be updated by price feed
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      active: true,
      createdAt: new Date().toISOString()
    };

    const updatedAlerts = [...alerts, alert];
    saveAlerts(updatedAlerts);
    
    toast.success('Price alert created! 🔔');
    toast.info('Alerts are checked every 5 minutes. Enable browser notifications to get alerts.');
    
    setNewAlert({ token: '', targetPrice: '', condition: 'above' });
    setShowAddForm(false);
  };

  const handleDeleteAlert = async (alertId) => {
    const updatedAlerts = alerts.filter(a => a.id !== alertId);
    saveAlerts(updatedAlerts);
    toast.success('Alert deleted');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold dark:text-white">Price Alerts</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h4 className="font-semibold mb-3 dark:text-white">Create Price Alert</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Token Symbol</label>
              <Input
                placeholder="ETH, BTC, BNB..."
                value={newAlert.token}
                onChange={(e) => setNewAlert({ ...newAlert, token: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Target Price (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Condition</label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddAlert} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Create Alert
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">No price alerts set</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Get notified when tokens reach target prices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const percentDiff = ((alert.targetPrice - alert.currentPrice) / alert.currentPrice * 100).toFixed(2);
            const isAbove = alert.condition === 'above';
            
            return (
              <div key={alert.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img src={alert.token.logo} alt={alert.token.symbol} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-bold dark:text-white">{alert.token.symbol}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Current: ${alert.currentPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isAbove ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Alert when {isAbove ? 'above' : 'below'} ${alert.targetPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    (isAbove && percentDiff > 0) || (!isAbove && percentDiff < 0)
                      ? 'text-orange-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {percentDiff > 0 ? '+' : ''}{percentDiff}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-200">
        <Bell className="w-4 h-4 inline mr-2" />
        <strong>No wallet needed!</strong> Alerts saved locally. Enable browser notifications for real-time alerts. Alerts checked every 5 minutes.
      </div>
    </div>
  );
};

export default PriceAlerts;
