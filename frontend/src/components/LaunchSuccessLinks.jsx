import React from 'react';
import { Button } from './ui/button';
import { ExternalLink, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { VISIBILITY } from '../config/visibility';

const LaunchSuccessLinks = ({ mint, pair }) => {
  if (!mint && !pair) return null;

  const links = [
    pair && {
      label: "Trade on Raydium",
      href: VISIBILITY.deepLinks.raydiumPool(pair),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
    },
    mint && {
      label: "View on Dexscreener",
      href: VISIBILITY.deepLinks.dexScreenerToken(mint),
      icon: <BarChart3 className="w-4 h-4" />,
      color: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    },
    pair && {
      label: "Dexscreener Pair",
      href: VISIBILITY.deepLinks.dexScreenerPair(pair),
      icon: <BarChart3 className="w-4 h-4" />,
      color: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    },
    mint && {
      label: "Axiom Pulse",
      href: VISIBILITY.deepLinks.axiomPulseMint(mint),
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
    }
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-900 dark:text-green-200">
            🎉 Token Successfully Launched!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your token is now live and visible on all major platforms
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className={`w-full text-white ${link.color}`}
              size="lg"
            >
              {link.icon}
              <span className="ml-2">{link.label}</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
          </a>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          <strong>📊 Pro Tip:</strong> It may take 5-10 minutes for Dexscreener and Axiom to fully index your token. 
          Refresh the pages if data isn't immediately visible.
        </p>
      </div>
    </div>
  );
};

export default LaunchSuccessLinks;
