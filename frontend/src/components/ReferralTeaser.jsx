import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, TrendingUp, Users, ArrowRight } from 'lucide-react';

/**
 * ReferralTeaser Component
 * 
 * Displays a compact, non-intrusive referral program teaser
 * on the homepage to drive referral dashboard visits.
 * 
 * Design: Gradient card with clear CTA
 * Position: Below swap form or in sidebar
 */
const ReferralTeaser = ({ className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${className}`}>
      {/* Icon Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full mb-4">
        <Gift className="w-4 h-4" />
        <span className="text-xs font-bold">EARN REWARDS</span>
      </div>
      
      {/* Headline */}
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Verdiene mit, wenn du Freunde einlädst
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Keine Registrierung nötig. Alles direkt über Wallet. 
        <span className="font-semibold text-purple-600 dark:text-purple-400"> Verdiene 10% von jeder Swap-Gebühr</span> deiner Referrals.
      </p>
      
      {/* Stats Preview */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-lg p-2 text-center">
          <Users className="w-4 h-4 text-purple-600 mx-auto mb-1" />
          <div className="text-xs text-gray-600 dark:text-gray-400">Invite</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-lg p-2 text-center">
          <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <div className="text-xs text-gray-600 dark:text-gray-400">They Trade</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-lg p-2 text-center">
          <Gift className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <div className="text-xs text-gray-600 dark:text-gray-400">You Earn</div>
        </div>
      </div>
      
      {/* CTA Button */}
      <Link
        to="/earn/referrals"
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg group"
      >
        <span>Start Earning Now</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      {/* Trust Badge */}
      <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Non-custodial • Instant tracking</span>
      </div>
    </div>
  );
};

export default ReferralTeaser;
