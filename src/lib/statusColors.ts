/**
 * Fixed, pre-validated status colors (not eyeballed) — reserved meaning,
 * shared between dashboard charts and stock-status badges elsewhere in the
 * app, per the project's data-viz color method.
 */
export const STATUS_COLORS = {
  good: '#0ca30c', // in-stock
  warning: '#fab219', // low-stock
  critical: '#d03b3b', // out-of-stock
} as const
