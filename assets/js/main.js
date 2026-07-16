/* =========================================================
   Ritik Pandita — Portfolio interactions
   ========================================================= */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover:none)').matches;

  /* ---------- Preloader ---------- */
  const preloader = $('#preloader');
  const hidePreloader = () => {
    preloader?.classList.add('is-done');
    document.body.style.overflow = '';
  };
  window.addEventListener('load', () => setTimeout(hidePreloader, 700));
  setTimeout(hidePreloader, 2600); // safety net

  /* ---------- Nav: scrolled state ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  onScrollNav();
  addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- Nav: burger (mobile) ---------- */
  const burger = $('#navBurger');
  const navLinks = $('#navLinks');
  const closeMenu = () => { burger.classList.remove('is-open'); navLinks.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__link', navLinks).forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Scroll progress bar + to-top ---------- */
  const bar = $('#scrollProgress');
  const toTop = $('#toTop');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (p * 100) + '%';
    toTop.classList.toggle('is-show', h.scrollTop > 600);
  };
  onScrollProgress();
  addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------- Active nav link via section observation ---------- */
  const sections = $$('main section[id]');
  const linkFor = id => $(`.nav__link[href="#${id}"]`);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('.nav__link').forEach(l => l.classList.remove('is-active'));
        linkFor(e.target.id)?.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Reveal on scroll (staggered) ---------- */
  const reveals = $$('[data-reveal]');
  // stagger siblings that share a parent
  const groups = new Map();
  reveals.forEach(el => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, 0);
    const i = groups.get(p);
    el.style.setProperty('--d', (Math.min(i, 6) * 0.08) + 's');
    groups.set(p, i + 1);
    el.classList.add('reveal');
  });
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in')); // fallback: never keep content hidden
  }

  /* ---------- Role rotator (typing) ---------- */
  const rotator = $('#rotator');
  if (rotator) {
    const roles = ['Laravel Developer', 'Backend Engineer', 'REST API Architect', 'Full-Stack Builder', 'Payments Specialist'];
    let ri = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = roles[ri];
      ci += deleting ? -1 : 1;
      rotator.textContent = word.slice(0, ci);
      let delay = deleting ? 45 : 90;
      if (!deleting && ci === word.length) { delay = 1500; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
      setTimeout(tick, delay);
    };
    if (reduce) { rotator.textContent = roles[0]; } else tick();
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$('[data-count]');
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      if (reduce) { el.textContent = target + suffix; obs.unobserve(el); return; }
      let start = null;
      const step = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  /* ---------- Skill bars ---------- */
  const bars = $$('.skill-cat__list i[data-level]');
  const barObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.setProperty('--fill', e.target.dataset.level + '%');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  bars.forEach(b => barObserver.observe(b));

  /* ---------- Timeline progress line ---------- */
  const tl = $('.timeline');
  const tlProgress = $('#tlProgress');
  if (tl && tlProgress) {
    const onTl = () => {
      const r = tl.getBoundingClientRect();
      const vh = innerHeight;
      const total = r.height;
      const visible = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
      tlProgress.style.height = (visible / total * 100) + '%';
    };
    onTl();
    addEventListener('scroll', onTl, { passive: true });
    addEventListener('resize', onTl);
  }

  /* ---------- 3D tilt on project cards ---------- */
  if (!isTouch && !reduce) {
    $$('[data-tilt]').forEach(card => {
      let raf = null;
      const move = (ev) => {
        const r = card.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
        });
      };
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }

  /* ---------- Custom cursor + magnetic ---------- */
  if (!isTouch && !reduce) {
    const cursor = $('#cursor'), dot = $('#cursorDot');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseleave', () => document.body.classList.add('hide-cursor'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('hide-cursor'));

    const hoverEls = 'a,button,[data-magnetic],[data-tilt],.social,.nav__link';
    $$(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // magnetic pull
    $$('[data-magnetic]').forEach(el => {
      const strength = 0.35;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const yy = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px,${yy}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Particle canvas ---------- */
  const canvas = $('#particles');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [], mouse = { x: -999, y: -999 };
    const CFG = { color: '124,92,255', color2: '34,211,238', linkDist: 130 };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      const count = Math.min(Math.floor(innerWidth / 16), 90);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r: (Math.random() * 1.6 + 0.6) * dpr,
        c: Math.random() > 0.5 ? CFG.color : CFG.color2
      }));
    };
    resize();
    addEventListener('resize', resize);
    addEventListener('mousemove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
    addEventListener('mouseout', () => { mouse.x = mouse.y = -9999; });

    const link = CFG.linkDist;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // link to nearby
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < link * dpr) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - d / (link * dpr)) * 0.18})`;
            ctx.lineWidth = dpr * 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        // link to mouse
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 160 * dpr) {
          ctx.strokeStyle = `rgba(${p.c},${(1 - md / (160 * dpr)) * 0.28})`;
          ctx.lineWidth = dpr * 0.7;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = `rgba(${p.c},.75)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }
})();
