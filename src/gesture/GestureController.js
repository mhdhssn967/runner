import { Hands } from "@mediapipe/hands"
import { Camera } from "@mediapipe/camera_utils"

export default class GestureController {
  constructor({ videoElement, canvasElement, onMoveLeft, onMoveRight, onJump }) {
    this.video = videoElement
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext("2d")

    this.onMoveLeft = onMoveLeft
    this.onMoveRight = onMoveRight
    this.onJump = onJump

    this.lastX = null
    this.lastY = null
    this.cooldown = false

    this.init()
  }

  init() {
    this.hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0, // 🔥 PERFORMANCE MODE
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    })

    this.hands.onResults(this.onResults.bind(this))

    this.camera = new Camera(this.video, {
      onFrame: async () => {
        await this.hands.send({ image: this.video })
      },
      width: 640,
      height: 480
    })

    this.camera.start()
  }

  resetBaseline(x, y) {
  this.lastX = x
  this.lastY = y
}

 onResults(results) {
  const ctx = this.ctx
  const w = this.canvas.width
  const h = this.canvas.height

  ctx.clearRect(0, 0, w, h)

  if (!results.multiHandLandmarks || !results.multiHandLandmarks[0]) return

  const landmarks = results.multiHandLandmarks[0]

  ctx.setTransform(-1, 0, 0, 1, w, 0)
  this.drawLandmarks(landmarks)

  const wrist = landmarks[0]
  if (!wrist) return

  const x = wrist.x
  const y = wrist.y

  // Initialize starting point
  if (this.lastX === null) {
    this.lastX = x
    this.lastY = y
    return
  }

  const dx = x - this.lastX
  const dy = y - this.lastY

  const SWIPE_THRESHOLD = 0.12
  const VERTICAL_THRESHOLD = 0.12

  if (!this.cooldown) {
    // Horizontal swipe
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        this.onMoveRight()
      } else {
        this.onMoveLeft()
      }

      this.triggerCooldown()
      this.resetBaseline(x, y)
      return
    }

    // Up swipe
    if (-dy > VERTICAL_THRESHOLD) {
      this.onJump()
      this.triggerCooldown()
      this.resetBaseline(x, y)
      return
    }
  }

  // Smooth tracking
  this.lastX = x
  this.lastY = y
}
  triggerCooldown() {
    this.cooldown = true
    setTimeout(() => {
      this.cooldown = false
    }, 500) // prevent spam
  }

  drawLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) return

  const ctx = this.ctx
  const w = this.canvas.width
  const h = this.canvas.height

  ctx.strokeStyle = "#00ffcc"
  ctx.lineWidth = 2

  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],
    [9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],
    [0,17]
  ]

  // Draw lines safely
  for (let i = 0; i < connections.length; i++) {
    const [a, b] = connections[i]

    const p1 = landmarks[a]
    const p2 = landmarks[b]

    if (!p1 || !p2) continue

    ctx.beginPath()
    ctx.moveTo(p1.x * w, p1.y * h)
    ctx.lineTo(p2.x * w, p2.y * h)
    ctx.stroke()
  }

  // Draw dots safely
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i]
    if (!lm) continue

    ctx.beginPath()
    ctx.arc(lm.x * w, lm.y * h, 4, 0, 2 * Math.PI)
    ctx.fillStyle = "#00ffcc"
    ctx.fill()
  }
}

  destroy() {
    this.camera?.stop()
  }
}