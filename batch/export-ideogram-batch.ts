import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "node:querystring";
import { readWellCsv, enrichWells } from "../lib/ingestion";
import { genesisPrompt, premiumPrompt, registryPrompt } from "../lib/art/prompts";
import type { HashedWellRecord } from "../types/capit";

type CsvCell = string | number | boolean;
type CsvRow = CsvCell[];

const input = process.argv[2] ?? "sample-data/sample-well-batch.csv";
const outputDir = process.argv[3] ?? "dist/ideogram";
mkdirSync(outputDir, { recursive: true });

const records: HashedWellRecord[] = enrichWells(readWellCsv(input));
const header: CsvRow = ["prompt", "aspect_ratio", "style", "api_number", "state", "county", "nft_tier", "negative_prompt"];
const rows: CsvRow[] = records.map((record: HashedWellRecord): CsvRow => {
  const prompt = record.nftTier === "genesis_candidate" ? genesisPrompt(record) : record.nftTier === "premium_candidate" ? premiumPrompt(record) : registryPrompt(record);
  return [prompt, "1:1", record.nftTier === "registry_only" ? "registry" : "premium", record.apiNumber, record.state, record.county, record.nftTier, "cartoon, childish, fantasy oil rig, fake carbon credit claim"];
});

function escapeCsvCell(value: CsvCell): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

for (let i = 0; i < rows.length; i += 500) {
  const chunk = rows.slice(i, i + 500);
  const csv = [header, ...chunk]
    .map((row: CsvRow) => row.map((value: CsvCell) => escapeCsvCell(value)).join(","))
    .join("\n");
  writeFileSync(join(outputDir, `ideogram-prompts-${Math.floor(i / 500) + 1}.csv`), csv);
}

console.log(stringify({ exported: rows.length, outputDir }));