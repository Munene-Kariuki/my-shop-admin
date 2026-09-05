/**
 * Fixed, pre-validated colors (not eyeballed) — status hues for stock-status
 * state and a single sequential hue for magnitude comparison, per the
 * project's data-viz color method.
 */
export const STATUS_COLORS = {
  good: '#0ca30c', // in-stock
  warning: '#fab219', // low-stock
  critical: '#d03b3b', // out-of-stock
} as const

export const SEQUENTIAL_BLUE = '#2a78d6'
