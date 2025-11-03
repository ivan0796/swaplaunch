import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdBanner = ({ position = 'banner', className = '' }) => {
  const [ads, setAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds();
    // Refresh ads every 5 minutes
    const interval = setInterval(fetchActiveAds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [position]);

  const fetchActiveAds = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/ads/active`);
      const positionAds = response.data.ads.filter(ad => {
        // Match ad slot position
        return true; // For now, show all
      });
      
      setAds(positionAds);
      if (positionAds.length > 0) {
        setCurrentAd(positionAds[0]); // Show first ad
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-xl p-4 animate-pulse ${className}`}>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!currentAd) {
    // No active ads - show placeholder
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 ${className}`}>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600 mb-1">Advertise Here</div>
          <div className="text-xs text-gray-500">Premium ad space available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Ad Content */}
      <a
        href={currentAd.link_url || '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {currentAd.image_url && (
            <img
              src={currentAd.image_url}
              alt={currentAd.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{currentAd.title}</h3>
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Sponsored</span>
            </div>
            {currentAd.description && (
              <p className="text-xs text-gray-600 line-clamp-2">{currentAd.description}</p>
            )}
          </div>
          {currentAd.link_url && <ExternalLink className="w-4 h-4 text-gray-400" />}
        </div>
      </a>
    </div>
  );
};

export default AdBanner;