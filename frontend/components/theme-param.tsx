"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Light is the default; `?theme=dark` switches the page to the dark tokens. */
export function ThemeParam() {
  const theme = useSearchParams().get("theme");

  useEffect(() => {
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  return null;
}
