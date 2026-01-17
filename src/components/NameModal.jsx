import { useState } from 'react'
import './NameModal.css'

const NameModal = ({ onSave }) => {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    if (name.trim().length < 2) return
    onSave(name.trim())
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Enter your name</h2>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleSubmit}>Play</button>
      </div>
    </div>
  )
}

export default NameModal
