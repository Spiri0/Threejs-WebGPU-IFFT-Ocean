# Threejs-WebGPU-IFFT-Ocean (React Three Fiber Edition)

![ocean_social](https://github.com/user-attachments/assets/31a04239-c9e2-4e16-ac56-af78e51e4560)

## 🌊 React Three Fiber Port

This is a **React Three Fiber (R3F)** port of the WebGPU IFFT Ocean simulation, optimized for deployment on **Vercel**. The original vanilla Three.js implementation has been converted to modern React components while maintaining all the advanced ocean simulation features.

### ✨ Features

- 🌊 **Physically accurate ocean simulation** using JONSWAP spectrum model
- ⚡ **WebGPU compute shaders** for real-time IFFT (Inverse Fast Fourier Transform)
- 🎯 **3-cascade system** for multi-scale wave detail (5m, 17m, 250m wavelengths)
- 🗺️ **CDLOD (Continuous Distance LOD)** with quadtree spatial partitioning
- 🌅 **Dynamic sky dome** with atmospheric scattering
- 🎮 **Interactive camera controls** (WASD + Arrow keys)
- ⚙️ **Real-time GUI controls** for wave parameters
- 🚀 **Optimized for Vercel** deployment

### 🏗️ Architecture

**Technology Stack:**
- **Next.js 14+** - React framework for production
- **React Three Fiber** - React renderer for Three.js
- **WebGPU** - GPU compute for IFFT ocean simulation
- **Three.js r0.179.0** - WebGPU variant
- **Leva** - GUI controls
- **Vercel** - Deployment platform

**Project Structure:**
```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Ocean.tsx          # Main canvas wrapper
│   ├── OceanScene.tsx     # Scene orchestrator
│   ├── OceanChunks.tsx    # CDLOD chunk manager
│   ├── WaveGenerator.tsx  # IFFT cascade system
│   ├── Sky.tsx            # Sky dome
│   └── PlayerController.tsx # Camera controls
├── lib/                   # Utilities
│   └── three-setup.ts     # Three.js WebGPU setup
├── src/                   # Original ocean simulation code
│   ├── ocean/             # Ocean geometry & materials
│   ├── waves/             # IFFT wave generation
│   └── resources/shader/  # WGSL compute & render shaders
└── next.config.js         # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A browser with WebGPU support (Chrome 113+, Edge 113+)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the ocean simulation.

### 🎮 Controls

- **W / ↑** - Move forward
- **S / ↓** - Move backward
- **A / ←** - Rotate left
- **D / →** - Rotate right
- **Space** - Move up
- **Shift** - Move down

### 📦 Deployment to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect Next.js and deploy
4. Done! Your ocean simulation is live

Or use the Vercel CLI:
```bash
npm install -g vercel
vercel
```

The deployment includes proper headers for WebGPU's SharedArrayBuffer support (Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy).

## 📚 Technical Details

### Ocean Simulation

This is a physically real ocean simulation using the **JONSWAP ocean model** and **inverse fast fourier transformation**.

**March 26, 2025 Update:** Switched from storage textures to storage buffers, improving performance significantly. Now supports 3x512 cascade resolution (up from 4x256).

**Wave Parameters:**
- IFFT Resolution: 512×512 per cascade
- Length Scales: [250, 17, 5] meters
- Lambda (Choppiness): [0.9, 0.9, 0.9]
- Foam Strength: 0.8
- Foam Threshold: 2.7

**CDLOD Parameters:**
- Ocean Size: 500,000 world units
- Min LOD Radius: 15
- LOD Layers: 15
- Cell Resolution: 36 vertices per patch

You can adjust resolution in `src/ocean/ocean-constants.js` using `QT_OCEAN_MIN_CELL_RESOLUTION` (even numbers only).

### Performance Notes

In the original GitHub Pages deployment, SharedArrayBuffers were disabled for compatibility. With Vercel deployment and proper CORS headers, SharedArrayBuffers are fully enabled for maximum performance.

**GPU Compute Cost (per frame):**
- 3 cascades × (1 time spectrum + 4 IFFT + merge) = ~2000 WGSL workgroups
- Memory Usage: ~25-30 MB VRAM
- CPU Overhead: 1-2ms main thread, 5-10ms workers

### Related Projects

For physically accurate buoyancy simulations, check out the [Threejs-WebGPU-Voxelizer](https://github.com/Spiri0/Threejs-WebGPU-Voxelizer). It allows precise volume calculation of water displacement for any shape.

## 📸 Screenshots


I use a much more efficient and advanced techniques to create limitless landscapes. But this repo is pretty good to get into the topic of procedural geometry

<img src="https://github.com/user-attachments/assets/795292f1-2da2-47dc-aa9e-0ca704c77f2d" width="400" />
<img src="https://github.com/user-attachments/assets/3b18ffde-3c6e-4e5a-ba33-de9989a46925" width="400" />
<img src="https://github.com/user-attachments/assets/32781cca-e688-4de1-ad2e-48a0f630b9ec" width="400" />
<img src="https://github.com/user-attachments/assets/6e9f6bfb-479b-40b2-8d51-29118167a93a" width="400" />



