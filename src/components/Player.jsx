import { Html } from '@react-three/drei'

import { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

export default function Player({
  isPlaying,
  obstacleRefs,
  coinRefs,
  platformRef
}) {
  const lanePositions = [-1.7, 0, 1.7]
  const [laneIndex, setLaneIndex] = useState(1)

  const [score,setScore]=useState(0)
  
console.log(score);

  const groupRef = useRef()
  const targetX = useRef(lanePositions[1])
  const isJumping = useRef(false)

  // Stable Bounding Box
  const playerBox = useRef(new THREE.Box3())

  // Load GLTF
  const { scene, animations } = useGLTF('/banana.glb')
  const { actions } = useAnimations(animations, groupRef)

  // --- PREVENT SHARED MATERIAL BUGS ---
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        if (obj.material) {
          obj.material = obj.material.clone()
        }
      }
    })
  }, [scene])

  // --- ANIMATION CONTROLS ---
  useEffect(() => {
    if (!actions) return

    Object.values(actions).forEach((a) => a?.stop())

    if (!isPlaying) {
      actions.idle?.reset().fadeIn(0.3).play()
    } else {
      actions.run?.reset().fadeIn(0.3).setLoop(THREE.LoopRepeat).play()
    }

    return () =>
      Object.values(actions).forEach((a) => a?.fadeOut(0.2))
  }, [actions, isPlaying])

  // --- INPUT CONTROLS ---
  useEffect(() => {
    const handleKey = (e) => {
      if (!isPlaying) return

      if (e.key === 'ArrowLeft') setLaneIndex((p) => Math.max(p - 1, 0))
      if (e.key === 'ArrowRight') setLaneIndex((p) => Math.min(p + 1, 2))

      if (e.key === 'ArrowUp' && !isJumping.current && actions.jump) {
        isJumping.current = true

        actions.run?.fadeOut(0.1)
        actions.jump.reset().setLoop(THREE.LoopOnce).play()

        setTimeout(() => {
          isJumping.current = false
          if (isPlaying) actions.run?.reset().fadeIn(0.2).play()
        }, 800)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [actions, isPlaying])

  useEffect(() => {
    targetX.current = lanePositions[laneIndex]
  }, [laneIndex])

  // --- GAME LOOP ---
  useFrame(() => {
    if (!groupRef.current) return

    const currentPlatformSpeed = platformRef.current?.getSpeed() || 0.3

    if (actions.run) {
    // If initial speed was 0.3, this multiplier scales the animation
    const speedMultiplier = currentPlatformSpeed / 0.3
    actions.run.timeScale = speedMultiplier 
  }

    // Lane movement
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX.current,
      0.15
    )

    const xDiff = targetX.current - groupRef.current.position.x
  
  // Tilt the Z-axis (sideways lean)
  // When xDiff is positive (moving right), tilt left (negative Z)
  // When xDiff is negative (moving left), tilt right (positive Z)
  const leanAmount = xDiff * 0.5 
  groupRef.current.rotation.z = THREE.MathUtils.lerp(
    groupRef.current.rotation.z,
    -leanAmount,
    0.1
  )

  // Optional: Slight Y-axis turn (looking towards the lane)
  const turnAmount = xDiff * 0.8
  // Add Math.PI if the model is originally facing backwards
  const baseRotationY = isPlaying ? Math.PI : 0 
  groupRef.current.rotation.y = THREE.MathUtils.lerp(
    groupRef.current.rotation.y,
    baseRotationY + turnAmount,
    0.1
  )

    // Jump arc
    if (isJumping.current && actions.jump) {
      const progress =
        actions.jump.time / actions.jump.getClip().duration
      const jumpHeight = 1.8
      groupRef.current.position.y =
        0.3 + Math.sin(progress * Math.PI) * jumpHeight
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0.3,
        0.2
      )
    }

    // Update collision box
    playerBox.current.setFromObject(groupRef.current)
    playerBox.current.expandByScalar(-0.1)

    // 🧱 Obstacle collision
    if (obstacleRefs) {
      for (const obs of obstacleRefs) {
        if (!obs || obs.visible === false) continue

        const obsBox = obs.getBoundingBox?.()
        if (obsBox && playerBox.current.intersectsBox(obsBox)) {
          // console.log('🚨 HIT OBSTACLE')
        }
      }
    }

    // 🟡 Coin collision (SAFE)
    // Coin collision
if (coinRefs && !isJumping.current) { // Added !isJumping.current here
  for (const coin of coinRefs) {
    if (!coin || !coin.isActive()) continue

    const coinBox = coin.getBoundingBox?.()
    if (coinBox && playerBox.current.intersectsBox(coinBox)) {
      coin.collect()
      setScore((s) => s + 1)
    }
  }
}


  })

  return (
   <>
  {/* UI SCORE */}
  <Html
    position={[2, 7, 0]}
    center
    style={{
      pointerEvents: 'none',
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'black',
    }}
  >
    <div style={{width:'200px'}}>Score: {score}</div>
  </Html>

  {/* PLAYER */}
  <group
    ref={groupRef}
    position={[lanePositions[1], 0.3, 6]}
    rotation={[0, isPlaying ? Math.PI : 0, 0]}
    scale={[0.4, 0.4, 0.4]}
  >
    <primitive object={scene} />
  </group>
</>

  )
}
