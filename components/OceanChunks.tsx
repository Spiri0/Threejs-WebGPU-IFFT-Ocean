'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore - JS module
import OceanChunkManager from '../src/ocean/ocean.js';

interface OceanChunksProps {
  waveGenerator: any;
}

export default function OceanChunks({ waveGenerator }: OceanChunksProps) {
  const { gl, scene, camera } = useThree();
  const oceanManagerRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !waveGenerator || !gl) return;

    const initOceanChunks = async () => {
      try {
        const sunpos = new THREE.Vector3(100000, 0, 100000);

        // Create ocean chunk manager
        const oceanManager = new OceanChunkManager();

        // Initialize with wave generator reference
        await oceanManager.Init({
          scene,
          camera,
          renderer: gl,
          sunpos,
          waveGenerator,
          layer: 0,
          gui: waveGenerator.params_.gui || new (await import('three/addons/libs/lil-gui.module.min.js')).GUI(),
          guiParams: {},
        });

        oceanManagerRef.current = oceanManager;
        initializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize ocean chunks:', error);
      }
    };

    initOceanChunks();

    return () => {
      // Cleanup ocean chunks
      if (oceanManagerRef.current) {
        // Call cleanup if available
        oceanManagerRef.current.Destroy?.();
      }
    };
  }, [waveGenerator, gl, scene, camera]);

  // Update ocean chunks each frame
  useFrame(async (state, delta) => {
    if (!oceanManagerRef.current || !waveGenerator) return;

    const deltaTime = delta * 1000; // Convert to milliseconds

    try {
      // Update wave generator
      await waveGenerator.Update_?.(deltaTime);

      // Update ocean geometry
      oceanManagerRef.current.Update_?.(deltaTime);
    } catch (error) {
      console.error('Error updating ocean:', error);
    }
  });

  return null;
}
