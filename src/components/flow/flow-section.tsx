'use client'

import { forwardRef, useState } from 'react'
import { LifeSuite } from './life-suite'
import { CalculatorDisplay } from '@/components/calculators'
import { IntentFlow } from './intent-flow'
import { calculators } from '@/lib/calculators/registry'

interface FlowSectionProps {
  mode: 'intent' | 'suite' | null
  searchQuery?: string
  isLightOn?: boolean
}

export const FlowSection = forwardRef<HTMLDivElement, FlowSectionProps>(
  ({ mode, searchQuery, isLightOn = false }, ref) => {
    const [activeCalculator, setActiveCalculator] = useState<string | null>(null)

    if (!mode) return null

    const activeCalcInfo = activeCalculator
      ? calculators.find(c => c.slug === activeCalculator)
      : null

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
              {mode === 'intent'
                ? 'Your Personalized Path'
                : activeCalcInfo
                  ? activeCalcInfo.name
                  : 'The Life Suite'}
            </h2>
            <p className="text-white/50 text-sm">
              {mode === 'intent'
                ? `Based on: "${searchQuery}"`
                : activeCalcInfo
                  ? activeCalcInfo.description
                  : 'Explore our collection of life calculators'}
            </p>
          </div>

          {/* Glass container */}
          <div className="w-full max-w-6xl">
            <div
              className="
                relative p-8 md:p-12
                rounded-3xl
                bg-white/[0.03]
                backdrop-blur-2xl
                border border-white/[0.08]
                shadow-[0_0_80px_rgba(0,0,0,0.4)]
                overflow-hidden
              "
            >
              {/* SVG noise filter */}
              <svg className="absolute w-0 h-0">
                <filter id="glass-noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
              </svg>

              {/* Noise texture overlay */}
              <div
                className="absolute inset-0 rounded-3xl opacity-[0.015] pointer-events-none"
                style={{ filter: 'url(#glass-noise)' }}
              />

              {/* Gradient variance - top left warm */}
              <div
                className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
                }}
              />

              {/* Gradient variance - bottom right cool */}
              <div
                className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
                }}
              />

              {/* Gradient variance - center subtle */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.02) 0%, transparent 50%)',
                }}
              />

              {/* Top edge highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Inner glow - top */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none" />

              {/* Inner glow - subtle bottom reflection */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/[0.01] via-transparent to-transparent pointer-events-none" />

              {/* Content area */}
              <div className="relative z-10">
                {mode === 'intent' ? (
                  <IntentFlow query={searchQuery || ''} />
                ) : activeCalculator ? (
                  <CalculatorDisplay
                    slug={activeCalculator}
                    compact={true}
                    onBack={() => setActiveCalculator(null)}
                  />
                ) : (
                  <LifeSuite onSelectCalculator={(slug) => setActiveCalculator(slug)} />
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

