import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "startupfa.me",
      },
      {
        protocol: "https",
        hostname: "foundrlist.com",
      },
      {
        protocol: "https",
        hostname: "trylaunch.ai",
      },
      {
        protocol: "https",
        hostname: "shipybara.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  async redirects() {
    // Venue slugs renamed at the owner's request; keep old URLs working.
    return [
      {
        source: "/venue/us/illinois/downers-grove/teebox-24-7-golf",
        destination: "/venue/us/illinois/downers-grove/golf630",
        permanent: true,
      },
      {
        source: "/venue/us/michigan/dewitt/24-7-golf-dewitt",
        destination: "/venue/us/michigan/dewitt/the-sim-box-golf-dewitt",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
