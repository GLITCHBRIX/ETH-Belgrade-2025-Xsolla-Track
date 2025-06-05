import { createPublicClient, http, defineChain } from "viem";

// Define the Xsolla ZK chain (anvil-zksync fork)
const anvilZKSync = defineChain({
  id: 260, // Chain ID from anvil-zksync output
  name: "anvil-zksync Local",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["http://localhost:8011"] },
    public: { http: ["http://localhost:8011"] },
  },
});
const xsollaZKSync = defineChain({
  id: 555272, // Chain ID from anvil-zksync output
  name: "Xsolla ZK Sepolia Testnet",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["https://zkrpc.xsollazk.com"] },
    public: { http: ["https://zkrpc.xsollazk.com"] },
  },
});

export const currentChain = xsollaZKSync;

// Use local anvil-zksync instance
const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(),
});

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
