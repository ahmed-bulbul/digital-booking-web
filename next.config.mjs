/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080"
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080"
      }
    ]
  }
};

export default nextConfig;
