export interface NFT {
  id: string;
  name: string;
  image: string;
  metadata: {
    coordinates?: {
      x: number;
      y: number;
    };
    [key: string]: unknown;
  };
}

export interface PlayerState {
  isAuthenticated: boolean;
  address: string | null;
  playerId: string | null;
  availableNFTs: NFT[];
  ownedNFTs: NFT[];
  isLoading: boolean;
  error: string | null;
}

export interface PlayerActions {
  connectWallet: () => Promise<void>;
  getPlayer: (address: string) => Promise<void>;
  registerPlayer: (address: string) => Promise<void>;
  getNFTs: () => Promise<void>;
  reset: () => void;
}

export type PlayerContextType = PlayerState & PlayerActions;
