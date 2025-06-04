export type Player = {
  createdAt: Date;
  updatedAt: Date;
  gameId: number;
  pk: number;
  playerId: string | null;
  playerAddress: string | null;
};

export type Item = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  pk: number;
  playerPk: number;
  collectionId: number;
  description: string;
  image: string;
  externalUrl: string | null;
  tokenId: number;
  minted: boolean;
};

export type MetadataAttribute = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  itemId: number;
  traitType: string;
  value: string;
};

export type UserReturn = Player & { items: Array<Item & { attributes: MetadataAttribute[] }> };

export interface PlayerState {
  isAuthenticated: boolean;
  address: string | null;
  playerId: string | null;
  availableNFTs: Item[];
  ownedNFTs: Item[];
  isLoading: boolean;
  error: string | null;
}

export interface PlayerContextType extends PlayerState {
  registerPlayer: (address: string) => Promise<void>;
  reset: () => void;
}
