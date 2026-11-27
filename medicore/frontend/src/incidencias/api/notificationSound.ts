let audio: AudioContext | undefined
let player: HTMLAudioElement | undefined
let nativeReady = false
let priming: Promise<void> | undefined
const silence = '/medicore-silencio.wav'
const chime = '/medicore-aviso.wav'

export function prefetchNotificationSound() {
  if (!player) {
    player = new Audio(silence)
    player.preload = 'auto'
  }
  return player
}

export function armNotificationSound() {
  if (!nativeReady && !priming) {
    const element = prefetchNotificationSound()
    if (!element.src.endsWith(silence)) element.src = silence

    // This track lets the browser authorize this same player without an audible test tone.
    priming = element.play().then(() => {
      nativeReady = true
      element.pause()
      element.src = chime
    }).catch(() => {}).finally(() => { priming = undefined })
  }

  if (typeof AudioContext === 'undefined') return
  try {
    audio ??= new AudioContext()
    if (audio.state !== 'running') void audio.resume().catch(() => {})
  } catch {
    // Visual notifications remain available when the browser blocks audio.
  }
}

export async function playNotificationSound(): Promise<boolean> {
  try {
    await priming
    const element = prefetchNotificationSound()
    if (!element.src.endsWith(chime)) element.src = chime
    element.currentTime = 0
    await element.play()
    nativeReady = true
    return true
  } catch {
    // Try the Web Audio tone if media playback is blocked or unavailable.
  }
  return playSynthesizedTone()
}

function playSynthesizedTone() {
  if (!audio || audio.state !== 'running') return false
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
  return true
}
