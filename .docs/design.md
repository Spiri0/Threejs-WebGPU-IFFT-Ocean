# Ship-at-Sea Simulator Design Document

## 1. Overview
The Ship-at-Sea Simulator is an immersive audiovisual experience designed to simulate piloting a ship through realistic ocean conditions. The project aims to combine high-fidelity graphics with interactive gameplay elements, allowing users to experience the open sea, weather systems, and crew-based mechanics in a multiplayer environment.

## 2. Technology Stack
-   **Core Framework:** [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber) - A React renderer for Three.js.
-   **Rendering Engine:** [Three.js](https://threejs.org/) with **WebGPU Renderer** for advanced compute shader capabilities.
-   **Build Tool:** [Vite](https://vitejs.dev/) for fast development and HMR.
-   **Language:** JavaScript (ES Modules).
-   **Shaders:** WGSL (WebGPU Shading Language) for compute and fragment shaders.
-   **UI/Controls:** [Leva](https://github.com/pmndrs/leva) for debug and parameter controls.
-   **State Management:** React Hooks / Context (potential for Zustand in future).
-   **Networking:** [PeerJS](https://peerjs.com/) (planned) for P2P multiplayer.

## 3. Architecture

### 3.1. Directory Structure
```
src/
├── components/
│   ├── Ocean/          # Core ocean simulation components
│   │   ├── Ocean.jsx   # Main ocean component (LOD, Chunk management)
│   │   ├── useWaves.js # Hook for wave simulation logic
│   │   └── waves/      # WGSL shaders and compute kernels
│   ├── Ship/           # Ship model and physics (planned)
│   └── UI/             # HUD, Mini-map, Menus (planned)
├── resources/          # Assets (textures, models, raw shaders)
├── App.jsx             # Main application entry, Canvas setup
└── main.jsx            # React DOM root
```

### 3.2. Core Systems

#### Ocean Simulation
-   **IFFT (Inverse Fast Fourier Transform):** Uses compute shaders to generate realistic wave height maps and displacement based on oceanographic spectra (Phillips, JONSWAP).
-   **Cascaded Grids:** Multiple wave cascades (LODs) are mixed to simulate details from small ripples to large swells.
-   **Infinite Ocean:** A quadtree-based chunk system dynamically manages mesh resolution based on camera distance, creating the illusion of an infinite ocean.

#### Rendering
-   **WebGPU:** Fully leverages WebGPU for compute tasks (wave generation) and rendering, enabling high performance.
-   **Post-Processing:** Planned integration of bloom, color grading, and "rainy lens" effects to enhance atmosphere.

#### Physics (Planned)
-   **Buoyancy:** Sampling the wave height textures on the CPU/GPU to apply buoyant forces to the ship hull.
-   **Cloth Simulation:** Verlet integration or similar techniques for realistic sail movement and wind interaction.

## 4. Features Roadmap

### Phase 1: Foundation (Completed)
-   [x] Migration to React Three Fiber.
-   [x] WebGPU Renderer initialization.
-   [ ] IFFT Ocean Simulation port.
-   [ ] Dynamic Ocean Presets (North Sea, Calm, Storm).

### Phase 2: Visuals & Atmosphere
-   [ ] Advanced Water Shader (Foam, Subsurface Scattering).
-   [ ] Dynamic Skybox & Lighting (Day/Night cycle).
-   [ ] Weather Systems:
    -   Volumetric Clouds.
    -   Rain particles (GPU simulated).
    -   Wind effects on water and objects.
-   [ ] Post-processing effects (Rain droplets on lens).

### Phase 3: Ship & Physics
-   [ ] Ship Model Integration.
-   [ ] Buoyancy Physics.
-   [ ] Interactive Sails (Cloth Sim).
-   [ ] Ship Control System (Steering, Throttle).

### Phase 4: Gameplay & Multiplayer
-   [ ] Multiplayer Synchronization (Ship position, Weather).
-   [ ] Crew Roles (Captain, Navigator, Deckhand).
-   [ ] Navigation System (Mini-map, Waypoints).
-   [ ] Damage & Repair Mechanics.

## 5. Design Principles
-   **Realism:** Prioritize physical accuracy in wave motion and lighting.
-   **Immersion:** Minimal UI, focus on atmospheric effects and sound.
-   **Performance:** Heavy use of GPU compute to maintain high frame rates.
