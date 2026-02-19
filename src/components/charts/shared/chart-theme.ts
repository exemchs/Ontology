/**
 * Chart color tokens resolved from CSS variables.
 * Used by D3 charts that need concrete color strings
 * (e.g., for transitions, gradients, or canvas rendering).
 */
export interface ChartColors {
  /** Series colors (1-8) for multi-line/multi-bar charts */
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;

  /** Axis label / primary text */
  text: string;
  /** Secondary text (subtitles, annotations) */
  textSecondary: string;

  /** Chart container border */
  border: string;
  /** Chart container background */
  background: string;

  /** Axis line, tick mark, grid line */
  axisLine: string;
  tickLine: string;
  gridLine: string;

  /** Tooltip colors */
  tooltipBg: string;
  tooltipText: string;
}

/**
 * Resolve a single CSS variable to its computed color string.
 * Automatically prepends "--" if missing.
 */
export function resolveColor(cssVar: string): string {
  const varName = cssVar.startsWith("--") ? cssVar : `--${cssVar}`;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Resolve all chart-relevant CSS variables to concrete color strings.
 * Call this inside useEffect or event handlers — it reads the live DOM.
 */
export function getChartColors(): ChartColors {
  return {
    chart1: resolveColor("--chart-1"),
    chart2: resolveColor("--chart-2"),
    chart3: resolveColor("--chart-3"),
    chart4: resolveColor("--chart-4"),
    chart5: resolveColor("--chart-5"),
    chart6: resolveColor("--chart-6"),
    chart7: resolveColor("--chart-7"),
    chart8: resolveColor("--chart-8"),

    text: resolveColor("--foreground"),
    textSecondary: resolveColor("--muted-foreground"),

    border: resolveColor("--border"),
    background: resolveColor("--background"),

    axisLine: resolveColor("--border"),
    tickLine: resolveColor("--border"),
    gridLine: resolveColor("--border"),

    tooltipBg: resolveColor("--popover"),
    tooltipText: resolveColor("--popover-foreground"),
  };
}

/**
 * Check whether the current theme is light mode.
 */
export function isLightTheme(): boolean {
  return !document.documentElement.classList.contains("dark");
}
