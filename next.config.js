/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['canvas']
  },
  images: {
    domains: ['vercel.blob.store'],
  },
  // PWA configuration will be added later
}

module.exports = nextConfig