import { useRef, useEffect, useCallback } from 'react'

const CANVAS_W = 400
const CANVAS_H = 600
const BIRD_SIZE = 24
const GRAVITY = 0.45
const JUMP = -7
const PIPE_W = 52
const PIPE_GAP = 150
const PIPE_SPEED = 2.5
const PIPE_INTERVAL = 1800

export default function FlappyBird({ onClose }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef = useRef(null)

  const resetGame = useCallback(() => {
    return {
      bird: { y: CANVAS_H / 2, vel: 0 },
      pipes: [],
      score: 0,
      lastPipe: Date.now(),
      started: false,
      dead: false,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    stateRef.current = resetGame()

    const jump = () => {
      const s = stateRef.current
      if (s.dead) {
        stateRef.current = resetGame()
        stateRef.current.started = true
        stateRef.current.bird.vel = JUMP
        return
      }
      s.started = true
      s.bird.vel = JUMP
    }

    const handleTap = (e) => {
      e.preventDefault()
      jump()
    }

    canvas.addEventListener('pointerdown', handleTap)

    const loop = () => {
      const s = stateRef.current
      const now = Date.now()

      // Clear
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      // Draw stars
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      for (let i = 0; i < 40; i++) {
        const x = (i * 97 + 13) % CANVAS_W
        const y = (i * 53 + 7) % CANVAS_H
        ctx.fillRect(x, y, 1.5, 1.5)
      }

      if (!s.started && !s.dead) {
        // Title screen
        ctx.fillStyle = '#00e5ff'
        ctx.font = 'bold 36px Space Grotesk, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Flappy Bird', CANVAS_W / 2, CANVAS_H / 3)
        ctx.fillStyle = '#e4e4f0'
        ctx.font = '18px Space Grotesk, sans-serif'
        ctx.fillText('Tap to play', CANVAS_W / 2, CANVAS_H / 3 + 40)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = '14px Space Grotesk, sans-serif'
        ctx.fillText('Tap anywhere to flap', CANVAS_W / 2, CANVAS_H / 3 + 70)
        // Draw bird idle
        ctx.fillStyle = '#eab308'
        ctx.beginPath()
        ctx.arc(CANVAS_W / 2, CANVAS_H / 2, BIRD_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(CANVAS_W / 2 + 5, CANVAS_H / 2 - 4, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#111'
        ctx.beginPath()
        ctx.arc(CANVAS_W / 2 + 6, CANVAS_H / 2 - 4, 2, 0, Math.PI * 2)
        ctx.fill()
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (!s.dead) {
        // Physics
        s.bird.vel += GRAVITY
        s.bird.y += s.bird.vel

        // Spawn pipes
        if (now - s.lastPipe > PIPE_INTERVAL) {
          const gapY = 100 + Math.random() * (CANVAS_H - 250)
          s.pipes.push({ x: CANVAS_W, gapY, scored: false })
          s.lastPipe = now
        }

        // Move pipes
        for (const p of s.pipes) {
          p.x -= PIPE_SPEED
          // Score
          if (!p.scored && p.x + PIPE_W < CANVAS_W / 4) {
            p.scored = true
            s.score++
          }
        }
        s.pipes = s.pipes.filter(p => p.x > -PIPE_W)

        // Collision
        const bx = CANVAS_W / 4
        const by = s.bird.y
        const br = BIRD_SIZE / 2 - 2

        if (by - br < 0 || by + br > CANVAS_H) {
          s.dead = true
        }

        for (const p of s.pipes) {
          if (bx + br > p.x && bx - br < p.x + PIPE_W) {
            if (by - br < p.gapY - PIPE_GAP / 2 || by + br > p.gapY + PIPE_GAP / 2) {
              s.dead = true
            }
          }
        }
      }

      // Draw pipes
      for (const p of s.pipes) {
        const gradient1 = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0)
        gradient1.addColorStop(0, '#22c55e')
        gradient1.addColorStop(0.5, '#16a34a')
        gradient1.addColorStop(1, '#15803d')
        ctx.fillStyle = gradient1
        // Top pipe
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY - PIPE_GAP / 2)
        // Bottom pipe
        ctx.fillRect(p.x, p.gapY + PIPE_GAP / 2, PIPE_W, CANVAS_H - (p.gapY + PIPE_GAP / 2))
        // Pipe caps
        ctx.fillStyle = '#4ade80'
        ctx.fillRect(p.x - 3, p.gapY - PIPE_GAP / 2 - 8, PIPE_W + 6, 8)
        ctx.fillRect(p.x - 3, p.gapY + PIPE_GAP / 2, PIPE_W + 6, 8)
      }

      // Draw bird
      const bx = CANVAS_W / 4
      const by = stateRef.current.bird.y
      ctx.save()
      ctx.translate(bx, by)
      const angle = Math.min(Math.max(stateRef.current.bird.vel * 3, -30), 70) * Math.PI / 180
      ctx.rotate(angle)
      // Body
      ctx.fillStyle = '#eab308'
      ctx.beginPath()
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
      // Eye
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(5, -4, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(6, -4, 2, 0, Math.PI * 2)
      ctx.fill()
      // Beak
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.moveTo(BIRD_SIZE / 2, -3)
      ctx.lineTo(BIRD_SIZE / 2 + 8, 0)
      ctx.lineTo(BIRD_SIZE / 2, 3)
      ctx.fill()
      ctx.restore()

      // Score
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 32px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(s.score, CANVAS_W / 2, 50)
      ctx.shadowBlur = 0

      // Death screen
      if (s.dead) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 36px Space Grotesk, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over', CANVAS_W / 2, CANVAS_H / 3)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 48px Space Grotesk, sans-serif'
        ctx.fillText(s.score, CANVAS_W / 2, CANVAS_H / 3 + 60)
        ctx.fillStyle = '#e4e4f0'
        ctx.font = '18px Space Grotesk, sans-serif'
        ctx.fillText('Tap to retry', CANVAS_W / 2, CANVAS_H / 3 + 100)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('pointerdown', handleTap)
    }
  }, [resetGame])

  return (
    <div className="flappy-overlay">
      <button className="flappy-close" onClick={onClose}>✕</button>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="flappy-canvas"
      />
    </div>
  )
}
