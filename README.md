# NFT Gaming Service (Xsolla Sepolia Testnet Demo)

A proof-of-concept service enabling games to create and maintain NFT collections synced with in-game items.

## Overview

This project demonstrates a complete workflow for game-integrated NFTs:

- **Backend Service**: Manages game items, players, and NFT metadata
- **Smart Contracts**: ERC-721 NFTs with signature-based minting
- **Frontend**: Player-facing interface for viewing and minting NFTs
- **Minecraft Integration**: Mod that demonstrates NFT ownership of in-game zones

Players can claim their in-game items as NFTs using permit signatures, while the service tracks ownership changes and keeps game databases in sync.

## Project Structure

- `/server`: Backend service with API endpoints and blockchain event listener
- `/contracts`: Solidity smart contracts with EIP-712 signature-based minting
- `/frontend-starter-kit`: UI components based on Xsolla ZK Design System
- `/frontend-scratch`: Alternative frontend implementation
- `/minecraft-mod`: Fabric mod for Minecraft integration showcasing NFT ownership

## Key Features

- **Game-to-NFT Synchronization**: In-game items represented as NFTs
- **Signature-Based Minting**: Players mint NFTs using backend-provided signatures
- **Ownership Tracking**: Blockchain event listener updates game database on transfers
- **OpenSea-Compatible Metadata**: Standard-compliant token metadata
- **Minecraft Integration**: Private zones in Minecraft can be claimed as NFTs and ownership transferred on the blockchain

## Quick Start

### Server Setup

```bash
cd server
yarn
yarn prisma migrate dev --name init
```

### Contract Deployment

```bash
cd contracts
forge install
export OWNER_PRIVATE_KEY=0x...
export SIGNER_ADDRESS=0x...
forge script script/DeployGameNFT.s.sol:DeployGameNFT --rpc-url https://zkrpc.xsollazk.com --broadcast --zksync
```

### Frontend Setup

```bash
cd frontend-starter-kit
pnpm install
pnpm dev
```

### Minecraft Mod Setup

```bash
cd minecraft-mod
./gradlew build
```

After building, copy `minecraft-mod/build/libs/privates-mod-1.0.0.jar` to your Minecraft server's `mods` folder. The mod requires `fabric-api-0.125.3+1.21.5.jar` in the same folder and Minecraft version 1.21.5.

## Local Testing Workflow

See [server/LOCAL_LAUNCH.md](./server/LOCAL_LAUNCH.md) for detailed testing instructions.

## Demo Flow

1. Game creates item in backend database
2. Player connects wallet and requests to mint NFT
3. Backend provides signature for gasless minting
4. Player mints NFT using signature
5. Blockchain listener detects mint event
6. Game database is updated with ownership information

### Minecraft Integration Flow

1. Player creates a private zone in Minecraft using `/private wand` and `/private create <name>`
2. Zone data is sent to the backend service
3. Backend creates an NFT representation of the zone
4. Zone ownership changes are synchronized between blockchain and Minecraft
5. When NFT ownership changes, the backend notifies the Minecraft server via webhook

## Implementation Notes

- Built for Xsolla Sepolia Testnet
- Uses EIP-712 signatures for secure minting authorization
- Implements OpenSea metadata standard for marketplace compatibility
