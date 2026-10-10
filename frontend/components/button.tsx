import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

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
        "inline-flex h-9 items-center justify-center rounded-[2px] border border-ink px-4 text-[13px] font-medium transition-colors duration-150 ease-out",
        variant === "primary"
          ? "bg-ink text-paper hover:bg-transparent hover:text-ink"
          : "text-ink hover:bg-ink hover:text-paper",
        className,
      )}
      {...props}
    />
  );
}
