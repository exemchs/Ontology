"use client";

import { ShieldCheck, Server, BarChart3, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

// ── Role banner configuration ────────────────────────────────────────────────

interface BannerConfig {
  message: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  iconColorClass: string;
}

const bannerConfigMap: Record<Role, BannerConfig> = {
  super_admin: {
    message:
      "모든 PII 필드에 전체 접근 권한이 있습니다. 민감 정보가 마스킹 없이 표시됩니다.",
    icon: <ShieldCheck className="size-4 shrink-0" />,
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
  },
  service_app: {
    message:
      "서비스 운영에 필요한 최소 PII 필드만 접근 가능합니다. 일부 필드가 마스킹됩니다.",
    icon: <Server className="size-4 shrink-0" />,
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    iconColorClass: "text-blue-600 dark:text-blue-400",
  },
  data_analyst: {
    message:
      "분석 업무에 필요한 데이터만 접근 가능합니다. 개인 식별 정보는 마스킹됩니다.",
    icon: <BarChart3 className="size-4 shrink-0" />,
    bgClass: "bg-[var(--status-warning)]/10",
    borderClass: "border-[var(--status-warning)]/30",
    iconColorClass: "text-[var(--status-warning)]",
  },
  auditor: {
    message:
      "감사 목적으로 제한된 접근 권한이 있습니다. 대부분의 PII 필드가 차단됩니다.",
    icon: <Eye className="size-4 shrink-0" />,
    bgClass: "bg-[var(--status-critical)]/10",
    borderClass: "border-[var(--status-critical)]/30",
    iconColorClass: "text-[var(--status-critical)]",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface RoleInfoBannerProps {
  role: Role;
}

export function RoleInfoBanner({ role }: RoleInfoBannerProps) {
  const config = bannerConfigMap[role];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors duration-200",
        config.bgClass,
        config.borderClass
      )}
    >
      <span className={cn("mt-0.5", config.iconColorClass)}>{config.icon}</span>
      <span className="text-foreground/90">{config.message}</span>
    </div>
  );
}
