import type { NextConfig } from "next";

/**
 * API traffic goes through `src/app/api/[...path]/route.ts` so GET responses
 * can be cached on Vercel (Render free cold starts no longer block every user).
 */
const nextConfig: NextConfig = {
  // Keep empty rewrites — proxy lives in the App Router route handler.
};

export default nextConfig;
