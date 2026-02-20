import { createInput } from './input.js';
import {
  createCar,
  resetCar,
  updateCar,
  checkCollisions,
  checkOffRoad,
  spawnObstacle,
} from './game.js';
import {
  initRenderer,
  buildLevel,
  drawCar,
  drawObstacles,
  drawCamera,
  render,
} from './renderer.js';
import { initAudio, playEngineSound, playCrashSound } from './audio.js';

// DOM elements
const canvas = document.getElementById('game-canvas');
const gameScreen = document.getElementById('game-screen');
const mainMenu = document.getElementById('main-menu');
const resultOverlay = document.getElementById('result-overlay');
const resultMessage = document.getElementById('result-message');
const speedDisplay = document.getElementById('speed-display');
const scoreDisplay = document.getElementById('score-display');
const flyDisplay = document.getElementById('fly-display');

// Game state
let input;
let car;
let obstacles = [];
let score = 0;
let distance = 0;
let gameActive = false;
let lastSpawnZ = 0;
let lastFrameTime = 0;

function resetGame() {
  car = createCar();
  resetCar(car);
  obstacles = [];
  score = 0;
  distance = 0;
  lastSpawnZ = 50; // Start spawning obstacles after 50 units
}

function spawnObstacles() {
  while (lastSpawnZ < car.z + 100) {
    obstacles.push(spawnObstacle(lastSpawnZ));
    lastSpawnZ += 20 + Math.random() * 20;
  }
}

function gameLoop(timestamp) {
  if (!gameActive) return;

  if (!lastFrameTime) lastFrameTime = timestamp;
  const dt = Math.min(timestamp - lastFrameTime, 33);
  lastFrameTime = timestamp;

  // Get input
  const moveLeft = input.getLeft();
  const moveRight = input.getRight();
  const doFly = input.getFly();

  console.log('INPUT:', { moveLeft, moveRight, doFly, lane: car.lane });

  // Update car
  updateCar(car, dt, moveLeft, moveRight, doFly);

  // Spawn obstacles
  spawnObstacles();

  // Remove far obstacles
  obstacles = obstacles.filter(o => o.z < car.z + 100);

  // Check collisions
  if (checkCollisions(car, obstacles)) {
    gameActive = false;
    playCrashSound();
    resultMessage.textContent = `Game Over! Distance: ${Math.round(car.z)}m | Score: ${score}`;
    resultOverlay.classList.remove('hidden');
    return;
  }

  if (checkOffRoad(car)) {
    gameActive = false;
    playCrashSound();
    resultMessage.textContent = `Off Road! Distance: ${Math.round(car.z)}m | Score: ${score}`;
    resultOverlay.classList.remove('hidden');
    return;
  }

  // Update score
  score += Math.round(car.z / 100);
  
  // Update HUD
  speedDisplay.textContent = '13 km/h';
  scoreDisplay.textContent = `Score: ${score}`;
  flyDisplay.textContent = car.flying ? `Flying: ${Math.round((car.flyTimer / car.maxFlyTime) * 100)}%` : 'Press SPACE to fly';

  // Render
  drawCar(car);
  drawObstacles(obstacles);
  drawCamera(car);
  render();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  resetGame();
  gameActive = true;
  lastFrameTime = 0;
  gameScreen.classList.remove('hidden');
  mainMenu.classList.add('hidden');
  resultOverlay.classList.add('hidden');
  requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('btn-play').addEventListener('click', startGame);
document.getElementById('btn-retry').addEventListener('click', startGame);

document.getElementById('btn-menu').addEventListener('click', () => {
  gameActive = false;
  mainMenu.classList.remove('hidden');
  gameScreen.classList.add('hidden');
});

// Initialize
initRenderer(canvas);
buildLevel();
initAudio();
input = createInput();
playEngineSound(0.5);

console.log('Game initialized!');
mainMenu.classList.remove('hidden');
gameScreen.classList.add('hidden');
