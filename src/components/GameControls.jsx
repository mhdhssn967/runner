import { PlayCircleIcon, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import React, { useEffect } from 'react'
import { soundManager } from '../audio/SoundManager'

const GameControls = ({ isPlaying, setIsPlaying }) => {

    const wrapperStyle = {
  position: 'fixed',
  left: '50%',
  transform: 'translate(-50%, -50%)',
//   zIndex: -1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '18px',
}

const buttonStyle = {
  position: 'relative',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: 'radial-gradient(circle at top left, #fff2a8, #f4b400)',
  border: '4px solid #ffef9a',
  boxShadow: `
    inset 0 6px 10px rgba(255,255,255,0.6),
    inset 0 -8px 12px rgba(0,0,0,0.15),
    0 14px 0 #b57f00,
    0 26px 40px rgba(0,0,0,0.4)
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  marginBottom:'30px'
}

const shineStyle = {
  position: 'absolute',
  top: '12px',
  left: '16px',
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.45)',
  filter: 'blur(2px)',
}

const iconStyle = {
  width: '64px',
  height: '64px',
  color: '#fff',
  filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))',
}

const hintWrapper = {
  display: 'flex',
  gap: '14px',
  background: 'rgba(43, 42, 42, 0.55)',
  padding: '10px 14px',
  borderRadius: '16px',
  backdropFilter: 'blur(6px)',
  width:'390px'
}

const hintItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: '600',
  opacity: 0.9,
  fontWeight:'100'
}



useEffect(() => {
    // 🎵 Load all sounds once
    soundManager.load('coin', '/sounds/coin.ogg', 0.1)
    soundManager.load('jump', '/sounds/jump.ogg', 0.2)
    soundManager.load('death', '/sounds/death.ogg', 0.6)
    soundManager.load('gameover', '/sounds/game_over.ogg', 0.6)

    // 🎶 Background music (loop = true)
    soundManager.load('bg', '/sounds/bgm.ogg', 0.4, true)
  }, [])

  const startPlay = () => {
    soundManager.playLoop('bg') // ✅ start bg music
    setIsPlaying(true)
  }

  return (
    <div style={wrapperStyle}>
      {/* PLAY BUTTON */}
      <div
        style={buttonStyle}
        onClick={startPlay}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(8px)'
          e.currentTarget.style.boxShadow = '0 6px 0 #b57f00'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = `
            0 14px 0 #b57f00,
            0 26px 40px rgba(0,0,0,0.4)
          `
        }}
      >
        <PlayCircleIcon style={iconStyle} />
        <div style={shineStyle} />
      </div>

      {/* CONTROLS HELP */}
      <div style={hintWrapper}>
        <div style={hintItem}>
          <ArrowLeft size={28} /> Swipe Left move left
        </div>
        <div style={hintItem}>
          <ArrowRight size={28} /> Swipe Right move right
        </div>
        <div style={hintItem}>
          <ArrowUp size={28} /> Swipe Up jump
        </div>
      </div>
    </div>
  )
}

export default GameControls
