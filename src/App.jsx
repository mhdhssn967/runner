import React, { useState, useEffect } from 'react'
import Game from './components/Game'
import './App.css'
import { useGLTF } from '@react-three/drei'

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeadState, setIsDeadState] = useState(false)

  // 🔹 NEW: outlet context
  const [companyId, setCompanyId] = useState(null)
  const [branchId, setBranchId] = useState(null)

  // Preload models
  useGLTF.preload('/banana.glb')
  useGLTF.preload('/coin.glb')

  // 🔹 Read QR params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const company = params.get('company')
    const branch = params.get('branch')

    setCompanyId(company)
    setBranchId(branch)

    console.log('Loaded from QR:', { company, branch })
  }, [])

  return (
    <div>
      <Game
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setIsDeadState={setIsDeadState}
        isDeadState={isDeadState}
        companyId={companyId}
        branchId={branchId}
      />

      <div className="bg"></div>
    </div>
  )
}

export default App
