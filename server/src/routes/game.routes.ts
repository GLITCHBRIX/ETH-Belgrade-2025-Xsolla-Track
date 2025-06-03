import { Router } from "express";
import { createGameSchema } from "../validation/schemas";
import z, { ZodError } from "zod";
import { dbService } from "../services/db.service";

const router = Router();

// Create a new game
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const validatedData = createGameSchema.parse(req.body);

    const game = await dbService.createGame(validatedData.name);

    res.status(201).json(game);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error creating game:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get game by ID
router.get("/:id", async (req, res) => {
  try {
    const gameId = z.coerce.number().int().parse(req.params.id);

    const game = await dbService.getGameById(gameId);

    if (!game) {
      res.status(404).json({ error: `Game with ID ${gameId} not found` });
      return;
    }

    res.status(200).json(game);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    console.error("Error getting game:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
