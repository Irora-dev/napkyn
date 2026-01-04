'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Shared data that flows between calculators
export interface CalculatorData {
  // Profile data
  annualExpenses?: number
  currentSavings?: number
  monthlySavings?: number
  expectedReturn?: number
  withdrawalRate?: number

  // Computed results
  fireNumber?: number
  yearsToFire?: number
  coastFireAge?: number
  monthlyPassiveIncome?: number

  // Allow any additional data
  [key: string]: number | string | boolean | undefined
}

interface CalculatorContextType {
  // Shared data between calculators
  data: CalculatorData
  updateData: (updates: Partial<CalculatorData>) => void

  // Currently active calculator in inline mode
  activeCalculator: string | null
  setActiveCalculator: (slug: string | null) => void

  // Calculator results history (for flow summaries)
  results: Record<string, CalculatorData>
  saveResults: (calculatorSlug: string, results: CalculatorData) => void

  // Reset everything
  reset: () => void
}

const CalculatorContext = createContext<CalculatorContextType | null>(null)

const defaultData: CalculatorData = {
  annualExpenses: 50000,
  currentSavings: 100000,
  monthlySavings: 2000,
  expectedReturn: 7,
  withdrawalRate: 4,
}

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CalculatorData>(defaultData)
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, CalculatorData>>({})

  const updateData = useCallback((updates: Partial<CalculatorData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const saveResults = useCallback((calculatorSlug: string, calculatorResults: CalculatorData) => {
    setResults(prev => ({
      ...prev,
      [calculatorSlug]: calculatorResults
    }))
    // Also merge results into shared data for downstream calculators
    setData(prev => ({ ...prev, ...calculatorResults }))
  }, [])

  const reset = useCallback(() => {
    setData(defaultData)
    setActiveCalculator(null)
    setResults({})
  }, [])

  return (
    <CalculatorContext.Provider
      value={{
        data,
        updateData,
        activeCalculator,
        setActiveCalculator,
        results,
        saveResults,
        reset,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalculator() {
  const context = useContext(CalculatorContext)
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider')
  }
  return context
}
