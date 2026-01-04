import { Html, useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="splash-screen">
        <h1>Loading</h1>
        <p>{progress.toFixed(0)}%</p>
      </div>
    </Html>
  )
}
