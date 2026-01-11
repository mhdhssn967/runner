import React, {
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SpawnManager from './SpawnManager'
import CoinManager from './CoinManager'

const InfinitePlatform = forwardRef(({ isPlaying }, ref) => {
  const segmentLength = 110.3
  const numSegments = 4

  const laneWidth = 2.5
  const lanePositions = [-laneWidth, 0, laneWidth]

  const totalWidth = laneWidth * 3
  const totalLength = segmentLength * numSegments
  const resetThreshold = 160

  // 🎮 Speed system
  const INITIAL_SPEED = 0.3
  const MAX_SPEED = 1.5
  const ACCELERATION_RATE = 0.0001
  const currentSpeed = useRef(INITIAL_SPEED)

  const segmentRefs = useRef([])
  const spawnerRefs = useRef([])
  const coinManagerRefs = useRef([])

  // 🎨 Materials (created once)
  const roadMaterial = new THREE.MeshStandardMaterial({ color: '#facc15' }) // yellow
  const sideMaterial = new THREE.MeshStandardMaterial({ color: '#22c55e' }) // green

  useFrame((_, delta) => {
    if (!isPlaying) return

    if (currentSpeed.current < MAX_SPEED) {
      currentSpeed.current += ACCELERATION_RATE * delta * 60
    }

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
          position={[0, 0.3, -i * segmentLength]}
        >
          {/* 🟨 Main road */}
          <mesh
            receiveShadow
            position={[0, -0.1, -segmentLength/3]}
            material={roadMaterial}
          >
            <boxGeometry args={[totalWidth, 0.2, segmentLength]} />
          </mesh>

          {/* 🟩 Left side */}
          <mesh
            receiveShadow
            position={[
              -(totalWidth / 2) ,
              0.25,
              -segmentLength / 3
            ]}
            material={sideMaterial}
          >
            <boxGeometry args={[0.5, 0.5, segmentLength]} />
          </mesh>

          {/* 🟩 Right side */}
          <mesh
            receiveShadow
            position={[
              (totalWidth / 2) ,
              0.25,
              -segmentLength / 3
            ]}
            material={sideMaterial}
          >
            <boxGeometry args={[0.5, 0.5, segmentLength]} />
          </mesh>

          {/* 🚧 Obstacles */}
          <SpawnManager
            ref={(el) => (spawnerRefs.current[i] = el)}
            segmentLength={segmentLength}
            lanePositions={lanePositions}
          />

          {/* 🪙 Coins */}
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
