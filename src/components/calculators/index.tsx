'use client'

import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { FireNumberCalc } from './fire-number-calc'
import { calculators } from '@/lib/calculators/registry'

interface CalculatorDisplayProps {
  slug: string
  compact?: boolean
  onBack?: () => void
  prefillValues?: Record<string, number>
  onResultChange?: (results: Record<string, number>) => void
}

// Map calculator slugs to their components
const calculatorComponents: Record<string, React.ComponentType<{
  compact?: boolean
  prefillValues?: Record<string, number>
  onResultChange?: (results: Record<string, number>) => void
}>> = {
  'fire-number': FireNumberCalc,
  // Add more calculators here as they're built
  // 'coast-fire': CoastFireCalc,
  // 'fire-date': FireDateCalc,
}

export function CalculatorDisplay({ slug, compact = false, onBack, prefillValues, onResultChange }: CalculatorDisplayProps) {
  const CalculatorComponent = calculatorComponents[slug]
  const calculatorInfo = calculators.find(c => c.slug === slug)

  if (!CalculatorComponent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-2xl">🚧</span>
        </div>
        <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
        <p className="text-white/50 mb-6">
          The {calculatorInfo?.name || 'calculator'} is under development.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ← Back to calculators
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and open in page link */}
      {(onBack || !compact) && (
        <div className="flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to calculators
            </button>
          )}
          {compact && (
            <Link
              href={`/calculators/${slug}`}
              className="flex items-center gap-1 text-sm text-white/50 hover:text-white/70 transition-colors ml-auto"
            >
              Open full view
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Calculator Component */}
      <CalculatorComponent compact={compact} prefillValues={prefillValues} onResultChange={onResultChange} />
    </div>
  )
}

// Export individual calculators for direct use
export { FireNumberCalc } from './fire-number-calc'
