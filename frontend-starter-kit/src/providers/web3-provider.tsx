'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import type { ReactNode } from 'react';

// Create a config using wagmi's createConfig method
const config = createConfig(
  getDefaultConfig({
    // Your dApp's chains
    chains: [mainnet],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID || ''}`,
      ),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Required App Info
    appName: 'Xsolla Web3 Demo',

    // Optional App Info
    appDescription: 'Simple wallet connection demo',
    appUrl: 'https://xsolla.com',
    appIcon: 'https://xsolla.com/favicon.ico',
  }),
);

// Create a query client
const queryClient = new QueryClient();

// Web3Provider component
export const Web3Provider = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
