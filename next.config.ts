import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages only serves static files, so the app is exported to ./out
  output: "export",
  // Project page is served from https://snassyyy.github.io/recettes-famille/
  basePath: "/recettes-famille",
  assetPrefix: "/recettes-famille",
  // Emit folder/index.html so Pages resolves /path/ without redirects
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
