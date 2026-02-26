/**
 * gestureWorker.js  — Classic Worker edition
 *
 * MediaPipe's WASM loader uses importScripts() internally, which is only
 * available in classic (non-module) workers. So we load MediaPipe via
 * importScripts from the CDN, then run our detection logic normally.
 *
 * The hook instantiates this with { type: undefined } (classic mode).
 */

const COOLDOWN_MS     = 450
const SWIPE_THRESHOLD = 0.06

let landmarker      = null
let history         = []
let lastGestureTime = 0

function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    history = []
    return null
  }

  const wrist = landmarks[0]
  const palm  = landmarks[9]
  const cx    = (wrist.x + palm.x) / 2
  const cy    = (wrist.y + palm.y) / 2

  history.push({ x: cx, y: cy })
  if (history.length > 4) history.shift()
  if (history.length < 2) return null

  const now = performance.now()
  if (now - lastGestureTime < COOLDOWN_MS) return null

  const oldest = history[0]
  const newest = history[history.length - 1]

  const dx    = oldest.x - newest.x
  const dy    = oldest.y - newest.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return null

  let gesture = null
  if (absDx > absDy) {
    gesture = dx > 0 ? 'RIGHT' : 'LEFT'
  } else {
    if (-dy > SWIPE_THRESHOLD) gesture = 'UP'
  }

  if (gesture) {
    lastGestureTime = now
    history = []
  }

  return gesture
}

self.onmessage = async (e) => {
  const { type } = e.data

  if (type === 'INIT') {
    try {
      // Load MediaPipe via importScripts (required for classic workers)
      // These are UMD builds that expose globals on self
      importScripts(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js'
      )

      const { FilesetResolver, HandLandmarker } = self.MediaPipeTasksVision

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence:  0.5,
        minTrackingConfidence:      0.4,
      })

      self.postMessage({ type: 'READY' })
    } catch (err) {
      self.postMessage({ type: 'ERROR', message: err.message })
    }
  }

  if (type === 'FRAME') {
    if (!landmarker) return
    const { bitmap, timestamp } = e.data
    const result    = landmarker.detectForVideo(bitmap, timestamp)
    bitmap.close()
    const landmarks = result?.landmarks?.[0] ?? null
    const gesture   = classifyGesture(landmarks)
    self.postMessage({ type: 'RESULT', landmarks, gesture })
  }

  if (type === 'DESTROY') {
    landmarker?.close()
    landmarker = null
    self.close()
  }
}