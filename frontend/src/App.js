import React, { useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SwapPageV2 from './pages/SwapPageV2';
import BridgePage from './pages/BridgePage';
import RiskDisclosure from './pages/RiskDisclosure';
import FAQPage from './pages/FAQPage';
import LaunchpadPage from './pages/LaunchpadPage';
import TokenLockerPage from './pages/TokenLockerPage';
import LimitOrdersPage from './pages/LimitOrdersPage';
import ProjectsPage from './pages/ProjectsPage';
import AdvertisePage from './pages/AdvertisePage';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SwapPageV2 />} />
          <Route path="/bridge" element={<BridgePage />} />
          <Route path="/launchpad" element={<LaunchpadPage />} />
          <Route path="/token-locker" element={<TokenLockerPage />} />
          <Route path="/limit-orders" element={<LimitOrdersPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/risk-disclosure" element={<RiskDisclosure />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;