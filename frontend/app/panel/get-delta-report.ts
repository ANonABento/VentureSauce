import { getReport } from "@/lib/api";
import type { DeltaReport } from "@/lib/types";

/** Either the page the analyst is browsing, or a company name they typed. */
export type DeltaQuery = { url?: string; company?: string; companyId?: string };

/** The panel's report data, from the backend's /api/delta. Rejects when the company isn't in the inbox yet. */
export async function getDeltaReport(query: DeltaQuery): Promise<DeltaReport> {
  return getReport(query);
}

export type DetectedCompany = { name?: string; domain: string };

/**
 * What the panel can tell from the page URL before any comparison runs.
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
  };
}
