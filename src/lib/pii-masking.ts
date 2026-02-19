// =============================================================================
// eXemble Ontology Platform - PII Masking Functions
// =============================================================================
// Pure functions for masking personally identifiable information (PII).
// Designed for Korean-language data patterns (names, phones, emails, addresses).
// =============================================================================

/**
 * Mask a name: "김민수" -> "김*수", "김수" -> "김*", "김" -> "*"
 * Keeps first and last character, masks middle.
 */
export function maskName(value: string): string {
  if (!value) return value;
  if (value.length === 1) return "*";
  if (value.length === 2) return value[0] + "*";
  return value[0] + "*".repeat(value.length - 2) + value[value.length - 1];
}

/**
 * Mask a phone number: "010-1234-5678" -> "010-****-5678"
 * Masks the middle group of digits.
 */
export function maskPhone(value: string): string {
  if (!value) return value;
  return value.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3");
}

/**
 * Mask an email: "kim@sksiltron.com" -> "k**@sksiltron.com"
 * Keeps first character of local part, masks the rest.
 */
export function maskEmail(value: string): string {
  if (!value) return value;
  const atIndex = value.indexOf("@");
  if (atIndex <= 0) return value;
  const local = value.substring(0, atIndex);
  const domain = value.substring(atIndex);
  if (local.length <= 1) return local + "**" + domain;
  return local[0] + "*".repeat(local.length - 1) + domain;
}

/**
 * Mask an ID: "CVD-001" -> "CVD-***", "OP2847" -> "OP2***"
 * If hyphen exists, masks everything after the last hyphen.
 * If no hyphen, masks last 3 characters.
 */
export function maskId(value: string): string {
  if (!value) return value;
  const hyphenIndex = value.lastIndexOf("-");
  if (hyphenIndex >= 0) {
    const prefix = value.substring(0, hyphenIndex + 1);
    const suffix = value.substring(hyphenIndex + 1);
    return prefix + "*".repeat(suffix.length);
  }
  if (value.length <= 3) return "*".repeat(value.length);
  return value.substring(0, value.length - 3) + "***";
}

/**
 * Mask an address: "서울특별시 강남구 테헤란로 123" -> "서울특별시 강남구 ***"
 * Keeps the first two space-separated words, masks the rest.
 */
export function maskAddress(value: string): string {
  if (!value) return value;
  const parts = value.split(" ");
  if (parts.length <= 2) return parts[0] + " ***";
  return parts.slice(0, 2).join(" ") + " ***";
}

/**
 * Anonymize: always returns "[ANONYMIZED]"
 */
export function anonymize(_value: string): string {
  return "[ANONYMIZED]";
}

/**
 * Deny access: always returns "[ACCESS DENIED]"
 */
export function deny(): string {
  return "[ACCESS DENIED]";
}
