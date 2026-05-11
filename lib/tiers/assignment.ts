import type { NftTier, PluggedWellRecord, TierAssignmentContext } from "@/types/capit";

export const DEFAULT_TIER_CONTEXT: TierAssignmentContext = {
  methanePremiumThresholdTonsCo2e: 500,
  knownFirstPluggedWellByState: {},
  launchBatchGenesisLimit: 25
};

export function isPremiumSignal(well: PluggedWellRecord, context: TierAssignmentContext = DEFAULT_TIER_CONTEXT): boolean {
  const firstWellApi = context.knownFirstPluggedWellByState[well.state.toUpperCase()];
  return Boolean(
    (firstWellApi && firstWellApi === well.apiNumber) ||
    (well.methaneReductionEstimateTonsCo2e ?? 0) >= context.methanePremiumThresholdTonsCo2e ||
    well.isOffshore ||
    (well.depthFeet ?? 0) >= 15000
  );
}

export function assignNftTier(
  well: PluggedWellRecord,
  context: TierAssignmentContext = DEFAULT_TIER_CONTEXT,
  batchIndex = 0,
  override?: NftTier
): NftTier {
  if (override) return override;

  // Blind-spot guard: launch batch alone is only eligibility. Genesis must be explicitly curated/approved.
  if (well.isGenesisCandidate && well.isLaunchBatch && batchIndex < context.launchBatchGenesisLimit) {
    return "genesis_candidate";
  }

  if (isPremiumSignal(well, context)) {
    return "premium_candidate";
  }

  return "registry_only";
}
