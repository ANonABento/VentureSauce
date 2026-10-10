import { Suspense } from "react";
import { Panel } from "./panel";
import { PanelFrame } from "./panel-frame";

// /panel?url=<encoded tab URL> — loaded by the extension's side panel iframe.
export default function PanelPage() {
  return (
    <Suspense fallback={<PanelFrame />}>
      <Panel />
    </Suspense>
  );
}
