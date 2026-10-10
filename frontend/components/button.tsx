import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

/** v2 button: fully rounded. Primary is the pine fill; quiet is outlined. */
export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet";
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium transition-colors duration-150 ease-out disabled:opacity-50",
        variant === "primary"
          ? "bg-ink text-white hover:bg-ink-hover"
          : "border border-border-strong bg-surface text-ink hover:border-ink",
        className,
      )}
      {...props}
    />
  );
}
