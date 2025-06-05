import { Router } from "express";
import { z, ZodError } from "zod";
import { dbService } from "./db.service";
import { linkPlayerSchema, getPlayerQuerySchema } from "./schemas";

const router = Router();

// Link a player ID with an address
router.post("/:gameId/player", async (req, res) => {
  try {
    // Validate game ID
    const gameId = z.coerce.number().int().positive().parse(req.params.gameId);
    
    // Validate request body
    const validatedData = linkPlayerSchema.parse(req.body);
    
    // Check if game exists
    const game = await dbService.getGameById(gameId);
    if (!game) {
      res.status(404).json({ error: `Game with ID ${gameId} not found` });
      return;
    }
    
    // Link player ID with address
    try {
      const result = await dbService.linkPlayer(
        gameId,
        validatedData.playerId,
        validatedData.playerAddress
      );
      
      // Return appropriate status code based on result
      switch (result.status) {
        case "created":
          res.status(201).json(result.player);
          break;
        case "updated":
          res.status(200).json(result.player);
          break;
        case "merged":
          res.status(200).json(result.player);
          break;
        case "not_modified":
          // For 304, we should set the status but not send a body
          // This is a special case where we'll send 200 with a message instead
          res.status(200).json({ 
            ...result.player, 
            message: "Player already linked (not modified)" 
          });
          break;
        default:
          res.status(200).json(result.player);
      }
    } catch (linkError) {
      if (linkError instanceof Error) {
        res.status(409).json({ error: linkError.message });
      } else {
        throw linkError;
      }
    }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }
    
    console.error("Error linking player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get player information
router.get("/:gameId/player", async (req, res) => {
  try {
    // Validate game ID
    const gameId = z.coerce.number().int().positive().parse(req.params.gameId);
    
    // Validate query parameters
    const query = getPlayerQuerySchema.parse(req.query);
    
    // Check if game exists
    const game = await dbService.getGameById(gameId);
    if (!game) {
      res.status(404).json({ error: `Game with ID ${gameId} not found` });
      return;
    }
    
    // Find player
    const player = await dbService.findOrCreatePlayer({
      gameId,
      playerId: query.playerId,
      playerAddress: query.playerAddress
    });
    
    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    
    res.status(200).json(player);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }
    
    console.error("Error getting player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 