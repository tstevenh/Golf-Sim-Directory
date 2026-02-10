#!/usr/bin/env node --import tsx
import { db } from "../lib/db";
import { extractHardwareBrandsFromSimulatorSystems } from "../lib/hardware-brands";

interface CliOptions {
  dryRun: boolean;
  limit?: number;
}

function parseArgs(): CliOptions {
  const options: CliOptions = { dryRun: false };
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--limit=")) {
      const parsed = Number(arg.split("=")[1]);
      if (!Number.isNaN(parsed) && parsed > 0) options.limit = parsed;
    }
  }
  return options;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function main() {
  const options = parseArgs();
  console.log(`Backfill hardwareBrands${options.dryRun ? " (dry-run)" : ""}`);

  const venues = await db.venue.findMany({
    select: {
      id: true,
      name: true,
      simulatorSystems: true,
      hardwareBrands: true,
    },
    ...(options.limit ? { take: options.limit } : {}),
  });
  console.log(`Total venues to check: ${venues.length}`);

  let checked = 0;
  let updated = 0;
  let unchanged = 0;
  const progressEvery = 25;

  for (const venue of venues) {
    checked += 1;
    const nextBrands = extractHardwareBrandsFromSimulatorSystems(venue.simulatorSystems);
    const currentBrands = [...(venue.hardwareBrands || [])].sort();

    if (arraysEqual(currentBrands, nextBrands)) {
      unchanged += 1;
      continue;
    }

    if (!options.dryRun) {
      await db.venue.update({
        where: { id: venue.id },
        data: { hardwareBrands: nextBrands },
      });
    }

    updated += 1;
    if (updated <= 10) {
      console.log(`  ${venue.name}: [${currentBrands.join(", ")}] -> [${nextBrands.join(", ")}]`);
    }
    if (updated === 11) {
      console.log("  ...");
    }

    if (checked % progressEvery === 0) {
      console.log(`Progress: ${checked}/${venues.length} checked, ${updated} updated, ${unchanged} unchanged`);
    }
  }

  console.log(`Checked: ${checked}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
