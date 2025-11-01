import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche, fantom, cronos, zkSync } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'SwapLaunch',
  projectId: '48a588dc4a0d828d44650c0f6836e30c',
  chains: [mainnet, bsc, polygon, arbitrum, optimism, base, avalanche, fantom, cronos, zkSync],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [fantom.id]: http(),
    [cronos.id]: http(),
    [zkSync.id]: http(),
  },
});

// Solana configuration
export const SOLANA_CONFIG = {
  network: 'mainnet-beta',
  endpoint: 'https://solana-mainnet.g.alchemy.com/v2/WBTX_PA0_LJ2cdKQ9JS4s'
};