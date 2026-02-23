/**
 * Shared content parsing utilities for generated markdown content.
 * Used by procedure, hospital, and city-procedure pages.
 *
 * All HTML output is sanitized with DOMPurify to prevent XSS attacks.
 */

import DOMPurify from 'isomorphic-dompurify'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContentSection {
  title: string
  content: string
  type: 'intro' | 'section' | 'table' | 'list' | 'faq' | 'disclaimer'
}

export interface FAQ {
  question: string
  answer: string
}

// ---------------------------------------------------------------------------
// DOMPurify configuration – allow safe medical content markup
// ---------------------------------------------------------------------------

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'h2', 'h3', 'h4', 'p', 'strong', 'em', 'a', 'code',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span', 'br',
  ] as string[],
  ALLOWED_ATTR: ['href', 'class', 'target', 'rel'] as string[],
  ALLOW_DATA_ATTR: false,
  RETURN_TRUSTED_TYPE: false as const,
}

/**
 * Sanitize HTML string to prevent XSS.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY_CONFIG) as string
}

// ---------------------------------------------------------------------------
// Markdown → HTML helpers
// ---------------------------------------------------------------------------

/**
 * Convert markdown table lines into an HTML table string (sanitized).
 */
export function createHtmlTable(tableLines: string[]): string {
  if (tableLines.length < 2) return ''

  const headers = tableLines[0].split('|').filter((h) => h.trim())
  // Skip separator line (index 1)
  const rows = tableLines.slice(2).map((line) =>
    line.split('|').filter((cell) => cell.trim()),
  )

  let html = '<table class="content-table">\n<thead>\n<tr>\n'
  headers.forEach((header) => {
    html += `<th>${header.trim()}</th>\n`
  })
  html += '</tr>\n</thead>\n<tbody>\n'

  rows.forEach((row) => {
    html += '<tr>\n'
    row.forEach((cell) => {
      html += `<td>${cell.trim()}</td>\n`
    })
    html += '</tr>\n'
  })

  html += '</tbody>\n</table>'
  return html
}

/**
 * Convert basic markdown formatting to HTML and sanitize the result.
 */
export function formatMarkdownText(text: string): string {
  const raw = text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="content-link" rel="noopener noreferrer">$1</a>',
    )
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Bullets
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="content-list">$&</ul>')

  return sanitizeHtml(raw)
}

// ---------------------------------------------------------------------------
// Markdown parsing
// ---------------------------------------------------------------------------

/**
 * Parse generated markdown content into typed sections.
 */
export function parseMarkdownContent(markdown: string): ContentSection[] {
  const sections: ContentSection[] = []
  const lines = markdown.split('\n')

  let currentSection: ContentSection | null = null
  let inTable = false
  let tableContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // H2 headings denote new sections
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection)
      }
      if (inTable && tableContent.length > 0 && currentSection) {
        currentSection.content += '\n' + tableContent.join('\n')
        tableContent = []
        inTable = false
      }

      const title = line.replace('## ', '').trim()
      const isFAQ =
        title.toLowerCase().includes('faq') ||
        title.toLowerCase().includes('question')
      const isDisclaimer = title.toLowerCase().includes('disclaimer')

      currentSection = {
        title,
        content: '',
        type: isDisclaimer ? 'disclaimer' : isFAQ ? 'faq' : 'section',
      }
    }
    // H3 subheadings
    else if (line.startsWith('### ')) {
      if (currentSection) {
        currentSection.content += `\n<h3>${line.replace('### ', '').trim()}</h3>\n`
      }
    }
    // Table detection
    else if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true
        tableContent = []
      }
      tableContent.push(line)
    }
    // Regular content
    else if (currentSection) {
      if (inTable && !line.trim().startsWith('|')) {
        currentSection.content +=
          '\n<div class="table-wrapper">\n' +
          createHtmlTable(tableContent) +
          '\n</div>\n'
        tableContent = []
        inTable = false
      }
      currentSection.content += line + '\n'
    }
  }

  // Push final section
  if (currentSection) {
    if (inTable && tableContent.length > 0) {
      currentSection.content +=
        '\n<div class="table-wrapper">\n' +
        createHtmlTable(tableContent) +
        '\n</div>\n'
    }
    sections.push(currentSection)
  }

  return sections
}

// ---------------------------------------------------------------------------
// FAQ extraction
// ---------------------------------------------------------------------------

/**
 * Extract FAQ question/answer pairs from parsed content sections.
 */
export function extractFAQs(sections: ContentSection[]): FAQ[] {
  const faqs: FAQ[] = []

  const faqSection = sections.find((s) => s.type === 'faq')
  if (!faqSection) return faqs

  const lines = faqSection.content.split('\n')
  let currentQuestion = ''
  let currentAnswer = ''

  for (const line of lines) {
    // H3 questions
    if (line.trim().startsWith('<h3>')) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.trim(),
        })
      }
      // Start new question
      currentQuestion = line.replace(/<\/?h3>/g, '').trim()
      currentAnswer = ''
    } else if (currentQuestion && line.trim()) {
      currentAnswer += line + ' '
    }
  }

  // Save last Q&A
  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.trim(),
    })
  }

  return faqs
}

// ---------------------------------------------------------------------------
// Base URL helper
// ---------------------------------------------------------------------------

/**
 * Get the canonical base URL from environment, with production fallback.
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://kmedtour.com'
}
