// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/GameNFT.sol";

contract TransferGameNFT is Script {
    function run() public {
        // Get from and to addresses from environment variables
        address from = vm.envAddress("FROM");
        address to = vm.envAddress("TO");

        // Get token ID to transfer
        uint256 tokenId = vm.envUint("TOKEN_ID");

        // Get the deployed NFT contract address
        address nftAddress = vm.envAddress("NFT_ADDRESS");
        GameNFT nft = GameNFT(nftAddress);

        vm.startBroadcast(from);

        // Execute the transfer
        // Note: This assumes the owner (transaction signer) has approval to transfer
        // If the FROM address is not the owner, the owner needs to have been approved first
        nft.transferFrom(from, to, tokenId);

        vm.stopBroadcast();

        console.log("GameNFT transferred:");
        console.log(" - Token ID:", tokenId);
        console.log(" - From:", from);
        console.log(" - To:", to);
        // Example shell command:
        // FROM=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC TO=0x90F79bf6EB2c4f870365E785982E1f101E93b906 TOKEN_ID=1 NFT_ADDRESS=0x588758d8a0Ad1162A6294f3C274753137E664aE0 \
        // forge script script/TransferGameNFT.s.sol:TransferGameNFT --rpc-url http://localhost:8011 --broadcast 
    }
}
