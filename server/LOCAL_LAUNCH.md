Before this all, `yarn` and `yarn prisma migrate dev --name init`

# Prepare db

0. Run `anvil-zksync`
1. You'll need to set environment vars with anvil's first two accounts' private keys

```sh
export OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export SIGNER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8

forge script ../contracts/script/DeployGameNFT.s.sol:DeployGameNFT --rpc-url http://localhost:8011 --broadcast
```

2. Then copy the address of the deployed collection contract.

```log
GameNFT deployed at: 0x588758d8a0Ad1162A6294f3C274753137E664aE0
```

into `0_seed_db.ts`:

```ts
contractAddress: "0x588758d8a0Ad1162A6294f3C274753137E664aE0".toLowerCase();
```

end then put a game and its new collection to the db:

```sh
yarn tsx 0_seed_db.ts
```

_NOTE: In production, there would be an admin panel to do this_

# Create an item

In production, the game will do that by sending POST on our `/item`.

0. `yarn tsx src/index.ts`
1. `yarn tsx 1_create_item.ts` must print out `Item PK: 1`. This value will be used few steps later

# Register user

In production, a game can optionally do it (optionally, because the item creation endpoint creates a player if one doesn't exist).
In our demo, only way to register a player is to create an item he owns.

# Link user playerId-address

In the ACTUAL production, there will be a trustful way to inform our service about playerId--address connection.
In the demo we are to make for now, frontend will just send a POST with an object with `playerId` and `address` on our `game/{gameId}/player`

- For the same frontend, there will be a GET `game/{gameId}/player` with REQUIRED `?playerId=abc...` OR `?address=0xdeadbeef...`, and it will return player object. Also, if both query params are present, a player is searched by BOTH (thus throwing an error if a combination of the two wasnt found).

In local run that you do here, you:

0. `yarn tsx 2_link_user.ts`
   It will send `player123` and anvil's 3rd account (`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`) as POST to `game/{gameId}/player` and just print "OK"

# Mint an item

Get mint data from the backend, then send a transaction with that date, including the permit.

## Make sure the contract is deployed

`yarn tsx 3_check_contract_health.ts` will print out address, name and symbol

## Get mint data; send transaction as a user

`yarn tsx 4_mint_item.ts` will:

1. Retrieve data for mint from the GET `/items/1/mint`
2. Print it out
3. Try to send a proper transaction to the contract, trying to mint with permit
4. Await tx
5. Verify that the nft was deployed by calling its token uri method and printing out its token uri
6. Try to GET the token uri and print the json that the backend returns

# Monitor blockchain events

To automatically track when NFTs are minted on the blockchain, you can use the listener service. This service monitors Transfer events from the contract and updates the database when NFTs are minted.

## Run the listener service

You can run the listener service separately:

```sh
yarn listener
```

## Run both server and listener

To run both the API server and the blockchain listener together:

```sh
yarn dev:all
```

# Transfer item

```sh
FROM=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC TO=0x90F79bf6EB2c4f870365E785982E1f101E93b906 TOKEN_ID=1 NFT_ADDRESS=0x588758d8a0Ad1162A6294f3C274753137E664aE0 forge script script/TransferGameNFT.s.sol:TransferGameNFT --rpc-url http://localhost:8011 --broadcast --zksync
```

# Total shell cmd list

```sh
anvil-zksync
yarn dev
yarn listener

cd ../contracts
# On local anvil:
export OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export SIGNER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
forge script script/DeployGameNFT.s.sol:DeployGameNFT --rpc-url http://localhost:8011 --broadcast --zksync
# If xsolla sepolia testnet:
export OWNER_PRIVATE_KEY=0x...
export SIGNER_ADDRESS=0x...
forge script script/DeployGameNFT.s.sol:DeployGameNFT --rpc-url https://zkrpc.xsollazk.com --broadcast --zksync
cd ../server

yarn tsx 0_seed_db.ts
yarn tsx 1_create_item.ts
yarn tsx 2_link_user.ts
yarn tsx 3_check_contract_health.ts
yarn tsx 4_mint_item.ts
```
