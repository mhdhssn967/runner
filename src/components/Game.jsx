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
import Player2 from './Player2'
import useGestureInput from '../gesture/useGestureInput'

export default function Game({playerName, isDeadState,isPlaying, setIsPlaying, setIsDeadState, companyId,branchId  }) {
  const platformRef = useRef()
  const videoRef = useRef()
const canvasRef = useRef()


useGestureInput(videoRef, canvasRef, {
  onMoveLeft: () => gestureControlsRef.current.moveRight?.(),
  onMoveRight: () => gestureControlsRef.current.moveLeft?.(),
  onJump: () => gestureControlsRef.current.jump?.()
})

const gestureControlsRef = useRef({})

  return (
    <>
    
      <HUD companyId={companyId}
        branchId={branchId}
        playerName={playerName}
        />

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

          <Player2
            isPlaying={isPlaying}
            obstacleRefs={platformRef.current?.getAllObstacles()}
            coinRefs={platformRef.current?.getAllCoins()}
            platformRef={platformRef}
            setIsPlaying={setIsPlaying}
            setIsDeadState={setIsDeadState}
            companyId={companyId}
            setGestureControls={(controls) => {
    gestureControlsRef.current = controls
  }}
          />
        </Suspense>
      </Canvas>
      <video
  ref={videoRef}
  style={{ display: "none" }}
  playsInline
/>

<canvas
  ref={canvasRef}
  width={640}
  height={480}
  style={{
    position: "absolute",
    top: 20,
    left: 20,
    width: "300px",
    height: "220px",
    zIndex: 10
  }}
/>
    </>
  )
}