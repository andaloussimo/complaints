/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static-export SPA. All server work lives in Cloudflare Pages Functions
  // (dashboard/functions/api/*), which hold the GitHub token and call the
  // GitHub REST API. Gated by Cloudflare Access in production.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
