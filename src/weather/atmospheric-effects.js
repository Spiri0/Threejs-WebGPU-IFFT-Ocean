import { THREE } from '../three-defs.js';
import { fog, vec3, vec4, float, positionWorld, modelWorldMatrix, cameraPosition } from 'three/tsl';

export class AtmosphericEffects {
  constructor(params) {
    this.scene = params.scene;
    this.camera = params.camera;
    this.renderer = params.renderer;

    this.rainParticles = null;
    this.fogEffect = null;

    this.currentFogDensity = 0;
    this.currentRainIntensity = 0;

    this.initFog();
  }

  initFog() {
    // Distance fog will be added to the scene
    this.scene.fog = new THREE.Fog(0xe0e6ed, 1, 100000);
    this.scene.fog.density = 0;
  }

  initRain() {
    if (this.rainParticles) return;

    // Create rain particle system
    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Distribute particles in a volume around camera
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position in a box around camera
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = Math.random() * 1000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;

      // Downward velocity with some randomness
      velocities[i3] = (Math.random() - 0.5) * 2;
      velocities[i3 + 1] = -(20 + Math.random() * 10);
      velocities[i3 + 2] = (Math.random() - 0.5) * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    // Create rain material
    const material = new THREE.PointsNodeMaterial({
      transparent: true,
      opacity: 0.6,
      size: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    material.colorNode = vec4(0.8, 0.85, 0.9, 0.6);

    this.rainParticles = new THREE.Points(geometry, material);
    this.rainParticles.frustumCulled = false;
    this.rainParticles.visible = false;

    this.scene.add(this.rainParticles);

    // Store initial positions for reset
    this.initialRainPositions = new Float32Array(positions);
  }

  updateRain(deltaTime) {
    if (!this.rainParticles || this.currentRainIntensity === 0) return;

    const positions = this.rainParticles.geometry.attributes.position.array;
    const velocities = this.rainParticles.geometry.attributes.velocity.array;

    const cameraPos = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPos);

    const dt = deltaTime / 1000; // Convert to seconds

    for (let i = 0; i < positions.length; i += 3) {
      // Update position based on velocity
      positions[i] += velocities[i] * dt * this.currentRainIntensity * 50;
      positions[i + 1] += velocities[i + 1] * dt * this.currentRainIntensity * 50;
      positions[i + 2] += velocities[i + 2] * dt * this.currentRainIntensity * 50;

      // Reset particles that fall below a threshold
      if (positions[i + 1] < cameraPos.y - 100) {
        positions[i] = cameraPos.x + (Math.random() - 0.5) * 2000;
        positions[i + 1] = cameraPos.y + 500 + Math.random() * 500;
        positions[i + 2] = cameraPos.z + (Math.random() - 0.5) * 2000;
      }

      // Keep particles near camera
      if (Math.abs(positions[i] - cameraPos.x) > 1000) {
        positions[i] = cameraPos.x + (Math.random() - 0.5) * 2000;
      }
      if (Math.abs(positions[i + 2] - cameraPos.z) > 1000) {
        positions[i + 2] = cameraPos.z + (Math.random() - 0.5) * 2000;
      }
    }

    this.rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  setFog(density, color = null) {
    if (this.scene.fog) {
      this.currentFogDensity = density;

      if (density > 0) {
        // Exponential fog
        const near = 100;
        const far = Math.min(5000 + (1 - density) * 95000, 100000);

        this.scene.fog.near = near;
        this.scene.fog.far = far;

        if (color) {
          const r = Math.floor(color.r * 255);
          const g = Math.floor(color.g * 255);
          const b = Math.floor(color.b * 255);
          this.scene.fog.color.setRGB(color.r, color.g, color.b);
        }
      } else {
        // Disable fog by setting far to very large value
        this.scene.fog.near = 1;
        this.scene.fog.far = 100000;
      }
    }
  }

  setRain(intensity) {
    if (!this.rainParticles && intensity > 0) {
      this.initRain();
    }

    this.currentRainIntensity = intensity;

    if (this.rainParticles) {
      this.rainParticles.visible = intensity > 0;

      // Adjust particle opacity based on intensity
      if (this.rainParticles.material.opacity !== undefined) {
        this.rainParticles.material.opacity = 0.3 + intensity * 0.5;
      }
    }
  }

  applyAtmosphericSettings(settings) {
    // Apply fog settings
    const fogColor = settings.fogColor || { r: 0.9, g: 0.93, b: 0.98 };
    this.setFog(settings.fogDensity || 0, fogColor);

    // Apply rain settings
    this.setRain(settings.rainIntensity || 0);
  }

  update(deltaTime) {
    if (this.currentRainIntensity > 0) {
      this.updateRain(deltaTime);
    }
  }

  dispose() {
    if (this.rainParticles) {
      this.rainParticles.geometry.dispose();
      this.rainParticles.material.dispose();
      this.scene.remove(this.rainParticles);
      this.rainParticles = null;
    }
  }
}
