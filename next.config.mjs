/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "b84d-103-72-212-59.ngrok-free.app"
      }
    ]
  }
};

export default nextConfig;
