// =============================================================================
// eXemble Ontology Platform - PII Field Configuration
// =============================================================================
// Defines per-field masking rules and role-based access control for PII data.
// Maps each field to appropriate masking functions based on user role.
// =============================================================================

import type { Role, PiiLevel } from "@/types";
import {
  maskName,
  maskPhone,
  maskEmail,
  maskId,
  maskAddress,
  anonymize,
  deny,
} from "@/lib/pii-masking";

// ── Types ───────────────────────────────────────────────────────────────────

export type PiiAction = "plain" | "masked" | "anonymized" | "denied";

export interface PiiFieldRule {
  field: string;
  level: PiiLevel;
  actions: Record<Role, PiiAction>;
}

// ── FAB Equipment PII Field Configs ─────────────────────────────────────────

export const fabPiiFieldConfigs: PiiFieldRule[] = [
  {
    field: "equipment_id",
    level: "none",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "plain", auditor: "plain" },
  },
  {
    field: "operator_name",
    level: "medium",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "masked", auditor: "denied" },
  },
  {
    field: "operator_phone",
    level: "highest",
    actions: { super_admin: "plain", service_app: "masked", data_analyst: "denied", auditor: "denied" },
  },
  {
    field: "operator_email",
    level: "high",
    actions: { super_admin: "plain", service_app: "masked", data_analyst: "masked", auditor: "denied" },
  },
  {
    field: "location",
    level: "none",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "plain", auditor: "plain" },
  },
  {
    field: "last_calibration",
    level: "none",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "plain", auditor: "plain" },
  },
  {
    field: "maintenance_notes",
    level: "low",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "plain", auditor: "masked" },
  },
  {
    field: "calibration_by",
    level: "medium",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "masked", auditor: "denied" },
  },
];

// ── General PII Field Configs ───────────────────────────────────────────────

export const generalPiiFieldConfigs: PiiFieldRule[] = [
  {
    field: "customer_id",
    level: "none",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "plain", auditor: "plain" },
  },
  {
    field: "name",
    level: "medium",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "masked", auditor: "denied" },
  },
  {
    field: "phone",
    level: "highest",
    actions: { super_admin: "plain", service_app: "masked", data_analyst: "denied", auditor: "denied" },
  },
  {
    field: "email",
    level: "high",
    actions: { super_admin: "plain", service_app: "masked", data_analyst: "masked", auditor: "denied" },
  },
  {
    field: "address",
    level: "high",
    actions: { super_admin: "plain", service_app: "masked", data_analyst: "anonymized", auditor: "denied" },
  },
  {
    field: "membership",
    level: "none",
    actions: { super_admin: "plain", service_app: "plain", data_analyst: "plain", auditor: "plain" },
  },
];

// ── Masking Function Resolver ───────────────────────────────────────────────

/** Map a field name to its appropriate masking function (used when action is "masked") */
export function getMaskFn(field: string): (value: string) => string {
  const fieldMaskMap: Record<string, (value: string) => string> = {
    // Name fields
    name: maskName,
    operator_name: maskName,
    calibration_by: maskName,
    // Phone fields
    phone: maskPhone,
    operator_phone: maskPhone,
    // Email fields
    email: maskEmail,
    operator_email: maskEmail,
    // ID fields
    equipment_id: maskId,
    customer_id: maskId,
    // Address fields
    address: maskAddress,
    // Notes - use simple masking (first 10 chars + ...)
    maintenance_notes: (value: string) => {
      if (value.length <= 4) return "*".repeat(value.length);
      return value.substring(0, 4) + "...";
    },
  };

  return fieldMaskMap[field] ?? maskName; // Default to maskName
}

// ── Apply PII Masking Utility ───────────────────────────────────────────────

/**
 * Apply PII masking to a single value based on the field name and action.
 *
 * @param value - The original string value
 * @param field - The field name (used to determine which mask function to use)
 * @param action - The masking action to apply
 * @returns The masked (or original) string
 */
export function applyPiiMasking(
  value: string,
  field: string,
  action: PiiAction
): string {
  switch (action) {
    case "plain":
      return value;
    case "masked":
      return getMaskFn(field)(value);
    case "anonymized":
      return anonymize(value);
    case "denied":
      return deny();
    default:
      return value;
  }
}
