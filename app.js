/* ═══════════════════════════════════════════════════
   APP.JS — Girlfriend's Day Digital Experience
   ═══════════════════════════════════════════════════

   ┌─ CONFIGURATION ─────────────────────────────────
   │  To set the countdown target date:
   │  Change COUNTDOWN_TARGET below to the date and
   │  time of your next physical meeting.
   │
   │  Format: 'YYYY-MM-DDTHH:MM:SS'
   │  Example: '2026-10-15T18:00:00'
   └─────────────────────────────────────────────────
*/

const COUNTDOWN_TARGET = '2026-12-25T18:00:00'; // ← CHANGE THIS DATE

/* ─────────────────────────────────────────────────
   PAGE NAVIGATION
   ───────────────────────────────────────────────── */

let currentPage = 0;
const totalPages = 4;
const pages = document.querySelectorAll('.page');
const dots  = document.querySelectorAll('.dot');

function navigateTo(index) {
  if (index === currentPage) return;

  const prev = pages[currentPage];
  const next = pages[index];

  // Exit current
  prev.classList.remove('active');
  prev.classList.add('exit');

  // Small delay to allow exit animation before removing
  setTimeout(() => {
    prev.classList.remove('exit');
  }, 700);

  // Enter next
  next.classList.add('active');
  currentPage = index;

  // Update dots
  dots.forEach((d, i) => d.classList.toggle('active', i === index));

  // Page-specific init
  if (index === 1) initTimeline();
  if (index === 2) { drawWheel(); initCountdown(); }
  if (index === 3) initEnvelopePage();
}

// Dot navigation
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => navigateTo(i));
});

/* ─────────────────────────────────────────────────
   AUDIO PLAYER
   ───────────────────────────────────────────────── */

const audio     = document.getElementById('bg-audio');
const audioBtn  = document.getElementById('audio-btn');
const audioIcon = document.getElementById('audio-icon');
const audioLbl  = document.getElementById('audio-label');
let isPlaying   = false;

function toggleAudio() {
  if (isPlaying) {
    audio.pause();
    audioBtn.classList.remove('playing');
    audioLbl.textContent = 'PLAY';
    isPlaying = false;
  } else {
    audio.play().then(() => {
      audioBtn.classList.add('playing');
      audioLbl.textContent = 'PAUSE';
      isPlaying = true;
    }).catch(() => {
      // Autoplay blocked — already handled by button
    });
  }
}

audioBtn.addEventListener('click', toggleAudio);

// Attempt autoplay on load
window.addEventListener('load', () => {
  audio.volume = 0.35;
  audio.play().then(() => {
    audioBtn.classList.add('playing');
    audioLbl.textContent = 'PAUSE';
    isPlaying = true;
  }).catch(() => {
    // Autoplay blocked — button is visible for user to trigger
  });
});

/* ─────────────────────────────────────────────────
   PAGE 1 — LANDING: SVG ARC ANIMATION
   ───────────────────────────────────────────────── */

function initLanding() {
  const arcPath = document.getElementById('arc-path');
  const blrDot  = document.getElementById('blr-dot');
  const gnDot   = document.getElementById('gn-dot');

  // Animate arc drawing
  if (arcPath) {
    setTimeout(() => {
      arcPath.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
      arcPath.style.strokeDashoffset = '0';
    }, 400);
  }

  // Fade in city dots after arc starts drawing
  if (blrDot) {
    setTimeout(() => {
      blrDot.style.transition = 'opacity 0.6s ease';
      blrDot.style.opacity = '1';
    }, 600);
  }
  if (gnDot) {
    setTimeout(() => {
      gnDot.style.transition = 'opacity 0.6s ease';
      gnDot.style.opacity = '1';
    }, 1800);
  }
}

// Initialize landing on first load
window.addEventListener('DOMContentLoaded', () => {
  initLanding();
});

/* ─────────────────────────────────────────────────
   PAGE 2 — TIMELINE: HOLD TO REVEAL
   ───────────────────────────────────────────────── */

let timelineInited = false;

function initTimeline() {
  if (timelineInited) return;
  timelineInited = true;

  // Intersection observer for scroll reveal
  const nodes = document.querySelectorAll('.timeline-node');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  nodes.forEach(node => observer.observe(node));

  // Hold-to-reveal interaction
  const frames = document.querySelectorAll('.media-frame');
  frames.forEach(frame => setupHoldReveal(frame));
}

function setupHoldReveal(frame) {
  let holdTimer = null;
  const HOLD_DURATION = 800; // ms

  function startHold() {
    if (frame.classList.contains('revealed')) return;
    frame.classList.add('holding');
    holdTimer = setTimeout(() => {
      frame.classList.remove('holding');
      frame.classList.add('revealed');
      // Unlock the dot icon
      const nodeEl = frame.closest('.timeline-node');
      if (nodeEl) {
        const dot = nodeEl.querySelector('.node-dot');
        if (dot) {
          dot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`;
          dot.style.borderColor = 'rgba(232,165,152,0.6)';
          dot.style.boxShadow = '0 0 25px rgba(232,165,152,0.2)';
        }
      }
    }, HOLD_DURATION);
  }

  function endHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    frame.classList.remove('holding');
  }

  // Mouse events
  frame.addEventListener('mousedown', startHold);
  frame.addEventListener('mouseup', endHold);
  frame.addEventListener('mouseleave', endHold);

  // Touch events
  frame.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold();
  }, { passive: false });

  frame.addEventListener('touchend', endHold);
  frame.addEventListener('touchcancel', endHold);
}

/* ─────────────────────────────────────────────────
   PAGE 3 — SPINNER WHEEL
   ───────────────────────────────────────────────── */

const WHEEL_CATEGORIES = [
  'ROM-COM',
  'ACTION',
  'THRILLER',
  'REWATCH ♥',
  'MYSTERY',
  'COMEDY'
];

const WHEEL_COLORS = [
  '#2a1a1a',
  '#1a1f2a',
  '#1a2a1f',
  '#2a1a24',
  '#24201a',
  '#1a242a'
];

const WHEEL_BORDER = [
  '#e8a598',
  '#8ab4cc',
  '#8acca0',
  '#cc8ab4',
  '#ccc08a',
  '#8ab4cc'
];

let wheelAngle = 0;
let isSpinning = false;

function drawWheel(rotation = 0) {
  const canvas = document.getElementById('spinner-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r  = Math.min(cx, cy) - 8;
  const numSlices = WHEEL_CATEGORIES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  ctx.clearRect(0, 0, W, H);

  // Draw slices
  for (let i = 0; i < numSlices; i++) {
    const startAngle = rotation + i * sliceAngle;
    const endAngle   = startAngle + sliceAngle;
    const midAngle   = startAngle + sliceAngle / 2;

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();

    // Slice border
    ctx.strokeStyle = WHEEL_BORDER[i % WHEEL_BORDER.length];
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f0ede8';
    ctx.font = `600 ${Math.max(10, r * 0.11)}px Inter, sans-serif`;
    ctx.fillText(WHEEL_CATEGORIES[i], r - 14, 4);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#0e0e0e';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,165,152,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pointer indicator at top
  ctx.save();
  ctx.translate(cx, cy - r + 4);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-8, 8);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fillStyle = '#e8a598';
  ctx.fill();
  ctx.restore();
}

function spinWheel() {
  if (isSpinning) return;

  const btn = document.getElementById('spin-btn');
  const result = document.getElementById('spin-result');
  if (!btn || !result) return;

  isSpinning = true;
  btn.disabled = true;
  result.textContent = '';

  const numSlices = WHEEL_CATEGORIES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Random extra spins + random landing
  const extraSpins   = (Math.floor(Math.random() * 5) + 5) * 2 * Math.PI;
  const targetSlice  = Math.floor(Math.random() * numSlices);
  const targetAngle  = wheelAngle + extraSpins + (2 * Math.PI - (targetSlice * sliceAngle));
  const duration     = 3000 + Math.random() * 1000;
  const startTime    = performance.now();
  const startAngle   = wheelAngle;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOut(progress);

    wheelAngle = startAngle + (targetAngle - startAngle) * easedProgress;
    drawWheel(wheelAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelAngle = targetAngle % (2 * Math.PI);
      isSpinning = false;
      btn.disabled = false;

      // Determine selected slice
      const normalizedAngle = ((2 * Math.PI) - (wheelAngle % (2 * Math.PI))) % (2 * Math.PI);
      const selected = Math.floor(normalizedAngle / sliceAngle) % numSlices;
      result.textContent = WHEEL_CATEGORIES[selected];

      // Animate result in
      result.style.transition = 'none';
      result.style.transform = 'scale(1.3)';
      result.style.opacity = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          result.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s';
          result.style.transform = 'scale(1)';
          result.style.opacity = '1';
        });
      });
    }
  }

  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
  const spinBtn = document.getElementById('spin-btn');
  if (spinBtn) spinBtn.addEventListener('click', spinWheel);
});

/* ─────────────────────────────────────────────────
   PAGE 3 — COUNTDOWN TIMER
   ───────────────────────────────────────────────── */

let countdownInited = false;
let countdownInterval = null;

function initCountdown() {
  if (countdownInited) return;
  countdownInited = true;

  function tick() {
    const now    = new Date();
    const target = new Date(COUNTDOWN_TARGET);
    const diff   = target - now;

    const daysEl    = document.getElementById('cd-days');
    const hoursEl   = document.getElementById('cd-hours');
    const minsEl    = document.getElementById('cd-minutes');
    const secsEl    = document.getElementById('cd-seconds');

    if (!daysEl) return;

    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      clearInterval(countdownInterval);
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent    = String(days).padStart(2, '0');
    hoursEl.textContent   = String(hours).padStart(2, '0');
    minsEl.textContent    = String(minutes).padStart(2, '0');
    secsEl.textContent    = String(seconds).padStart(2, '0');

    // Pulse animation on seconds change
    secsEl.classList.remove('tick');
    void secsEl.offsetWidth; // reflow
    secsEl.classList.add('tick');
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* ─────────────────────────────────────────────────
   PAGE 4 — ENVELOPE INTERACTION
   ───────────────────────────────────────────────── */

let envelopeOpened = false;

function initEnvelopePage() {
  // No special init needed — envelope handles click itself
}

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const envelope = document.getElementById('envelope');
  const hint     = document.getElementById('env-tap-hint');
  const overlay  = document.getElementById('letter-overlay');

  // Start envelope open animation
  envelope.classList.add('opening');
  if (hint) hint.style.opacity = '0';

  // After envelope animation, show letter
  setTimeout(() => {
    if (overlay) {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
    }
  }, 900);
}

function closeLetter() {
  const overlay  = document.getElementById('letter-overlay');
  const envelope = document.getElementById('envelope');

  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  // Reset envelope for re-reading
  setTimeout(() => {
    envelopeOpened = false;
    if (envelope) envelope.classList.remove('opening');
    const hint = document.getElementById('env-tap-hint');
    if (hint) hint.style.opacity = '';
  }, 600);
}

// Keyboard accessibility for envelope
document.addEventListener('DOMContentLoaded', () => {
  const envelope = document.getElementById('envelope');
  if (envelope) {
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }
});

/* ─────────────────────────────────────────────────
   TICK ANIMATION CSS-IN-JS
   ───────────────────────────────────────────────── */

const tickStyle = document.createElement('style');
tickStyle.textContent = `
  @keyframes tickPulse {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.08); color: #f5c2b6; }
    100% { transform: scale(1); }
  }
  .tick { animation: tickPulse 0.3s ease; }
`;
document.head.appendChild(tickStyle);

/* ─────────────────────────────────────────────────
   SWIPE NAVIGATION (MOBILE)
   ───────────────────────────────────────────────── */

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Only clearly horizontal swipes (2:1 ratio), minimum 70px
  if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 70) {
    // Don't swipe-navigate if user is mid-scroll on a scrollable page
    const activePage = pages[currentPage];
    const atTop    = activePage.scrollTop <= 5;
    const atBottom = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 5;
    const notScrollable = activePage.scrollHeight <= activePage.clientHeight + 5;

    // Allow navigation if at edges of scroll or page isn't scrollable
    if (dx < 0 && currentPage < totalPages - 1 && (atBottom || notScrollable)) {
      navigateTo(currentPage + 1);
    } else if (dx > 0 && currentPage > 0 && (atTop || notScrollable)) {
      navigateTo(currentPage - 1);
    }
  }
}, { passive: true });

/* ─────────────────────────────────────────────────
   KEYBOARD NAVIGATION (DESKTOP)
   ───────────────────────────────────────────────── */

document.addEventListener('keydown', (e) => {
  if (document.getElementById('letter-overlay').classList.contains('open')) return;

  if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
    navigateTo(currentPage + 1);
  } else if (e.key === 'ArrowLeft' && currentPage > 0) {
    navigateTo(currentPage - 1);
  }
});

/* Arc animation is initialized via DOMContentLoaded → initLanding() above */
