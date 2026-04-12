import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["node:process", "firebase-admin"],
};

export default nextConfig;
