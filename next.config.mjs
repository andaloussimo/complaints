/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static export -> `out/`, served on Cloudflare Pages' CDN. The refund
  // form's HubSpot handler lives in a Cloudflare Pages Function
  // (functions/api/refund.ts), NOT a Next API route, so static export is allowed.
  output: "export",
  images: {
    // Site images are copied into /public/site-assets by scripts/prepare-site.mjs,
    // so they are served as plain static files and need no remote config.
    unoptimized: true,
  },
};

export default nextConfig;
