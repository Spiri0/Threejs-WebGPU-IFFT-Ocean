'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore - JS module
import OceanChunkManager from '../src/ocean/ocean.js';

interface OceanChunksProps {
  waveGenerator: any;
  onOceanManagerReady?: (oceanManager: any) => void;
}

export default function OceanChunks({ waveGenerator, onOceanManagerReady }: OceanChunksProps) {
  const { gl, scene, camera } = useThree();
  const oceanManagerRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !waveGenerator || !gl) {
      if (!waveGenerator) {
        console.log('OceanChunks: Waiting for waveGenerator');
      }
      if (!gl) {
        console.log('OceanChunks: Waiting for gl (renderer)');
      }
      return;
    }

    const initOceanChunks = async () => {
      try {
        console.log('Initializing ocean chunks...');
        console.log('Wave generator:', waveGenerator);
        console.log('Wave generator properties:', {
          cascades: waveGenerator.cascades,
          size: waveGenerator.size,
          lodScale: waveGenerator.lodScale,
          waveLengths: waveGenerator.waveLengths,
          hasParams: !!waveGenerator.params_,
        });

        const sunpos = new THREE.Vector3(100000, 0, 100000);

        // Create ocean chunk manager
        const oceanManager = new OceanChunkManager();

        // Get GUI - check if it exists in params or create new one
        let gui;
        if (waveGenerator.params_?.gui) {
          gui = waveGenerator.params_.gui;
        } else {
          const GUI = (await import('three/addons/libs/lil-gui.module.min.js')).GUI;
          gui = new GUI();
        }

        // Initialize with wave generator reference
        await oceanManager.Init({
          scene,
          camera,
          renderer: gl,
          sunpos,
          waveGenerator,
          layer: 0,
          gui,
          guiParams: {},
        });

        oceanManagerRef.current = oceanManager;
        initializedRef.current = true;
        console.log('Ocean chunks initialized successfully');
        
        // Notify parent that ocean manager is ready (so we can access sky)
        if (onOceanManagerReady) {
          onOceanManagerReady(oceanManager);
        }
      } catch (error) {
        console.error('Failed to initialize ocean chunks:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : 'No stack',
          waveGenerator: waveGenerator,
        });
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
      
      // Debug: Check if chunks are being created
      if (oceanManagerRef.current.chunks_) {
        const chunkCount = Object.keys(oceanManagerRef.current.chunks_).length;
        if (chunkCount > 0 && !oceanManagerRef.current._loggedChunks) {
          console.log(`Ocean chunks created: ${chunkCount}`);
          console.log('Chunk details:', oceanManagerRef.current.chunks_);
          oceanManagerRef.current._loggedChunks = true;
        }
      }
    } catch (error) {
      console.error('Error updating ocean:', error);
    }
  });

  return null;
}
