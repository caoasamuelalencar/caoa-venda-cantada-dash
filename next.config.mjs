/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "caoa.com.br",
      },
    ],
  },
};

export default nextConfig;
