import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import type { TypedDataDomain } from "viem";
import { xsollaZK } from "./blockchain";
import { env } from "../config";

// Configure based on environment
const chainId = xsollaZK.id;

// Use signer private key from environment variables with config validation
const SIGNER_PRIVATE_KEY = env.SIGNER_PRIVATE_KEY;

// Create a wallet client for signing
const account = privateKeyToAccount(SIGNER_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: xsollaZK,
  transport: http(),
});

/**
 * Signs a mint permit using EIP-712
 *
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID to mint (also used as nonce)
 * @param receiver The recipient address
 * @param tokenURI The token URI
 * @param deadline Timestamp after which the signature is invalid
 * @returns The signature and the typed data
 */
export async function signMintPermit(
  contractAddress: string,
  tokenId: number,
  receiver: string,
  tokenURI: string,
  deadline: number
) {
  // Create domain data (EIP-712)
  const domain: TypedDataDomain = {
    name: "GameNFT", // Hardcoded in the contract's constructor
    version: "1",
    chainId,
    verifyingContract: contractAddress as `0x${string}`,
  };

  // Define types for structured data
  const types = {
    Permit: [
      { name: "tokenId", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "tokenURI", type: "string" },
      { name: "deadline", type: "uint256" },
    ],
  };

  // Create the permit data
  const permitData = {
    tokenId,
    receiver: receiver as `0x${string}`,
    tokenURI,
    deadline,
  };

  try {
    // Sign the typed data
    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: "Permit",
      message: permitData,
    });

    return {
      domain,
      types,
      permitData,
      signature,
    };
  } catch (error) {
    console.error("Error signing permit:", error);
    throw new Error("Failed to sign permit");
  }
}

/**
 * Generate a deadline timestamp for a permit
 * @param validityInSeconds How long the permit should be valid for (in seconds)
 */
export function generateDeadline(validityInSeconds = 3600): number {
  return Math.floor(Date.now() / 1000) + validityInSeconds;
}
