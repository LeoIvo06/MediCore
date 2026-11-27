let audio: AudioContext | undefined
let waveform: Promise<ArrayBuffer | null> | undefined
let decoded = false
let chime: AudioBuffer | undefined
let nativePlayer: HTMLAudioElement | undefined
let nativeStarted = false
const soundPath = '/medicore-aviso.wav'
const silentPath = '/medicore-silencio.wav'

export function prefetchNotificationSound() {
  if (typeof AudioContext === 'undefined') {
    if (!nativePlayer) {
      nativePlayer = new Audio(silentPath)
      nativePlayer.preload = 'auto'
    }
    return
  }
  waveform ??= fetch(soundPath)
    .then((response) => response.ok ? response.arrayBuffer() : null)
    .catch(() => null)
}

export function armNotificationSound() {
  if (typeof AudioContext === 'undefined') {
    prefetchNotificationSound()
    const player = nativePlayer
    if (player && !nativeStarted && player.src.endsWith(silentPath)) {
      nativeStarted = true
      void player.play().then(() => {
        if (player.src.endsWith(silentPath)) {
          player.pause()
          player.src = soundPath
        }
      }).catch(() => { nativeStarted = false })
    }
    return
  }
  try {
    const context = (audio ??= new AudioContext())
    if (context.state !== 'running') void context.resume().catch(() => {})
    if (!decoded) {
      decoded = true
      prefetchNotificationSound()
      void waveform?.then(async (data) => {
        if (data) chime = await context.decodeAudioData(data)
      }).catch(() => {})
    }
  } catch {
    // The bell indicator still works if the browser cannot start audio.
  }
}

export function playNotificationSound() {
  if (nativePlayer) {
    const player = nativePlayer
    if (!player.src.endsWith(soundPath)) player.src = soundPath
    player.currentTime = 0
    void player.play().catch(() => {})
    return
  }
  if (!audio || audio.state !== 'running') return
  if (chime) {
    const source = audio.createBufferSource()
    source.buffer = chime
    source.connect(audio.destination)
    source.onended = () => source.disconnect()
    source.start()
    return
  }

  const oscillator = audio.createOscillator()
  const volume = audio.createGain()
  const now = audio.currentTime
  oscillator.frequency.setValueAtTime(660, now)
  oscillator.frequency.setValueAtTime(880, now + 0.08)
  volume.gain.setValueAtTime(0.001, now)
  volume.gain.exponentialRampToValueAtTime(0.35, now + 0.016)
  volume.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  oscillator.connect(volume).connect(audio.destination)
  oscillator.onended = () => { oscillator.disconnect(); volume.disconnect() }
  oscillator.start(now)
  oscillator.stop(now + 0.21)
}
