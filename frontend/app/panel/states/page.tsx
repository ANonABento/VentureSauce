import { LOADING_STEPS } from "@/components/loading-steps";
import { mockReports } from "@/lib/mock";
import { PanelView } from "../panel";

const quillfeather = mockReports["quillfeather-robotics"];
const mossgate = mockReports["mossgate-labs"];
const subject = {
  name: quillfeather.company.name,
  domain: quillfeather.company.domain,
};

// Every side-panel state next to each other, on mock data. For review only.
export default function PanelStatesPage() {
  const states = [
    { label: "1 Idle", view: <PanelView embedded status="idle" /> },
    {
      label: "2 Detected",
      view: <PanelView embedded status="detected" subject={subject} />,
    },
    {
      label: "3 Loading",
      view: (
        <PanelView
          embedded
          status="loading"
          subject={subject}
          step={LOADING_STEPS.length - 2}
        />
      ),
    },
    {
      label: "4 Report",
      view: <PanelView embedded status="report" report={quillfeather} />,
    },
    {
      label: "5 No filing found",
      view: <PanelView embedded status="empty" report={mossgate} />,
    },
    {
      label: "6 Error",
      view: (
        <PanelView
          embedded
          status="error"
          subject={{ domain: "unknown-startup.example" }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-12 p-8">
      {states.map(({ label, view }) => (
        <section key={label} className="w-[380px] max-w-full">
          <h2 className="micro-label font-mono text-graphite">{label}</h2>
          <div className="mt-3 h-[640px] overflow-y-auto border border-rule">
            {view}
          </div>
        </section>
      ))}
    </div>
  );
}
