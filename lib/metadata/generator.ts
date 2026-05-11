import type { HashedWellRecord, NftAttribute, OpenSeaMetadata } from "@/types/capit";

function dateToOpenSeaSeconds(date: string): number {
  const parsed = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
}

function compactAttributes(attributes: Array<NftAttribute | undefined>): NftAttribute[] {
  return attributes.filter((attribute): attribute is NftAttribute => Boolean(attribute));
}

function baseAttributes(well: HashedWellRecord): NftAttribute[] {
  return compactAttributes([
    { trait_type: "NFT Tier", value: well.nftTier },
    { trait_type: "State", value: well.state },
    { trait_type: "County", value: well.county },
    well.region ? { trait_type: "Region", value: well.region } : undefined,
    { trait_type: "Operator", value: well.operator },
    { trait_type: "Plug Date", value: dateToOpenSeaSeconds(well.plugDate), display_type: "date" },
    { trait_type: "Proof Hash", value: well.proofHash },
    { trait_type: "Well ID Hash", value: well.wellIdHash },
    well.latitude !== undefined ? { trait_type: "Latitude", value: well.latitude, display_type: "number" } : undefined,
    well.longitude !== undefined ? { trait_type: "Longitude", value: well.longitude, display_type: "number" } : undefined,
    well.pluggingCostEstimateUsd !== undefined ? { trait_type: "Plugging Cost Estimate USD", value: well.pluggingCostEstimateUsd, display_type: "number" } : undefined,
    well.methaneReductionEstimateTonsCo2e !== undefined ? { trait_type: "Methane Reduction Estimate tCO2e", value: well.methaneReductionEstimateTonsCo2e, display_type: "number" } : undefined,
    well.depthFeet !== undefined ? { trait_type: "Depth Feet", value: well.depthFeet, display_type: "number" } : undefined,
    { trait_type: "Offshore", value: Boolean(well.isOffshore) }
  ]);
}

export function generateRegistryMetadata(well: HashedWellRecord): OpenSeaMetadata {
  return {
    name: `CAPIT Registry Receipt — ${well.state}-${well.apiNumber}`,
    description: "Public environmental receipt for one verified plugged/capped U.S. oil or gas well. CAPIT uses a strict invariant: one verified plugged well permits exactly one CAPIT token mint. This registry NFT is an audit/provenance layer, not a carbon credit.",
    image: well.imageUri ?? "ipfs://placeholder-registry-map-art",
    external_url: `https://capit.eco/registry/${encodeURIComponent(well.apiNumber)}`,
    attributes: baseAttributes(well),
    background_color: "07111F",
    properties: {
      source_url: well.sourceUrl,
      api_number_hash: well.apiNumberHash,
      proof_hash: well.proofHash,
      one_well_one_capit_token: true,
      is_carbon_credit: false
    }
  };
}

export function generatePremiumMetadata(well: HashedWellRecord, imageUri: string): OpenSeaMetadata {
  return {
    name: `CAPIT Premium Well Story — ${well.county}, ${well.state}`,
    description: "Curated CAPIT collectible artwork for a selected plugged well with high narrative, environmental, historical, or community significance. Premium NFTs are storytelling overlays and do not change the one-well-one-CAPIT-token supply rule.",
    image: imageUri,
    external_url: `https://capit.eco/gallery/premium/${encodeURIComponent(well.apiNumber)}`,
    attributes: [
      ...baseAttributes(well),
      { trait_type: "Collection Layer", value: "Premium" },
      { trait_type: "Visual Theme", value: "Industrial Americana GIS" }
    ],
    background_color: "07111F",
    properties: {
      source_url: well.sourceUrl,
      registry_api_number_hash: well.apiNumberHash,
      registry_proof_hash: well.proofHash,
      overlay_only: true,
      extra_capit_supply: 0
    }
  };
}

export function generateGenesisMetadata(well: HashedWellRecord, imageUri: string): OpenSeaMetadata {
  return {
    name: `CAPIT Genesis Archive — ${well.state}-${well.apiNumber}`,
    description: "Scarce CAPIT launch artifact from the Genesis set. Genesis NFTs are community collectibles and never alter the CAPIT mint ratio of exactly one token per verified plugged/capped well.",
    image: imageUri,
    external_url: `https://capit.eco/gallery/genesis/${encodeURIComponent(well.apiNumber)}`,
    attributes: [
      ...baseAttributes(well),
      { trait_type: "Collection Layer", value: "Genesis" },
      { trait_type: "Launch Artifact", value: true },
      { trait_type: "Visual Theme", value: "Founder-grade plugged well archive" }
    ],
    background_color: "07111F",
    properties: {
      source_url: well.sourceUrl,
      registry_api_number_hash: well.apiNumberHash,
      registry_proof_hash: well.proofHash,
      overlay_only: true,
      extra_capit_supply: 0
    }
  };
}
