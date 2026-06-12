/* ============================================================
   WRETMAN ESTATE — home-v2.js
   Couche d'expérience de la page d'accueil v2.
   Indépendant de main.js (IIFE). Chaque module est défensif et
   respecte prefers-reduced-motion. N'interfère pas avec les
   comportements existants (carousels, modals, formulaires...).
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp  = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp   = (a, b, t) => a + (b - a) * t;

  /* ---------- 1. Révéler le hero une fois la page prête ---------- */
  function initLoaded() {
    window.requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  }

  /* ---------- 2. Barre de progression de scroll ---------- */
  function initProgress() {
    const bar = $('.scroll-progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- 4. Révélations au scroll ---------- */
  function initReveal() {
    const items = $$('.reveal, .reveal-img, .reveal-head');
    if (!items.length) return;
    if (REDUCE || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 5. Compteurs animés (chiffres clés) ---------- */
  function initCounters() {
    const nums = $$('[data-count]');
    if (!nums.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      if (REDUCE) { el.textContent = target + suffix; return; }
      const dur = 1500;
      let start = null;
      const tick = (ts) => {
        if (start === null) start = ts;
        const p = clamp((ts - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
        if (p < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach((el) => io.observe(el));
  }

  /* ---------- 6. Marquee : duplication pour boucle continue ---------- */
  function initMarquee() {
    $$('.marquee-track').forEach((track) => {
      const html = track.innerHTML;
      track.innerHTML = html + html; /* deux séquences → translateX(-50%) fluide */
    });
  }

  /* ---------- 7. "Survol de la Riviera" — récit épinglé sur 5 écrans ---------- */
  function initRiviera() {
    const sect = $('[data-riviera]');
    if (!sect) return;
    const frames = $$('.riviera-frames img', sect);
    const steps  = $$('.riviera-step', sect);
    const dots   = $$('.riviera-dots span', sect);
    const isPhone = window.matchMedia('(max-width: 767px)').matches;
    if (!frames.length) return;

    /* Repli : pas d'épinglage, 1ère frame + étapes empilées */
    if (REDUCE || isPhone) {
      sect.classList.add('riviera--static');
      frames[0].classList.add('is-current');
      steps.forEach((s) => s.classList.add('is-active'));
      return;
    }

    const N = frames.length;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = sect.getBoundingClientRect();
      const scrollable = sect.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / (scrollable || 1), 0, 1);

      /* Transition DIAGONALE entre frames consécutives (reprise de l'effet
         "wellness amenities" d'Elyse + motif diagonal de la charte).
         La frame suivante balaie en biais par-dessus la précédente.
         Chaque image n'apparaît qu'une seule fois sur tout le défilement. */
      const seg = progress * (N - 1);
      const base = Math.floor(seg);
      const frac = seg - base;
      const S = 22;  /* inclinaison de la diagonale, en % de largeur */
      const FULL = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      frames.forEach((f, i) => {
        if (i === base) {
          f.style.opacity = '1';
          f.style.clipPath = FULL;
          f.style.transform = 'scale(' + (1.06 + frac * 0.05).toFixed(3) + ')'; /* léger zoom "survol" */
        } else if (i === base + 1) {
          f.style.opacity = '1';
          /* bord gauche incliné qui balaie de la droite vers la gauche */
          const e = (1 - frac) * (100 + S);
          f.style.clipPath = 'polygon(100% 0, 100% 100%, ' + (e - S).toFixed(1) + '% 100%, ' + e.toFixed(1) + '% 0)';
          f.style.transform = 'scale(1.06)';
        } else {
          f.style.opacity = '0';
        }
      });

      /* 1 pastille = 1 image : la pastille/caption active suit l'image dominante,
         elle bascule au milieu de chaque transition diagonale. */
      const activeIdx = clamp(Math.round(seg), 0, N - 1);
      steps.forEach((s, i) => s.classList.toggle('is-active', i === activeIdx));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 7 bis. Avis clients — échange de citation (sans carrousel) ---------- */
  function initTestimonials() {
    const wrap = $('[data-testi]');
    if (!wrap) return;
    const text = $('[data-testi-text]', wrap);
    const author = $('[data-testi-author]', wrap);
    const btns = $$('[data-testi-btn]', wrap);
    if (!text || !author || !btns.length) return;

    btns.forEach((b) => {
      b.addEventListener('click', () => {
        if (b.getAttribute('aria-pressed') === 'true') return;
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        const set = () => { text.textContent = b.dataset.quote; author.textContent = b.dataset.author; };
        if (REDUCE) { set(); return; }
        text.style.opacity = 0; author.style.opacity = 0;
        window.setTimeout(() => { set(); text.style.opacity = 1; author.style.opacity = 1; }, 220);
      });
    });
  }

  /* ---------- 8. Parallaxe légère [data-parallax] ---------- */
  function initParallax() {
    if (REDUCE) return;
    const els = $$('[data-parallax]');
    if (!els.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const strength = parseFloat(el.dataset.parallax) || 0.12;
        const offset = (r.top + r.height / 2 - vh / 2) * -strength;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0) scale(1.12)';
      });
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 10. Hero : bouton son ---------- */
  function initHeroSound() {
    const btn = $('.hero-sound');
    const video = $('.hero-v2-media video');
    if (!btn || !video) return;
    const ON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4 4 0 010 7M18.5 6a7 7 0 010 12"/></svg>';
    const OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
    const sync = () => {
      btn.innerHTML = video.muted ? OFF : ON;
      btn.setAttribute('aria-label', video.muted ? 'Activer le son de la vidéo' : 'Couper le son de la vidéo');
    };
    sync();
    btn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted) { video.play().catch(() => {}); }
      sync();
    });
  }

  /* ---------- 11. Showreel : lecture au clic ---------- */
  function initShowreel() {
    const stage = $('.showreel-stage');
    if (!stage) return;
    const video = $('video', stage);
    const btn = $('.showreel-play', stage);
    if (!video || !btn) return;
    btn.addEventListener('click', () => {
      stage.classList.add('is-playing');
      video.muted = false;
      video.controls = true;
      video.currentTime = 0;
      video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    initLoaded();
    initProgress();
    initReveal();
    initCounters();
    initMarquee();
    initRiviera();
    initTestimonials();
    initParallax();
    initHeroSound();
    initShowreel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
