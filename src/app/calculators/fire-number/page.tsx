'use client'

import Link from 'next/link'
import { ArrowLeft, Flame } from 'lucide-react'
import { FireNumberCalc } from '@/components/calculators'

export default function FireNumberCalculator() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="font-semibold">FIRE Number Calculator</h1>
              <p className="text-sm text-white/50">Calculate your financial independence target</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <FireNumberCalc compact={false} />
        </div>
      </div>
    </main>
  )
}
