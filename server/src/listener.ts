import { PrismaClient } from "@prisma/client";
import { createPublicClient, http, parseAbiItem } from "viem";
import { xsollaZK } from "./utils/blockchain";

// // Reset all collections' lastProcessedBlock to start from the beginning
// async function resetProcessedBlocks() {
//   const prisma = new PrismaClient();
//   await prisma.collection.updateMany({
//     data: { lastProcessedBlock: null }
//   });
//   await prisma.$disconnect();
// }
// // Execute reset (remove this line after first run)
// resetProcessedBlocks().catch(console.error);

const prisma = new PrismaClient();
const publicClient = createPublicClient({
  chain: xsollaZK,
  transport: http(),
});

const transferEventAbi = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const POLLING_INTERVAL = 10000;
const collectionTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Process a Transfer event from a collection
 */
async function processTransferEvent(
  collectionAddress: string,
  from: string,
  to: string,
  tokenId: bigint
) {
  if (from.toLowerCase() !== ZERO_ADDRESS) {
    return;
  }

  console.log(`Mint detected on collection ${collectionAddress} for token ${tokenId}`);

  try {
    const collection = await prisma.collection.findUnique({
      where: { contractAddress: collectionAddress.toLowerCase() },
    });

    if (!collection) {
      console.error(`Collection with address ${collectionAddress} not found in database`);
      return;
    }

    const item = await prisma.item.findFirst({
      where: {
        collectionId: collection.id,
        tokenId: Number(tokenId),
      },
    });

    if (!item) {
      console.error(`Item with tokenId ${tokenId} not found in collection ${collectionAddress}`);
      return;
    }

    if (!item.minted) {
      await prisma.item.update({
        where: { pk: item.pk },
        data: { minted: true },
      });
      console.log(`Updated item ${item.pk} (tokenId: ${tokenId}) - marked as minted`);
    }
  } catch (error) {
    console.error(`Error processing mint event for token ${tokenId}:`, error);
  }
}

/**
 * Start listening for events from a specific collection
 */
async function listenToCollection(collectionAddress: string) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { contractAddress: collectionAddress.toLowerCase() },
    });

    if (!collection) {
      console.error(`Collection with address ${collectionAddress} not found in database`);
      return;
    }

    let lastProcessedBlock = collection.lastProcessedBlock ?? 0n;
    const currentBlock = await publicClient.getBlockNumber();

    if (lastProcessedBlock >= currentBlock) {
      console.log(`No new blocks for collection ${collectionAddress}, last processed: ${lastProcessedBlock}`);
      
      if (collectionTimeouts.has(collectionAddress)) {
        clearTimeout(collectionTimeouts.get(collectionAddress)!);
      }
      
      collectionTimeouts.set(
        collectionAddress,
        setTimeout(() => listenToCollection(collectionAddress), POLLING_INTERVAL)
      );
      
      return;
    }

    console.log(`Checking for events on collection ${collectionAddress} from block ${lastProcessedBlock} to ${currentBlock}`);

    const transferEvents = await publicClient.getLogs({
      address: collectionAddress as `0x${string}`,
      event: transferEventAbi,
      fromBlock: lastProcessedBlock + 1n,
      toBlock: currentBlock,
    });

    console.log(`Found ${transferEvents.length} transfer events`);

    for (const event of transferEvents) {
      const { from, to, tokenId } = event.args as {
        from: string;
        to: string;
        tokenId: bigint;
      };

      await processTransferEvent(collectionAddress, from, to, tokenId);
    }

    await prisma.collection.update({
      where: { id: collection.id },
      data: { lastProcessedBlock: currentBlock },
    });

    console.log(`Updated last processed block for collection ${collectionAddress} to ${currentBlock}`);
  } catch (error) {
    console.error(`Error listening to collection ${collectionAddress}:`, error);
  }

  if (collectionTimeouts.has(collectionAddress)) {
    clearTimeout(collectionTimeouts.get(collectionAddress)!);
  }
  
  collectionTimeouts.set(
    collectionAddress,
    setTimeout(() => listenToCollection(collectionAddress), POLLING_INTERVAL)
  );
}

/**
 * Start listening to all collections in the database
 */
export async function startListening() {
  try {
    const collections = await prisma.collection.findMany();
    console.log(`Starting listener for ${collections.length} collections`);

    for (const collection of collections) {
      listenToCollection(collection.contractAddress);
    }
  } catch (error) {
    console.error("Error starting listener:", error);
  }
}

/**
 * Stop listening to all collections
 */
export function stopListening() {
  for (const [address, timeout] of collectionTimeouts) {
    clearTimeout(timeout);
    console.log(`Stopped listening to collection ${address}`);
  }
  collectionTimeouts.clear();
}

/**
 * Start the listener as a standalone process
 */
if (require.main === module) {
  console.log("Starting blockchain listener service...");
  startListening()
    .catch((error) => {
      console.error("Error in listener service:", error);
      process.exit(1);
    });

  process.on("SIGINT", () => {
    console.log("Shutting down listener service...");
    stopListening();
    prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("Shutting down listener service...");
    stopListening();
    prisma.$disconnect();
    process.exit(0);
  });
} 