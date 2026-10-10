import type { DeltaReport } from "@/lib/types";

// Fictional company, fictional numbers. All URLs use the reserved .example TLD
// and do not resolve. Rows are deliberately not in display order.
const checkedAt = "2026-10-10";

export const quillfeatherRobotics: DeltaReport = {
  company: {
    name: "Quillfeather Robotics",
    domain: "quillfeather.example",
    cik: "0009999991",
  },
  generatedAt: "2026-10-10T16:30:00Z",
  headline:
    "Two discrepancies between what was filed and what is said publicly.",
  rows: [
    {
      signal: "Headcount",
      filed: null,
      said: {
        field: "headcount",
        value: "64 to 91 employees in 6 months",
        source: {
          label: "LinkedIn company page",
          url: "https://linkedin.example/company/quillfeather-robotics",
          checkedAt,
        },
      },
      status: "consistent",
      summary: "Growth matches new capital.",
      likelyReasons: [],
    },
    {
      signal: "Latest raise",
      filed: {
        field: "latest_raise",
        value: "$38,000,000 sold of $50,000,000 offered",
        source: {
          label: "SEC Form D, Item 13",
          url: "https://sec.example/form-d/0009999991#item-13",
          checkedAt,
        },
      },
      said: {
        field: "latest_raise",
        value: "$25,000,000 Series A",
        source: {
          label: "The Daily Ledger, Mar 4",
          url: "https://dailyledger.example/quillfeather-series-a",
          checkedAt,
        },
      },
      status: "discrepancy",
      summary: "Ahead of press by $13M.",
      likelyReasons: [
        "The round was extended after the announcement and the extension was not publicized.",
        "The announcement covered the first close; the filing reflects later closes.",
        "The filed amount includes converted notes or SAFEs that the announcement left out.",
      ],
    },
    {
      signal: "Leadership",
      filed: {
        field: "leadership",
        value: "New director named in amended filing",
        source: {
          label: "SEC Form D/A, Item 3",
          url: "https://sec.example/form-d-a/0009999991#item-3",
          checkedAt,
        },
      },
      said: {
        field: "leadership",
        value: "Not listed on the team page",
        source: {
          label: "quillfeather.example/team",
          url: "https://quillfeather.example/team",
          checkedAt,
        },
      },
      status: "not_disclosed",
      summary: "Board change not yet public.",
      likelyReasons: [
        "An investor took a board seat with the new round.",
        "The team page has not been updated since the amendment.",
      ],
    },
    {
      signal: "Investors",
      filed: {
        field: "investors",
        value: "22 investors",
        source: {
          label: "SEC Form D, Item 14",
          url: "https://sec.example/form-d/0009999991#item-14",
          checkedAt,
        },
      },
      said: {
        field: "investors",
        value: "4 named investors",
        source: {
          label: "quillfeather.example/press",
          url: "https://quillfeather.example/press",
          checkedAt,
        },
      },
      status: "discrepancy",
      summary: "18 more investors filed than named.",
      likelyReasons: [
        "Angels or an SPV took part without being named.",
        "The announcement named the lead investors only.",
      ],
    },
  ],
};
