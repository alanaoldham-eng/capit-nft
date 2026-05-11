// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICAPITToken {
    function mint(address to, uint256 amount) external;
}

interface IPluggedWellRegistry {
    function recordWellProof(bytes32 apiNumberHash, bytes32 wellIdHash, bytes32 proofHash, string calldata metadataURI) external;
}

interface ICAPITNft {
    function safeMint(address to, string calldata tokenURI) external returns (uint256);
}

/// @notice Reference OracleMinter architecture for the CAPIT NFT layer.
/// @dev Production execution should be restricted to the Safe address. One well always mints exactly one CAPIT token.
contract OracleMinter {
    enum NftTier { RegistryOnly, PremiumCandidate, GenesisCandidate }

    struct MintRequest {
        address recipient;
        bytes32 apiNumberHash;
        bytes32 wellIdHash;
        bytes32 proofHash;
        string registryMetadataURI;
        string premiumMetadataURI;
        string genesisMetadataURI;
        NftTier nftTier;
    }

    uint256 public constant ONE_CAPIT_TOKEN = 1 ether;

    address public immutable safe;
    ICAPITToken public immutable capitToken;
    IPluggedWellRegistry public immutable registry;
    ICAPITNft public immutable registryNft;
    ICAPITNft public immutable premiumNft;
    ICAPITNft public immutable genesisNft;

    event VerifiedWellMinted(
        bytes32 indexed apiNumberHash,
        bytes32 indexed wellIdHash,
        bytes32 proofHash,
        NftTier nftTier,
        uint256 capitAmount,
        uint256 registryTokenId,
        uint256 overlayTokenId
    );

    modifier onlySafe() {
        require(msg.sender == safe, "CAPIT: Safe only");
        _;
    }

    constructor(
        address safe_,
        address capitToken_,
        address registry_,
        address registryNft_,
        address premiumNft_,
        address genesisNft_
    ) {
        require(safe_ != address(0), "CAPIT: zero Safe");
        require(capitToken_ != address(0), "CAPIT: zero token");
        require(registry_ != address(0), "CAPIT: zero registry");
        require(registryNft_ != address(0), "CAPIT: zero registry NFT");
        require(premiumNft_ != address(0), "CAPIT: zero premium NFT");
        require(genesisNft_ != address(0), "CAPIT: zero genesis NFT");
        safe = safe_;
        capitToken = ICAPITToken(capitToken_);
        registry = IPluggedWellRegistry(registry_);
        registryNft = ICAPITNft(registryNft_);
        premiumNft = ICAPITNft(premiumNft_);
        genesisNft = ICAPITNft(genesisNft_);
    }

    function mintVerifiedWell(MintRequest calldata request) external onlySafe {
        _mintVerifiedWell(request);
    }

    function _mintVerifiedWell(MintRequest calldata request) internal {
        require(request.recipient != address(0), "CAPIT: zero recipient");
        require(request.apiNumberHash != bytes32(0), "CAPIT: missing API hash");
        require(request.wellIdHash != bytes32(0), "CAPIT: missing well hash");
        require(request.proofHash != bytes32(0), "CAPIT: missing proof hash");
        require(bytes(request.registryMetadataURI).length > 0, "CAPIT: missing registry URI");

        registry.recordWellProof(request.apiNumberHash, request.wellIdHash, request.proofHash, request.registryMetadataURI);
        capitToken.mint(request.recipient, ONE_CAPIT_TOKEN);

        uint256 registryTokenId = registryNft.safeMint(request.recipient, request.registryMetadataURI);
        uint256 overlayTokenId = 0;

        if (request.nftTier == NftTier.PremiumCandidate) {
            require(bytes(request.premiumMetadataURI).length > 0, "CAPIT: missing premium URI");
            overlayTokenId = premiumNft.safeMint(request.recipient, request.premiumMetadataURI);
        } else if (request.nftTier == NftTier.GenesisCandidate) {
            require(bytes(request.genesisMetadataURI).length > 0, "CAPIT: missing genesis URI");
            overlayTokenId = genesisNft.safeMint(request.recipient, request.genesisMetadataURI);
        }

        emit VerifiedWellMinted(
            request.apiNumberHash,
            request.wellIdHash,
            request.proofHash,
            request.nftTier,
            ONE_CAPIT_TOKEN,
            registryTokenId,
            overlayTokenId
        );
    }

    function batchMintVerifiedWells(MintRequest[] calldata requests) external onlySafe {
        for (uint256 i = 0; i < requests.length; i++) {
            _mintVerifiedWell(requests[i]);
        }
    }
}
