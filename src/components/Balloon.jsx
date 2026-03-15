import { useState, useEffect } from 'react'

export default function Balloon() {
  const [position, setPosition] = useState({ x: 75, y: 20 })

  useEffect(() => {
    let frame
    let t = Math.random() * 100
    const drift = () => {
      t += 0.008
      setPosition({
        x: 75 + Math.sin(t * 0.7) * 8 + Math.sin(t * 1.3) * 3,
        y: 15 + Math.sin(t * 0.5) * 6 + Math.cos(t * 0.9) * 2,
      })
      frame = requestAnimationFrame(drift)
    }
    frame = requestAnimationFrame(drift)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className="balloon-container"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className="balloon-body" />
      <div className="balloon-knot" />
      <div className="balloon-string" />
    </div>
  )
}
