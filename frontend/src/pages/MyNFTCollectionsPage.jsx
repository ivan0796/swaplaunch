import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { Image as ImageIcon, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MyNFTCollectionsPage = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchCollections();
    }
  }, [isConnected, address]);

  const fetchCollections = async () => {
    try {
      // TODO: Implement API call to fetch user's NFT collections
      // const response = await axios.get(`${BACKEND_URL}/api/nft/my-collections/${address}`);
      // setCollections(response.data.collections);
      
      // Mock data for now
      setCollections([
        {
          id: '1',
          name: 'Cyber Cats Collection',
          description: 'Futuristic cats with neon accessories',
          quantity: 100,
          standard: 'ERC-721',
          chain: 'Ethereum',
          status: 'deployed',
          contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1'
        }
      ]);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 dark:text-white">My NFT Collections</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your AI-generated NFT collections</p>
        </div>

        {!isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-300">Connect your wallet to view your NFT collections</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">No Collections Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first NFT collection with our AI-powered NFT Maker</p>
            <Button
              onClick={() => window.location.href = '/launchpad/nft-maker'}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Create NFT Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold dark:text-white">{collection.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{collection.quantity} NFTs</span>
                      <span>•</span>
                      <span>{collection.chain}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{collection.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                    {collection.standard}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${collection.status === 'deployed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                    {collection.status}
                  </span>
                </div>
                
                {collection.contractAddress && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract Address</div>
                    <div className="text-xs font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded">
                      {collection.contractAddress.slice(0, 6)}...{collection.contractAddress.slice(-4)}
                    </div>
                  </div>
                )}
                
                <Button className="w-full" variant="outline">
                  View Details <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNFTCollectionsPage;