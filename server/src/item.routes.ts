import { Router } from "express";
import { createItemSchema } from "./schemas";
import { dbService } from "./db.service";
import { z, ZodError } from "zod";
import { signMintPermit, generateDeadline } from "./utils/signature";

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
      res.status(404).json({
        error: `Collection with ID ${validatedData.collectionId} not found`,
      });
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
router.get("/:pk", async (req, res) => {
  try {
    const itemPk = z.coerce.number().int().parse(req.params.pk);

    const item = await dbService.getItemByPk(itemPk);

    if (!item) {
      res.status(404).json({ error: `Item with PK ${itemPk} not found` });
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
router.get("/:pk/mint", async (req, res) => {
  try {
    const itemPk = z.coerce.number().int().parse(req.params.pk);

    const item = await dbService.getItemByPk(itemPk);

    if (!item) {
      res.status(404).json({ error: `Item with PK ${itemPk} not found` });
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

    // Use the itemPk as the tokenURI - the contract will concatenate with baseURI
    const tokenURI = itemPk.toString();
    const deadline = generateDeadline();

    const signatureData = await signMintPermit(
      collection.contractAddress,
      item.tokenId,
      item.player.playerAddress,
      tokenURI,
      deadline
    );

    const response: MintingResponse = {
      contractAddress: collection.contractAddress,
      permitData: signatureData.permitData,
      signature: signatureData.signature,
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

    console.error("Error getting minting information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export type MintingResponse = {
  contractAddress: string;
  permitData: {
    tokenId: number;
    receiver: `0x${string}`;
    tokenURI: string;
    deadline: number;
  };
  signature: `0x${string}`;
};

export default router;
