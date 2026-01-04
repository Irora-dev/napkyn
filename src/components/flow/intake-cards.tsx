'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { ParsedIntent } from '@/lib/intent/types'

interface IntakeQuestion {
  key: string
  question: string
  subtext?: string
  min: number
  max: number
  step: number
  default: number
  format: (value: number) => string
  response?: (value: number, allValues: Record<string, number>) => string
}

// Define questions based on intent category
const questionsByCategory: Record<string, IntakeQuestion[]> = {
  retirement: [
    {
      key: 'currentAge',
      question: "How old are you now?",
      min: 18,
      max: 70,
      step: 1,
      default: 30,
      format: (v) => `${v} years old`,
      response: (v, all) => all.targetAge
        ? `That gives you ${all.targetAge - v} years to reach your goal`
        : `Got it, ${v} years old`
    },
    {
      key: 'currentSavings',
      question: "What have you saved so far?",
      subtext: "Include retirement accounts, investments, savings",
      min: 0,
      max: 2000000,
      step: 10000,
      default: 50000,
      format: (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}K`,
      response: (v) => v > 100000 ? "Solid foundation" : v > 0 ? "Every dollar counts" : "Starting fresh - that's okay"
    },
    {
      key: 'monthlySavings',
      question: "How much can you save each month?",
      subtext: "What you put toward retirement/investments",
      min: 0,
      max: 10000,
      step: 250,
      default: 1500,
      format: (v) => `$${v.toLocaleString()}/mo`,
      response: (v) => v >= 3000 ? "Impressive commitment" : v >= 1000 ? "Consistent saving wins" : "We'll work with what you have"
    },
    {
      key: 'annualExpenses',
      question: "What are your yearly expenses?",
      subtext: "Rough estimate of your annual spending",
      min: 20000,
      max: 200000,
      step: 5000,
      default: 50000,
      format: (v) => `$${(v/1000).toFixed(0)}K/year`,
      response: (v) => v <= 40000 ? "Lean lifestyle - that helps" : v <= 80000 ? "Pretty typical" : "Higher expenses means a bigger target"
    }
  ],
  fire: [
    {
      key: 'currentAge',
      question: "What's your current age?",
      min: 18,
      max: 60,
      step: 1,
      default: 28,
      format: (v) => `${v}`,
      response: (v) => v < 30 ? "Time is your biggest asset" : v < 40 ? "Still plenty of runway" : "It's never too late to start"
    },
    {
      key: 'annualIncome',
      question: "What's your annual income?",
      subtext: "Gross income before taxes",
      min: 30000,
      max: 500000,
      step: 10000,
      default: 80000,
      format: (v) => `$${(v/1000).toFixed(0)}K`,
      response: () => ""
    },
    {
      key: 'currentSavings',
      question: "Current invested assets?",
      subtext: "401k, IRA, brokerage, etc.",
      min: 0,
      max: 2000000,
      step: 10000,
      default: 75000,
      format: (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}K`,
      response: (v, all) => {
        if (!all.annualIncome) return ""
        const ratio = v / all.annualIncome
        return ratio >= 2 ? "Ahead of the curve" : ratio >= 1 ? "On track" : "Building momentum"
      }
    },
    {
      key: 'annualExpenses',
      question: "Annual spending?",
      subtext: "This determines your FIRE number",
      min: 20000,
      max: 200000,
      step: 5000,
      default: 45000,
      format: (v) => `$${(v/1000).toFixed(0)}K/year`,
      response: (v, all) => {
        if (!all.annualIncome) return ""
        const savingsRate = ((all.annualIncome - v) / all.annualIncome) * 100
        return savingsRate >= 50 ? `${savingsRate.toFixed(0)}% savings rate - incredible` :
               savingsRate >= 30 ? `${savingsRate.toFixed(0)}% savings rate - solid` :
               `${savingsRate.toFixed(0)}% savings rate`
      }
    }
  ],
  home_buying: [
    {
      key: 'annualIncome',
      question: "What's your household income?",
      min: 30000,
      max: 500000,
      step: 10000,
      default: 85000,
      format: (v) => `$${(v/1000).toFixed(0)}K/year`,
      response: () => ""
    },
    {
      key: 'currentSavings',
      question: "How much have you saved for a down payment?",
      min: 0,
      max: 500000,
      step: 5000,
      default: 30000,
      format: (v) => `$${(v/1000).toFixed(0)}K`,
      response: (v) => v >= 100000 ? "Strong down payment ready" : v >= 50000 ? "Good progress" : "Building up"
    },
    {
      key: 'targetAmount',
      question: "What home price are you considering?",
      min: 100000,
      max: 1500000,
      step: 25000,
      default: 350000,
      format: (v) => `$${(v/1000).toFixed(0)}K`,
      response: (v, all) => {
        if (!all.currentSavings) return ""
        const pct = (all.currentSavings / v) * 100
        return pct >= 20 ? `${pct.toFixed(0)}% down payment - no PMI` : `${pct.toFixed(0)}% down payment saved`
      }
    }
  ],
  // Default questions for other categories
  default: [
    {
      key: 'currentAge',
      question: "How old are you?",
      min: 18,
      max: 70,
      step: 1,
      default: 30,
      format: (v) => `${v}`,
      response: () => ""
    },
    {
      key: 'currentSavings',
      question: "Current savings & investments?",
      min: 0,
      max: 2000000,
      step: 10000,
      default: 50000,
      format: (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}K`,
      response: () => ""
    },
    {
      key: 'annualExpenses',
      question: "Annual expenses?",
      min: 20000,
      max: 200000,
      step: 5000,
      default: 50000,
      format: (v) => `$${(v/1000).toFixed(0)}K/year`,
      response: () => ""
    }
  ]
}

interface IntakeCardsProps {
  intent: ParsedIntent
  onComplete: (values: Record<string, number>) => void
}

export function IntakeCards({ intent, onComplete }: IntakeCardsProps) {
  const questions = questionsByCategory[intent.category] || questionsByCategory.default

  // Filter out questions we already have answers for
  const missingQuestions = questions.filter(q => {
    const extracted = intent.extractedValues[q.key as keyof typeof intent.extractedValues]
    return extracted === undefined
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [values, setValues] = useState<Record<string, number>>(() => {
    // Initialize with extracted values
    const initial: Record<string, number> = {}
    for (const q of questions) {
      const extracted = intent.extractedValues[q.key as keyof typeof intent.extractedValues]
      initial[q.key] = extracted ?? q.default
    }
    // Add targetAge if we have it
    if (intent.extractedValues.targetAge) {
      initial.targetAge = intent.extractedValues.targetAge
    }
    return initial
  })
  const [showResponse, setShowResponse] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // If no questions to ask, complete immediately
  useEffect(() => {
    if (missingQuestions.length === 0) {
      onComplete(values)
    }
  }, [])

  if (missingQuestions.length === 0) {
    return null
  }

  const currentQuestion = missingQuestions[currentIndex]
  const currentValue = values[currentQuestion.key]
  const progress = ((currentIndex + 1) / missingQuestions.length) * 100

  const handleNext = () => {
    setShowResponse(true)

    setTimeout(() => {
      setIsExiting(true)

      setTimeout(() => {
        if (currentIndex < missingQuestions.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setShowResponse(false)
          setIsExiting(false)
        } else {
          onComplete(values)
        }
      }, 300)
    }, 800)
  }

  const handleValueChange = (newValue: number) => {
    setValues(prev => ({ ...prev, [currentQuestion.key]: newValue }))
  }

  const responseText = currentQuestion.response?.(currentValue, values)

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-white/30 mt-2 text-right">
          {currentIndex + 1} of {missingQuestions.length}
        </p>
      </div>

      {/* Card */}
      <div
        className={`
          relative p-8 rounded-2xl
          bg-white/[0.03] backdrop-blur-xl
          border border-white/[0.08]
          transition-all duration-300 ease-out
          ${isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}
        `}
      >
        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-light text-white/90 mb-2">
            {currentQuestion.question}
          </h3>
          {currentQuestion.subtext && (
            <p className="text-sm text-white/40">{currentQuestion.subtext}</p>
          )}
        </div>

        {/* Value display */}
        <div className="text-center mb-8">
          <span className="text-5xl font-extralight text-white tabular-nums">
            {currentQuestion.format(currentValue)}
          </span>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <div className="relative h-2 group">
            <div className="absolute inset-0 rounded-full bg-white/[0.08]" />
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-white/20 to-white/40 transition-all duration-100"
              style={{
                width: `${((currentValue - currentQuestion.min) / (currentQuestion.max - currentQuestion.min)) * 100}%`
              }}
            />
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              value={currentValue}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-transform duration-100 group-hover:scale-110 pointer-events-none"
              style={{
                left: `calc(${((currentValue - currentQuestion.min) / (currentQuestion.max - currentQuestion.min)) * 100}% - 8px)`
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-white/20">
            <span>{currentQuestion.format(currentQuestion.min)}</span>
            <span>{currentQuestion.format(currentQuestion.max)}</span>
          </div>
        </div>

        {/* Response area */}
        <div className="h-6 mb-6">
          {showResponse && responseText && (
            <p className="text-sm text-white/50 text-center animate-fade-in">
              {responseText}
            </p>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="
            w-full py-3 rounded-xl
            bg-white/10 hover:bg-white/15
            border border-white/10
            text-white/80 text-sm font-medium
            flex items-center justify-center gap-2
            transition-all duration-200
          "
        >
          {currentIndex < missingQuestions.length - 1 ? 'Continue' : 'See My Numbers'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Skip option */}
      <button
        onClick={() => onComplete(values)}
        className="mt-4 w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors"
      >
        Skip and use defaults
      </button>
    </div>
  )
}
