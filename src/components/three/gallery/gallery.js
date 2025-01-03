import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Gallery Configuration
const GALLERY_CONFIG = {
  // Base dimensions
  baseHeight: 5.5,
  frameSpacing: 10.0,
  frameCount: 8,

  // Camera settings
  camera: {
    fov: 45,
    position: { x: 0, y: 0, z: 10 },
    near: 0.1,
    far: 1000,
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
  },

  // Responsive scaling
  scales: {
    mobile: 0.4,
    tablet: 0.65,
    desktop: 1.0,
  },

  // Spacing multipliers for different screen sizes
  spacingMultipliers: {
    mobile: 0.6,
    tablet: 0.8,
    desktop: 1.0,
  },

  // Effect settings
  effects: {
    twist: {
      amount: 0.2,
      multiplier: 0.05,
    },
    depth: {
      amount: 0.1,
    },
    scale: {
      min: 0.5,
      falloff: 0.05,
    },
    fade: {
      viewportThreshold: 0.45, // Start fade at 40% of viewport width
      transitionSpeed: 0.1, // How quickly opacity changes
    },
  },

  // Frame number settings
  frameNumber: {
    size: 0.3,
    margin: 0.2,
    fontSize: "80px",
    fontFamily: "Arial",
  },
};

// Gallery Items
const GALLERY_ITEMS = [
  {
    type: "image",
    url: "https://utfs.io/f/uU55CSHY2nOZJHhxprWiFBCM7ojU9VpIYmufd3sXreO6hnbt",
  },
  {
    type: "image",
    url: "https://utfs.io/f/uU55CSHY2nOZ6kC1BPgcqDNHchOJ4syvYzouQg5MwkEUtpFP",
  },
  {
    type: "image",
    url: "https://utfs.io/f/uU55CSHY2nOZPt5K2Pik9ZnVM4Tza6vQhKIGJUypAbNd0oWF",
  },
  {
    type: "image",
    url: "https://utfs.io/f/uU55CSHY2nOZx9zwewV14wJPeTUEcfQHzL5AFNjZnhWbGg9t",
  },
  {
    type: "image",
    url: "https://utfs.io/f/uU55CSHY2nOZ0VjUX7MoQFWieS5JjcpCAfZBUn7hEDXO8vIP",
  },
  {
    type: "video",
    url: "https://utfs.io/f/uU55CSHY2nOZVT0rUtBq8p07USdHzkX2KbrcDWMQAC13tfLl",
  },
  {
    type: "video",
    url: "https://utfs.io/f/uU55CSHY2nOZ1Eyssl0bnrY7A4yEQoV98jgi0DvhBpH5WZtC",
  },
  {
    type: "image",
    url: "https://utfs.io/f/uU55CSHY2nOZivrPSPxJW2cXYzsF9MT83qvOmSrdDyRxu1EI",
  },
];

class Gallery {
  constructor() {
    this.container = document.getElementById("threejs-gallery");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      GALLERY_CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      GALLERY_CONFIG.camera.near,
      GALLERY_CONFIG.camera.far
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    this.frames = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.frameSpacing = GALLERY_CONFIG.frameSpacing;
    this.totalWidth = 0;
    this.textureLoader = new THREE.TextureLoader();
    this.baseHeight = GALLERY_CONFIG.baseHeight;

    // Store initial camera settings
    this.initialCameraSettings = {
      fov: GALLERY_CONFIG.camera.fov,
      position: new THREE.Vector3(
        GALLERY_CONFIG.camera.position.x,
        GALLERY_CONFIG.camera.position.y,
        GALLERY_CONFIG.camera.position.z
      ),
      aspect: window.innerWidth / window.innerHeight,
    };

    // Store videos for updating
    this.videos = [];
    this.pendingFrames = 0;

    // Define shaders at class level
    this.twistVertexShader = `
      uniform float distanceFromCenter;
      uniform float twistAmount;
      
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        float twist = distanceFromCenter * twistAmount;
        float s = sin(twist * position.y);
        float c = cos(twist * position.y);
        vec3 newPosition = position;
        newPosition.x = position.x * c - position.z * s;
        newPosition.z = position.x * s + position.z * c;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    this.twistFragmentShader = `
      uniform sampler2D map;
      uniform float opacity;
      varying vec2 vUv;
      
      void main() {
        vec4 texColor = texture2D(map, vUv);
        gl_FragColor = vec4(texColor.rgb, texColor.a * opacity);
      }
    `;

    // Add snap-related properties
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.centerPoint = 0;
    this.snapThreshold = 2.0; // Distance threshold for snapping (adjust as needed)
    this.snapDuration = 0.5; // Duration of snap animation in seconds
    this.snapInProgress = false;
    this.lastScrollTime = 0;
    this.scrollDebounceTime = 150; // Time to wait after last scroll before snapping

    this.init();
  }

  init() {
    // Setup renderer with transparency
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // Set transparent background
    this.container.appendChild(this.renderer.domElement);

    // Setup camera - simpler setup without orbit controls
    this.camera.position.copy(this.initialCameraSettings.position);
    this.camera.fov = this.initialCameraSettings.fov;
    this.camera.updateProjectionMatrix();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 5, 5);
    this.scene.add(ambientLight, pointLight);

    // Create frames
    this.createGallery();

    // Remove orbit controls and add scroll listener
    window.addEventListener("wheel", this.onScroll.bind(this));
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));

    // Initial resize to set correct sizes
    this.onWindowResize();

    // Start animation loop
    this.animate();
  }

  createGallery() {
    const frameCount = GALLERY_ITEMS.length;
    const spacing = this.frameSpacing;
    const totalWidth = (frameCount - 1) * spacing;
    this.totalWidth = totalWidth;
    this.pendingFrames = frameCount;

    GALLERY_ITEMS.forEach((item, i) => {
      if (item.type === "video") {
        const { texture, video } = this.createVideoTexture(item.url);

        // Create frame once video metadata is loaded
        video.addEventListener("loadedmetadata", () => {
          const aspectRatio = video.videoWidth / video.videoHeight;
          const frameWidth = this.baseHeight * aspectRatio;
          this.createFrame(texture, i, spacing, totalWidth, frameWidth);
          this.pendingFrames--;
          this.checkInitialization();
        });
      } else {
        // Handle image
        this.textureLoader.load(
          item.url,
          (texture) => {
            const aspectRatio = texture.image.width / texture.image.height;
            const frameWidth = this.baseHeight * aspectRatio;
            this.createFrame(texture, i, spacing, totalWidth, frameWidth);
            this.pendingFrames--;
            this.checkInitialization();
          },
          undefined,
          (err) => {
            console.error("Error loading texture:", err);
            this.pendingFrames--;
            this.checkInitialization();
          }
        );
      }
    });
  }

  createVideoTexture(url) {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Store video for updating
    this.videos.push(video);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Start playing
    video.play().catch((e) => console.log("Video play error:", e));

    return { texture, video };
  }

  checkInitialization() {
    if (this.pendingFrames === 0) {
      this.onWindowResize();
    }
  }

  createFrame(texture, index, spacing, totalWidth, frameWidth) {
    const frameGeometry = new THREE.PlaneGeometry(
      frameWidth,
      this.baseHeight,
      32,
      32
    );

    // Create material with explicit blending
    const material = new THREE.ShaderMaterial({
      uniforms: {
        distanceFromCenter: { value: 0 },
        twistAmount: { value: GALLERY_CONFIG.effects.twist.amount },
        map: { value: texture },
        opacity: { value: 1.0 },
      },
      vertexShader: this.twistVertexShader,
      fragmentShader: this.twistFragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
    });

    const frame = new THREE.Mesh(frameGeometry, material);

    // Store initial opacity
    frame.userData.opacity = 1.0;

    // Add frame number
    const numberMesh = this.createFrameNumber(index + 1, frameWidth);
    frame.add(numberMesh);

    frame.position.x = -totalWidth / 2 + index * spacing;

    this.frames.push(frame);
    this.scene.add(frame);
  }

  createFrameNumber(number, frameWidth) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.font = `Bold ${GALLERY_CONFIG.frameNumber.fontSize} ${GALLERY_CONFIG.frameNumber.fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(number.toString(), 128, 128);

    const numberTexture = new THREE.CanvasTexture(canvas);
    const numberGeometry = new THREE.PlaneGeometry(
      GALLERY_CONFIG.frameNumber.size,
      GALLERY_CONFIG.frameNumber.size
    );
    const numberMaterial = new THREE.MeshBasicMaterial({
      map: numberTexture,
      transparent: true,
    });

    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.z = 0.02;
    numberMesh.position.y =
      -this.baseHeight / 2 - GALLERY_CONFIG.frameNumber.margin;
    numberMesh.position.x = -frameWidth / 2 + GALLERY_CONFIG.frameNumber.margin;

    return numberMesh;
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Use breakpoints from config
    if (width < GALLERY_CONFIG.breakpoints.mobile) {
      this.camera.fov = this.initialCameraSettings.fov * 1.5;
      this.camera.position.z = 12;
    } else if (width < GALLERY_CONFIG.breakpoints.tablet) {
      this.camera.fov = this.initialCameraSettings.fov * 1.2;
      this.camera.position.z = 11;
    } else {
      this.camera.fov = this.initialCameraSettings.fov;
      this.camera.position.z = this.initialCameraSettings.position.z;
    }

    // Update camera
    this.camera.aspect = width / height;

    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adjust frame spacing and scale based on screen size
    this.frames.forEach((frame, index) => {
      let scale;
      let spacing;

      if (width < GALLERY_CONFIG.breakpoints.mobile) {
        // Mobile
        scale = GALLERY_CONFIG.scales.mobile;
        spacing = this.frameSpacing * GALLERY_CONFIG.spacingMultipliers.mobile;
      } else if (width < GALLERY_CONFIG.breakpoints.tablet) {
        // Tablet
        scale = GALLERY_CONFIG.scales.tablet;
        spacing = this.frameSpacing * GALLERY_CONFIG.spacingMultipliers.tablet;
      } else {
        // Desktop
        scale = GALLERY_CONFIG.scales.desktop;
        spacing = this.frameSpacing;
      }

      frame.scale.set(scale, scale, scale);

      // Recalculate frame positions with new spacing
      const totalWidth = (this.frames.length - 1) * spacing;
      frame.position.x = -totalWidth / 2 + index * spacing;
    });
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onScroll(event) {
    const scrollSpeed = 0.01;

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Update frames position
    this.frames.forEach((frame) => {
      frame.position.x += event.deltaY * scrollSpeed;

      // Handle infinite scrolling
      if (frame.position.x > this.totalWidth / 2) {
        frame.position.x -= this.totalWidth + this.frameSpacing;
      } else if (frame.position.x < -this.totalWidth / 2 - this.frameSpacing) {
        frame.position.x += this.totalWidth + this.frameSpacing;
      }
    });

    // Set new timeout for snap check
    this.scrollTimeout = setTimeout(() => {
      this.checkForSnap();
    }, this.scrollDebounceTime);
  }

  checkForSnap() {
    if (this.snapInProgress) return;

    // Find the frame closest to center
    let closestFrame = null;
    let minDistance = Infinity;

    this.frames.forEach((frame) => {
      const distance = Math.abs(frame.position.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestFrame = frame;
      }
    });

    // If closest frame is within threshold, snap to it
    if (closestFrame && minDistance < this.snapThreshold) {
      this.snapToFrame(closestFrame);
    }
  }

  snapToFrame(targetFrame) {
    this.snapInProgress = true;
    const startPositions = this.frames.map((frame) => frame.position.x);
    const offset = targetFrame.position.x;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      const progress = Math.min(elapsed / this.snapDuration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Update all frames
      this.frames.forEach((frame, index) => {
        const startPos = startPositions[index];
        frame.position.x = startPos - offset * eased;
      });

      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.snapInProgress = false;
      }
    };

    requestAnimationFrame(animate);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Update video textures
    this.videos.forEach((video) => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const texture = video.texture;
        if (texture) texture.needsUpdate = true;
      }
    });

    // Calculate fade parameters
    const viewportWidth = window.innerWidth;
    const fadeStartDistance = viewportWidth * 0.3; // Start fading at 30% from center
    const fadeEndDistance = viewportWidth * 0.5; // Complete fade at 50% from center

    // Update frame transformations
    this.frames.forEach((frame) => {
      const distanceFromCenter = Math.abs(frame.position.x);

      // Calculate opacity
      let targetOpacity = 1.0;

      if (distanceFromCenter > fadeStartDistance) {
        targetOpacity =
          1.0 -
          Math.min(
            1,
            (distanceFromCenter - fadeStartDistance) /
              (fadeEndDistance - fadeStartDistance)
          );
      }

      // Smooth transition for opacity
      frame.userData.opacity += (targetOpacity - frame.userData.opacity) * 0.1;

      // Update material uniforms
      frame.material.uniforms.distanceFromCenter.value =
        frame.position.x * GALLERY_CONFIG.effects.twist.multiplier;
      frame.material.uniforms.opacity.value = frame.userData.opacity;

      // Debug log to verify opacity values
      // console.log(`Frame opacity: ${frame.material.uniforms.opacity.value}`);

      // Update scale
      const targetScale = Math.max(
        GALLERY_CONFIG.effects.scale.min,
        1 - Math.abs(frame.position.x) * GALLERY_CONFIG.effects.scale.falloff
      );

      frame.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );

      frame.position.z =
        Math.abs(frame.position.x) * GALLERY_CONFIG.effects.depth.amount;
    });

    this.renderer.render(this.scene, this.camera);
  }

  // Clean up when gallery is destroyed
  dispose() {
    this.videos.forEach((video) => {
      video.pause();
      video.remove();
    });
    this.videos = [];
  }
}

// Initialize gallery
new Gallery();
