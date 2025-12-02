import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 👇 ADICIONE ESTE BLOCO DO WEBPACK
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,             // Verifica alterações a cada 1000ms (1 segundo)
      aggregateTimeout: 300,  // Espera 300ms após você parar de digitar para reconstruir
    }
    return config
  },
};

export default nextConfig;
