#!/usr/bin/env node
/**
 * Scan code/data/content for local image references and verify each file
 * exists under public/. Exits 1 if any referenced image is missing.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SCAN_DIRS = ['app', 'components', 'lib', 'messages', 'content', 'config', 'data', 'public/content']
const FILE_RE = /\.(tsx?|jsx?|json|md|mdx)$/
// matches "/images/....ext", "/hero-....ext", "/icon-....ext" etc. inside quotes
const REF_RE = /["'`](\/(?:images\/[A-Za-z0-9_./-]+|hero-[A-Za-z0-9_.-]+|icon-[A-Za-z0-9_.-]+|[A-Za-z0-9_-]+)\.(?:png|jpg|jpeg|webp|svg|avif|gif|ico))["'`]/g

const refs = new Map()

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') walk(full)
      continue
    }
    if (!FILE_RE.test(f)) continue
    const src = fs.readFileSync(full, 'utf8')
    let m
    while ((m = REF_RE.exec(src))) {
      if (!refs.has(m[1])) refs.set(m[1], [])
      refs.get(m[1]).push(path.relative(ROOT, full))
    }
  }
}

SCAN_DIRS.forEach((d) => walk(path.join(ROOT, d)))

let missing = 0
const byDir = {}
for (const [ref, files] of [...refs.entries()].sort()) {
  const dir = ref.split('/').slice(0, -1).join('/') || '/'
  byDir[dir] = (byDir[dir] || 0) + 1
  if (!fs.existsSync(path.join(ROOT, 'public', ref))) {
    missing++
    console.log(`MISSING ${ref}  <- ${files[0]}${files.length > 1 ? ` (+${files.length - 1} more)` : ''}`)
  }
}

console.log(`\nunique refs: ${refs.size}`)
Object.entries(byDir)
  .sort()
  .forEach(([d, n]) => console.log(`  ${d}: ${n}`))
console.log(`missing: ${missing}`)
process.exit(missing ? 1 : 0)
