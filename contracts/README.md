# GameNFT Contracts

Smart contracts for game asset NFTs with EIP-712 signature-based minting.

## Setup

```bash
# Install dependencies
forge install
```

## Build

```bash
forge build
```

## Test

```bash
forge test
```

## Deploy

Deploy NFT contract:

```bash
export OWNER_PRIVATE_KEY=0x...
export SIGNER_ADDRESS=0x...

# Local deployment
forge script script/DeployGameNFT.s.sol:DeployGameNFT --rpc-url http://localhost:8011 --broadcast --zksync

# Xsolla ZK deployment
forge script script/DeployGameNFT.s.sol:DeployGameNFT --rpc-url https://zkrpc.xsollazk.com --broadcast --zksync
```


## Interact with Contract

Transfer NFT:

```bash
export FROM=0x...
export TO=0x...
export TOKEN_ID=1
export NFT_ADDRESS=0x...
forge script script/TransferGameNFT.s.sol:TransferGameNFT --rpc-url http://localhost:8011 --broadcast  --zksync
```

## Contract Overview

- `GameNFT.sol`: ERC721 NFT with metadata support and signature-based minting
  - Implements EIP-712 for typed signature verification
  - Allows trusted off-chain signing for gasless minting approval

## Current contract on Xsolla Sepolia Testnet

https://x.la/explorer/address/0xef1F201957049c2Fb57bA48692b7AfAe9709A125

```log
[⠃] Using zksolc-1.5.15
[⠊] Compiling (zksync)
[⠒] Compiling 2 files with zksolc and solc 0.8.30
```
