const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navLinks.classList.toggle('open', !isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    navLinks.classList.remove('open');
  });
});

const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('nevan-theme');
document.body.classList.toggle('dark', savedTheme !== 'light');
updateThemeButton();

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('nevan-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeButton();
});

function updateThemeButton() {
  const isDark = document.body.classList.contains('dark');
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#11121d' : '#f7f8fc');
}

document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('.skills-grid .skill-group').forEach((item) => item.classList.add('reveal', 'reveal-child'));
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealOrder = new Map();
  revealItems.forEach((item) => {
    const group = item.parentElement;
    const order = revealOrder.get(group) || 0;
    revealOrder.set(group, order + 1);
    item.style.setProperty('--reveal-delay', `${Math.min(order * 90, 360)}ms`);
    if (order % 3 === 1) item.classList.add('reveal-from-side');
  });
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// Subtle pointer-following light and tilt on project cards (desktop pointer devices only).
const pointerMotion = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (pointerMotion.matches && !reducedMotion.matches) {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const tiltX = ((x / bounds.width) - 0.5) * 2.4;
      const tiltY = ((0.5 - y / bounds.height)) * 2.4;
      card.style.setProperty('--pointer-x', `${x}px`);
      card.style.setProperty('--pointer-y', `${y}px`);
      card.style.setProperty('--tilt-x', `${tiltX}deg`);
      card.style.setProperty('--tilt-y', `${tiltY}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
}

// A soft, responsive spotlight follows the pointer around the portrait area.
const portraitArea = document.querySelector('.hero-art');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (portraitArea && finePointer.matches && !motionPreference.matches) {
  portraitArea.addEventListener('pointermove', (event) => {
    const bounds = portraitArea.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    const movement = Math.min(1, Math.hypot(event.movementX || 0, event.movementY || 0) / 32);
    portraitArea.style.setProperty('--light-x', `${x}%`);
    portraitArea.style.setProperty('--light-y', `${y}%`);
    portraitArea.style.setProperty('--light-opacity', `${0.68 + movement * 0.3}`);
    portraitArea.classList.add('is-lit');
  });
  portraitArea.addEventListener('pointerleave', () => {
    portraitArea.style.setProperty('--light-x', '50%');
    portraitArea.style.setProperty('--light-y', '48%');
    portraitArea.style.setProperty('--light-opacity', '0.58');
    portraitArea.classList.remove('is-lit');
  });
}

// Keep scroll-driven effects in one animation frame and avoid layout writes.
const progressFill = document.querySelector('.scroll-progress span');
const ambientMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const parallaxStrength = { near: 18, mid: 36, far: 10, lines: 58 };
const smoothRamp = (value) => value * value * (3 - 2 * value);
let scrollFramePending = false;
const updateScrollEffects = () => {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(() => {
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
    document.body.style.setProperty('--scroll-progress', progress.toFixed(3));
    if (!ambientMotionPreference.matches) {
      const hue = progress < 0.5
        ? 212 + 64 * smoothRamp(progress * 2)
        : 276 - 102 * smoothRamp((progress - 0.5) * 2);
      document.body.style.setProperty('--scroll-hue', hue.toFixed(1));
      document.body.style.setProperty('--parallax-near', `${(-parallaxStrength.near * progress).toFixed(1)}px`);
      document.body.style.setProperty('--parallax-mid', `${(-parallaxStrength.mid * progress).toFixed(1)}px`);
      document.body.style.setProperty('--parallax-far', `${(-parallaxStrength.far * progress).toFixed(1)}px`);
      document.body.style.setProperty('--parallax-lines', `${(-parallaxStrength.lines * progress).toFixed(1)}px`);
    }
    progressFill?.style.setProperty('transform', `scaleX(${progress})`);
    scrollFramePending = false;
  });
};
window.addEventListener('scroll', updateScrollEffects, { passive: true });
window.addEventListener('resize', updateScrollEffects, { passive: true });
updateScrollEffects();

// A softly eased color wash follows a fine pointer on desktop only.
const ambientCursorGlow = document.querySelector('.ambient-cursor-glow');
const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (ambientCursorGlow && desktopPointer.matches && !ambientMotionPreference.matches) {
  let cursorFramePending = false;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  window.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    if (cursorFramePending) return;
    cursorFramePending = true;
    requestAnimationFrame(() => {
      ambientCursorGlow.style.setProperty('--cursor-x', `${cursorX}px`);
      ambientCursorGlow.style.setProperty('--cursor-y', `${cursorY}px`);
      ambientCursorGlow.classList.add('is-active');
      cursorFramePending = false;
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => ambientCursorGlow.classList.remove('is-active'));
}

// Mark the section nearest the viewport's reading line in the sticky navigation.
const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const observedSections = sectionLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(({ section }) => section);
if ('IntersectionObserver' in window && observedSections.length) {
  const activeObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    const readingLine = window.innerHeight * 0.38;
    const activeSection = observedSections.map(({ section }) => section).sort((a, b) =>
      Math.abs(a.getBoundingClientRect().top - readingLine) - Math.abs(b.getBoundingClientRect().top - readingLine)
    )[0];
    observedSections.forEach(({ link, section }) => {
      if (section === activeSection) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
  observedSections.forEach(({ section }) => activeObserver.observe(section));
}

// Copy email and phone links instead of opening a mail or calling app.
const copyToast = document.createElement('div');
copyToast.className = 'copy-toast';
copyToast.setAttribute('role', 'status');
copyToast.setAttribute('aria-live', 'polite');
copyToast.setAttribute('aria-atomic', 'true');
document.body.append(copyToast);
let copyToastTimer;

const fallbackCopy = (value) => {
  const field = document.createElement('textarea');
  const previousFocus = document.activeElement;
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset:auto auto 0 -9999px;opacity:0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand?.('copy') || false;
  field.remove();
  previousFocus?.focus?.();
  return copied;
};

const copyToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Use the selection-based fallback when clipboard permission is unavailable.
    }
  }
  return fallbackCopy(value);
};

document.addEventListener('click', async (event) => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const link = target?.closest('a[href^="mailto:"], a[href^="tel:"]');
  if (!link) return;
  event.preventDefault();
  const href = link.getAttribute('href');
  const value = decodeURIComponent((href.startsWith('mailto:') ? href.slice(7) : href.slice(4)).split('?')[0]);
  const copied = await copyToClipboard(value);
  copyToast.textContent = copied
    ? (href.startsWith('mailto:') ? 'Email copied' : 'Phone number copied')
    : 'Could not copy. Please try again.';
  copyToast.classList.add('is-visible');
  window.clearTimeout(copyToastTimer);
  copyToastTimer = window.setTimeout(() => copyToast.classList.remove('is-visible'), 2400);
});
