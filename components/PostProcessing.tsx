'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three/webgpu';
import { pass, mrt, output, uv, uniform, vec2, mix, distance, smoothstep, mul, vec4, vec3, If, abs } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';

interface PostProcessingProps {
  enabled: boolean;
  bloom?: {
    enabled: boolean;
    intensity: number;
    threshold: number;
    smoothing: number;
  };
  toneMapping?: {
    enabled: boolean;
    exposure: number;
    mode: THREE.ToneMapping;
  };
  vignette?: {
    enabled: boolean;
    offset: number;
    intensity: number;
  };
}

export default function PostProcessing({
  enabled,
  bloom: bloomSettings,
  toneMapping,
  vignette: vignetteSettings,
}: PostProcessingProps) {
  const { gl, scene, camera, size } = useThree();
  const renderer = gl as unknown as THREE.WebGPURenderer;
  const postProcessingRef = useRef<THREE.PostProcessing | null>(null);

  useEffect(() => {
    if (!enabled || !renderer || !scene || !camera) {
      postProcessingRef.current = null;
      return;
    }

    try {
      // Create scene pass
      const scenePass = pass(scene, camera, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      });

      // Setup Multiple Render Targets (MRT) for additional data
      scenePass.setMRT(
        mrt({
          output: output,
        })
      );

      // Get scene texture
      const scenePassColor = scenePass.getTextureNode('output');

      // Build output node starting with scene color
      // Ensure it's treated as a color vector (vec4)
      let outputNode: any = vec4(scenePassColor);

      // Add bloom if enabled
      if (bloomSettings?.enabled) {
        const bloomPass = bloom(
          scenePassColor,
          bloomSettings.intensity || 2.5,
          bloomSettings.smoothing || 0.5,
          bloomSettings.threshold || 0.6
        );
        // Add bloom to scene color
        outputNode = outputNode.add(bloomPass);
      }

      // Add vignette if enabled
      if (vignetteSettings?.enabled) {
        const uvNode = uv();
        const offset = uniform(vignetteSettings.offset || 0.5);
        const intensity = uniform(vignetteSettings.intensity ?? -0.5);
        
        // Calculate distance from center (0.5, 0.5)
        const center = vec2(0.5, 0.5);
        const dist = distance(uvNode, center);
        
        // Create vignette mask using smoothstep
        const maxDist = 0.707; // Maximum distance to corner
        const distNormalized = mul(dist, 1.0 / maxDist);
        
        // Create smooth vignette falloff
        const vignetteAmount = smoothstep(offset, 1.0, distNormalized);
        
        // Determine target color based on intensity sign
        // Intensity > 0: White (Brighten)
        // Intensity < 0: Black (Darken)
        const targetColor = vec3(
            mix(0.0, 1.0, intensity.greaterThan(0))
        );

        // Mix current color with target color based on absolute intensity and vignette amount
        const mixFactor = mul(abs(intensity), vignetteAmount);
        
        // Apply only to RGB channels
        const rgb = mix(outputNode.rgb, targetColor, mixFactor);
        outputNode = vec4(rgb, outputNode.a);
      }

      // Add SMAA anti-aliasing
      outputNode = smaa(outputNode);

      // Setup post-processing with output node
      const postProcessing = new THREE.PostProcessing(renderer);
      postProcessing.outputNode = outputNode;
      postProcessingRef.current = postProcessing;

      // Handle resize
      const handleResize = () => {
        // Cast to any to access setSize if it exists (it's in the reference implementation but maybe missing from types)
        const pp = postProcessingRef.current as any;
        if (pp && pp.setSize) {
          pp.setSize(size.width, size.height);
          pp.needsUpdate = true;
        }
      };

      handleResize();

      return () => {
        postProcessingRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize post-processing:', error);
      postProcessingRef.current = null;
    }
  }, [enabled, renderer, scene, camera, size, bloomSettings, vignetteSettings]);

  // Update tone mapping in real-time (works directly on renderer)
  useEffect(() => {
    if (!renderer || !enabled) return;
    
    if (toneMapping?.enabled) {
      renderer.toneMapping = toneMapping.mode;
      renderer.toneMappingExposure = toneMapping.exposure;
    } else {
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.toneMappingExposure = 1.0;
    }
  }, [renderer, enabled, toneMapping]);

  // Render post-processing in useFrame with priority 1 (after main render)
  useFrame(() => {
    if (enabled && postProcessingRef.current) {
      renderer.clear();
      postProcessingRef.current.render();
    }
  }, 1);

  return null;
}

