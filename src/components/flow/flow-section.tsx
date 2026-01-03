'use client'

import { forwardRef } from 'react'
import { LifeSuite } from './life-suite'

interface FlowSectionProps {
  mode: 'intent' | 'suite' | null
  searchQuery?: string
  onSelectCalculator?: (slug: string) => void
  isLightOn?: boolean
}

export const FlowSection = forwardRef<HTMLDivElement, FlowSectionProps>(
  ({ mode, searchQuery, onSelectCalculator, isLightOn = false }, ref) => {
    if (!mode) return null

    return (
      <section
        ref={ref}
        className="relative min-h-screen w-full overflow-hidden"
      >
        {/* Background Image Day (light off - default) */}
        <div
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
            isLightOn ? 'opacity-0 brightness-50' : 'opacity-100 brightness-100'
          }`}
          style={{
            backgroundImage: 'url(/BG2DAY.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Background Image Night (light on - night mode) */}
        <div
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
            isLightOn ? 'opacity-100 brightness-100' : 'opacity-0 brightness-50'
          }`}
          style={{
            backgroundImage: 'url(/BG2NIGHT.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Radial gradient overlay - darker in center, transparent at edges to show bg */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 50% at 50% 50%,
                rgba(0, 0, 0, 0.85) 0%,
                rgba(0, 0, 0, 0.7) 40%,
                rgba(0, 0, 0, 0.4) 70%,
                rgba(0, 0, 0, 0.1) 100%
              )
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-16">
          {/* Section header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-2">
              {mode === 'intent' ? 'Your Personalized Path' : 'The Life Suite'}
            </h2>
            <p className="text-white/50 text-sm">
              {mode === 'intent'
                ? `Based on: "${searchQuery}"`
                : 'Explore our collection of life calculators'}
            </p>
          </div>

          {/* Glass container */}
          <div className="w-full max-w-6xl">
            <div
              className="
                relative p-8 md:p-12
                rounded-3xl
                bg-white/5
                backdrop-blur-xl
                border border-white/10
                shadow-[0_0_60px_rgba(0,0,0,0.5)]
              "
            >
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

              {/* Content area */}
              <div className="relative z-10">
                {mode === 'intent' ? (
                  <IntentFlowContent query={searchQuery} />
                ) : (
                  <LifeSuite onSelectCalculator={onSelectCalculator} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
)

FlowSection.displayName = 'FlowSection'

// Placeholder component for intent-based flow
function IntentFlowContent({ query }: { query?: string }) {
  return (
    <div className="text-center text-white/60">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-2xl">🎯</span>
      </div>
      <p className="text-lg mb-4">Analyzing your intent...</p>
      <p className="text-sm text-white/40">
        Custom flow based on your query will appear here
      </p>
    </div>
  )
}

