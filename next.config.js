/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for MUI + App Router SSR
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medex.com.bd",
        pathname: "/storage/images/**",
      },
    ],
  },
};

module.exports = nextConfig;
