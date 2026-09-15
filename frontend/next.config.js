const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@suretyseven/shared"],
  // Monorepo root (npm workspaces) — makes the standalone output trace
  // correctly instead of guessing based on lockfile location.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

module.exports = nextConfig;
