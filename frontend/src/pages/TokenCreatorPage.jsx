import React, { useState } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { Coins, Info, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const TokenCreatorPage = () => {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [selectedChain, setSelectedChain] = useState(1);
  
  // Form state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [decimals, setDecimals] = useState('18');
  const [liquidityLock, setLiquidityLock] = useState(false);
  
  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedToken, setDeployedToken] = useState(null);

  const chains = [
    { id: 1, name: 'Ethereum', logo: '⟠', standard: 'ERC-20', gasEst: '~0.05 ETH', decimals: 18 },
    { id: 56, name: 'BNB Chain', logo: '🟡', standard: 'BEP-20', gasEst: '~0.01 BNB', decimals: 18 },
    { id: 137, name: 'Polygon', logo: '🟣', standard: 'ERC-20', gasEst: '~0.5 MATIC', decimals: 18 },
    { id: 42161, name: 'Arbitrum', logo: '🔵', standard: 'ERC-20', gasEst: '~0.001 ETH', decimals: 18 },
    { id: 8453, name: 'Base', logo: '🔷', standard: 'ERC-20', gasEst: '~0.001 ETH', decimals: 18 },
    { id: 43114, name: 'Avalanche', logo: '🔺', standard: 'ERC-20', gasEst: '~0.5 AVAX', decimals: 18 },
    { id: 0, name: 'Solana', logo: '◎', standard: 'SPL', gasEst: '~0.01 SOL', decimals: 9 }
  ];

  const selectedChainData = chains.find(c => c.id === selectedChain) || chains[0];

  const handleChainSelect = (chainId) => {
    setSelectedChain(chainId);
    const chain = chains.find(c => c.id === chainId);
    setDecimals(chain.decimals.toString());
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tokenName || !tokenSymbol || !totalSupply) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (currentChainId !== selectedChain && selectedChain !== 0) {
      toast.error(`Please switch to ${selectedChainData.name}`);
      // Trigger network switch
      try {
        await switchChain({ chainId: selectedChain });
      } catch (error) {
        console.error('Network switch error:', error);
      }
      return;
    }

    setIsDeploying(true);
    
    try {
      // TODO: Implement actual token deployment
      // For now, simulate deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = selectedChain === 0 
        ? 'So11111111111111111111111111111111111111112' 
        : `0x${Math.random().toString(16).slice(2, 42)}`;
      
      setDeployedToken({
        name: tokenName,
        symbol: tokenSymbol,
        supply: totalSupply,
        decimals: decimals,
        standard: selectedChainData.standard,
        chain: selectedChainData.name,
        address: mockAddress
      });
      
      toast.success('Token deployed successfully!');
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 dark:text-white">Multi-Chain Token Creator</h1>
          <p className="text-gray-600 dark:text-gray-300">Create your token on any blockchain in minutes</p>
        </div>

        {!deployedToken ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            {/* Chain Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-4 dark:text-white">Select Blockchain</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSelect(chain.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedChain === chain.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{chain.logo}</div>
                    <div className="text-sm font-semibold dark:text-white">{chain.name}</div>
                    <div className="text-xs text-gray-500">{chain.standard}</div>
                  </button>
                ))}
              </div>
              
              {/* Chain Info */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Standard: {selectedChainData.standard}
                    </div>
                    <div className="text-blue-800 dark:text-blue-300">
                      Estimated Gas: {selectedChainData.gasEst}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Token Name *</label>
                  <Input
                    placeholder="e.g., My Awesome Token"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Symbol *</label>
                  <Input
                    placeholder="e.g., MAT"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Total Supply *</label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Decimals</label>
                  <Input
                    type="number"
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    min="0"
                    max="18"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: {selectedChainData.decimals}</p>
                </div>
              </div>

              {/* Optional Features (EVM only) */}
              {selectedChain !== 0 && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={liquidityLock}
                      onChange={(e) => setLiquidityLock(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm dark:text-white">Add Liquidity Lock (Optional)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Non-Custodial Notice */}
            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900 dark:text-yellow-200">
                  <strong>Non-Custodial:</strong> You sign all transactions in your wallet. We never hold your private keys or tokens.
                </div>
              </div>
            </div>

            {/* Deploy Button */}
            <Button
              onClick={handleDeploy}
              disabled={!isConnected || isDeploying}
              className="w-full mt-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isDeploying ? (
                <>Deploying Token...</>
              ) : !isConnected ? (
                'Connect Wallet'
              ) : (
                'Deploy Token'
              )}
            </Button>
          </div>
        ) : (
          /* Success Card */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Token Deployed Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Your token is now live on {deployedToken.chain}</p>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
                  <div className="font-semibold dark:text-white">{deployedToken.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Symbol</div>
                  <div className="font-semibold dark:text-white">{deployedToken.symbol}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Supply</div>
                  <div className="font-semibold dark:text-white">{deployedToken.supply}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Standard</div>
                  <div className="font-semibold dark:text-white">{deployedToken.standard}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract Address</div>
                <div className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded break-all">
                  {deployedToken.address}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => setDeployedToken(null)}
                variant="outline"
                className="flex-1"
              >
                Create Another
              </Button>
              <Button
                onClick={() => window.location.href = '/launchpad/explore'}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                View in Explorer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCreatorPage;