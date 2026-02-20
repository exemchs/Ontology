"use client";

import { Button } from "@/components/ui/button";

interface LayoutActionBarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function LayoutActionBar({ isDirty, onSave, onReset }: LayoutActionBarProps) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
        isDirty ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div className="flex items-center justify-end gap-2 py-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            초기화
          </Button>
          <Button size="sm" onClick={onSave}>
            변경 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
