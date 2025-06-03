import { PrismaClient } from '@prisma/client';
import type { createItemSchema, findPlayerSchema } from '../validation/schemas';
import type { z } from 'zod';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Game methods
  async createGame(name: string) {
    return this.prisma.game.create({
      data: { name }
    });
  }

  async getGameById(id: number) {
    return this.prisma.game.findUnique({
      where: { id }
    });
  }

  // Collection methods
  async createCollection(gameId: number, name: string, contractAddress: string) {
    return this.prisma.collection.create({
      data: {
        name,
        contractAddress,
        game: { connect: { id: gameId } }
      }
    });
  }

  async getCollectionById(id: number) {
    return this.prisma.collection.findUnique({
      where: { id }
    });
  }

  // Player methods
  async findOrCreatePlayer(params: z.infer<typeof findPlayerSchema>) {
    const { gameId, playerId, playerAddress } = params;

    // Find existing player
    const existingPlayer = await this.prisma.player.findFirst({
      where: {
        gameId,
        OR: [
          { playerId: playerId || null },
          { playerAddress: playerAddress || null }
        ]
      }
    });

    if (existingPlayer) {
      return existingPlayer;
    }

    // Create new player - use unchecked create to avoid issues with relations
    return this.prisma.player.create({
      data: {
        gameId,
        playerId,
        playerAddress
      }
    });
  }

  // Item methods
  async createItem(request: z.infer<typeof createItemSchema>) {
    const { gameId, collectionId, playerId, playerAddress, metadata } = request;

    // Find or create player
    const player = await this.findOrCreatePlayer({ gameId, playerId, playerAddress });

    // Find the highest tokenId for this collection and increment by 1
    const highestTokenItem = await this.prisma.item.findFirst({
      where: { collectionId },
      orderBy: { tokenId: 'desc' },
      select: { tokenId: true }
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
        player: { connect: { id: player.id } },
        collection: { connect: { id: collectionId } },
        attributes: {
          create: metadata.attributes?.map(attr => ({
            traitType: attr.trait_type,
            value: String(attr.value)
          })) || []
        }
      },
      include: {
        attributes: true,
        player: true,
        collection: true
      }
    });
  }

  async getItemById(id: number) {
    return this.prisma.item.findUnique({
      where: { id },
      include: {
        attributes: true,
        player: true,
        collection: true
      }
    });
  }

  async getItemsByPlayerId(playerId: number) {
    return this.prisma.item.findMany({
      where: { playerId },
      include: {
        attributes: true,
        collection: true
      }
    });
  }

  async getItemsByCollectionId(collectionId: number) {
    return this.prisma.item.findMany({
      where: { collectionId },
      include: {
        attributes: true,
        player: true
      }
    });
  }
}

export const dbService = new DatabaseService(); 