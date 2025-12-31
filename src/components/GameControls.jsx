import { PlayCircleIcon } from 'lucide-react'
import React from 'react'

const GameControls = ({ isPlaying, setIsPlaying }) => {
    return (
        <div style={wrapperStyle}>
            <div
                style={buttonStyle}
                onClick={() => setIsPlaying(true)}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(4px)'
                    e.currentTarget.style.boxShadow = '0 6px 0 #c18f00'
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `
    0 10px 0 #c18f00,
    0 18px 30px rgba(0,0,0,0.35)
  `
                }}

            >
                <PlayCircleIcon style={iconStyle} />
            </div>
        </div>
    )
}

export default GameControls

// ---------- styles ----------

const wrapperStyle = {
    position: 'fixed',
    top: '75%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
}

const buttonStyle = {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at top left, #ffd84d, #f4b400)',
    boxShadow: `
    0 10px 0 #c18f00,
    0 18px 30px rgba(0,0,0,0.35)
  `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
}

const iconStyle = {
    width: '60px',
    height: '60px',
    color: '#fff',
    filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.4))',
}
