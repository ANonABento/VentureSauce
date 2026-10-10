import type { DeltaReport } from "@/lib/types";
import { mossgateLabs } from "./mossgate-labs";
import { quillfeatherRobotics } from "./quillfeather-robotics";

/** Mock reports keyed by the slug used in /report/[slug]. */
export const mockReports: Record<string, DeltaReport> = {
  "quillfeather-robotics": quillfeatherRobotics,
  "mossgate-labs": mossgateLabs,
};

/** Look up a mock report by the page URL being browsed or by a typed company name. */
export function findMockReport(query: {
  url?: string;
  company?: string;
}): DeltaReport | undefined {
  const reports = Object.values(mockReports);

  if (query.url) {
    let host: string;
    try {
      host = new URL(query.url).hostname;
    } catch {
      return undefined;
    }
    return reports.find(
      ({ company }) =>
        host === company.domain || host.endsWith(`.${company.domain}`),
    );
  }

  const name = query.company?.trim().toLowerCase();
  if (!name) return undefined;
  return reports.find(({ company }) =>
    company.name.toLowerCase().includes(name),
  );
}
