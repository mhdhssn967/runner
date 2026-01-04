import { Html, useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { progress } = useProgress()

  return (
    <Html fullscreen>
      <div className="loading-screen">
        <img src="/splash_log.png" alt="Logo" className="loading-logo" />

        <div className="spinner" />

        <p className="loading-text">
          {/* {progress.toFixed(0)}% */}
        </p>
      </div>
    </Html>
  )
}
