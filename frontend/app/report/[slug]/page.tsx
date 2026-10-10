import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DeltaRows } from "@/components/delta-rows";
import { Disclaimer } from "@/components/disclaimer";
import { EmptyState } from "@/components/empty-state";
import { ReportHeader } from "@/components/report-header";
import { hasFiling } from "@/components/report-utils";
import { mockReports } from "@/lib/mock";

type Params = PageProps<"/report/[slug]">["params"];

// Mock data for now: the slug is the mock company.
export function generateStaticParams() {
  return Object.keys(mockReports).map((slug) => ({ slug }));
}

export default function ReportPage({ params }: PageProps<"/report/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[824px] flex-1 px-5 pt-16 pb-16 sm:px-8 sm:pt-24">
      <p className="micro-label text-graphite">Filing Delta</p>
      <Suspense fallback={null}>
        <Report params={params} />
      </Suspense>
    </main>
  );
}

async function Report({ params }: { params: Params }) {
  const { slug } = await params;
  const report = mockReports[slug];
  if (!report) notFound();

  const filed = hasFiling(report);

  return (
    <>
      <div className="mt-10">
        <ReportHeader
          size="page"
          company={report.company}
          checkedAt={report.generatedAt}
          headline={filed ? report.headline : undefined}
        />
      </div>

      <div className="mt-12">
        {filed ? (
          <DeltaRows layout="report" rows={report.rows} />
        ) : (
          <EmptyState />
        )}
      </div>

      <footer className="mt-16 border-t border-rule pt-4">
        <Disclaimer />
      </footer>
    </>
  );
}
