import React, { useState } from 'react'
import Game from './components/Game'
import GameControls from './components/GameControls'
import './App.css'

const App = () => {

  const [isPlaying,setIsPlaying]=useState(false)

  return (
    <div>
      <Game isPlaying={isPlaying}/>
      {!isPlaying&&<>
        <GameControls setIsPlaying={setIsPlaying} isPlaying={isPlaying}/>
        {/* <img className='splash-img' src="./splash.png" alt="" /> */}
      </>}
      <div className='bg'></div>
    </div>
  )
}

export default App
