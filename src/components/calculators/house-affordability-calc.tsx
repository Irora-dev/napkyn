'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Home, AlertTriangle, Check } from 'lucide-react'

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

interface HouseAffordabilityCalcProps {
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

export function HouseAffordabilityCalc({ compact = false, prefillValues, onResultChange }: HouseAffordabilityCalcProps) {
  const [annualIncome, setAnnualIncome] = useState(prefillValues?.annualIncome ?? 100000)
  const [monthlyDebts, setMonthlyDebts] = useState(prefillValues?.monthlyDebts ?? 500)
  const [downPayment, setDownPayment] = useState(prefillValues?.downPayment ?? prefillValues?.currentSavings ?? 50000)
  const [interestRate, setInterestRate] = useState(prefillValues?.interestRate ?? 6.5)
  const [loanTerm, setLoanTerm] = useState(prefillValues?.loanTerm ?? 30)

  const results = useMemo(() => {
    const monthlyIncome = annualIncome / 12

    // Standard DTI ratios
    const maxDTI = 0.43 // Max total DTI
    const maxHousingDTI = 0.28 // Max housing-only DTI

    // Max monthly housing payment based on DTI
    const maxTotalPayment = monthlyIncome * maxDTI - monthlyDebts
    const maxHousingPayment = monthlyIncome * maxHousingDTI

    // Use the lower of the two
    const maxMonthlyPayment = Math.min(maxTotalPayment, maxHousingPayment)

    // Estimate taxes + insurance as ~1.5% of home value annually / 12
    // This means: payment = P&I + 0.015 * homePrice / 12
    // We need to solve for homePrice

    // Monthly rate
    const r = interestRate / 100 / 12
    const n = loanTerm * 12

    // Mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    // Where P = homePrice - downPayment (loan amount)
    // Total monthly = M + (homePrice * 0.015 / 12)

    // Let's solve iteratively
    let homePrice = 0
    for (let price = 50000; price <= 2000000; price += 5000) {
      const loanAmount = price - downPayment
      if (loanAmount <= 0) continue

      const monthlyPI = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      const monthlyTaxInsurance = price * 0.015 / 12
      const totalMonthly = monthlyPI + monthlyTaxInsurance

      if (totalMonthly <= maxMonthlyPayment) {
        homePrice = price
      } else {
        break
      }
    }

    // Calculate actual monthly payment for the max home price
    const loanAmount = homePrice - downPayment
    const monthlyPI = loanAmount > 0
      ? loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : 0
    const monthlyTaxInsurance = homePrice * 0.015 / 12
    const totalMonthlyPayment = monthlyPI + monthlyTaxInsurance

    // DTI calculation
    const housingDTI = (totalMonthlyPayment / monthlyIncome) * 100
    const totalDTI = ((totalMonthlyPayment + monthlyDebts) / monthlyIncome) * 100

    // Comfort levels
    const conservativePrice = homePrice * 0.8
    const aggressivePrice = homePrice * 1.1

    // Down payment percentage
    const downPaymentPercent = (downPayment / homePrice) * 100

    return {
      maxHomePrice: homePrice,
      conservativePrice,
      aggressivePrice,
      loanAmount,
      monthlyPayment: totalMonthlyPayment,
      monthlyPI,
      monthlyTaxInsurance,
      housingDTI,
      totalDTI,
      downPaymentPercent,
      needsPMI: downPaymentPercent < 20
    }
  }, [annualIncome, monthlyDebts, downPayment, interestRate, loanTerm])

  useEffect(() => {
    onResultChange?.({
      annualIncome,
      monthlyDebts,
      downPayment,
      interestRate,
      loanTerm,
      maxHomePrice: results.maxHomePrice,
      monthlyPayment: results.monthlyPayment,
      loanAmount: results.loanAmount
    })
  }, [results, annualIncome, monthlyDebts, downPayment, interestRate, loanTerm, onResultChange])

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
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">You Can Afford</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.maxHomePrice} format={formatCurrency} />
          </p>
          <div className="mt-6">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">Monthly Payment</p>
            <p className="text-lg font-light text-white/70">
              {formatCurrency(results.monthlyPayment)}/mo · {results.housingDTI.toFixed(0)}% of income
            </p>
          </div>
        </div>

        {/* Price range */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] text-white/30">
            <span>Conservative</span>
            <span>Stretch</span>
          </div>
          <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-emerald-500/30 rounded-l-full" style={{ width: '40%' }} />
            <div className="absolute inset-y-0 left-[40%] bg-white/20" style={{ width: '40%' }} />
            <div className="absolute inset-y-0 right-0 bg-amber-500/30 rounded-r-full" style={{ width: '20%' }} />
          </div>
          <div className="flex justify-between text-[11px] text-white/40">
            <span>{formatCurrency(results.conservativePrice)}</span>
            <span>{formatCurrency(results.maxHomePrice)}</span>
            <span>{formatCurrency(results.aggressivePrice)}</span>
          </div>
        </div>

        {/* PMI Warning */}
        {results.needsPMI && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-amber-200/70">
              {results.downPaymentPercent.toFixed(0)}% down requires PMI. Put 20% down ({formatCurrency(results.maxHomePrice * 0.2)}) to avoid it.
            </p>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="Annual income"
            value={annualIncome}
            onChange={setAnnualIncome}
            min={30000}
            max={500000}
            step={5000}
            format={formatCurrencyFull}
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Down payment"
              value={downPayment}
              onChange={setDownPayment}
              min={0}
              max={500000}
              step={5000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Monthly debts"
              value={monthlyDebts}
              onChange={setMonthlyDebts}
              min={0}
              max={5000}
              step={100}
              format={formatCurrencyFull}
            />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Interest rate"
              value={interestRate}
              onChange={setInterestRate}
              min={3}
              max={10}
              step={0.125}
              suffix="%"
            />
            <InputField
              label="Loan term"
              value={loanTerm}
              onChange={setLoanTerm}
              min={15}
              max={30}
              step={5}
              suffix=" years"
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Loan Amount</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(results.loanAmount)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Total DTI</p>
            <p className="text-xl font-light text-white/80">{results.totalDTI.toFixed(0)}%</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <Home className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-white/50 leading-relaxed">
              Based on 28% housing DTI and 43% total DTI limits. Includes estimated property tax and insurance (~1.5% of home value annually).
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">You Can Afford</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.maxHomePrice} format={formatCurrency} />
        </p>
      </div>
    </div>
  )
}
