import { useEffect, useRef, useCallback } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

/**
 * useGestureControls
 *
 * Completely decoupled from Player. Detects hand swipe gestures via webcam
 * and calls the same callbacks that keyboard/touch controls use.
 *
 * Gesture mapping:
 *   Swipe RIGHT  → moveRight()
 *   Swipe LEFT   → moveLeft()
 *   Swipe UP     → jump()
 *
 * @param {object} params
 * @param {boolean}  params.isPlaying   - only fire gestures when game is running
 * @param {function} params.moveLeft    - callback: move player left one lane
 * @param {function} params.moveRight   - callback: move player right one lane
 * @param {function} params.jump        - callback: make player jump
 * @param {function} params.onReady     - called when camera+model are initialised
 * @param {function} params.onHandData  - called every frame with { landmarks, gesture }
 *                                        (useful for the GestureOverlay UI)
 */
export function useGestureControls({
  isPlaying,
  moveLeft,
  moveRight,
  jump,
  onReady,
  onHandData,
}) {
  const videoRef = useRef(null)
  const landmarkerRef = useRef(null)
  const rafIdRef = useRef(null)
  const isPlayingRef = useRef(isPlaying)

  // Swipe tracking state (stored in a ref so the rAF loop always sees fresh values)
  const swipeState = useRef({
    prevX: null,
    prevY: null,
    lastGestureTime: 0,
    COOLDOWN_MS: 500,        // minimum ms between gestures
    SWIPE_THRESHOLD: 0.08,   // normalised units (0-1) hand must travel
  })

  // Keep isPlayingRef in sync without re-mounting everything
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // ─── Gesture classifier ──────────────────────────────────────────────────────
  const classifyGesture = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null

    // Landmark 0 = wrist, landmark 9 = middle-finger MCP (palm centre)
    // Using palm centre gives more stable readings than the wrist tip
    const wrist = landmarks[0]
    const palm  = landmarks[9]

    const cx = (wrist.x + palm.x) / 2
    const cy = (wrist.y + palm.y) / 2

    const state = swipeState.current
    const now   = performance.now()

    // First frame — just record position
    if (state.prevX === null) {
      state.prevX = cx
      state.prevY = cy
      return null
    }

    // Note: MediaPipe x is mirrored (0=right edge of camera, 1=left edge)
    // We intentionally KEEP the mirror so the gesture matches the player's POV:
    // player moves hand right → character moves right
    const dx = state.prevX - cx  // mirrored: positive = hand moved right in camera = user moved right
    const dy = state.prevY - cy  // positive = hand moved down

    // Smooth the position (exponential moving average)
    state.prevX = state.prevX * 0.7 + cx * 0.3
    state.prevY = state.prevY * 0.7 + cy * 0.3

    // Cooldown guard
    if (now - state.lastGestureTime < state.COOLDOWN_MS) return null

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx < state.SWIPE_THRESHOLD && absDy < state.SWIPE_THRESHOLD) return null

    let gesture = null

    if (absDx > absDy) {
      // Horizontal dominant
      gesture = dx > 0 ? 'RIGHT' : 'LEFT'
    } else {
      // Vertical dominant — only fire jump on upward swipe (negative dy = moved up)
      if (-dy > state.SWIPE_THRESHOLD) gesture = 'UP'
    }

    if (gesture) {
      state.lastGestureTime = now
      // Reset so we don't double-fire from lingering velocity
      state.prevX = cx
      state.prevY = cy
    }

    return gesture
  }, [])

  // ─── Detection loop ──────────────────────────────────────────────────────────
  const detectLoop = useCallback(() => {
    const video    = videoRef.current
    const detector = landmarkerRef.current

    if (!video || !detector || video.readyState < 2) {
      rafIdRef.current = requestAnimationFrame(detectLoop)
      return
    }

    const result = detector.detectForVideo(video, performance.now())
    const landmarks = result?.landmarks?.[0] ?? null

    const gesture = classifyGesture(landmarks)

    // Broadcast raw data so the overlay UI can render hand dots / feedback
    onHandData?.({ landmarks, gesture })

    // Only dispatch game actions when the game is running
    if (gesture && isPlayingRef.current) {
      if (gesture === 'LEFT')  moveLeft?.()
      if (gesture === 'RIGHT') moveRight?.()
      if (gesture === 'UP')    jump?.()
    }

    rafIdRef.current = requestAnimationFrame(detectLoop)
  }, [classifyGesture, moveLeft, moveRight, jump, onHandData])

  // ─── Initialisation ──────────────────────────────────────────────────────────
  useEffect(() => {
    let stream = null
    let cancelled = false

    const init = async () => {
      try {
        // 1. Create hidden video element to feed webcam frames
        const video = document.createElement('video')
        video.setAttribute('playsinline', '')
        video.setAttribute('muted', '')
        video.style.display = 'none'
        document.body.appendChild(video)
        videoRef.current = video

        // 2. Request camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        if (cancelled) return
        video.srcObject = stream
        await video.play()

        // 3. Load MediaPipe HandLandmarker (model streamed from CDN)
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        if (cancelled) return

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,          // 1 hand is enough and faster for a kiosk
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.5,
        })
        if (cancelled) return

        landmarkerRef.current = landmarker
        onReady?.()

        // 4. Start the detection loop
        rafIdRef.current = requestAnimationFrame(detectLoop)
      } catch (err) {
        console.error('[GestureControls] Init failed:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafIdRef.current)
      stream?.getTracks().forEach((t) => t.stop())
      landmarkerRef.current?.close()
      if (videoRef.current) {
        document.body.removeChild(videoRef.current)
        videoRef.current = null
      }
    }
  }, [detectLoop, onReady])
}