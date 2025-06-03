import express from 'express';
import 'express-async-errors';
import itemRoutes from './routes/item.routes';
import gameRoutes from './routes/game.routes';
import collectionRoutes from './routes/collection.routes';

// Create Express app
const app = express();

// Apply middleware
app.use(express.json());

// API routes
app.use('/api/items', itemRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/collections', collectionRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app; 