// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*", // what frontend requests
        destination: "http://localhost:4000/uploads/:path*", // where to forward
      },
    ];
  },
};

export default nextConfig;
