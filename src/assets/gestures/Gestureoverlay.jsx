import { useState, useRef, useEffect, useCallback } from 'react'
import { useGestureControls } from './useGestureControls'
import './GestureOverlay.css'

/**
 * GestureOverlay
 *
 * Drop this anywhere above your canvas / game root. It:
 *   1. Boots the webcam + MediaPipe via useGestureControls
 *   2. Shows a small mirrored camera preview with hand-dot overlay
 *   3. Displays gesture feedback (arrow flash + label)
 *   4. Shows a collapsible gesture guide for kiosk visitors
 *
 * Props mirror exactly what Player needs — wire them from the same
 * parent that controls Player so nothing is coupled.
 *
 * @param {object}   props
 * @param {boolean}  props.isPlaying
 * @param {function} props.setLaneIndex   - same setter passed to Player
 * @param {function} props.triggerJump    - same function exposed by Player
 */
export default function GestureOverlay({ isPlaying, setLaneIndex, triggerJump }) {
  const canvasRef   = useRef(null)
  const [status, setStatus]     = useState('loading') // 'loading' | 'ready' | 'error'
  const [gesture, setGesture]   = useState(null)      // 'LEFT' | 'RIGHT' | 'UP' | null
  const [guideOpen, setGuideOpen] = useState(true)
  const gestureTimeoutRef = useRef(null)

  // ── callbacks passed to the hook ───────────────────────────────────────────
  const moveLeft  = useCallback(() => setLaneIndex(p => Math.max(p - 1, 0)),  [setLaneIndex])
  const moveRight = useCallback(() => setLaneIndex(p => Math.min(p + 1, 2)),  [setLaneIndex])
  const jumpCb    = useCallback(() => triggerJump?.(), [triggerJump])

  const onReady = useCallback(() => setStatus('ready'), [])

  const onHandData = useCallback(({ landmarks, gesture: detectedGesture }) => {
    // Draw hand dots on the preview canvas
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (landmarks) {
      // MediaPipe x is already mirrored; canvas is also CSS-mirrored → double flip = correct
      landmarks.forEach((pt) => {
        const x = pt.x * canvas.width
        const y = pt.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#00ffcc'
        ctx.fill()
      })

      // Draw connections for key landmarks (wrist → fingertips)
      const CONNECTIONS = [
        [0,1],[1,2],[2,3],[3,4],
        [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],
        [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],
        [5,9],[9,13],[13,17],
      ]
      ctx.strokeStyle = 'rgba(0,255,200,0.4)'
      ctx.lineWidth = 1.5
      CONNECTIONS.forEach(([a, b]) => {
        const lA = landmarks[a], lB = landmarks[b]
        ctx.beginPath()
        ctx.moveTo(lA.x * canvas.width, lA.y * canvas.height)
        ctx.lineTo(lB.x * canvas.width, lB.y * canvas.height)
        ctx.stroke()
      })
    }

    // Flash gesture feedback
    if (detectedGesture) {
      setGesture(detectedGesture)
      clearTimeout(gestureTimeoutRef.current)
      gestureTimeoutRef.current = setTimeout(() => setGesture(null), 600)
    }
  }, [])

  useGestureControls({
    isPlaying,
    moveLeft,
    moveRight,
    jump: jumpCb,
    onReady,
    onHandData,
  })

  // Auto-close guide after 8 s so it doesn't clutter gameplay
  useEffect(() => {
    const t = setTimeout(() => setGuideOpen(false), 8000)
    return () => clearTimeout(t)
  }, [])

  // ── render ──────────────────────────────────────────────────────────────────
  const GESTURE_META = {
    LEFT:  { icon: '←', label: 'Move Left',  color: '#4fc3f7' },
    RIGHT: { icon: '→', label: 'Move Right', color: '#4fc3f7' },
    UP:    { icon: '↑', label: 'Jump!',       color: '#ffeb3b' },
  }

  return (
    <div className="gesture-overlay">

      {/* ── Camera preview panel ───────────────────────────────── */}
      <div className={`gesture-camera-panel ${status}`}>
        <div className="gesture-camera-inner">
          {/* Hidden video is managed by the hook; we only need the canvas */}
          <canvas
            ref={canvasRef}
            width={200}
            height={150}
            className="gesture-canvas"
          />

          {/* Status badge */}
          <div className={`gesture-status-badge ${status}`}>
            {status === 'loading' && <><span className="spinner" /> Loading…</>}
            {status === 'ready'   && <><span className="dot green" /> Gesture Active</>}
            {status === 'error'   && <><span className="dot red" /> Camera Error</>}
          </div>

          {/* Gesture flash feedback */}
          {gesture && (
            <div
              className="gesture-flash"
              style={{ color: GESTURE_META[gesture]?.color }}
            >
              <span className="gesture-icon">{GESTURE_META[gesture]?.icon}</span>
              <span className="gesture-label">{GESTURE_META[gesture]?.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Gesture guide ─────────────────────────────────────── */}
      <div className={`gesture-guide ${guideOpen ? 'open' : 'closed'}`}>
        <button
          className="gesture-guide-toggle"
          onClick={() => setGuideOpen(o => !o)}
          aria-label="Toggle gesture guide"
        >
          {guideOpen ? '✕' : '👋 How to play'}
        </button>

        {guideOpen && (
          <div className="gesture-guide-body">
            <h3 className="gesture-guide-title">✋ Hand Controls</h3>
            <p className="gesture-guide-sub">No touch needed — just move your hand!</p>
            <ul className="gesture-guide-list">
              <li><span className="g-arrow left">←</span><span>Swipe <strong>Left</strong> — move left</span></li>
              <li><span className="g-arrow right">→</span><span>Swipe <strong>Right</strong> — move right</span></li>
              <li><span className="g-arrow up">↑</span><span>Swipe <strong>Up</strong> — jump</span></li>
            </ul>
            <p className="gesture-guide-tip">💡 Keep your hand in front of the camera</p>
          </div>
        )}
      </div>

    </div>
  )
}