import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a game
  const game = await prisma.game.create({
    data: {
      name: "Minecraft",
      // Create a collection for this game
      collections: {
        create: {
          name: "Minecraft Private Property NFT",
          contractAddress: "0x588758d8a0Ad1162A6294f3C274753137E664aE0".toLowerCase(), // Anvil address
          // contractAddress: "0xef1F201957049c2Fb57bA48692b7AfAe9709A125".toLowerCase(), // Real sepolia address
        },
      },
    },
  });

  console.log(`Created game: ${game.name} with ID: ${game.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
