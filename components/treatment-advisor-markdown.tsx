'use client'

import { Quote } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Citation = { ref: string; title: string; source_url: string | null }

const themeClasses = {
  dark: {
    strong: 'font-semibold text-teal-300',
    link: 'text-teal-400 underline decoration-teal-400/30 underline-offset-2 hover:text-teal-300',
    cite: 'text-gray-400 hover:text-teal-400 hover:border-teal-500/30',
  },
  light: {
    strong: 'font-semibold text-teal-700',
    link: 'text-teal-600 underline decoration-teal-500/40 underline-offset-2 hover:text-teal-700',
    cite: 'text-gray-500 hover:text-teal-600 hover:border-teal-400',
  },
} as const

export function TreatmentAdvisorMarkdown({
  content,
  citations,
  theme = 'dark',
}: {
  content: string
  citations?: Citation[]
  theme?: 'dark' | 'light'
}) {
  const t = themeClasses[theme]
  return (
    <>
      <ReactMarkdown
        components={{
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc ml-4 my-2 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="pl-1" {...props} />,
          strong: ({ ...props }) => <strong className={t.strong} {...props} />,
          a: ({ ...props }) => <a className={t.link} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
      {citations && citations.length > 0 && (
        <div className={theme === 'dark' ? 'mt-4 pt-3 border-t border-white/10' : 'mt-4 pt-3 border-t border-gray-200'}>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Quote className="w-3 h-3" /> Sources
          </div>
          <div className="flex flex-wrap gap-2">
            {citations.map((cite, ci) => (
              <a
                key={ci}
                href={cite.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={theme === 'dark'
                  ? 'px-2 py-1 rounded bg-black/30 border border-white/5 text-[10px] text-gray-400 hover:text-teal-400 hover:border-teal-500/30 transition-colors'
                  : `px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[10px] ${t.cite} transition-colors`}
              >
                {cite.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
