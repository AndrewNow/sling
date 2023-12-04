import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from "lil-gui";
import vertexShader from "../../components/three/shaders/vertex.glsl";
import fragmentShader from "../../components/three/shaders/fragment.glsl";
// import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// ATTRIBUTES are associated with each VERTEX
// UNIFORMS are the same throughout each VERTEX
//
// ════════════════════════════════════
//             Base
// ════════════════════════════════════
//
// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");
const canvasContainer = document.querySelector("#canvas-container");

window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  const canvasContainer = document.getElementById("canvas-container");
  const canvas = document.querySelector("canvas.webgl");

  // Set the canvas dimensions to match its container
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;

  // Additional WebGL setup and rendering code here...
}

// Call resizeCanvas initially to set the initial dimensions
resizeCanvas();

// Scene
const scene = new THREE.Scene();

//
// ════════════════════════════════════
//             Textures
// ════════════════════════════════════
//
const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load("/images/Sling-dark.png");

// •───────•°•❀•°•───────•
//           mesh
// •───────•°•❀•°•───────•

// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 64, 32);

// create count attribute (number of vertices)
const count = geometry.attributes.position.count;
// // set the length of the array to `count`
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}
// value after `randoms` is how many values to take from the array for one vertex
// if we're changing the position, we need 3 (x,y,z)
geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

// •───────•°•❀•°•───────•
//       GLSL Material
// •───────•°•❀•°•───────•
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: false,
  uniforms: {
    // sin frequency
    uFrequency: { value: new THREE.Vector2(3, 3) },
    // give the shaders a time value, see tick()
    uTime: { value: 0 },
    // add texture
    uTexture: { value: flagTexture },
    // add color
    // uColor: { value: new THREE.Color(0xfff) },
  },
  side: THREE.DoubleSide,
});

// gui
//   .add(material.uniforms.uFrequency.value, "x")
//   .min(0)
//   .max(20)
//   .step(0.01)
//   .name("freqX");
// gui
//   .add(material.uniforms.uFrequency.value, "y")
//   .min(0)
//   .max(20)
//   .step(0.01)
//   .name("freqY");

// Mesh
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

//
// ════════════════════════════════════
//             Sizes
// ════════════════════════════════════
//
const sizes = {
  width: canvasContainer.clientWidth,
  height: canvasContainer.clientHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = canvasContainer.innerWidth;
  sizes.height = canvasContainer.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//
// ════════════════════════════════════
//             Camera
// ════════════════════════════════════
//
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, .75);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 1;
controls.enableZoom = false;

//
// ════════════════════════════════════
//             Renderer
// ════════════════════════════════════
//
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// const backgroundColor = new THREE.Color(0xff0000);
// renderer.setClearColor(backgroundColor, 1);

//
// ════════════════════════════════════
//             Animate
// ════════════════════════════════════
//

// let mouseX = 0;
// let mouseY = 0;

// canvas.addEventListener("mousemove", (event) => {
//   // Calculate the mouse position within the canvas
//   const rect = canvas.getBoundingClientRect();
//   mouseX = (event.clientX - rect.left) / canvas.width;
//   mouseY = 1 - (event.clientY - rect.top) / canvas.height; // Invert Y-axis
// });

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update material
  material.uniforms.uTime.value = elapsedTime;

  // Update material uniforms based on mouse position
  // material.uniforms.uFrequency.value.x = mouseX * 20; // Adjust the factor as needed
  // material.uniforms.uFrequency.value.y = mouseY * 20; // Adjust the factor as needed

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
