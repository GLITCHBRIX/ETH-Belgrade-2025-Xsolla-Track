import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import type { TypedData, TypedDataDomain } from 'viem';

// Types for EIP-712 signing
interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

interface Permit {
  tokenId: number;
  receiver: `0x${string}`;
  tokenURI: string;
  nonce: number;
  deadline: number;
}

// Configure based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const chain = isDevelopment ? sepolia : mainnet;
const chainId = chain.id;

// Get private key from environment with fallback for development
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

// Create a wallet client for signing
const account = privateKeyToAccount(SIGNER_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain,
  transport: http()
});

/**
 * Signs a mint permit using EIP-712
 * 
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID to mint
 * @param receiver The recipient address
 * @param tokenURI The token URI
 * @param nonce A unique nonce for this signature
 * @param deadline Timestamp after which the signature is invalid
 * @returns The signature and the typed data
 */
export async function signMintPermit(
  contractAddress: string,
  tokenId: number,
  receiver: string,
  tokenURI: string,
  nonce: number,
  deadline: number
) {
  // Create domain data (EIP-712)
  const domain: TypedDataDomain = {
    name: 'GameNFT',
    version: '1',
    chainId,
    verifyingContract: contractAddress as `0x${string}`
  };

  // Define types for structured data
  const types = {
    Permit: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'tokenURI', type: 'string' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  // Create the permit data
  const permitData = {
    tokenId,
    receiver: receiver as `0x${string}`,
    tokenURI,
    nonce,
    deadline
  };

  try {
    // Sign the typed data
    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'Permit',
      message: permitData
    });

    return {
      domain,
      types,
      permitData,
      signature
    };
  } catch (error) {
    console.error('Error signing permit:', error);
    throw new Error('Failed to sign permit');
  }
}

/**
 * Generate a unique nonce
 * In production, this should use a proper nonce management system
 */
export function generateNonce(): number {
  return Math.floor(Date.now() * Math.random());
}

/**
 * Generate a deadline timestamp for a permit
 * @param validityInSeconds How long the permit should be valid for (in seconds)
 */
export function generateDeadline(validityInSeconds = 3600): number {
  return Math.floor(Date.now() / 1000) + validityInSeconds;
} 