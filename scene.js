import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#network-scene");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (canvas && window.WebGLRenderingContext) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 12);

  const group = new THREE.Group();
  scene.add(group);

  const grid = new THREE.GridHelper(22, 34, 0x5ee7ff, 0x263744);
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  grid.position.y = -3;
  group.add(grid);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x5ee7ff,
    transparent: true,
    opacity: 0.26,
    wireframe: true
  });

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.15, 2.2, 6, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x9af6bd,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    })
  );
  hub.position.set(3.9, -0.15, 0);
  group.add(hub);

  const mastMaterial = new THREE.LineBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.34 });
  const mastGeometry = new THREE.BufferGeometry();
  mastGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
    3.9, -2.6, 0, 3.9, 2.8, 0,
    3.15, -1.7, 0, 3.9, 2.8, 0,
    4.65, -1.7, 0, 3.9, 2.8, 0,
    3.25, 0.65, 0, 4.55, 0.65, 0,
    3.35, 1.55, 0, 4.45, 1.55, 0
  ], 3));
  const mast = new THREE.LineSegments(mastGeometry, mastMaterial);
  group.add(mast);

  const ringOne = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.01, 12, 128), ringMaterial);
  const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.01, 12, 128), ringMaterial.clone());
  const ringThree = new THREE.Mesh(new THREE.TorusGeometry(4.05, 0.008, 12, 128), ringMaterial.clone());
  ringTwo.material.color.setHex(0x9af6bd);
  ringThree.material.color.setHex(0xffd166);
  ringThree.material.opacity = 0.16;
  ringOne.position.copy(hub.position);
  ringTwo.position.copy(hub.position);
  ringThree.position.copy(hub.position);
  ringOne.rotation.x = Math.PI * 0.52;
  ringTwo.rotation.y = Math.PI * 0.56;
  ringThree.rotation.x = Math.PI * 0.5;
  ringThree.rotation.y = Math.PI * 0.18;
  group.add(ringOne, ringTwo, ringThree);

  const nodes = [];
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.58 });
  const nodeGeometry = new THREE.SphereGeometry(0.035, 10, 10);

  for (let i = 0; i < 42; i += 1) {
    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    const angle = Math.random() * Math.PI * 2;
    const radius = 4.4 + Math.random() * 5.4;
    mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4.8, Math.sin(angle) * radius);
    mesh.userData = { angle, radius, speed: 0.00045 + Math.random() * 0.0007 };
    nodes.push(mesh);
    group.add(mesh);
  }

  const linePositions = [];
  nodes.forEach((node) => {
    linePositions.push(hub.position.x, hub.position.y, hub.position.z, node.position.x, node.position.y, node.position.z);
  });
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.08 })
  );
  group.add(lines);

  let pointerX = 0;
  let pointerY = 0;

  window.addEventListener("pointermove", (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = window.innerWidth < 720 ? 15 : 12;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  resize();

  function animate(time) {
    const t = time * 0.001;
    hub.rotation.y = t * 0.18;
    ringOne.rotation.z = t * 0.18;
    ringTwo.rotation.x = Math.PI * 0.18 + t * 0.12;
    ringThree.rotation.z = -t * 0.1;
    group.rotation.y = -0.18 + pointerX * 0.035;
    group.rotation.x = pointerY * 0.025;

    nodes.forEach((node) => {
      node.userData.angle += node.userData.speed;
      node.position.x = Math.cos(node.userData.angle) * node.userData.radius;
      node.position.z = Math.sin(node.userData.angle) * node.userData.radius;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate(0);
}
