/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@visactor/react-vchart",
    "@visactor/vchart",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-popover",
    "@radix-ui/react-slot",
  ],
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
