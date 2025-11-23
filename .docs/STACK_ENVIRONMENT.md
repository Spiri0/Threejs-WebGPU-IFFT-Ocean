# Stack and Environment Configuration

**⚠️ CRITICAL: DO NOT CHANGE THE BUILD SYSTEM OR FRAMEWORK**

This document defines the exact stack and environment for this project. **Do not modify the build system, framework, or package.json structure without explicit approval.**

## Current Stack

### Framework & Build System
- **Framework**: Next.js 15.1.1 (App Router)
- **Build Tool**: Next.js built-in (NOT Vite, NOT Create React App)
- **Node Version**: >= 21.0.0 (required by engines field)

### Core Dependencies
- **React**: 19.0.0
- **React DOM**: 19.0.0
- **Three.js**: 0.179.0 (WebGPU variant)
- **React Three Fiber**: 9.0.0
- **@react-three/drei**: 10.7.7
- **Leva**: 0.10.1 (GUI controls)
- **Zustand**: 4.5.0 (state management)

### Development Dependencies
- **TypeScript**: 5.0.0
- **ESLint**: 8.0.0 with eslint-config-next
- **@types/node**: 20.0.0
- **@types/react**: 19.0.0
- **@types/react-dom**: 19.0.0
- **@types/three**: 0.179.0

## Package.json Structure

The `package.json` **MUST** maintain this exact structure:

```json
{
  "name": "threejs-webgpu-ocean-r3f",
  "version": "2.0.0",
  "description": "WebGPU IFFT Ocean Simulation with React Three Fiber v9",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.0.0",
    "leva": "^0.10.1",
    "next": "^15.1.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.179.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/three": "^0.179.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.1.1",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=21.0.0"
  }
}
```

## Critical Configuration Files

### next.config.js
- **DO NOT REMOVE** - Required for WebGPU support
- Contains webpack aliases for Three.js WebGPU builds
- Sets Cross-Origin headers for SharedArrayBuffer support
- Enables top-level await for WebGPU.js

### tsconfig.json
- Configured for Next.js with App Router
- Path aliases: `@/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`
- Target: esnext, module: esnext

## Project Structure

```
├── app/                    # Next.js App Router (REQUIRED)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── three-setup.ts
├── components/             # React Three Fiber components
│   ├── Ocean.tsx
│   ├── OceanScene.tsx
│   ├── OceanChunks.tsx
│   ├── WaveGenerator.tsx
│   ├── Sky.tsx
│   └── ...
├── src/                   # Original vanilla Three.js code (legacy)
│   ├── ocean/
│   └── waves/
└── resources/             # Shaders and assets
    └── shader/
```

## ⚠️ DO NOT DO THESE THINGS

1. **DO NOT** change from Next.js to Vite, Create React App, or any other framework
2. **DO NOT** remove or modify the `next.config.js` file
3. **DO NOT** change the `dev` script from `next dev` to anything else
4. **DO NOT** remove dependencies without understanding their purpose
5. **DO NOT** downgrade React or Next.js versions without checking compatibility
6. **DO NOT** add Vite dependencies or create vite.config.js (it exists but is legacy/unused)
7. **DO NOT** modify the `engines.node` requirement
8. **DO NOT** change the package.json structure or remove required fields

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## If Dependencies Are Missing

If `npm run dev` fails with "command not found" errors:

1. **DO NOT** change the package.json
2. **DO** run `npm install` to sync dependencies
3. **DO** check that you're on the correct branch (main at commit c1b0baf4 or later)
4. **DO** verify Node.js version: `node --version` (must be >= 21.0.0)

## Deployment

- **Platform**: Vercel
- **Output**: standalone (configured in next.config.js)
- **Headers**: COEP/COOP required for WebGPU SharedArrayBuffer

## Legacy Files (Removed)

- ~~`vite.config.js`~~ - **REMOVED** - Legacy file, project uses Next.js now
- ~~`index.html`~~ - **REMOVED** - Legacy file, Next.js uses App Router

## Active Source Code

- `src/` directory - **ACTIVELY USED** - Contains core ocean simulation logic imported by React components:
  - `components/WaveGenerator.tsx` imports `../src/waves/wave-generator.js`
  - `components/OceanChunks.tsx` imports `../src/ocean/ocean.js`
  - `components/OceanControlsInternal.tsx` imports `../src/waves/wave-constants.js`
  - `components/Sky.tsx` imports `../src/ocean/sky.js`
  
  **DO NOT REMOVE** - This is the core simulation engine used by the React wrapper components.

## Git Branch Status

- **Main branch**: Should be at commit `c1b0baf4` ("Added postprocessing") or later
- **DO NOT** revert to older commits that use Vite or different build systems
- If you see a minimal package.json with only `three` dependency, you're on the wrong commit

---

**Last Updated**: After reset to commit c1b0baf45f0d472b148c4e37a5403fa4b1ce4459
**Purpose**: Prevent accidental framework/build system changes by AI agents

