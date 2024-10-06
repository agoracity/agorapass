/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
      return [
        {
          source: '/',
          destination: '/profiles',
          permanent: true, // Set to true if you want a 308 permanent redirect, or false for a 307 temporary redirect
        },
      ]
    },
    reactStrictMode: true,
    experimental: {
      serverComponentsExternalPackages: ["web-worker", "@zk-kit/groth16"],
    }
};

export default nextConfig;
