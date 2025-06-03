// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/GameNFT.sol";

contract DeployGameNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // NFT configuration
        string memory name = "Game Asset NFT";
        string memory symbol = "GAME";
        string memory baseURI = "https://metadata.example.com/";
        
        // The address that will be authorized to sign minting permits
        // In production, this would typically be a secure backend wallet
        address signer = vm.envOr("BACKEND_SIGNER", address(0x0000000000000000000000000000000000000001));
        
        vm.startBroadcast(deployerPrivateKey);
        
        GameNFT nft = new GameNFT(
            name,
            symbol,
            baseURI,
            signer
        );
        
        vm.stopBroadcast();
        
        console.log("GameNFT deployed at:", address(nft));
        console.log("Authorized signer:", signer);
    }
} 