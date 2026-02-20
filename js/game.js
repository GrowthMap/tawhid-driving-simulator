// Simple lane-based car physics
export const CAR = {
  speed: 0.13,        // Units per millisecond (13 units/second)
  laneWidth: 4,
  laneChangeSpeed: 0.006, // Units per millisecond
};

export function createCar() {
  return {
    lane: 1,           // 0=left, 1=center, 2=right
    x: 0,              // Lane 0: -4, Lane 1: 0, Lane 2: +4
    z: 0,
    flying: false,
    flyTimer: 0,
    maxFlyTime: 2000,  // 2 seconds in milliseconds
  };
}

export function resetCar(car) {
  car.lane = 1;
  car.x = 0;
  car.z = 0;
  car.flying = false;
  car.flyTimer = 0;
}

export function updateCar(car, dt, moveLeft, moveRight, doFly) {
  // Handle lane changes
  if (moveLeft && car.lane > 0) {
    car.lane--;
    console.log('Lane LEFT:', car.lane);
  }
  if (moveRight && car.lane < 2) {
    car.lane++;
    console.log('Lane RIGHT:', car.lane);
  }

  // Smoothly move car to target lane X position
  const targetX = car.lane * 4 - 4;
  if (car.x < targetX) {
    car.x = Math.min(car.x + CAR.laneChangeSpeed * dt, targetX);
  } else if (car.x > targetX) {
    car.x = Math.max(car.x - CAR.laneChangeSpeed * dt, targetX);
  }

  // Move forward
  car.z += CAR.speed * dt;

  // Handle flying
  if (doFly && !car.flying) {
    car.flying = true;
    car.flyTimer = car.maxFlyTime;
    console.log('FLYING!');
  }

  if (car.flying) {
    car.flyTimer -= dt;
    if (car.flyTimer <= 0) {
      car.flying = false;
    }
  }
}

export function checkCollisions(car, obstacles) {
  // Car collision box
  const carLeft = car.x - 1;
  const carRight = car.x + 1;
  const carTop = car.z - 1;
  const carBottom = car.z + 2;

  for (let obs of obstacles) {
    if (car.flying) continue; // Can't collide while flying

    const obsLeft = obs.x - 1;
    const obsRight = obs.x + 1;
    const obsTop = obs.z - 1;
    const obsBottom = obs.z + 1;

    // AABB collision check
    if (carRight > obsLeft && carLeft < obsRight &&
        carBottom > obsTop && carTop < obsBottom) {
      return true;
    }
  }
  return false;
}

export function checkOffRoad(car) {
  // Road bounds: x from -6 to 6 (3 lanes of width 4)
  return car.x < -6 || car.x > 6;
}

export function spawnObstacle(z) {
  const lanes = [0, 1, 2];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  return {
    lane: lane,
    x: lane * 4 - 4,
    z: z,
  };
}
