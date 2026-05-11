# CAPIT NFT Launch Sanity Check

## Verdict

The hybrid NFT approach is strategically sound if the layers remain visibly separate:

1. CAPIT token = the public counter for verified plugged/capped wells.
2. Registry NFTs = audit/provenance receipts.
3. Premium NFTs = selected storytelling collectibles.
4. Genesis NFTs = small launch artifacts.

This avoids the trap of trying to sell 1.8M generic well NFTs as collectibles.

## Corrections made in v1.1

### 1. Genesis cannot be automatic just because a row is in the launch batch

The original scaffold treated `is_launch_batch=true` as enough to create `genesis_candidate` records. That would accidentally dilute the scarce Genesis layer.

v1.1 requires both:

```txt
is_launch_batch=true
is_genesis_candidate=true
```

### 2. String booleans now parse safely

CSV values arrive as strings. In JavaScript, `Boolean("false")` is `true`, which can quietly corrupt tier assignment.

v1.1 uses explicit boolean parsing for `true/false`, `yes/no`, and `1/0`.

### 3. Premium and Genesis metadata are separate from Registry metadata

Premium and Genesis NFTs are overlays. They should not be forced to reuse the Registry token URI. The reference `OracleMinter` now supports separate URIs:

- `registryMetadataURI`
- `premiumMetadataURI`
- `genesisMetadataURI`

### 4. The Ideogram adapter was updated

The provider adapter now uses the Ideogram v3 multipart API shape and keeps the endpoint configurable through `IDEOGRAM_API_URL`.

### 5. Safe preparation is now gated by dry-run approval

`/api/safe` rejects production calldata unless the request says the dry-run passed. This is not a complete security control yet, but it makes the intended workflow harder to bypass in the scaffold.

## Remaining launch risks

### Admin authentication is still a shell

Before mainnet, wire real auth, role checks, audit logs, and a signer/operator permission model.

### No real PostgreSQL persistence yet

The schema exists, but the API routes currently validate and transform data only. The next implementation step is Supabase/Postgres persistence.

### No Safe Transaction Service integration yet

The Safe helper prepares transaction-shaped data. It does not yet create, sign, or submit Safe transactions.

### Smart contracts need Hardhat integration

The contracts are reference contracts. Port them into the existing CAPIT Hardhat workspace and test them against the deployed CAPIT token and OracleMinter assumptions.

### Art generation needs cost controls

Automated art generation should be rate-limited and restricted to Premium/Genesis candidates. Registry receipts should use scalable procedural or placeholder art until there is a strong reason to generate at scale.
