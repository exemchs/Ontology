"use client";

import { useState } from "react";
import type { ChartConfig } from "@/components/ui/chart";

interface LegendItem {
  dataKey: string;
  color: string;
  label: string;
}

interface TruncatedLegendProps {
  items: LegendItem[];
  maxVisible?: number;
  hidden?: Set<string>;
  onToggle?: (dataKey: string) => void;
  className?: string;
}

/**
 * 시리즈가 많을 때 maxVisible개까지만 표시하고,
 * 나머지는 "+N" 배지로 축약. 호버 시 전체 목록 툴팁 표시.
 * onToggle 제공 시 클릭으로 시리즈 토글 가능.
 */
export function TruncatedLegend({
  items,
  maxVisible = 5,
  hidden,
  onToggle,
  className,
}: TruncatedLegendProps) {
  const [showOverflow, setShowOverflow] = useState(false);

  const visible = items.slice(0, maxVisible);
  const overflow = items.slice(maxVisible);

  return (
    <div className={`flex items-center justify-center gap-3 pt-2 flex-wrap ${className ?? ""}`}>
      {visible.map((item) => {
        const isHidden = hidden?.has(item.dataKey);
        return (
          <button
            key={item.dataKey}
            type="button"
            className={`flex items-center gap-1.5 text-xs transition-opacity ${
              isHidden ? "opacity-30" : "opacity-100"
            } ${onToggle ? "cursor-pointer hover:opacity-70" : "cursor-default"}`}
            onClick={() => onToggle?.(item.dataKey)}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </button>
        );
      })}

      {overflow.length > 0 && (
        <div
          className="relative"
          onMouseEnter={() => setShowOverflow(true)}
          onMouseLeave={() => setShowOverflow(false)}
        >
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded cursor-default">
            +{overflow.length}
          </span>

          {showOverflow && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-popover border border-border rounded-md shadow-md p-2 min-w-[120px]">
              {overflow.map((item) => {
                const isHidden = hidden?.has(item.dataKey);
                return (
                  <button
                    key={item.dataKey}
                    type="button"
                    className={`flex items-center gap-1.5 text-xs py-0.5 w-full transition-opacity ${
                      isHidden ? "opacity-30" : "opacity-100"
                    } ${onToggle ? "cursor-pointer hover:opacity-70" : "cursor-default"}`}
                    onClick={() => onToggle?.(item.dataKey)}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ChartConfig에서 TruncatedLegend용 items 배열 생성 헬퍼.
 * dataKeys 순서대로 항목 생성.
 */
export function legendItemsFromConfig(
  config: ChartConfig,
  dataKeys: string[]
): LegendItem[] {
  return dataKeys.map((key) => ({
    dataKey: key,
    color: `var(--color-${key})`,
    label: (config[key]?.label as string) ?? key,
  }));
}
