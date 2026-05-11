import { z } from "zod";

const booleanish = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "t", "yes", "y", "1"].includes(normalized)) return true;
    if (["false", "f", "no", "n", "0", ""].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") return undefined;
  return value;
}, z.coerce.number());

export const pluggedWellSchema = z.object({
  apiNumber: z.string().trim().min(3),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  county: z.string().trim().min(1),
  operator: z.string().trim().min(1),
  plugDate: z.string().date(),
  sourceUrl: z.string().url(),
  latitude: optionalNumber.pipe(z.number().min(-90).max(90)).optional(),
  longitude: optionalNumber.pipe(z.number().min(-180).max(180)).optional(),
  pluggingCostEstimateUsd: optionalNumber.pipe(z.number().nonnegative()).optional(),
  methaneReductionEstimateTonsCo2e: optionalNumber.pipe(z.number().nonnegative()).optional(),
  depthFeet: optionalNumber.pipe(z.number().int().nonnegative()).optional(),
  isOffshore: booleanish.optional().default(false),
  isLaunchBatch: booleanish.optional().default(false),
  isGenesisCandidate: booleanish.optional().default(false),
  region: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

export const mintBatchSchema = z.array(pluggedWellSchema).min(1).superRefine((wells, ctx) => {
  const seen = new Set<string>();
  wells.forEach((well, index) => {
    const key = `${well.state}:${well.apiNumber}`;
    if (seen.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate API number in batch: ${key}`, path: [index, "apiNumber"] });
    }
    seen.add(key);
  });
});
