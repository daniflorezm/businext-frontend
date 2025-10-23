import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imágenes externas permitidas - Necesario para Stripe y Supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.stripe.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Configuración de TypeScript y ESLint
  typescript: {
    ignoreBuildErrors: false, // Mantenemos los chequeos de TypeScript activos
  },
  eslint: {
    ignoreDuringBuilds: false, // Mantenemos los chequeos de ESLint activos
  },
};

export default nextConfig;
