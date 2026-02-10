import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Restrict to known image domains for security and optimization
    // Using ** hostname disables Next.js image optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google images
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net", // CDN
      },
      // Add your own image domains here as needed
    ],
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Remove X-Powered-By header for security
  poweredByHeader: false,
};

export default nextConfig;
