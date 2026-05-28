const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function normalizeUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = "";

  if (url.pathname === "/") {
    url.pathname = "";
  }

  return url.toString().replace(/\/$/, "");
}

export function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = normalizeUrl(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isProbablyPrivateHostname(hostname: string) {
  const lower = hostname.toLowerCase();

  if (PRIVATE_HOSTS.has(lower) || lower.endsWith(".local")) {
    return true;
  }

  if (lower.startsWith("[") && lower.endsWith("]")) {
    return lower === "[::1]";
  }

  const octets = lower.split(".").map((part) => Number.parseInt(part, 10));
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = octets;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

export function assertSafeHttpUrl(value: string) {
  const normalized = normalizeUrl(value);
  const url = new URL(normalized);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Seules les URLs HTTP et HTTPS sont autorisees.");
  }

  if (
    process.env.ALLOW_PRIVATE_NETWORK_TARGETS !== "true" &&
    isProbablyPrivateHostname(url.hostname)
  ) {
    throw new Error(
      "Cette cible ressemble a une adresse privee. Activez ALLOW_PRIVATE_NETWORK_TARGETS=true en local si c'est intentionnel.",
    );
  }

  return normalized;
}
