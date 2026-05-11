# CAPIT NFT Architecture

CAPIT is designed as “America's plugged well registry meets crypto culture.” The architecture separates environmental counting from collectible scarcity.

## Strategic sanity check

The hybrid architecture is the right direction because it prevents the project from trying to turn every one of roughly 1.8 million possible wells into a speculative collectible. CAPIT remains the environmental counter. Registry NFTs are the audit receipts. Premium NFTs are selected stories. Genesis NFTs are scarce launch artifacts.

The biggest launch risk is not technical art generation. It is accidentally confusing the layers. The system must repeatedly show that Premium and Genesis NFTs are overlays and do not create extra CAPIT supply.

## Smart contracts

- `CAPITToken.sol` is the existing ERC-20 token in the broader CAPIT repo. It mints one whole CAPIT per verified plugged/capped well.
- `PluggedWellRegistry.sol` records API number hashes, well ID hashes, proof hashes, metadata URIs, and duplicate status.
- `RegistryNFT.sol` mints infrastructure receipts.
- `PremiumNFT.sol` mints curated collectible overlays for selected wells.
- `GenesisNFT.sol` mints scarce launch/community artifacts.
- `OracleMinter.sol` is called by the Safe, records proof hashes, prevents duplicates through the registry, mints one CAPIT token, and mints the requested NFT layer.

## NFT flows

### Registry NFT flow

Every verified well can receive one registry receipt. Art can be placeholder, procedural GIS, or a low-cost generated layout. Metadata prioritizes audit fields, proof hashes, source URL, and OpenSea compatibility.

### Premium NFT flow

Only curated wells become Premium NFT candidates. Rules identify high methane estimates, first-in-state wells, offshore wells, deep wells, and manually promoted records. Premium art uses cinematic GIS, industrial Americana, methane visualization, and Base-chain motifs.

### Genesis NFT flow

Genesis candidates are a small launch set. In v1.1, Genesis assignment requires explicit `is_genesis_candidate=true`; `is_launch_batch=true` alone is not enough. This protects scarcity and avoids accidentally turning the first monthly upload into a giant Genesis flood.

## Data pipeline

Spreadsheet ingestion normalizes rows, validates schema, computes hashes, assigns tiers, creates metadata, creates art jobs, uploads assets, dry-runs on Base Sepolia, prepares Safe calldata, and records immutable audit events.

## Current scaffold boundaries

- The Next.js UI is a working shell, not a complete admin product.
- API routes validate and transform data but do not yet persist to PostgreSQL.
- Solidity contracts are reference contracts to port into the existing Hardhat workspace.
- Ideogram integration is implemented as a provider adapter and manual CSV exporter, but production needs retry, storage, and cost controls.
