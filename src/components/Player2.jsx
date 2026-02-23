import { Html } from '@react-three/drei'

import { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX } from '@react-three/drei'
import * as THREE from 'three'
import './Player.css'
import { soundManager } from '../audio/SoundManager'
import { updatePlayerScore } from '../services/services'

export default function Player({
  isPlaying,
  obstacleRefs,
  coinRefs,
  setIsPlaying,
  platformRef,
  setIsDeadState,companyId
}) {
  const lanePositions = [-1.7, 0, 1.7]
  const [laneIndex, setLaneIndex] = useState(1)

  const [score,setScore]=useState(0)
  const [gameOver, setGameOver] = useState(false)
  const isDead = useRef(false);
// --- ANIMATION CONTROLS ---


  const groupRef = useRef()
  const targetX = useRef(lanePositions[1])
  const isJumping = useRef(false)

  // Stable Bounding Box
  const playerBox = useRef(new THREE.Box3())

  // Load FBX models
  const runFBX = useFBX('/new/run.fbx')
  const fallFBX = useFBX('/new/fall.fbx')
  const jumpFBX = useFBX('/new/jump.fbx')
  const idleFBX = useFBX('/new/idle.fbx')

  // Animation mixer
  const mixerRef = useRef()
  const actionsRef = useRef({})
  const actions = actionsRef.current

  // Setup mixer and animations
  useEffect(() => {
    if (!groupRef.current || !runFBX) return

    const mixer = new THREE.AnimationMixer(groupRef.current)
    mixerRef.current = mixer

    // Helper to extract armature animation clip and retarget to run mesh
    const getClip = (fbx, name) => {
      if (fbx.animations && fbx.animations.length > 0) {
        const clip = fbx.animations[0].clone()
        clip.name = name
        return clip
      }
      return null
    }

    const runClip = getClip(runFBX, 'run')
    const fallClip = getClip(fallFBX, 'fall')
    const jumpClip = getClip(jumpFBX, 'jump')
    const idleClip = getClip(idleFBX, 'idle2')

    if (runClip) actionsRef.current.run = mixer.clipAction(runClip)
    if (fallClip) actionsRef.current.fall = mixer.clipAction(fallClip)
    if (jumpClip) actionsRef.current.jump = mixer.clipAction(jumpClip)
    if (idleClip) actionsRef.current.idle2 = mixer.clipAction(idleClip)

    // Start idle by default
    if (actionsRef.current.idle2) {
      actionsRef.current.idle2.reset().fadeIn(0.3).play()
    }

    return () => {
      mixer.stopAllAction()
    }
  }, [runFBX, fallFBX, jumpFBX, idleFBX])

  // Tick the mixer
  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  // --- PREVENT SHARED MATERIAL BUGS ---
  useEffect(() => {
    runFBX.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        if (obj.material) {
          obj.material = obj.material.clone()
        }
      }
    })
  }, [runFBX])

  // --- ANIMATION CONTROLS ---
useEffect(() => {
  const actions = actionsRef.current
  if (!actions || Object.keys(actions).length === 0) return

  if (isPlaying) {
    // 🏃 GAME START: Reset everything
    isDead.current = false
    setGameOver(false)
    
    // Stop any "frozen" animations
    Object.values(actions).forEach((a) => a?.stop())
    
    // Play run
    if (actions.run) {
      actions.run.reset().fadeIn(0.3).setLoop(THREE.LoopRepeat).play()
    }
  } else {
    // 🛑 GAME STOPPED: Logic for Idle vs Death
    if (isDead.current) {
      actions.run?.fadeOut(0.2)
    } else {
      // Normal pause or start screen: Play idle
      Object.values(actions).forEach((a) => a?.stop())
      actions.idle2?.reset().fadeIn(0.3).play()
    }
  }
}, [actionsRef.current.run, actionsRef.current.idle2, isPlaying])



// Mobile controls
// --- MOBILE SWIPE CONTROLS ---
useEffect(() => {
  let touchStartX = 0
  let touchStartY = 0
  const minSwipeDistance = 30 // Minimum pixels to register as a swipe

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (!isPlaying) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const dx = touchEndX - touchStartX
    const dy = touchEndY - touchStartY

    // Check if horizontal swipe is stronger than vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipeDistance) {
        if (dx > 0) {
          // Swipe Right
          setLaneIndex((p) => Math.min(p + 1, 2))
        } else {
          // Swipe Left
          setLaneIndex((p) => Math.max(p - 1, 0))
        }
      }
    } else {
      // Vertical swipe logic
      if (Math.abs(dy) > minSwipeDistance) {
        if (dy < 0) {
          // Swipe Up (Negative Y is up on screen)
          const actions = actionsRef.current
          if (!isJumping.current && actions.jump) {
            soundManager.play('jump')
            triggerJump()
          }
        }
      }
    }
  }

  window.addEventListener('touchstart', handleTouchStart)
  window.addEventListener('touchend', handleTouchEnd)
  
  return () => {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchend', handleTouchEnd)
  }
}, [isPlaying])

const triggerJump = () => {
  const actions = actionsRef.current
  if (isJumping.current || !actions.jump) return
  
  isJumping.current = true
  actions.run?.fadeOut(0.1)
  actions.jump.reset().setLoop(THREE.LoopOnce).play()

  setTimeout(() => {
    isJumping.current = false
    if (isPlaying) actions.run?.reset().fadeIn(0.2).play()
  }, 800)
}

  // --- INPUT CONTROLS ---
  useEffect(() => {
    const handleKey = (e) => {
      if (!isPlaying) return
soundManager.play('jump')
      if (e.key === 'ArrowLeft') setLaneIndex((p) => Math.max(p - 1, 0))
      if (e.key === 'ArrowRight') setLaneIndex((p) => Math.min(p + 1, 2))

      const actions = actionsRef.current
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
  }, [isPlaying])

  useEffect(() => {
    targetX.current = lanePositions[laneIndex]
  }, [laneIndex])

  // --- GAME LOOP ---
  useFrame(() => {
    if (!groupRef.current || isDead.current) return

    const actions = actionsRef.current
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
  const leanAmount = xDiff * 0.5 
  groupRef.current.rotation.z = THREE.MathUtils.lerp(
    groupRef.current.rotation.z,
    -leanAmount,
    0.1
  )

  // Optional: Slight Y-axis turn (looking towards the lane)
  const turnAmount = xDiff * 0.8
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
    if (obstacleRefs && isPlaying) {
      const obstacleRefs = platformRef.current?.getAllObstacles() || [];
      
      for (const obs of obstacleRefs) {
        if (!obs || obs.visible === false) continue;

        const obsBox = obs.getBoundingBox?.();
        

        
        if (obsBox && playerBox.current.intersectsBox(obsBox)) {
          
          handleDeath();
          break;
        }
    }
  }
  

    // 🟡 Coin collision (SAFE)
if (coinRefs && !isJumping.current) {
  for (const coin of coinRefs) {
    if (!coin || !coin.isActive()) continue

    const coinBox = coin.getBoundingBox?.()
    if (coinBox && playerBox.current.intersectsBox(coinBox)) {
      soundManager.play('coin')
      coin.collect()
      setScore((s) => s + 1)
    }
  }
}


  })

const handleDeath = async() => {
  if (isDead.current) return
  isDead.current = true

  const actions = actionsRef.current

  // 🔊 1. Play DEATH SFX first
  soundManager.stop('bg') 
  soundManager.play('death')

  // ⏸ Stop gameplay
  setIsPlaying(false)
  setIsDeadState(true)

  // 🎬 Play fall animation
  if (actions.fall) {
    actions.run?.stop()
    actions.idle2?.stop()
    actions.jump?.stop()

    actions.fall
      .reset()
      .setLoop(THREE.LoopOnce, 1)
      .play()

    actions.fall.clampWhenFinished = true
  }
if(companyId){
  await updatePlayerScore(score,companyId)
}
  setTimeout(() => {
    setGameOver(true)
    soundManager.play('gameover')
  }, 100)
}

 return (
  <>
    <Html
      position={[0, 0, 0]}
      fullscreen
      
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none', // Allows clicking through empty space
        userSelect: 'none'
      }}
    >
      {/* Persistent Score */}
      <div style={{ position: 'absolute', top: '1px', fontSize: '25px', fontWeight: 'bold', color: 'white',right:'20px' }}>
        Score: {score}
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className='game-over' style={{
          pointerEvents: 'auto', // Re-enable clicks for the button
          background: 'rgba(0,0,0,0.8)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>SPLAT!</h1>
          <p style={{ fontSize: '24px' }}>Final Score: {score}</p>
          <button 
            onClick={() => window.location.reload()} // Simple reload for full reset
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              fontSize: '20px',
              cursor: 'pointer',
              borderRadius: '10px',
              border: 'none',
              background: '#ffe100',
              color: 'black',
              fontWeight: 'bold'
            }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </Html>

    <group ref={groupRef} position={[lanePositions[1], 0.3, 6]} rotation={[0, Math.PI , 0]} scale={[0.006, 0.006, 0.006]}>
      <primitive object={runFBX} />
    </group>
  </>
)
}