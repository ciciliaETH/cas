/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: [
    "tone",
    "gamba-react-v2",
    "gamba-react-ui-v2",
    "gamba-core-v2",
  ],
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
