## R3F WebGPU Ocean – Technical Specification and Implementation Notes

### 1. Goals

- **Primary goal**: Run the existing WebGPU IFFT ocean simulation under **React Three Fiber (R3F)** inside a **Next.js 15** app, using **Three.js WebGPURenderer**, with **no WebGL fallback**.
- **Maintain fidelity**: Match the original ocean behavior (IFFT waves, CDLOD ocean chunks, sky, player controller) as closely as possible.
- **Keep React ergonomics**: Use R3F for scene composition, hooks, and integration with the rest of the React app.

### 2. Non‑Goals

- **No WebGL fallback**: If WebGPU is unavailable, show a clear “WebGPU not supported” UI rather than rendering with WebGL.
- **No legacy three.js global instance reuse**: Avoid mixing `three` (WebGL build) and `three/webgpu` in the same runtime.
- **No SSR of 3D scene**: The canvas and all 3D logic remain client‑only; server components may wrap but never execute WebGPU code on the server.

### 3. Target Stack & Versions

Based on the R3F v9 migration guide and `three-gpu-ecosystem-tests` (`next15-app-r3f9-react19` / `next15-pages-r3f9-react19`)  
([R3F v9 guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide#webgpu),  
[three-gpu-ecosystem-tests](https://github.com/verekia/three-gpu-ecosystem-tests)):

- **Next.js**: 15.x (choose app or pages router and stick to it)
- **React**: 19.x
- **React DOM**: 19.x
- **@react-three/fiber**: 9.x
- **@react-three/drei**: latest compatible with R3F 9 and React 19 (expect only a subset of Drei to work with WebGPU)
- **three**: 0.178+ (WebGPU build via `three/webgpu`, TSL via `three/tsl`)
- **Bundler**: Next’s default (SWC)
- **Language**: TypeScript for React/R3F code, existing JS for legacy ocean modules where needed

### 4. High‑Level Architecture

- **Root layout** (`app/layout.tsx`):
  - Defines HTML shell and imports `globals.css`.

- **Ocean page** (`app/page.tsx` or `app/ocean/page.tsx`):
  - Server component that renders a **client‑only** `<Ocean />` component.
  - Either:
    - Uses `dynamic(() => import('@/components/Ocean'), { ssr: false })`, or
    - Marks the page itself with `'use client'` and renders `<Ocean />` directly.

- **Client Ocean root** (`components/Ocean.tsx`):
  - Client component.
  - Checks WebGPU availability (`navigator.gpu`).
  - Renders `<Canvas>` from R3F with **async `gl` prop** returning a `WebGPURenderer`.
  - Owns camera defaults, DPR, and canvas sizing.

- **Scene composition** (`components/OceanScene.tsx`):
  - Pure R3F scene graph:
    - Lights and optional debug geometry.
    - `WaveGenerator`, `OceanChunks`, `Sky`, `PlayerController`.

- **Legacy logic** (`src/`):
  - Reuse existing JS modules for waves, ocean, sky, etc.
  - Wrap them in thin R3F components instead of rewriting everything.

### 5. WebGPU + R3F Integration

#### 5.1 Three / R3F wiring

Top‑level (e.g. in `components/Ocean.tsx` or a shared `three-r3f-setup.ts`):

```ts
import * as THREE from 'three/webgpu';
import { Canvas, extend, type ThreeToJSXElements } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as any);
```

Canvas configuration (in `components/Ocean.tsx`):

```tsx
<Canvas
  gl={async (props) => {
    const renderer = new THREE.WebGPURenderer(props as any);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87ceeb);

    await renderer.init();
    return renderer;
  }}
  camera={{
    fov: 50,
    near: 0.1,
    far: 1e6,
    position: [0, 10, 20],
  }}
  style={{ width: '100vw', height: '100vh' }}
>
  <OceanScene />
</Canvas>
```

Notes:

- The renderer is created and owned by R3F via `gl`. **Do not** create another renderer manually in `useEffect`.
- Cleanup is handled by R3F; avoid calling `dispose()` yourself on the renderer.

#### 5.2 WebGPU availability

In `components/Ocean.tsx`:

```ts
const hasWebGPU =
  typeof navigator !== 'undefined' && 'gpu' in (navigator as any);

if (!hasWebGPU) {
  return (
    <div className="error">
      <h2>WebGPU Not Supported</h2>
      <p>
        Your browser does not support WebGPU. Use a WebGPU‑compatible browser
        (Chrome 113+, Edge 113+, etc.).
      </p>
    </div>
  );
}
```

No WebGL fallback is implemented by design.

### 6. Next.js Integration Details

- All R3F and WebGPU code lives in **client components** (`'use client'`).
- Server components can render client components but must **not import**:
  - `three`, `three/webgpu`, TSL, or ocean modules at top level.
- Browser‑only globals (`window`, `document`, `navigator`, `self`, `navigator.gpu`) are only accessed inside client components and/or within `useEffect`.
- The canvas itself is never SSR‑rendered; it mounts only in the browser.

### 7. Ocean Pipeline Integration

#### 7.1 WaveGenerator

- **Source**: `src/waves/wave-generator.js` and IFFT shader modules under `resources/shader/IFFT`.
- **Wrapper**: `components/WaveGenerator.tsx`.

Responsibilities:

- Get `gl`, `scene`, `camera` from `useThree()`.
- On first mount:
  - Create GUI (`lil-gui` via Drei or direct import).
  - Create `new wave_generator.WaveGenerator()`.
  - Call `Init({ scene, camera, renderer: gl, gui })`.
  - Store `waveGen` in `ref`, set `initializedRef`, and call `onInitialized(waveGen)` prop.
- On unmount:
  - Destroy GUI and any other side resources if API exposes it.

Updates:

- `WaveGenerator` exposes `Update_(dt)`; this will be called from `OceanChunks` or `OceanScene` in a `useFrame` loop.

#### 7.2 OceanChunks / OceanChunkManager

- **Source**: `src/ocean/ocean.js`, `src/ocean/ocean-builder-threaded.js`, `src/ocean/ocean-chunk.js`, `src/ocean/ocean-material.js`, `src/ocean/quadtree.js`.
- **Wrapper**: `components/OceanChunks.tsx`.

Responsibilities:

- Wait for `waveGenerator` and `gl` to be available.
- On first mount:
  - Create `const oceanManager = new OceanChunkManager();`.
  - Call:

    ```ts
    await oceanManager.Init({
      scene,
      camera,
      renderer: gl,
      sunpos: new THREE.Vector3(100000, 0, 100000),
      waveGenerator,
      layer: 0,
      gui: waveGenerator.params_.gui, // or a separate GUI instance
      guiParams: {},
    });
    ```

  - Store `oceanManager` in `ref`, mark as initialized.

- On unmount:
  - If available, call `oceanManager.Destroy?.()` to remove chunks from the scene and dispose materials/geometry.

Per‑frame updates (in `components/OceanChunks.tsx`):

```ts
useFrame((_state, delta) => {
  if (!oceanManagerRef.current || !waveGenerator) return;

  const dt = delta * 1000; // ms

  waveGenerator.Update_?.(dt);
  oceanManagerRef.current.Update_?.(dt);
});
```

#### 7.3 Sky

- **Source**: `src/ocean/sky.js`.
- **Wrapper**: `components/Sky.tsx`.

Responsibilities:

- On mount:
  - Create `new skybox.Sky({ scene, ...params })`.
  - Set layers (e.g. `sky.layers.set(2);`), scale, and TSL parameters.
  - Add sky to `scene`.
- On unmount:
  - Remove from `scene`.
  - Dispose geometry and material(s), including handling arrays of materials.

### 8. Assets, Shaders, and Workers

#### 8.1 Static assets

- All textures moved/served from `public/`:
  - Example: `public/resources/textures/simplex-noise.png`, `public/resources/textures/cube/sky/px.jpg`, etc.
- Texture paths in JS modules:
  - `loader.load('/resources/textures/simplex-noise.png');`
  - `cubeTextureLoader.setPath('/resources/textures/cube/sky/');`

#### 8.2 Shaders

- Keep shader modules under `resources/shader/**` as JS/TS modules.
- Import them from ocean/wave modules using existing relative paths.
- No special Next.js handling is required beyond keeping them out of server‑side imports.

#### 8.3 Workers

- Worker script: `src/ocean/ocean-builder-threaded-worker.js`.
- Entry in `src/ocean/ocean-builder-threaded.js`:

  ```js
  class WorkerThread {
    constructor(entry) {
      this.worker_ = new Worker(entry, { type: 'module' });
      // ...
    }
  }
  ```

- Use a bundler‑friendly entry path, e.g.:

  ```js
  const workerUrl = new URL('./ocean-builder-threaded-worker.js', import.meta.url);
  this.worker_ = new Worker(workerUrl, { type: 'module' });
  ```

- Ensure the worker imports the same Three.js build as the main bundle (via standard imports, not via hard‑coded `../../node_modules/...` paths).

### 9. Error Handling & Diagnostics

- **Top‑level await warnings** from `three/examples/jsm/capabilities/WebGPU.js`:
  - Accept as non‑fatal; they are known issues documented in ecosystem tests.

- **0×0 WebGPU textures / `colorBuffer` errors**:
  - Ensure:
    - Canvas container has non‑zero size (`#canvas-container { width: 100vw; height: 100vh; }`).
    - Use R3F’s async `gl` creation; do not re‑initialize or resize the renderer in competing ways.

- **WebGPU backend type**:
  - Optional: log `renderer.backend` after `await renderer.init()` to confirm WebGPU vs WebGL fallback.

- **Ocean init failures**:
  - Catch and log errors when calling `waveGen.Init` and `oceanManager.Init`.
  - If init fails, render a simple error overlay instead of silently showing a blank canvas.

### 10. Migration Plan (High‑Level)

- **Step 1 – Align dependencies**:
  - Update `package.json` to match a `next15 + react19 + @react-three/fiber@9 + three@0.178+` stack consistent with `next15-app-r3f9-react19` from `three-gpu-ecosystem-tests`.
  - Use `npm i --legacy-peer-deps` or Yarn if needed.

- **Step 2 – Strip old WebGPU wiring**:
  - Remove manual `WebGPURenderer` creation/cleanup in `components/Ocean.tsx`.

- **Step 3 – Implement R3F v9 WebGPU Canvas**:
  - Add `extend(THREE as any)` and `ThreeElements` declaration.
  - Implement async `gl` prop as shown above.

- **Step 4 – Smoke test with debug geometry**:
  - Temporarily render a simple box + lights in `OceanScene`.
  - Confirm rendering works and WebGPU errors are gone.

- **Step 5 – Integrate WaveGenerator**:
  - Wire `components/WaveGenerator.tsx` around `src/waves/wave-generator.js`.
  - Confirm compute shaders run and GUI controls appear.

- **Step 6 – Integrate OceanChunks**:
  - Wire `components/OceanChunks.tsx` around `OceanChunkManager` and threaded builder.
  - Validate that chunks are created and updated.

- **Step 7 – Integrate Sky + PlayerController**:
  - Add sky dome and camera controls.
  - Verify performance and visual correctness.

- **Step 8 – Clean up & harden**:
  - Remove debug meshes/logging.
  - Document any remaining Drei/WebGPU limitations.

This document describes the target architecture and concrete integration points needed to run the existing WebGPU ocean pipeline under R3F 9 and Next 15 using Three.js WebGPURenderer, without WebGL fallback.


