import { redirect } from "next/navigation";

// Redirect-only page: nothing to prerender, so skip static shell validation.
export const instant = false;

export default function Home() {
  redirect("/panel");
}
