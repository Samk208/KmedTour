export function preferHospitalWebp(src: string | undefined | null): string {
  if (!src) return '/images/hospitals/default.jpg'

  if (src.startsWith('/images/hospitals/') && src.endsWith('.png')) {
    return src.replace(/\.png$/, '.webp')
  }

  return src
}
