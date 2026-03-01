import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/:path*`,
      },
    ];
  },

  // ✅ SECURITY: HTTP response headers for every page
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Anti-clickjacking — prevents embedding in iframes
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

          // Anti-MIME-sniffing — browser won't guess content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Legacy XSS filter for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },

          // Don't send full URL in Referer header to other sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },

          // ✅ Content Security Policy
          // Allows: self, Cloudinary images, WebSocket connections to the backend
          // NOTE: unsafe-inline needed for Next.js inline styles/scripts
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js needs unsafe-eval in dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://res.cloudinary.com",
              // Allow WebSocket + HTTP connections to backend IP (any — since IP can change)
              "connect-src 'self' http: https: ws: wss:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },

          // HSTS — only meaningful on HTTPS. When deployed with HTTPS, uncomment:
          // { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ✅ Cloudinary images
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000', // ✅ Local dev
      },
    ],
  },
};

export default nextConfig;
