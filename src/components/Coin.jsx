import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const Coin = forwardRef(({ position }, ref) => {
  const { scene } = useGLTF('/coin.glb')
  const clonedScene = THREE.SkeletonUtils?.clone(scene) || scene.clone()
  const groupRef = useRef()
  const box = useRef(new THREE.Box3())
  const active = useRef(true)

  // 🔥 THIS IS MANDATORY
  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        // obj.castShadow = true
        obj.material = obj.material.clone()
        // obj.material.emissive = new THREE.Color(0xffcc00)
        obj.material.emissiveIntensity = 0.6
      }
    })
  }, [clonedScene])

  useFrame((_, delta) => {
    if (groupRef.current && active.current) {
      groupRef.current.rotation.y += delta * 3
    }
  })

  useImperativeHandle(ref, () => ({
  isActive: () => active.current,

  getBoundingBox: () => {
    if (!active.current) return null
    
    // Get the current world position of the coin
    const position = new THREE.Vector3()
    groupRef.current.getWorldPosition(position)

    // Manually define a small box (e.g., 0.5 units wide/tall)
    // This creates a box from [pos - 0.25] to [pos + 0.25]
    box.current.setFromCenterAndSize(
      position, 
      new THREE.Vector3(0.5, 0.5, 0.5) 
    )
    
    return box.current
  },

    collect: () => {
      active.current = false
      groupRef.current.visible = false
    },

    reset: (x, z) => {
      active.current = true
      groupRef.current.visible = true
      groupRef.current.position.set(x, 1, z)
    }
  }))

  return (
    <group ref={groupRef} position={position}>
      <primitive object={clonedScene} />
    </group>
  )
})

export default Coin
