'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

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

interface NetWorthCalcProps {
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

export function NetWorthCalc({ compact = false, prefillValues, onResultChange }: NetWorthCalcProps) {
  // Assets
  const [cashSavings, setCashSavings] = useState(prefillValues?.cashSavings ?? 15000)
  const [investments, setInvestments] = useState(prefillValues?.investments ?? prefillValues?.currentSavings ?? 50000)
  const [retirement, setRetirement] = useState(prefillValues?.retirement ?? 75000)
  const [homeValue, setHomeValue] = useState(prefillValues?.homeValue ?? 0)
  const [otherAssets, setOtherAssets] = useState(prefillValues?.otherAssets ?? 10000)

  // Liabilities
  const [mortgage, setMortgage] = useState(prefillValues?.mortgage ?? 0)
  const [studentLoans, setStudentLoans] = useState(prefillValues?.studentLoans ?? 0)
  const [carLoan, setCarLoan] = useState(prefillValues?.carLoan ?? 0)
  const [creditCards, setCreditCards] = useState(prefillValues?.creditCards ?? 0)
  const [otherDebts, setOtherDebts] = useState(prefillValues?.otherDebts ?? 0)

  const results = useMemo(() => {
    const totalAssets = cashSavings + investments + retirement + homeValue + otherAssets
    const totalLiabilities = mortgage + studentLoans + carLoan + creditCards + otherDebts
    const netWorth = totalAssets - totalLiabilities

    const liquidAssets = cashSavings + investments
    const illiquidAssets = retirement + homeValue + otherAssets

    // Asset allocation
    const assetBreakdown = [
      { label: 'Cash', value: cashSavings, color: 'bg-emerald-500/50' },
      { label: 'Investments', value: investments, color: 'bg-blue-500/50' },
      { label: 'Retirement', value: retirement, color: 'bg-purple-500/50' },
      { label: 'Home', value: homeValue, color: 'bg-amber-500/50' },
      { label: 'Other', value: otherAssets, color: 'bg-white/30' },
    ].filter(a => a.value > 0)

    const debtBreakdown = [
      { label: 'Mortgage', value: mortgage, color: 'bg-red-500/30' },
      { label: 'Student Loans', value: studentLoans, color: 'bg-orange-500/30' },
      { label: 'Car Loan', value: carLoan, color: 'bg-amber-500/30' },
      { label: 'Credit Cards', value: creditCards, color: 'bg-red-600/30' },
      { label: 'Other', value: otherDebts, color: 'bg-white/20' },
    ].filter(d => d.value > 0)

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidAssets,
      illiquidAssets,
      assetBreakdown,
      debtBreakdown,
      debtToAssetRatio: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0
    }
  }, [cashSavings, investments, retirement, homeValue, otherAssets, mortgage, studentLoans, carLoan, creditCards, otherDebts])

  useEffect(() => {
    onResultChange?.({
      cashSavings,
      investments,
      retirement,
      homeValue,
      otherAssets,
      mortgage,
      studentLoans,
      carLoan,
      creditCards,
      otherDebts,
      totalAssets: results.totalAssets,
      totalLiabilities: results.totalLiabilities,
      netWorth: results.netWorth
    })
  }, [results, cashSavings, investments, retirement, homeValue, otherAssets, mortgage, studentLoans, carLoan, creditCards, otherDebts, onResultChange])

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (absValue >= 1000000) return `${sign}$${(absValue / 1000000).toFixed(2)}M`
    if (absValue >= 1000) return `${sign}$${(absValue / 1000).toFixed(0)}K`
    return `${sign}$${absValue.toFixed(0)}`
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
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Net Worth</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.netWorth} format={formatCurrency} />
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            {results.netWorth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <p className={`text-sm ${results.netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {results.netWorth >= 0 ? 'Positive net worth' : 'Negative net worth'}
            </p>
          </div>
        </div>

        {/* Assets vs Liabilities bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-[11px] text-white/40">
            <span>Assets: {formatCurrency(results.totalAssets)}</span>
            <span>Debts: {formatCurrency(results.totalLiabilities)}</span>
          </div>
          <div className="h-3 bg-white/[0.08] rounded-full overflow-hidden flex">
            {results.totalAssets > 0 && (
              <div
                className="h-full bg-emerald-500/40"
                style={{
                  width: `${(results.totalAssets / (results.totalAssets + results.totalLiabilities)) * 100}%`
                }}
              />
            )}
            {results.totalLiabilities > 0 && (
              <div
                className="h-full bg-red-500/40"
                style={{
                  width: `${(results.totalLiabilities / (results.totalAssets + results.totalLiabilities)) * 100}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Assets */}
        <div className="space-y-4">
          <p className="text-[11px] text-white/30 uppercase tracking-wider">Assets</p>
          <div className="space-y-4">
            <InputField
              label="Cash & Savings"
              value={cashSavings}
              onChange={setCashSavings}
              min={0}
              max={200000}
              step={1000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Investments (Brokerage)"
              value={investments}
              onChange={setInvestments}
              min={0}
              max={2000000}
              step={5000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Retirement Accounts"
              value={retirement}
              onChange={setRetirement}
              min={0}
              max={2000000}
              step={5000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Home Value"
              value={homeValue}
              onChange={setHomeValue}
              min={0}
              max={2000000}
              step={10000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Other Assets"
              value={otherAssets}
              onChange={setOtherAssets}
              min={0}
              max={500000}
              step={5000}
              format={formatCurrencyFull}
            />
          </div>
        </div>

        {/* Liabilities */}
        <div className="space-y-4">
          <p className="text-[11px] text-white/30 uppercase tracking-wider">Liabilities</p>
          <div className="space-y-4">
            <InputField
              label="Mortgage"
              value={mortgage}
              onChange={setMortgage}
              min={0}
              max={1500000}
              step={10000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Student Loans"
              value={studentLoans}
              onChange={setStudentLoans}
              min={0}
              max={300000}
              step={5000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Car Loan"
              value={carLoan}
              onChange={setCarLoan}
              min={0}
              max={100000}
              step={1000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Credit Cards"
              value={creditCards}
              onChange={setCreditCards}
              min={0}
              max={100000}
              step={500}
              format={formatCurrencyFull}
            />
            <InputField
              label="Other Debts"
              value={otherDebts}
              onChange={setOtherDebts}
              min={0}
              max={100000}
              step={1000}
              format={formatCurrencyFull}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Liquid Assets</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(results.liquidAssets)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Debt Ratio</p>
            <p className="text-xl font-light text-white/80">{results.debtToAssetRatio.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Net Worth</p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.netWorth} format={formatCurrency} />
        </p>
      </div>
    </div>
  )
}
