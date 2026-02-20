import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, carMesh, roadGroup;
let obstacleMeshes = [];

export function initRenderer(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

  const w = window.innerWidth;
  const h = window.innerHeight;
  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
  camera.position.set(0, 6, -10);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Lighting
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const ambLight = new THREE.AmbientLight(0x666688, 0.5);
  scene.add(ambLight);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d6a27 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  scene.add(ground);

  // Create car mesh
  carMesh = new THREE.Group();
  const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.8, 3),
    new THREE.MeshStandardMaterial({ color: 0xff3333 })
  );
  carBody.position.y = 0.4;
  carMesh.add(carBody);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  for (let x of [-0.7, 0.7]) {
    for (let z of [-0.8, 0.8]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.4, z);
      carMesh.add(wheel);
    }
  }

  scene.add(carMesh);

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

export function buildLevel() {
  if (roadGroup) scene.remove(roadGroup);
  roadGroup = new THREE.Group();
  obstacleMeshes.forEach(m => scene.remove(m));
  obstacleMeshes = [];

  // Road (12 units wide)
  const roadGeo = new THREE.PlaneGeometry(12, 1000);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0;
  roadGroup.add(road);

  // Edge lines
  const lineGeo = new THREE.PlaneGeometry(0.2, 1000);
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (let x of [-6.1, 6.1]) {
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.01, 0);
    roadGroup.add(line);
  }

  // Center dashes
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  for (let z = -500; z <= 500; z += 8) {
    const dashGeo = new THREE.PlaneGeometry(0.1, 4);
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, z);
    roadGroup.add(dash);
  }

  scene.add(roadGroup);
}

export function drawCar(car) {
  carMesh.position.set(car.x, car.flying ? 2 : 0, car.z);
}

export function drawObstacles(obstacles) {
  // Remove old meshes
  obstacleMeshes.forEach(m => scene.remove(m));
  obstacleMeshes = [];

  // Add new obstacles
  const obsMat = new THREE.MeshStandardMaterial({ color: 0xcc6600 });
  obstacles.forEach(obs => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), obsMat);
    box.position.set(obs.x, 0.5, obs.z);
    scene.add(box);
    obstacleMeshes.push(box);
  });
}

export function drawCamera(car) {
  const dist = 10;
  const height = car.flying ? 8 : 5;
  camera.position.x = car.x;
  camera.position.z = car.z - dist;
  camera.position.y = height;
  camera.lookAt(car.x, car.flying ? 1 : 0, car.z + 5);
}

export function render() {
  renderer.render(scene, camera);
}
