// Shared data contract — filing-delta-context.md, section 4.
// Changes to this file are announced to the whole team.

export type Source = {
  label: string;        // "SEC Form D, Item 13" | "acme.com/team"
  url: string;
  checkedAt: string;    // ISO date
};

export type Claim = {
  field: "latest_raise" | "investors" | "leadership" | "first_sale" | "headcount" | "revenue";
  value: string;        // human-readable, e.g. "$38M sold of $50M offered"
  source: Source;
};

export type DeltaStatus = "discrepancy" | "consistent" | "not_disclosed" | "unverified";

export type DeltaRow = {
  signal: string;       // "Latest raise"
  filed: Claim | null;
  said: Claim | null;
  status: DeltaStatus;
  summary: string;      // "Ahead of press: $13M more than announced"
  likelyReasons: string[];
  summaryShort?: string; // optional: the delta in five words or fewer, e.g. "+$13M vs. press"
  visual?: DeltaVisual;  // optional: structured numbers behind the row's mini chart
};

// Optional structured data for a row's mini visualization. Amounts are whole
// US dollars, dates are ISO dates.
export type DeltaVisual =
  | { kind: "raise"; offered: number; sold: number; said: number }
  | { kind: "investors"; filed: number; named: number }
  | { kind: "headcount"; series: { date: string; value: number }[] }
  | { kind: "leadership"; people: { name: string; role?: string; onSite: boolean }[] }
  | { kind: "timing"; filedOn: string; announcedOn: string };

export type DeltaReport = {
  company: { name: string; domain: string; cik?: string };
  generatedAt: string;
  rows: DeltaRow[];
  headline: string;     // one sentence, e.g. "2 discrepancies between filings and public claims"
};
