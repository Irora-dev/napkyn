'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoBackgroundProps {
  src: string
  playbackRate?: number
}

export function VideoBackground({ src, playbackRate = 0.5 }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      video.playbackRate = playbackRate
      video.play().catch(() => {})
    }

    const handleTimeUpdate = () => {
      if (!video || direction !== 'forward') return

      // Check if we're near the end
      if (video.currentTime >= video.duration - 0.1) {
        video.pause()
        setDirection('backward')
        lastTimeRef.current = performance.now()
        startReverse()
      }
    }

    const startReverse = () => {
      const reverseStep = (timestamp: number) => {
        if (!video) return

        const delta = (timestamp - lastTimeRef.current) / 1000
        lastTimeRef.current = timestamp

        // Move backward at the playback rate
        const newTime = video.currentTime - (delta * playbackRate)

        if (newTime <= 0.1) {
          // Reached the beginning, play forward again
          video.currentTime = 0
          setDirection('forward')
          video.playbackRate = playbackRate
          video.play().catch(() => {})
          return
        }

        video.currentTime = newTime
        rafRef.current = requestAnimationFrame(reverseStep)
      }

      rafRef.current = requestAnimationFrame(reverseStep)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    // If already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [playbackRate, direction])

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      className="w-full h-full object-cover object-center"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
