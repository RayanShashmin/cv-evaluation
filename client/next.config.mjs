/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static optimization for pages that use searchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
