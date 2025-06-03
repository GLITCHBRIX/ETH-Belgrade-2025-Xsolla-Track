import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// Configure the blockchain client based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Use Sepolia testnet for development, mainnet for production
const chain = isDevelopment ? sepolia : mainnet;

// Create a public client for read operations
export const publicClient = createPublicClient({
  chain,
  transport: http(
    isDevelopment 
      ? process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org' 
      : process.env.MAINNET_RPC_URL
  ),
});

/**
 * Verify if an address is valid
 * @param address Ethereum address to validate
 * @returns boolean indicating if address is valid
 */
export const isValidAddress = (address: string): boolean => {
  // Simple regex check for Ethereum address format (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

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
      abi: [{
        name: 'tokenURI',
        inputs: [{ type: 'uint256', name: 'tokenId' }],
        outputs: [{ type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      }],
      functionName: 'tokenURI',
      args: [tokenId]
    });
    
    return data as string;
  } catch (error) {
    console.error('Error fetching token URI:', error);
    return null;
  }
}; 