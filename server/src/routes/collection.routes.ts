import { Router } from "express";
import { dbService } from "../services/db.service";
import { createCollectionSchema } from "../validation/schemas";
import { z, ZodError } from "zod";
import { isValidAddress } from "../utils/blockchain";

const router = Router();

// Create a new collection
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const validatedData = createCollectionSchema.parse(req.body);

    // Check if game exists
    const game = await dbService.getGameById(validatedData.gameId);
    if (!game) {
      res.status(404).json({ error: `Game with ID ${validatedData.gameId} not found` });
      return;
    }

    // Validate contract address
    if (!isValidAddress(validatedData.contractAddress)) {
      res.status(400).json({ error: "Invalid contract address format" });
      return;
    }

    const collection = await dbService.createCollection(validatedData.gameId, validatedData.name, validatedData.contractAddress);

    res.status(201).json(collection);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error creating collection:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get collection by ID
router.get("/:id", async (req, res) => {
  try {
    const collectionId = z.coerce.number().int().parse(req.params.id);

    const collection = await dbService.getCollectionById(collectionId);

    if (!collection) {
      res.status(404).json({ error: `Collection with ID ${collectionId} not found` });
      return;
    }

    res.status(200).json(collection);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error getting collection:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
