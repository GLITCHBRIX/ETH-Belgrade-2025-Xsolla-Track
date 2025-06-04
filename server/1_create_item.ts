import axios from "axios";
import { z } from "zod";
import type { createItemSchema } from "./src/schemas";
import type { Item, MetadataAttribute } from "@prisma/client";

async function main() {
  try {
    // Define the item data
    const itemData: z.infer<typeof createItemSchema> = {
      gameId: 1,
      collectionId: 1,
      playerId: "player123",
      metadata: {
        name: "Property 1",
        description: "Property 1, by @player123",
        image: "https://placehold.co/512x512?text=Property+1",
        attributes: [
          {
            trait_type: "Point A",
            value: "0,0,0",
          },
          {
            trait_type: "Point B",
            value: "10,10,10",
          },
        ],
      },
    };

    console.log("Sending request to create item...");

    // Make the POST request to create an item
    const response = await axios.post<Item & { attributes: MetadataAttribute[] }>(
      "http://localhost:3000/items",
      itemData
    );

    // Print the response data
    console.log("Item created successfully:");
    console.log(`Item PK: ${response.data.pk}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
    } else {
      console.error("Error creating item:", error);
    }
    process.exit(1);
  }
}

main();
