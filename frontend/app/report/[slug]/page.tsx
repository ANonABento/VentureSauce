import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { mockReports } from "@/lib/mock";

type Params = PageProps<"/report/[slug]">["params"];

// Mock data for now: the slug is the mock company.
export function generateStaticParams() {
  return Object.keys(mockReports).map((slug) => ({ slug }));
}

export default function ReportPage({ params }: PageProps<"/report/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[624px] flex-1 px-5 pt-16 pb-16 sm:px-8 sm:pt-24">
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

  return (
    <div className="mt-10">
      <ReportView size="page" report={report} />
    </div>
  );
}
