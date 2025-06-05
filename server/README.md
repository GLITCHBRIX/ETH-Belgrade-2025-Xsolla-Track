# NFT Gaming Service

Backend service that lets games peg in-game assets to NFTs.

## Setup

```bash
# Install dependencies
yarn

# Setup database
yarn prisma migrate dev --name init
```

## Environment Variables

Create a `.env` file with:

```
SIGNER_PRIVATE_KEY=0x...
API_BASE_URL=http://localhost:3000
GAME_SERVER_URL=http://localhost:8081
```

## Usage

```bash
# Start server
yarn dev

# Start blockchain listener
yarn listener

# Start both
yarn dev:all
```

## Local Testing

For detailed local testing instructions, please refer to [LOCAL_LAUNCH.md](./LOCAL_LAUNCH.md).

## API Endpoints

- `POST /items` - Create item
- `GET /items/:pk` - Get item
- `GET /items/:pk/mint` - Get minting data
- `POST /game/:gameId/player` - Link player ID with address
- `GET /game/:gameId/player` - Get player information
- `GET /:itemPk` - Metadata endpoint (OpenSea format) 