import { select } from "d3-selection";

/**
 * Clean up all SVG content from a container, interrupting D3 transitions first.
 * Safe to call with null — will early return.
 */
export function cleanupD3Svg(container: HTMLElement | null): void {
  if (!container) return;
  select(container).selectAll("*").interrupt();
  container.innerHTML = "";
}

/**
 * Format large numbers for chart axes and labels.
 * 1500 -> "1.5K", 2500000 -> "2.5M", 42 -> "42"
 * Removes trailing ".0" (e.g., 1.0K -> "1K")
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    const formatted = (value / 1_000_000).toFixed(1);
    return formatted.endsWith(".0")
      ? `${formatted.slice(0, -2)}M`
      : `${formatted}M`;
  }
  if (value >= 1_000) {
    const formatted = (value / 1_000).toFixed(1);
    return formatted.endsWith(".0")
      ? `${formatted.slice(0, -2)}K`
      : `${formatted}K`;
  }
  return value.toLocaleString();
}

/**
 * Generate time-series data with realistic random-walk variation.
 * Each point is 5 minutes apart. Values stay within the given range
 * and use a random walk to avoid abrupt jumps.
 *
 * @param points - Number of data points to generate
 * @param range - [min, max] value bounds
 * @param startTime - Optional start time (defaults to `points * 5min` before now)
 */
export function generateTimeSeriesData(
  points: number,
  range: [number, number],
  startTime?: Date
): Array<{ time: Date; value: number }> {
  const [min, max] = range;
  const start = startTime ?? new Date(Date.now() - points * 5 * 60 * 1000);
  const data: Array<{ time: Date; value: number }> = [];

  let prevValue = min + Math.random() * (max - min);

  for (let i = 0; i < points; i++) {
    const time = new Date(start.getTime() + i * 5 * 60 * 1000);

    // Random walk: drift up to 10% of the range per step
    const drift = (Math.random() - 0.5) * 0.1 * (max - min);
    let value = prevValue + drift;

    // Clamp within bounds
    value = Math.max(min, Math.min(max, value));
    prevValue = value;

    data.push({ time, value });
  }

  return data;
}

/**
 * Add random jitter to a value within a percentage range.
 * Useful for making hardcoded data feel "alive" on each page load.
 *
 * @param value - Base value
 * @param percent - Jitter range as percentage (default: 5 = +/-5%)
 */
export function addJitter(value: number, percent: number = 5): number {
  return value + (Math.random() - 0.5) * 2 * value * (percent / 100);
}

/**
 * Create a debounced ResizeObserver that fires the callback
 * only after the element stops resizing for `delay` milliseconds.
 *
 * @param callback - Receives the element's new width and height
 * @param delay - Debounce delay in ms (default: 150)
 */
export function createDebouncedResizeObserver(
  callback: (width: number, height: number) => void,
  delay: number = 150
): ResizeObserver {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return new ResizeObserver((entries) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        callback(width, height);
      }
    }, delay);
  });
}
