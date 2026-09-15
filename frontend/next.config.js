const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" is for the self-hosted Docker build; Vercel's own build system
  // handles serverless output itself and doesn't want this mode.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  transpilePackages: ["@suretyseven/shared"],
  // Monorepo root (npm workspaces) — makes the standalone output trace
  // correctly instead of guessing based on lockfile location.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

module.exports = nextConfig;
