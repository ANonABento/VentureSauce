import type { DeltaReport } from "@/lib/types";

// Fictional company with no filing found. The contract has no explicit
// "no filing" flag, so this is expressed as: no CIK and no row with a filed claim.
export const mossgateLabs: DeltaReport = {
  company: {
    name: "Mossgate Labs",
    domain: "mossgate.example",
  },
  generatedAt: "2026-10-10T16:30:00Z",
  headline: "No Form D on file for this company.",
  rows: [],
};
