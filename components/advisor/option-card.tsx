'use client'

import { Check } from 'lucide-react'

interface OptionCardProps {
  label: string
  value: string
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
}

export function OptionCard({ label, selected, onClick, icon }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full p-4 sm:p-6 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]"
      style={{
        borderColor: selected ? 'var(--kmed-blue)' : 'var(--border-grey)',
        backgroundColor: selected ? 'var(--kmed-blue-light)' : 'white',
      }}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: selected ? 'var(--kmed-blue)' : 'var(--border-grey)',
              color: selected ? 'white' : 'var(--medium-grey)',
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className="font-medium"
            style={{ color: selected ? 'var(--kmed-blue)' : 'var(--deep-grey)' }}
          >
            {label}
          </p>
        </div>
        {selected && (
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--kmed-blue)' }}
          >
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  )
}
