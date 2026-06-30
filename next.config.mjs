/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Campflare CDN — photos served from their S3 bucket
      {
        protocol: 'https',
        hostname: '**.campflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.campflare.io',
      },
      // Recreation.gov / federal campground photos sometimes proxied through Campflare
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
  },
}

export default nextConfig
