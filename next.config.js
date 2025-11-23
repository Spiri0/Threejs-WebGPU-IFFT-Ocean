/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });

    // Add aliases for Three.js WebGPU builds
    const path = require('path');
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/webgpu': path.resolve(__dirname, 'node_modules/three/build/three.webgpu.js'),
      'three/tsl': path.resolve(__dirname, 'node_modules/three/build/three.tsl.js'),
      'three/addons': path.resolve(__dirname, 'node_modules/three/examples/jsm'),
    };

    // Don't bundle these on the server
    if (!isServer) {
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
