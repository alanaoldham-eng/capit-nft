// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract PluggedWellRegistry is AccessControl {
    bytes32 public constant ORACLE_MINTER_ROLE = keccak256("ORACLE_MINTER_ROLE");

    struct WellProof {
        bytes32 apiNumberHash;
        bytes32 wellIdHash;
        bytes32 proofHash;
        string metadataURI;
        uint256 recordedAt;
    }

    mapping(bytes32 => WellProof) public wellProofsByApiHash;
    mapping(bytes32 => bool) public mintedApiHashes;
    mapping(bytes32 => bool) public mintedWellIdHashes;
    mapping(bytes32 => bool) public usedProofHashes;

    event WellProofRecorded(bytes32 indexed apiNumberHash, bytes32 indexed wellIdHash, bytes32 proofHash, string metadataURI);

    constructor(address admin) {
        require(admin != address(0), "CAPIT: zero admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function recordWellProof(
        bytes32 apiNumberHash,
        bytes32 wellIdHash,
        bytes32 proofHash,
        string calldata metadataURI
    ) external onlyRole(ORACLE_MINTER_ROLE) {
        require(apiNumberHash != bytes32(0), "CAPIT: missing API hash");
        require(wellIdHash != bytes32(0), "CAPIT: missing well hash");
        require(proofHash != bytes32(0), "CAPIT: missing proof hash");
        require(bytes(metadataURI).length > 0, "CAPIT: missing metadata URI");
        require(!mintedApiHashes[apiNumberHash], "CAPIT: duplicate API hash");
        require(!mintedWellIdHashes[wellIdHash], "CAPIT: duplicate well hash");
        require(!usedProofHashes[proofHash], "CAPIT: duplicate proof hash");

        mintedApiHashes[apiNumberHash] = true;
        mintedWellIdHashes[wellIdHash] = true;
        usedProofHashes[proofHash] = true;
        wellProofsByApiHash[apiNumberHash] = WellProof(apiNumberHash, wellIdHash, proofHash, metadataURI, block.timestamp);
        emit WellProofRecorded(apiNumberHash, wellIdHash, proofHash, metadataURI);
    }
}
