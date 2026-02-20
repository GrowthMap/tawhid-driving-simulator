/**
 * Main: Endless game state, loop, persistence, score tracking
 */

import { ENDLESS_CONFIG, generateObstacles } from './levels.js';
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
  getSpeedKmh,
} from './game.js';
import {
  initRenderer,
  buildLevel,
  updateCarVisual,
  updateCameraFollow,
  render,
  addObstacle,
  addCoin,
  updateCoins,
} from './renderer.js';
import { carVsCoin, generateCoinsForSegment } from './coins.js';
import {
  initAudio,
  playEngineSound,
  playCoinPickup,
  playCrashSound,
} from './audio.js';

// --- DOM ---
const screens = {
  main: document.getElementById('main-menu'),
  settings: document.getElementById('settings'),
  game: document.getElementById('game-screen'),
};
const resultOverlay = document.getElementById('result-overlay');
const resultMessage = document.getElementById('result-message');
const touchControls = document.getElementById('touch-controls');
const speedDisplay = document.getElementById('speed-display');
const scoreDisplay = document.getElementById('score-display');
const coinsDisplay = document.getElementById('coins-display');

function showScreen(name) {
  Object.keys(screens).forEach((k) => {
    screens[k].classList.toggle('hidden', k !== name);
  });
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
  startGame();
});
document.getElementById('btn-settings').addEventListener('click', () => {
  refreshSettingsUI();
  showScreen('settings');
});
document.getElementById('btn-settings-back').addEventListener('click', () => showScreen('main'));

// --- Game state ---
let canvas;
let gameInput;
let car;
let gameRunning = false;
let gamePaused = false;
let lastTime = 0;
let rafId;

// Endless game state
let obstacles = [];
let coins = [];
let score = 0;
let coinsCollected = 0;
let lastSegmentZ = -100;

function startGame() {
  if (!canvas) {
    canvas = document.getElementById('game-canvas');
    initRenderer(canvas);
  }

  initAudio();

  if (gameInput) gameInput.destroy();
  const steeringMode = getStoredSteeringMode();
  gameInput = createCombinedInput(steeringMode);

  touchControls.classList.remove('hidden');
  
  buildLevel(ENDLESS_CONFIG.roadWidth);
  car = createCarState();
  resetCarToSpawn(car, ENDLESS_CONFIG.spawn);

  // Initialize endless game
  obstacles = [];
  coins = [];
  score = 0;
  coinsCollected = 0;
  lastSegmentZ = -100;
  
  // Generate first segments
  generateNextSegment();

  resultOverlay.classList.add('hidden');
  resultOverlay.classList.remove('win', 'fail');
  gameRunning = true;
  gamePaused = false;
  showScreen('game');
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function generateNextSegment() {
  const zStart = lastSegmentZ;
  const zEnd = zStart + 100;
  
  const newObstacles = generateObstacles(zStart, zEnd, ENDLESS_CONFIG.roadWidth);
  newObstacles.forEach((o) => {
    obstacles.push(o);
    addObstacle(o);
  });

  const newCoins = generateCoinsForSegment(zStart, zEnd, ENDLESS_CONFIG.roadWidth);
  newCoins.forEach((c) => {
    coins.push(c);
    addCoin(c);
  });

  lastSegmentZ = zEnd;
}

function endGame() {
  gameRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  playEngineSound(0);
  playCrashSound();
  
  resultOverlay.classList.remove('hidden');
  resultOverlay.classList.add('fail');
  resultMessage.textContent = `Crashed! Score: ${score} | Coins: ${coinsCollected}`;
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

  // Update engine sound based on speed
  const kmh = getSpeedKmh(car);
  playEngineSound(kmh / 50); // Normalized 0-1

  // Score increases with distance traveled
  score += Math.round(kmh / 10);

  // Collect coins
  coins.forEach((coin) => {
    if (!coin.collected && carVsCoin(car, coin)) {
      coin.collected = true;
      coinsCollected++;
      playCoinPickup();
      score += 100;
    }
  });

  // Check collisions
  if (carVsObstacles(car, obstacles)) {
    endGame();
    return;
  }
  
  if (carLeavesRoad(car, ENDLESS_CONFIG.roadWidth)) {
    endGame();
    return;
  }

  // Generate new segments as needed
  if (car.z > lastSegmentZ - 50) {
    generateNextSegment();
  }

  // Clean up old obstacles and coins
  obstacles = obstacles.filter((o) => o.z > car.z - 50);
  coins = coins.filter((c) => !c.collected && c.z > car.z - 50);

  updateCarVisual(car);
  updateCameraFollow(car);
  updateCoins(coins);
  speedDisplay.textContent = kmh + ' km/h';
  scoreDisplay.textContent = 'Score: ' + score;
  coinsDisplay.textContent = 'Coins: ' + coinsCollected;
  render();
}

document.getElementById('btn-restart').addEventListener('click', () => {
  startGame();
});
document.getElementById('btn-pause').addEventListener('click', () => {
  gamePaused = !gamePaused;
  document.getElementById('btn-pause').textContent = gamePaused ? 'Resume' : 'Pause';
});
document.getElementById('btn-retry').addEventListener('click', () => {
  startGame();
});
document.getElementById('btn-level-select').addEventListener('click', () => {
  if (gameInput) gameInput.destroy();
  gameRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  showScreen('main');
});

// Start on main menu
refreshSettingsUI();
showScreen('main');
