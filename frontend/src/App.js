import React, { useState } from 'react';
import '@/App.css';
import './i18n'; // Import i18n configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import SwapPageV2 from './pages/SwapPageV2';
import ProSwapPage from './pages/ProSwapPage';
import BridgePage from './pages/BridgePage';
import RiskDisclosure from './pages/RiskDisclosure';
import FAQPage from './pages/FAQPage';
import LaunchpadPage from './pages/LaunchpadPage';
import TokenLockerPage from './pages/TokenLockerPage';
import TokenCreatorPage from './pages/TokenCreatorPage';
import LimitOrdersPage from './pages/LimitOrdersPage';
import ProjectsPage from './pages/ProjectsPage';
import AdvertisePage from './pages/AdvertisePage';
import PortfolioPage from './pages/PortfolioPage';
import NFTMintPage from './pages/NFTMintPage';
import MyNFTCollectionsPage from './pages/MyNFTCollectionsPage';
import ReferralsPage from './pages/ReferralsPage';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* TRADE */}
            <Route path="/" element={<SwapPageV2 />} />
            <Route path="/trade/swap" element={<SwapPageV2 />} />
            <Route path="/trade/pro-swap" element={<ProSwapPage />} />
            <Route path="/trade/bridge" element={<BridgePage />} />
            
            {/* LAUNCHPAD */}
            <Route path="/launchpad/explore" element={<ProjectsPage />} />
            <Route path="/launchpad/create" element={<LaunchpadPage />} />
            <Route path="/launchpad/token-creator" element={<TokenCreatorPage />} />
            <Route path="/launchpad/nft-maker" element={<NFTMintPage />} />
            <Route path="/launchpad/my-nft-collections" element={<MyNFTCollectionsPage />} />
            <Route path="/launchpad/token-locker" element={<TokenLockerPage />} />
            
            {/* EARN */}
            <Route path="/earn/referrals" element={<ReferralsPage />} />
            
            {/* PORTFOLIO */}
            <Route path="/portfolio" element={<PortfolioPage />} />
            
            {/* Advertise */}
            <Route path="/advertise" element={<AdvertisePage />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/bridge" element={<BridgePage />} />
            <Route path="/limit-orders" element={<LimitOrdersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/launchpad" element={<LaunchpadPage />} />
            <Route path="/token-locker" element={<TokenLockerPage />} />
            <Route path="/nft-mint" element={<NFTMintPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            
            {/* Info pages */}
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/risk-disclosure" element={<RiskDisclosure />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;