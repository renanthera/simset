/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({"canvas": {}});
    }
    return config;
  },
}

module.exports = nextConfig;
