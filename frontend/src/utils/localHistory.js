// Local Storage Manager for Swap History

const STORAGE_KEY = 'swaplaunch_history';
const MAX_HISTORY_ITEMS = 100;

export const saveSwapToHistory = (swapData) => {
  try {
    const history = getSwapHistory();
    const newSwap = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...swapData
    };
    
    history.unshift(newSwap);
    
    // Keep only last MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    return true;
  } catch (error) {
    console.error('Error saving swap to history:', error);
    return false;
  }
};

export const getSwapHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading swap history:', error);
    return [];
  }
};

export const clearSwapHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing swap history:', error);
    return false;
  }
};

export const getSwapHistoryByChain = (chain) => {
  const history = getSwapHistory();
  return history.filter(swap => swap.chain === chain);
};

export const formatHistoryDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};