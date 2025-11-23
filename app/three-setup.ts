'use client';

/**
 * React Three Fiber v9 WebGPU Setup
 * This file must be imported at the root level to extend R3F with WebGPU types
 */

import * as THREE from 'three/webgpu';
import { extend, type ThreeToJSXElements } from '@react-three/fiber';

// Extend R3F's ThreeElements interface to include WebGPU types
declare module '@react-three/fiber' {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// Register all WebGPU components with R3F
extend(THREE as any);
