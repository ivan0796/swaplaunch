import React, { useState } from 'react';
import '@/App.css';
import './i18n'; // Import i18n configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import SwapPageV2 from './pages/SwapPageV2';
import BridgePage from './pages/BridgePage';
import RiskDisclosure from './pages/RiskDisclosure';
import FAQPage from './pages/FAQPage';
import LaunchpadPage from './pages/LaunchpadPage';
import TokenLockerPage from './pages/TokenLockerPage';
import LimitOrdersPage from './pages/LimitOrdersPage';
import ProjectsPage from './pages/ProjectsPage';
import AdvertisePage from './pages/AdvertisePage';
import PortfolioPage from './pages/PortfolioPage';
import NFTMintPage from './pages/NFTMintPage';
import ReferralsPage from './pages/ReferralsPage';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SwapPageV2 />} />
            <Route path="/bridge" element={<BridgePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/launchpad" element={<LaunchpadPage />} />
            <Route path="/token-locker" element={<TokenLockerPage />} />
            <Route path="/limit-orders" element={<LimitOrdersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/nft-mint" element={<NFTMintPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
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