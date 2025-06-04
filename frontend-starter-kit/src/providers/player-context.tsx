'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { NFT, PlayerContextType, PlayerState } from '../interface/player';
import type { ReactNode } from 'react';

// Initial state
const initialState: PlayerState = {
  isAuthenticated: false,
  address: null,
  playerId: null,
  availableNFTs: [],
  ownedNFTs: [],
  isLoading: false,
  error: null,
};

// Create context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Mock NFT data
const mockAvailableNFTs: NFT[] = [
  {
    id: 'nft-1',
    name: 'Land Plot #1',
    image: 'https://placeholder.com/land1.jpg',
    metadata: {
      coordinates: { x: 10, y: 20 },
    },
  },
  {
    id: 'nft-2',
    name: 'Land Plot #2',
    image: 'https://placeholder.com/land2.jpg',
    metadata: {
      coordinates: { x: 30, y: 40 },
    },
  },
];

const mockOwnedNFTs: NFT[] = [
  {
    id: 'nft-3',
    name: 'Land Plot #3',
    image: 'https://placeholder.com/land3.jpg',
    metadata: {
      coordinates: { x: 50, y: 60 },
    },
  },
];

// Provider component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PlayerState>(initialState);
  const { address } = useAccount();
  
  // Update state when wallet address changes
  useEffect(() => {
    console.log('Address changed in context:', address);
    if (address) {
      setState((prev) => ({ ...prev, address }));
      console.log('Address set in state:', address);
    } else {
      // Reset state when wallet is disconnected
      console.log('Wallet disconnected, resetting state');
      setState((prev) => ({
        ...initialState,
        // Keep any error messages
        error: prev.error,
      }));
    }
  }, [address]);

  // Mock functions
  const connectWallet = useCallback(async (): Promise<void> => {
    // This is now a no-op since ConnectKit handles the connection
    // and the useEffect above will update the state
    await Promise.resolve(); // Add await to satisfy linter
  }, []);

  const getPlayer = useCallback(async (address: string): Promise<void> => {
    console.log('getPlayer called with address:', address);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Mock API call to get player
      // In a real implementation, this would call your backend API
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
      // Mock success - player found
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        playerId: `player-${address.substring(0, 8)}`,
        isLoading: false,
      }));
      console.log('getPlayer success, playerId set');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Player not found',
        isLoading: false,
      }));
      console.log('getPlayer error');
    }
  }, []);

  const registerPlayer = useCallback(async (address: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Mock API call to register player
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
      // Mock success
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        playerId: `player-${address.substring(0, 8)}`,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to register player',
        isLoading: false,
      }));
    }
  }, []);

  const getNFTs = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Mock API call to get NFTs
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay
      // Mock success
      setState((prev) => ({
        ...prev,
        availableNFTs: mockAvailableNFTs,
        ownedNFTs: mockOwnedNFTs,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch NFTs',
        isLoading: false,
      }));
    }
  }, []);

  const reset = useCallback((): void => {
    setState(initialState);
  }, []);

  // Combine state and actions
  const value: PlayerContextType = {
    ...state,
    connectWallet,
    getPlayer,
    registerPlayer,
    getNFTs,
    reset,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

// Custom hook to use the context
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
 