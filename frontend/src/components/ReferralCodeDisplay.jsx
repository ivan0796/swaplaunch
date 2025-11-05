import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Copy, Gift, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const ReferralCodeDisplay = () => {
  const { address } = useAccount();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchReferralCode();
    }
  }, [address]);

  const fetchReferralCode = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/referral/code/${address}`);
      setReferralData(response.data);
    } catch (error) {
      console.error('Error fetching referral code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(referralData.code);
      toast.success('Referral code copied!');
    }
  };

  const handleShareLink = () => {
    if (referralData?.code) {
      const url = `${window.location.origin}?ref=${referralData.code}`;
      navigator.clipboard.writeText(url);
      toast.success('Referral link copied!');
    }
  };

  if (!address) return null;
  if (loading) return <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>;
  if (!referralData) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your Referral Code</span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
          <code className="text-lg font-bold text-purple-900 dark:text-purple-300">
            {referralData.code}
          </code>
        </div>
        <button
          onClick={handleCopyCode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Copy code"
        >
          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
        <span>Referrals: {referralData.uses || 0}</span>
        <button
          onClick={handleShareLink}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
        >
          <Share2 className="w-3 h-3" />
          Share Link
        </button>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-500">
        💡 Share your code and earn rewards! New users get their first swap free.
      </div>
    </div>
  );
};

export default ReferralCodeDisplay;
