import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Shadow } from '@react-three/drei'
import RollingPath from './RollingPath'
import Player from './Player'
import InfinitePlatform from './InfinitePlatform'
import HUD from './HUD'
import { useRef, useState } from 'react'


export default function Game({isPlaying}) {
  const playerGroupRef = useRef();
  const platformRef = useRef();
  const [score, setScore] = useState(0);


  return (

    <>
    <HUD score={score}/>
    <Canvas shadows gl={{ antialias: false, powerPreference: "high-performance" }}
  dpr={[1, 2]} style={{ width: '100vw', height: '100vh' }} >
      {/* <OrbitControls></OrbitControls> */}
      <PerspectiveCamera
        makeDefault
        position={[0,4, 18]}
        fov={45}
        near={0.1}
        far={1000}
        rotation={[-0.2, 0, 0]} // tilt down to see forward
      />
      <ambientLight intensity={1} />
      <directionalLight
  position={[10, 20, 10]} // Brought closer for better shadow resolution
  intensity={2}
  castShadow
  shadow-mapSize={[2048, 2048]}
  // Expand the "box" that calculates shadows
  shadow-camera-left={-20}
  shadow-camera-right={20}
  shadow-camera-top={20}
  shadow-camera-bottom={-20}
  shadow-camera-near={0.5}
  shadow-camera-far={50}
/>

      {/* <RollingPath gameSpeed={gameSpeed} cylinderRadius={cylinderRadius} isPlaying={isPlaying}/> */}
      {/* <StraightPath/> */}
      <InfinitePlatform ref={platformRef} isPlaying={isPlaying} />
       <Player
        isPlaying={isPlaying}
        coinRefs={platformRef.current?.getAllCoins() || []}
        setScore={setScore}
      />
    </Canvas>
    </>
  )
}
