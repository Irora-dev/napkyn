'use client'

import { useState, useEffect, useCallback } from 'react'
import { ParsedIntent, FlowStep, getFlowForIntent } from '@/lib/intent/types'
import { CalculatorDisplay } from '@/components/calculators'
import { IntakeCards } from './intake-cards'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'

interface IntentFlowProps {
  query: string
}

interface CalculatorResults {
  [calculatorSlug: string]: Record<string, number>
}

type FlowPhase = 'loading' | 'intake' | 'calculators'

export function IntentFlow({ query }: IntentFlowProps) {
  const [intent, setIntent] = useState<ParsedIntent | null>(null)
  const [phase, setPhase] = useState<FlowPhase>('loading')
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<CalculatorResults>({})
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([])
  const [intakeValues, setIntakeValues] = useState<Record<string, number>>({})

  // Parse the intent when query changes
  useEffect(() => {
    async function parseIntent() {
      if (!query) return

      setPhase('loading')
      setError(null)

      try {
        const response = await fetch('/api/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })

        if (!response.ok) {
          throw new Error('Failed to parse intent')
        }

        const parsed: ParsedIntent = await response.json()
        setIntent(parsed)

        const flow = getFlowForIntent(parsed.category)
        setFlowSteps(flow.steps)

        // Move to intake phase
        setPhase('intake')

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setPhase('loading')
      }
    }

    parseIntent()
  }, [query])

  // Handle intake completion
  const handleIntakeComplete = useCallback((values: Record<string, number>) => {
    setIntakeValues(values)
    setPhase('calculators')
  }, [])

  // Handle calculator result updates
  const handleCalculatorResult = useCallback((slug: string, calculatorResults: Record<string, number>) => {
    setResults(prev => ({
      ...prev,
      [slug]: calculatorResults
    }))
  }, [])

  // Build pre-fill values for current calculator
  const getPrefillValues = useCallback(() => {
    if (!intent || !flowSteps[currentStep]) return {}

    const step = flowSteps[currentStep]
    const prefill: Record<string, number> = {}

    // Start with intake values (highest priority for first calculator)
    if (step.prefillFrom.includes('extracted')) {
      Object.assign(prefill, intakeValues)
    }

    // From previous calculator results
    if (step.prefillFrom.includes('previous')) {
      // Look at all previous steps and merge their results
      for (let i = 0; i < currentStep; i++) {
        const prevSlug = flowSteps[i].calculatorSlug
        const prevResults = results[prevSlug]
        if (prevResults) {
          Object.assign(prefill, prevResults)
        }
      }
    }

    return prefill
  }, [intent, flowSteps, currentStep, results, intakeValues])

  const goToNext = () => {
    if (currentStep < flowSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (index: number) => {
    setCurrentStep(index)
  }

  // Loading state
  if (phase === 'loading' && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/60">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-lg font-light">Understanding your goal...</p>
        <p className="text-sm text-white/40 mt-2">Analyzing: &quot;{query}&quot;</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/60">
        <p className="text-lg mb-4">Something went wrong</p>
        <p className="text-sm text-white/40">{error}</p>
      </div>
    )
  }

  // No intent parsed
  if (!intent || flowSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/60">
        <p className="text-lg">Could not understand your intent</p>
        <p className="text-sm text-white/40 mt-2">Try rephrasing your query</p>
      </div>
    )
  }

  // Intake phase - conversational cards
  if (phase === 'intake') {
    return (
      <div className="w-full">
        {/* Show what we understood */}
        <div className="text-center mb-8">
          <p className="text-white/70 text-lg font-light leading-relaxed max-w-xl mx-auto">
            {intent.introMessage}
          </p>
          {intent.extractedValues.targetAge && (
            <p className="text-white/40 text-sm mt-2">
              Target: Age {intent.extractedValues.targetAge}
            </p>
          )}
        </div>

        {/* Intake cards */}
        <IntakeCards
          intent={intent}
          onComplete={handleIntakeComplete}
        />
      </div>
    )
  }

  const currentFlowStep = flowSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === flowSteps.length - 1

  // Calculator phase
  return (
    <div className="w-full">
      {/* Step progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {flowSteps.map((step, index) => (
          <button
            key={step.calculatorSlug}
            onClick={() => goToStep(index)}
            className="flex items-center gap-2 group"
          >
            {/* Step dot/check */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-300
                ${index < currentStep
                  ? 'bg-white/20 text-white'
                  : index === currentStep
                    ? 'bg-white/10 text-white ring-2 ring-white/30'
                    : 'bg-white/5 text-white/40'
                }
              `}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>

            {/* Step label (hidden on mobile) */}
            <span
              className={`
                hidden md:block text-sm font-light transition-colors
                ${index === currentStep ? 'text-white/80' : 'text-white/40'}
              `}
            >
              {step.title}
            </span>

            {/* Connector line */}
            {index < flowSteps.length - 1 && (
              <div
                className={`
                  w-8 h-px mx-2
                  ${index < currentStep ? 'bg-white/30' : 'bg-white/10'}
                `}
              />
            )}
          </button>
        ))}
      </div>

      {/* Current step info */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-light text-white/90 mb-2">
          {currentFlowStep.title}
        </h3>
        <p className="text-sm text-white/50 max-w-lg mx-auto">
          {currentFlowStep.whyThisMatters}
        </p>
      </div>

      {/* Calculator */}
      <div className="mb-8">
        <CalculatorDisplay
          slug={currentFlowStep.calculatorSlug}
          compact={true}
          prefillValues={getPrefillValues()}
          onResultChange={(calculatorResults) =>
            handleCalculatorResult(currentFlowStep.calculatorSlug, calculatorResults)
          }
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          onClick={goToPrevious}
          disabled={isFirstStep}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isFirstStep
              ? 'opacity-30 cursor-not-allowed'
              : 'text-white/70 hover:text-white hover:bg-white/5'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-white/40 text-sm">
          Step {currentStep + 1} of {flowSteps.length}
        </div>

        <button
          onClick={goToNext}
          disabled={isLastStep}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isLastStep
              ? 'opacity-30 cursor-not-allowed'
              : 'text-white bg-white/10 hover:bg-white/15'
            }
          `}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary on last step */}
      {isLastStep && Object.keys(results).length > 0 && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <h4 className="text-lg font-light text-white/80 mb-4 text-center">
            Your Journey Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flowSteps.map((step) => {
              const stepResults = results[step.calculatorSlug]
              if (!stepResults) return null

              return (
                <div
                  key={step.calculatorSlug}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-sm text-white/50 mb-1">{step.title}</p>
                  <div className="text-white/80">
                    {Object.entries(stepResults).slice(0, 2).map(([key, value]) => (
                      <p key={key} className="text-sm">
                        {key}: {typeof value === 'number' ? value.toLocaleString() : value}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
