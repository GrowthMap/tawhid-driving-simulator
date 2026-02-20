/**
 * Audio system: background music, engine sound, coin pickup, crash
 * Uses Web Audio API to synthesize sounds procedurally
 */

let audioContext = null;
let masterGain = null;
let engineOscillator = null;
let engineGain = null;
let engineFilter = null;
let musicTimeout = null;

export function initAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(audioContext.destination);
  startBackgroundMusic();
}

function startBackgroundMusic() {
  if (!audioContext) return;
  // Simple looping bass line
  const bassFreqs = [110, 110, 132, 110]; // A2, A2, C#3, A2
  const beatDuration = 0.4;
  let beatIndex = 0;
  
  function playBeat() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const freq = bassFreqs[beatIndex % bassFreqs.length];
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + beatDuration);
    
    osc.start(now);
    osc.stop(now + beatDuration);
    
    beatIndex++;
    musicTimeout = setTimeout(playBeat, beatDuration * 1000);
  }
  playBeat();
}

export function playEngineSound(speed) {
  if (!audioContext || speed < 0.2) {
    if (engineGain) {
      engineGain.gain.setTargetAtTime(0.001, audioContext.currentTime, 0.15);
    }
    return;
  }

  const now = audioContext.currentTime;
  if (!engineOscillator || !engineGain) {
    engineOscillator = audioContext.createOscillator();
    engineFilter = audioContext.createBiquadFilter();
    engineGain = audioContext.createGain();
    
    engineOscillator.type = 'triangle';
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 800;
    engineFilter.Q.value = 1;
    
    engineOscillator.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(masterGain);
    
    engineOscillator.start();
  }

  // Smooth frequency change based on speed (200-800 Hz)
  const baseFreq = 200 + speed * 15;
  engineOscillator.frequency.setTargetAtTime(baseFreq, now, 0.08);
  
  // Filter increases with speed
  engineFilter.frequency.setTargetAtTime(600 + speed * 40, now, 0.1);
  
  // Subtle volume based on speed
  const volume = Math.min(0.04, speed * 0.02);
  engineGain.gain.setTargetAtTime(volume, now, 0.1);
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
