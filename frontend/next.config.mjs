/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // These libraries expose large barrel files. Rewriting named imports keeps
    // unrelated icons, date helpers and Radix primitives out of each route.
    optimizePackageImports: [
      "date-fns",
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-slot",
    ],
  },
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
