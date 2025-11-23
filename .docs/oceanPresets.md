# Ocean Simulation Presets & Physics

This document details the configuration presets used in the Ocean simulation and provides a deep technical explanation of the underlying physical models.

## The Physical Model

The ocean surface is generated using the **JONSWAP (Joint North Sea Wave Project)** spectrum, an empirical relationship that defines the distribution of wave energy with respect to frequency. This model is particularly suited for developing seas in a limited fetch situation (like the North Sea), making it more versatile than the fully developed Pierson-Moskowitz spectrum.

The simulation superimposes **two distinct wave systems** (spectra) to create complex sea states:
1.  **Primary Spectrum**: The dominant swell driven by the main wind.
2.  **Secondary Spectrum**: A cross-swell or local wind sea, often originating from a different direction.

The final wave height field is synthesized using **Inverse Fast Fourier Transform (IFFT)** on these spectra.

---

## Wave Parameters Deep Dive

### 1. Spectrum Generation (JONSWAP)

*   **`windSpeed` ($U_{10}$)**: The wind velocity at 10m above sea level. This is the primary driver of wave energy.
    *   *Effect*: Higher wind speeds shift the peak frequency lower (longer waves) and increase total energy (higher waves).

*   **`fetch` ($F$)**: The distance over which the wind has blown without obstruction.
    *   *Physics*: Waves need both time and distance to grow. A short fetch limits wave growth even with high winds (young sea). A long fetch allows waves to reach equilibrium (fully developed sea).
    *   *Formula*: In JONSWAP, fetch affects the peak frequency $\omega_p$ and the Phillips constant $\alpha$.
    *   *Visual*: Increasing fetch makes waves larger and more organized.

*   **`peakEnhancement` ($\gamma$)**: The "peakiness" factor of the spectrum.
    *   *Physics*: Controls the concentration of energy around the peak frequency.
    *   *Values*:
        *   $\gamma = 1.0$: Reduces to the **Pierson-Moskowitz** spectrum (fully developed sea).
        *   $\gamma = 3.3$: Standard mean JONSWAP value (developing sea).
        *   $\gamma > 5.0$: Very young, steep, and "peaky" seas.
    *   *Visual*: Higher values create more regular, rhythmic waves; lower values look more chaotic and broad.

*   **`swell`**: A linear scaler for the wave amplitude.
    *   *Implementation*: Directly multiplies the output spectrum energy. Used to artificially exaggerate or dampen wave heights for artistic control.

### 2. Directional Spreading

Waves don't just move in the wind direction; they spread out. The simulation uses a frequency-dependent directional spreading function $D(\theta, \omega)$.

*   **`windDirection`**: The mean direction of wave propagation.

*   **`spreadBlend`**: Controls the mixing between two spreading models:
    *   **Low Value (0.0)**: Tighter, more directional spreading (Mitsuyasu-type). Energy is concentrated in the wind direction.
    *   **High Value (1.0)**: Broader, cosine-squared distribution ($\cos^2 \theta$).
    *   *Visual*: Low values look like organized swells (long-crested); high values look like short-crested, chaotic chop.

### 3. High-Frequency Filtering

*   **`shortWaveFade` & `fadeLimit`**:
    *   *Purpose*: To remove high-frequency noise that can cause aliasing or look like "static" on the water surface.
    *   *Mechanism*: Applies a low-pass filter to the spectrum, dampening wavenumbers $k$ above a certain threshold.

---

## Presets Analysis

### 1. Calm
*   **Scenario**: A tranquil day with light breezes.
*   **Physics**:
    *   Low `windSpeed` (5.0) produces small amplitudes.
    *   $\gamma=1.0$ (Peak Enhancement) implies a fully developed, relaxed sea state (Pierson-Moskowitz).
    *   High `spreadBlend` (1.0) creates gentle, multi-directional ripples rather than organized rows of waves.

### 2. Average
*   **Scenario**: Standard open ocean conditions.
*   **Physics**:
    *   Moderate `windSpeed` (12.0).
    *   $\gamma=2.0$: Slightly more peaked than fully developed, indicating some active wind forcing.
    *   `spreadBlend` (0.8): Waves are mostly directional but still have significant angular spread.

### 3. Storm
*   **Scenario**: High-energy, dangerous sea state.
*   **Physics**:
    *   **High Energy**: `windSpeed` (28.0) and massive `fetch` (500km) create huge waves.
    *   **Young Sea**: High `peakEnhancement` (3.5) indicates a sea that is still actively growing and responding to the storm winds. The energy is tightly focused around the peak frequency.
    *   **Directional Focus**: Low `spreadBlend` (0.2) means the waves are driving hard in the wind direction, creating long, powerful crests.
    *   **Confused Sea**: The secondary wave system (Cross Swell) hits at ~240°, breaking up the primary swell and creating the chaotic, crashing interference patterns typical of a storm center.

```
export const OceanPresets = {
    Calm: {
        name: "Calm",
        firstWave: {
            windSpeed: 5.0,
            windDirection: 0.0,
            fetch: 100000,
            spreadBlend: 1.0,
            swell: 0.2,
            peakEnhancement: 1.0,
            shortWaveFade: 0.01,
            fadeLimit: 0.01
        },
        secondWave: {
            d_windSpeed: 2.0,
            d_windDirection: 240.0 / 360.0 * 2 * Math.PI,
            d_fetch: 50000,
            d_spreadBlend: 1.0,
            d_swell: 0.1,
            d_peakEnhancement: 1.0,
            d_shortWaveFade: 0.01,
            d_fadeLimit: 0.01
        }
    },
    Average: {
        name: "Average",
        firstWave: {
            windSpeed: 12.0,
            windDirection: 0.0,
            fetch: 300000,
            spreadBlend: 0.8,
            swell: 0.5,
            peakEnhancement: 2.0,
            shortWaveFade: 0.05,
            fadeLimit: 0.1
        },
        secondWave: {
            d_windSpeed: 8.0,
            d_windDirection: 240.0 / 360.0 * 2 * Math.PI,
            d_fetch: 150000,
            d_spreadBlend: 0.8,
            d_swell: 0.3,
            d_peakEnhancement: 1.5,
            d_shortWaveFade: 0.05,
            d_fadeLimit: 0.1
        }
    },
    Storm: {
        name: "Storm",
        firstWave: {
            windSpeed: 28.0,
            windDirection: 0.0,
            fetch: 500000,
            spreadBlend: 0.2,
            swell: 1.0,
            peakEnhancement: 3.5,
            shortWaveFade: 0.1,
            fadeLimit: 0.2
        },
        secondWave: {
            d_windSpeed: 20.0,
            d_windDirection: 240.0 / 360.0 * 2 * Math.PI,
            d_fetch: 300000,
            d_spreadBlend: 0.2,
            d_swell: 0.8,
            d_peakEnhancement: 3.0,
            d_shortWaveFade: 0.1,
            d_fadeLimit: 0.2
        }
    }
};
````

