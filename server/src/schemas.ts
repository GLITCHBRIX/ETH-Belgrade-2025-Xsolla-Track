import { z } from "zod";
import { isAddress } from "viem";

// Ethereum address validation
export const ethereumAddress = z
  .string()
  .toLowerCase()
  .refine((value) => isAddress(value, { strict: false }), { message: "Invalid Ethereum address" });

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
export const createItemSchema = z
  .object({
    gameId: z.number().int().positive(),
    collectionId: z.number().int().positive(),
    playerId: z.string().optional(),
    playerAddress: ethereumAddress.optional(),
    metadata: nftMetadataSchema,
  })
  .refine((data) => data.playerId || data.playerAddress, {
    message: "Either playerId or playerAddress must be provided",
  });

// Find Player request schema
export const findPlayerSchema = z
  .object({
    gameId: z.number().int().positive(),
    playerId: z.string().optional(),
    playerAddress: ethereumAddress.optional(),
  })
  .refine((data) => data.playerId || data.playerAddress, {
    message: "Either playerId or playerAddress must be provided",
  });

// Link Player schema
export const linkPlayerSchema = z.object({
  playerId: z.string(),
  playerAddress: ethereumAddress,
});

// Get Player query schema
export const getPlayerQuerySchema = z
  .object({
    playerId: z.string().optional(),
    playerAddress: ethereumAddress.optional(),
  })
  .refine((data) => data.playerId || data.playerAddress, {
    message: "Either playerId or playerAddress must be provided",
  });
