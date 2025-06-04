import type { Player } from "@prisma/client";
import axios from "axios";

async function main() {
  try {
    // Define the player data
    const playerData = {
      playerId: "player123",
      playerAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Using account #2 from anvil
    };

    console.log("Sending request to link player ID with address...");

    // Make the POST request to link a player for game ID 1
    const response = await axios.post<Player>("http://localhost:3000/game/1/player", playerData);

    // Print the response data
    switch (response.status) {
      case 201:
        console.log("Player created and linked successfully:");
        break;
      case 200:
        console.log("Player updated successfully:");
        break;
      default:
        console.log(`Response status: ${response.status}`);
    }
    console.log("OK");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 304) {
        console.log("Player already linked (not modified):");
        console.log("OK");
        return;
      } else if (error.response?.status === 409) {
        console.error("Linking conflict:", error.response.data?.error || "Unknown conflict error");
      } else {
        console.error("API Error:", error.response?.data || error.message);
      }
    } else {
      console.error("Error linking player:", error);
    }
    process.exit(1);
  }
}

main();
