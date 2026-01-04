'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Shield, AlertTriangle, Check } from 'lucide-react'

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

interface EmergencyFundCalcProps {
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

export function EmergencyFundCalc({ compact = false, prefillValues, onResultChange }: EmergencyFundCalcProps) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    prefillValues?.annualExpenses ? prefillValues.annualExpenses / 12 : prefillValues?.monthlyExpenses ?? 4000
  )
  const [targetMonths, setTargetMonths] = useState(prefillValues?.targetMonths ?? 6)
  const [currentSavings, setCurrentSavings] = useState(prefillValues?.currentSavings ?? 5000)
  const [monthlySavings, setMonthlySavings] = useState(prefillValues?.monthlySavings ?? 500)
  const [jobStability, setJobStability] = useState(prefillValues?.jobStability ?? 3) // 1-5 scale

  const results = useMemo(() => {
    // Recommended months based on job stability
    const recommendedMonths = jobStability <= 2 ? 8 : jobStability <= 3 ? 6 : 4
    const targetAmount = monthlyExpenses * targetMonths
    const recommendedAmount = monthlyExpenses * recommendedMonths

    const progress = (currentSavings / targetAmount) * 100
    const isFunded = currentSavings >= targetAmount
    const surplus = currentSavings - targetAmount

    // Time to reach goal
    const remaining = Math.max(0, targetAmount - currentSavings)
    const monthsToGoal = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : Infinity

    return {
      targetAmount,
      recommendedAmount,
      recommendedMonths,
      progress: Math.min(progress, 100),
      isFunded,
      surplus,
      remaining,
      monthsToGoal: monthsToGoal === Infinity ? null : monthsToGoal
    }
  }, [monthlyExpenses, targetMonths, currentSavings, monthlySavings, jobStability])

  useEffect(() => {
    onResultChange?.({
      monthlyExpenses,
      targetMonths,
      currentSavings,
      monthlySavings,
      targetAmount: results.targetAmount,
      progress: results.progress
    })
  }, [results, monthlyExpenses, targetMonths, currentSavings, monthlySavings, onResultChange])

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

  const stabilityLabels = ['Very Unstable', 'Unstable', 'Moderate', 'Stable', 'Very Stable']

  if (compact) {
    return (
      <div className="space-y-8">
        {/* Primary result */}
        <div className="text-center py-8">
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Emergency Fund Target</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.targetAmount} format={formatCurrency} />
          </p>
          <div className="mt-6">
            {results.isFunded ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Fully Funded!</span>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">Time to Goal</p>
                <p className="text-lg font-light text-white/70">
                  {results.monthsToGoal
                    ? `${results.monthsToGoal} months · ${formatCurrency(results.remaining)} to go`
                    : 'Set a monthly savings amount'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                results.isFunded ? 'bg-emerald-500/50' : 'bg-white/30'
              }`}
              style={{ width: `${results.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/30">
            <span>{formatCurrency(currentSavings)} saved</span>
            <span>{results.progress.toFixed(0)}% funded</span>
          </div>
        </div>

        {/* Recommendation */}
        {targetMonths !== results.recommendedMonths && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-amber-200/70">
              Based on your job stability, we recommend {results.recommendedMonths} months ({formatCurrency(results.recommendedAmount)})
            </p>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="Monthly expenses"
            value={monthlyExpenses}
            onChange={setMonthlyExpenses}
            min={1000}
            max={15000}
            step={250}
            format={formatCurrencyFull}
          />
          <InputField
            label="Target months covered"
            value={targetMonths}
            onChange={setTargetMonths}
            min={3}
            max={12}
            step={1}
            suffix=" months"
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Current emergency fund"
              value={currentSavings}
              onChange={setCurrentSavings}
              min={0}
              max={100000}
              step={1000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Monthly savings"
              value={monthlySavings}
              onChange={setMonthlySavings}
              min={0}
              max={5000}
              step={100}
              format={formatCurrencyFull}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-[13px] text-white/40">Job stability</label>
              <span className="text-[15px] font-medium text-white/90">{stabilityLabels[jobStability - 1]}</span>
            </div>
            <Slider value={jobStability} onChange={setJobStability} min={1} max={5} step={1} />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-white/50 leading-relaxed">
              An emergency fund covers unexpected expenses and income loss.
              {jobStability <= 2
                ? " With less stable income, aim for 6-12 months."
                : " Most experts recommend 3-6 months of expenses."
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
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Emergency Fund Target</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.targetAmount} format={formatCurrency} />
        </p>
      </div>
    </div>
  )
}
