import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      // You can also add 127.0.0.1 if your API backend serves images on IP directly
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
       {
        protocol: "https",
        hostname: "storage.example.com",
      },
       {
        protocol: "https",
        hostname: "png.pngtree.com",
      },
      
      // If you have a staging or production domain, add it here too:
      // {
      //   protocol: "https",
      //   hostname: "yourdomain.com",
      // },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
