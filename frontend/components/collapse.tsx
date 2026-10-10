import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Height-animated disclosure region. Closed content is `visibility: hidden`,
 * which also takes it out of the tab order and the accessibility tree.
 */
export function Collapse({
  open,
  id,
  className,
  children,
}: {
  open: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        "grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
        open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
        className,
      )}
    >
      {/* Side padding leaves room for focus rings inside the clipped box. */}
      <div className="-mx-1 min-h-0 overflow-hidden px-1">{children}</div>
    </div>
  );
}
