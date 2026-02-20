/**
 * Three.js scene: road with markings, obstacles, car with wheels, and coins
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, carGroup;
let roadGroup, obstacleMeshes = [], coinMeshes = [];

function createCarMesh() {
  const group = new THREE.Group();

  // Enhanced materials with metallic shine
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    metalness: 0.6,
    roughness: 0.3,
  });
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xcc0000,
    metalness: 0.7,
    roughness: 0.4,
  });
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.3,
    roughness: 0.8,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x4db8ff,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x001a4d,
  });

  // Body (lower chassis) - enhanced 3D look
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.5, 3.5);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.25;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Cabin (windshield + roof area) - better proportions
  const cabinGeo = new THREE.BoxGeometry(1.4, 0.8, 1.8);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 0.8, 0.4);
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  group.add(cabin);

  // Windows (front)
  const windowGeo = new THREE.BoxGeometry(1.2, 0.5, 0.1);
  const frontWindow = new THREE.Mesh(windowGeo, windowMat);
  frontWindow.position.set(0, 0.9, 1.2);
  group.add(frontWindow);
  
  const backWindow = new THREE.Mesh(windowGeo, windowMat);
  backWindow.position.set(0, 0.9, -0.3);
  group.add(backWindow);

  // 4 wheels (cylinders, radius 0.4, width 0.25) - slightly bigger
  const wheelRadius = 0.4;
  const wheelWidth = 0.25;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  const axleHalf = 1.3;
  const halfTrack = 0.8;
  const wheelPositions = [
    [-halfTrack, wheelRadius + 0.05, axleHalf],
    [halfTrack, wheelRadius + 0.05, axleHalf],
    [-halfTrack, wheelRadius + 0.05, -axleHalf],
    [halfTrack, wheelRadius + 0.05, -axleHalf],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    group.add(wheel);
  });

  // Side mirrors
  const mirrorGeo = new THREE.BoxGeometry(0.15, 0.2, 0.2);
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
  [-1, 1].forEach(side => {
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.position.set(side * 0.85, 0.7, 0.2);
    mirror.castShadow = true;
    group.add(mirror);
  });

  return group;
}

export function initRenderer(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
  camera.position.set(0, 8, -12);
  camera.lookAt(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // Enhanced lighting
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(15, 25, 15);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 2048;
  dir.shadow.mapSize.height = 2048;
  dir.shadow.camera.far = 100;
  scene.add(dir);
  
  const ambient = new THREE.AmbientLight(0x666688, 0.6);
  scene.add(ambient);
  
  const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x2d5a27, 0.4);
  scene.add(skyLight);

  // Improved ground with grass texture effect
  const groundGeo = new THREE.PlaneGeometry(250, 400);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a27,
    roughness: 0.8,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  carGroup = createCarMesh();
  scene.add(carGroup);

  window.addEventListener('resize', onResize);
  return { scene, camera, renderer };
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

export function buildLevel(roadWidth) {
  if (roadGroup) scene.remove(roadGroup);
  roadGroup = null;
  obstacleMeshes.forEach((m) => scene.remove(m));
  obstacleMeshes = [];
  clearCoins();

  roadGroup = new THREE.Group();

  // Asphalt surface (dark gray with slight pattern)
  const roadGeo = new THREE.PlaneGeometry(roadWidth, 500);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.6,
    metalness: 0.1,
  });
  const roadSurface = new THREE.Mesh(roadGeo, roadMat);
  roadSurface.rotation.x = -Math.PI / 2;
  roadSurface.position.set(0, 0.01, 0);
  roadSurface.receiveShadow = true;
  roadGroup.add(roadSurface);

  // Edge lines (white stripes along both sides) - more realistic
  const lineWidth = 0.25;
  const edgeLineGeo = new THREE.PlaneGeometry(lineWidth, 500);
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x333333,
    roughness: 0.5,
  });
  const leftEdge = new THREE.Mesh(edgeLineGeo, lineMat);
  leftEdge.rotation.x = -Math.PI / 2;
  leftEdge.position.set(-roadWidth / 2 - lineWidth / 2, 0.02, 0);
  roadGroup.add(leftEdge);
  const rightEdge = new THREE.Mesh(edgeLineGeo, lineMat);
  rightEdge.rotation.x = -Math.PI / 2;
  rightEdge.position.set(roadWidth / 2 + lineWidth / 2, 0.02, 0);
  roadGroup.add(rightEdge);

  // Center dashed line (bright yellow)
  const dashLength = 4;
  const dashGap = 5;
  const dashWidth = 0.15;
  const dashMat = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0x666600,
    roughness: 0.4,
  });
  for (let z = -250; z <= 250; z += dashLength + dashGap) {
    const dashGeo = new THREE.PlaneGeometry(dashWidth, dashLength);
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.025, z);
    roadGroup.add(dash);
  }

  scene.add(roadGroup);
}

export function addObstacle(obstacle) {
  const w = obstacle.width ?? 2;
  const d = obstacle.depth ?? 2;
  
  const obstMat = new THREE.MeshStandardMaterial({
    color: 0xcc6600,
    metalness: 0.3,
    roughness: 0.7,
  });
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(w, 1.2, d),
    obstMat
  );
  box.position.set(obstacle.x, 0.6, obstacle.z);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);
  obstacleMeshes.push(box);
}

export function addCoin(coin) {
  const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x664400,
  });
  const coinMesh = new THREE.Mesh(coinGeo, coinMat);
  coinMesh.position.set(coin.x, 0.7, coin.z);
  coinMesh.rotation.x = Math.PI / 2;
  coinMesh.castShadow = true;
  coinMesh.receiveShadow = true;
  coinMesh.userData.coinRef = coin;
  scene.add(coinMesh);
  coinMeshes.push(coinMesh);
}

export function updateCoins(coins) {
  coinMeshes.forEach((mesh) => {
    const coin = mesh.userData.coinRef;
    if (coin.collected) {
      scene.remove(mesh);
    } else {
      mesh.rotation.z += 0.03;
      mesh.position.y = 0.7 + Math.sin(coin.rotation) * 0.3;
    }
  });
  coinMeshes = coinMeshes.filter((m) => !m.parent || m.parent === scene);
}

export function clearCoins() {
  coinMeshes.forEach((m) => scene.remove(m));
  coinMeshes = [];
}

export function updateCarVisual(car) {
  carGroup.position.set(car.x, 0, car.z);
  carGroup.rotation.y = -car.heading;
}

export function updateCameraFollow(car) {
  const dist = 14;
  const height = 6;
  const cos = Math.cos(car.heading);
  const sin = Math.sin(car.heading);
  camera.position.x = car.x - sin * dist;
  camera.position.z = car.z - cos * dist;
  camera.position.y = height;
  camera.lookAt(car.x + sin * 4, 0, car.z + cos * 4);
}

export function render() {
  renderer.render(scene, camera);
}
