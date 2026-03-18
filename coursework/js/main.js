/**
 * Coursework Presentation — main.js
 * - Horizontal carousel navigation (keyboard, click, touch, dots)
 * - URL hash sync (#slide-1 … #slide-7)
 * - Three.js floating particle background (data-theme: cyan/green)
 */

/* ============================================================================
   CAROUSEL
   ============================================================================ */

const TOTAL_SLIDES = 7;
let current = 0;
let isAnimating = false;

const container = document.getElementById('slidesContainer');
const prevBtn = document.getElementById('navPrev');
const nextBtn = document.getElementById('navNext');
const counterEl = document.getElementById('slideCounter');
const dots = document.querySelectorAll('.dot');
const slides = document.querySelectorAll('.slide');

/** Move to slide index n */
function goToSlide(n, skipHistory) {
  if (n < 0 || n >= TOTAL_SLIDES || isAnimating) {
    return;
  }

  slides[current].classList.remove('active');

  current = n;

  // Translate container to reveal target slide
  container.style.transform = `translateX(${-current * 100}vw)`;

  // Update dots
  dots.forEach((d, i) => d.classList.toggle('active', i === current));

  // Update counter
  counterEl.textContent = `${current + 1} / ${TOTAL_SLIDES}`;

  // Update nav buttons
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === TOTAL_SLIDES - 1;

  // Update URL hash
  if (!skipHistory) {
    history.replaceState(null, '', `#slide-${current + 1}`);
  }

  // Brief lock to avoid rapid-fire navigation during CSS transition
  isAnimating = true;
  setTimeout(() => {
    isAnimating = false;
  }, 650);
}

/** Init from URL hash if present */
function initFromHash() {
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  if (match) {
    const idx = parseInt(match[1], 10) - 1;
    if (idx >= 0 && idx < TOTAL_SLIDES) {
      current = idx;
    }
  }
  // Initial setup: no animation on first load
  container.style.transition = 'none';
  container.style.transform = `translateX(${-current * 100}vw)`;
  // Re-enable transition after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = '';
    });
  });

  dots.forEach((d, i) => d.classList.toggle('active', i === current));
  counterEl.textContent = `${current + 1} / ${TOTAL_SLIDES}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === TOTAL_SLIDES - 1;
}

/* --- Button clicks --- */
prevBtn.addEventListener('click', () => goToSlide(current - 1));
nextBtn.addEventListener('click', () => goToSlide(current + 1));

/* --- Dot clicks --- */
dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.slide, 10);
    goToSlide(idx);
  });
});

/* --- Keyboard navigation --- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    goToSlide(current + 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    goToSlide(current - 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    goToSlide(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    goToSlide(TOTAL_SLIDES - 1);
  }
});

/* --- Touch / swipe --- */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener(
  'touchstart',
  (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

document.addEventListener(
  'touchend',
  (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Only trigger if horizontal swipe dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        goToSlide(current + 1);
      } else {
        goToSlide(current - 1);
      }
    }
  },
  { passive: true }
);

/* --- Browser back/forward --- */
window.addEventListener('hashchange', () => {
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  if (match) {
    const idx = parseInt(match[1], 10) - 1;
    goToSlide(idx, true);
  }
});

/* ============================================================================
   THREE.JS FLOATING PARTICLE BACKGROUND
   Database-themed: cyan + green + teal particles drifting upward
   ============================================================================ */

(function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  /* --- Particle system --- */
  const PARTICLE_COUNT = 180;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);

  // Data-themed palette: cyan, green, teal, light blue
  const palette = [
    new THREE.Color(0x00d4ff), // accent-cyan
    new THREE.Color(0x00e676), // accent-green
    new THREE.Color(0x00bcd4), // teal
    new THREE.Color(0x40c4ff), // light blue
    new THREE.Color(0x69f0ae), // mint green
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    // Spread across a wide volume
    positions[i3] = (Math.random() - 0.5) * 120;
    positions[i3 + 1] = (Math.random() - 0.5) * 80;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    // Slow upward drift with horizontal wander
    velocities[i3] = (Math.random() - 0.5) * 0.004;
    velocities[i3 + 1] = Math.random() * 0.012 + 0.003; // always upward
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;

    // Random palette color with slight variation
    const base = palette[Math.floor(Math.random() * palette.length)].clone();
    base.r += (Math.random() - 0.5) * 0.15;
    base.g += (Math.random() - 0.5) * 0.15;
    base.b += (Math.random() - 0.5) * 0.15;
    colors[i3] = base.r;
    colors[i3 + 1] = base.g;
    colors[i3 + 2] = base.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* --- Subtle ambient glow spheres --- */
  const addGlow = (color, x, y, z, r) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06 })
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };
  const glow1 = addGlow(0x00d4ff, -30, 15, -20, 18);
  const glow2 = addGlow(0x00e676, 30, -10, -25, 14);

  /* --- Animation loop --- */
  let time = 0;
  const posArr = geometry.attributes.position.array;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

    // Drift particles upward and wrap around
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArr[i3] += velocities[i3] + Math.sin(time + i) * 0.003;
      posArr[i3 + 1] += velocities[i3 + 1];
      posArr[i3 + 2] += velocities[i3 + 2];

      // Wrap top to bottom
      if (posArr[i3 + 1] > 40) {
        posArr[i3 + 1] = -40;
        posArr[i3] = (Math.random() - 0.5) * 120;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    // Slowly pulse glow spheres
    const s1 = 1 + Math.sin(time * 1.5) * 0.08;
    glow1.scale.setScalar(s1);
    const s2 = 1 + Math.cos(time * 1.2) * 0.08;
    glow2.scale.setScalar(s2);

    // Very subtle camera drift
    camera.position.x = Math.sin(time * 0.4) * 2;
    camera.position.y = Math.cos(time * 0.3) * 1.5;

    renderer.render(scene, camera);
  }

  animate();

  /* --- Resize handler --- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================================
   BOOT
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFromHash();
});
