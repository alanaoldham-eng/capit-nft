import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { buildWellHashes } from "@/lib/metadata/hashing";
import { generateGenesisMetadata, generatePremiumMetadata, generateRegistryMetadata } from "@/lib/metadata/generator";
import { assignNftTier } from "@/lib/tiers/assignment";
import { pluggedWellSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const well = pluggedWellSchema.parse(payload.well);
    const nftTier = assignNftTier(well, undefined, 0, payload.nftTierOverride);
    const record = {
      ...well,
      ...buildWellHashes(well),
      nftTier,
      mintStatus: "validated" as const,
      artStatus: nftTier === "registry_only" ? "not_required" as const : "pending" as const,
      imageUri: payload.imageUri as string | undefined
    };
    const metadata = record.nftTier === "genesis_candidate"
      ? generateGenesisMetadata(record, record.imageUri ?? "ipfs://pending-genesis-art")
      : record.nftTier === "premium_candidate"
        ? generatePremiumMetadata(record, record.imageUri ?? "ipfs://pending-premium-art")
        : generateRegistryMetadata(record);
    return NextResponse.json(metadata);
  } catch (error) {
    return jsonError(error);
  }
}
