import { findMockReport } from "@/lib/mock";
import type { DeltaReport } from "@/lib/types";

/** Either the page the analyst is browsing, or a company name they typed. */
export type DeltaQuery = { url?: string; company?: string };

const MOCK_DELAY_MS = 2400;

/**
 * The panel's only source of report data. Mock for now: swap the body for a
 * call to /api/delta once it exists. Rejects when the comparison fails.
 */
export async function getDeltaReport(query: DeltaQuery): Promise<DeltaReport> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const report = findMockReport(query);
  if (!report) throw new Error("No mock report for this company.");
  return report;
}

export type DetectedCompany = { name?: string; domain: string };

/**
 * What the panel can tell from the page URL before any comparison runs.
 * The name comes from the mocks for now; later from /api/resolve.
 */
export function detectCompany(pageUrl: string | null): DetectedCompany | null {
  if (!pageUrl) return null;

  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return null;
  }
  // New-tab pages, chrome:// URLs and local hosts are not a company.
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) {
    return null;
  }

  return {
    domain: url.hostname.replace(/^www\./, ""),
    name: findMockReport({ url: pageUrl })?.company.name,
  };
}
