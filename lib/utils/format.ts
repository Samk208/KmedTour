// String formatters for user-facing display of enum-style values.

export function formatSpecialty(value: string): string {
  if (!value) return ''
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
