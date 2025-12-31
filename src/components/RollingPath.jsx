import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function RollingPath({cylinderRadius, gameSpeed, isPlaying}) {
  const meshRef = useRef()

  // Rotation speed
  const speed = gameSpeed // Adjust as needed

  useFrame(() => {
    if (meshRef.current && isPlaying) {
      // Rotate around X-axis continuously
      meshRef.current.rotation.x += speed
    }
  })

  return (
    <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderRadius, 64]} />
      <meshStandardMaterial
        color="white"
        wireframe={false}
        />
    </mesh>
  )
}
