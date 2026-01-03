'use client'

import { useEffect, useState } from 'react'

interface TextRevealProps {
  text: string
  className?: string
  style?: React.CSSProperties
  delayPerLetter?: number
  initialDelay?: number
}

export function TextReveal({
  text,
  className = '',
  style = {},
  delayPerLetter = 150,
  initialDelay = 300
}: TextRevealProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= text.length) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, delayPerLetter)

      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(initialTimer)
  }, [text, delayPerLetter, initialDelay])

  return (
    <span className={className} style={style}>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: index < visibleCount ? 1 : 0,
            transform: index < visibleCount ? 'translateY(0)' : 'translateY(20px)',
            filter: index < visibleCount ? 'blur(0px)' : 'blur(8px)',
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}
