/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add aliases for Three.js WebGPU builds
    const path = require('path');
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/webgpu': path.resolve(__dirname, 'node_modules/three/build/three.webgpu.js'),
      'three/tsl': path.resolve(__dirname, 'node_modules/three/build/three.tsl.js'),
      'three/addons': path.resolve(__dirname, 'node_modules/three/examples/jsm'),
    };

    // Support top-level await for WebGPU.js
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Set target to support modern ES features
    if (!isServer) {
      config.target = ['web', 'es2022'];
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  // Enable static export for Vercel
  output: 'standalone',
  // Required headers for WebGPU SharedArrayBuffer support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  // Optimize for production
  reactStrictMode: true,
};

module.exports = nextConfig;
