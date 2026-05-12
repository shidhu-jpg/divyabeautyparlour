/* ════════════════════════════════════════════════
   DIVYA BEAUTY PARLOUR — app.js
   Dark Luxury Edition — All interactions in one file
════════════════════════════════════════════════ */
'use strict';

/* ── UTM passthrough ─────────────────────────── */
(function captureUTMs() {
  const p = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k => {
    if (p.has(k)) sessionStorage.setItem(k, p.get(k));
  });
})();

/* ════════════════════════════════════════════════
   AURORA CANVAS
════════════════════════════════════════════════ */
(function initAurora() {
  const canvas = document.getElementById('auroraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const blobs = [
    { x: .35, y: .40, r: .55, h: 280, s: .22, a: .13, dx: .00012, dy: .00008 },
    { x: .65, y: .55, r: .50, h: 320, s: .28, a: .11, dx:-.00009, dy: .00011 },
    { x: .50, y: .25, r: .42, h: 260, s: .20, a: .10, dx: .00007, dy:-.00010 },
    { x: .20, y: .70, r: .38, h: 340, s: .18, a: .09, dx:-.00011, dy:-.00007 },
  ];

  let W, H, raf, t = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  function draw() {
    t += 1;
    ctx.clearRect(0, 0, W, H);

    // Dark base
    ctx.fillStyle = '#080606';
    ctx.fillRect(0, 0, W, H);

    blobs.forEach(b => {
      // Drift blobs gently
      b.x += b.dx * Math.sin(t * 0.4);
      b.y += b.dy * Math.cos(t * 0.3);

      const cx = b.x * W;
      const cy = b.y * H;
      const r  = b.r * Math.min(W, H);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const alpha1 = (b.a + 0.04 * Math.sin(t * 0.02)).toFixed(2);
      const alpha2 = (b.a * 0.3).toFixed(2);

      grad.addColorStop(0,   `hsla(${b.h},${Math.round(b.s*100)}%,55%,${alpha1})`);
      grad.addColorStop(0.6, `hsla(${b.h},${Math.round(b.s*100)}%,40%,${(alpha2*0.6).toFixed(2)})`);
      grad.addColorStop(1,   `hsla(${b.h},${Math.round(b.s*100)}%,30%,0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.9);
    vig.addColorStop(0, 'rgba(8,6,6,0)');
    vig.addColorStop(1, 'rgba(8,6,6,0.75)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(draw);
  }
  draw();
})();

/* ════════════════════════════════════════════════
   PARTICLE CANVAS
════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    spawnAll();
  }

  function mkParticle() {
    return {
      x:    Math.random() * (W || 800),
      y:    Math.random() * (H || 600),
      r:    0.5 + Math.random() * 1.8,
      vx:   (Math.random() - .5) * 0.18,
      vy:   -(0.1 + Math.random() * 0.22),
      a:    0,
      maxA: 0.25 + Math.random() * 0.45,
      life: 0,
      maxL: 220 + Math.random() * 280,
      gold: Math.random() > 0.35,
    };
  }

  function spawnAll() {
    const count = Math.min(60, Math.floor((W * H) / 14000));
    particles = Array.from({ length: count }, mkParticle);
    particles.forEach(p => { p.life = Math.random() * p.maxL; });
  }

  const ro = new ResizeObserver(resize);
  resize();
  ro.observe(canvas);

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      // Fade in / out
      const prog = p.life / p.maxL;
      p.a = prog < 0.15
        ? p.maxA * (prog / 0.15)
        : prog > 0.75
          ? p.maxA * (1 - (prog - 0.75) / 0.25)
          : p.maxA;

      if (p.life >= p.maxL) { particles[i] = mkParticle(); return; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(201,169,110,${p.a.toFixed(2)})`
        : `rgba(232,196,192,${(p.a * 0.6).toFixed(2)})`;
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }
  tick();
})();

/* ════════════════════════════════════════════════
   TYPED TEXT
════════════════════════════════════════════════ */
(function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const words = ['Bridal Makeup', 'Party Makeup', 'Facial Care', 'Hair Styling', 'Pre-Bridal'];
  let wi = 0, ci = 0, deleting = false, paused = false;
  const SPEED_TYPE = 72, SPEED_DEL = 38, PAUSE_END = 1800, PAUSE_START = 400;

  function tick() {
    if (paused) return;
    const word = words[wi];

    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        paused = true;
        setTimeout(() => { deleting = true; paused = false; loop(); }, PAUSE_END);
        return;
      }
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        paused = true;
        setTimeout(() => { paused = false; loop(); }, PAUSE_START);
        return;
      }
    }
    loop();
  }

  function loop() {
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  loop();
})();

/* ════════════════════════════════════════════════
   GSAP HERO ENTRANCE (scroll reveals handled by IO)
════════════════════════════════════════════════ */
(function initGSAP() {
  // GSAP is used only for the hero entrance stagger.
  // All other scroll animations are handled by IntersectionObserver + CSS.
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.ht-word,#heroBadge,#heroSub,#heroActions,#heroStats,#heroImgCol').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // ── Initial states (must be set BEFORE timeline) ──
  gsap.set('#heroBadge',   { opacity: 0, y: 24 });
  gsap.set('.ht-word',     { opacity: 0, y: 40 });
  gsap.set('#heroSub',     { opacity: 0, y: 20 });
  gsap.set('#heroActions', { opacity: 0, y: 20 });
  gsap.set('#heroStats',   { opacity: 0, y: 16 });
  gsap.set('#heroImgCol',  { opacity: 0, x: 48, scale: .96 });

  // ── Hero entrance timeline ───────────────────
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl
    .to('#heroBadge',   { opacity: 1, y: 0, duration: .7, delay: .25 })
    .to('.ht-word',     { opacity: 1, y: 0, stagger: .12, duration: .85, ease: 'power2.out' }, '-=.3')
    .to('#heroSub',     { opacity: 1, y: 0, duration: .65 }, '-=.35')
    .to('#heroActions', { opacity: 1, y: 0, duration: .6  }, '-=.35')
    .to('#heroStats',   { opacity: 1, y: 0, duration: .6  }, '-=.3')
    .to('#heroImgCol',  { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power2.out' }, '-=.9');
})();

/* ════════════════════════════════════════════════
   CUSTOM CURSOR
════════════════════════════════════════════════ */
(function initCursor() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  const ring = document.getElementById('cursor');
  const dot  = document.getElementById('cursorDot');
  if (!ring || !dot) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function lerp() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(lerp);
  })();

  // Hover state
  const hoverTargets = 'a,button,.gm-item,.rv-card,.service-card,.gf-btn,.ci-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('hover');
  });

  // Click state
  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
})();

/* ════════════════════════════════════════════════
   NAV — scroll class + hamburger
════════════════════════════════════════════════ */
(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('burger');
  const links   = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  if (!nav) return;

  // Scroll class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  function closeMobileMenu() {
    burger.classList.remove('open');
    links.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    overlay.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  overlay?.addEventListener('click', closeMobileMenu);

  // Close on link click
  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });
})();

/* ════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('nav')?.offsetHeight || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ════════════════════════════════════════════════
   REVEAL — IntersectionObserver
════════════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay ? el.dataset.delay + 'ms' : (el.style.getPropertyValue('--delay') || '0s');
        el.style.setProperty('--delay', typeof delay === 'string' && delay.includes('ms') ? (parseInt(delay)/1000)+'s' : delay);
        el.classList.add('visible');
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => {
    // Convert data-delay (ms) to CSS --delay (s)
    if (el.dataset.delay) {
      el.style.setProperty('--delay', (parseInt(el.dataset.delay) / 1000) + 's');
    }
    io.observe(el);
  });
})();

/* ════════════════════════════════════════════════
   3D TILT + SPOTLIGHT on service cards
════════════════════════════════════════════════ */
(function initTilt() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    const glow = card.querySelector('.sc-glow');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `perspective(900px) rotateX(${(-dy * 7).toFixed(1)}deg) rotateY(${(dx * 7).toFixed(1)}deg) translateZ(6px)`;

      // Spotlight position
      const px = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const py = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', px);
      card.style.setProperty('--my', py);
      if (glow) glow.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      if (glow) glow.style.opacity = '0';
    });
  });
})();

/* ════════════════════════════════════════════════
   MAGNETIC BUTTONS
════════════════════════════════════════════════ */
(function initMagnetic() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.28;
      const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.28;
      btn.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ════════════════════════════════════════════════
   GALLERY — Filter + Lightbox
════════════════════════════════════════════════ */
(function initGallery() {
  // ── Filter ──────────────────────────────────
  const filterBtns = document.querySelectorAll('.gf-btn');
  const items = document.querySelectorAll('.gm-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;

      items.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        if (match) {
          item.classList.remove('hide');
          // Re-show hidden items
          if (item.classList.contains('gone')) {
            item.classList.remove('gone');
            // Force reflow for transition
            void item.offsetWidth;
          }
        } else {
          item.classList.add('hide');
          item.addEventListener('transitionend', function handler() {
            if (item.classList.contains('hide')) item.classList.add('gone');
            item.removeEventListener('transitionend', handler);
          });
        }
      });
    });
  });

  // ── Lightbox ────────────────────────────────
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbCap   = document.getElementById('lbCap');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  if (!lb) return;

  let visibleItems = [];
  let currentIdx   = 0;

  function getVisible() {
    return [...document.querySelectorAll('.gm-item:not(.hide):not(.gone)')];
  }

  function openLb(idx) {
    visibleItems = getVisible();
    currentIdx = Math.max(0, Math.min(idx, visibleItems.length - 1));
    showSlide(currentIdx);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  function showSlide(idx) {
    const item = visibleItems[idx];
    if (!item) return;
    const img = item.querySelector('img');
    const cap = item.querySelector('.gm-overlay');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent.trim() : '';
    currentIdx = idx;
    // Re-trigger animation
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
  }

  function prev() { showSlide((currentIdx - 1 + visibleItems.length) % visibleItems.length); }
  function next() { showSlide((currentIdx + 1) % visibleItems.length); }

  // Open on image click
  document.getElementById('galleryGrid')?.addEventListener('click', e => {
    const item = e.target.closest('.gm-item');
    if (!item) return;
    visibleItems = getVisible();
    const idx = visibleItems.indexOf(item);
    if (idx !== -1) openLb(idx);
  });

  lbClose?.addEventListener('click', closeLb);
  lbPrev?.addEventListener('click', prev);
  lbNext?.addEventListener('click', next);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    touchX = null;
  });
})();

/* ════════════════════════════════════════════════
   BOOKING FORM — validation + WhatsApp
════════════════════════════════════════════════ */
(function initForm() {
  const form    = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('formBtn');
  if (!form) return;

  const F = {
    name:    { el: document.getElementById('f-name'),    err: document.getElementById('err-name') },
    phone:   { el: document.getElementById('f-phone'),   err: document.getElementById('err-phone') },
    service: { el: document.getElementById('f-service'), err: document.getElementById('err-service') },
  };

  function showErr(key, msg) {
    F[key].err.textContent = msg;
    F[key].el.closest('.fg').classList.add('error');
    F[key].el.setAttribute('aria-invalid', 'true');
  }
  function clearErr(key) {
    F[key].err.textContent = '';
    F[key].el.closest('.fg').classList.remove('error');
    F[key].el.removeAttribute('aria-invalid');
  }

  function validate() {
    let ok = true;
    const name  = F.name.el.value.trim();
    const phone = F.phone.el.value.trim().replace(/\s+/g,'');
    const svc   = F.service.el.value;

    if (!name || name.length < 2) { showErr('name', 'Please enter your name (min. 2 characters).'); ok = false; }
    else clearErr('name');

    if (!phone) { showErr('phone', 'Please enter your phone number.'); ok = false; }
    else if (!/^[6-9]\d{9}$/.test(phone)) { showErr('phone', 'Enter a valid 10-digit Indian mobile number.'); ok = false; }
    else clearErr('phone');

    if (!svc) { showErr('service', 'Please select a service.'); ok = false; }
    else clearErr('service');

    return ok;
  }

  // Live clear
  Object.entries(F).forEach(([key, { el }]) => {
    el.addEventListener('blur',  () => { if (el.value) validate(); });
    el.addEventListener('input', () => clearErr(key));
  });

  function buildWAUrl(data) {
    const lines = [
      `Namaste! 🙏 Main Divya Beauty Parlour mein appointment book karna chahti/chahta hoon.`,
      ``,
      `👤 Name: ${data.name}`,
      `📱 Phone: ${data.phone}`,
      `💄 Service: ${data.service}`,
    ];
    if (data.msg) lines.push(`📝 Message: ${data.msg}`);
    lines.push(``, `Please confirm my appointment. Thank you!`);

    // Append UTM source if available
    const utmSrc = sessionStorage.getItem('utm_source');
    if (utmSrc) lines.push(`(Source: ${utmSrc})`);

    return `https://wa.me/916202770517?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    const data = {
      name:  F.name.el.value.trim(),
      phone: F.phone.el.value.trim().replace(/\s+/g,''),
      service: F.service.el.value,
      msg: document.getElementById('f-msg')?.value.trim() || '',
    };

    btn.disabled = true;
    btn.querySelector('span').textContent = 'Opening WhatsApp…';

    setTimeout(() => {
      window.open(buildWAUrl(data), '_blank', 'noopener,noreferrer');
      form.hidden = true;
      success.hidden = false;
    }, 550);
  });
})();
