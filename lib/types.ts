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
};

export type DeltaReport = {
  company: { name: string; domain: string; cik?: string };
  generatedAt: string;
  rows: DeltaRow[];
  headline: string;     // one sentence, e.g. "2 discrepancies between filings and public claims"
};
