# Changelog - React Three Fiber Port

## [1.0.0] - 2025-11-22

### Added
- Complete React Three Fiber (R3F) port of the vanilla Three.js ocean simulation
- Next.js 14+ App Router architecture for production deployment
- Vercel deployment configuration with proper WebGPU headers
- Modern React component architecture:
  - `Ocean.tsx` - Main canvas wrapper with WebGPU renderer
  - `OceanScene.tsx` - Scene orchestrator
  - `OceanChunks.tsx` - CDLOD chunk manager wrapper
  - `WaveGenerator.tsx` - IFFT cascade system wrapper
  - `Sky.tsx` - Sky dome component
  - `PlayerController.tsx` - Camera controls with keyboard input
- TypeScript support for components
- Updated README with R3F architecture and deployment instructions
- `.gitignore` for Next.js projects
- `vercel.json` for deployment configuration
- ESLint configuration for Next.js

### Changed
- Migrated from vanilla Three.js to React Three Fiber
- Converted entity system to React component lifecycle
- Updated package.json for Next.js and R3F dependencies
- Simplified player controller to use React hooks instead of entity components
- Enhanced error handling for WebGPU support detection
- Optimized for Vercel deployment with standalone output mode

### Technical Details
- Maintains all original ocean simulation features
- Preserves IFFT compute shader pipeline
- Keeps CDLOD quadtree system intact
- Reuses existing ocean geometry, materials, and shaders
- Full WebGPU compute support with SharedArrayBuffer enabled
- Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers configured

### Dependencies
- next: ^14.2.0
- react: ^18.3.0
- react-dom: ^18.3.0
- @react-three/fiber: ^8.16.0
- @react-three/drei: ^9.105.0
- three: ^0.179.0 (maintained from original)
- leva: ^0.9.35 (replaced lil-gui integration)
- zustand: ^4.5.0

### Breaking Changes
- No longer supports vanilla HTML/JS entry point (`index.html`)
- Requires Node.js 18+ for development and building
- Build output is Next.js format (not static HTML)

### Migration Notes
If migrating from the vanilla version:
1. Run `npm install` to install new dependencies
2. Use `npm run dev` instead of serving `index.html`
3. Deploy to Vercel instead of GitHub Pages
4. Access at `http://localhost:3000` in development
