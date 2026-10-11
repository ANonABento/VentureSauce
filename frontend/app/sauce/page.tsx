import type { Metadata } from "next";
import { Suspense } from "react";
import { SauceReportPage, SauceStatus } from "./sauce-report-page";

export const metadata: Metadata = { title: "Sauce Report" };

// /sauce?company=<id>[&print=1] — the Sauce Report (decision 49), print-styled so Download PDF keeps the links.
// /sauce?digest=day|week[&print=1] — the digest Sauce Report (decision 57): every company with new items.
// Reads the same browser workspace as the panel (lib/api.ts); `?ws=` and `?api=` work here too.
export default function SaucePage() {
  return (
    <Suspense fallback={<SauceStatus>Loading the report</SauceStatus>}>
      <SauceReportPage />
    </Suspense>
  );
}
