import { Button } from "./button";

/** A plain sentence and a way to try again. */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert">
      <p className="text-[15px] leading-[22px] text-ink">
        The comparison could not be completed.
      </p>
      <Button variant="quiet" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
