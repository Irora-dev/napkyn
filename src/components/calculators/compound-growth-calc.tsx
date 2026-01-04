'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'

// Animated number component
function AnimatedNumber({
  value,
  format,
  className = ''
}: {
  value: number
  format: (n: number) => string
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true)
      const startValue = prevValue.current
      const endValue = value
      const duration = 400
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = startValue + (endValue - startValue) * eased
        setDisplayValue(current)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          prevValue.current = value
        }
      }

      requestAnimationFrame(animate)
    }
  }, [value])

  return (
    <span
      className={`inline-block transition-transform duration-150 ${isAnimating ? 'scale-[1.02]' : 'scale-100'} ${className}`}
      style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.5) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {format(displayValue)}
    </span>
  )
}

interface CompoundGrowthCalcProps {
  compact?: boolean
  prefillValues?: Record<string, number>
  onResultChange?: (results: Record<string, number>) => void
}

function Slider({
  value,
  onChange,
  min,
  max,
  step
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}) {
  const id = useId()
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="relative h-1.5 group cursor-pointer">
      <div className="absolute inset-0 rounded-full bg-white/[0.08]" />
      <div
        className="absolute left-0 top-0 bottom-0 rounded-full bg-white/30 transition-all duration-100"
        style={{ width: `${percentage}%` }}
      />
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ margin: 0 }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-100 group-hover:scale-110 pointer-events-none"
        style={{ left: `calc(${percentage}% - 6px)` }}
      />
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  suffix = ''
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format?: (value: number) => string
  suffix?: string
}) {
  const displayValue = format ? format(value) : `${value}${suffix}`

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-[13px] text-white/40">{label}</label>
        <span className="text-[15px] font-medium text-white/90 tabular-nums">{displayValue}</span>
      </div>
      <Slider value={value} onChange={onChange} min={min} max={max} step={step} />
    </div>
  )
}

export function CompoundGrowthCalc({ compact = false, prefillValues, onResultChange }: CompoundGrowthCalcProps) {
  const [initialAmount, setInitialAmount] = useState(prefillValues?.currentSavings ?? prefillValues?.initialAmount ?? 10000)
  const [monthlyContribution, setMonthlyContribution] = useState(prefillValues?.monthlySavings ?? prefillValues?.monthlyContribution ?? 500)
  const [annualReturn, setAnnualReturn] = useState(prefillValues?.expectedReturn ?? 7)
  const [years, setYears] = useState(prefillValues?.timeline ?? 20)

  const results = useMemo(() => {
    const monthlyReturn = annualReturn / 100 / 12
    const months = years * 12

    // Future value with monthly contributions
    // FV = P(1+r)^n + PMT * (((1+r)^n - 1) / r)
    const futureValue = initialAmount * Math.pow(1 + monthlyReturn, months) +
      monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn)

    const totalContributions = initialAmount + (monthlyContribution * months)
    const totalInterest = futureValue - totalContributions

    // Calculate year-by-year growth for display
    const yearlyData: { year: number; balance: number; contributions: number; interest: number }[] = []
    let balance = initialAmount
    let totalContrib = initialAmount

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyReturn) + monthlyContribution
        totalContrib += monthlyContribution
      }
      yearlyData.push({
        year: y,
        balance,
        contributions: totalContrib,
        interest: balance - totalContrib
      })
    }

    return {
      futureValue,
      totalContributions,
      totalInterest,
      yearlyData,
      interestPercent: (totalInterest / futureValue) * 100
    }
  }, [initialAmount, monthlyContribution, annualReturn, years])

  useEffect(() => {
    onResultChange?.({
      initialAmount,
      monthlyContribution,
      annualReturn,
      years,
      futureValue: results.futureValue,
      totalContributions: results.totalContributions,
      totalInterest: results.totalInterest
    })
  }, [results, initialAmount, monthlyContribution, annualReturn, years, onResultChange])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  if (compact) {
    return (
      <div className="space-y-8">
        {/* Primary result */}
        <div className="text-center py-8">
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Future Value</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.futureValue} format={formatCurrency} />
          </p>
          <div className="mt-6">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">After {years} Years</p>
            <p className="text-lg font-light text-white/70">
              {formatCurrency(results.totalInterest)} from interest ({results.interestPercent.toFixed(0)}%)
            </p>
          </div>
        </div>

        {/* Visual breakdown */}
        <div className="space-y-2">
          <div className="h-3 bg-white/[0.08] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-white/20"
              style={{ width: `${(results.totalContributions / results.futureValue) * 100}%` }}
            />
            <div
              className="h-full bg-white/40"
              style={{ width: `${(results.totalInterest / results.futureValue) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/30">
            <span>Contributions: {formatCurrency(results.totalContributions)}</span>
            <span>Interest: {formatCurrency(results.totalInterest)}</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="Starting amount"
            value={initialAmount}
            onChange={setInitialAmount}
            min={0}
            max={500000}
            step={5000}
            format={formatCurrencyFull}
          />
          <InputField
            label="Monthly contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            min={0}
            max={10000}
            step={100}
            format={formatCurrencyFull}
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Annual return"
              value={annualReturn}
              onChange={setAnnualReturn}
              min={1}
              max={15}
              step={0.5}
              suffix="%"
            />
            <InputField
              label="Time period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              suffix=" years"
            />
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[13px] text-white/50 leading-relaxed">
            Investing {formatCurrency(monthlyContribution)}/month at {annualReturn}% return turns your{' '}
            {formatCurrency(initialAmount)} into {formatCurrency(results.futureValue)} over {years} years.
            That's {formatCurrency(results.totalInterest)} in free money from compound growth.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Future Value</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.futureValue} format={formatCurrency} />
        </p>
      </div>
    </div>
  )
}
