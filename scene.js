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

if (!canvas || !window.WebGLRenderingContext) {
  document.documentElement.classList.add("no-webgl");
} else {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 1.2, 14);

  const group = new THREE.Group();
  scene.add(group);

  const palette = [0x2ff3ff, 0xff3f9c, 0xffca61, 0x6df2a2];
  const nodeGeometry = new THREE.IcosahedronGeometry(0.13, 1);
  const nodes = [];

  for (let i = 0; i < 82; i += 1) {
    const radius = 3.2 + Math.random() * 5.8;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 7.2;
    const material = new THREE.MeshBasicMaterial({
      color: palette[i % palette.length],
      transparent: true,
      opacity: 0.78
    });
    const mesh = new THREE.Mesh(nodeGeometry, material);
    mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    mesh.userData = {
      speed: 0.0012 + Math.random() * 0.0028,
      lift: Math.random() * Math.PI * 2,
      radius,
      angle
    };
    nodes.push(mesh);
    group.add(mesh);
  }

  const linePositions = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (nodes[i].position.distanceTo(nodes[j].position) < 2.25) {
        linePositions.push(
          nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
          nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
        );
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8defff,
    transparent: true,
    opacity: 0.22
  });
  const networkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(networkLines);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3f9c,
    transparent: true,
    opacity: 0.28,
    wireframe: true
  });

  const ringOne = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.012, 12, 140), ringMaterial);
  const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.01, 12, 150), ringMaterial.clone());
  ringTwo.material.color.setHex(0x2ff3ff);
  ringOne.rotation.x = Math.PI * 0.62;
  ringTwo.rotation.x = Math.PI * 0.38;
  ringTwo.rotation.y = Math.PI * 0.16;
  group.add(ringOne, ringTwo);

  let pointerX = 0;
  let pointerY = 0;

  window.addEventListener("pointermove", (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 720 ? 17 : 14;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  resize();

  function animate(time) {
    const t = time * 0.001;
    nodes.forEach((node) => {
      node.userData.angle += node.userData.speed;
      node.position.x = Math.cos(node.userData.angle) * node.userData.radius;
      node.position.z = Math.sin(node.userData.angle) * node.userData.radius;
      node.position.y += Math.sin(t + node.userData.lift) * 0.0018;
      node.rotation.x += 0.01;
      node.rotation.y += 0.012;
    });

    group.rotation.y = t * 0.08 + pointerX * 0.08;
    group.rotation.x = -0.12 + pointerY * 0.05;
    ringOne.rotation.z = t * 0.22;
    ringTwo.rotation.z = -t * 0.18;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate(0);
}
