import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations selon consigne.md
  experimental: {
    // optimizeCss: true, // Désactivé temporairement - nécessite critters
    optimizePackageImports: ['@/components/ui'],
  },
  
  // Modularized imports pour réduire bundle size
  modularizeImports: {
    '@/components/ui': {
      transform: '@/components/ui/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  
  // Build configuration pour déploiement
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    // Allow production builds to successfully complete even if there are type errors
    ignoreBuildErrors: false, // Garder les erreurs TypeScript
  },

  // Disable static optimization for auth pages (useSearchParams issue)
  output: 'standalone', // Pour Northflank/Docker deployment
};

export default nextConfig;
