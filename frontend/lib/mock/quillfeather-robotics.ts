import type { DeltaReport } from "@/lib/types";

// Fictional company, people and numbers. All URLs use the reserved .example
// TLD and do not resolve. Rows are deliberately not in display order.
const checkedAt = "2026-10-10";

export const quillfeatherRobotics: DeltaReport = {
  company: {
    name: "Quillfeather Robotics",
    domain: "quillfeather.example",
    cik: "0009999991",
  },
  generatedAt: "2026-10-10T16:30:00Z",
  headline:
    "Four discrepancies between what was filed and what is said publicly.",
  rows: [
    {
      signal: "Headcount",
      filed: null,
      said: {
        field: "headcount",
        value: "64 to 91 employees in 6 months",
        source: {
          label: "LinkedIn",
          url: "https://linkedin.example/company/quillfeather-robotics",
          checkedAt,
        },
      },
      status: "consistent",
      summary: "Growth matches new capital.",
      summaryShort: "+42% in 6 mo",
      likelyReasons: [],
      visual: {
        kind: "headcount",
        series: [
          { date: "2026-04-01", value: 64 },
          { date: "2026-05-01", value: 67 },
          { date: "2026-06-01", value: 71 },
          { date: "2026-07-01", value: 76 },
          { date: "2026-08-01", value: 80 },
          { date: "2026-09-01", value: 86 },
          { date: "2026-10-01", value: 91 },
        ],
      },
    },
    {
      signal: "Latest raise",
      filed: {
        field: "latest_raise",
        value: "$38M sold of $50M offered",
        source: {
          label: "SEC Form D",
          url: "https://sec.example/form-d/0009999991#item-13",
          checkedAt,
        },
      },
      said: {
        field: "latest_raise",
        value: "$25M Series A",
        source: {
          label: "The Daily Ledger",
          url: "https://dailyledger.example/quillfeather-series-a",
          checkedAt,
        },
      },
      status: "discrepancy",
      summary: "Ahead of press by $13M.",
      summaryShort: "+$13M vs. press",
      likelyReasons: [
        "The round was extended after the announcement.",
        "The announcement covered the first close only.",
        "The filing counts converted notes or SAFEs.",
      ],
      visual: {
        kind: "raise",
        offered: 50_000_000,
        sold: 38_000_000,
        said: 25_000_000,
      },
    },
    {
      signal: "Leadership",
      filed: {
        field: "leadership",
        value: "3 directors and officers",
        source: {
          label: "SEC Form D/A",
          url: "https://sec.example/form-d-a/0009999991#item-3",
          checkedAt,
        },
      },
      said: {
        field: "leadership",
        value: "2 on the team page",
        source: {
          label: "Team page",
          url: "https://quillfeather.example/team",
          checkedAt,
        },
      },
      status: "discrepancy",
      summary: "One director in the filing is not on the team page.",
      summaryShort: "1 not on site",
      likelyReasons: [
        "An investor took a board seat with the new round.",
        "The team page has not been updated since the amendment.",
      ],
      visual: {
        kind: "leadership",
        people: [
          { name: "Ines Calloway", role: "CEO", onSite: true },
          { name: "Tobin Marsh", role: "CTO", onSite: true },
          { name: "Petra Lindqvist", role: "Director", onSite: false },
        ],
      },
    },
    {
      signal: "Timing",
      filed: {
        field: "first_sale",
        value: "First sale Feb 11",
        source: {
          label: "SEC Form D",
          url: "https://sec.example/form-d/0009999991#item-7",
          checkedAt,
        },
      },
      said: {
        field: "first_sale",
        value: "Announced Mar 4",
        source: {
          label: "The Daily Ledger",
          url: "https://dailyledger.example/quillfeather-series-a",
          checkedAt,
        },
      },
      status: "discrepancy",
      summary: "Filed three weeks before the press announcement.",
      summaryShort: "Filed 3 wks before press",
      likelyReasons: ["Rounds are often closed and filed before they are announced."],
      visual: {
        kind: "timing",
        filedOn: "2026-02-11",
        announcedOn: "2026-03-04",
      },
    },
    {
      signal: "Investors",
      filed: {
        field: "investors",
        value: "22 investors",
        source: {
          label: "SEC Form D",
          url: "https://sec.example/form-d/0009999991#item-14",
          checkedAt,
        },
      },
      said: {
        field: "investors",
        value: "4 named investors",
        source: {
          label: "Press page",
          url: "https://quillfeather.example/press",
          checkedAt,
        },
      },
      status: "discrepancy",
      summary: "18 more investors filed than named.",
      summaryShort: "18 unnamed",
      likelyReasons: [
        "Angels or an SPV took part without being named.",
        "The announcement named the lead investors only.",
      ],
      visual: { kind: "investors", filed: 22, named: 4 },
    },
  ],
};
