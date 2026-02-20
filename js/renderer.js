/**
 * Three.js scene: road with markings, obstacles, car with wheels
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, carGroup;
let roadGroup, obstacleMeshes = [];

function createCarMesh() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe94560 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xc13a52 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

  // Body (lower chassis) - 1.6 x 3.2 x 0.4
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 3.2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Cabin (windshield area) - 1.4 x 1.5 x 0.45, offset forward
  const cabinGeo = new THREE.BoxGeometry(1.4, 0.45, 1.5);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 0.525, 0.5);
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  group.add(cabin);

  // 4 wheels (cylinders, radius 0.35, width 0.22)
  const wheelRadius = 0.35;
  const wheelWidth = 0.22;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  const axleHalf = 1.5;
  const halfTrack = 0.75;
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

  return group;
}

export function initRenderer(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 30, 120);

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
  camera.position.set(0, 8, -12);
  camera.lookAt(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(10, 20, 10);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 1024;
  dir.shadow.mapSize.height = 1024;
  scene.add(dir);
  scene.add(new THREE.AmbientLight(0x444466));

  const groundGeo = new THREE.PlaneGeometry(200, 300);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
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

export function buildLevel(levelData) {
  if (roadGroup) scene.remove(roadGroup);
  roadGroup = null;
  obstacleMeshes.forEach((m) => scene.remove(m));
  obstacleMeshes = [];

  const rw = levelData.roadWidth;
  const rl = levelData.roadLength;
  roadGroup = new THREE.Group();

  // Asphalt surface (dark gray)
  const roadGeo = new THREE.PlaneGeometry(rw, rl);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
  const roadSurface = new THREE.Mesh(roadGeo, roadMat);
  roadSurface.rotation.x = -Math.PI / 2;
  roadSurface.position.set(0, 0.01, 0);
  roadSurface.receiveShadow = true;
  roadGroup.add(roadSurface);

  // Edge lines (white stripes along both sides)
  const lineWidth = 0.15;
  const edgeLineGeo = new THREE.PlaneGeometry(lineWidth, rl + 0.5);
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffdd });
  const leftEdge = new THREE.Mesh(edgeLineGeo, lineMat);
  leftEdge.rotation.x = -Math.PI / 2;
  leftEdge.position.set(-rw / 2 - lineWidth / 2, 0.02, 0);
  roadGroup.add(leftEdge);
  const rightEdge = new THREE.Mesh(edgeLineGeo, lineMat);
  rightEdge.rotation.x = -Math.PI / 2;
  rightEdge.position.set(rw / 2 + lineWidth / 2, 0.02, 0);
  roadGroup.add(rightEdge);

  // Center dashed line (yellow)
  const dashLength = 3;
  const dashGap = 4;
  const dashWidth = 0.12;
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xffdd00 });
  for (let z = -rl / 2; z <= rl / 2; z += dashLength + dashGap) {
    const dashGeo = new THREE.PlaneGeometry(dashWidth, dashLength);
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.025, z);
    roadGroup.add(dash);
  }

  scene.add(roadGroup);

  const obstMat = new THREE.MeshStandardMaterial({ color: 0xcc6600 });
  for (const o of levelData.obstacles) {
    const w = o.width ?? 2;
    const d = o.depth ?? 2;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, 1, d),
      obstMat
    );
    box.position.set(o.x, 0.5, o.z);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    obstacleMeshes.push(box);
  }
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
