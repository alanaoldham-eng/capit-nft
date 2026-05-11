import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { simulateBaseSepoliaMint } from "@/lib/blockchain/dry-run";
import { buildWellHashes } from "@/lib/metadata/hashing";
import { assignNftTier } from "@/lib/tiers/assignment";
import { mintBatchSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const wells = mintBatchSchema.parse(payload.wells);
    const previouslyMintedHashes = new Set<string>(payload.previouslyMintedApiHashes ?? []);
    const records = wells.map((well, index) => {
      const nftTier = assignNftTier(well, undefined, index);
      return {
        ...well,
        ...buildWellHashes(well),
        nftTier,
        mintStatus: "validated" as const,
        artStatus: nftTier === "registry_only" ? "not_required" as const : "pending" as const
      };
    });
    return NextResponse.json(simulateBaseSepoliaMint(records, previouslyMintedHashes));
  } catch (error) {
    return jsonError(error);
  }
}
