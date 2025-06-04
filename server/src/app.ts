import express from "express";
import itemRoutes from "./item.routes";
import gameRoutes from "./player.routes";
import { dbService } from "./db.service";
import { z } from "zod";
import cors from "cors";

// These routes will be implemented later
// import collectionRoutes from "./routes/collection.routes";

export type OpenSeaMetadata = {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
};

// Create Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(cors());

// API routes
app.use("/items", itemRoutes);
app.use("/game", gameRoutes);
// These routes will be implemented later
// app.use('/api/collections', collectionRoutes);

app.get("/:itemPk", async (req, res) => {
  try {
    const itemPk = z.coerce.number().int().positive().parse(req.params.itemPk);

    const item = await dbService.getItemByPk(itemPk);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const metadata: OpenSeaMetadata = {
      name: item.name,
      description: item.description,
      image: item.image,
      external_url: item.externalUrl ?? undefined,
      attributes: item.attributes.map((attr) => ({
        trait_type: attr.traitType,
        value: attr.value,
      })),
    };

    res.status(200).json(metadata);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
