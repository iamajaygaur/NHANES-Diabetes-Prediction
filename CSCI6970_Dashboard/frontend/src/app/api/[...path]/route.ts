import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);

/** Dashboard GETs stay fresh for 5 minutes on Vercel even if Render is waking. */
const GET_REVALIDATE_SECONDS = 300;
/** Allow Render free-tier cold starts + model load. */
const UPSTREAM_TIMEOUT_MS = 90_000;

function upstreamUrl(pathParts: string[], search: string) {
  const path = pathParts.map(encodeURIComponent).join("/");
  return `${BACKEND_URL}/api/${path}${search}`;
}

async function proxy(
  request: NextRequest,
  pathParts: string[],
  init?: RequestInit & { next?: { revalidate?: number | false } },
) {
  const url = upstreamUrl(pathParts, request.nextUrl.search);
  try {
    const upstream = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const body = await upstream.arrayBuffer();
    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    headers.set("x-diabetesinsight-upstream", "ok");

    return new NextResponse(body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upstream API unavailable";
    return NextResponse.json(
      {
        detail:
          "The prediction API is waking up or unreachable. Wait a moment and retry.",
        error: message,
      },
      { status: 503 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  const isHealth = path.length === 1 && path[0] === "health";

  return proxy(request, path, {
    method: "GET",
    cache: isHealth ? "no-store" : "force-cache",
    next: isHealth ? undefined : { revalidate: GET_REVALIDATE_SECONDS },
  });
}

export async function POST(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  const body = await request.arrayBuffer();
  return proxy(request, path, {
    method: "POST",
    cache: "no-store",
    body,
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
