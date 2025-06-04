import { createPublicClient, http, defineChain, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../config";

// Define the Xsolla ZK chain (anvil-zksync fork)
export const xsollaZK = defineChain({
  id: 260, // Chain ID from anvil-zksync output
  name: "Xsolla ZK Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://localhost:8011"],
    },
    public: {
      http: ["http://localhost:8011"],
    },
  },
});

// Use local anvil-zksync instance
export const publicClient = createPublicClient({
  chain: xsollaZK,
  transport: http(),
});

// Use owner private key from environment variables with config validation
const OWNER_PRIVATE_KEY = env.OWNER_PRIVATE_KEY;

// Create account from private key
export const testAccount = privateKeyToAccount(OWNER_PRIVATE_KEY as `0x${string}`);

// Create wallet client for transactions (using the test account)
export const walletClient = createWalletClient({
  account: testAccount,
  chain: xsollaZK,
  transport: http(),
});

/**
 * Get NFT metadata from a contract
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID
 * @returns The token URI if available
 */
export const getTokenURI = async (contractAddress: string, tokenId: bigint): Promise<string | null> => {
  try {
    // This is a simplified example - in a real app, you'd use the proper ABI
    // and handle different ERC721/ERC1155 standards
    const data = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          name: "tokenURI",
          inputs: [{ type: "uint256", name: "tokenId" }],
          outputs: [{ type: "string" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "tokenURI",
      args: [tokenId],
    });

    return data as string;
  } catch (error) {
    console.error("Error fetching token URI:", error);
    return null;
  }
};

/**
 * Deploy a contract to the local Xsolla ZK chain
 * @param abi The contract ABI
 * @param bytecode The contract bytecode
 * @param constructorArgs The constructor arguments (if any)
 * @returns The deployed contract address
 */
export const deployContract = async (
  abi: any,
  bytecode: `0x${string}`,
  constructorArgs: any[] = []
): Promise<`0x${string}`> => {
  try {
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: constructorArgs,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error("Contract deployment failed");
    }

    console.log(`Contract deployed at: ${receipt.contractAddress}`);
    return receipt.contractAddress;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
};

/**
 * Get the balance of an address on the Xsolla ZK chain
 * @param address The address to check
 * @returns The balance in ETH
 */
export const getBalance = async (address: string): Promise<string> => {
  const balance = await publicClient.getBalance({
    address: address as `0x${string}`,
  });

  return (Number(balance) / 1e18).toString();
};

/**
 * Send a transaction to a contract on the Xsolla ZK chain
 * @param contractAddress The contract address
 * @param abi The contract ABI (or just the function ABI)
 * @param functionName The function name to call
 * @param args The function arguments
 * @param value The ETH value to send (optional)
 * @returns The transaction hash
 */
export const writeContract = async (
  contractAddress: string,
  abi: any,
  functionName: string,
  args: any[] = [],
  value?: bigint
): Promise<`0x${string}`> => {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
      value,
    });

    console.log(`Transaction sent: ${hash}`);
    return hash;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
};

/**
 * Read data from a contract on the Xsolla ZK chain
 * @param contractAddress The contract address
 * @param abi The contract ABI (or just the function ABI)
 * @param functionName The function name to call
 * @param args The function arguments
 * @returns The function result
 */
export const readContract = async (
  contractAddress: string,
  abi: any,
  functionName: string,
  args: any[] = []
): Promise<any> => {
  try {
    const data = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
    });

    return data;
  } catch (error) {
    console.error(`Error reading ${functionName}:`, error);
    throw error;
  }
};
