/**
 * Coins: collectible items that appear on the endless road
 */

export function createCoin(x, z) {
  return {
    x,
    z,
    collected: false,
    rotation: 0,
    scale: 1,
  };
}

export function generateCoinsForSegment(zStart, zEnd, roadWidth) {
  const coins = [];
  const spacing = 20; // Distance between coin groups
  const coinsPerGroup = Math.random() > 0.5 ? 1 : 2;
  
  for (let z = zStart; z < zEnd; z += spacing) {
    // Randomly place coins on left, center, or right
    for (let i = 0; i < coinsPerGroup; i++) {
      const side = Math.random();
      let x;
      if (side < 0.33) {
        x = -roadWidth * 0.3 + Math.random() * 2;
      } else if (side < 0.66) {
        x = roadWidth * 0.3 + Math.random() * 2;
      } else {
        x = Math.random() * 4 - 2;
      }
      coins.push(createCoin(x, z + Math.random() * 5));
    }
  }
  
  return coins;
}

export function updateCoin(coin, dt) {
  coin.rotation += dt * 0.003; // Rotate continuously
}

export function carVsCoin(car, coin, CAR_WIDTH = 1.8, CAR_DEPTH = 3.5) {
  if (coin.collected) return false;
  
  const dx = car.x - coin.x;
  const dz = car.z - coin.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  
  // Collision radius: car half-width + coin radius (0.5)
  return dist < (CAR_WIDTH / 2 + 0.5);
}
