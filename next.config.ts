import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const config = (phase: string): NextConfig => ({
  distDir: process.env.NEXT_PUBLIC_E2E === "1" ? ".next-e2e" : phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  env: { NEXT_PUBLIC_E2E: process.env.NEXT_PUBLIC_E2E ?? "0" },
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
});

export default config;
