import React from 'react';
import { usePromotions } from '../hooks/usePromotions';
import { Star, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const PromotedHeroBanner = () => {
  const { promotions, loading } = usePromotions('hero_banner');

  if (loading || promotions.length === 0) {
    return null;
  }

  // Show the first hero banner promotion
  const promo = promotions[0];

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
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-white text-sm font-semibold">
            Featured Token
          </div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-3">
          {promo.package_name}
        </h2>
        
        <p className="text-white/90 text-lg mb-2">
          Token: {promo.token_address.slice(0, 6)}...{promo.token_address.slice(-4)}
        </p>
        
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
