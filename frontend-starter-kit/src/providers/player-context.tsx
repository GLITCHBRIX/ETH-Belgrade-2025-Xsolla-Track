'use client';

import axios from 'axios';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Chain } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import type {
  PlayerContextType,
  PlayerState,
  UserReturn,
  Item,
  MintingResponse,
} from '../interface/player';
import type { ReactNode } from 'react';

// API endpoint
export const API_URL = 'https://48ad-212-47-148-189.ngrok-free.app';

// Xsolla ZK chain definition
const xsollaZkChain: Chain = {
  id: 555272,
  name: 'Xsolla ZK Sepolia Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://zkrpc.xsollazk.com'] },
  },
};

// GameNFT contract address and ABI
export const GAME_NFT_CONTRACT_ADDRESS = '0xef1F201957049c2Fb57bA48692b7AfAe9709A125';
const GAME_NFT_ABI = [
  {
    type: 'function',
    name: 'mintWithPermit',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tokenURI',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

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
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

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

  // Mint NFT function
  const mintNFT = useCallback(
    async (pk: number): Promise<void> => {
      console.log('Minting NFT with pk:', pk);
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Get minting data from API
        const response = await axios.get<MintingResponse>(`${API_URL}/items/${pk}/mint`);
        console.log('Minting response:', response.data);

        if (!walletClient) {
          throw new Error('Wallet not connected');
        }

        // Extract data from response
        const { contractAddress, permitData, signature } = response.data;
        const { tokenId, receiver, tokenURI, deadline } = permitData;

        console.log('Sending transaction with params:', {
          tokenId,
          receiver,
          tokenURI,
          deadline,
          signature,
        });

        // Send transaction
        const hash = await walletClient.writeContract({
          address: GAME_NFT_CONTRACT_ADDRESS,
          abi: GAME_NFT_ABI,
          functionName: 'mintWithPermit',
          args: [tokenId, receiver, tokenURI, deadline, signature],
          chain: xsollaZkChain,
        });

        console.log('Transaction sent:', hash);

        // Wait for transaction to be mined
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          console.log('Transaction mined:', receipt);
        }

        setState((prev) => ({ ...prev, isLoading: false }));

        // Add a delay before refreshing player data to allow middleware to fetch the event.
        // FIXME: Is request even working? Mb we need to wait more???
        setTimeout(() => {
          void checkPlayerExists(state.address!);
        }, 10000); // 10 seconds delay
      } catch (error) {
        console.error('Error minting NFT:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to mint NFT',
          isLoading: false,
        }));
      }
    },
    [state.address, checkPlayerExists, walletClient, publicClient],
  );

  // Combine state and actions
  const value: PlayerContextType = {
    ...state,
    registerPlayer,
    reset,
    mintNFT,
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
