'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { SearchBar } from "@/components/search/search-bar"
import { VideoBackground } from "@/components/ui/video-background"
import { LightbulbToggle } from "@/components/ui/lightbulb-toggle"
import { TextReveal } from "@/components/ui/text-reveal"
import { FlowSection } from "@/components/flow/flow-section"

export default function Home() {
  const [isLightOn, setIsLightOn] = useState(false)
  const [flowMode, setFlowMode] = useState<'intent' | 'suite' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const flowSectionRef = useRef<HTMLDivElement>(null)

  const scrollToFlow = () => {
    flowSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFlowMode('intent')
    setTimeout(scrollToFlow, 100)
  }

  const handleLifeSuite = () => {
    setFlowMode('suite')
    setTimeout(scrollToFlow, 100)
  }

  return (
    <>
      <main className="relative min-h-screen w-full overflow-hidden">
        {/* Lightbulb Toggle */}
        <LightbulbToggle isOn={isLightOn} onToggle={() => setIsLightOn(!isLightOn)} />

        {/* Background Video (light off - default) */}
        <div
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
            isLightOn ? 'opacity-0 brightness-50' : 'opacity-100 brightness-100'
          }`}
        >
          <VideoBackground src="/BG Video Home.mp4" playbackRate={0.5} />
        </div>

        {/* Background Image Dark (light on - night mode) */}
        <div
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
            isLightOn ? 'opacity-100 brightness-100' : 'opacity-0 brightness-50'
          }`}
        >
          <Image
            src="/herobg-dark.png"
            alt="Background"
            fill
            priority
            className="object-cover object-center"
            quality={90}
          />
        </div>

        {/* Gradient Overlay - fades to black at bottom */}
        <div className="absolute inset-0 z-10 hero-gradient" />

        {/* Bottom explore button */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 opacity-0 animate-fade-in"
          style={{ animationDelay: '2.8s', animationFillMode: 'forwards' }}
        >
          <button
            onClick={handleLifeSuite}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-white/70 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-300"
          >
            or explore the life suite
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Positioned slightly above middle */}
          <div className="flex flex-col items-center -mt-[5vh]">
            {/* Headline */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-4 tracking-tight font-[family-name:var(--font-display)] relative">
                {/* Glow layer behind text */}
                {isLightOn && (
                  <span
                    className="absolute inset-0 text-orange-400 blur-lg animate-glow-pulse"
                    aria-hidden="true"
                  >
                    Napkyn
                  </span>
                )}
                {/* Main text */}
                <span
                  className={`relative transition-all duration-1000 ${
                    isLightOn ? 'text-yellow-200' : 'text-white'
                  }`}
                >
                  <TextReveal
                    text="Napkyn"
                    delayPerLetter={120}
                    initialDelay={400}
                  />
                </span>
              </h1>
              <p
                className="text-lg md:text-xl text-white/90 max-w-xl mx-auto font-medium tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] opacity-0 animate-fade-in"
                style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}
              >
                For Solving Life's Big Problems
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full mt-8 opacity-0 animate-fade-in" style={{ animationDelay: '2.1s', animationDuration: '1.2s', animationFillMode: 'forwards' }}>
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </main>

      {/* Flow Section */}
      <FlowSection
        ref={flowSectionRef}
        mode={flowMode}
        searchQuery={searchQuery}
        isLightOn={isLightOn}
      />
    </>
  )
}
