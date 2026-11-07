/** Human-readable labels for NHANES codes. API still sends raw codes. */

const UNIT_CODES: Record<string, string> = {
  "b'W'": "Week",
  "b'D'": "Day",
  "b'M'": "Month",
  "b'Y'": "Year",
  W: "Week",
  D: "Day",
  M: "Month",
  Y: "Year",
};

const COMMON_VALUE_LABELS: Record<string, string> = {
  "1": "Yes / option 1",
  "2": "No / option 2",
  "3": "Option 3",
  "7": "Refused",
  "9": "Don't know",
};

export function featureLabel(
  code: string,
  descriptions?: Record<string, string>,
): string {
  return descriptions?.[code] || code;
}

export function optionLabel(value: string | number): string {
  const raw = String(value);
  if (UNIT_CODES[raw]) return `${UNIT_CODES[raw]} (${raw})`;
  if (COMMON_VALUE_LABELS[raw]) return `${COMMON_VALUE_LABELS[raw]} (${raw})`;
  return raw;
}

export function stripPipelineFeatureName(name: string): string {
  return name
    .replace(/^(numerical|categorical|ordinal)__/, "")
    .replace(/_\d+(\.\d+)?$/, "");
}
