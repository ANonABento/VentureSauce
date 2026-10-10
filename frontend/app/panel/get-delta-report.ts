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
const NOT_A_COMPANY =
  /(^|\.)(trycloudflare\.com|hf\.space|vercel\.app|google\.com|docsend\.com|notion\.so|slack\.com|outlook\.(com|office\.com)|linkedin\.com|dropbox\.com|box\.com|zoom\.us)$|^127\.0\.0\.1$/;

export function detectCompany(pageUrl: string | null): DetectedCompany | null {
  if (!pageUrl) return null;

  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return null;
  }
  // New-tab pages, chrome:// URLs and local hosts are not a company. Neither are tools an investor reads deals in
  // (mail, docs, our own demo desk and tunnels): the panel shows the inbox there instead of "nothing about mail.google.com".
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".") || NOT_A_COMPANY.test(url.hostname)) {
    return null;
  }

  return {
    domain: url.hostname.replace(/^www\./, ""),
  };
}
