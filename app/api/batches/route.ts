import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { buildWellHashes } from "@/lib/metadata/hashing";
import { assignNftTier } from "@/lib/tiers/assignment";
import { mintBatchSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const wells = mintBatchSchema.parse(payload.wells);
    const records = wells.map((well, index) => {
      const nftTier = assignNftTier(well, undefined, index, payload.tierOverrides?.[well.apiNumber]);
      return {
        ...well,
        ...buildWellHashes(well),
        nftTier,
        mintStatus: "validated" as const,
        artStatus: nftTier === "registry_only" ? "not_required" as const : "pending" as const
      };
    });

    return NextResponse.json({
      status: "validated",
      invariant: "1 verified plugged well = 1 CAPIT token",
      recordCount: records.length,
      capitTokensAuthorized: records.length,
      records
    });
  } catch (error) {
    return jsonError(error);
  }
}
