import { z } from 'zod';

// Attribute schema
export const attributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
});

// NFT Metadata schema
export const nftMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  external_url: z.string().url().optional(),
  attributes: z.array(attributeSchema).optional(),
});

// Create Item request schema
export const createItemSchema = z.object({
  gameId: z.number().int().positive(),
  collectionId: z.number().int().positive(),
  playerId: z.string().optional(),
  playerAddress: z.string().toLowerCase().optional(),
  metadata: nftMetadataSchema,
}).refine(data => data.playerId || data.playerAddress, {
  message: "Either playerId or playerAddress must be provided",
});

// Find Player request schema
export const findPlayerSchema = z.object({
  gameId: z.number().int().positive(),
  playerId: z.string().optional(),
  playerAddress: z.string().toLowerCase().optional(),
}).refine(data => data.playerId || data.playerAddress, {
  message: "Either playerId or playerAddress must be provided",
});

// Create Game request schema
export const createGameSchema = z.object({
  name: z.string().min(1),
});

// Create Collection request schema
export const createCollectionSchema = z.object({
  gameId: z.number().int().positive(),
  name: z.string().min(1),
  contractAddress: z.string().toLowerCase().min(1),
}); 