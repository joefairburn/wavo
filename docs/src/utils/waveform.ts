export interface Wave {
  origin: number;
  startTime: number;
}

export const WAVE_CONFIG = {
  SPEED: 0.25,
  LIFETIME: 2.5,
  WIDTH: 0.06,
  ATTACK: 0.3,
  SPAWN_COOLDOWN: 100,
  SPAWN_THRESHOLD: 0.02,
  MAX_WAVES: 10,
} as const;

/**
 * Applies a traveling wave effect - bars start at 0 and wave through.
 * Creates a ripple effect moving across the waveform.
 */
export function applyWaveEffect(
  length: number,
  time: number,
  speed: number = 1.5,
  wavelength: number = 0.15,
): number[] {
  const data: number[] = [];

  for (let i = 0; i < length; i++) {
    // Traveling sine wave - height is purely from the wave
    // Use (1 + sin) / 2 to get values from 0 to 1
    const wave = (1 + Math.sin(time * speed + i * wavelength)) / 2;

    // Scale to reasonable range (0.05 to 0.9)
    const value = 0.05 + wave * 0.85;

    data.push(value);
  }

  return data;
}

/**
 * Generate random waveform data for reduced motion preference.
 * Uses a seeded pseudo-random approach for consistent results.
 */
export function generateRandomWaveform(length: number): number[] {
  const data: number[] = [];
  // Use a simple seeded random for consistent results across renders
  let seed = 42;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < length; i++) {
    // Generate random values that look like audio waveform data
    const value = 0.1 + random() * 0.8;
    data.push(value);
  }
  return data;
}

/**
 * Applies cursor-triggered wave effect to waveform data.
 * Smooth waves emanate outward from their origin point and decay over time.
 */
export function applyWaveFromCursor(
  length: number,
  currentTime: number,
  waves: Wave[],
  baseWave: number[],
): number[] {
  const data: number[] = [];

  for (let i = 0; i < length; i++) {
    const normalizedPosition = i / length;
    let value = baseWave[i];

    for (const wave of waves) {
      const waveAge = (currentTime - wave.startTime) / 1000;

      if (waveAge < 0 || waveAge > WAVE_CONFIG.LIFETIME) continue;

      const distance = Math.abs(normalizedPosition - wave.origin);
      const waveFront = waveAge * WAVE_CONFIG.SPEED;

      // Smooth Gaussian-like bump centered on the wave front
      const distanceFromFront = Math.abs(distance - waveFront);
      const waveShape = Math.exp(
        -(distanceFromFront * distanceFromFront) / (WAVE_CONFIG.WIDTH * WAVE_CONFIG.WIDTH),
      );

      // Fade in during attack phase, then fade out
      const attackProgress = Math.min(1, waveAge / WAVE_CONFIG.ATTACK);
      const fadeIn = attackProgress * attackProgress; // Ease in
      const fadeOut =
        1 - (waveAge - WAVE_CONFIG.ATTACK) / (WAVE_CONFIG.LIFETIME - WAVE_CONFIG.ATTACK);
      const envelope = waveAge < WAVE_CONFIG.ATTACK ? fadeIn : Math.max(0, fadeOut * fadeOut);

      const waveContribution = waveShape * envelope * 0.2;
      value = Math.max(0.05, Math.min(0.95, value + waveContribution));
    }

    data.push(value);
  }

  return data;
}
