// Intent categories that map to calculator flows
export type IntentCategory =
  | 'retirement'
  | 'fire'
  | 'home_buying'
  | 'career_change'
  | 'debt_freedom'
  | 'education'
  | 'investment'
  | 'emergency_fund'
  | 'general_financial'

// Parsed intent from user query
export interface ParsedIntent {
  category: IntentCategory
  confidence: number // 0-1

  // Extracted values from the query
  extractedValues: {
    currentAge?: number
    targetAge?: number
    currentSavings?: number
    monthlySavings?: number
    annualExpenses?: number
    annualIncome?: number
    targetAmount?: number
    timeline?: number // years
  }

  // Context for personalization
  context: {
    urgency: 'exploring' | 'planning' | 'urgent'
    sentiment: 'anxious' | 'curious' | 'optimistic' | 'neutral'
    specificGoal?: string // e.g., "retire by 50", "buy first home"
  }

  // Suggested calculator sequence
  suggestedFlow: string[] // calculator slugs

  // Personalized intro message
  introMessage: string
}

// Flow step with guidance
export interface FlowStep {
  calculatorSlug: string
  title: string
  description: string
  whyThisMatters: string
  // Which values to pre-fill from extracted or previous calculator results
  prefillFrom: ('extracted' | 'previous')[]
}

// Complete flow definition
export interface IntentFlow {
  category: IntentCategory
  name: string
  description: string
  steps: FlowStep[]
}

// Pre-defined flows for each intent category
export const intentFlows: Record<IntentCategory, IntentFlow> = {
  retirement: {
    category: 'retirement',
    name: 'Retirement Planning',
    description: 'Figure out when and how you can retire comfortably',
    steps: [
      {
        calculatorSlug: 'fire-number',
        title: 'Your FIRE Number',
        description: 'Calculate how much you need to retire',
        whyThisMatters: 'This is your target - the amount that will fund your retirement lifestyle.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'coast-fire',
        title: 'Coast FIRE Check',
        description: 'See if you can stop saving and still retire on time',
        whyThisMatters: 'You might be closer than you think. Coast FIRE means your money will grow to your goal without additional savings.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'fire-date',
        title: 'Your FIRE Date',
        description: 'Calculate exactly when you can retire',
        whyThisMatters: 'Put a date on the calendar. This makes it real and trackable.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  fire: {
    category: 'fire',
    name: 'Financial Independence',
    description: 'Achieve financial independence and retire early',
    steps: [
      {
        calculatorSlug: 'fire-number',
        title: 'Your FIRE Number',
        description: 'The magic number for financial independence',
        whyThisMatters: 'This is your freedom number - when you hit it, work becomes optional.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'savings-rate',
        title: 'Savings Rate Impact',
        description: 'See how your savings rate affects your timeline',
        whyThisMatters: 'Your savings rate is the single biggest factor in how fast you reach FIRE.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'coast-fire',
        title: 'Coast FIRE Milestone',
        description: 'When can you downshift and coast?',
        whyThisMatters: 'Coast FIRE is a powerful milestone - it means you could work less stressful jobs and still retire on time.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  home_buying: {
    category: 'home_buying',
    name: 'Home Buying',
    description: 'Figure out what you can afford and how to get there',
    steps: [
      {
        calculatorSlug: 'home-affordability',
        title: 'What Can You Afford?',
        description: 'Calculate your home buying budget',
        whyThisMatters: 'Know your range before you start looking to avoid disappointment.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'down-payment',
        title: 'Down Payment Plan',
        description: 'How long to save for your down payment',
        whyThisMatters: 'A solid down payment means better rates and lower monthly payments.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'mortgage-payment',
        title: 'Monthly Payment',
        description: 'What will your mortgage cost monthly',
        whyThisMatters: 'Make sure the monthly payment fits comfortably in your budget.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  career_change: {
    category: 'career_change',
    name: 'Career Transition',
    description: 'Plan a career change with financial confidence',
    steps: [
      {
        calculatorSlug: 'runway-calculator',
        title: 'Your Runway',
        description: 'How long can you go without income',
        whyThisMatters: 'Knowing your runway gives you the confidence to make a move.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'career-switch',
        title: 'Career Switch Analysis',
        description: 'Compare your current path vs. a new career',
        whyThisMatters: 'Sometimes a short-term pay cut leads to long-term gains.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'coast-fire',
        title: 'Financial Flexibility',
        description: 'See if you have FIRE flexibility for the change',
        whyThisMatters: 'You might have more freedom than you realize to take risks.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  debt_freedom: {
    category: 'debt_freedom',
    name: 'Debt Freedom',
    description: 'Create a plan to become debt-free',
    steps: [
      {
        calculatorSlug: 'debt-payoff',
        title: 'Debt Payoff Plan',
        description: 'See when you can be debt-free',
        whyThisMatters: 'A clear payoff date keeps you motivated.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'debt-avalanche',
        title: 'Optimal Strategy',
        description: 'Avalanche vs. snowball approach',
        whyThisMatters: 'The right strategy can save you thousands in interest.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'fire-number',
        title: 'Life After Debt',
        description: 'See your FIRE potential after debt',
        whyThisMatters: 'Visualize where you can be once the debt is gone.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  education: {
    category: 'education',
    name: 'Education Planning',
    description: 'Plan for education costs',
    steps: [
      {
        calculatorSlug: 'education-cost',
        title: 'True Cost',
        description: 'Calculate the full cost of education',
        whyThisMatters: 'Know the real number including living expenses and opportunity cost.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'student-loan',
        title: 'Loan Impact',
        description: 'Understand your loan repayment',
        whyThisMatters: 'See how loans will affect your finances for years to come.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'roi-education',
        title: 'Education ROI',
        description: 'Is the investment worth it?',
        whyThisMatters: 'Make sure the degree pays off financially.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  investment: {
    category: 'investment',
    name: 'Investment Growth',
    description: 'Understand and plan your investment growth',
    steps: [
      {
        calculatorSlug: 'compound-growth',
        title: 'Compound Growth',
        description: 'See the power of compound interest',
        whyThisMatters: 'Time in the market beats timing the market.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'investment-goal',
        title: 'Goal Planning',
        description: 'How much to invest to hit your target',
        whyThisMatters: 'Turn your goal into a concrete monthly action.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'fire-number',
        title: 'FIRE Potential',
        description: 'What this means for financial independence',
        whyThisMatters: 'Connect your investments to the bigger picture.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  emergency_fund: {
    category: 'emergency_fund',
    name: 'Emergency Fund',
    description: 'Build your financial safety net',
    steps: [
      {
        calculatorSlug: 'emergency-fund',
        title: 'How Much You Need',
        description: 'Calculate your emergency fund target',
        whyThisMatters: 'The right amount depends on your situation and risk tolerance.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'savings-timeline',
        title: 'Savings Plan',
        description: 'How long to build your fund',
        whyThisMatters: 'A timeline makes the goal achievable.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'fire-number',
        title: 'Beyond Emergency',
        description: 'Next steps after your fund is built',
        whyThisMatters: 'Once you have security, you can focus on growth.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  },

  general_financial: {
    category: 'general_financial',
    name: 'Financial Health Check',
    description: 'Get a complete picture of your financial situation',
    steps: [
      {
        calculatorSlug: 'fire-number',
        title: 'FIRE Number',
        description: 'Your financial independence target',
        whyThisMatters: 'Everyone should know their FIRE number, even if early retirement isn\'t the goal.',
        prefillFrom: ['extracted']
      },
      {
        calculatorSlug: 'savings-rate',
        title: 'Savings Rate',
        description: 'How much of your income you\'re keeping',
        whyThisMatters: 'This single metric predicts your financial future better than income.',
        prefillFrom: ['extracted', 'previous']
      },
      {
        calculatorSlug: 'net-worth',
        title: 'Net Worth',
        description: 'Your complete financial picture',
        whyThisMatters: 'Track this number over time to see real progress.',
        prefillFrom: ['extracted', 'previous']
      }
    ]
  }
}

// Helper to get flow by category
export function getFlowForIntent(category: IntentCategory): IntentFlow {
  return intentFlows[category]
}

// Map common keywords to intent categories
export const keywordToIntent: Record<string, IntentCategory> = {
  // Retirement
  'retire': 'retirement',
  'retirement': 'retirement',
  'stop working': 'retirement',
  'quit my job': 'retirement',
  'leave workforce': 'retirement',

  // FIRE
  'fire': 'fire',
  'financial independence': 'fire',
  'financially independent': 'fire',
  'early retirement': 'fire',
  'retire early': 'fire',

  // Home
  'house': 'home_buying',
  'home': 'home_buying',
  'buy a house': 'home_buying',
  'mortgage': 'home_buying',
  'down payment': 'home_buying',
  'first home': 'home_buying',

  // Career
  'career': 'career_change',
  'job change': 'career_change',
  'switch careers': 'career_change',
  'new job': 'career_change',
  'career change': 'career_change',
  'quit job': 'career_change',

  // Debt
  'debt': 'debt_freedom',
  'pay off': 'debt_freedom',
  'debt free': 'debt_freedom',
  'loans': 'debt_freedom',
  'credit card': 'debt_freedom',

  // Education
  'college': 'education',
  'university': 'education',
  'education': 'education',
  'degree': 'education',
  'student loan': 'education',
  'masters': 'education',
  'mba': 'education',

  // Investment
  'invest': 'investment',
  'investing': 'investment',
  'grow money': 'investment',
  'compound': 'investment',
  'portfolio': 'investment',

  // Emergency fund
  'emergency': 'emergency_fund',
  'emergency fund': 'emergency_fund',
  'safety net': 'emergency_fund',
  'rainy day': 'emergency_fund'
}
