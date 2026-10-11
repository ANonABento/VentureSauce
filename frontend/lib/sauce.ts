import { API, DEFAULT_API, WORKSPACE } from "./api";

/**
 * A Sauce Report URL. Reports open in a normal tab, whose storage may not be the
 * extension iframe's, so the inbox (and a custom backend) travel in the query.
 */
export function sauceUrl(params: { company?: string; digest?: "day" | "week"; print?: boolean }): string {
  const query = new URLSearchParams({
    ...(params.company ? { company: params.company } : {}),
    ...(params.digest ? { digest: params.digest } : {}),
    ...(params.print ? { print: "1" } : {}),
    ws: WORKSPACE,
    ...(API !== DEFAULT_API ? { api: API } : {}),
  });
  return `/sauce?${query}`;
}
