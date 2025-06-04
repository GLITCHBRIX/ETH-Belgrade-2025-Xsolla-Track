import { readContract } from "./src/utils/blockchain";
import ERC721URIStorageABI from "../contracts/out/ERC721URIStorage.sol/ERC721URIStorage.json";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the contract address from the database
    const collection = await prisma.collection.findFirst({
      where: {
        gameId: 1,
      },
    });

    if (!collection) {
      console.error("No collection found in the database");
      process.exit(1);
    }

    const contractAddress = collection.contractAddress;
    console.log(`Checking contract at address: ${contractAddress}`);

    // Query the contract name
    const name = await readContract(
      contractAddress,
      ERC721URIStorageABI.abi,
      "name"
    );

    console.log(`Contract name: ${name}`);

    // Optionally query other information
    const symbol = await readContract(
      contractAddress,
      ERC721URIStorageABI.abi,
      "symbol"
    );

    console.log(`Contract symbol: ${symbol}`);
  } catch (error) {
    console.error("Error checking contract:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 