import { useGLTF } from '@react-three/drei'

export default function PathExit({ position }) {
  const gltf = useGLTF('/station-gate.glb') // put GLB in public folder

  return (
    <primitive
      object={gltf.scene}
      position={position}
      rotation={[0,4.7,0]}
      scale={[1, 1, 1]}
    />
  )
}
