import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Gift, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const ReferralCodeInput = () => {
  const { address } = useAccount();
  const [code, setCode] = useState('');
  const [eligible, setEligible] = useState(false);
  const [hasRedeemed, setHasRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      checkEligibility();
    }
  }, [address]);

  const checkEligibility = async () => {
    if (!address) return;
    
    try {
      const response = await axios.get(`${API}/api/referral/eligible/${address}`);
      if (response.data.eligible) {
        setEligible(true);
      } else if (response.data.code_used) {
        setHasRedeemed(true);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleRedeem = async () => {
    if (!address || !code) {
      toast.error('Please enter a referral code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/referral/redeem`, {
        wallet: address,
        code: code.toUpperCase()
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setEligible(true);
        setCode('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;
  if (hasRedeemed) return null; // Already redeemed

  if (eligible) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-900 dark:text-green-200">
            🎉 Your first swap is FREE!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">
          Have a referral code?
        </span>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded-lg text-sm outline-none focus:border-purple-500"
          maxLength={8}
        />
        <button
          onClick={handleRedeem}
          disabled={loading || !code}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>
      
      <div className="text-xs text-purple-700 dark:text-purple-300 mt-2">
        💡 Get your first swap for free!
      </div>
    </div>
  );
};

export default ReferralCodeInput;
