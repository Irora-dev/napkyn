'use client'

import { useState, useCallback } from 'react'
import { Search, Sparkles } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export function SearchBar({
  onSearch,
  placeholder = "What are you trying to figure out?"
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSearch) {
      onSearch(query.trim())
    }
  }, [query, onSearch])

  const isActive = isFocused || query.length > 0

  return (
    <form onSubmit={handleSubmit} className="w-[50vw] min-w-[400px]">
      {/* Main search container with glow effect */}
      <div
        className={`
          relative flex items-center gap-3 px-6 py-4
          rounded-2xl transition-all duration-300 ease-out
          glass-strong
          ${isActive
            ? 'shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(255,255,255,0.15),inset_0_0_0_1px_rgba(255,255,255,0.3)]'
            : 'shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
          }
        `}
      >
        {/* Search icon */}
        <Search
          className={`
            w-5 h-5 transition-colors duration-200
            ${isActive ? 'text-white' : 'text-white/40'}
          `}
        />

        {/* Input field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            flex-1 bg-transparent text-white text-lg
            search-input
            placeholder:text-white/60
          "
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={!query.trim()}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            text-sm font-medium transition-all duration-200
            ${isActive
              ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore</span>
        </button>
      </div>

      {/* Helper text */}
      <p
        className="mt-4 text-center text-white/60 text-sm opacity-0 animate-fade-in"
        style={{ animationDelay: '1.9s', animationFillMode: 'forwards' }}
      >
        Try: "I want to retire early" or "Should I go freelance?"
      </p>
    </form>
  )
}
