import { Item, MetadataAttribute, Player, PrismaClient } from "@prisma/client";
import type { createItemSchema } from "./schemas";
import type { z } from "zod";

const ItemIncludeAttributes = {
  attributes: true,
} as const;

const PlayerIncludeAttributes = {
  items: {
    include: ItemIncludeAttributes,
  },
} as const;

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getGameById(id: number) {
    return this.prisma.game.findUnique({
      where: { id },
    });
  }

  async getCollectionById(id: number) {
    return this.prisma.collection.findUnique({
      where: { id },
    });
  }

  // Player methods
  async findOrCreatePlayer(params: {
    gameId: number;
    playerId: string | undefined;
    playerAddress: `0x${string}` | undefined;
  }): Promise<Player & { items: Array<Item & { attributes: MetadataAttribute[] }> }> {
    const { gameId, playerId, playerAddress } = params;

    let existingPlayer:
      | (Player & {
          items: Array<Item & { attributes: MetadataAttribute[] }>;
        })
      | null = null;

    // First try to find by specific parameters without OR condition
    if (playerAddress) {
      existingPlayer = await this.prisma.player.findFirst({
        where: {
          gameId,
          playerAddress,
        },
        include: PlayerIncludeAttributes,
      });
    }

    // If not found by address and playerId is provided, try by playerId
    if (!existingPlayer && playerId) {
      existingPlayer = await this.prisma.player.findFirst({
        where: {
          gameId,
          playerId,
        },
        include: PlayerIncludeAttributes,
      });
    }

    if (existingPlayer) {
      return existingPlayer;
    }

    // Create new player - use unchecked create to avoid issues with relations
    return this.prisma.player.create({
      data: {
        gameId,
        playerId,
        playerAddress,
      },
      include: PlayerIncludeAttributes,
    });
  }

  /**
   * Links a player ID with an address
   * @param gameId The game ID
   * @param playerId The player ID
   * @param playerAddress The player address
   * @returns An object with result status and player data
   */
  async linkPlayer(
    gameId: number,
    playerId: string,
    playerAddress: string
  ): Promise<{
    status: "created" | "updated" | "not_modified";
    player: Player & { items: Array<Item & { attributes: MetadataAttribute[] }> };
  }> {
    // Ensure the address is lowercase
    const normalizedAddress = playerAddress.toLowerCase();

    // 1. Search for that playerId
    const playerByPlayerId = await this.prisma.player.findFirst({
      where: {
        gameId,
        playerId,
      },
      include: PlayerIncludeAttributes,
    });

    if (playerByPlayerId) {
      // 2. If found that playerid and no address, put the address and return success
      if (!playerByPlayerId.playerAddress) {
        const updatedPlayer = await this.prisma.player.update({
          where: { pk: playerByPlayerId.pk },
          data: { playerAddress: normalizedAddress },
          include: PlayerIncludeAttributes,
        });
        return { status: "updated", player: updatedPlayer };
      }

      // 3. If found that playerid and another address, return error
      if (playerByPlayerId.playerAddress !== normalizedAddress) {
        throw new Error("Player already linked to a different address");
      }

      // 4. If found that playerid and same address, return "not modified"
      if (playerByPlayerId.playerAddress === normalizedAddress) {
        return { status: "not_modified", player: playerByPlayerId };
      }
    }

    // 5. If not found, search for that address
    const playerByAddress = await this.prisma.player.findFirst({
      where: {
        gameId,
        playerAddress: normalizedAddress,
      },
      include: PlayerIncludeAttributes,
    });

    if (playerByAddress) {
      // 6. If found with that address but no playerid, put playerid and return success
      if (!playerByAddress.playerId) {
        const updatedPlayer = await this.prisma.player.update({
          where: { pk: playerByAddress.pk },
          data: { playerId },
          include: PlayerIncludeAttributes,
        });
        return { status: "updated", player: updatedPlayer };
      }

      // 7. If found but playerid is different, return error
      if (playerByAddress.playerId !== playerId) {
        throw new Error("Address already linked to a different player ID");
      }

      // 8. If found and playerid is the same, return not modified
      if (playerByAddress.playerId === playerId) {
        return { status: "not_modified", player: playerByAddress };
      }
    }

    // 9. If not found either, create a new player
    const newPlayer = await this.prisma.player.create({
      data: {
        gameId,
        playerId,
        playerAddress: normalizedAddress,
      },
      include: PlayerIncludeAttributes,
    });

    return { status: "created", player: newPlayer };
  }

  // Item methods
  // NOTE: vulnerable to parallel requests for the same collectionId
  async createItem(request: z.infer<typeof createItemSchema>) {
    const { gameId, collectionId, playerId, playerAddress, metadata } = request;

    // Find or create player
    const player = await this.findOrCreatePlayer({
      gameId,
      playerId,
      playerAddress,
    });

    // Find the highest tokenId for this collection and increment by 1
    const highestTokenItem = await this.prisma.item.findFirst({
      where: { collectionId },
      orderBy: { tokenId: "desc" },
      select: { tokenId: true },
    });

    const nextTokenId = highestTokenItem?.tokenId ? highestTokenItem.tokenId + 1 : 1;

    // Create item with attributes
    return this.prisma.item.create({
      data: {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        externalUrl: metadata.external_url,
        tokenId: nextTokenId,
        player: { connect: { pk: player.pk } },
        collection: { connect: { id: collectionId } },
        attributes: {
          create:
            metadata.attributes?.map((attr) => ({
              traitType: attr.trait_type,
              value: String(attr.value),
            })) || [],
        },
      },
      include: {
        attributes: true,
        player: true,
        collection: true,
      },
    });
  }

  async getItemByPk(pk: number) {
    return this.prisma.item.findUnique({
      where: { pk },
      include: {
        attributes: true,
        player: true,
        collection: true,
      },
    });
  }

  async getItemsByPlayerId(playerPk: number) {
    return this.prisma.item.findMany({
      where: { playerPk },
      include: {
        attributes: true,
        collection: true,
      },
    });
  }

  async getItemsByCollectionId(collectionId: number) {
    return this.prisma.item.findMany({
      where: { collectionId },
      include: {
        attributes: true,
        player: true,
      },
    });
  }
}

export const dbService = new DatabaseService();
