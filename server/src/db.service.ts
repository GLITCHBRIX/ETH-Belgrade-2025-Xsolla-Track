import { Collection, Item, MetadataAttribute, Player, PrismaClient } from "@prisma/client";
import type { createItemSchema } from "./schemas";
import type { z } from "zod";
import { env } from "./config";
import axios from "axios";

const ItemIncludeAttributes = {
  attributes: true,
  collection: true,
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
  }): Promise<Player & { items: Array<Item & { attributes: MetadataAttribute[]; collection: Collection }> }> {
    const { gameId, playerId, playerAddress } = params;

    let existingPlayer:
      | (Player & {
          items: Array<Item & { attributes: MetadataAttribute[]; collection: Collection }>;
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
    status: "created" | "updated" | "not_modified" | "merged";
    player: Player & { items: Array<Item & { attributes: MetadataAttribute[]; collection: Collection }> };
  }> {
    playerAddress = playerAddress.toLowerCase();

    const playerByPlayerId = await this.prisma.player.findFirst({
      where: { gameId, playerId },
      include: PlayerIncludeAttributes,
    });
    const playerByAddress = await this.prisma.player.findFirst({
      where: { gameId, playerAddress },
      include: PlayerIncludeAttributes,
    });

    if (playerByPlayerId && playerByAddress) {
      if (playerByPlayerId.pk === playerByAddress.pk) return { status: "not_modified", player: playerByPlayerId };

      return await this.prisma.$transaction(async (tx) => {
        await tx.item.updateMany({
          where: { playerPk: playerByAddress.pk },
          data: { playerPk: playerByPlayerId.pk },
        });
        await tx.player.delete({ where: { pk: playerByAddress.pk } });
        const player = await tx.player.update({
          where: { pk: playerByPlayerId.pk },
          data: { playerAddress },
          include: PlayerIncludeAttributes,
        });
        return { status: "merged", player };
      });
    }

    if (playerByPlayerId) {
      if (!playerByPlayerId.playerAddress) {
        const updatedPlayer = await this.prisma.player.update({
          where: { pk: playerByPlayerId.pk },
          data: { playerAddress },
          include: PlayerIncludeAttributes,
        });
        return { status: "updated", player: updatedPlayer };
      }

      if (playerByPlayerId.playerAddress !== playerAddress)
        throw new Error("Player already linked to a different address");
    }

    if (playerByAddress) {
      if (!playerByAddress.playerId) {
        const updatedPlayer = await this.prisma.player.update({
          where: { pk: playerByAddress.pk },
          data: { playerId },
          include: PlayerIncludeAttributes,
        });
        // Send to the game server that the player was updated
        const items = await this.prisma.item.findMany({
          where: { playerPk: playerByAddress.pk },
          include: { attributes: true },
        });
        for (const item of items) {
          console.log(`Sending item ${item.pk} to the game server`);
          const maybeItemUuid = item.attributes.find((a) => a.traitType === "uuid");
          if (maybeItemUuid) {
            const response = await axios.post<{ success: boolean; message: string }>(
              `${env.GAME_SERVER_URL}/change-owner`,
              {
                uuid: maybeItemUuid.value,
                newOwner: updatedPlayer.playerId,
              }
            );
            console.log(`Game server response:`, response.data);
          }
        }
        return { status: "updated", player: updatedPlayer };
      }

      if (playerByAddress.playerId !== playerId) throw new Error("Address already linked to a different player ID");
    }

    const newPlayer = await this.prisma.player.create({
      data: { gameId, playerId, playerAddress },
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
