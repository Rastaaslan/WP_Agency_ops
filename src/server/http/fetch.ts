import { assertSafeHttpUrl } from "@/lib/urls";

export const DEFAULT_USER_AGENT =
  "WPAgencyOpsToolkit/0.1 (+https://local.wp-agency-ops)";

export type SafeFetchOptions = RequestInit & {
  timeoutMs?: number;
  allowPrivateNetwork?: boolean;
};

export async function safeFetch(
  url: string,
  { timeoutMs = 8000, allowPrivateNetwork = false, headers, ...init }: SafeFetchOptions = {},
) {
  const target = allowPrivateNetwork ? url : assertSafeHttpUrl(url);

  return fetch(target, {
    ...init,
    headers: {
      "user-agent": DEFAULT_USER_AGENT,
      accept: "application/json, text/html;q=0.9, */*;q=0.8",
      ...headers,
    },
    redirect: init.redirect ?? "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
}
