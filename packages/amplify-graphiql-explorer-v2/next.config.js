/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    MOCK_HOST: 'http://localhost:20002',
    GRAPHQL_ENDPOINT: 'http://localhost:20002/graphql',
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: 'http://localhost:20002/graphql', // Proxy to Backend
      },
      {
        source: '/api/graphql/_config',
        destination: 'http://localhost:20002/api-config', // Proxy to Backend
      },
    ];
  },
};

module.exports = nextConfig;
