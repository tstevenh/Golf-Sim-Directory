#!/usr/bin/env node --import tsx
import { db } from "../lib/db";
import { dedupeSoftwareSlugs, extractSoftwareSlugsFromComprehensiveData } from "../lib/software-slugs";

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
  console.log(`Backfill softwareSlugs${options.dryRun ? " (dry-run)" : ""}`);

  const venues = await db.venue.findMany({
    select: {
      id: true,
      name: true,
      comprehensiveData: true,
      softwareSlugs: true,
    },
    ...(options.limit ? { take: options.limit } : {}),
  });
  console.log(`Total venues to check: ${venues.length}`);

  let checked = 0;
  let updated = 0;
  let unchanged = 0;
  const updates: Array<{ id: string; nextSlugs: string[]; name: string; currentSlugs: string[] }> = [];
  const progressEvery = 25;

  for (const venue of venues) {
    checked += 1;
    const nextSlugs = dedupeSoftwareSlugs([
      ...(venue.softwareSlugs || []),
      ...extractSoftwareSlugsFromComprehensiveData(venue.comprehensiveData),
    ]);
    const currentSlugs = [...(venue.softwareSlugs || [])].sort();

    if (arraysEqual(currentSlugs, nextSlugs)) {
      unchanged += 1;
      continue;
    }

    updated += 1;
    updates.push({
      id: venue.id,
      nextSlugs,
      name: venue.name,
      currentSlugs,
    });

    if (updated <= 10) {
      console.log(`  ${venue.name}: [${currentSlugs.join(", ")}] -> [${nextSlugs.join(", ")}]`);
    }
    if (updated === 11) {
      console.log("  ...");
    }

    if (checked % progressEvery === 0) {
      console.log(`Progress: ${checked}/${venues.length} checked, ${updated} updated, ${unchanged} unchanged`);
    }
  }

  if (!options.dryRun && updates.length > 0) {
    const updateChunkSize = 100;
    let applied = 0;

    for (let i = 0; i < updates.length; i += updateChunkSize) {
      const chunk = updates.slice(i, i + updateChunkSize);
      try {
        await db.$transaction(
          chunk.map((item) =>
            db.venue.update({
              where: { id: item.id },
              data: { softwareSlugs: item.nextSlugs },
            })
          )
        );
        applied += chunk.length;
      } catch {
        for (const item of chunk) {
          await db.venue.update({
            where: { id: item.id },
            data: { softwareSlugs: item.nextSlugs },
          });
          applied += 1;
        }
      }
      console.log(`Applied updates: ${applied}/${updates.length}`);
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
    if (typeof (db as unknown as { $disconnect?: unknown }).$disconnect === "function") {
      await (db as unknown as { $disconnect: () => Promise<void> }).$disconnect();
    }
  });
