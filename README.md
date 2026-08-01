# 💌 Girlfriend's Day Digital Experience

A 4-page intimate digital gift for a long-distance relationship — built with vanilla HTML, CSS, and JavaScript. Dark mode, mobile-first, fully animated.

---

## Pages

| Page | Title | Description |
|------|-------|-------------|
| 1 | **THE CONNECTION** | Animated SVG arc map connecting Bangalore & Greater Noida |
| 2 | **OUR MOMENTS** | Hold-to-reveal timeline with 3 memory nodes |
| 3 | **OUR SPACE** | Movie night spinner wheel + live countdown timer |
| 4 | **FOR YOU** | Animated envelope revealing a love letter |

---

## How to Use

1. **Open** `index.html` in any browser (no build step needed)
2. **Set the countdown date** — edit line 15 of `app.js`:
   ```js
   const COUNTDOWN_TARGET = 'YYYY-MM-DDTHH:MM:SS';
   ```
3. **Add your photos** — for each timeline node, swap the placeholder:
   ```html
   <div class="photo-placeholder has-image">
     <img src="your-photo.jpg" alt="caption" />
   </div>
   ```

---

## Tech Stack

- **HTML5** — semantic structure, SVG animations
- **CSS3** — design tokens, keyframe animations, CSS Grid, `clamp()`, `100dvh`
- **Vanilla JS** — IntersectionObserver, Canvas 2D, touch events, Web Audio API

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0e0e0e` deep charcoal |
| Accent | `#e8a598` warm blush |
| Gold | `#c9a96e` muted gold |
| Font | Inter + Playfair Display |

---

*Built with love by Tejas — Bangalore ↔ Greater Noida* 💗
