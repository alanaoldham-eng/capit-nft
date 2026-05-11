import { createHash } from "node:crypto";
import type { PluggedWellRecord, WellHashes } from "@/types/capit";

export function sha256Hex(value: string): string {
  return `0x${createHash("sha256").update(value).digest("hex")}`;
}

export function normalizeApiNumber(apiNumber: string): string {
  return apiNumber.trim().replace(/\s+/g, "").toUpperCase();
}

export function canonicalWellPayload(well: PluggedWellRecord): string {
  return JSON.stringify({
    apiNumber: normalizeApiNumber(well.apiNumber),
    state: well.state.trim().toUpperCase(),
    county: well.county.trim(),
    operator: well.operator.trim(),
    plugDate: well.plugDate,
    sourceUrl: well.sourceUrl.trim(),
    latitude: well.latitude ?? null,
    longitude: well.longitude ?? null,
    pluggingCostEstimateUsd: well.pluggingCostEstimateUsd ?? null,
    methaneReductionEstimateTonsCo2e: well.methaneReductionEstimateTonsCo2e ?? null,
    depthFeet: well.depthFeet ?? null,
    isOffshore: Boolean(well.isOffshore)
  });
}

export function buildWellHashes(well: PluggedWellRecord): WellHashes {
  const canonicalPayload = canonicalWellPayload(well);
  const apiNumber = normalizeApiNumber(well.apiNumber);
  return {
    apiNumberHash: sha256Hex(`${well.state.toUpperCase()}:${apiNumber}`),
    wellIdHash: sha256Hex(`${well.state.toUpperCase()}:${apiNumber}:${well.plugDate}`),
    proofHash: sha256Hex(canonicalPayload)
  };
}
