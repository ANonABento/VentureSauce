import type { Check, CompanyView } from "./api";
import type { DeltaReport, DeltaRow, Source } from "./types";

/*
 * The Sauce Report as Markdown, for an AI agent (decision 72): YAML front
 * matter, then the same facts the human view draws, every figure with its
 * source, plus guardrails and a suggested task. Pure: same input, same text.
 * No workspace id or API URL goes in, so the file is safe to paste anywhere.
 */

export const REPORT_SCHEMA = "sauce-report/1";

/** Rows comparing the user's own items end with this; the rest are public records. */
const OWN_SOURCES_SUFFIX = "across your sources";

const STATUS_WORD: Record<DeltaRow["status"], string> = {
  discrepancy: "discrepancy",
  consistent: "consistent",
  not_disclosed: "not disclosed",
  unverified: "unverified",
};

const isWebUrl = (url: string | null | undefined): url is string => !!url && /^https?:\/\//i.test(url);

/** A Markdown table cell: pipes escaped, line breaks flattened, never empty. */
export function cell(text: string | null | undefined): string {
  const flat = (text ?? "").replace(/\s*\r?\n\s*/g, " ").trim();
  return flat ? flat.replace(/\\/g, "\\\\").replace(/\|/g, "\\|") : "—";
}

/** One line of prose: line breaks flattened. */
const line = (text: string) => text.replace(/\s*\r?\n\s*/g, " ").trim();

/** A YAML scalar: JSON strings are valid double-quoted YAML. */
const yaml = (value: string | number | boolean) => (typeof value === "string" ? JSON.stringify(value) : String(value));

/** "Acme AI" → "acme-ai". */
export function slug(name: string): string {
  return (
    name
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company"
  );
}

/** The download's file name: `<company-slug>-sauce-report.md`. */
export const markdownFileName = (company: string) => `${slug(company)}-sauce-report.md`;

/** ISO date only ("2026-10-02"); agents parse it without guessing a locale. */
const isoDay = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "unknown date");

function compactUsd(amount: number): string {
  for (const [size, suffix] of [
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ] as const) {
    if (Math.abs(amount) >= size) return `$${Number((amount / size).toFixed(2))}${suffix}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

const formatValue = (value: number, unit: string | null) =>
  unit === "usd" ? compactUsd(value) : unit === "percent" ? `${value}%` : value.toLocaleString("en-US");

function metricName(check: Check): string {
  if (check.metric) return check.metric.length <= 4 ? check.metric.toUpperCase() : check.metric[0].toUpperCase() + check.metric.slice(1);
  return check.claim_type === "headcount" ? "Headcount" : "Total raised";
}

/** A source as an agent should cite it: the URL, or the user's own item by name. */
const cite = (source: Source) => (isWebUrl(source.url) ? source.url : `your item: ${source.label}`);

export type ReportFacts = {
  publicRows: DeltaRow[];
  discrepancies: DeltaRow[];
  others: DeltaRow[];
  contradictions: Check[];
  sourceCount: number;
};

/** The facts both views share: public-record rows by status, contradictions, and how many distinct sources. */
export function reportFacts(view: CompanyView, report: DeltaReport | null): ReportFacts {
  const publicRows = (report?.rows ?? []).filter((row) => !row.signal.endsWith(OWN_SOURCES_SUFFIX));
  const contradictions = view.checks.filter((c) => c.source === "your_sources" && (c.values?.length ?? 0) > 1);
  const urls = new Set<string>();
  for (const row of publicRows) {
    for (const source of [row.filed?.source, row.said?.source]) if (source && isWebUrl(source.url)) urls.add(source.url);
  }
  for (const check of view.checks) if (check.source !== "your_sources" && isWebUrl(check.source_url)) urls.add(check.source_url);
  return {
    publicRows,
    discrepancies: publicRows.filter((row) => row.status === "discrepancy"),
    others: publicRows.filter((row) => row.status !== "discrepancy"),
    contradictions,
    sourceCount: view.items.length + urls.size,
  };
}

function frontMatter(view: CompanyView, generatedAt: string, sourceCount: number): string[] {
  const { company } = view;
  return [
    "---",
    `schema: ${REPORT_SCHEMA}`,
    `company: ${yaml(company.name)}`,
    `domain: ${company.domain ? yaml(company.domain) : "null"}`,
    `fictional: ${yaml(Boolean(company.fictional))}`,
    `generated_at: ${yaml(generatedAt)}`,
    `source_count: ${sourceCount}`,
    "---",
  ];
}

function summary(report: DeltaReport | null, facts: ReportFacts, questions: number): string[] {
  const count = (status: DeltaRow["status"]) => facts.publicRows.filter((row) => row.status === status).length;
  return [
    "## Summary",
    "",
    ...(report?.headline ? [line(report.headline), ""] : []),
    `- Discrepancies with public records: ${facts.discrepancies.length}`,
    `- Contradictions between your items: ${facts.contradictions.length}`,
    `- Consistent with public records: ${count("consistent")}`,
    `- Unverified or not disclosed: ${count("unverified") + count("not_disclosed")}`,
    `- Questions to ask the founder: ${questions}`,
  ];
}

function discrepancyTable(report: DeltaReport | null, rows: DeltaRow[]): string[] {
  const head = ["## Discrepancies vs public records", ""];
  if (!report) return [...head, "The public-record comparison could not be loaded."];
  if (!rows.length) return [...head, "None found."];
  return [
    ...head,
    "| Claim | Filed | Said | Status | Source URL | Checked |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map((row) => {
      const sources = [row.filed?.source, row.said?.source].filter((s): s is Source => !!s);
      const web = sources.filter((s) => isWebUrl(s.url));
      return `| ${[
        cell(row.signal),
        cell(row.filed?.value ?? "Not in the filing"),
        cell(row.said ? `${row.said.value} (${cite(row.said.source)})` : "Not stated publicly"),
        cell(STATUS_WORD[row.status]),
        cell(web.map((s) => s.url).join(" ")),
        cell(web.map((s) => isoDay(s.checkedAt)).join(" ") || isoDay(sources[0]?.checkedAt)),
      ].join(" | ")} |`;
    }),
  ];
}

function contradictionList(checks: Check[]): string[] {
  const head = ["## Contradictions between your items", ""];
  if (!checks.length) return [...head, "None found."];
  return [
    ...head,
    ...checks.flatMap((check) => {
      const values = check.values ?? [];
      const numbers = values.map((v) => v.value);
      const spread = Math.max(...numbers) - Math.min(...numbers);
      return [
        `### ${metricName(check)} (spread ${formatValue(spread, check.unit)})`,
        "",
        ...values.map(
          (v) =>
            `- **${formatValue(v.value, check.unit)}**: ${line(v.item_label)}, ${isoDay(v.item_day)}${v.claim_text ? `, quote: "${line(v.claim_text)}"` : ""}`,
        ),
        "",
      ];
    }),
  ].slice(0, -1);
}

function otherChecks(report: DeltaReport | null, rows: DeltaRow[]): string[] {
  if (!report) return [];
  const head = ["## Consistent / unverified checks", ""];
  if (!rows.length) return [...head, "None."];
  return [
    ...head,
    ...rows.map((row) => {
      const filed = row.filed ? `Found ${line(row.filed.value)} (${cite(row.filed.source)}, checked ${isoDay(row.filed.source.checkedAt)})` : "Not in public records";
      const said = row.said ? `said ${line(row.said.value)} (${cite(row.said.source)})` : "not stated";
      return `- ${line(row.signal)}: ${STATUS_WORD[row.status]}. ${filed}; ${said}.`;
    }),
  ];
}

function questionList(view: CompanyView): string[] {
  const head = ["## Questions to ask the founder", ""];
  if (!view.questions.length) return [...head, "None open."];
  return [
    ...head,
    ...view.questions.flatMap((q, i) => [`${i + 1}. ${line(q.question)}`, ...(q.why ? [`   - Why: ${line(q.why)}`] : [])]),
  ];
}

function guardrails(): string[] {
  return [
    "## For the AI reading this",
    "",
    "- Differences between sources are discrepancies, not findings of wrongdoing. Describe them neutrally.",
    "- Do not invent figures, dates, people or sources. Use only what is in this report; if something is missing, say it is unknown.",
    "- Cite the source URL for every figure you repeat. Figures marked \"your item\" come from the user's own materials and have no public URL; name the item instead.",
    "- If `fictional: true`, the company is demo data: never present its figures as facts about a real company.",
    "- This is an automated comparison of public records; they may be incomplete or out of date. It is not investment advice.",
  ];
}

function suggestedTask(name: string, hasQuestions: boolean): string[] {
  const ask = hasQuestions ? "asks the questions above" : "asks the founder to confirm the figures above";
  return [
    "## Suggested task",
    "",
    `> Draft a concise, non-accusatory follow-up email to the founder of ${line(name)} that ${ask}. Mention each figure with its source, keep it under 150 words, and don't speculate about why the numbers differ.`,
  ];
}

/**
 * The whole report as Markdown. `generatedAt` is used when the public-record
 * comparison (which carries its own timestamp) couldn't be loaded.
 */
export function reportMarkdown(view: CompanyView, report: DeltaReport | null, generatedAt: string): string {
  const facts = reportFacts(view, report);
  const { company } = view;
  const blocks: string[][] = [
    frontMatter(view, report?.generatedAt ?? generatedAt, facts.sourceCount),
    [
      `# Sauce Report: ${line(company.name)}`,
      ...(company.fictional ? ["", `> ${line(company.name)} is a fictional company. All figures are demo data.`] : []),
    ],
    summary(report, facts, view.questions.length),
    discrepancyTable(report, facts.discrepancies),
    contradictionList(facts.contradictions),
    otherChecks(report, facts.others),
    questionList(view),
    guardrails(),
    suggestedTask(company.name, view.questions.length > 0),
  ];
  return `${blocks
    .filter((block) => block.length > 0)
    .map((block) => block.join("\n"))
    .join("\n\n")}\n`;
}
