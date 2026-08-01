/* ═══════════════════════════════════════════════════
   APP.JS — Girlfriend's Day Digital Experience (v2)
   ═══════════════════════════════════════════════════

   ┌─ CONFIGURATION ─────────────────────────────────
   │  COUNTDOWN_TARGET: Set to the date & time of
   │  your next physical meeting in January.
   │
   │  Format: 'YYYY-MM-DDTHH:MM:SS' (local time)
   │  Current setting: January 15, 2027 at noon
   └─────────────────────────────────────────────────
*/

const COUNTDOWN_TARGET = '2027-01-05T12:00:00'; // Set to January 5, 2027

/* ─────────────────────────────────────────────────
   PAGE NAVIGATION
   ───────────────────────────────────────────────── */

let currentPage = 0;
const totalPages = 6;
const pages = document.querySelectorAll('.page');
const dots  = document.querySelectorAll('.dot');

function navigateTo(index) {
  if (index === currentPage) return;

  const prev = pages[currentPage];
  const next = pages[index];

  prev.classList.remove('active');
  prev.classList.add('exit');

  setTimeout(() => {
    prev.classList.remove('exit');
  }, 700);

  next.classList.add('active');
  currentPage = index;

  dots.forEach((d, i) => d.classList.toggle('active', i === index));

  if (index === 1) initTimeline();
  if (index === 2) { drawWheel(); drawGameWheel(); initCountdown(); }
  if (index === 5) initEnvelopePage();
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => navigateTo(i));
});

/* ─────────────────────────────────────────────────
   AUDIO PLAYER
   ───────────────────────────────────────────────── */

const audio    = document.getElementById('bg-audio');
const audioBtn = document.getElementById('audio-btn');
const audioLbl = document.getElementById('audio-label');
let isPlaying  = false;

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
      // Autoplay blocked — button visible
    });
  }
}

audioBtn.addEventListener('click', toggleAudio);

window.addEventListener('load', () => {
  audio.volume = 0.4;
  audio.play().then(() => {
    audioBtn.classList.add('playing');
    audioLbl.textContent = 'PAUSE';
    isPlaying = true;
  }).catch(() => {
    // Autoplay blocked — show PLAY button
  });
});

/* ─────────────────────────────────────────────────
   PAGE 1 — LANDING: SVG ARC + CITY DOT ANIMATION
   ───────────────────────────────────────────────── */

function initLanding() {
  const arcPath = document.getElementById('arc-path');
  const blrDot  = document.getElementById('blr-dot');
  const gnDot   = document.getElementById('gn-dot');

  if (arcPath) {
    setTimeout(() => {
      arcPath.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
      arcPath.style.strokeDashoffset = '0';
    }, 400);
  }

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

window.addEventListener('DOMContentLoaded', () => {
  initLanding();
});

/* ─────────────────────────────────────────────────
   PAGE 2 — TIMELINE: HOLD TO REVEAL (FIXED)
   ───────────────────────────────────────────────── */

let timelineInited = false;

function initTimeline() {
  if (timelineInited) return;
  timelineInited = true;

  // Intersection observer for scroll reveal
  const nodes = document.querySelectorAll('.timeline-node');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  nodes.forEach(node => observer.observe(node));

  // Setup hold-to-reveal for each frame
  document.querySelectorAll('.media-frame').forEach((frame, i) => {
    setupHoldReveal(frame, i);
  });
}

function setupHoldReveal(frame, index) {
  let holdTimer = null;
  let progressTimer = null;
  const HOLD_DURATION = 700; // ms — reduced slightly for better UX

  const progressBar = frame.querySelector('.hold-progress-bar');
  const dotEl = document.getElementById(`dot-${index}`);

  function startHold(e) {
    if (frame.classList.contains('revealed')) return;
    // Don't prevent default here — caused issues on some mobile browsers
    frame.classList.add('holding');
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      // Force reflow
      void progressBar.offsetWidth;
      progressBar.style.transition = `width ${HOLD_DURATION}ms linear`;
      progressBar.style.width = '100%';
    }

    holdTimer = setTimeout(() => {
      frame.classList.remove('holding');
      frame.classList.add('revealed');

      // Update dot icon to unlocked
      if (dotEl) {
        dotEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
        dotEl.style.background = 'var(--accent)';
        dotEl.style.color = '#fff';
      }
    }, HOLD_DURATION);
  }

  function cancelHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    frame.classList.remove('holding');
    if (progressBar) {
      progressBar.style.transition = 'width 0.2s ease';
      progressBar.style.width = '0%';
    }
  }

  // ── MOUSE events ──────────────────────────────
  frame.addEventListener('mousedown', startHold);
  frame.addEventListener('mouseup', cancelHold);
  frame.addEventListener('mouseleave', cancelHold);

  // ── TOUCH events (mobile) ─────────────────────
  frame.addEventListener('touchstart', (e) => {
    // Prevent iOS context menu / callout
    e.preventDefault();
    startHold(e);
  }, { passive: false });

  frame.addEventListener('touchend', (e) => {
    e.preventDefault();
    cancelHold();
  }, { passive: false });

  frame.addEventListener('touchcancel', cancelHold, { passive: true });

  // Also prevent contextmenu on hold
  frame.addEventListener('contextmenu', (e) => e.preventDefault());
}

/* ─────────────────────────────────────────────────
   PAGE 3 — MOVIE NIGHT SPINNER WHEEL
   ───────────────────────────────────────────────── */

const MOVIE_CATEGORIES = [
  'ROM-COM 🥰',
  'ACTION 💥',
  'THRILLER 😱',
  'REWATCH ♥',
  'MYSTERY 🔍',
  'COMEDY 😂'
];

// Pink-toned palette for movie wheel
const MOVIE_COLORS = [
  '#ffe0e8', // blush
  '#ffd6e8', // rose
  '#ffe8f0', // light pink
  '#ffc8dc', // medium pink
  '#ffebf2', // pale blush
  '#ffd0e4', // soft rose
];

const MOVIE_STROKES = [
  '#d4547a', '#e07a5f', '#c8547a', '#d4547a', '#e07a5f', '#c8547a'
];

let movieAngle  = 0;
let movieSpinning = false;

function drawWheel(rotation = 0) {
  const canvas = document.getElementById('spinner-canvas');
  if (!canvas) return;
  drawWheelOnCanvas(canvas, MOVIE_CATEGORIES, MOVIE_COLORS, MOVIE_STROKES, rotation);
}

function drawWheelOnCanvas(canvas, categories, colors, strokes, rotation) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;
  const cx  = W / 2;
  const cy  = H / 2;
  const r   = Math.min(cx, cy) - 10;
  const n   = categories.length;
  const sliceAngle = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, W, H);

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#f5c2ce';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < n; i++) {
    const start = rotation + i * sliceAngle;
    const end   = start + sliceAngle;
    const mid   = start + sliceAngle / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = strokes[i % strokes.length];
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#7a2040';
    ctx.font = `600 ${Math.max(9, r * 0.1)}px Inter, sans-serif`;
    ctx.fillText(categories[i], r - 12, 5);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff8f9';
  ctx.fill();
  ctx.strokeStyle = '#d4547a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#d4547a';
  ctx.font = '14px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('♥', cx, cy + 5);

  // Pointer (top)
  ctx.save();
  ctx.translate(cx, cy - r - 2);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-8, 6);
  ctx.lineTo(8, 6);
  ctx.closePath();
  ctx.fillStyle = '#d4547a';
  ctx.fill();
  ctx.restore();
}

function spinWheel() {
  if (movieSpinning) return;
  const btn    = document.getElementById('spin-btn');
  const result = document.getElementById('spin-result');
  if (!btn || !result) return;

  movieSpinning = true;
  btn.disabled  = true;
  result.textContent = '';

  const n          = MOVIE_CATEGORIES.length;
  const sliceAngle = (2 * Math.PI) / n;
  const extraSpins = (Math.floor(Math.random() * 5) + 5) * 2 * Math.PI;
  const targetIdx  = Math.floor(Math.random() * n);
  const targetAng  = movieAngle + extraSpins + (2 * Math.PI - (targetIdx * sliceAngle));
  const duration   = 3500 + Math.random() * 1000;
  const startTime  = performance.now();
  const startAng   = movieAngle;

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    movieAngle = startAng + (targetAng - startAng) * easeOut(progress);
    drawWheel(movieAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      movieAngle = targetAng % (2 * Math.PI);
      movieSpinning = false;
      btn.disabled  = false;

      const norm     = ((2 * Math.PI) - (movieAngle % (2 * Math.PI))) % (2 * Math.PI);
      const selected = Math.floor(norm / sliceAngle) % n;
      showResult(result, MOVIE_CATEGORIES[selected]);
    }
  }
  requestAnimationFrame(animate);
}

/* ─────────────────────────────────────────────────
   PAGE 3 — GAME NIGHT SPINNER WHEEL
   ───────────────────────────────────────────────── */

const GAME_CATEGORIES = [
  'TABLE TENNIS 🏓',
  'CHESS ♟️',
  'MINECRAFT ⛏️',
  'SKRIBBL 🎨',
  'LUDO 🎲',
  'ONLINE QUIZ 🧠'
];

const GAME_COLORS = [
  '#e8f4ff', // light blue
  '#ffeae8', // soft peach
  '#e8ffe8', // light mint
  '#fff5e8', // warm cream
  '#f0e8ff', // light lavender
  '#e8fff5', // mint
];

const GAME_STROKES = [
  '#5b9bd5', '#d4547a', '#4caf7d', '#e07a5f', '#8b5cf6', '#38bdf8'
];

let gameAngle    = 0;
let gameSpinning = false;

function drawGameWheel(rotation = 0) {
  const canvas = document.getElementById('game-spinner-canvas');
  if (!canvas) return;
  drawWheelOnCanvas(canvas, GAME_CATEGORIES, GAME_COLORS, GAME_STROKES, rotation);

  // Override center circle to use game icon
  const ctx = canvas.getContext('2d');
  const cx  = canvas.width / 2;
  const cy  = canvas.height / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff8f9';
  ctx.fill();
  ctx.strokeStyle = '#5b9bd5';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#5b9bd5';
  ctx.font = '13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('🎮', cx, cy + 5);
}

function spinGameWheel() {
  if (gameSpinning) return;
  const btn    = document.getElementById('game-spin-btn');
  const result = document.getElementById('game-spin-result');
  if (!btn || !result) return;

  gameSpinning = true;
  btn.disabled = true;
  result.textContent = '';

  const n          = GAME_CATEGORIES.length;
  const sliceAngle = (2 * Math.PI) / n;
  const extraSpins = (Math.floor(Math.random() * 5) + 5) * 2 * Math.PI;
  const targetIdx  = Math.floor(Math.random() * n);
  const targetAng  = gameAngle + extraSpins + (2 * Math.PI - (targetIdx * sliceAngle));
  const duration   = 3000 + Math.random() * 1200;
  const startTime  = performance.now();
  const startAng   = gameAngle;

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    gameAngle = startAng + (targetAng - startAng) * easeOut(progress);
    drawGameWheel(gameAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      gameAngle = targetAng % (2 * Math.PI);
      gameSpinning = false;
      btn.disabled = false;

      const norm     = ((2 * Math.PI) - (gameAngle % (2 * Math.PI))) % (2 * Math.PI);
      const selected = Math.floor(norm / sliceAngle) % n;
      showResult(result, GAME_CATEGORIES[selected]);
    }
  }
  requestAnimationFrame(animate);
}

/* Shared result animation */
function showResult(el, text) {
  el.textContent = text;
  el.style.transition = 'none';
  el.style.transform = 'scale(1.4)';
  el.style.opacity   = '0';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s';
      el.style.transform  = 'scale(1)';
      el.style.opacity    = '1';
    });
  });
}

/* Attach spin buttons */
window.addEventListener('DOMContentLoaded', () => {
  const spinBtn     = document.getElementById('spin-btn');
  const gameSpinBtn = document.getElementById('game-spin-btn');
  if (spinBtn)     spinBtn.addEventListener('click', spinWheel);
  if (gameSpinBtn) gameSpinBtn.addEventListener('click', spinGameWheel);
});

/* ─────────────────────────────────────────────────
   PAGE 3 — COUNTDOWN TIMER
   ───────────────────────────────────────────────── */

let countdownInited  = false;
let countdownInterval = null;

function initCountdown() {
  if (countdownInited) return;
  countdownInited = true;

  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-minutes');
  const secsEl  = document.getElementById('cd-seconds');

  function tick() {
    if (!daysEl) return;
    const diff = new Date(COUNTDOWN_TARGET) - new Date();

    if (diff <= 0) {
      [daysEl, hoursEl, minsEl, secsEl].forEach(el => el && (el.textContent = '00'));
      clearInterval(countdownInterval);
      return;
    }

    daysEl.textContent  = String(Math.floor(diff / 86400000)).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    minsEl.textContent  = String(Math.floor((diff % 3600000)  / 60000)).padStart(2, '0');
    secsEl.textContent  = String(Math.floor((diff % 60000)    / 1000)).padStart(2, '0');

    secsEl.classList.remove('tick');
    void secsEl.offsetWidth;
    secsEl.classList.add('tick');
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* ─────────────────────────────────────────────────
   PAGE 4 — ENVELOPE INTERACTION
   ───────────────────────────────────────────────── */

let envelopeOpened = false;

function initEnvelopePage() { /* No-op */ }

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const envelope = document.getElementById('envelope');
  const hint     = document.getElementById('env-tap-hint');
  const overlay  = document.getElementById('letter-overlay');

  envelope.classList.add('opening');
  if (hint) hint.style.opacity = '0';

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

  setTimeout(() => {
    envelopeOpened = false;
    if (envelope) envelope.classList.remove('opening');
    const hint = document.getElementById('env-tap-hint');
    if (hint) hint.style.opacity = '';
  }, 600);
}

// Keyboard accessibility
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
   PAGE 4 — WHY I LOVE YOU GENERATOR
   ───────────────────────────────────────────────── */

const LOVE_REASONS = [
  "Your smile on late-night calls makes every single mile disappear instantly.",
  "How you get so passionate and adorable when telling me about your day.",
  "The way your face lit up with your new haircut on video call.",
  "How photogenic we look together, especially in photobooths!",
  "The fact that even 480p screen quality can't hide how stunning you are.",
  "How we turn simple virtual dates into our favorite memories.",
  "Your voice is literally my favorite sound in the whole world.",
  "Because you make counting down the days to January completely worth it.",
  "The way you make me laugh without even trying.",
  "Simply because you're you, and you're mine. ❤️"
];

let currentReasonIdx = 0;

function generateReason() {
  const display = document.getElementById('reason-display');
  const badge = document.getElementById('reason-num');
  const container = document.getElementById('heart-container');
  if (!display || !badge) return;

  currentReasonIdx = (currentReasonIdx + 1) % LOVE_REASONS.length;

  display.style.opacity = '0';
  display.style.transform = 'scale(0.95)';

  setTimeout(() => {
    badge.textContent = currentReasonIdx + 1;
    display.textContent = `"${LOVE_REASONS[currentReasonIdx]}"`;
    display.style.opacity = '1';
    display.style.transform = 'scale(1)';
  }, 200);

  // Burst hearts animation
  if (container) {
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-particle';
      heart.textContent = ['💖', '💕', '💗', '❤️', '🌸'][Math.floor(Math.random() * 5)];
      heart.style.left = `${Math.random() * 80 + 10}%`;
      heart.style.top = `${Math.random() * 40 + 40}%`;
      container.appendChild(heart);

      setTimeout(() => heart.remove(), 1500);
    }
  }
}

/* ─────────────────────────────────────────────────
   PAGE 5 — LOVE COUPONS
   ───────────────────────────────────────────────── */

function redeemCoupon(id) {
  const card = document.getElementById(`coupon-${id}`);
  if (!card) return;

  const btn = card.querySelector('.redeem-btn');
  if (!btn || btn.classList.contains('redeemed')) return;

  btn.classList.add('redeemed');
  btn.textContent = 'REDEEMED ✓';

  // Confetti / floating hearts burst
  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = ['🎟️', '💖', '✨', '🎉'][Math.floor(Math.random() * 4)];
    heart.style.left = `${Math.random() * 80 + 10}%`;
    heart.style.top = '60%';
    card.appendChild(heart);

    setTimeout(() => heart.remove(), 1500);
  }
}

/* ─────────────────────────────────────────────────
   TICK ANIMATION
   ───────────────────────────────────────────────── */

const tickStyle = document.createElement('style');
tickStyle.textContent = `
  @keyframes tickPulse {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.1); color: #e07a5f; }
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

  if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 70) {
    const activePage   = pages[currentPage];
    const atTop        = activePage.scrollTop <= 5;
    const atBottom     = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 5;
    const notScrollable = activePage.scrollHeight <= activePage.clientHeight + 5;

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
  if (e.key === 'ArrowRight' && currentPage < totalPages - 1) navigateTo(currentPage + 1);
  else if (e.key === 'ArrowLeft' && currentPage > 0) navigateTo(currentPage - 1);
});
