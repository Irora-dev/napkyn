'use client'

import { Lightbulb } from 'lucide-react'

interface LightbulbToggleProps {
  isOn: boolean
  onToggle: () => void
}

export function LightbulbToggle({ isOn, onToggle }: LightbulbToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed top-6 right-6 z-50 p-3 rounded-full
        transition-all duration-300 ease-out
        ${isOn
          ? 'bg-amber-500/20 shadow-[0_0_30px_rgba(251,191,36,0.5),0_0_60px_rgba(251,191,36,0.3)]'
          : 'bg-white/5 hover:bg-white/10'
        }
      `}
      aria-label={isOn ? 'Turn light off' : 'Turn light on'}
    >
      <Lightbulb
        className={`
          w-6 h-6 transition-all duration-300
          ${isOn
            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
            : 'text-white/40'
          }
        `}
      />
    </button>
  )
}
