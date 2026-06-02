// Web Audio による合成効果音。アセット不要・ミュート対応。
import { useSoundStore } from '../store/soundStore'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur = 0.12, type: OscillatorType = 'square', gain = 0.06): void {
  if (useSoundStore.getState().muted) return
  const c = audio()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  osc.connect(g).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur)
}

const SIMON_PAD = [330, 392, 494, 587]

export const sound = {
  click: () => tone(440, 0.05, 'square', 0.04),
  move: () => tone(300, 0.05, 'triangle', 0.04),
  merge: () => tone(560, 0.08, 'square', 0.06),
  eat: () => tone(720, 0.07, 'square', 0.06),
  flip: () => tone(500, 0.05, 'sine', 0.05),
  match: () => tone(740, 0.1, 'square', 0.06),
  toggle: () => tone(360, 0.05, 'triangle', 0.05),
  hit: () => tone(220, 0.04, 'square', 0.05),
  brick: () => tone(620, 0.04, 'square', 0.05),
  wrong: () => tone(120, 0.25, 'sawtooth', 0.06),
  pad: (i: number) => tone(SIMON_PAD[i] ?? 440, 0.3, 'square', 0.07),
  gameover: () => {
    tone(300, 0.18, 'sawtooth', 0.06)
    setTimeout(() => tone(180, 0.32, 'sawtooth', 0.06), 130)
  },
  win: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'square', 0.06), i * 110))
  },
}
