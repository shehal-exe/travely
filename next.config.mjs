/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent parent-folder lockfiles from broadening Vercel's output tracing scope.
  outputFileTracingRoot: process.cwd(),
  // The Codex in-app browser reaches the Windows dev server over this LAN address.
  allowedDevOrigins: ["127.0.0.1", "10.139.164.225"],
  experimental: {
    // Eight 8 MiB photographs plus multipart form overhead.
    serverActions: { bodySizeLimit: "66mb" },
  },
  images: {
    // Let browsers load remote travel photography directly. This keeps local
    // previews complete even when the dev server has restricted outbound access.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
