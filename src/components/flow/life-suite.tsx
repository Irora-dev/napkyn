'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Flame,
  Briefcase,
  Home,
  TrendingUp,
  Calculator,
  CreditCard,
  PiggyBank,
  GraduationCap,
  Heart,
  Sunset,
  Calendar,
  Dices,
  Shield,
  UserCircle,
  Coins,
  Scale,
  MessageSquare,
  ArrowLeftRight,
  FileText,
  Receipt,
  GitCompare,
  Rocket,
  Layers,
  RefreshCw,
  Target,
  Percent,
  LineChart,
  Wallet,
  Umbrella,
  BookOpen,
  Coffee,
  Plane,
  Sparkles,
  Lock,
  type LucideIcon
} from 'lucide-react'
import {
  calculators,
  categories,
  getPopularCalculators,
  type Calculator as CalculatorType,
  type CalculatorCategory,
  type CalculatorCategoryInfo
} from '@/lib/calculators/registry'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Flame,
  Briefcase,
  Home,
  TrendingUp,
  Calculator,
  CreditCard,
  PiggyBank,
  GraduationCap,
  Heart,
  Sunset,
  Calendar,
  Dices,
  Shield,
  UserCircle,
  Coins,
  Scale,
  MessageSquare,
  ArrowLeftRight,
  FileText,
  Receipt,
  GitCompare,
  Rocket,
  Layers,
  RefreshCw,
  Target,
  Percent,
  LineChart,
  Wallet,
  Umbrella,
  BookOpen,
  Coffee,
  Plane
}

function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Calculator
}

interface LifeSuiteProps {
  onSelectCalculator?: (slug: string) => void
}

export function LifeSuite({ onSelectCalculator }: LifeSuiteProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<CalculatorCategory | 'popular'>('popular')

  const handleCalculatorClick = (slug: string) => {
    if (onSelectCalculator) {
      // When callback is provided, display inline (don't navigate)
      onSelectCalculator(slug)
    } else {
      // When no callback, navigate to dedicated page
      router.push(`/calculators/${slug}`)
    }
  }

  const displayedCalculators = selectedCategory === 'popular'
    ? getPopularCalculators()
    : calculators.filter(c => c.category === selectedCategory)

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        <CategoryTab
          active={selectedCategory === 'popular'}
          onClick={() => setSelectedCategory('popular')}
          icon={Sparkles}
          label="Popular"
        />
        {categories.map((category) => (
          <CategoryTab
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
            icon={getIcon(category.icon)}
            label={category.name}
          />
        ))}
      </div>

      {/* Category Description */}
      <div className="text-center">
        <p className="text-white/50 text-sm">
          {selectedCategory === 'popular'
            ? 'Most used calculators to get you started'
            : categories.find(c => c.id === selectedCategory)?.description}
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCalculators.map((calculator) => (
          <CalculatorCard
            key={calculator.slug}
            calculator={calculator}
            onClick={() => handleCalculatorClick(calculator.slug)}
          />
        ))}
      </div>

      {/* View All Link */}
      {selectedCategory === 'popular' && (
        <div className="text-center pt-4">
          <button
            onClick={() => setSelectedCategory('fire_retirement')}
            className="text-white/50 hover:text-white/70 text-sm transition-colors"
          >
            View all {calculators.filter(c => !c.comingSoon).length} calculators →
          </button>
        </div>
      )}
    </div>
  )
}

interface CategoryTabProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
}

function CategoryTab({ active, onClick, icon: Icon, label }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-300
        ${active
          ? 'bg-white/15 text-white border border-white/30'
          : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10 hover:text-white/80'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

interface CalculatorCardProps {
  calculator: CalculatorType
  onClick: () => void
}

function CalculatorCard({ calculator, onClick }: CalculatorCardProps) {
  const Icon = getIcon(calculator.icon)
  const isDisabled = calculator.comingSoon

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`
        relative p-6 rounded-2xl text-left
        transition-all duration-300
        group
        ${isDisabled
          ? 'bg-white/[0.02] border border-white/5 cursor-not-allowed'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-[1.02]'
        }
      `}
    >
      {/* Popular badge */}
      {calculator.popular && !isDisabled && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Popular
          </span>
        </div>
      )}

      {/* Coming Soon badge */}
      {isDisabled && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/5 text-white/40 border border-white/10">
            <Lock className="w-3 h-3" />
            Coming Soon
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-4
        transition-all duration-300
        ${isDisabled
          ? 'bg-white/5'
          : 'bg-white/10 group-hover:bg-white/15'
        }
      `}>
        <Icon className={`
          w-6 h-6 transition-colors duration-300
          ${isDisabled
            ? 'text-white/30'
            : 'text-white/70 group-hover:text-white'
          }
        `} />
      </div>

      {/* Content */}
      <h3 className={`
        font-medium mb-1 pr-16 transition-colors duration-300
        ${isDisabled
          ? 'text-white/40'
          : 'text-white group-hover:text-white/90'
        }
      `}>
        {calculator.shortName}
      </h3>
      <p className={`
        text-sm line-clamp-2 transition-colors duration-300
        ${isDisabled
          ? 'text-white/25'
          : 'text-white/40 group-hover:text-white/50'
        }
      `}>
        {calculator.description}
      </p>

      {/* Hover arrow */}
      {!isDisabled && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white/40">→</span>
        </div>
      )}
    </button>
  )
}
