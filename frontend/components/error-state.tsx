import { XCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "./button";

/** Say what failed, what it means, and offer the way back. The hero tray on this screen. */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="tray">
      <p className="flex items-center gap-2 text-sm leading-5 font-medium text-ink">
        <XCircle aria-hidden="true" size={18} weight="light" className="shrink-0 text-ink" />
        Couldn&rsquo;t finish the comparison.
      </p>
      <p className="mt-1 text-[13px] leading-5 text-graphite">
        One of the sources didn&rsquo;t respond. Try again in a moment.
      </p>
      <Button className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
