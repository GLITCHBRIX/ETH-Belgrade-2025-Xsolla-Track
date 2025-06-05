import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Define schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  SIGNER_PRIVATE_KEY: z.string().refine((val) => /^0x[a-fA-F0-9]{64}$/.test(val), {
    message: "Invalid SIGNER_PRIVATE_KEY format",
  }),

  // API settings
  API_BASE_URL: z.string().url(),

  // Add other env vars as needed
  GAME_SERVER_URL: z.string().url(),
});

// For development environment, provide fallbacks for local testing
// These are only used if .env file is missing
function getEnvWithFallbacks() {
  const processEnv = {
    ...process.env,
    // Local development fallbacks
    NODE_ENV: process.env.NODE_ENV || "development",

    SIGNER_PRIVATE_KEY:
      process.env.SIGNER_PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // account #1

    // Default API base URL for local development
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
    GAME_SERVER_URL: process.env.GAME_SERVER_URL || "http://localhost:8081",
  };

  return processEnv;
}

// Parse and validate environment variables
function validateEnv() {
  const env = getEnvWithFallbacks();

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.format());
    } else {
      console.error("❌ Unknown error validating environment variables:", error);
    }
    throw new Error("Invalid environment variables");
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export other config values
export const isDevelopment = env.NODE_ENV === "development";
// export const isProduction = env.NODE_ENV === "production";
// export const isTest = env.NODE_ENV === "test";
