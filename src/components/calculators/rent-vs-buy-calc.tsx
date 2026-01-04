'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { Home, Building } from 'lucide-react'

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

interface RentVsBuyCalcProps {
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

export function RentVsBuyCalc({ compact = false, prefillValues, onResultChange }: RentVsBuyCalcProps) {
  // Buying inputs
  const [homePrice, setHomePrice] = useState(prefillValues?.homePrice ?? prefillValues?.maxHomePrice ?? 400000)
  const [downPayment, setDownPayment] = useState(prefillValues?.downPayment ?? 80000)
  const [interestRate, setInterestRate] = useState(prefillValues?.interestRate ?? 6.5)
  const [propertyTax, setPropertyTax] = useState(prefillValues?.propertyTax ?? 1.2)
  const [maintenance, setMaintenance] = useState(prefillValues?.maintenance ?? 1)
  const [homeAppreciation, setHomeAppreciation] = useState(prefillValues?.homeAppreciation ?? 3)

  // Renting inputs
  const [monthlyRent, setMonthlyRent] = useState(prefillValues?.monthlyRent ?? 2000)
  const [rentIncrease, setRentIncrease] = useState(prefillValues?.rentIncrease ?? 3)

  // Shared
  const [yearsToCompare, setYearsToCompare] = useState(prefillValues?.yearsToCompare ?? 7)
  const [investmentReturn, setInvestmentReturn] = useState(prefillValues?.investmentReturn ?? 7)

  const results = useMemo(() => {
    const loanAmount = homePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numPayments = 30 * 12

    // Monthly mortgage P&I
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

    // Monthly costs of owning
    const monthlyPropertyTax = (homePrice * (propertyTax / 100)) / 12
    const monthlyMaintenance = (homePrice * (maintenance / 100)) / 12
    const monthlyInsurance = homePrice * 0.004 / 12 // ~0.4% annual
    const totalMonthlyOwning = monthlyMortgage + monthlyPropertyTax + monthlyMaintenance + monthlyInsurance

    // Calculate total costs over the period
    let totalRentCost = 0
    let currentRent = monthlyRent
    for (let year = 0; year < yearsToCompare; year++) {
      totalRentCost += currentRent * 12
      currentRent *= (1 + rentIncrease / 100)
    }

    // Total buying costs
    let totalBuyingCost = downPayment // Opportunity cost
    let mortgageBalance = loanAmount

    for (let year = 0; year < yearsToCompare; year++) {
      // Yearly mortgage payments
      for (let month = 0; month < 12; month++) {
        const interestPayment = mortgageBalance * monthlyRate
        const principalPayment = monthlyMortgage - interestPayment
        mortgageBalance -= principalPayment
        totalBuyingCost += interestPayment // Only interest is "lost"
      }
      // Property tax, maintenance, insurance
      totalBuyingCost += (monthlyPropertyTax + monthlyMaintenance + monthlyInsurance) * 12
    }

    // Home value after appreciation
    const futureHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, yearsToCompare)
    const equity = futureHomeValue - mortgageBalance

    // If renting, down payment would have been invested
    const investedDownPayment = downPayment * Math.pow(1 + investmentReturn / 100, yearsToCompare)

    // Also, monthly savings from renting could be invested
    let investedSavings = 0
    let monthlyDiff = totalMonthlyOwning - monthlyRent
    currentRent = monthlyRent
    for (let year = 0; year < yearsToCompare; year++) {
      const currentMonthlyOwning = totalMonthlyOwning // Simplified, doesn't change much
      const monthlySavings = Math.max(0, currentMonthlyOwning - currentRent)
      for (let month = 0; month < 12; month++) {
        investedSavings = investedSavings * (1 + investmentReturn / 100 / 12) + monthlySavings
      }
      currentRent *= (1 + rentIncrease / 100)
    }

    // Net wealth comparison
    const buyingWealth = equity
    const rentingWealth = investedDownPayment + investedSavings

    const difference = buyingWealth - rentingWealth
    const winner = difference > 0 ? 'buy' : 'rent'
    const breakEvenYears = difference > 0 ? yearsToCompare : null // Simplified

    return {
      monthlyMortgage,
      totalMonthlyOwning,
      monthlyRent,
      totalRentCost,
      totalBuyingCost,
      futureHomeValue,
      equity,
      investedDownPayment,
      investedSavings,
      buyingWealth,
      rentingWealth,
      difference: Math.abs(difference),
      winner,
      breakEvenYears
    }
  }, [homePrice, downPayment, interestRate, propertyTax, maintenance, homeAppreciation,
    monthlyRent, rentIncrease, yearsToCompare, investmentReturn])

  useEffect(() => {
    onResultChange?.({
      homePrice,
      downPayment,
      interestRate,
      monthlyRent,
      yearsToCompare,
      buyingWealth: results.buyingWealth,
      rentingWealth: results.rentingWealth,
      difference: results.difference
    })
  }, [results, homePrice, downPayment, interestRate, monthlyRent, yearsToCompare, onResultChange])

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
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">
            After {yearsToCompare} Years
          </p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.difference} format={formatCurrency} />
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {results.winner === 'buy' ? (
              <>
                <Home className="w-5 h-5 text-emerald-400" />
                <p className="text-lg text-emerald-400 font-medium">Buying wins</p>
              </>
            ) : (
              <>
                <Building className="w-5 h-5 text-blue-400" />
                <p className="text-lg text-blue-400 font-medium">Renting wins</p>
              </>
            )}
          </div>
        </div>

        {/* Comparison bars */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <p className="text-[11px] text-white/40">Buy</p>
            </div>
            <div className="flex-1 h-8 bg-white/[0.08] rounded-lg overflow-hidden relative">
              <div
                className="h-full bg-emerald-500/30 flex items-center justify-end pr-3"
                style={{
                  width: `${Math.min((results.buyingWealth / Math.max(results.buyingWealth, results.rentingWealth)) * 100, 100)}%`
                }}
              >
                <span className="text-[13px] text-white/70">{formatCurrency(results.buyingWealth)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <p className="text-[11px] text-white/40">Rent</p>
            </div>
            <div className="flex-1 h-8 bg-white/[0.08] rounded-lg overflow-hidden relative">
              <div
                className="h-full bg-blue-500/30 flex items-center justify-end pr-3"
                style={{
                  width: `${Math.min((results.rentingWealth / Math.max(results.buyingWealth, results.rentingWealth)) * 100, 100)}%`
                }}
              >
                <span className="text-[13px] text-white/70">{formatCurrency(results.rentingWealth)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <p className="text-[11px] text-white/30 uppercase tracking-wider">Buying Scenario</p>
          <InputField
            label="Home price"
            value={homePrice}
            onChange={setHomePrice}
            min={100000}
            max={1500000}
            step={25000}
            format={formatCurrencyFull}
          />
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Down payment"
              value={downPayment}
              onChange={setDownPayment}
              min={0}
              max={homePrice * 0.5}
              step={10000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Interest rate"
              value={interestRate}
              onChange={setInterestRate}
              min={3}
              max={10}
              step={0.125}
              suffix="%"
            />
          </div>

          <p className="text-[11px] text-white/30 uppercase tracking-wider pt-4">Renting Scenario</p>
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Monthly rent"
              value={monthlyRent}
              onChange={setMonthlyRent}
              min={500}
              max={5000}
              step={100}
              format={formatCurrencyFull}
            />
            <InputField
              label="Rent increase/yr"
              value={rentIncrease}
              onChange={setRentIncrease}
              min={0}
              max={10}
              step={0.5}
              suffix="%"
            />
          </div>

          <p className="text-[11px] text-white/30 uppercase tracking-wider pt-4">Assumptions</p>
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Time horizon"
              value={yearsToCompare}
              onChange={setYearsToCompare}
              min={1}
              max={30}
              step={1}
              suffix=" years"
            />
            <InputField
              label="Home appreciation"
              value={homeAppreciation}
              onChange={setHomeAppreciation}
              min={0}
              max={8}
              step={0.5}
              suffix="%"
            />
          </div>
        </div>

        {/* Monthly comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Monthly (Buying)</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(results.totalMonthlyOwning)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Monthly (Rent)</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(monthlyRent)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">
          {results.winner === 'buy' ? 'Buying' : 'Renting'} Wins By
        </p>
        <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums">
          <AnimatedNumber value={results.difference} format={formatCurrency} />
        </p>
      </div>
    </div>
  )
}
