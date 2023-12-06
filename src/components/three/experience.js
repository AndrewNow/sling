import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from "lil-gui";
import vertexShader from "../../components/three/shaders/vertex.glsl";
import fragmentShader from "../../components/three/shaders/fragment.glsl";

//
// ════════════════════════════════════
//             Base
// ════════════════════════════════════
//
// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");
const canvasContainer = document.querySelector(".webgl-wrapper");

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
    uFrequency: { value: new THREE.Vector2(0, 0) },
    // give the shaders a time value, see tick()
    uTime: { value: 0 },
    // add texture
    uTexture: { value: flagTexture },
    // add color
    // uColor: { value: new THREE.Color(0xfff) },
  },
  side: THREE.DoubleSide,
});

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
  sizes.width = canvasContainer.clientWidth;
  sizes.height = canvasContainer.clientHeight;

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
camera.position.set(0, 0, 0.6);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 1;
// controls.enableZoom = false;

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

//
// ════════════════════════════════════
//             Animate
// ════════════════════════════════════
//

const clock = new THREE.Clock();
// ...

// Set a delay before starting the animation
const animationDelay = 2.55; // in seconds
let animationStarted = false;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Check if the delay has passed and animation has not started
  if (elapsedTime > animationDelay && !animationStarted) {
    // Start the animation
    animationStarted = true;
  }

  // Only update the uTime if the animation has started
  if (animationStarted) {
    // Update material
    material.uniforms.uTime.value = elapsedTime - animationDelay;

    // Calculate new uFrequency values based on your logic
    const progress = Math.min(1, elapsedTime - animationDelay);
    const newFrequencyX = 0 + progress * (4 - 0);
    const newFrequencyY = 0 + progress * (3 - 0);

    // Update uFrequency
    material.uniforms.uFrequency.value.set(newFrequencyX, newFrequencyY);
  }

  // Update controls
  // controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
