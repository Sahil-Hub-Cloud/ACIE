/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@acie/shared'],
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
};

module.exports = nextConfig;
