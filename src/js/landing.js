/**
 * Landing Page Three.js Animations
 * Left: Cyberpunk circuit network
 * Right: Harry Potter liquid background
 */

/* global THREE, requestAnimationFrame */

// Wait for DOM and Three.js to load
document.addEventListener('DOMContentLoaded', () => {
  initCyberpunkAnimation();
  initMagicalAnimation();
});

/**
 * LEFT SIDE: Cyberpunk Circuit Network Animation with Three.js
 */
function initCyberpunkAnimation() {
  const container = document.getElementById('sp-side');
  const canvas = document.getElementById('sp-canvas');

  if (!canvas || !container) {
    return;
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Setup scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 25;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  // Create particles for network nodes
  const particleCount = 50;
  const particles = [];
  const connections = [];

  // Particle geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const particle = {
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 20
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.02
      ),
    };
    particles.push(particle);

    positions[i * 3] = particle.position.x;
    positions[i * 3 + 1] = particle.position.y;
    positions[i * 3 + 2] = particle.position.z;

    // Cyan color
    colors[i * 3] = 0;
    colors[i * 3 + 1] = 0.94;
    colors[i * 3 + 2] = 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Create connections between nearby particles
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.3,
  });

  function updateConnections() {
    // Remove old connections
    connections.forEach((line) => scene.remove(line));
    connections.length = 0;

    const maxDistance = 8;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const distance = particles[i].position.distanceTo(particles[j].position);

        if (distance < maxDistance) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            particles[i].position,
            particles[j].position,
          ]);

          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
          connections.push(line);
        }
      }
    }
  }

  updateConnections();

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update particle positions
    const positions = points.geometry.attributes.position.array;
    particles.forEach((particle, i) => {
      particle.position.add(particle.velocity);

      // Bounce off boundaries
      if (Math.abs(particle.position.x) > 25) {
        particle.velocity.x *= -1;
      }
      if (Math.abs(particle.position.y) > 25) {
        particle.velocity.y *= -1;
      }
      if (Math.abs(particle.position.z) > 10) {
        particle.velocity.z *= -1;
      }

      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    });

    points.geometry.attributes.position.needsUpdate = true;

    // Update connections every few frames
    if (Math.random() < 0.1) {
      updateConnections();
    }

    // Rotate camera slightly
    camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    camera.position.y = Math.cos(Date.now() * 0.0001) * 2;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // Handle resize
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

/**
 * RIGHT SIDE: Harry Potter Liquid Background Animation
 */
function initMagicalAnimation() {
  const container = document.getElementById('db-side');
  const canvas = document.getElementById('db-canvas');

  if (!canvas || !container) {
    return;
  }

  // Load the threejs-components liquid background
  const script = document.createElement('script');
  script.src =
    'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
  script.onload = () => {
    try {
      const { LiquidBackground } = window;

      if (!LiquidBackground) {
        console.error('LiquidBackground not loaded');
        return;
      }

      const app = LiquidBackground(canvas);

      // Load the Harry Potter image
      app.loadImage('db/images/hp.png');

      // Configure material for magical effect
      app.liquidPlane.material.metalness = 0.75;
      app.liquidPlane.material.roughness = 0.25;
      app.liquidPlane.uniforms.displacementScale.value = 5;
      app.setRain(false);

      // Add darker overlay for better readability
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(44, 36, 22, 0.6)';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '3';
      container.insertBefore(overlay, container.firstChild.nextSibling);

      // Add golden particles overlay
      createGoldenParticles(container);
    } catch (error) {
      console.error('Error initializing liquid background:', error);
    }
  };
  document.head.appendChild(script);
}

/**
 * Create golden sparkle particles for Harry Potter theme
 */
function createGoldenParticles(container) {
  const particleContainer = document.createElement('div');
  particleContainer.style.position = 'absolute';
  particleContainer.style.top = '0';
  particleContainer.style.left = '0';
  particleContainer.style.width = '100%';
  particleContainer.style.height = '100%';
  particleContainer.style.pointerEvents = 'none';
  particleContainer.style.zIndex = '4';
  particleContainer.style.overflow = 'hidden';
  container.appendChild(particleContainer);

  // Create floating sparkles
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.fontSize = `${Math.random() * 20 + 10}px`;
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.opacity = `${Math.random() * 0.3 + 0.2}`;
    sparkle.style.animation = `float-sparkle ${Math.random() * 5 + 3}s ease-in-out infinite`;
    sparkle.style.animationDelay = `${Math.random() * 2}s`;
    particleContainer.appendChild(sparkle);
  }

  // Add animation
  if (!document.getElementById('sparkle-animation')) {
    const style = document.createElement('style');
    style.id = 'sparkle-animation';
    style.innerHTML = `
      @keyframes float-sparkle {
        0%, 100% {
          transform: translateY(0) rotate(0deg);
          opacity: 0.2;
        }
        50% {
          transform: translateY(-30px) rotate(180deg);
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
