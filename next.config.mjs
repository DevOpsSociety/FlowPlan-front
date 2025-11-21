/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/project/:id',
        destination: '/project/:id/wbs-table',
        permanent: true,
      },
      {
        source: '/',
        destination: '/new-project',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
