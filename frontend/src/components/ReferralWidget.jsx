import React, { useState, useEffect } from 'react';
import { generateReferralLink, copyToClipboard, getReferrerFromUrl, saveReferrerToStorage } from '../utils/referral';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Share2, Copy, Check, Users } from 'lucide-react';
import { toast } from 'sonner';

const ReferralWidget = ({ walletAddress }) => {
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    // Save referrer from URL to localStorage on mount
    const referrer = getReferrerFromUrl();
    if (referrer && referrer !== walletAddress) {
      saveReferrerToStorage(referrer);
      toast.info(`You were referred by ${referrer.slice(0, 6)}...${referrer.slice(-4)}`);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      const link = generateReferralLink(walletAddress);
      setReferralLink(link);
    }
  }, [walletAddress]);

  const handleCopy = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  if (!walletAddress) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="referral-button" variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Invite & Earn
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Referral Program
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold mb-2">Invite Friends & Track Referrals</h4>
            <p className="text-sm text-gray-600">
              Share your unique link and track when your friends make swaps on SwapLaunch.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                data-testid="referral-link-input"
              />
              <Button
                onClick={handleCopy}
                size="sm"
                className="gap-2"
                data-testid="copy-referral-button"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Referral tracking is currently for analytics only. 
              Fee sharing will be enabled in a future update.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">How it works:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Share your referral link with friends</li>
              <li>They connect wallet and make swaps</li>
              <li>All swaps are tracked in our system</li>
              <li>Future: Earn a share of platform fees</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralWidget;