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
if (savedTheme === 'dark') document.body.classList.add('dark');
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
}

document.getElementById('year').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
