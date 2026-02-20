/**
 * Main: screens, game state, loop, persistence
 */

import { LEVELS } from './levels.js';
import {
  getStoredSteeringMode,
  setStoredSteeringMode,
  createCombinedInput,
} from './input.js';
import {
  createCarState,
  resetCarToSpawn,
  updateCarPhysics,
  carVsObstacles,
  carLeavesRoad,
  carReachedEnd,
  getSpeedKmh,
} from './game.js';
import {
  initRenderer,
  buildLevel,
  updateCarVisual,
  updateCameraFollow,
  render,
} from './renderer.js';

// --- DOM ---
const screens = {
  main: document.getElementById('main-menu'),
  settings: document.getElementById('settings'),
  levelSelect: document.getElementById('level-select'),
  game: document.getElementById('game-screen'),
};
const levelButtonsEl = document.getElementById('level-buttons');
const resultOverlay = document.getElementById('result-overlay');
const resultMessage = document.getElementById('result-message');
const touchControls = document.getElementById('touch-controls');
const speedDisplay = document.getElementById('speed-display');

function showScreen(name) {
  Object.keys(screens).forEach((k) => {
    screens[k].classList.toggle('hidden', k !== name);
  });
}

// --- Level select: all levels always playable ---
function refreshLevelSelect() {
  levelButtonsEl.innerHTML = '';
  for (let i = 0; i < LEVELS.length; i++) {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    btn.textContent = i + 1;
    btn.addEventListener('click', () => startLevel(i));
    levelButtonsEl.appendChild(btn);
  }
}

// --- Settings UI ---
function refreshSettingsUI() {
  const mode = getStoredSteeringMode();
  document.getElementById('steer-touch').classList.toggle('active', mode === 'touch');
  document.getElementById('steer-tilt').classList.toggle('active', mode === 'tilt');
}

document.getElementById('steer-touch').addEventListener('click', () => {
  setStoredSteeringMode('touch');
  refreshSettingsUI();
});
document.getElementById('steer-tilt').addEventListener('click', () => {
  setStoredSteeringMode('tilt');
  refreshSettingsUI();
});

// --- Navigation ---
document.getElementById('btn-play').addEventListener('click', () => {
  refreshLevelSelect();
  showScreen('levelSelect');
});
document.getElementById('btn-settings').addEventListener('click', () => {
  refreshSettingsUI();
  showScreen('settings');
});
document.getElementById('btn-settings-back').addEventListener('click', () => showScreen('main'));
document.getElementById('btn-level-back').addEventListener('click', () => showScreen('main'));

// --- Game state ---
let canvas;
let gameInput;
let car;
let currentLevelIndex = 0;
let gameRunning = false;
let gamePaused = false;
let lastTime = 0;
let rafId;

function startLevel(levelIndex) {
  currentLevelIndex = levelIndex;
  const levelData = LEVELS[levelIndex];
  if (!levelData) return;

  if (!canvas) {
    canvas = document.getElementById('game-canvas');
    initRenderer(canvas);
  }

  if (gameInput) gameInput.destroy();
  const steeringMode = getStoredSteeringMode();
  gameInput = createCombinedInput(steeringMode);

  // Show touch controls so mobile can use gas/brake; steer buttons only matter when mode is touch
  touchControls.classList.remove('hidden');

  buildLevel(levelData);
  car = createCarState();
  resetCarToSpawn(car, levelData.spawn);

  resultOverlay.classList.add('hidden');
  resultOverlay.classList.remove('win', 'fail');
  gameRunning = true;
  gamePaused = false;
  showScreen('game');
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function endLevel(won) {
  gameRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  resultOverlay.classList.remove('hidden');
  resultOverlay.classList.toggle('win', won);
  resultOverlay.classList.toggle('fail', !won);
  resultMessage.textContent = won ? 'Level complete!' : 'Crashed – Retry';
}

function gameLoop(now) {
  rafId = requestAnimationFrame(gameLoop);
  if (!gameRunning || gamePaused) return;

  const dt = Math.min(now - lastTime, 50);
  lastTime = now;

  const steer = gameInput.getSteer();
  const accel = gameInput.getAccel();
  const brake = gameInput.getBrake();

  updateCarPhysics(car, steer, accel, brake, dt);

  const levelData = LEVELS[currentLevelIndex];
  if (carReachedEnd(car, levelData)) {
    endLevel(true);
    return;
  }
  if (carVsObstacles(car, levelData.obstacles)) {
    endLevel(false);
    return;
  }
  if (carLeavesRoad(car, levelData)) {
    endLevel(false);
    return;
  }

  updateCarVisual(car);
  updateCameraFollow(car);
  speedDisplay.textContent = getSpeedKmh(car) + ' km/h';
  render();
}

document.getElementById('btn-restart').addEventListener('click', () => {
  startLevel(currentLevelIndex);
});
document.getElementById('btn-pause').addEventListener('click', () => {
  gamePaused = !gamePaused;
  document.getElementById('btn-pause').textContent = gamePaused ? 'Resume' : 'Pause';
});
document.getElementById('btn-retry').addEventListener('click', () => {
  startLevel(currentLevelIndex);
});
document.getElementById('btn-level-select').addEventListener('click', () => {
  if (gameInput) gameInput.destroy();
  gameRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  refreshLevelSelect();
  showScreen('levelSelect');
});

// Start on main menu
refreshSettingsUI();
showScreen('main');
