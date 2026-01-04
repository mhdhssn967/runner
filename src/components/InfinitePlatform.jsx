import React, {
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Clone } from '@react-three/drei'
import SpawnManager from './SpawnManager'
import CoinManager from './CoinManager'

const InfinitePlatform = forwardRef(({ isPlaying }, ref) => {
  const { scene } = useGLTF('/platform_new.glb')
  

  const segmentLength = 87.3
  const numSegments = 4
  const lanePositions = [-1.7, 0, 1.7]
  const totalLength = segmentLength * numSegments
  const resetThreshold = 160

  const INITIAL_SPEED = 0.3
  const MAX_SPEED = 1.5
  const ACCELERATION_RATE = 0.0001 // Adjust this to change how fast it gets harder
  const currentSpeed = useRef(INITIAL_SPEED)

  const segmentRefs = useRef([])
  const spawnerRefs = useRef([])
  const coinManagerRefs = useRef([])
  

  useFrame((_, delta) => {
    if (!isPlaying) return

    // 1. Increase the speed multiplier over time
    if (currentSpeed.current < MAX_SPEED) {
      currentSpeed.current += ACCELERATION_RATE * delta * 60
    }

    // 2. Use the dynamic speed for movement
    const frameSpeed = currentSpeed.current * delta * 60

    segmentRefs.current.forEach((group, i) => {
      if (!group) return
      group.position.z += frameSpeed

      if (group.position.z > resetThreshold) {
        group.position.z -= totalLength
        spawnerRefs.current[i]?.randomize()
        coinManagerRefs.current[i]?.randomize()
      }
    })
  })

  useImperativeHandle(ref, () => ({
    getSpeed: () => currentSpeed.current,
    getAllObstacles: () =>
      spawnerRefs.current.flatMap(
        (s) => s?.getObstacles?.() || []
      ),

    getAllCoins: () =>
      coinManagerRefs.current.flatMap(
        (c) => c?.getCoins?.() || []
      )
  }))

  return (
    <group>
      {[...Array(numSegments)].map((_, i) => (
        <group
          key={i}
          ref={(el) => (segmentRefs.current[i] = el)}
          position={[0, 0, -i * segmentLength]}
        >
          {/* Platform */}
          <group position={[0.2, 0.01, 0]}>
            <Clone object={scene} deep receiveShadow />
          </group>

          {/* Obstacles */}
          <SpawnManager
            ref={(el) => (spawnerRefs.current[i] = el)}
            segmentLength={segmentLength}
            lanePositions={lanePositions}
          />

          {/* Coins */}
          <CoinManager
            ref={(el) => (coinManagerRefs.current[i] = el)}
            segmentLength={segmentLength}
            lanePositions={lanePositions}
          />
        </group>
      ))}
    </group>
  )
})

export default InfinitePlatform
