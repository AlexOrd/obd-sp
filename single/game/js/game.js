/**
 * ============================================================================
 * STAR COMMAND ACADEMY - Game Page Interactivity
 * Handles tab switching, animations, and user interactions
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCursorEffects();
  initAudioFeedback();
  initParallaxAnimation();
});

/**
 * ============================================================================
 * TAB SWITCHING LOGIC
 * ============================================================================
 */

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Get the target tab ID
      const targetTabId = button.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) {
        targetContent.classList.add('active');

        // Trigger audio feedback
        playTabSound();

        // Add glitch effect to heading (optional visual feedback)
        const heading = targetContent.querySelector('h1');
        if (heading) {
          heading.classList.add('glitch-text');
          setTimeout(() => heading.classList.remove('glitch-text'), 300);
        }
      }
    });
  });

  // Activate first tab by default
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
}

/**
 * ============================================================================
 * AUDIO FEEDBACK (Optional - placeholder for sound effects)
 * ============================================================================
 */

function initAudioFeedback() {
  // Check if browser supports Web Audio API
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn('Web Audio API not supported');
    return;
  }

  // Initialize audio context on first user interaction
  if (!window.audioContextInitialized) {
    const initAudio = () => {
      if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      document.removeEventListener('click', initAudio);
      window.audioContextInitialized = true;
    };
    document.addEventListener('click', initAudio);
  }
}

/**
 * Play a simple beep sound for tab switching (optional)
 * Creates a pure sine wave tone
 */
function playTabSound() {
  if (!window.audioContext) {
    return;
  }

  const { audioContext } = window;
  const now = audioContext.currentTime;

  // Create oscillator for a beep sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Frequency: 880 Hz (A5 note - cyberpunk beep)
  oscillator.frequency.value = 880;
  oscillator.type = 'sine';

  // Volume envelope
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  // Play for 100ms
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

/**
 * ============================================================================
 * CURSOR EFFECTS (Crosshair cursor visual feedback)
 * ============================================================================
 */

function initCursorEffects() {
  const cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  document.body.appendChild(cursor);

  // Position cursor based on mouse movement
  document.addEventListener('mousemove', (e) => {
    const left = `${e.clientX - 10}px`;
    const top = `${e.clientY - 10}px`;
    cursor.style.left = left;
    cursor.style.top = top;
  });

  // Hide cursor on mouse leave
  document.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.display = 'block';
  });
}

/**
 * ============================================================================
 * PARALLAX ANIMATION FOR STAR LAYERS
 * ============================================================================
 */

function initParallaxAnimation() {
  // The CSS animations handle the parallax effect
  // This function can be expanded for more complex interactions if needed

  const starsLayer1 = document.querySelector('.stars-layer-1');
  const starsLayer2 = document.querySelector('.stars-layer-2');
  const starsLayer3 = document.querySelector('.stars-layer-3');

  if (!starsLayer1 || !starsLayer2 || !starsLayer3) {
    console.warn('Star layers not found - skipping parallax setup');
    return;
  }

  // Optional: Pause animation on hover for visual clarity
  const spaceBackground = document.querySelector('.space-background');
  if (spaceBackground) {
    spaceBackground.addEventListener('mouseenter', function () {
      this.style.animationPlayState = 'paused';
    });

    spaceBackground.addEventListener('mouseleave', function () {
      this.style.animationPlayState = 'running';
    });
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Toggle visibility of an element
 */
// eslint-disable-next-line no-unused-vars
function toggleElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const display = element.style.display === 'none' ? 'block' : 'none';
    element.style.display = display;
  }
}

/**
 * Add or remove a class from an element
 */
// eslint-disable-next-line no-unused-vars
function toggleClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Scroll to element smoothly
 */
// eslint-disable-next-line no-unused-vars
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * ============================================================================
 * KEYBOARD NAVIGATION (Accessibility enhancement)
 * ============================================================================
 */

document.addEventListener('keydown', (e) => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const activeButton = document.querySelector('.tab-button.active');

  if (!activeButton) {
    return;
  }

  let targetIndex = Array.from(tabButtons).indexOf(activeButton);

  // Left arrow or Up arrow - previous tab
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    targetIndex = (targetIndex - 1 + tabButtons.length) % tabButtons.length;
    tabButtons[targetIndex].click();
  }

  // Right arrow or Down arrow - next tab
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    targetIndex = (targetIndex + 1) % tabButtons.length;
    tabButtons[targetIndex].click();
  }

  // Home key - first tab
  if (e.key === 'Home') {
    e.preventDefault();
    tabButtons[0].click();
  }

  // End key - last tab
  if (e.key === 'End') {
    e.preventDefault();
    tabButtons[tabButtons.length - 1].click();
  }
});

/**
 * ============================================================================
 * LAZY LOAD IMAGES (Performance optimization for slides)
 * ============================================================================
 */

function initLazyLoading() {
  if (typeof IntersectionObserver !== 'undefined') {
    // eslint-disable-next-line no-undef
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src]').forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }
}

// Initialize lazy loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLazyLoading);
} else {
  initLazyLoading();
}

/**
 * ============================================================================
 * TERMINAL TYPING EFFECT (Optional enhancement for intro text)
 * ============================================================================
 */

function typeWriter(element, text, speed = 50) {
  if (!element) {
    return;
  }

  element.textContent = '';
  let index = 0;

  function type() {
    if (index < text.length) {
      const char = text.charAt(index);
      element.textContent = (element.textContent || '') + char;
      index += 1;
      setTimeout(type, speed);
    }
  }

  type();
}

// Apply typing effect to terminal subtitle if it exists
window.addEventListener('load', () => {
  const subtitle = document.querySelector('.terminal-subtitle');
  if (subtitle && subtitle.textContent.trim()) {
    const originalText = subtitle.textContent;
    typeWriter(subtitle, originalText, 30);
  }
});
