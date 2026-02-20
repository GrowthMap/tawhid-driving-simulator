/**
 * Endless road generation: procedural obstacles and coins
 */

// Endless game configuration
export const ENDLESS_CONFIG = {
  roadWidth: 12,
  spawn: { x: 0, z: -50, heading: 0 },
};

// Generate obstacles for a segment of the road
export function generateObstacles(zStart, zEnd, roadWidth) {
  const obstacles = [];
  const obstacleDensity = 0.08; // Obstacles per unit distance
  const targetCount = Math.ceil((zEnd - zStart) * obstacleDensity);
  
  for (let i = 0; i < targetCount; i++) {
    const z = zStart + Math.random() * (zEnd - zStart);
    const side = Math.random();
    let x;
    
    // Place obstacles on left, center, or right
    if (side < 0.33) {
      x = -roadWidth * 0.25 + Math.random() * 2;
    } else if (side < 0.66) {
      x = roadWidth * 0.25 + Math.random() * 2;
    } else {
      x = Math.random() * 4 - 2;
    }
    
    obstacles.push({
      x,
      z,
      width: 2 + Math.random() * 0.5,
      depth: 2 + Math.random() * 0.5,
    });
  }
  
  return obstacles;
}

// Legacy levels (kept for compatibility, but game uses endless mode)
export const LEVELS = [
  // Level 1: obstacles alternate left / center / right so you must steer
  {
    roadWidth: 12,
    roadLength: 80,
    spawn: { x: 0, z: -35, heading: 0 },
    obstacles: [
      { x: 3, z: -20, width: 2, depth: 2 },
      { x: 0, z: -10, width: 2, depth: 2 },
      { x: -3.5, z: 0, width: 2, depth: 2 },
      { x: 0, z: 12, width: 2, depth: 2 },
      { x: 3, z: 24, width: 2, depth: 2 },
      { x: -2.5, z: 30, width: 2, depth: 2 },
    ],
  },
  // Level 2: more obstacles, center blocked more often
  {
    roadWidth: 10,
    roadLength: 90,
    spawn: { x: 0, z: -40, heading: 0 },
    obstacles: [
      { x: 0, z: -32, width: 2, depth: 2 },
      { x: -3, z: -24, width: 2, depth: 2 },
      { x: 2.5, z: -16, width: 2, depth: 2 },
      { x: 0, z: -8, width: 2, depth: 2 },
      { x: 3, z: 0, width: 2, depth: 2 },
      { x: -2.5, z: 8, width: 2, depth: 2 },
      { x: 0, z: 16, width: 2, depth: 2 },
      { x: -3, z: 24, width: 2, depth: 2 },
      { x: 2, z: 32, width: 2, depth: 2 },
    ],
  },
  // Level 3: tighter zigzag
  {
    roadWidth: 9,
    roadLength: 100,
    spawn: { x: 0, z: -45, heading: 0 },
    obstacles: [
      { x: 2.2, z: -38, width: 2, depth: 2 },
      { x: 0, z: -30, width: 2, depth: 2 },
      { x: -2.2, z: -22, width: 2, depth: 2 },
      { x: 0, z: -14, width: 2, depth: 2 },
      { x: 2, z: -6, width: 2, depth: 2 },
      { x: -2, z: 2, width: 2, depth: 2 },
      { x: 0, z: 10, width: 2, depth: 2 },
      { x: 2.2, z: 18, width: 2, depth: 2 },
      { x: -2.2, z: 26, width: 2, depth: 2 },
      { x: 0, z: 34, width: 2, depth: 2 },
    ],
  },
  // Level 4: narrow gaps, center and sides
  {
    roadWidth: 8,
    roadLength: 110,
    spawn: { x: 0, z: -50, heading: 0 },
    obstacles: [
      { x: 0, z: -44, width: 2, depth: 2 },
      { x: -2.2, z: -38, width: 2, depth: 2 },
      { x: 2, z: -32, width: 2, depth: 2 },
      { x: 0, z: -26, width: 2, depth: 2 },
      { x: 2.2, z: -20, width: 2, depth: 2 },
      { x: -2, z: -14, width: 2, depth: 2 },
      { x: 0, z: -8, width: 2, depth: 2 },
      { x: -2.2, z: -2, width: 2, depth: 2 },
      { x: 2, z: 4, width: 2, depth: 2 },
      { x: 0, z: 10, width: 2, depth: 2 },
      { x: 2.2, z: 16, width: 2, depth: 2 },
      { x: -2, z: 22, width: 2, depth: 2 },
      { x: 0, z: 28, width: 2, depth: 2 },
      { x: -2.2, z: 34, width: 2, depth: 2 },
      { x: 2, z: 40, width: 2, depth: 2 },
    ],
  },
  // Level 5: hardest, many center blocks
  {
    roadWidth: 7,
    roadLength: 120,
    spawn: { x: 0, z: -55, heading: 0 },
    obstacles: [
      { x: 0, z: -48, width: 1.8, depth: 1.8 },
      { x: -1.8, z: -42, width: 1.8, depth: 1.8 },
      { x: 1.8, z: -36, width: 1.8, depth: 1.8 },
      { x: 0, z: -30, width: 1.8, depth: 1.8 },
      { x: 1.8, z: -24, width: 1.8, depth: 1.8 },
      { x: -1.8, z: -18, width: 1.8, depth: 1.8 },
      { x: 0, z: -12, width: 1.8, depth: 1.8 },
      { x: -1.8, z: -6, width: 1.8, depth: 1.8 },
      { x: 1.8, z: 0, width: 1.8, depth: 1.8 },
      { x: 0, z: 6, width: 1.8, depth: 1.8 },
      { x: 1.8, z: 12, width: 1.8, depth: 1.8 },
      { x: -1.8, z: 18, width: 1.8, depth: 1.8 },
      { x: 0, z: 24, width: 1.8, depth: 1.8 },
      { x: -1.8, z: 30, width: 1.8, depth: 1.8 },
      { x: 1.8, z: 36, width: 1.8, depth: 1.8 },
      { x: 0, z: 42, width: 1.8, depth: 1.8 },
      { x: -1.8, z: 48, width: 1.8, depth: 1.8 },
    ],
  },
];
