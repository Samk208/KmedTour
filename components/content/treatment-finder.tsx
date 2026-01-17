'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TreatmentFinderProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  totalResults: number
}

export function TreatmentFinder({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalResults,
}: TreatmentFinderProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-2xl">
        <div
          className={`relative flex items-center rounded-lg border-2 transition-all ${
            isFocused
              ? 'border-[var(--kmed-blue)] shadow-lg'
              : 'border-[var(--border-grey)] hover:border-[var(--kmed-teal)]'
          }`}
          style={{ backgroundColor: 'white' }}
        >
          <Search
            className="absolute left-4 h-5 w-5 pointer-events-none"
            style={{ color: isFocused ? 'var(--kmed-blue)' : 'var(--deep-grey)' }}
          />
          <Input
            type="text"
            placeholder="Search by treatment name, keywords, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="border-0 pl-12 pr-12 h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ color: 'var(--kmed-navy)' }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 p-1 rounded-full hover:bg-[var(--soft-grey)] transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" style={{ color: 'var(--deep-grey)' }} />
            </button>
          )}
        </div>
        
        {/* Results count */}
        {searchQuery && (
          <div className="mt-2 text-sm" style={{ color: 'var(--deep-grey)' }}>
            Found {totalResults} {totalResults === 1 ? 'treatment' : 'treatments'}
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--kmed-navy)' }}>
            Filter by category:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category
            return (
              <Button
                key={category}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={`
                  rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${
                    isSelected
                      ? 'bg-[var(--kmed-blue)] text-white hover:bg-[var(--kmed-blue)]/90 border-[var(--kmed-blue)]'
                      : 'bg-white text-[var(--kmed-navy)] border-[var(--border-grey)] hover:border-[var(--kmed-teal)] hover:bg-[var(--soft-grey)]'
                  }
                `}
              >
                {category === 'all' ? 'All Treatments' : category}
                {isSelected && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs">
                    ✓
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
