import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import Clock from './components/Clock'
import Countdown from './components/Countdown'
import Motivator from './components/Motivator'
import Weather from './components/Weather'
import Calendar from './components/Calendar'

const FlappyBird = lazy(() => import('./components/FlappyBird'))

export default function App() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const [showGame, setShowGame] = useState(false)
  const lastTapRef = useRef(0)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  // Double-tap top-right corner easter egg
  const handleDashboardTap = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // Top-left corner: within 80px of top and left edges
    if (x < 80 && y < 80) {
      const now = Date.now()
      if (now - lastTapRef.current < 400) {
        setShowGame(true)
        lastTapRef.current = 0
      } else {
        lastTapRef.current = now
      }
    }
  }, [])

  if (showGame) {
    return (
      <Suspense fallback={<div className="dashboard" />}>
        <FlappyBird onClose={() => setShowGame(false)} />
      </Suspense>
    )
  }

  return (
    <div className="dashboard" onClick={handleDashboardTap}>
      <button className="fullscreen-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
        {isFullscreen ? '⊡' : '⊞'}
      </button>
      <Clock />
      <Countdown />
      <Motivator />
      <div className="bottom-row">
        <Calendar />
        <Weather />
      </div>
    </div>
  )
}
