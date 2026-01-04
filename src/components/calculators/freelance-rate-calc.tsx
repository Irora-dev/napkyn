'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Briefcase, Clock, DollarSign } from 'lucide-react'

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

interface FreelanceRateCalcProps {
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

export function FreelanceRateCalc({ compact = false, prefillValues, onResultChange }: FreelanceRateCalcProps) {
  // Target income
  const [targetAnnualIncome, setTargetAnnualIncome] = useState(prefillValues?.annualIncome ?? 100000)

  // Work schedule
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState(prefillValues?.billableHoursPerWeek ?? 30)
  const [weeksWorkedPerYear, setWeeksWorkedPerYear] = useState(prefillValues?.weeksWorkedPerYear ?? 48)

  // Business expenses
  const [healthInsurance, setHealthInsurance] = useState(prefillValues?.healthInsurance ?? 500)
  const [retirementContribution, setRetirementContribution] = useState(prefillValues?.retirementContribution ?? 15)
  const [businessExpenses, setBusinessExpenses] = useState(prefillValues?.businessExpenses ?? 500)
  const [selfEmploymentTax, setSelfEmploymentTax] = useState(prefillValues?.selfEmploymentTax ?? 15.3)

  const results = useMemo(() => {
    // Annual costs
    const annualHealthInsurance = healthInsurance * 12
    const annualBusinessExpenses = businessExpenses * 12

    // Gross needed to cover target + expenses + taxes
    // Simplified: grossNeeded = (target + expenses) / (1 - taxRate)
    const taxRate = selfEmploymentTax / 100
    const retirementRate = retirementContribution / 100

    const totalExpenses = annualHealthInsurance + annualBusinessExpenses
    const neededAfterTax = targetAnnualIncome + totalExpenses

    // Account for SE tax and retirement
    // Gross * (1 - SE tax) * (1 - retirement) = neededAfterTax
    const grossNeeded = neededAfterTax / ((1 - taxRate) * (1 - retirementRate))

    // Billable hours
    const annualBillableHours = billableHoursPerWeek * weeksWorkedPerYear

    // Required hourly rate
    const hourlyRate = grossNeeded / annualBillableHours

    // Daily and project rates
    const dailyRate = hourlyRate * 8
    const weeklyRate = hourlyRate * billableHoursPerWeek
    const monthlyRetainer = grossNeeded / 12

    // Effective hourly with 40hr comparison
    const totalWeeklyHours = 40 // Assume 40hr total work week
    const effectiveHourly = grossNeeded / (totalWeeklyHours * weeksWorkedPerYear)

    // W2 equivalent salary
    const w2Equivalent = targetAnnualIncome * 1.3 // Rough estimate including benefits

    return {
      hourlyRate,
      dailyRate,
      weeklyRate,
      monthlyRetainer,
      grossNeeded,
      annualBillableHours,
      effectiveHourly,
      w2Equivalent,
      totalExpenses,
      taxAmount: grossNeeded * taxRate,
      retirementAmount: grossNeeded * (1 - taxRate) * retirementRate
    }
  }, [targetAnnualIncome, billableHoursPerWeek, weeksWorkedPerYear, healthInsurance, retirementContribution, businessExpenses, selfEmploymentTax])

  useEffect(() => {
    onResultChange?.({
      targetAnnualIncome,
      billableHoursPerWeek,
      weeksWorkedPerYear,
      hourlyRate: results.hourlyRate,
      dailyRate: results.dailyRate,
      grossNeeded: results.grossNeeded
    })
  }, [results, targetAnnualIncome, billableHoursPerWeek, weeksWorkedPerYear, onResultChange])

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
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Minimum Hourly Rate</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.hourlyRate} format={(n) => `$${n.toFixed(0)}`} />
            <span className="text-2xl text-white/40 font-light">/hr</span>
          </p>
          <div className="mt-6">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">To Net</p>
            <p className="text-lg font-light text-white/70">
              {formatCurrency(targetAnnualIncome)}/year take-home
            </p>
          </div>
        </div>

        {/* Rate cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-[11px] text-white/30 uppercase mb-1">Hourly</p>
            <p className="text-xl font-light text-white/80">${results.hourlyRate.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-[11px] text-white/30 uppercase mb-1">Daily</p>
            <p className="text-xl font-light text-white/80">${results.dailyRate.toFixed(0)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-[11px] text-white/30 uppercase mb-1">Weekly</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(results.weeklyRate)}</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <p className="text-[11px] text-white/30 uppercase tracking-wider">Income Goal</p>
          <InputField
            label="Target take-home income"
            value={targetAnnualIncome}
            onChange={setTargetAnnualIncome}
            min={30000}
            max={500000}
            step={5000}
            format={formatCurrencyFull}
          />

          <p className="text-[11px] text-white/30 uppercase tracking-wider pt-4">Work Schedule</p>
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Billable hrs/week"
              value={billableHoursPerWeek}
              onChange={setBillableHoursPerWeek}
              min={10}
              max={50}
              step={1}
              suffix=" hrs"
            />
            <InputField
              label="Weeks worked/year"
              value={weeksWorkedPerYear}
              onChange={setWeeksWorkedPerYear}
              min={40}
              max={52}
              step={1}
              suffix=" wks"
            />
          </div>

          <p className="text-[11px] text-white/30 uppercase tracking-wider pt-4">Expenses & Taxes</p>
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Health insurance/mo"
              value={healthInsurance}
              onChange={setHealthInsurance}
              min={0}
              max={2000}
              step={50}
              format={formatCurrencyFull}
            />
            <InputField
              label="Business expenses/mo"
              value={businessExpenses}
              onChange={setBusinessExpenses}
              min={0}
              max={3000}
              step={100}
              format={formatCurrencyFull}
            />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="SE tax rate"
              value={selfEmploymentTax}
              onChange={setSelfEmploymentTax}
              min={10}
              max={25}
              step={0.1}
              suffix="%"
            />
            <InputField
              label="Retirement savings"
              value={retirementContribution}
              onChange={setRetirementContribution}
              min={0}
              max={25}
              step={1}
              suffix="%"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
          <div className="flex justify-between text-[13px]">
            <span className="text-white/40">Gross needed</span>
            <span className="text-white/70">{formatCurrency(results.grossNeeded)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-white/40">SE taxes</span>
            <span className="text-white/70">-{formatCurrency(results.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-white/40">Retirement</span>
            <span className="text-white/70">-{formatCurrency(results.retirementAmount)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-white/40">Expenses</span>
            <span className="text-white/70">-{formatCurrency(results.totalExpenses)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-[13px]">
            <span className="text-white/60">Take-home</span>
            <span className="text-white/90 font-medium">{formatCurrency(targetAnnualIncome)}</span>
          </div>
        </div>

        {/* W2 comparison */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <Briefcase className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-white/50 leading-relaxed">
              To match this as a W-2 employee with benefits, you'd need roughly{' '}
              <span className="text-white/70">{formatCurrency(results.w2Equivalent)}/year</span> salary.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Minimum Hourly Rate</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.hourlyRate} format={(n) => `$${n.toFixed(0)}`} />
        </p>
      </div>
    </div>
  )
}
