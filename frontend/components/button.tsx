import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

const SIZE = {
  md: "h-9 px-4 text-[13px]",
  sm: "h-8 px-3 text-xs",
  xs: "h-7 px-3 text-xs",
} as const;

const VARIANT = {
  primary: "bg-ink text-paper hover:bg-ink/90",
  quiet: "border border-rule-strong bg-surface text-ink hover:bg-tray",
  ghost: "text-ink hover:bg-tray",
} as const;

/**
 * Pill buttons (v2). Primary is pine ink, one per view; quiet is white with a
 * strong hairline; ghost has no chrome until hover. Size and variant are props
 * because `cn` joins classes without resolving conflicts.
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
}
