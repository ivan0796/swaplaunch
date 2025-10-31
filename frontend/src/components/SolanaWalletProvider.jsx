import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

const SolanaWalletProvider = ({ children }) => {
  // Use mainnet-beta for production, devnet for testing
  const endpoint = useMemo(() => {
    // You can replace this with your Alchemy Solana RPC
    return process.env.REACT_APP_SOLANA_RPC || clusterApiUrl('mainnet-beta');
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add more wallets as needed
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider;