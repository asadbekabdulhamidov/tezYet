export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.startsWith("7")) return `+${digits}`;

  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 10) return `+7${digits}`;

  return raw.startsWith("+") ? raw : `+${digits}`;
}
