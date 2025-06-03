import { Router } from "express";
import { createItemSchema } from "../validation/schemas";
import { dbService } from "../services/db.service";
import { z, ZodError } from "zod";
import { signMintPermit, generateNonce, generateDeadline } from "../utils/signature";

const router = Router();

// Create a new item
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const validatedData = createItemSchema.parse(req.body);

    // Check if game exists
    const game = await dbService.getGameById(validatedData.gameId);
    if (!game) {
      res.status(404).json({ error: `Game with ID ${validatedData.gameId} not found` });
      return;
    }

    // Check if collection exists
    const collection = await dbService.getCollectionById(validatedData.collectionId);
    if (!collection) {
      res.status(404).json({ error: `Collection with ID ${validatedData.collectionId} not found` });
      return;
    }

    // Create the item
    const item = await dbService.createItem(validatedData);

    // Transform the response to match the expected format
    const response = {
      ...item,
      attributes: item.attributes.map((attr) => ({
        trait_type: attr.traitType,
        value: attr.value,
      })),
    };

    res.status(201).json(response);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error creating item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get item by ID
router.get("/:id", async (req, res) => {
  try {
    const itemId = z.coerce.number().int().parse(req.params.id);

    const item = await dbService.getItemById(itemId);

    if (!item) {
      res.status(404).json({ error: `Item with ID ${itemId} not found` });
      return;
    }

    // Transform the response to match the expected format
    const response = {
      ...item,
      attributes: item.attributes.map((attr) => ({
        trait_type: attr.traitType,
        value: attr.value,
      })),
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error getting item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get minting information for an item
router.get("/:id/mint", async (req, res) => {
  try {
    const itemId = z.coerce.number().int().parse(req.params.id);

    const item = await dbService.getItemById(itemId);

    if (!item) {
      res.status(404).json({ error: `Item with ID ${itemId} not found` });
      return;
    }

    // Get the collection contract address
    const collection = item.collection;
    if (!collection.contractAddress) {
      res.status(400).json({ error: "Collection does not have a contract address" });
      return;
    }

    // Ensure player has an address
    if (!item.player.playerAddress) {
      res.status(400).json({ error: "Player does not have a blockchain address" });
      return;
    }

    // Generate token URI
    // FIXME: this is horrendously wrong
    const baseUri = `${process.env.API_BASE_URL}/api`;
    const tokenUri = `${baseUri}/items/${item.id}`;

    // Generate nonce and deadline
    const nonce = generateNonce();
    const deadline = generateDeadline();

    // Sign the mint permit using EIP-712
    const signatureData = await signMintPermit(
      collection.contractAddress,
      item.tokenId,
      item.player.playerAddress,
      tokenUri,
      nonce,
      deadline
    );

    // Return the permit data and signature
    res.status(200).json({
      contractAddress: collection.contractAddress,
      permitData: signatureData.permitData,
      signature: signatureData.signature
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error getting minting information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
