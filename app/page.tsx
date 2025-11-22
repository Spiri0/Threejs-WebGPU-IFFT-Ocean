'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the Ocean component with no SSR
const Ocean = dynamic(() => import('@/components/Ocean'), {
  ssr: false,
  loading: () => (
    <div className="loading">
      <div>Loading WebGPU Ocean Simulation...</div>
      <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
        Requires WebGPU-compatible browser
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="loading">
            Initializing...
          </div>
        }
      >
        <Ocean />
      </Suspense>
    </main>
  );
}
