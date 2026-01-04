'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Target, TrendingDown } from 'lucide-react'

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

interface DebtPayoffCalcProps {
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

export function DebtPayoffCalc({ compact = false, prefillValues, onResultChange }: DebtPayoffCalcProps) {
  const [totalDebt, setTotalDebt] = useState(prefillValues?.totalDebt ?? 25000)
  const [interestRate, setInterestRate] = useState(prefillValues?.interestRate ?? 18)
  const [monthlyPayment, setMonthlyPayment] = useState(prefillValues?.monthlyPayment ?? 500)
  const [extraPayment, setExtraPayment] = useState(prefillValues?.extraPayment ?? 0)

  const results = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12
    const payment = monthlyPayment + extraPayment

    // Minimum payment to cover interest
    const minPayment = totalDebt * monthlyRate

    if (payment <= minPayment) {
      return {
        monthsToPayoff: null,
        totalInterest: null,
        totalPaid: null,
        payoffDate: null,
        interestSaved: 0,
        monthsSaved: 0,
        isPayable: false,
        minPaymentNeeded: Math.ceil(minPayment) + 1
      }
    }

    // Calculate payoff time: n = -log(1 - (r * P / M)) / log(1 + r)
    const monthsToPayoff = Math.ceil(
      -Math.log(1 - (monthlyRate * totalDebt / payment)) / Math.log(1 + monthlyRate)
    )

    const totalPaid = monthsToPayoff * payment
    const totalInterest = totalPaid - totalDebt

    // Compare with minimum payment scenario
    const minMonthlyPayment = monthlyPayment
    const monthsWithMinPayment = Math.ceil(
      -Math.log(1 - (monthlyRate * totalDebt / minMonthlyPayment)) / Math.log(1 + monthlyRate)
    )
    const totalPaidMin = monthsWithMinPayment * minMonthlyPayment
    const totalInterestMin = totalPaidMin - totalDebt

    const payoffDate = new Date()
    payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff)

    return {
      monthsToPayoff,
      totalInterest,
      totalPaid,
      payoffDate,
      interestSaved: extraPayment > 0 ? totalInterestMin - totalInterest : 0,
      monthsSaved: extraPayment > 0 ? monthsWithMinPayment - monthsToPayoff : 0,
      isPayable: true,
      minPaymentNeeded: 0
    }
  }, [totalDebt, interestRate, monthlyPayment, extraPayment])

  useEffect(() => {
    onResultChange?.({
      totalDebt,
      interestRate,
      monthlyPayment,
      extraPayment,
      monthsToPayoff: results.monthsToPayoff ?? 0,
      totalInterest: results.totalInterest ?? 0,
      totalPaid: results.totalPaid ?? 0
    })
  }, [results, totalDebt, interestRate, monthlyPayment, extraPayment, onResultChange])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (compact) {
    return (
      <div className="space-y-8">
        {/* Primary result */}
        <div className="text-center py-8">
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Debt Free In</p>
          {results.isPayable && results.monthsToPayoff ? (
            <>
              <p className="text-7xl font-extralight tracking-tight tabular-nums">
                <AnimatedNumber
                  value={results.monthsToPayoff}
                  format={(n) => {
                    const years = Math.floor(n / 12)
                    const months = Math.round(n % 12)
                    if (years === 0) return `${months}mo`
                    if (months === 0) return `${years}yr`
                    return `${years}y ${months}m`
                  }}
                />
              </p>
              <div className="mt-6">
                <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">Payoff Date</p>
                <p className="text-lg font-light text-white/70">
                  {formatDate(results.payoffDate!)} · {formatCurrency(results.totalInterest!)} in interest
                </p>
              </div>
            </>
          ) : (
            <div className="text-white/60">
              <p className="text-2xl font-light mb-2">Payment too low</p>
              <p className="text-sm">Need at least {formatCurrencyFull(results.minPaymentNeeded)}/month</p>
            </div>
          )}
        </div>

        {/* Savings from extra payment */}
        {extraPayment > 0 && results.interestSaved > 0 && (
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-300">
              Extra {formatCurrency(extraPayment)}/mo saves {formatCurrency(results.interestSaved)} and {results.monthsSaved} months
            </p>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="Total debt"
            value={totalDebt}
            onChange={setTotalDebt}
            min={1000}
            max={100000}
            step={1000}
            format={formatCurrencyFull}
          />
          <InputField
            label="Interest rate (APR)"
            value={interestRate}
            onChange={setInterestRate}
            min={0}
            max={30}
            step={0.5}
            suffix="%"
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Monthly payment"
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              min={50}
              max={5000}
              step={50}
              format={formatCurrencyFull}
            />
            <InputField
              label="Extra payment"
              value={extraPayment}
              onChange={setExtraPayment}
              min={0}
              max={2000}
              step={50}
              format={formatCurrencyFull}
            />
          </div>
        </div>

        {/* Summary */}
        {results.isPayable && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Total Interest</p>
              <p className="text-xl font-light text-white/80">{formatCurrency(results.totalInterest!)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-xl font-light text-white/80">{formatCurrency(results.totalPaid!)}</p>
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <Target className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-white/50 leading-relaxed">
              {interestRate >= 15
                ? "High interest debt should be priority #1. Every extra dollar paid saves money."
                : interestRate >= 7
                  ? "Consider paying extra when possible to reduce total interest paid."
                  : "Low interest debt can be paid steadily while investing the difference."
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
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Debt Free In</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          {results.monthsToPayoff ? (
            <AnimatedNumber
              value={results.monthsToPayoff}
              format={(n) => `${Math.round(n)}mo`}
            />
          ) : (
            <span className="text-white/40">—</span>
          )}
        </p>
      </div>
    </div>
  )
}
