/**
 * Audio system: engine sound, coin pickup, crash, bgm
 * Uses Web Audio API to synthesize sounds procedurally
 */

let audioContext = null;
let engineOscillator = null;
let engineGain = null;
let masterGain = null;

export function initAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioContext.destination);
}

export function playEngineSound(speed) {
  if (!audioContext) return;
  
  // Stop existing oscillator
  if (engineOscillator) {
    try {
      engineOscillator.stop();
    } catch (e) {}
  }

  if (speed < 0.5) {
    if (engineGain) engineGain.gain.value = 0;
    return;
  }

  const baseFreq = 150 + speed * 30; // 150-1500 Hz range based on speed
  
  if (!engineOscillator || !engineGain) {
    engineOscillator = audioContext.createOscillator();
    engineGain = audioContext.createGain();
    engineOscillator.connect(engineGain);
    engineGain.connect(masterGain);
    engineOscillator.type = 'sawtooth';
    engineOscillator.start();
  }

  engineOscillator.frequency.setTargetAtTime(baseFreq, audioContext.currentTime, 0.05);
  engineGain.gain.setTargetAtTime(speed * 0.08, audioContext.currentTime, 0.05);
}

export function stopEngineSound() {
  if (engineGain) {
    engineGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
  }
}

export function playCoinPickup() {
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.setTargetAtTime(1200, now, 0.05);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  osc.start(now);
  osc.stop(now + 0.3);
}

export function playCrashSound() {
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
  
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(200, now);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  osc.start(now);
  osc.stop(now + 0.5);
}

export function playWarningBeep() {
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  osc.start(now);
  osc.stop(now + 0.1);
}
