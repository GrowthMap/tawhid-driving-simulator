/**
 * Car physics (arcade-style), collision, level load
 */

const CAR = {
  power: 280,
  brakePower: 320,
  steerSpeed: 4.2,  // responsive: left/right turns clearly; forward+left ≈ 45° diagonal
  maxSpeed: 45,
  friction: 0.98,
  width: 1.8,
  depth: 3.5,
};

export function createCarState() {
  return {
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    heading: 0,
    speed: 0,
  };
}

export function resetCarToSpawn(car, spawn) {
  car.x = spawn.x;
  car.z = spawn.z;
  car.vx = 0;
  car.vz = 0;
  car.heading = spawn.heading ?? 0;
  car.speed = 0;
}

export function updateCarPhysics(car, steer, accel, brake, dt) {
  const h = car.heading;
  const cos = Math.cos(h);
  const sin = Math.sin(h);

  // forward/backward forces
  const forwardAccel = (accel * CAR.power - brake * CAR.brakePower) * dt * 0.001;
  car.vx += sin * forwardAccel;
  car.vz += cos * forwardAccel;

  // steering: left arrow = turn left, forward+left = drive at an angle (≈45° when combined)
  const speed = Math.sqrt(car.vx * car.vx + car.vz * car.vz);
  car.speed = speed;
  const steerFactor = Math.min(1, speed / 4 + 0.4);  // turn in place when slow, full steer when moving
  const steerAmount = steer * CAR.steerSpeed * dt * 0.001 * steerFactor;
  car.heading += steerAmount;

  // apply velocity
  car.x += car.vx * dt * 0.001;
  car.z += car.vz * dt * 0.001;

  // friction
  car.vx *= CAR.friction;
  car.vz *= CAR.friction;

  // speed cap
  if (car.speed > CAR.maxSpeed) {
    const scale = CAR.maxSpeed / car.speed;
    car.vx *= scale;
    car.vz *= scale;
    car.speed = CAR.maxSpeed;
  }
}

// Car as box; obstacle as box. Simple AABB (car and obstacle in world, car heading for car extent)
export function carVsObstacles(car, obstacles) {
  const halfW = CAR.width / 2;
  const halfD = CAR.depth / 2;
  const cos = Math.cos(car.heading);
  const sin = Math.sin(car.heading);
  const cx = car.x;
  const cz = car.z;

  for (const o of obstacles) {
    const ow = (o.width ?? 2) / 2;
    const od = (o.depth ?? 2) / 2;
    const ox = o.x;
    const oz = o.z;
    if (boxVsBox(cx, cz, halfW, halfD, cos, sin, ox, oz, ow, od)) {
      return true;
    }
  }
  return false;
}

function boxVsBox(cx, cz, hw, hd, cos, sin, ox, oz, ow, od) {
  // transform obstacle corners into car-local space and check AABB
  const dx = ox - cx;
  const dz = oz - cz;
  const localX = dx * cos + dz * sin;
  const localZ = -dx * sin + dz * cos;
  const obLocalW = Math.abs(ow * cos) + Math.abs(od * sin);
  const obLocalD = Math.abs(ow * sin) + Math.abs(od * cos);
  if (Math.abs(localX) < hw + obLocalW && Math.abs(localZ) < hd + obLocalD) {
    return true;
  }
  return false;
}

export function carInFinishZone(car, finish) {
  const hw = finish.width / 2;
  const hd = finish.depth / 2;
  return (
    car.x >= finish.x - hw &&
    car.x <= finish.x + hw &&
    car.z >= finish.z - hd &&
    car.z <= finish.z + hd
  );
}

// World bounds: sides and behind start → crash. Far end = level complete (see carReachedEnd).
export function carLeavesRoad(car, levelData) {
  const hw = levelData.roadWidth / 2;
  const hl = levelData.roadLength / 2;
  return (
    car.x < -hw ||
    car.x > hw ||
    car.z < -hl
  );
}

// Reached the end of the road (far end) → level complete
export function carReachedEnd(car, levelData) {
  const hl = levelData.roadLength / 2;
  return car.z >= hl;
}

export function getSpeedKmh(car) {
  return Math.round(car.speed * 3.6);
}
