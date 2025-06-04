// Import config first to ensure environment variables are loaded
import { env, isDevelopment } from "./config";
import app from "./app";

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  if (isDevelopment) {
    console.log("Running in development mode with anvil-zksync local network");
  }
});
