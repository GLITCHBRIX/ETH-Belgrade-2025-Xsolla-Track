// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title GameNFT
 * @dev An ERC721 token for gaming assets with metadata support and signature-based minting
 */
contract GameNFT is ERC721URIStorage, Ownable, EIP712 {
    using ECDSA for bytes32;

    // Base URI for the tokens metadata
    string private _baseTokenURI;

    // Mapping to track minted tokens
    mapping(uint256 => bool) public mintedTokens;
    
    // Signer address authorized to sign minting permits
    address public permissionedSigner;

    // EIP-712 typehash for mint permits
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(uint256 tokenId,address receiver,string tokenURI,uint256 deadline)"
    );

    event NFTMinted(address to, uint256 tokenId, string tokenURI);
    event SignerUpdated(address newSigner);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address signer
    ) ERC721(name, symbol) Ownable(msg.sender) EIP712("GameNFT", "1") {
        _baseTokenURI = baseTokenURI;
        permissionedSigner = signer;
    }

    /**
     * @dev Sets a new permissioned signer that can authorize mints
     * @param newSigner The address of the new signer
     */
    function setSigner(address newSigner) public onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        permissionedSigner = newSigner;
        emit SignerUpdated(newSigner);
    }

    /**
     * @dev Mints a new NFT with a specific token ID.
     * @param to The address that will receive the minted token
     * @param tokenId The specific token ID to mint
     * @param tokenURI The token URI for the new token
     * @return The ID of the newly minted token
     */
    function mintNFT(address to, uint256 tokenId, string memory tokenURI) public onlyOwner returns (uint256) {
        require(!mintedTokens[tokenId], "Token ID already minted");
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        mintedTokens[tokenId] = true;
        
        emit NFTMinted(to, tokenId, tokenURI);
        
        return tokenId;
    }
    
    /**
     * @dev Mints a new NFT with server-side signature for authorization
     * @param tokenId The token ID to mint (also used as nonce)
     * @param receiver The address that will receive the minted token
     * @param tokenURI The token URI for the new token
     * @param deadline Timestamp after which the signature is invalid
     * @param signature The EIP-712 signature authorizing the mint
     */
    function mintWithPermit(
        uint256 tokenId,
        address receiver,
        string memory tokenURI,
        uint256 deadline,
        bytes memory signature
    ) public {
        require(block.timestamp <= deadline, "Permit expired");
        require(!mintedTokens[tokenId], "Token ID already minted");
        
        // Verify signature (using tokenId as nonce)
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                tokenId,
                receiver,
                keccak256(bytes(tokenURI)),
                deadline
            )
        );
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == permissionedSigner, "Invalid signature");
        
        // Mint the token
        _safeMint(receiver, tokenId);
        _setTokenURI(tokenId, tokenURI);
        mintedTokens[tokenId] = true;
        
        emit NFTMinted(receiver, tokenId, tokenURI);
    }
    
    /**
     * @dev Returns the base URI for the token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Updates the base URI for token metadata
     * @param newBaseURI The new base URI to set
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @dev Checks if a token ID has been minted
     * @param tokenId The token ID to check
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return mintedTokens[tokenId];
    }
} 