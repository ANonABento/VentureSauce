import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

/** Pill buttons (v2). Primary is pine ink, one per view; quiet is white with a strong hairline. */
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
        "inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-ink text-paper hover:bg-ink/90"
          : "border border-rule-strong bg-surface text-ink hover:bg-tray",
        className,
      )}
      {...props}
    />
  );
}
