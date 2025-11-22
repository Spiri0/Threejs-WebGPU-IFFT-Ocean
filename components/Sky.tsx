'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
// @ts-ignore - JS module
import { skybox } from '../src/ocean/sky.js';

export default function Sky() {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene) return;

    // Create sky dome
    const sky = new skybox.Sky({
      scene,
    });

    sky.layers.set(2);
    sky.scale.setScalar(500000);
    scene.add(sky);

    return () => {
      scene.remove(sky);
      sky.geometry?.dispose();
      if (sky.material) {
        if (Array.isArray(sky.material)) {
          sky.material.forEach((m: any) => m.dispose());
        } else {
          sky.material.dispose();
        }
      }
    };
  }, [scene]);

  return null;
}
