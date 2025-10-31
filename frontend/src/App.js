import React, { useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SwapPage from './pages/SwapPage';
import RiskDisclosure from './pages/RiskDisclosure';
import { Toaster } from './components/ui/sonner';
import SolanaWalletProvider from './components/SolanaWalletProvider';

function App() {
  return (
    <div className="App">
      <SolanaWalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SwapPage />} />
            <Route path="/risk-disclosure" element={<RiskDisclosure />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </SolanaWalletProvider>
    </div>
  );
}

export default App;