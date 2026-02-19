/**
 * A tooltip instance attached to document.body.
 * Call destroy() on component unmount to prevent orphaned DOM nodes.
 */
export interface TooltipInstance {
  /** Display the tooltip near the cursor with HTML content */
  show: (content: string, event: MouseEvent) => void;
  /** Hide the tooltip (opacity transition) */
  hide: () => void;
  /** Remove the tooltip element from the DOM entirely */
  destroy: () => void;
}

/**
 * Create a body-appended tooltip div with consistent styling.
 * Uses CSS variables for colors so it responds to theme changes.
 *
 * Positioning: 12px right and 12px above the cursor.
 * Viewport boundary correction: flips to the other side if overflowing.
 *
 * @returns TooltipInstance with show/hide/destroy methods
 */
export function createTooltip(): TooltipInstance {
  const el = document.createElement("div");

  // Base styles
  Object.assign(el.style, {
    position: "absolute",
    pointerEvents: "none",
    zIndex: "9999",
    padding: "8px 12px",
    borderRadius: "6px",
    backgroundColor: "var(--color-material-tooltip)",
    color: "var(--color-mono-white)",
    fontSize: "12px",
    lineHeight: "1.4",
    opacity: "0",
    transition: "opacity 150ms ease",
    whiteSpace: "nowrap",
    maxWidth: "300px",
  });

  document.body.appendChild(el);

  function show(content: string, event: MouseEvent): void {
    el.innerHTML = content;
    el.style.opacity = "1";

    // Measure tooltip dimensions after content is set
    const tooltipRect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default: 12px right and 12px above cursor
    let left = event.pageX + 12;
    let top = event.pageY - tooltipRect.height - 12;

    // Flip horizontally if overflowing right edge
    if (left + tooltipRect.width > viewportWidth + window.scrollX) {
      left = event.pageX - tooltipRect.width - 12;
    }

    // Flip vertically if overflowing top edge
    if (top < window.scrollY) {
      top = event.pageY + 12;
    }

    // Safety: ensure not beyond bottom
    if (top + tooltipRect.height > viewportHeight + window.scrollY) {
      top = viewportHeight + window.scrollY - tooltipRect.height - 4;
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function hide(): void {
    el.style.opacity = "0";
  }

  function destroy(): void {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  return { show, hide, destroy };
}
