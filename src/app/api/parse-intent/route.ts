import { NextRequest, NextResponse } from 'next/server'
import { ParsedIntent, IntentCategory, keywordToIntent, intentFlows } from '@/lib/intent/types'

// Extract numbers from query (ages, amounts, years)
function extractNumbers(query: string): ParsedIntent['extractedValues'] {
  const values: ParsedIntent['extractedValues'] = {}
  const lower = query.toLowerCase()

  // Age patterns: "I'm 35", "age 35", "35 years old"
  const ageMatch = lower.match(/(?:i'm|i am|age|aged)\s*(\d{2})/i) ||
                   lower.match(/(\d{2})\s*years?\s*old/i)
  if (ageMatch) {
    values.currentAge = parseInt(ageMatch[1])
  }

  // Target age: "retire by 50", "by age 60", "at 55"
  const targetMatch = lower.match(/(?:by|at|before)\s*(?:age\s*)?(\d{2})/i) ||
                      lower.match(/retire\s*(?:at|by)\s*(\d{2})/i)
  if (targetMatch) {
    values.targetAge = parseInt(targetMatch[1])
  }

  // Money amounts: "$100k", "$1.5m", "100000"
  const moneyMatch = lower.match(/\$?([\d,.]+)\s*(k|m|million|thousand)?/gi)
  if (moneyMatch) {
    for (const match of moneyMatch) {
      const numMatch = match.match(/\$?([\d,.]+)\s*(k|m|million|thousand)?/i)
      if (numMatch) {
        let amount = parseFloat(numMatch[1].replace(/,/g, ''))
        const suffix = numMatch[2]?.toLowerCase()
        if (suffix === 'k' || suffix === 'thousand') amount *= 1000
        if (suffix === 'm' || suffix === 'million') amount *= 1000000

        // Guess what the amount refers to based on context
        if (lower.includes('save') || lower.includes('saving')) {
          if (amount < 20000) values.monthlySavings = amount
          else values.currentSavings = amount
        } else if (lower.includes('expense') || lower.includes('spend')) {
          values.annualExpenses = amount
        } else if (lower.includes('income') || lower.includes('salary') || lower.includes('earn')) {
          values.annualIncome = amount
        } else if (amount >= 100000) {
          values.currentSavings = amount
        }
      }
    }
  }

  // Timeline: "in 10 years", "5 year plan"
  const timelineMatch = lower.match(/(?:in|within|next)\s*(\d+)\s*years?/i) ||
                        lower.match(/(\d+)\s*years?\s*(?:plan|goal|timeline)/i)
  if (timelineMatch) {
    values.timeline = parseInt(timelineMatch[1])
  }

  return values
}

// Generate intro message based on category and extracted values
function generateIntroMessage(category: IntentCategory, values: ParsedIntent['extractedValues']): string {
  const flow = intentFlows[category]

  const intros: Record<IntentCategory, string> = {
    retirement: values.targetAge
      ? `Let's map out your path to retirement${values.targetAge ? ` by ${values.targetAge}` : ''}. We'll start by calculating your target number.`
      : "Let's figure out what retirement looks like for you. We'll calculate your FIRE number first.",
    fire: values.currentAge
      ? `Great goal! At ${values.currentAge}, you have time on your side. Let's calculate your path to financial independence.`
      : "Financial independence is within reach. Let's calculate your FIRE number and build your roadmap.",
    home_buying: "Buying a home is a big step. Let's figure out what you can afford and create a plan to get there.",
    career_change: "Thinking about a career change takes courage. Let's make sure you're financially prepared for the transition.",
    debt_freedom: "Becoming debt-free is one of the most liberating financial goals. Let's create your payoff strategy.",
    education: "Education is an investment in yourself. Let's calculate the true cost and ROI.",
    investment: "Growing your wealth through investing is smart. Let's see how compound growth works in your favor.",
    emergency_fund: "A solid emergency fund is your financial safety net. Let's figure out the right amount for your situation.",
    general_financial: "Let's take a look at your overall financial picture and identify opportunities."
  }

  return intros[category] || flow.description
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Keyword matching for intent detection
    const lowerQuery = query.toLowerCase()
    let category: IntentCategory = 'general_financial'
    let confidence = 0.5

    for (const [keyword, cat] of Object.entries(keywordToIntent)) {
      if (lowerQuery.includes(keyword)) {
        category = cat
        confidence = 0.8
        break
      }
    }

    // Extract numbers from the query
    const extractedValues = extractNumbers(query)

    // Boost confidence if we extracted relevant values
    if (Object.keys(extractedValues).length > 0) {
      confidence = Math.min(confidence + 0.1, 0.95)
    }

    // Get the flow for this category
    const flow = intentFlows[category]

    const result: ParsedIntent = {
      category,
      confidence,
      extractedValues,
      context: {
        urgency: lowerQuery.includes('urgent') || lowerQuery.includes('asap') || lowerQuery.includes('soon')
          ? 'urgent'
          : lowerQuery.includes('plan') || lowerQuery.includes('goal')
            ? 'planning'
            : 'exploring',
        sentiment: lowerQuery.includes('worried') || lowerQuery.includes('anxious') || lowerQuery.includes('stressed')
          ? 'anxious'
          : lowerQuery.includes('excited') || lowerQuery.includes('ready')
            ? 'optimistic'
            : 'curious',
        specificGoal: undefined
      },
      suggestedFlow: flow.steps.map(s => s.calculatorSlug),
      introMessage: generateIntroMessage(category, extractedValues)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Intent parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse intent' },
      { status: 500 }
    )
  }
}
