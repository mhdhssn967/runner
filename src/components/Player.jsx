import { useState, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

export default function Player({ isPlaying }) {
  const lanePositions = [-1.7, 0, 1.7]
  const [laneIndex, setLaneIndex] = useState(1)
  
  

  const groupRef = useRef()
  const targetX = useRef(lanePositions[1])
  const isJumping = useRef(false)

  const { scene, animations } = useGLTF('/banana.glb')
  const { actions } = useAnimations(animations, groupRef)

  // --- ENABLE SHADOWS ---
  useMemo(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = true
    })
  }, [scene])

  // --- COORDINATE LOGGING (Every 1 Second) ---
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (groupRef.current) {
        const { x, y, z } = groupRef.current.position;
        // setPlayerPosition({x:x.toFixed(2),y:y.toFixed(2),z:z.toFixed(2)})
      }
    }, 100);

    return () => clearInterval(logInterval);
  }, []); // Only starts once on mount

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

  // --- INPUT HANDLING ---
  useEffect(() => {
  const handleKey = (e) => {
    if (e.key === 'ArrowLeft') setLaneIndex((prev) => Math.max(prev - 1, 0))
    if (e.key === 'ArrowRight') setLaneIndex((prev) => Math.min(prev + 1, lanePositions.length - 1))

    if (e.key === 'ArrowUp' && isPlaying && !isJumping.current && jumpAction && runAction) {
      isJumping.current = true

      // 1. Prepare Jump
      jumpAction.reset()
      jumpAction.setLoop(THREE.LoopOnce)
      jumpAction.clampWhenFinished = true // Keeps the character at the end of the jump pose briefly
      
      // 2. Crossfade from Run to Jump
      jumpAction.play()
      runAction.crossFadeTo(jumpAction, 0.1, true)

      // 3. Logic Reset (Allows user to jump again before animation fully blends out)
      setTimeout(() => { 
        isJumping.current = false 
      }, 800)

      // 4. Smooth Blend back to Run
      const mixer = jumpAction.getMixer()
      const onFinish = (event) => {
        if (event.action === jumpAction) {
          // Transition back to run smoothly
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

  // --- FRAME UPDATES ---
useFrame((state, delta) => {
  if (!groupRef.current) return;

  // 1. Horizontal Lane Movement (Existing)
  groupRef.current.position.x = THREE.MathUtils.lerp(
    groupRef.current.position.x,
    targetX.current,
    0.15
  );

  // 2. Vertical Jump Movement (The Fix)
  if (isJumping.current && jumpAction) {
    // We use the current time of the animation to calculate the height
    const progress = jumpAction.time / jumpAction.getClip().duration;
    
    // Create a jump arc using a Sin wave
    // (Math.sin(0 to PI) goes 0 -> 1 -> 0)
    const jumpHeight = 1.5; // Adjust how high you want to jump
    const currentJumpY = Math.sin(progress * Math.PI) * jumpHeight;
    
    groupRef.current.position.y = 0.3 + currentJumpY;
  } else {
    // Smoothly return to floor height
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.3, 0.2);
  }
  
});

useEffect(() => {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const minSwipeDistance = 30; // Minimum distance to consider as swipe

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Horizontal swipe (left/right)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right
        setLaneIndex((prev) => Math.min(prev + 1, lanePositions.length - 1));
      } else {
        // Swipe left
        setLaneIndex((prev) => Math.max(prev - 1, 0));
      }
    }

    // Vertical swipe (up)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY < 0) {
        // Swipe up → jump
        if (isPlaying && !isJumping.current && jumpAction && runAction) {
          isJumping.current = true;

          jumpAction.reset();
          jumpAction.setLoop(THREE.LoopOnce);
          jumpAction.clampWhenFinished = true;
          jumpAction.play();
          runAction.crossFadeTo(jumpAction, 0.1, true);

          setTimeout(() => {
            isJumping.current = false;
          }, 800);

          const mixer = jumpAction.getMixer();
          const onFinish = (event) => {
            if (event.action === jumpAction) {
              runAction.reset().fadeIn(0.2).play();
              jumpAction.crossFadeTo(runAction, 0.2, true);
              mixer.removeEventListener('finished', onFinish);
            }
          };
          mixer.addEventListener('finished', onFinish);
        }
      }
    }
  };

  window.addEventListener('touchstart', handleTouchStart);
  window.addEventListener('touchend', handleTouchEnd);

  return () => {
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
  };
}, [isPlaying, jumpAction, runAction, lanePositions]);


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