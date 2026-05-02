/**
 * Strict @gmail.com-only validation (aligned with backend/utils/gmail.js).
 */
export type GmailValidation = { ok: true; normalized: string } | { ok: false; error: string };

function segmentError(
  part: string,
  minLen: number,
  maxLen: number,
  lengthLabel: string,
): string | null {
  if (part.length < minLen || part.length > maxLen) {
    return lengthLabel;
  }
  if (!/^[a-z0-9.]+$/.test(part)) {
    return "Gmail address may only contain letters, numbers, and periods (plus one optional +tag).";
  }
  if (part.startsWith(".") || part.endsWith(".")) {
    return "Gmail address cannot start or end with a period.";
  }
  if (part.includes("..")) {
    return "Gmail address cannot contain consecutive periods.";
  }
  return null;
}

export function validateStrictGmail(email: string | undefined | null): GmailValidation {
  const raw = String(email ?? "").trim().toLowerCase();
  if (!raw.endsWith("@gmail.com")) {
    return { ok: false, error: "Only @gmail.com addresses are allowed." };
  }

  const localFull = raw.slice(0, -"@gmail.com".length);
  if (localFull.length > 64) {
    return { ok: false, error: "Gmail address local part is too long." };
  }

  const plusParts = localFull.split("+");
  if (plusParts.length > 2) {
    return { ok: false, error: "Gmail address can only contain one + for aliasing." };
  }

  const [local, tag] = plusParts;

  const baseErr = segmentError(local, 6, 30, "Gmail username must be between 6 and 30 characters.");
  if (baseErr) return { ok: false, error: baseErr };

  if (tag !== undefined) {
    const tagErr = segmentError(tag, 1, 30, "Gmail +tag must be between 1 and 30 characters.");
    if (tagErr) return { ok: false, error: tagErr };
  }

  return { ok: true, normalized: raw };
}
