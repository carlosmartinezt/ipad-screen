import { useState, useCallback, useEffect } from 'react'
import Clock from './components/Clock'
import Countdown from './components/Countdown'
import Motivator from './components/Motivator'
import Weather from './components/Weather'
import Calendar from './components/Calendar'

export default function App() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

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

  return (
    <div className="dashboard">
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
