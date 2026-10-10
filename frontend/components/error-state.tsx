import { Button } from "./button";

/** A plain sentence and a way to try again. */
export function ErrorState({
  onRetry,
  message = "The comparison could not be completed.",
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <div role="alert">
      <p className="text-sm leading-5 font-medium text-ink">
        {message}
      </p>
      <Button variant="quiet" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
