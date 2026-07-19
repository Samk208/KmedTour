import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import treatments from '@/lib/data/treatments.json'

// Regression guard for the 2026-07-19 production incident: every row in the
// Supabase `treatments` table pointed at `/images/procedures/<slug>.png` while
// every file on disk is `.jpg`, so all 113 procedure images 404'd. Nothing in
// the suite asserted that an imageUrl resolves to a real file, so it shipped.
describe('treatments.json image references', () => {
  const rows = treatments as Array<{ slug: string; imageUrl?: string }>

  it('has treatments to check', () => {
    expect(rows.length).toBeGreaterThan(0)
  })

  it('every imageUrl resolves to a file that exists in public/', () => {
    const missing = rows
      .filter((r) => r.imageUrl)
      .filter((r) => !existsSync(join(process.cwd(), 'public', r.imageUrl!.replace(/^\//, ''))))
      .map((r) => `${r.slug} -> ${r.imageUrl}`)

    expect(missing).toEqual([])
  })

  it('no imageUrl uses an extension that does not exist on disk', () => {
    // The specific failure mode: the extension is swapped but the basename is
    // right, so the path looks plausible and only 404s at runtime.
    const wrongExt = rows
      .filter((r) => r.imageUrl)
      .filter((r) => {
        const rel = r.imageUrl!.replace(/^\//, '')
        if (existsSync(join(process.cwd(), 'public', rel))) return false
        const swapped = rel.replace(/\.(png|jpg|jpeg|webp)$/i, (m) =>
          m.toLowerCase() === '.png' ? '.jpg' : '.png',
        )
        return existsSync(join(process.cwd(), 'public', swapped))
      })
      .map((r) => `${r.slug} -> ${r.imageUrl}`)

    expect(wrongExt).toEqual([])
  })
})
