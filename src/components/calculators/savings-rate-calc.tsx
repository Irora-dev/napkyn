'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Zap } from 'lucide-react'

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

interface SavingsRateCalcProps {
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

export function SavingsRateCalc({ compact = false, prefillValues, onResultChange }: SavingsRateCalcProps) {
  const [annualIncome, setAnnualIncome] = useState(prefillValues?.annualIncome ?? 80000)
  const [annualExpenses, setAnnualExpenses] = useState(prefillValues?.annualExpenses ?? 50000)
  const [currentSavings, setCurrentSavings] = useState(prefillValues?.currentSavings ?? 50000)
  const [expectedReturn, setExpectedReturn] = useState(prefillValues?.expectedReturn ?? 7)

  const results = useMemo(() => {
    const annualSavings = annualIncome - annualExpenses
    const savingsRate = (annualSavings / annualIncome) * 100
    const monthlySavings = annualSavings / 12

    // Years to FIRE calculation using the formula from MMM
    // Assumes 4% withdrawal rate
    const withdrawalRate = 0.04
    const fireNumber = annualExpenses / withdrawalRate
    const realReturn = expectedReturn / 100

    // Years to FIRE with current savings
    let yearsToFire = 0
    let balance = currentSavings

    if (annualSavings > 0) {
      for (let year = 0; year <= 100; year++) {
        if (balance >= fireNumber) {
          yearsToFire = year
          break
        }
        balance = balance * (1 + realReturn) + annualSavings
        if (year === 100) yearsToFire = 100
      }
    }

    // Savings rate to years to FIRE mapping (rough estimates)
    const savingsRateToYears: { rate: number; years: number }[] = [
      { rate: 10, years: 51 },
      { rate: 20, years: 37 },
      { rate: 30, years: 28 },
      { rate: 40, years: 22 },
      { rate: 50, years: 17 },
      { rate: 60, years: 12.5 },
      { rate: 70, years: 8.5 },
      { rate: 80, years: 5.5 },
      { rate: 90, years: 3 },
    ]

    // Rating based on savings rate
    let rating: string
    let ratingColor: string
    if (savingsRate >= 50) {
      rating = 'Excellent'
      ratingColor = 'text-emerald-400'
    } else if (savingsRate >= 30) {
      rating = 'Great'
      ratingColor = 'text-blue-400'
    } else if (savingsRate >= 20) {
      rating = 'Good'
      ratingColor = 'text-white/70'
    } else if (savingsRate >= 10) {
      rating = 'Fair'
      ratingColor = 'text-amber-400'
    } else {
      rating = 'Needs Work'
      ratingColor = 'text-red-400'
    }

    return {
      savingsRate: Math.max(0, savingsRate),
      annualSavings: Math.max(0, annualSavings),
      monthlySavings: Math.max(0, monthlySavings),
      fireNumber,
      yearsToFire: annualSavings > 0 ? yearsToFire : null,
      rating,
      ratingColor,
      savingsRateToYears
    }
  }, [annualIncome, annualExpenses, currentSavings, expectedReturn])

  useEffect(() => {
    onResultChange?.({
      annualIncome,
      annualExpenses,
      currentSavings,
      expectedReturn,
      savingsRate: results.savingsRate,
      annualSavings: results.annualSavings,
      monthlySavings: results.monthlySavings,
      fireNumber: results.fireNumber,
      yearsToFire: results.yearsToFire ?? 0
    })
  }, [results, annualIncome, annualExpenses, currentSavings, expectedReturn, onResultChange])

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
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Savings Rate</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.savingsRate} format={(n) => `${n.toFixed(0)}%`} />
          </p>
          <div className="mt-6">
            <p className={`text-lg font-medium ${results.ratingColor}`}>{results.rating}</p>
            <p className="text-sm text-white/40 mt-1">
              {results.yearsToFire !== null
                ? `${results.yearsToFire} years to financial independence`
                : 'Increase savings to reach FI'
              }
            </p>
          </div>
        </div>

        {/* Visual gauge */}
        <div className="space-y-2">
          <div className="h-3 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                results.savingsRate >= 50 ? 'bg-emerald-500/50' :
                results.savingsRate >= 30 ? 'bg-blue-500/50' :
                results.savingsRate >= 20 ? 'bg-white/30' :
                'bg-amber-500/50'
              }`}
              style={{ width: `${Math.min(results.savingsRate, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/30">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Savings rate impact */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[11px] text-white/30 uppercase tracking-wider mb-3">Savings Rate → Years to FI</p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[10, 25, 50, 70, 90].map(rate => (
              <div key={rate} className={rate === Math.round(results.savingsRate / 10) * 10 ? 'opacity-100' : 'opacity-40'}>
                <p className="text-[13px] font-medium text-white/70">{rate}%</p>
                <p className="text-[11px] text-white/40">
                  {results.savingsRateToYears.find(r => r.rate === rate)?.years ?? '—'}yr
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="Annual income (after tax)"
            value={annualIncome}
            onChange={setAnnualIncome}
            min={20000}
            max={500000}
            step={5000}
            format={formatCurrencyFull}
          />
          <InputField
            label="Annual expenses"
            value={annualExpenses}
            onChange={setAnnualExpenses}
            min={15000}
            max={300000}
            step={5000}
            format={formatCurrencyFull}
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Current savings"
              value={currentSavings}
              onChange={setCurrentSavings}
              min={0}
              max={2000000}
              step={10000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Expected return"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={4}
              max={12}
              step={0.5}
              suffix="%"
            />
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Monthly Savings</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(results.monthlySavings)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">FIRE Number</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(results.fireNumber)}</p>
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-white/50 leading-relaxed">
              {results.savingsRate < 20
                ? "Focus on increasing income or reducing expenses. Even 5% more makes a big difference."
                : results.savingsRate < 50
                  ? "You're on track! Each percentage point increase shaves years off your timeline."
                  : "Impressive! You're fast-tracking to financial independence."
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Savings Rate</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.savingsRate} format={(n) => `${n.toFixed(0)}%`} />
        </p>
      </div>
    </div>
  )
}
