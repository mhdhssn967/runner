import React, { useState } from 'react'
import Game from './components/Game'
import GameControls from './components/GameControls'
import './App.css'

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeadState, setIsDeadState] = useState(false)

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
