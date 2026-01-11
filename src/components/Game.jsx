import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { Perf } from 'r3f-perf'
import InfinitePlatform from './InfinitePlatform'
import Player from './Player'
import HUD from './HUD'
import LoadingScreen from './LoadingScreen'
import GameControls from './GameControls'

import { Html } from '@react-three/drei'

export default function Game({ isDeadState,isPlaying, setIsPlaying, setIsDeadState }) {
  const platformRef = useRef()
  

  return (
    <>
    
      <HUD />

      <Canvas
        shadows
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ width: '100vw', height: '100vh' }}
      >
                {/* <Perf position="top-left" /> */}

        {/* ⏳ BLOCK RENDER UNTIL ASSETS LOAD */}
        <Suspense fallback={<LoadingScreen />}>
        {(!isPlaying && !isDeadState) && (
        <Html>
          <div style={{height:'60vh',display:'flex',flexDirection:'column',justifyContent:'end'}}>
            <GameControls setIsPlaying={setIsPlaying} isPlaying={isPlaying} />
          </div>
        </Html>
      )}

          <PerspectiveCamera
            makeDefault
            position={[0, 4, 18]}
            fov={45}
            near={0.1}
            far={1000}
            rotation={[-0.2, 0, 0]}
          />

          <ambientLight intensity={1} />

          <directionalLight
            position={[10, 20, 10]}
            intensity={2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
          />

          <InfinitePlatform
            ref={platformRef}
            isPlaying={isPlaying}
          />

          <Player
            isPlaying={isPlaying}
            obstacleRefs={platformRef.current?.getAllObstacles()}
            coinRefs={platformRef.current?.getAllCoins()}
            platformRef={platformRef}
            setIsPlaying={setIsPlaying}
            setIsDeadState={setIsDeadState}
          />
        </Suspense>
      </Canvas>
    </>
  )
}
