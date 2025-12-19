/**
 * ============================================================================
 * STAR COMMAND ACADEMY - Game Page Interactivity
 * Handles tab switching, animations, and user interactions
 * ============================================================================
 *
 * GOOGLE ANALYTICS EVENTS TRACKED:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. tab_click
 *    - Tracks lesson/tab navigation (HOME, LESSON 1-4)
 *    - Helps understand learning path progression
 *    - Category: Navigation
 *
 * 2. lesson_link_click
 *    - Tracks clicks on lesson links in home tab
 *    - Shows user engagement with course overview
 *    - Category: Learning
 *
 * 3. external_link_click
 *    - Tracks clicks to external resources (MakeCode, GitHub, Gemini, etc.)
 *    - Shows resource utilization
 *    - Category: Outbound
 *
 * 4. page_view
 *    - Tracks initial page load
 *    - Basic engagement metric
 *    - Category: Engagement
 *
 * 5. scroll_depth
 *    - Tracks scroll milestones (25%, 50%, 75%, 100%)
 *    - Shows content engagement depth
 *    - Category: Engagement
 *
 * Best Practices Followed:
 * • Event-based tracking (GA4 recommended approach)
 * • Descriptive event names and labels
 * • Consistent event categories
 * • Non-intrusive tracking (doesn't impact UX)
 * • Scroll depth fires only once per threshold
 * • Tab tracking works with keyboard navigation too
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCursorEffects();
  initAudioFeedback();
  initParallaxAnimation();
  initExternalLinkTracking();
  initLessonLinkTracking();
  trackPageView();
});

/**
 * ============================================================================
 * GOOGLE ANALYTICS EVENT TRACKING
 * ============================================================================
 */

function trackEvent(eventName, eventData = {}) {
  if (typeof gtag !== 'undefined') {
    // eslint-disable-next-line no-undef
    gtag('event', eventName, eventData);
  }
}

/**
 * ============================================================================
 * TAB SWITCHING LOGIC
 * ============================================================================
 */

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', (evt) => {
      evt.preventDefault();

      // Get the target tab ID
      const targetTabId = button.getAttribute('data-tab');
      const tabName = button.textContent.trim();

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) {
        targetContent.classList.add('active');

        // Track tab navigation event
        trackEvent('tab_click', {
          event_category: 'Navigation',
          event_label: tabName,
          tab_id: targetTabId,
        });

        // Scroll to top smoothly
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

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
 * EXTERNAL LINK TRACKING
 * ============================================================================
 */

function initExternalLinkTracking() {
  const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="https"]');

  externalLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const url = link.href;
      const linkText = link.textContent.trim();
      // eslint-disable-next-line no-undef
      const domain = new URL(url).hostname;

      trackEvent('external_link_click', {
        event_category: 'Outbound',
        event_label: linkText || domain,
        link_url: domain,
      });
    });
  });
}

/**
 * ============================================================================
 * LESSON LINK TRACKING (From home tab)
 * ============================================================================
 */

function initLessonLinkTracking() {
  const lessonLinks = document.querySelectorAll('.data-card a[onclick*="lesson"]');

  lessonLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const lessonText = link.textContent.trim();
      const onclickAttr = link.getAttribute('onclick');
      const lessonMatch = onclickAttr ? onclickAttr.match(/data-tab=lesson(\d)/) : null;
      const lessonNumber = lessonMatch ? lessonMatch[1] : 'unknown';

      trackEvent('lesson_link_click', {
        event_category: 'Learning',
        event_label: lessonText,
        lesson_number: lessonNumber,
      });
    });
  });
}

/**
 * ============================================================================
 * PAGE VIEW TRACKING
 * ============================================================================
 */

function trackPageView() {
  trackEvent('page_view', {
    event_category: 'Engagement',
    event_label: 'Game Page Loaded',
    page_title: document.title,
  });
}

/**
 * ============================================================================
 * SCROLL DEPTH TRACKING
 * ============================================================================
 */

function initScrollDepthTracking() {
  let scrolled25 = false;
  let scrolled50 = false;
  let scrolled75 = false;
  let scrolled100 = false;

  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

    if (scrollPercentage > 0.25 && !scrolled25) {
      scrolled25 = true;
      trackEvent('scroll_depth', {
        event_category: 'Engagement',
        event_label: '25%',
        scroll_depth: '25',
      });
    }

    if (scrollPercentage > 0.5 && !scrolled50) {
      scrolled50 = true;
      trackEvent('scroll_depth', {
        event_category: 'Engagement',
        event_label: '50%',
        scroll_depth: '50',
      });
    }

    if (scrollPercentage > 0.75 && !scrolled75) {
      scrolled75 = true;
      trackEvent('scroll_depth', {
        event_category: 'Engagement',
        event_label: '75%',
        scroll_depth: '75',
      });
    }

    if (scrollPercentage > 0.95 && !scrolled100) {
      scrolled100 = true;
      trackEvent('scroll_depth', {
        event_category: 'Engagement',
        event_label: '100%',
        scroll_depth: '100',
      });
    }
  });
}

// Initialize scroll depth tracking
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollDepthTracking);
} else {
  initScrollDepthTracking();
}

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
