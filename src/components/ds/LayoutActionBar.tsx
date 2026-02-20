"use client";

import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutActionBarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function LayoutActionBar({ isDirty, onSave, onReset }: LayoutActionBarProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300 ease-in-out
        ${isDirty
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
        }`}
    >
      <div className="flex items-center gap-4 rounded-lg border border-border/60
        bg-background/90 backdrop-blur-md shadow-lg px-4 py-2.5">
        {/* 수정 중 상태 */}
        <div className="flex items-center gap-2">
          <span className="layout-editing-pulse size-2 rounded-full bg-[var(--status-warning)] shrink-0" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">레이아웃 수정 중</span>
        </div>

        <div className="w-px h-4 bg-border" />

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            초기화
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            변경 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
