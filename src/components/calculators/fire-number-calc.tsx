'use client'

import { useState, useMemo, useEffect, useId, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { useCalculator, CalculatorData } from '@/context/calculator-context'

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

        // Easing function (ease-out cubic)
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

interface FireNumberCalcProps {
  compact?: boolean
  prefillValues?: Record<string, number>
  onResultChange?: (results: Record<string, number>) => void
}

// Refined slider component
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
  suffix = '',
  hint
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format?: (value: number) => string
  suffix?: string
  hint?: string
}) {
  const displayValue = format ? format(value) : `${value}${suffix}`

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-[13px] text-white/40">{label}</label>
        <span className="text-[15px] font-medium text-white/90 tabular-nums">{displayValue}</span>
      </div>
      <Slider value={value} onChange={onChange} min={min} max={max} step={step} />
      {hint && (
        <div className="flex justify-between text-[11px] text-white/20">
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
}

// Toggle component
function Toggle({
  label,
  checked,
  onChange,
  description
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-2 text-left"
    >
      <div>
        <p className="text-[13px] text-white/60">{label}</p>
        {description && <p className="text-[11px] text-white/30">{description}</p>}
      </div>
      <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-white/40' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}

// Expandable section
function Section({
  title,
  isOpen,
  onToggle,
  children
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-white/[0.06]">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="text-[13px] text-white/50">{title}</span>
        <ChevronRight className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <div className="pb-5 space-y-5">{children}</div>}
    </div>
  )
}

// Stat display
function Stat({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div>
      <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-light text-white/90 tabular-nums">{value}</p>
      {sublabel && <p className="text-[11px] text-white/30 mt-0.5">{sublabel}</p>}
    </div>
  )
}

export function FireNumberCalc({ compact = false, prefillValues, onResultChange }: FireNumberCalcProps) {
  const { data, updateData, saveResults } = useCalculator()

  // Core inputs - use prefillValues, then context data, then defaults
  const [annualExpenses, setAnnualExpenses] = useState(
    prefillValues?.annualExpenses ?? data.annualExpenses ?? 50000
  )
  const [withdrawalRate, setWithdrawalRate] = useState(
    prefillValues?.withdrawalRate ?? data.withdrawalRate ?? 4
  )
  const [currentSavings, setCurrentSavings] = useState(
    prefillValues?.currentSavings ?? data.currentSavings ?? 100000
  )
  const [monthlySavings, setMonthlySavings] = useState(
    prefillValues?.monthlySavings ?? data.monthlySavings ?? 2000
  )
  const [expectedReturn, setExpectedReturn] = useState(
    prefillValues?.expectedReturn ?? data.expectedReturn ?? 7
  )

  // Age & Timeline
  const [currentAge, setCurrentAge] = useState(prefillValues?.currentAge ?? 30)
  const [targetRetirementAge, setTargetRetirementAge] = useState(
    prefillValues?.targetAge ?? prefillValues?.targetRetirementAge ?? 55
  )

  // Income Sources
  const [showIncomeSources, setShowIncomeSources] = useState(false)
  const [socialSecurityAmount, setSocialSecurityAmount] = useState(2000)
  const [socialSecurityAge, setSocialSecurityAge] = useState(67)
  const [includeSocialSecurity, setIncludeSocialSecurity] = useState(false)
  const [pensionAmount, setPensionAmount] = useState(0)
  const [includePension, setIncludePension] = useState(false)
  const [rentalIncome, setRentalIncome] = useState(0)
  const [includeRental, setIncludeRental] = useState(false)

  // Expense Details
  const [showExpenseDetails, setShowExpenseDetails] = useState(false)
  const [inflationRate, setInflationRate] = useState(3)
  const [retirementLifestylePct, setRetirementLifestylePct] = useState(100)

  // Investment Strategy
  const [showInvestmentStrategy, setShowInvestmentStrategy] = useState(false)
  const [useInflationAdjusted, setUseInflationAdjusted] = useState(true)

  // Results
  const results = useMemo(() => {
    const additionalAnnualIncome =
      (includeSocialSecurity ? socialSecurityAmount * 12 : 0) +
      (includePension ? pensionAmount * 12 : 0) +
      (includeRental ? rentalIncome * 12 : 0)

    const adjustedExpenses = annualExpenses * (retirementLifestylePct / 100)
    const netExpenses = Math.max(0, adjustedExpenses - additionalAnnualIncome)
    const fireNumber = netExpenses / (withdrawalRate / 100)
    const leanFireNumber = (netExpenses * 0.7) / (withdrawalRate / 100)
    const fatFireNumber = (netExpenses * 1.25) / (withdrawalRate / 100)
    const progress = (currentSavings / fireNumber) * 100
    const remaining = fireNumber - currentSavings
    const realReturn = useInflationAdjusted ? expectedReturn - inflationRate : expectedReturn

    let yearsToFire = 0
    let projectionData: { year: number; balance: number }[] = []
    const monthlyReturn = realReturn / 100 / 12
    let balance = currentSavings
    const maxYears = Math.min(50, targetRetirementAge - currentAge + 15)
    let fireReached = false

    for (let year = 0; year <= maxYears; year++) {
      projectionData.push({ year, balance })
      if (!fireReached && balance >= fireNumber) {
        yearsToFire = year
        fireReached = true
      }
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + monthlyReturn) + monthlySavings
      }
    }

    if (!fireReached) yearsToFire = balance >= fireNumber ? maxYears : 0

    const fireAge = yearsToFire > 0 && yearsToFire < 100 ? yearsToFire : null
    const yearsToTarget = targetRetirementAge - currentAge
    const coastFireNumber = fireNumber / Math.pow(1 + realReturn / 100, yearsToTarget)
    const annualSavings = monthlySavings * 12
    const savingsRate = (annualSavings / (annualExpenses * 1.5)) * 100

    return {
      fireNumber,
      leanFireNumber,
      fatFireNumber,
      coastFireNumber,
      progress: Math.min(progress, 100),
      remaining: Math.max(remaining, 0),
      yearsToFire: fireAge,
      fireAge: fireAge ? currentAge + fireAge : null,
      monthlyPassiveIncome: fireNumber * (withdrawalRate / 100) / 12,
      projectionData,
      netExpenses,
      additionalAnnualIncome,
      savingsRate: Math.min(savingsRate, 100),
      realReturn
    }
  }, [
    annualExpenses, withdrawalRate, currentSavings, monthlySavings, expectedReturn,
    currentAge, targetRetirementAge, includeSocialSecurity, socialSecurityAmount,
    includePension, pensionAmount, includeRental, rentalIncome,
    inflationRate, retirementLifestylePct, useInflationAdjusted
  ])

  useEffect(() => {
    const resultData: CalculatorData = {
      annualExpenses, withdrawalRate, currentSavings, monthlySavings, expectedReturn, currentAge,
      fireNumber: results.fireNumber,
      yearsToFire: results.yearsToFire ?? undefined,
      monthlyPassiveIncome: results.monthlyPassiveIncome,
    }
    updateData(resultData)
    saveResults('fire-number', resultData)

    // Emit numeric results for flow orchestration
    const numericResults: Record<string, number> = {
      annualExpenses,
      withdrawalRate,
      currentSavings,
      monthlySavings,
      expectedReturn,
      currentAge,
      fireNumber: results.fireNumber,
      leanFireNumber: results.leanFireNumber,
      fatFireNumber: results.fatFireNumber,
      coastFireNumber: results.coastFireNumber,
      monthlyPassiveIncome: results.monthlyPassiveIncome,
      savingsRate: results.savingsRate,
    }
    if (results.yearsToFire !== null) {
      numericResults.yearsToFire = results.yearsToFire
      numericResults.fireAge = currentAge + results.yearsToFire
    }
    onResultChange?.(numericResults)
  }, [results, annualExpenses, withdrawalRate, currentSavings, monthlySavings, expectedReturn, currentAge, onResultChange])

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

  // Compact layout
  if (compact) {
    return (
      <div className="space-y-8">
        {/* Primary result */}
        <div className="text-center py-8">
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">FIRE Number</p>
          <p className="text-7xl font-extralight tracking-tight tabular-nums">
            <AnimatedNumber value={results.fireNumber} format={formatCurrency} />
          </p>
          <div className="mt-6">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] mb-1">Retire In</p>
            <p className="text-lg font-light text-white/70">
              {results.yearsToFire
                ? `${results.yearsToFire} years · Age ${currentAge + results.yearsToFire}`
                : 'Adjust parameters below'
              }
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <InputField
            label="Annual expenses"
            value={annualExpenses}
            onChange={setAnnualExpenses}
            min={20000}
            max={200000}
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
              step={25000}
              format={formatCurrencyFull}
            />
            <InputField
              label="Monthly savings"
              value={monthlySavings}
              onChange={setMonthlySavings}
              min={0}
              max={10000}
              step={250}
              format={formatCurrencyFull}
            />
          </div>
          <InputField
            label="Current age"
            value={currentAge}
            onChange={setCurrentAge}
            min={18}
            max={65}
            step={1}
            suffix=" years"
          />
        </div>

        {/* Progress */}
        <div className="pt-4">
          <div className="flex justify-between text-[11px] mb-2">
            <span className="text-white/30">Progress to FIRE</span>
            <span className="text-white/50 tabular-nums">{results.progress.toFixed(1)}%</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-white/30 rounded-full transition-all duration-300"
              style={{ width: `${results.progress}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Lean</p>
            <p className="text-[15px] font-light text-white/60 tabular-nums">{formatCurrency(results.leanFireNumber)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Coast</p>
            <p className="text-[15px] font-light text-white/60 tabular-nums">{formatCurrency(results.coastFireNumber)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Fat</p>
            <p className="text-[15px] font-light text-white/60 tabular-nums">{formatCurrency(results.fatFireNumber)}</p>
          </div>
        </div>
      </div>
    )
  }

  // Full layout
  return (
    <div className="grid lg:grid-cols-[1fr,1.1fr] gap-16">
      {/* Inputs */}
      <div>
        <div className="space-y-7">
          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Current age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={65}
              step={1}
              suffix=""
            />
            <InputField
              label="Target retirement"
              value={targetRetirementAge}
              onChange={setTargetRetirementAge}
              min={currentAge + 1}
              max={80}
              step={1}
              suffix=""
            />
          </div>

          <InputField
            label="Annual expenses in retirement"
            value={annualExpenses}
            onChange={setAnnualExpenses}
            min={20000}
            max={200000}
            step={1000}
            format={formatCurrencyFull}
          />

          <InputField
            label="Current invested savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={2000000}
            step={10000}
            format={formatCurrencyFull}
          />

          <InputField
            label="Monthly savings"
            value={monthlySavings}
            onChange={setMonthlySavings}
            min={0}
            max={10000}
            step={100}
            format={formatCurrencyFull}
          />

          <InputField
            label="Safe withdrawal rate"
            value={withdrawalRate}
            onChange={setWithdrawalRate}
            min={2.5}
            max={5}
            step={0.1}
            suffix="%"
            hint="2.5% conservative · 5% aggressive"
          />

          <InputField
            label="Expected annual return"
            value={expectedReturn}
            onChange={setExpectedReturn}
            min={4}
            max={12}
            step={0.5}
            suffix="%"
          />
        </div>

        {/* Advanced sections */}
        <div className="mt-8">
          <Section
            title="Additional income sources"
            isOpen={showIncomeSources}
            onToggle={() => setShowIncomeSources(!showIncomeSources)}
          >
            <Toggle
              label="Social Security"
              checked={includeSocialSecurity}
              onChange={setIncludeSocialSecurity}
            />
            {includeSocialSecurity && (
              <div className="pl-4 border-l border-white/[0.06] space-y-5">
                <InputField
                  label="Monthly benefit"
                  value={socialSecurityAmount}
                  onChange={setSocialSecurityAmount}
                  min={500}
                  max={4000}
                  step={100}
                  format={formatCurrencyFull}
                />
                <InputField
                  label="Start age"
                  value={socialSecurityAge}
                  onChange={setSocialSecurityAge}
                  min={62}
                  max={70}
                  step={1}
                  suffix=""
                />
              </div>
            )}

            <Toggle
              label="Pension"
              checked={includePension}
              onChange={setIncludePension}
            />
            {includePension && (
              <div className="pl-4 border-l border-white/[0.06]">
                <InputField
                  label="Monthly amount"
                  value={pensionAmount}
                  onChange={setPensionAmount}
                  min={0}
                  max={5000}
                  step={100}
                  format={formatCurrencyFull}
                />
              </div>
            )}

            <Toggle
              label="Rental income"
              checked={includeRental}
              onChange={setIncludeRental}
            />
            {includeRental && (
              <div className="pl-4 border-l border-white/[0.06]">
                <InputField
                  label="Monthly income"
                  value={rentalIncome}
                  onChange={setRentalIncome}
                  min={0}
                  max={10000}
                  step={250}
                  format={formatCurrencyFull}
                />
              </div>
            )}

            {results.additionalAnnualIncome > 0 && (
              <p className="text-[12px] text-white/40 pt-2">
                {formatCurrencyFull(results.additionalAnnualIncome)}/year reduces your target
              </p>
            )}
          </Section>

          <Section
            title="Expense adjustments"
            isOpen={showExpenseDetails}
            onToggle={() => setShowExpenseDetails(!showExpenseDetails)}
          >
            <InputField
              label="Inflation rate"
              value={inflationRate}
              onChange={setInflationRate}
              min={1}
              max={6}
              step={0.5}
              suffix="%"
            />
            <InputField
              label="Retirement lifestyle"
              value={retirementLifestylePct}
              onChange={setRetirementLifestylePct}
              min={50}
              max={150}
              step={5}
              suffix="% of current"
            />
            <p className="text-[12px] text-white/40 pt-2">
              Adjusted expenses: {formatCurrencyFull(results.netExpenses)}/year
            </p>
          </Section>

          <Section
            title="Investment assumptions"
            isOpen={showInvestmentStrategy}
            onToggle={() => setShowInvestmentStrategy(!showInvestmentStrategy)}
          >
            <Toggle
              label="Inflation-adjusted returns"
              checked={useInflationAdjusted}
              onChange={setUseInflationAdjusted}
              description="Shows real purchasing power"
            />
            <p className="text-[12px] text-white/40 pt-2">
              Real return: {results.realReturn.toFixed(1)}%
            </p>
          </Section>
        </div>
      </div>

      {/* Results */}
      <div className="lg:pl-8 lg:border-l border-white/[0.04]">
        {/* Primary number */}
        <div className="mb-14">
          <p className="text-[15px] text-white/40 uppercase tracking-[0.25em] mb-6">FIRE Number</p>
          <p className="text-8xl lg:text-9xl font-extralight tracking-tight tabular-nums leading-none">
            <AnimatedNumber value={results.fireNumber} format={formatCurrency} />
          </p>
          <p className="text-[15px] text-white/40 mt-5 leading-relaxed">
            {results.fireAge ? (
              <>Retire at <span className="text-white/70">{results.fireAge}</span> in <span className="text-white/70">{results.yearsToFire} years</span></>
            ) : (
              <>Amount needed to sustain {formatCurrencyFull(annualExpenses)} annually</>
            )}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[11px] text-white/30 uppercase tracking-widest">Progress</span>
            <span className="text-[24px] font-light text-white/80 tabular-nums">{results.progress.toFixed(1)}%</span>
          </div>
          <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/25 rounded-full transition-all duration-500"
              style={{ width: `${results.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-white/30 mt-3">
            <span>{formatCurrencyFull(currentSavings)}</span>
            <span>{formatCurrencyFull(results.remaining)} remaining</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-3 gap-6 mb-12 py-6 border-y border-white/[0.04]">
          <Stat label="Lean FIRE" value={formatCurrency(results.leanFireNumber)} sublabel="70% expenses" />
          <Stat label="Coast FIRE" value={formatCurrency(results.coastFireNumber)} sublabel="Stop saving now" />
          <Stat label="Fat FIRE" value={formatCurrency(results.fatFireNumber)} sublabel="125% expenses" />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <Stat label="Years to FIRE" value={results.yearsToFire?.toString() ?? '—'} />
          <Stat label="FIRE Age" value={results.fireAge?.toString() ?? '—'} />
          <Stat label="Monthly Income" value={formatCurrencyFull(results.monthlyPassiveIncome)} />
          <Stat
            label="Savings Rate"
            value={`${results.savingsRate.toFixed(0)}%`}
          />
        </div>

        {/* Chart */}
        <div className="mt-12 pt-8 border-t border-white/[0.04]">
          <p className="text-[11px] text-white/30 uppercase tracking-widest mb-6">Projection</p>
          <div className="relative h-24">
            <div
              className="absolute left-0 right-0 border-t border-dashed border-white/10"
              style={{ bottom: `${(results.fireNumber / Math.max(...results.projectionData.map(d => d.balance), results.fireNumber)) * 100}%` }}
            />
            <div className="flex items-end h-full gap-[1px]">
              {results.projectionData.slice(0, 35).map((point, i) => {
                const maxVal = Math.max(...results.projectionData.map(d => d.balance), results.fireNumber)
                const height = (point.balance / maxVal) * 100
                const isFired = point.balance >= results.fireNumber
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-200 ${isFired ? 'bg-white/30' : 'bg-white/[0.08]'}`}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-white/20 mt-3">
              <span>Now</span>
              <span>+{Math.min(results.projectionData.length, 35)} years</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-10 pt-6 border-t border-white/[0.04]">
          <p className="text-[11px] text-white/25 leading-relaxed">
            <span className="text-white/40">Lean FIRE</span> — Minimal lifestyle at 70% of expenses.
            <span className="text-white/40 ml-2">Coast FIRE</span> — Stop saving, let compound growth work.
            <span className="text-white/40 ml-2">Fat FIRE</span> — Comfortable at 125% of expenses.
          </p>
        </div>
      </div>
    </div>
  )
}
