// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/GameNFT.sol";

contract GameNFTTest is Test {
    GameNFT public nft;
    address public owner = address(1);
    address public user = address(2);
    
    string public constant NAME = "Game Asset NFT";
    string public constant SYMBOL = "GAME";
    string public constant BASE_URI = "https://metadata.example.com/";
    uint256 public constant MAX_SUPPLY = 10000;
    
    function setUp() public {
        vm.startPrank(owner);
        nft = new GameNFT(NAME, SYMBOL, BASE_URI, MAX_SUPPLY);
        vm.stopPrank();
    }
    
    function testInitialState() public view {
        assert(keccak256(abi.encodePacked(nft.name())) == keccak256(abi.encodePacked(NAME)));
        assert(keccak256(abi.encodePacked(nft.symbol())) == keccak256(abi.encodePacked(SYMBOL)));
        assert(nft.totalSupply() == 0);
        assert(nft.maxSupply() == MAX_SUPPLY);
    }
    
    function testMintNFT() public {
        string memory tokenURI = "metadata/1.json";
        uint8 rarity = 3;
        
        vm.startPrank(owner);
        uint256 tokenId = nft.mintNFT(user, tokenURI, rarity);
        vm.stopPrank();
        
        assertEq(tokenId, 0);
        assertEq(nft.totalSupply(), 1);
        assertEq(nft.tokenRarity(tokenId), rarity);
        assertEq(nft.tokenURI(tokenId), string(abi.encodePacked(BASE_URI, tokenURI)));
        assertEq(nft.ownerOf(tokenId), user);
    }
    
    function test_RevertWhen_NonOwnerMints() public {
        string memory tokenURI = "metadata/1.json";
        vm.prank(user);
        vm.expectRevert();
        nft.mintNFT(user, tokenURI, 3);
    }
    
    function test_RevertWhen_InvalidRarity() public {
        string memory tokenURI = "metadata/1.json";
        vm.startPrank(owner);
        vm.expectRevert("Rarity must be between 1 and 5");
        nft.mintNFT(user, tokenURI, 6);
        vm.stopPrank();
    }
    
    function testSetBaseURI() public {
        string memory newBaseURI = "https://new-metadata.example.com/";
        
        vm.prank(owner);
        nft.setBaseURI(newBaseURI);
        
        // Mint an NFT to test the new base URI
        string memory tokenURI = "metadata/1.json";
        vm.prank(owner);
        uint256 tokenId = nft.mintNFT(user, tokenURI, 3);
        
        assertEq(nft.tokenURI(tokenId), string(abi.encodePacked(newBaseURI, tokenURI)));
    }
} 