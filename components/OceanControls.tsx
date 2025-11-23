'use client';

import dynamic from 'next/dynamic';

interface OceanControlsProps {
  waveGenerator: any;
  oceanManager: any;
  onSkyChange?: (params: any) => void;
  onOceanChange?: (params: any) => void;
}

// Dynamically import the internal component that uses Leva
// This ensures Leva is only loaded on the client and avoids SSR issues
const OceanControlsInternal = dynamic(() => import('./OceanControlsInternal'), {
  ssr: false,
});

export default function OceanControls({ waveGenerator, oceanManager, onSkyChange, onOceanChange }: OceanControlsProps) {
  if (!waveGenerator || !oceanManager || typeof window === 'undefined') {
    return null;
  }

  return <OceanControlsInternal waveGenerator={waveGenerator} oceanManager={oceanManager} onSkyChange={onSkyChange} onOceanChange={onOceanChange} />;
}

