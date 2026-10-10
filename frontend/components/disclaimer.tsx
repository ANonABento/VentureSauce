import { cn } from "./cn";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-5 text-graphite", className)}>
      Discrepancies are differences between sources, with possible
      explanations. They are not findings of wrongdoing.
    </p>
  );
}
