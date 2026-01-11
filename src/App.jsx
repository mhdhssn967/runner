import React, { useState } from 'react'
import Game from './components/Game'
import './App.css'
import { useGLTF } from '@react-three/drei'

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeadState, setIsDeadState] = useState(false)

  
useGLTF.preload('/banana.glb')
useGLTF.preload('/coin.glb')
useGLTF.preload('/platform.glb')

  return (
    <div>
      <Game
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setIsDeadState={setIsDeadState}
        isDeadState={isDeadState}
      />

      
      <div className="bg"></div>
    </div>
  )
}

export default App
