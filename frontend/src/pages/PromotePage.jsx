import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, Clock, TrendingUp, Star, Zap, Sparkles, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import ChainLogo from '../components/ChainLogo';

const PromotePage = () => {
  const { t } = useTranslation();
  
  // Form State
  const [tokenAddress, setTokenAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState('solana');
  const [selectedPackage, setSelectedPackage] = useState('trending_boost');
  const [selectedDuration, setSelectedDuration] = useState('7d');
  
  // Data State
  const [packages, setPackages] = useState(null);
  const [chains, setChains] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment State
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Fetch packages and prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/promotion/packages`);
        const data = await response.json();
        
        setPackages(data.packages);
        setChains(data.chains);
        setCryptoPrices(data.crypto_prices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching promotion data:', error);
        toast.error('Failed to load promotion packages');
      }
    };
    
    fetchData();
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!requestId) return;
    
    const pollStatus = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/promotion/status/${requestId}`);
        const data = await response.json();
        
        setPaymentStatus(data.status);
        
        if (data.status === 'active') {
          toast.success('🎉 Payment confirmed! Your promotion is now live!');
          setShowPaymentDialog(false);
          setRequestId(null);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };
    
    // Poll every 10 seconds
    const interval = setInterval(pollStatus, 10000);
    pollStatus(); // Initial call
    
    return () => clearInterval(interval);
  }, [requestId]);

  const calculateNativeAmount = (usdPrice) => {
    if (!chains || !cryptoPrices) return 0;
    
    const chainData = chains[selectedChain];
    if (!chainData) return 0;
    
    const coingeckoId = chainData.coingecko_id;
    const pricePerCoin = cryptoPrices[coingeckoId] || 1;
    
    return (usdPrice / pricePerCoin).toFixed(6);
  };

  const handlePromote = async () => {
    if (!tokenAddress) {
      toast.error('Please enter token address');
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/promotion/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_address: tokenAddress,
          chain: selectedChain,
          package_type: selectedPackage,
          duration: selectedDuration
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create promotion request');
      }
      
      const data = await response.json();
      setPaymentDetails(data);
      setRequestId(data.request_id);
      setShowPaymentDialog(true);
      
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion request');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
        <HeaderSlim />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPackage = packages?.[selectedPackage];
  const currentChain = chains?.[selectedChain];
  const usdPrice = currentPackage?.prices[selectedDuration] || 0;
  const nativeAmount = calculateNativeAmount(usdPrice);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      <HeaderSlim />

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Promote Dein Token
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Erhalte mehr Sichtbarkeit direkt auf der Seite. Keine Registrierung, keine Genehmigung, alles On-Chain.
          </p>

          {/* Non-Custodial Badge */}
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-green-600 text-white px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              100% Non-Custodial
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Automatisch aktiviert
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Form */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Configuration */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Konfiguration</h2>

                {/* Token Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Token Contract / Mint Address *
                  </label>
                  <Input
                    placeholder="0x... oder Solana mint address"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                {/* Chain Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Blockchain wählen
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {chains && Object.entries(chains).map(([key, chain]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedChain(key)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedChain === key
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold dark:text-white">{chain.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{chain.symbol}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Promotion Paket
                  </label>
                  <div className="grid gap-3">
                    {packages && Object.entries(packages).map(([key, pkg]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPackage(key)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPackage === key
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold dark:text-white">{pkg.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{pkg.description}</div>
                          </div>
                          {selectedPackage === key && (
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Dauer
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {currentPackage && Object.entries(currentPackage.prices).map(([duration, price]) => (
                      <button
                        key={duration}
                        onClick={() => setSelectedDuration(duration)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedDuration === duration
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold dark:text-white">{duration}</div>
                          <div className="text-lg font-bold text-purple-600">${price}</div>
                          {duration === '7d' && (
                            <div className="text-xs text-green-600 mt-1">-10%</div>
                          )}
                          {duration === '30d' && (
                            <div className="text-xs text-green-600 mt-1">-25%</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-20">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Zusammenfassung</h3>

                {/* Price Display */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Paket:</span>
                    <span className="font-semibold dark:text-white">{currentPackage?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Dauer:</span>
                    <span className="font-semibold dark:text-white">{selectedDuration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Chain:</span>
                    <span className="font-semibold dark:text-white">{currentChain?.name}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold dark:text-white">Preis (USD):</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${usdPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold dark:text-white">Preis ({currentChain?.symbol}):</span>
                      <span className="text-xl font-bold text-purple-600">
                        {nativeAmount} {currentChain?.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promote Button */}
                <Button
                  onClick={handlePromote}
                  disabled={!tokenAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Jetzt promoten
                </Button>

                {/* Non-Custodial Notice */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-start gap-2 text-xs text-green-900 dark:text-green-200">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Non-Custodial</p>
                      <p>Du signierst die Zahlung. Wir verwahren nichts. Werbung läuft automatisch ab.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Zahlung durchführen</DialogTitle>
            <DialogDescription>
              Sende die Zahlung direkt an die angegebene Adresse
            </DialogDescription>
          </DialogHeader>

          {paymentDetails && (
            <div className="space-y-6">
              {/* Payment Address */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Empfänger-Adresse</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentDetails.payment_address)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Kopieren
                  </Button>
                </div>
                <p className="font-mono text-sm break-all text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded">
                  {paymentDetails.payment_address}
                </p>
              </div>

              {/* Amount to Pay */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
                <div className="text-center">
                  <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">Zu zahlender Betrag</p>
                  <p className="text-4xl font-bold text-purple-600 mb-2">
                    {paymentDetails.amount_native} {paymentDetails.native_currency}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    ≈ ${paymentDetails.amount_usd} USD
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {paymentStatus === 'active' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-blue-600 animate-spin" />
                  )}
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">
                      {paymentStatus === 'active' ? '✅ Zahlung bestätigt!' : 'Warte auf Zahlung...'}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {paymentStatus === 'active' 
                        ? 'Deine Promotion ist jetzt live!' 
                        : 'Wir überwachen die Blockchain automatisch'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm font-semibold dark:text-white">Anleitung:</p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Öffne deine Wallet</li>
                  <li>Sende exakt {paymentDetails.amount_native} {paymentDetails.native_currency}</li>
                  <li>An die oben angezeigte Adresse</li>
                  <li>Warte auf Bestätigung (automatisch)</li>
                </ol>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                <div className="flex items-start gap-2 text-xs text-orange-900 dark:text-orange-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Bitte sende den <strong>exakten Betrag</strong>. Abweichungen können zu Verzögerungen führen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PromotePage;
