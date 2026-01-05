class SoundManager {
  constructor() {
    this.sounds = {}
    this.enabled = true
    this.volume = 1
  }

  load(name, src, volume = 1, loop = false) {
    if (this.sounds[name]) return // ✅ prevent reloading

    const audio = new Audio(src)
    audio.volume = volume * this.volume
    audio.loop = loop
    audio.preload = 'auto'

    this.sounds[name] = audio
  }

  play(name) {
    if (!this.enabled) return

    const sound = this.sounds[name]
    if (!sound) return

    // 🔊 clone ONLY for SFX
    const clone = sound.cloneNode()
    clone.volume = sound.volume
    clone.play().catch(() => {})
  }

  playLoop(name) {
    if (!this.enabled) return

    const sound = this.sounds[name]
    if (!sound) return

    if (!sound.paused) return // ✅ already playing

    sound.currentTime = 0
    sound.play().catch(() => {})
  }

  stop(name) {
    const sound = this.sounds[name]
    if (!sound) return

    sound.pause()
    sound.currentTime = 0
  }

  mute(value) {
    this.enabled = !value
    Object.values(this.sounds).forEach((a) => (a.muted = value))
  }

  setVolume(value) {
    this.volume = value
    Object.values(this.sounds).forEach(
      (audio) => (audio.volume = value)
    )
  }
}

export const soundManager = new SoundManager()
