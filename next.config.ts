import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

if (process.env.NODE_ENV === 'development') {
  const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev')
  await setupDevPlatform()
}

export default nextConfig
