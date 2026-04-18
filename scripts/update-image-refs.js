#!/usr/bin/env node

/**
 * Update Image References Script
 * 
 * Finds all references to .png image files and updates them to .jpg
 * This is needed because Apr 14 session downloaded real images as .jpg
 * but code still references the old .png files.
 * 
 * Usage:
 *   node scripts/update-image-refs.js          # Dry run (shows changes)
 *   node scripts/update-image-refs.js --apply  # Actually apply changes
 * 
 * Files scanned:
 *   - All .tsx, .ts, .jsx, .js files (code)
 *   - All .md files (documentation)
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DRY_RUN = !process.argv.includes('--apply')
const VERBOSE = process.argv.includes('--verbose')

// Patterns to update
const IMAGE_PATTERNS = [
  // Hospital images
  { from: /\/images\/hospitals\/([a-z0-9-]+)\.png/gi, to: (match, name) => `/images/hospitals/${name}.jpg` },
  // Procedure images
  { from: /\/images\/procedures\/([a-z0-9-]+)\.png/gi, to: (match, name) => `/images/procedures/${name}.jpg` },
  // Hero images
  { from: /\/hero-([a-z0-9-]+)\.png/gi, to: (match, name) => `/hero-${name}.jpg` },
  // Generic public folder images
  { from: /\/public\/images\/([a-z0-9-/]+)\.png/gi, to: (match, path) => `/public/images/${path}.jpg` },
]

// File extensions to scan
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.md']

// Directories to scan
const SCAN_DIRS = [
  'app',
  'components',
  'lib',
  'scripts',
  'docs',
  'tests',
]

// Files to skip
const SKIP_FILES = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'update-image-refs.js', // This file itself
]

let changedFiles = 0
let changedLines = 0

/**
 * Scan a file for image references and optionally update them
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content
    
    // Apply each pattern
    IMAGE_PATTERNS.forEach(({ from, to }) => {
      content = content.replace(from, to)
    })
    
    // If content changed, report it
    if (content !== originalContent) {
      changedFiles++
      
      const diff = content.split('\n').filter((line, i) => {
        const originalLine = originalContent.split('\n')[i]
        return line !== originalLine
      }).length
      
      changedLines += diff
      
      if (DRY_RUN) {
        console.log(`\n📝 Would update: ${filePath}`)
        if (VERBOSE) {
          console.log(`   Changes: ${diff} line(s)`)
          // Show diff
          const origLines = originalContent.split('\n')
          const newLines = content.split('\n')
          origLines.forEach((line, i) => {
            if (line !== newLines[i] && (line.includes('.png') || newLines[i].includes('.jpg'))) {
              console.log(`   - ${line}`)
              console.log(`   + ${newLines[i]}`)
            }
          })
        }
      } else {
        fs.writeFileSync(filePath, content, 'utf-8')
        console.log(`✅ Updated: ${filePath}`)
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`)
  }
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name)
      
      // Skip certain files/directories
      if (SKIP_FILES.some(skip => entry.name === skip || entry.name.startsWith('.'))) {
        return
      }
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath)
      } else if (FILE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        processFile(fullPath)
      }
    })
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}: ${error.message}`)
  }
}

/**
 * Verify that .jpg files actually exist
 */
function verifyImages() {
  console.log('\n🔍 Verifying .jpg files exist...\n')
  
  const publicDir = 'public/images'
  if (!fs.existsSync(publicDir)) {
    console.warn(`⚠️  Directory not found: ${publicDir}`)
    return
  }
  
  const dirs = ['hospitals', 'procedures']
  dirs.forEach(dir => {
    const path = `${publicDir}/${dir}`
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path).filter(f => f.endsWith('.jpg'))
      console.log(`   ${dir}: ${files.length} images`)
      if (VERBOSE && files.length > 0) {
        files.slice(0, 3).forEach(f => console.log(`      - ${f}`))
        if (files.length > 3) console.log(`      ... and ${files.length - 3} more`)
      }
    }
  })
}

/**
 * Main execution
 */
function main() {
  console.log('🖼️  Image Reference Update Script\n')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'APPLY CHANGES'}`)
  console.log(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}\n`)
  
  console.log('🔎 Scanning for .png references...\n')
  
  const baseDir = process.cwd()
  
  SCAN_DIRS.forEach(dir => {
    const fullPath = path.join(baseDir, dir)
    if (fs.existsSync(fullPath)) {
      scanDirectory(fullPath)
    }
  })
  
  // Verify images exist
  verifyImages()
  
  // Summary
  console.log(`\n${'='.repeat(50)}`)
  console.log(`\nSummary:`)
  console.log(`  Files to update: ${changedFiles}`)
  console.log(`  Lines changed: ${changedLines}`)
  
  if (DRY_RUN) {
    console.log(`\n✅ Dry run complete. No changes made.`)
    console.log(`\nTo apply changes, run:`)
    console.log(`  node scripts/update-image-refs.js --apply`)
  } else {
    console.log(`\n✅ Updated ${changedFiles} file(s)!`)
    console.log(`\n📝 Next steps:`)
    console.log(`  1. Review changes: git diff`)
    console.log(`  2. Test locally: npm run dev`)
    console.log(`  3. Verify images load: Check homepage, hospitals, procedures pages`)
    console.log(`  4. Commit: git add . && git commit -m "fix: update image refs .png -> .jpg"`)
  }
}

main()
