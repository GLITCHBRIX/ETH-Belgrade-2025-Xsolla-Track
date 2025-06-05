// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/GameNFT.sol";

contract DeployGameNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");

        // NFT configuration
        string memory name = "Minecraft Private Property NFT";
        string memory symbol = "MPPNFT";
        string memory baseURI = "http://localhost:3000/";

        address signer = vm.envAddress("SIGNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        GameNFT nft = new GameNFT(name, symbol, baseURI, signer);

        vm.stopBroadcast();

        console.log("GameNFT deployed at:", address(nft));
        console.log("Authorized signer:", signer);
    }
}
