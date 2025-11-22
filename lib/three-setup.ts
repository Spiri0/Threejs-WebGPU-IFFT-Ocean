// Three.js WebGPU imports - centralized for easier management
import * as THREE from 'three';
import WebGPU from 'three/addons/capabilities/WebGPU.js';

// Export everything we need
export { THREE, WebGPU };

// Check WebGPU support
export function checkWebGPUSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return WebGPU.isAvailable();
}

export function getWebGPUErrorMessage(): HTMLElement | null {
  if (typeof window === 'undefined') return null;
  return WebGPU.getErrorMessage();
}
