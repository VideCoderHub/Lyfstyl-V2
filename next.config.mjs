import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep file watching scoped to this project (fixes Windows scanning C:\)
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN || 'http://localhost:3001'
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
    ]
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
    }
    return config
  },
}

export default nextConfig
