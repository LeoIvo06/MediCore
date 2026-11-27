let audio: AudioContext | undefined

export function armNotificationSound() {
  if (typeof AudioContext === 'undefined') return
  try {
    audio ??= new AudioContext()
    if (audio.state !== 'running') void audio.resume().catch(() => {})
  } catch {
    // Visual notifications remain available when the browser blocks audio.
  }
}

export function playNotificationSound() {
  if (!audio || audio.state !== 'running') return
  const oscillator = audio.createOscillator()
  const volume = audio.createGain()
  const now = audio.currentTime
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(660, now)
  oscillator.frequency.setValueAtTime(880, now + 0.08)
  volume.gain.setValueAtTime(0.001, now)
  volume.gain.exponentialRampToValueAtTime(0.1, now + 0.016)
  volume.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  oscillator.connect(volume).connect(audio.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.21)
  oscillator.onended = () => { oscillator.disconnect(); volume.disconnect() }
}
