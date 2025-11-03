import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Lock, Shield, CheckCircle, Star as StarIcon } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import { useAccount } from 'wagmi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProjectCard = ({ project, featured = false }) => {
  const { address } = useAccount();
  const [rating, setRating] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchRating();
  }, [project.id, address]);

  const fetchRating = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/projects/${project.id}/rating${address ? `?wallet_address=${address}` : ''}`
      );
      setRating(response.data);
      setUserRating(response.data.user_rating);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleRate = async (stars) => {
    if (!address) {
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/projects/${project.id}/rate`,
        null,
        {
          params: {
            wallet_address: address,
            rating: stars
          }
        }
      );
      
      setRating({
        avg_rating: response.data.avg_rating,
        total_ratings: response.data.total_ratings
      });
      setUserRating(stars);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = () => {
    const avgRating = rating?.avg_rating || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const filled = address ? (hoveredStar >= i || (hoveredStar === 0 && userRating >= i)) : (avgRating >= i);
      
      stars.push(
        <button
          key={i}
          onClick={() => address && handleRate(i)}
          onMouseEnter={() => address && setHoveredStar(i)}
          onMouseLeave={() => address && setHoveredStar(0)}
          disabled={!address}
          className={`transition-all ${address ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <StarIcon
            className={`w-4 h-4 ${
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl ${
      featured ? 'border-2 border-yellow-400' : 'border border-gray-200 dark:border-gray-700'
    }`}>
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{project.logo || '🚀'}</div>
          <div>
            <h4 className="font-bold text-lg dark:text-white">{project.name}</h4>
            <div className="text-xs text-gray-500 dark:text-gray-400">{project.category || 'DeFi'}</div>
          </div>
        </div>
        {featured && (
          <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.liquidityLocked && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-lg">
            <Lock className="w-3 h-3" />
            <span>Liquidity Locked</span>
          </div>
        )}
        {project.auditProvided && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-lg">
            <Shield className="w-3 h-3" />
            <span>Audit Provided</span>
          </div>
        )}
        {project.contractVerified && (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-lg">
            <CheckCircle className="w-3 h-3" />
            <span>Contract Verified</span>
          </div>
        )}
      </div>

      {/* Community Rating */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Community Rating</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {renderStars()}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {rating?.avg_rating ? rating.avg_rating.toFixed(1) : '0.0'} ({rating?.total_ratings || 0})
          </span>
        </div>
        {address && !userRating && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click stars to rate
          </div>
        )}
      </div>

      {/* Stats & Action */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <div className="text-gray-500 dark:text-gray-400 text-xs">TVL</div>
          <div className="font-bold dark:text-white">{project.tvl || '$0'}</div>
        </div>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => window.open(project.url, '_blank')}
        >
          Visit <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
