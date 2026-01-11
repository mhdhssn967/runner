import React, {
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SpawnManager from './SpawnManager'
import CoinManager from './CoinManager'
import { RoundedBox } from '@react-three/drei'
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

  // 🧱 Visual tuning
  const WALL_CHUNK_LENGTH = 12
  const WALL_GAP = 6

  const LANE_LINE_WIDTH = 0.08
  const LANE_LINE_HEIGHT = 0.02

  const segmentRefs = useRef([])
  const spawnerRefs = useRef([])
  const coinManagerRefs = useRef([])

  const roadMaterial = new THREE.MeshStandardMaterial({ color: '#facc15' })
  const sideMaterial = new THREE.MeshStandardMaterial({ color: '#22c55e' })


  // 🟨 Road bumps
const BUMP_COUNT = 5
const BUMP_WIDTH = totalWidth * 0.85
const BUMP_HEIGHT = 0.3
const BUMP_LENGTH = 0.5
const BUMP_COLOR = '#eab308' // darker yellow

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
          {/* 🟨 Road */}
          <mesh
            receiveShadow
            position={[0, -0.1, -segmentLength / 3]}
            material={roadMaterial}
          >
            <boxGeometry args={[totalWidth, 0.2, segmentLength]} />
          </mesh>

          {/* 🟦 Lane dividers */}
          {[-laneWidth / 2, laneWidth / 2].map((x, idx) => (
            <mesh
              key={idx}
              position={[x, -0.01, -segmentLength / 3]}
              receiveShadow
            >
              <boxGeometry
                args={[
                  LANE_LINE_WIDTH,
                  LANE_LINE_HEIGHT+0.1,
                  segmentLength
                ]}
              />
              <meshStandardMaterial color="#998f03" />
            </mesh>
          ))}

          {/* 🟡 Road bumps */}
{Array.from({ length: BUMP_COUNT }).map((_, j) => (
  <mesh
    key={`bump-${j}`}
    position={[
      0,
      -0.08,
      -j * (segmentLength / BUMP_COUNT)
    ]}
    receiveShadow
  >
    <boxGeometry
      args={[
        BUMP_WIDTH,
        BUMP_HEIGHT,
        BUMP_LENGTH
      ]}
    />
    <meshStandardMaterial color={BUMP_COLOR} />
  </mesh>
))}


          {/* 🟩 Gapped left wall */}
          {Array.from({
            length: Math.floor(
              segmentLength / (WALL_CHUNK_LENGTH + WALL_GAP)
            )
          }).map((_, j) => (
            <RoundedBox
  args={[0.6, 0.6, segmentLength]}
  radius={0.15}     // 👈 roundness
  smoothness={6}
  position={[
    -(totalWidth / 2),
    0.25,
    -segmentLength / 3
  ]}
>
  <meshStandardMaterial color="#22c55e" />
</RoundedBox>

          ))}

          {/* 🟩 Gapped right wall */}
          {Array.from({
            length: Math.floor(
              segmentLength / (WALL_CHUNK_LENGTH + WALL_GAP)
            )
          }).map((_, j) => (
            <RoundedBox
  args={[0.6, 0.6, segmentLength]}
  radius={0.15}
  smoothness={6}
  position={[
    totalWidth / 2,
    0.25,
    -segmentLength / 3
  ]}
>
  <meshStandardMaterial color="#22c55e" />
</RoundedBox>
          ))}

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
