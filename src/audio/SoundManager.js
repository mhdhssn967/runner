class SoundManager {
  constructor() {
    this.sounds = {}
    this.enabled = true
    this.volume = 1
  }

  load(name, src, volume = 1) {
    const audio = new Audio(src)
    audio.volume = volume * this.volume
    audio.preload = 'auto'
    this.sounds[name] = audio
  }

  play(name) {
    if (!this.enabled) return

    const sound = this.sounds[name]
    if (!sound) return

    // clone for overlapping plays
    const clone = sound.cloneNode()
    clone.volume = sound.volume
    clone.play().catch(() => {})
  }

  mute(value) {
    this.enabled = !value
  }

  setVolume(value) {
    this.volume = value
    Object.values(this.sounds).forEach(
      (audio) => (audio.volume = value)
    )
  }
}

export const soundManager = new SoundManager()
