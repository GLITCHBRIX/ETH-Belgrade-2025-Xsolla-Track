import axios from "axios";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, createWalletClient, http } from "viem";
import { readContract, xsollaZK } from "./src/utils/blockchain";
import GameNFTABI from "../contracts/out/GameNFT.sol/GameNFT.json";
import type { MintingResponse } from "./src/item.routes";

// User wallet (account #2 from anvil)
const USER_PRIVATE_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const userAccount = privateKeyToAccount(USER_PRIVATE_KEY as `0x${string}`);

// Create wallet client for the user
const userWalletClient = createWalletClient({
  account: userAccount,
  chain: xsollaZK,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: xsollaZK,
  transport: http(),
});

async function main() {
  try {
    console.log("Step 1: Retrieving mint data from the API...");
    const response = await axios.get<MintingResponse>("http://localhost:3000/items/1/mint");
    const mintData = response.data;

    console.log("Mint data received:");
    console.log(JSON.stringify(mintData, null, 2));

    // Extract the data needed for minting
    const { contractAddress, permitData, signature } = mintData;
    const { tokenId, receiver, tokenURI, deadline } = permitData;

    let tokenURIFromContract: string = "http://localhost:3000/1";
    if (!tokenURIFromContract) {
      console.log("\nStep 3: Sending mint transaction...");
      const hash = await userWalletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: GameNFTABI.abi,
        functionName: "mintWithPermit",
        args: [BigInt(tokenId), receiver, tokenURI, BigInt(deadline), signature],
      });

      console.log(`Transaction sent! Hash: ${hash}`);
      console.log("\nStep 4: Waiting for transaction confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });
    }
    console.log("Transaction confirmed!");

    console.log("\nStep 5: Verifying the NFT was minted...");
    tokenURIFromContract = await readContract(contractAddress, GameNFTABI.abi, "tokenURI", [BigInt(tokenId)]);

    console.log(`Token URI from contract: ${tokenURIFromContract}`);

    console.log("\nStep 6: Fetching the token metadata...");
    try {
      const metadataResponse = await axios.get(tokenURIFromContract);

      console.log("Token metadata:");
      console.log(JSON.stringify(metadataResponse.data, null, 2));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching metadata:", error.response?.status, error.response?.data);
      } else {
        console.error("Error fetching metadata:", error);
      }
    }

    console.log("\nMinting process completed successfully!");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
    } else {
      console.error("Error during minting process:", error);
    }
    process.exit(1);
  }
}

main();
