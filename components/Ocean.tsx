'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { checkWebGPUSupport, getWebGPUErrorMessage } from '@/lib/three-setup';
import OceanScene from './OceanScene';

export default function Ocean() {
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const [renderer, setRenderer] = useState<WebGPURenderer | null>(null);

  useEffect(() => {
    // Check WebGPU support
    const supported = checkWebGPUSupport();
    setWebGPUSupported(supported);

    if (!supported) {
      const errorElement = getWebGPUErrorMessage();
      if (errorElement) {
        document.body.appendChild(errorElement);
      }
      return;
    }

    // Create WebGPU renderer
    const canvas = document.createElement('canvas');
    const webgpuRenderer = new WebGPURenderer({
      canvas,
      antialias: true,
      forceWebGL: false,
    });

    webgpuRenderer.outputColorSpace = THREE.SRGBColorSpace;
    webgpuRenderer.setPixelRatio(window.devicePixelRatio);
    webgpuRenderer.shadowMap.enabled = true;
    webgpuRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    webgpuRenderer.setClearColor(0x87ceeb); // Sky blue

    // Initialize WebGPU
    webgpuRenderer.init().then(() => {
      setRenderer(webgpuRenderer);
    });

    return () => {
      webgpuRenderer.dispose();
    };
  }, []);

  if (webGPUSupported === false) {
    return (
      <div className="error">
        <h2>WebGPU Not Supported</h2>
        <p>
          Your browser does not support WebGPU. Please use a browser with WebGPU support
          (Chrome 113+, Edge 113+, or enable experimental WebGPU in your browser settings).
        </p>
      </div>
    );
  }

  if (!renderer) {
    return (
      <div className="loading">
        <div>Initializing WebGPU...</div>
      </div>
    );
  }

  return (
    <div id="canvas-container">
      <Canvas
        gl={renderer}
        camera={{
          fov: 50,
          near: 0.1,
          far: 1e6,
          position: [0, 10, 20],
        }}
        dpr={window.devicePixelRatio}
        style={{ width: '100vw', height: '100vh' }}
      >
        <OceanScene />
      </Canvas>
    </div>
  );
}
