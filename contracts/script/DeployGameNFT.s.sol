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

        // Assertively derive the signer address from the SIGNER_PRIVATE_KEY environment variable
        uint256 signerPrivateKey = vm.envUint("SIGNER_PRIVATE_KEY");
        address signer = vm.addr(signerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        GameNFT nft = new GameNFT(name, symbol, baseURI, signer);

        vm.stopBroadcast();

        console.log("GameNFT deployed at:", address(nft));
        console.log("Authorized signer:", signer);
    }
}
