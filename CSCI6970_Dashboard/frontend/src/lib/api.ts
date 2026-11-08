/**
 * Browser calls use same-origin `/api/...` (Next.js route proxy → Render/backend).
 * Override with NEXT_PUBLIC_API_URL only when intentionally calling the API directly.
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const SESSION_TTL_MS = 5 * 60 * 1000;
const SESSION_PREFIX = "di-api-cache:v1:";

type CacheEnvelope<T> = { savedAt: number; data: T };

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

function readSessionCache<T>(path: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + path);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeSessionCache<T>(path: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    const envelope: CacheEnvelope<T> = { savedAt: Date.now(), data };
    sessionStorage.setItem(SESSION_PREFIX + path, JSON.stringify(envelope));
  } catch {
    // quota / private mode — ignore
  }
}

/** Fire-and-forget wake-up for the free Render API. */
export function warmApi() {
  if (typeof window === "undefined") return;
  void fetch(apiUrl("/api/health"), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  }).catch(() => undefined);
}

export async function apiGet<T>(path: string): Promise<T> {
  const cached = readSessionCache<T>(path);
  if (cached != null) {
    // Refresh in the background so the next visit stays warm
    void fetch(apiUrl(path), {
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as T;
        writeSessionCache(path, data);
      })
      .catch(() => undefined);
    return cached;
  }

  const res = await fetch(apiUrl(path), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed (${res.status})`);
  }
  const data = (await res.json()) as T;
  writeSessionCache(path, data);
  return data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export { API_URL };
