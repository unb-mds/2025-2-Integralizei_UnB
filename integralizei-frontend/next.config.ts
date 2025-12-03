import type { NextConfig } from "next";

const nextConfig: NextConfig = {

async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend-login:3001/:path*', 
      },
    ];
  },
  
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,           
      aggregateTimeout: 300, 
    }
    return config
  },
};

export default nextConfig;