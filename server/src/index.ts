// Import config first to ensure environment variables are loaded
import { env, isDevelopment } from "./config";
import app from "./app";
import { startListening } from "./listener";
import { currentChain } from "./utils/blockchain";

const PORT = process.env.PORT || 3000;

// Check if the listener should be started
const ENABLE_LISTENER = process.env.ENABLE_LISTENER === "true";

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  if (isDevelopment) {
    console.log(`Running in development mode with ${currentChain.name} network`);
  }
  
  // Start the blockchain listener if enabled
  if (ENABLE_LISTENER) {
    console.log("Starting blockchain listener...");
    startListening().catch((error) => {
      console.error("Error starting blockchain listener:", error);
    });
  }
});
