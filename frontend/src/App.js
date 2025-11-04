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
import TokenCreatorPageV2 from './pages/TokenCreatorPageV2';
import LimitOrdersPage from './pages/LimitOrdersPage';
import ProjectsPage from './pages/ProjectsPage';
import AdvertisePage from './pages/AdvertisePage';
import AdvertisePageV2 from './pages/AdvertisePageV2';
import PortfolioPage from './pages/PortfolioPage';
import NFTMintPage from './pages/NFTMintPage';
import MyNFTCollectionsPage from './pages/MyNFTCollectionsPage';
import ReferralsPage from './pages/ReferralsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RiskDisclosurePage from './pages/RiskDisclosurePage';
import GettingStartedPage from './pages/GettingStartedPage';
import SecurityPage from './pages/SecurityPage';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Default Route - Token Launch Funnel */}
            <Route path="/" element={<TokenCreatorPageV2 />} />
            
            {/* TRADE */}
            <Route path="/launch" element={<TokenCreatorPageV2 />} />
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
            <Route path="/advertise" element={<AdvertisePageV2 />} />
            
            {/* Legal & Info Pages */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/risk" element={<RiskDisclosurePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/risk-disclosure" element={<RiskDisclosure />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/bridge" element={<BridgePage />} />
            <Route path="/trade/limit-orders" element={<LimitOrdersPage />} />
            <Route path="/limit-orders" element={<LimitOrdersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/launchpad" element={<LaunchpadPage />} />
            <Route path="/token-locker" element={<TokenLockerPage />} />
            <Route path="/nft-mint" element={<NFTMintPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;