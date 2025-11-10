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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ✅ allow Cloudinary images
      },
      {
        protocol: "http",
        hostname: "localhost", // ✅ allow local dev uploads
        port: "4000",
      },
    ],
  },
};

export default nextConfig;
