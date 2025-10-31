import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'SwapLaunch',
  projectId: 'YOUR_PROJECT_ID_HERE', // Get from WalletConnect Cloud
  chains: [mainnet, bsc, polygon],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
});