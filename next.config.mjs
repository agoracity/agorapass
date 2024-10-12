/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["web-worker", "@zk-kit/groth16"],
  }
};

export default nextConfig;
