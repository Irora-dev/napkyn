'use client'

import { useState, useMemo } from 'react'
import { Calendar, Mail, Check, Download, ChevronLeft, ChevronRight } from 'lucide-react'

interface ResultsCalendarProps {
  compact?: boolean
  prefillValues?: Record<string, number>
  onResultChange?: (results: Record<string, number>) => void
}

export function ResultsCalendar({ compact = false, prefillValues }: ResultsCalendarProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  // Calculate key dates from prefillValues
  const milestones = useMemo(() => {
    const currentAge = prefillValues?.currentAge ?? 30
    const currentYear = new Date().getFullYear()
    const birthYear = currentYear - currentAge

    const dates: { label: string; year: number; age: number; type: 'coast' | 'fire' | 'now' }[] = [
      { label: 'Today', year: currentYear, age: currentAge, type: 'now' }
    ]

    if (prefillValues?.coastFireAge && prefillValues.coastFireAge > currentAge) {
      dates.push({
        label: 'Coast FIRE',
        year: birthYear + prefillValues.coastFireAge,
        age: prefillValues.coastFireAge,
        type: 'coast'
      })
    }

    const fireAge = prefillValues?.fireAge ?? prefillValues?.targetRetirementAge ?? prefillValues?.targetAge
    if (fireAge && fireAge > currentAge) {
      dates.push({
        label: 'Financial Independence',
        year: birthYear + fireAge,
        age: fireAge,
        type: 'fire'
      })
    }

    return dates.sort((a, b) => a.year - b.year)
  }, [prefillValues])

  const fireDate = milestones.find(m => m.type === 'fire')
  const coastDate = milestones.find(m => m.type === 'coast')

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; isMilestone: boolean }[] = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, isToday: false, isMilestone: false })
    }

    // Current month
    const today = new Date()
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
      days.push({ day: d, isCurrentMonth: true, isToday, isMilestone: false })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, isCurrentMonth: false, isToday: false, isMilestone: false })
    }

    return days
  }, [selectedMonth])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)

    // Simulate API call - replace with actual email service
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] mb-4">Your Timeline</p>
        <h2 className="text-3xl font-extralight text-white/90">
          {fireDate
            ? `Financial Independence by ${fireDate.year}`
            : 'Your Journey Ahead'
          }
        </h2>
      </div>

      {/* Timeline */}
      <div className="relative py-8">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
        <div className="relative flex justify-between items-center">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`
                  w-4 h-4 rounded-full border-2 mb-3
                  ${milestone.type === 'now'
                    ? 'bg-white border-white'
                    : milestone.type === 'coast'
                      ? 'bg-blue-500/20 border-blue-400'
                      : 'bg-emerald-500/20 border-emerald-400'
                  }
                `}
              />
              <p className={`text-sm font-medium ${
                milestone.type === 'fire' ? 'text-emerald-400' :
                milestone.type === 'coast' ? 'text-blue-400' : 'text-white/70'
              }`}>
                {milestone.label}
              </p>
              <p className="text-[13px] text-white/40">{milestone.year}</p>
              <p className="text-[11px] text-white/30">Age {milestone.age}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white/50" />
          </button>
          <p className="text-sm font-medium text-white/70">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </p>
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-[10px] text-white/30 py-1">{day}</div>
          ))}
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`
                text-[11px] py-1 rounded
                ${day.isCurrentMonth ? 'text-white/50' : 'text-white/20'}
                ${day.isToday ? 'bg-white/20 text-white font-medium' : ''}
              `}
            >
              {day.day}
            </div>
          ))}
        </div>

        {fireDate && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-white/50">
              <span className="text-emerald-400">{fireDate.year - new Date().getFullYear()} years</span> until financial independence
            </p>
          </div>
        )}
      </div>

      {/* Key Numbers Summary */}
      <div className="grid grid-cols-2 gap-4">
        {prefillValues?.fireNumber && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">FIRE Number</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(prefillValues.fireNumber)}</p>
          </div>
        )}
        {prefillValues?.coastFireNumber && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Coast FIRE</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(prefillValues.coastFireNumber)}</p>
          </div>
        )}
        {prefillValues?.currentSavings && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Current Savings</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(prefillValues.currentSavings)}</p>
          </div>
        )}
        {prefillValues?.monthlySavings && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Monthly Savings</p>
            <p className="text-xl font-light text-white/80">{formatCurrency(prefillValues.monthlySavings)}/mo</p>
          </div>
        )}
      </div>

      {/* Email Capture */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-lg font-light text-white/80 mb-2">Check your inbox!</p>
            <p className="text-sm text-white/40">We've sent your personalized plan to {email}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-sm font-medium text-white/70">Get your results</p>
                <p className="text-[13px] text-white/40">We'll email you a personalized summary</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-white/[0.05] border border-white/[0.1]
                  text-white placeholder-white/30
                  text-sm
                  focus:outline-none focus:border-white/20
                  transition-colors
                "
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full py-3 rounded-xl
                  bg-white/10 hover:bg-white/15
                  border border-white/10
                  text-white text-sm font-medium
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Send My Plan
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-white/20 text-center mt-3">
              No spam, just your financial roadmap
            </p>
          </>
        )}
      </div>
    </div>
  )
}
