'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three/webgpu';
import WebGPU from 'three/examples/jsm/capabilities/WebGPU.js';
import OceanScene from './OceanScene';
import OceanControls from './OceanControls';

export default function Ocean() {
  const [isClient, setIsClient] = useState(false);
  const [supportsWebGPU, setSupportsWebGPU] = useState(false);
  const [waveGenerator, setWaveGenerator] = useState<any>(null);
  const [oceanManager, setOceanManager] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    setSupportsWebGPU(WebGPU.isAvailable());
  }, []);

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="loading">
        <div>Initializing...</div>
      </div>
    );
  }

  // Show error if WebGPU is not supported
  if (!supportsWebGPU) {
    return (
      <div className="error">
        <h2>WebGPU Not Supported</h2>
        <p>
          Your browser does not support WebGPU. Please use a WebGPU-compatible browser:
        </p>
        <ul style={{ marginTop: '10px', textAlign: 'left' }}>
          <li>Chrome 113+ (enable chrome://flags/#enable-unsafe-webgpu if needed)</li>
          <li>Edge 113+</li>
          <li>Other Chromium-based browsers with WebGPU enabled</li>
        </ul>
      </div>
    );
  }

  return (
    <div id="canvas-container">
      {/* Leva Controls - rendered outside Canvas, only on client */}
      {isClient && waveGenerator && oceanManager && (
        <OceanControls waveGenerator={waveGenerator} oceanManager={oceanManager} />
      )}
      
      <Canvas
        gl={async (glProps) => {
          // Create WebGPU renderer
          const renderer = new THREE.WebGPURenderer(glProps as any);

          // Configure renderer
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.setClearColor(0x87ceeb); // Sky blue

          // CRITICAL: Must await init() for WebGPU to work
          await renderer.init();

          return renderer;
        }}
        camera={{
          fov: 50,
          near: 0.1,
          far: 1e6,
          position: [0, 10, 20],
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <OceanScene 
          onWaveGeneratorReady={setWaveGenerator}
          onOceanManagerReady={setOceanManager}
        />
      </Canvas>
    </div>
  );
}
