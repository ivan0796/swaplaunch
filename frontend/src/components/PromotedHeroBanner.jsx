import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromotions } from '../hooks/usePromotions';
import { Star, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { TokenLogo } from '../utils/tokenLogoResolver';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const PromotedHeroBanner = () => {
  const navigate = useNavigate();
  const { promotions, loading } = usePromotions('hero_banner');
  const [tokenInfo, setTokenInfo] = useState(null);

  // Show the first hero banner promotion
  const promo = promotions[0];

  // Fetch token info
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!promo) return;

      try {
        const response = await axios.get(`${API}/api/token/resolve`, {
          params: {
            query: promo.token_address,
            limit: 1
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          const token = response.data.results[0];
          setTokenInfo({
            name: token.name || 'Unknown Token',
            symbol: token.symbol || 'N/A',
            logoURI: token.logoURI || null
          });
        } else {
          setTokenInfo({
            name: `${promo.token_address.slice(0, 6)}...${promo.token_address.slice(-4)}`,
            symbol: 'TOKEN',
            logoURI: null
          });
        }
      } catch (error) {
        console.error('Error fetching token info:', error);
        setTokenInfo({
          name: `${promo.token_address.slice(0, 6)}...${promo.token_address.slice(-4)}`,
          symbol: 'TOKEN',
          logoURI: null
        });
      }
    };

    fetchTokenInfo();
  }, [promo]);

  if (loading || promotions.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 mb-8">
      {/* Promoted Badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          PROMOTED
        </div>
      </div>

      <div className="relative z-10">
        {/* Token Logo and Info */}
        {tokenInfo && (
          <div className="flex items-center gap-4 mb-4">
            <TokenLogo
              address={promo.token_address}
              chainId={promo.chain === 'solana' ? 0 : 1}
              symbol={tokenInfo.symbol}
              name={tokenInfo.name}
              logoURI={tokenInfo.logoURI}
              size="xl"
              className="ring-4 ring-white/20"
            />
            <div>
              <h2 className="text-4xl font-bold text-white mb-1">
                {tokenInfo.name}
              </h2>
              <p className="text-white/90 text-lg">
                {tokenInfo.symbol}
              </p>
            </div>
          </div>
        )}
        
        <p className="text-white/80 text-sm mb-6">
          Chain: {promo.chain} • Duration: {promo.duration}
        </p>

        <div className="flex gap-3">
          <Button className="bg-white text-purple-600 hover:bg-gray-100">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trade Now
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent"></div>
      </div>
    </div>
  );
};

export default PromotedHeroBanner;
