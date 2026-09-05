/** Deterministic PRNG (mulberry32) so seed data is stable across reloads and test runs. */
export function createSeededRandom(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]
}

export function randomInt(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}
