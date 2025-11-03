import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Image, Upload, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const NFTMintPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [nftName, setNftName] = useState('');
  const [supply, setSupply] = useState('1');
  const [price, setPrice] = useState('0.01');
  const [image, setImage] = useState(null);

  const handleMint = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    toast.info('NFT Mint feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">NFT Mintpad</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Beta</span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Launch your NFT collection in minutes. Non-custodial and secure.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">NFT Name</label>
              <Input
                placeholder="My Cool NFT"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Supply</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mint Price (ETH)</label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Image</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            <Button
              onClick={handleMint}
              disabled={!isConnected}
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isConnected ? 'Create NFT Collection' : 'Connect Wallet'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <div className="font-semibold mb-2">Mint Fee: 0.5-2% per mint</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ✓ Non-custodial - You sign all transactions<br />
              ✓ No lock-in - Full ownership of NFT contract<br />
              ✓ Instant deployment - Live in seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMintPage;