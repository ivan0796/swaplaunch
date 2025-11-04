import { useState, useEffect } from 'react';

/**
 * Hook to fetch active promotions
 */
export const usePromotions = (packageType = null) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
        const url = packageType 
          ? `${backendUrl}/api/promotion/active?package_type=${packageType}`
          : `${backendUrl}/api/promotion/active`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        setPromotions(data.promotions || []);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchPromotions, 60000);
    
    return () => clearInterval(interval);
  }, [packageType]);

  return { promotions, loading };
};

/**
 * Check if a token is promoted
 */
export const useIsPromoted = (tokenAddress, packageType = null) => {
  const { promotions, loading } = usePromotions(packageType);
  
  const isPromoted = promotions.some(
    promo => promo.token_address.toLowerCase() === tokenAddress?.toLowerCase()
  );
  
  return { isPromoted, loading };
};
