import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect
} from 'react'
import Obstacle from './Obstacle'

const SpawnManager = forwardRef(({ segmentLength, lanePositions }, ref) => {
  const obstaclesPerSegment = 5
  const obstacleTypes = ['rock', 'trap', 'pole']

  const LANE_INSET = 0.8 // ✅ keeps obstacles away from edges

  const obstacleRefs = useRef([])
  const canSpawnRef = useRef(false)

  useEffect(() => {
    obstacleRefs.current.forEach((obs) => {
      if (obs) obs.visible = false
    })

    const timer = setTimeout(() => {
      canSpawnRef.current = true
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useImperativeHandle(ref, () => ({
    randomize: () => {
      if (!canSpawnRef.current) return

      obstacleRefs.current.forEach((obs) => {
        if (!obs) return

        const baseLane =
          lanePositions[Math.floor(Math.random() * lanePositions.length)]

        obs.visible = true
        obs.position.x =
          baseLane > 0
            ? baseLane - LANE_INSET
            : baseLane < 0
            ? baseLane + LANE_INSET
            : baseLane

        obs.position.z = -Math.random() * segmentLength
        obs.position.y = -0.1
      })
    },

    getObstacles: () => obstacleRefs.current
  }))

  return (
    <>
      {Array.from({ length: obstaclesPerSegment }).map((_, i) => (
        <Obstacle
          key={i}
          ref={(el) => (obstacleRefs.current[i] = el)}
          type={
            obstacleTypes[
              Math.floor(Math.random() * obstacleTypes.length)
            ]
          }
        />
      ))}
    </>
  )
})

export default SpawnManager
