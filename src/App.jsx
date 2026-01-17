import React, { useState, useEffect } from 'react'
import Game from './components/Game'
import NameModal from './components/NameModal'
import './App.css'
import { useGLTF } from '@react-three/drei'

import { auth, db } from '../firebaseConfig'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeadState, setIsDeadState] = useState(false)

  const [companyId, setCompanyId] = useState(null)
  const [branchId, setBranchId] = useState(null)

  const [user, setUser] = useState(null)
  const [playerName, setPlayerName] = useState(null)

  const [showNameModal, setShowNameModal] = useState(false)
  const [canRenderGame, setCanRenderGame] = useState(false)
  const [loading, setLoading] = useState(true)

  // Preload models
  useGLTF.preload('/banananew.glb')
  useGLTF.preload('/coin.glb')

  // Read QR params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCompanyId(params.get('company'))
    setBranchId(params.get('branch'))
  }, [])

  // Auth + username check
  useEffect(() => {
  // ⛔ Do nothing until we know companyId state
  if (companyId === undefined) return

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      await signInAnonymously(auth)
      return
    }

    setUser(firebaseUser)

    // 🔀 Decide Firestore path
    const userRef = companyId
      ? doc(db, 'companies', companyId, 'users', firebaseUser.uid)
      : doc(db, 'users', firebaseUser.uid) // fallback

    const snap = await getDoc(userRef)

    if (snap.exists() && snap.data()?.player?.username) {
      setPlayerName(snap.data().player.username)
      setCanRenderGame(true)
    } else {
      setShowNameModal(true)
    }

    setLoading(false)
  })

  return () => unsubscribe()
}, [companyId])

  // Save name
  const handleSaveName = async (name) => {
  if (!user) return

  const userRef = companyId
    ? doc(db, 'companies', companyId, 'users', user.uid)
    : doc(db, 'users', user.uid)

  await setDoc(
    userRef,
    {
      player: {
        username: name,
      },
    },
    { merge: true }
  )

  setPlayerName(name)
  setShowNameModal(false)
  setCanRenderGame(true)
}


  if (loading) return null

  return (
    <div>
      {showNameModal && <NameModal onSave={handleSaveName} />}

      {canRenderGame && (
        <Game
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isDeadState={isDeadState}
          setIsDeadState={setIsDeadState}
          companyId={companyId}
          branchId={branchId}
          playerName={playerName}
        />
      )}

      <div className="bg"></div>
    </div>
  )
}

export default App
