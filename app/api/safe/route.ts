import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { prepareOracleMinterSafeTransaction } from "@/lib/blockchain/safe";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { encodedMintCallData: string; dryRunPassed?: boolean };
    if (!payload.dryRunPassed) {
      return NextResponse.json({ error: "dry_run_required", message: "Run and approve the Base Sepolia dry-run before preparing production Safe calldata." }, { status: 409 });
    }
    if (!payload.encodedMintCallData?.startsWith("0x")) {
      return NextResponse.json({ error: "invalid_calldata" }, { status: 400 });
    }
    const oracleMinter = process.env.ORACLE_MINTER_ADDRESS ?? "0x0000000000000000000000000000000000000000";
    return NextResponse.json(prepareOracleMinterSafeTransaction(oracleMinter, payload.encodedMintCallData));
  } catch (error) {
    return jsonError(error, 500);
  }
}
