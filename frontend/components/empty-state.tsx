import { MinusCircle } from "@phosphor-icons/react/dist/ssr";

/** No filing found: say so plainly, with the likely explanations. The hero tray on this screen. */
export function EmptyState({ partial = false }: { partial?: boolean }) {
  return (
    <div className="tray">
      <p className="flex items-center gap-2 text-sm leading-5 font-medium text-ink">
        <MinusCircle aria-hidden="true" size={18} weight="light" className="shrink-0 text-graphite" />
        No Form D on file for this company.
      </p>
      <p className="mt-1 text-[13px] leading-5 text-graphite">
        It may raise under a different exemption or a different legal name.
        {partial && " The other checks still ran; their results are below."}
      </p>
    </div>
  );
}
