'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function PlayerController() {
  const { camera } = useThree();
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const positionRef = useRef(new THREE.Vector3(0, 10, 20));
  const quaternionRef = useRef(new THREE.Quaternion());
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Keyboard input handling
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    });
  }

  useFrame((state, delta) => {
    const keys = keysRef.current;
    const velocity = velocityRef.current;
    const position = positionRef.current;
    const quaternion = quaternionRef.current;

    // Movement parameters
    const acceleration = 30;
    const deceleration = 0.9;
    const rotationSpeed = 1.5;
    const timeInSeconds = delta;

    // Apply deceleration
    velocity.multiplyScalar(deceleration);

    // Forward/backward movement
    if (keys['w'] || keys['arrowup']) {
      velocity.z = -acceleration * timeInSeconds;
    }
    if (keys['s'] || keys['arrowdown']) {
      velocity.z = acceleration * timeInSeconds;
    }

    // Rotation (left/right)
    if (keys['a'] || keys['arrowleft']) {
      const axis = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion();
      q.setFromAxisAngle(axis, rotationSpeed * timeInSeconds);
      quaternion.multiply(q);
    }
    if (keys['d'] || keys['arrowright']) {
      const axis = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion();
      q.setFromAxisAngle(axis, -rotationSpeed * timeInSeconds);
      quaternion.multiply(q);
    }

    // Vertical movement
    if (keys[' '] || keys['shift']) {
      velocity.y = (keys[' '] ? 1 : -1) * acceleration * timeInSeconds;
    }

    // Apply velocity to position
    const velocityFrame = velocity.clone().applyQuaternion(quaternion);
    position.add(velocityFrame);

    // Update camera
    camera.position.copy(position);
    camera.quaternion.copy(quaternion);
  });

  return null;
}
