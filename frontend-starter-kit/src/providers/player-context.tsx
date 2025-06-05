'use client';

import axios from 'axios';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { PlayerContextType, PlayerState, UserReturn, Item } from '../interface/player';
import type { ReactNode } from 'react';

// API endpoint
const API_URL = 'https://48ad-212-47-148-189.ngrok-free.app';

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

// Provider component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PlayerState>(initialState);
  const { address } = useAccount();

  // Function to check if player exists
  const checkPlayerExists = useCallback(async (walletAddress: string) => {
    console.log('Checking if player exists for address:', walletAddress);
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await axios.get<UserReturn>(
        `${API_URL}/game/1/player?playerAddress=${walletAddress}`,
      );
      console.log('Player check response:', response.data);

      // If we received playerId in the response, the player is registered
      if (response.data?.playerId) {
        console.log('Player found with ID:', response.data.playerId);

        // Process items into minted (owned) and not minted (available) NFTs
        const items = response.data.items || [];
        const ownedNFTs: Item[] = items.filter((item) => item.minted);
        const availableNFTs: Item[] = items.filter((item) => !item.minted);

        console.log('Owned NFTs:', ownedNFTs.length);
        console.log('Available NFTs:', availableNFTs.length);

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          playerId: response.data.playerId,
          ownedNFTs,
          availableNFTs,
          isLoading: false,
        }));
      } else {
        // Player not found, but we don't show error - will be handled separately
        console.log('Player not found for address:', walletAddress);
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error checking player existence:', error);
      setState((prev) => ({
        ...prev,
        error: 'Error checking player existence',
        isLoading: false,
      }));
    }
  }, []);

  // Update state when wallet address changes
  useEffect(() => {
    console.log('Address changed in context:', address);
    if (address) {
      setState((prev) => ({ ...prev, address }));
      console.log('Address set in state:', address);

      // Check if player exists with this address
      void checkPlayerExists(address);
    } else {
      // Reset state when wallet is disconnected
      console.log('Wallet disconnected, resetting state');
      setState((prev) => ({
        ...initialState,
        // Keep any error messages
        error: prev.error,
      }));
    }
  }, [address, checkPlayerExists]);

  // Register player function
  const registerPlayer = useCallback(
    async (playerAddress: string, playerId: string): Promise<void> => {
      console.log('Registering player with address:', playerAddress, 'and playerId:', playerId);

      if (!playerId) {
        console.error('Player ID is required for registration');
        setState((prev) => ({
          ...prev,
          error: 'Player ID is required for registration',
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const playerData = {
          playerId,
          playerAddress,
        };

        console.log('Sending registration data:', playerData);

        const response = await axios.post(`${API_URL}/game/1/player`, playerData);

        console.log('Registration response:', response.data);

        if (response.data) {
          // After successful registration, check player data to get updated info
          void checkPlayerExists(playerAddress);
        }
      } catch (error) {
        console.error('Error registering player:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to register player',
          isLoading: false,
        }));
      }
    },
    [checkPlayerExists],
  );

  const reset = useCallback((): void => {
    setState(initialState);
  }, []);

  // Combine state and actions
  const value: PlayerContextType = {
    ...state,
    registerPlayer,
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
