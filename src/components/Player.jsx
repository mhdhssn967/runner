import { useState, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

export default function Player({ isPlaying, obstacleRefs }) {
  const lanePositions = [-1.7, 0, 1.7]
  const [laneIndex, setLaneIndex] = useState(1)

  const groupRef = useRef()
  const targetX = useRef(lanePositions[1])
  const isJumping = useRef(false)

  // 🧱 Player Bounding Box
  const playerBox = useRef(new THREE.Box3())

  const { scene, animations } = useGLTF('/banana.glb')
  const { actions } = useAnimations(animations, groupRef)

  // --- ENABLE SHADOWS ---
  useMemo(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = true
    })
  }, [scene])

  // --- ANIMATION CONTROLS ---
  const runAction = actions?.run
  const jumpAction = actions?.jump

  useEffect(() => {
    if (!actions) return
    Object.values(actions).forEach((action) => action.stop())

    if (!isPlaying) {
      actions.idle?.reset().fadeIn(0.3).play()
    } else {
      actions.run?.reset().fadeIn(0.3).setLoop(THREE.LoopRepeat).play()
    }

    return () => {
      Object.values(actions).forEach((action) => action?.fadeOut(0.2))
    }
  }, [actions, isPlaying])

  // --- INPUT ---
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')
        setLaneIndex((prev) => Math.max(prev - 1, 0))

      if (e.key === 'ArrowRight')
        setLaneIndex((prev) =>
          Math.min(prev + 1, lanePositions.length - 1)
        )

      if (
        e.key === 'ArrowUp' &&
        isPlaying &&
        !isJumping.current &&
        jumpAction &&
        runAction
      ) {
        isJumping.current = true

        jumpAction.reset()
        jumpAction.setLoop(THREE.LoopOnce)
        jumpAction.clampWhenFinished = true
        jumpAction.play()
        runAction.crossFadeTo(jumpAction, 0.1, true)

        setTimeout(() => {
          isJumping.current = false
        }, 800)

        const mixer = jumpAction.getMixer()
        const onFinish = (event) => {
          if (event.action === jumpAction) {
            runAction.reset().fadeIn(0.2).play()
            jumpAction.crossFadeTo(runAction, 0.2, true)
            mixer.removeEventListener('finished', onFinish)
          }
        }
        mixer.addEventListener('finished', onFinish)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [runAction, jumpAction, isPlaying])

  useEffect(() => {
    targetX.current = lanePositions[laneIndex]
  }, [laneIndex])

  // --- FRAME LOOP ---
  useFrame(() => {
    if (!groupRef.current) return

    // Lane movement
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX.current,
      0.15
    )

    // Jump arc
    if (isJumping.current && jumpAction) {
      const progress =
        jumpAction.time / jumpAction.getClip().duration
      const jumpHeight = 1.5
      const currentJumpY = Math.sin(progress * Math.PI) * jumpHeight
      groupRef.current.position.y = 0.3 + currentJumpY
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0.3,
        0.2
      )
    }

    // 🧠 COLLISION CHECK
    playerBox.current.setFromObject(groupRef.current)

    obstacleRefs?.forEach((obs) => {
      if (!obs || !obs.visible) return

      const obsBox = obs.getBoundingBox?.()
      if (!obsBox) return

      if (playerBox.current.intersectsBox(obsBox)) {
        console.log('🚨 COLLISION DETECTED')
      }
    })
  })

  return (
    <group
      ref={groupRef}
      position={[lanePositions[1], 0.3, 6]}
      rotation={[0, isPlaying ? Math.PI : 0, 0]}
      scale={[0.4, 0.4, 0.4]}
    >
      <primitive object={scene} />
    </group>
  )
}
