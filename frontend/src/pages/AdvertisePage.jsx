import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import axios from 'axios';
import { ethers } from 'ethers';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Zap, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simplified ABI for AdPayment contract
const AD_CONTRACT_ABI = [
  'function purchaseAdETH(uint256 slotId, string calldata contentCID) external payable',
  'function adSlots(uint256) external view returns (uint256 price, address paymentToken, uint256 duration, bool active)',
  'event AdPaid(uint256 indexed purchaseId, uint256 indexed slotId, address indexed advertiser, uint256 amount, uint256 expiresAt, string contentCID)'
];

const AdvertisePage = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedChain, setSelectedChain] = useState(1);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Purchase state
  const [purchaseId, setPurchaseId] = useState(null);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    fetchAdSlots();
  }, []);

  const fetchAdSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/ads/slots`);
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching ad slots:', error);
      toast.error('Failed to load ad slots');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select an ad slot');
      return;
    }

    if (!title || !linkUrl) {
      toast.error('Please fill in title and link URL');
      return;
    }

    setPurchasing(true);

    try {
      // Step 1: Initiate purchase in backend
      const initiateResponse = await axios.post(`${BACKEND_URL}/api/ads/purchase/initiate`, {
        slot_id: selectedSlot.slot_id,
        content_cid: `ad_${Date.now()}`, // Simple CID for now
        title,
        description,
        link_url: linkUrl,
        image_url: imageUrl
      });

      const { purchase_id, contract_address, price_eth } = initiateResponse.data;
      setPurchaseId(purchase_id);

      // Step 2: Execute payment on-chain
      toast.info('Please confirm transaction in your wallet...');

      // For demo: direct ETH transfer to treasury
      // In production, call smart contract
      const tx = await walletClient.sendTransaction({
        to: contract_address,
        value: ethers.parseEther(price_eth.toString()),
        data: '0x' // Empty data for direct ETH send
      });

      setTxHash(tx);
      toast.success('Transaction submitted!', {
        description: 'Waiting for confirmations...'
      });

      // Step 3: Simulate event listener webhook
      // In production, event listener would call this automatically
      setTimeout(async () => {
        try {
          await axios.post(`${BACKEND_URL}/api/ads/webhook/payment`, {
            purchase_id,
            slot_id: selectedSlot.slot_id,
            advertiser: address,
            amount: price_eth.toString(),
            tx_hash: tx,
            block_number: 3 // Simulated confirmations
          });

          toast.success('Advertisement is now live!', {
            duration: 5000,
            description: `Your ad will be displayed for ${selectedSlot.duration_days} days`
          });

          // Reset form
          setTitle('');
          setDescription('');
          setLinkUrl('');
          setImageUrl('');
          setSelectedSlot(null);
        } catch (error) {
          console.error('Error activating ad:', error);
        }
      }, 3000);

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase ad slot');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Navbar */}
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Advertise on SwapLaunch</h1>
          <p className="text-gray-600 text-lg">
            Reach thousands of crypto traders with automated, non-custodial advertising
          </p>
        </div>

        {/* Ad Slots */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Ad Slots</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {slots.map(slot => (
                <button
                  key={slot.slot_id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-6 rounded-xl border-2 text-left transition ${
                    selectedSlot?.slot_id === slot.slot_id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-lg font-bold mb-2">{slot.name}</div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {slot.price_eth} ETH
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    ~${slot.price_usd} USD • {slot.duration_days} days
                  </div>
                  <div className="text-xs text-gray-500">{slot.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ad Form */}
        {selectedSlot && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-6">Ad Content</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  placeholder="Your Project Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Brief description of your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link URL *</label>
                <Input
                  type="url"
                  placeholder="https://your-project.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <Input
                  type="url"
                  placeholder="https://your-image.com/logo.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={handlePurchase}
                disabled={!isConnected || purchasing}
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {purchasing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                ) : isConnected ? (
                  <>Pay {selectedSlot.price_eth} ETH & Launch Ad</>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            </div>

            {/* Success State */}
            {txHash && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Transaction Confirmed!</span>
                </div>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 flex items-center gap-1 mt-2"
                >
                  View on Etherscan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisePage;