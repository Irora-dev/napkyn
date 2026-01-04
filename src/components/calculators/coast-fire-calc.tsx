'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Check } from 'lucide-react'

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

interface CoastFireCalcProps {
  compact?: boolean
  prefillValues?: Record<string, number>
  onResultChange?: (results: Record<string, number>) => void
}

// Slider component
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

// Input field component
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

export function CoastFireCalc({ compact = false, prefillValues, onResultChange }: CoastFireCalcProps) {
  // Inputs - use prefillValues if available
  const [currentAge, setCurrentAge] = useState(prefillValues?.currentAge ?? 30)
  const [targetRetirementAge, setTargetRetirementAge] = useState(prefillValues?.targetAge ?? prefillValues?.fireAge ?? 55)
  const [currentSavings, setCurrentSavings] = useState(prefillValues?.currentSavings ?? 100000)
  const [fireNumber, setFireNumber] = useState(prefillValues?.fireNumber ?? 1250000)
  const [expectedReturn, setExpectedReturn] = useState(prefillValues?.expectedReturn ?? 7)

  // Results
  const results = useMemo(() => {
    const yearsToRetirement = targetRetirementAge - currentAge
    const realReturn = expectedReturn / 100

    // Coast FIRE number = FIRE number / (1 + return)^years
    // This is how much you need NOW to coast to your FIRE number
    const coastFireNumber = fireNumber / Math.pow(1 + realReturn, yearsToRetirement)

    // Are they already at Coast FIRE?
    const isCoastFire = currentSavings >= coastFireNumber
    const coastFireProgress = (currentSavings / coastFireNumber) * 100

    // If not at Coast FIRE, when will they reach it (with $0 additional savings)?
    // They won't reach it without additional savings, so calculate with minimal savings
    let yearsToCoastFire = 0
    if (!isCoastFire) {
      // How many years until current savings grows to coast fire number?
      // coastFireNumber changes as years decrease, so we need to find the intersection
      // currentSavings * (1 + r)^t = fireNumber / (1 + r)^(yearsToRetirement - t)
      // Solving: currentSavings * (1 + r)^(2t) = fireNumber / (1 + r)^yearsToRetirement
      // (1 + r)^(2t) = fireNumber / (currentSavings * (1 + r)^yearsToRetirement)
      // 2t * ln(1 + r) = ln(fireNumber / (currentSavings * (1 + r)^yearsToRetirement))
      const futureValue = currentSavings * Math.pow(1 + realReturn, yearsToRetirement)
      if (futureValue >= fireNumber) {
        // They'll reach FIRE naturally
        yearsToCoastFire = 0
      } else {
        // Need to calculate when they hit coast fire
        // This is complex because coast fire number decreases each year
        // Simplified: assume they save $0 and see if growth ever catches up
        for (let t = 1; t <= yearsToRetirement; t++) {
          const savingsAtT = currentSavings * Math.pow(1 + realReturn, t)
          const coastAtT = fireNumber / Math.pow(1 + realReturn, yearsToRetirement - t)
          if (savingsAtT >= coastAtT) {
            yearsToCoastFire = t
            break
          }
        }
      }
    }

    const coastFireAge = isCoastFire ? currentAge : (yearsToCoastFire > 0 ? currentAge + yearsToCoastFire : null)

    // Surplus/deficit
    const surplus = currentSavings - coastFireNumber

    return {
      coastFireNumber,
      isCoastFire,
      coastFireProgress: Math.min(coastFireProgress, 100),
      coastFireAge,
      yearsToCoastFire,
      surplus,
      yearsToRetirement
    }
  }, [currentAge, targetRetirementAge, currentSavings, fireNumber, expectedReturn])

  // Emit results
  useEffect(() => {
    const numericResults: Record<string, number> = {
      currentAge,
      targetRetirementAge,
      currentSavings,
      fireNumber,
      expectedReturn,
      coastFireNumber: results.coastFireNumber,
      coastFireProgress: results.coastFireProgress,
    }
    if (results.coastFireAge !== null) {
      numericResults.coastFireAge = results.coastFireAge
    }
    onResultChange?.(numericResults)
  }, [results, currentAge, targetRetirementAge, currentSavings, fireNumber, expectedReturn, onResultChange])

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
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Coast FIRE Number</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.coastFireNumber} format={formatCurrency} />
          </p>

          {/* Status */}
          <div className="mt-6">
            {results.isCoastFire ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">You've reached Coast FIRE!</span>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">Progress</p>
                <p className="text-lg font-light text-white/70">
                  {results.coastFireProgress.toFixed(0)}% there · Need {formatCurrency(Math.abs(results.surplus))} more
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                results.isCoastFire ? 'bg-emerald-500/50' : 'bg-white/30'
              }`}
              style={{ width: `${Math.min(results.coastFireProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/30">
            <span>{formatCurrency(currentSavings)} saved</span>
            <span>{formatCurrency(results.coastFireNumber)} goal</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="FIRE Number target"
            value={fireNumber}
            onChange={setFireNumber}
            min={500000}
            max={5000000}
            step={50000}
            format={formatCurrencyFull}
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Current age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={65}
              step={1}
              suffix=" years"
            />
            <InputField
              label="Retirement age"
              value={targetRetirementAge}
              onChange={setTargetRetirementAge}
              min={currentAge + 1}
              max={75}
              step={1}
              suffix=" years"
            />
          </div>
          <InputField
            label="Current savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={2000000}
            step={25000}
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

        {/* Explanation */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[13px] text-white/50 leading-relaxed">
            {results.isCoastFire
              ? `You've hit Coast FIRE! Your ${formatCurrency(currentSavings)} will grow to ${formatCurrency(fireNumber)} by age ${targetRetirementAge} without saving another dollar.`
              : `Coast FIRE means having enough invested that compound growth alone will get you to your FIRE number by retirement. You need ${formatCurrency(results.coastFireNumber)} to coast.`
            }
          </p>
        </div>
      </div>
    )
  }

  // Full page layout (similar structure, more detail)
  return (
    <div className="space-y-8">
      {/* Same as compact for now */}
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Coast FIRE Number</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.coastFireNumber} format={formatCurrency} />
        </p>
      </div>
    </div>
  )
}
