import { useEffect } from "react"
import GestureController from "./GestureController"

export default function useGestureInput(
  videoRef,
  canvasRef,
  { onMoveLeft, onMoveRight, onJump }
) {
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    const controller = new GestureController({
      videoElement: videoRef.current,
      canvasElement: canvasRef.current,
      onMoveLeft,
      onMoveRight,
      onJump
    })

    return () => controller.destroy()
  }, [])
}