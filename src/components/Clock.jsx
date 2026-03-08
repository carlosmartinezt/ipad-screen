import { useState, useCallback } from 'react'
import { useTime } from '../hooks/useTime'

export default function Clock() {
  const now = useTime()
  const [brightness, setBrightness] = useState(
    () => parseFloat(localStorage.getItem('clockBrightness') ?? '0.6')
  )
  const [showSlider, setShowSlider] = useState(false)

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  })

  const handleChange = useCallback((e) => {
    const val = parseFloat(e.target.value)
    setBrightness(val)
    localStorage.setItem('clockBrightness', val)
  }, [])

  return (
    <div className="clock-wrapper">
      <div
        className="clock"
        style={{ '--glow': brightness }}
        onClick={() => setShowSlider(s => !s)}
      >
        {time}
      </div>
      <div className={`brightness-slider${showSlider ? ' visible' : ''}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={brightness}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
