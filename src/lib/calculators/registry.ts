export type CalculatorCategory =
  | 'fire_retirement'
  | 'equity_compensation'
  | 'career_salary'
  | 'real_estate'
  | 'tax_optimization'
  | 'debt'
  | 'investment'
  | 'family_education'
  | 'lifestyle'

export interface Calculator {
  slug: string
  name: string
  shortName: string
  description: string
  category: CalculatorCategory
  icon: string // Lucide icon name
  popular?: boolean
  comingSoon?: boolean
}

export interface CalculatorCategoryInfo {
  id: CalculatorCategory
  name: string
  icon: string
  description: string
}

export const categories: CalculatorCategoryInfo[] = [
  {
    id: 'fire_retirement',
    name: 'FIRE & Retirement',
    icon: 'Flame',
    description: 'Plan your path to financial independence'
  },
  {
    id: 'career_salary',
    name: 'Career & Salary',
    icon: 'Briefcase',
    description: 'Optimize your earning potential'
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    icon: 'Home',
    description: 'Make smart housing decisions'
  },
  {
    id: 'equity_compensation',
    name: 'Equity & Stock',
    icon: 'TrendingUp',
    description: 'Understand your equity compensation'
  },
  {
    id: 'tax_optimization',
    name: 'Tax Planning',
    icon: 'Calculator',
    description: 'Minimize your tax burden legally'
  },
  {
    id: 'debt',
    name: 'Debt & Loans',
    icon: 'CreditCard',
    description: 'Manage and eliminate debt'
  },
  {
    id: 'investment',
    name: 'Investments',
    icon: 'PiggyBank',
    description: 'Grow your wealth over time'
  },
  {
    id: 'family_education',
    name: 'Family & Education',
    icon: 'GraduationCap',
    description: 'Plan for family expenses'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: 'Heart',
    description: 'Balance life and finances'
  }
]

export const calculators: Calculator[] = [
  // === FIRE & RETIREMENT ===
  {
    slug: 'fire-number',
    name: 'FIRE Number Calculator',
    shortName: 'FIRE Number',
    description: 'Calculate how much you need to achieve financial independence',
    category: 'fire_retirement',
    icon: 'Flame',
    popular: true
  },
  {
    slug: 'coast-fire',
    name: 'Coast FIRE Calculator',
    shortName: 'Coast FIRE',
    description: 'Calculate when you can stop actively saving for retirement',
    category: 'fire_retirement',
    icon: 'Sunset'
  },
  {
    slug: 'fire-date',
    name: 'FIRE Date Calculator',
    shortName: 'FIRE Date',
    description: "Calculate when you'll reach financial independence",
    category: 'fire_retirement',
    icon: 'Calendar'
  },
  {
    slug: 'monte-carlo',
    name: 'Retirement Success Simulator',
    shortName: 'Monte Carlo',
    description: 'Stress test your retirement plan against market scenarios',
    category: 'fire_retirement',
    icon: 'Dices'
  },
  {
    slug: 'social-security',
    name: 'Social Security Optimizer',
    shortName: 'Social Security',
    description: 'Optimize when to claim Social Security benefits',
    category: 'fire_retirement',
    icon: 'Shield',
    comingSoon: true
  },

  // === CAREER & SALARY ===
  {
    slug: 'freelance-rate',
    name: 'Freelance Rate Calculator',
    shortName: 'Freelance Rate',
    description: 'Calculate the rate you need to match your salary',
    category: 'career_salary',
    icon: 'UserCircle',
    popular: true
  },
  {
    slug: 'total-compensation',
    name: 'Total Compensation Calculator',
    shortName: 'Total Comp',
    description: 'Calculate the full value of a compensation package',
    category: 'career_salary',
    icon: 'Coins'
  },
  {
    slug: 'job-offer-comparison',
    name: 'Job Offer Comparison',
    shortName: 'Compare Offers',
    description: 'Compare multiple job offers side by side',
    category: 'career_salary',
    icon: 'Scale',
    popular: true
  },
  {
    slug: 'salary-negotiation',
    name: 'Salary Negotiation Helper',
    shortName: 'Negotiate',
    description: 'Prepare for your next salary negotiation',
    category: 'career_salary',
    icon: 'MessageSquare',
    comingSoon: true
  },

  // === REAL ESTATE ===
  {
    slug: 'house-affordability',
    name: 'House Affordability Calculator',
    shortName: 'Affordability',
    description: 'Calculate how much house you can afford',
    category: 'real_estate',
    icon: 'Home',
    popular: true
  },
  {
    slug: 'rent-vs-buy',
    name: 'Rent vs Buy Calculator',
    shortName: 'Rent vs Buy',
    description: 'Compare the true cost of renting versus buying',
    category: 'real_estate',
    icon: 'ArrowLeftRight'
  },
  {
    slug: 'mortgage-comparison',
    name: 'Mortgage Comparison',
    shortName: 'Compare Mortgages',
    description: 'Compare different mortgage options',
    category: 'real_estate',
    icon: 'FileText'
  },
  {
    slug: 'true-cost-homeownership',
    name: 'True Cost of Homeownership',
    shortName: 'True Cost',
    description: 'Calculate all the hidden costs of owning a home',
    category: 'real_estate',
    icon: 'Receipt',
    comingSoon: true
  },

  // === EQUITY COMPENSATION ===
  {
    slug: 'equity-compensation',
    name: 'Equity Compensation Calculator',
    shortName: 'Equity Calc',
    description: 'Calculate the value of stock options and RSUs',
    category: 'equity_compensation',
    icon: 'TrendingUp',
    popular: true
  },
  {
    slug: 'rsu-vs-options',
    name: 'RSU vs Options Comparison',
    shortName: 'RSU vs Options',
    description: 'Compare RSUs and stock options',
    category: 'equity_compensation',
    icon: 'GitCompare'
  },
  {
    slug: 'startup-equity',
    name: 'Startup Equity Calculator',
    shortName: 'Startup Equity',
    description: 'Value your startup equity at different outcomes',
    category: 'equity_compensation',
    icon: 'Rocket'
  },

  // === TAX OPTIMIZATION ===
  {
    slug: 'self-employment-tax',
    name: 'Self-Employment Tax Calculator',
    shortName: 'SE Tax',
    description: 'Calculate self-employment and income taxes',
    category: 'tax_optimization',
    icon: 'Calculator'
  },
  {
    slug: 'tax-bracket',
    name: 'Tax Bracket Calculator',
    shortName: 'Tax Bracket',
    description: 'Understand your marginal and effective tax rates',
    category: 'tax_optimization',
    icon: 'Layers'
  },
  {
    slug: 'roth-conversion',
    name: 'Roth Conversion Calculator',
    shortName: 'Roth Conversion',
    description: 'Analyze if a Roth conversion makes sense',
    category: 'tax_optimization',
    icon: 'RefreshCw',
    comingSoon: true
  },

  // === DEBT ===
  {
    slug: 'debt-payoff',
    name: 'Debt Payoff Calculator',
    shortName: 'Debt Payoff',
    description: 'Create a plan to eliminate your debt',
    category: 'debt',
    icon: 'Target',
    popular: true
  },
  {
    slug: 'student-loan',
    name: 'Student Loan Calculator',
    shortName: 'Student Loans',
    description: 'Optimize your student loan repayment',
    category: 'debt',
    icon: 'GraduationCap'
  },
  {
    slug: 'refinance-calculator',
    name: 'Refinance Calculator',
    shortName: 'Refinance',
    description: 'Should you refinance your loans?',
    category: 'debt',
    icon: 'Percent'
  },

  // === INVESTMENT ===
  {
    slug: 'compound-growth',
    name: 'Compound Growth Calculator',
    shortName: 'Compound Growth',
    description: 'See the power of compound interest over time',
    category: 'investment',
    icon: 'LineChart'
  },
  {
    slug: 'net-worth-tracker',
    name: 'Net Worth Tracker',
    shortName: 'Net Worth',
    description: 'Track and visualize your net worth',
    category: 'investment',
    icon: 'Wallet',
    popular: true
  },
  {
    slug: 'emergency-fund',
    name: 'Emergency Fund Calculator',
    shortName: 'Emergency Fund',
    description: 'Calculate your ideal emergency fund size',
    category: 'investment',
    icon: 'Umbrella'
  },

  // === FAMILY & EDUCATION ===
  {
    slug: 'education-roi',
    name: 'Education ROI Calculator',
    shortName: 'Education ROI',
    description: 'Is that degree worth the investment?',
    category: 'family_education',
    icon: 'GraduationCap'
  },
  {
    slug: 'college-savings',
    name: 'College Savings Planner',
    shortName: 'College Savings',
    description: 'Plan for education expenses',
    category: 'family_education',
    icon: 'BookOpen',
    comingSoon: true
  },

  // === LIFESTYLE ===
  {
    slug: 'coast-lifestyle',
    name: 'Lifestyle Cost Calculator',
    shortName: 'Lifestyle Cost',
    description: 'Calculate the true cost of your lifestyle',
    category: 'lifestyle',
    icon: 'Coffee'
  },
  {
    slug: 'sabbatical-planner',
    name: 'Sabbatical Planner',
    shortName: 'Sabbatical',
    description: 'Plan for a career break or sabbatical',
    category: 'lifestyle',
    icon: 'Plane',
    comingSoon: true
  }
]

// Helper functions
export function getCalculatorsByCategory(category: CalculatorCategory): Calculator[] {
  return calculators.filter(c => c.category === category)
}

export function getPopularCalculators(): Calculator[] {
  return calculators.filter(c => c.popular && !c.comingSoon)
}

export function getActiveCalculators(): Calculator[] {
  return calculators.filter(c => !c.comingSoon)
}

export function getCategoryInfo(category: CalculatorCategory): CalculatorCategoryInfo | undefined {
  return categories.find(c => c.id === category)
}
