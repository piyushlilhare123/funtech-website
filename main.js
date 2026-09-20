/* ==========================================================
   FUNTECH — scroll-cinematic site
   No dependencies. Edit CONFIG below to change timing, copy, contact.
   ========================================================== */
const CONFIG = {
  /* ---- Join section (edit these) ---- */
  join: {
    email: "funtechclub@example.com",          // <-- REPLACE with the club's real email
    meeting: "Announced on Instagram @funtechclubmits",
    venue: "MITS Gwalior, Madhav Institute of Technology & Science",
    subject: "Join FunTech Club",
  },

  /* ---- Frame sequences (made with the ffmpeg commands in README) ---- */
  ext: "webp",
  lerp: 0.08,                              // scrub smoothing (1 = no smoothing)
  clips: {
    hero: {
      desktop: { dir: "frames",    count: 240 },
      mobile:  { dir: "frames_m",  count: 120 },
      pinVh:   { desktop: 500, mobile: 350 },   // how long it stays pinned, in screen heights
    },
    flagship: {
      desktop: { dir: "frames2",   count: 240 },
      mobile:  { dir: "frames2_m", count: 120 },
      pinVh:   { desktop: 300, mobile: 250 },
      beats: {
        fTitle: { in: [3, 12],  out: [88, 96], y: 34, vig: 0.6 },
        fLead:  { in: [12, 22], out: [88, 96], y: 20, vig: 0.7 },
      },
    },
    treasure: {
      desktop: { dir: "frames3",   count: 240 },
      mobile:  { dir: "frames3_m", count: 120 },
      pinVh:   { desktop: 300, mobile: 250 },
      beats: {
        tTitle: { in: [3, 12],  out: [88, 96], y: 34, vig: 0.6 },
        tLead:  { in: [12, 22], out: [88, 96], y: 20, vig: 0.7 },
      },
    },
  },

  /* ---- Hero timeline: every number is a % of the pinned scroll (0–100) ----
     in:[start,end]  fade/slide in      out:[start,end]  fade/slide out
     y: slide distance in px           vig: how dark the text backdrop gets   */
  logoDock: [12, 30],                      // logo flies from center into the navbar
  beats: {                                 // hero beats
    bHint:    { in: [0, 0],   out: [8, 12],    y: 0,  vig: 0.2 },
    bWelcome: { in: [14, 20], out: [40, 44],   y: 34, vig: 0.55 },
    bTag:     { in: [30, 36], out: [40, 44],   y: 16, vig: 0.5 },
    bWhere:   { in: [44, 50], out: [62, 66],   y: 34, vig: 0.6 },
    bPara:    { in: [66, 70], out: [84, 88],   y: 26, vig: 0.85, sentences: [68, 82] },
    bCta:     { in: [87, 93], out: [101, 102], y: 30, vig: 0.5 },
  },
};

/* ---------------------------------------------------------- */
(() => {
  document.documentElement.classList.add("js");

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 768px)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const hero = $("#top");
  const fly = $("#flyLogo");
  const dock = $("#dock");

  /* ---------- Join section text ---------- */
  $("#factTime").textContent = CONFIG.join.meeting;
  $("#factVenue").textContent = CONFIG.join.venue;

  /* ---------- Film grain texture ---------- */
  (function grain() {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const g = c.getContext("2d");
    const d = g.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    document.documentElement.style.setProperty("--noise", `url(${c.toDataURL("image/png")})`);
  })();

  /* ---------- Cursor sparkle trail (desktop, motion-safe only) ---------- */
  if (fine && !reduced) {
    const trail = document.createElement("canvas");
    trail.id = "cursorTrail";
    trail.setAttribute("aria-hidden", "true");
    document.body.appendChild(trail);
    const tctx = trail.getContext("2d");
    const colors = ["#B24BF3", "#3ED8E8", "#E8B4F5"];
    let particles = [];

    function sizeTrail() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      trail.width = Math.round(innerWidth * dpr);
      trail.height = Math.round(innerHeight * dpr);
      trail.style.width = innerWidth + "px";
      trail.style.height = innerHeight + "px";
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeTrail();
    window.addEventListener("resize", sizeTrail);

    let lastEmit = 0;
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - lastEmit < 24) return;      // throttle spawn rate
      lastEmit = now;
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 0.05,
          vy: -0.03 - Math.random() * 0.04,
          born: now,
          life: 550 + Math.random() * 350,
          size: 2 + Math.random() * 2.4,
          color: colors[(Math.random() * colors.length) | 0],
        });
      }
      if (particles.length > 160) particles.splice(0, particles.length - 160);
    });
    // a light burst on click/tap for a bit of extra sparkle
    window.addEventListener("pointerdown", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const now = performance.now();
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        particles.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(a) * (0.08 + Math.random() * 0.05),
          vy: Math.sin(a) * (0.08 + Math.random() * 0.05),
          born: now,
          life: 420 + Math.random() * 200,
          size: 2 + Math.random() * 2,
          color: colors[(Math.random() * colors.length) | 0],
        });
      }
    });

    let lastFrame = performance.now();
    function drawTrail(now = performance.now()) {
      const dt = Math.min(now - lastFrame, 48);
      lastFrame = now;
      tctx.clearRect(0, 0, innerWidth, innerHeight);
      particles = particles.filter((p) => now - p.born < p.life);
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const t = (now - p.born) / p.life;
        const alpha = 1 - t;
        const size = p.size * (1 - t * 0.5);
        tctx.beginPath();
        tctx.fillStyle = p.color;
        tctx.globalAlpha = alpha * 0.85;
        tctx.shadowBlur = 10;
        tctx.shadowColor = p.color;
        tctx.arc(p.x, p.y, Math.max(size, 0), 0, Math.PI * 2);
        tctx.fill();
      }
      tctx.globalAlpha = 1;
      tctx.shadowBlur = 0;
      requestAnimationFrame(drawTrail);
    }
    requestAnimationFrame(drawTrail);
  }

  /* ---------- Scrub engine (one per pinned clip) ---------- */
  function createScrub(section, clip, beats) {
    const set = mobile ? clip.mobile : clip.desktop;
    const N = set.count;
    const stage = $(".stage", section);
    const cv = $(".cv", section);
    const ctx = cv.getContext("2d");
    const vig = $(".vig", section);
    const frames = new Array(N);
    const beatEls = Object.entries(beats).map(([id, cfg]) => ({ el: document.getElementById(id), cfg }));
    const S = { section, stage, N, cur: 0, target: 0, lastIdx: -1, lastP: -1, loaded: 0, onLoad: null, onUpdate: null };

    section.style.setProperty("--pin", mobile ? clip.pinVh.mobile : clip.pinVh.desktop);

    const src = (i) => `${set.dir}/f_${String(i + 1).padStart(4, "0")}.${CONFIG.ext}`;
    function loadFrame(i) {
      return new Promise((res) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => { frames[i] = img; res(); };
        img.onerror = () => res();
        img.src = src(i);
      }).then(() => {
        S.loaded++;
        S.lastIdx = -1; // redraw with the newly loaded frame
        if (S.onLoad) S.onLoad(S.loaded / N);
      });
    }
    // first frame first (so the canvas is never blank), then the rest
    S.load = () => loadFrame(0).then(() => Promise.all(Array.from({ length: N - 1 }, (_, k) => loadFrame(k + 1))));

    S.size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(Math.round(stage.clientWidth * dpr), 2560);
      cv.width = w;
      cv.height = Math.round(w * (stage.clientHeight / stage.clientWidth));
      S.lastIdx = -1;
      S.lastP = -1;
    };

    function nearest(idx) {
      if (frames[idx]) return frames[idx];
      for (let d = 1; d < N; d++) {
        if (frames[idx - d]) return frames[idx - d];
        if (frames[idx + d]) return frames[idx + d];
      }
      return null;
    }
    function draw(idx) {
      const img = nearest(idx);
      if (!img) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const cw = cv.width, ch = cv.height, iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);            // "cover"
      const w = iw * s, h = ih * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    S.progress = () => {
      const r = section.getBoundingClientRect();
      return clamp(-r.top / (r.height - stage.clientHeight));
    };

    S.update = (p) => {
      let vigOp = 0;
      for (const { el, cfg } of beatEls) {
        const [op, inT, outT] = fade(p * 100, cfg.in[0], cfg.in[1], cfg.out[0], cfg.out[1]);
        const y = (1 - ease(inT)) * cfg.y - ease(outT) * cfg.y * 0.7;
        el.style.opacity = op.toFixed(3);
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        el.style.pointerEvents = op > 0.5 && el.id === "bCta" ? "auto" : "none";
        vigOp = Math.max(vigOp, op * cfg.vig);
      }
      vig.style.opacity = vigOp.toFixed(3);
      if (S.onUpdate) S.onUpdate(p);
    };

    S.tick = (dt) => {
      const l = reduced ? 1 : 1 - Math.pow(1 - CONFIG.lerp, dt);   // frame-rate independent
      S.cur += (S.target - S.cur) * l;
      if (Math.abs(S.target - S.cur) < 0.0004) S.cur = S.target;
      const idx = Math.round(S.cur * (N - 1));
      if (idx !== S.lastIdx) { draw(idx); S.lastIdx = idx; }
      if (S.cur !== S.lastP) { S.update(S.cur); S.lastP = S.cur; }
    };
    return S;
  }

  function fade(p, a, b, c, d) {
    // returns [opacity, inT, outT]
    const inT = b > a ? clamp((p - a) / (b - a)) : (p >= a ? 1 : 0);
    const outT = d > c ? clamp((p - c) / (d - c)) : 0;
    return [inT * (1 - outT), inT, outT];
  }

  const heroScrub = createScrub(hero, CONFIG.clips.hero, CONFIG.beats);
  const flagScrub = createScrub($("#flagship"), CONFIG.clips.flagship, CONFIG.clips.flagship.beats);
  const treasureScrub = createScrub($("#treasure"), CONFIG.clips.treasure, CONFIG.clips.treasure.beats);
  const scrubs = [heroScrub, flagScrub, treasureScrub];

  /* ---------- Loader: waits for the hero clip only; the rest load after ---------- */
  const fill = $("#loaderFill");
  let ready = false;
  function markReady() {
    if (ready) return;
    ready = true;
    fill.style.transform = "scaleX(1)";
    requestAnimationFrame(() => document.body.classList.add("ready"));
    flagScrub.load();                       // start the second clip in the background
    treasureScrub.load();                   // start the third clip in the background
  }
  heroScrub.onLoad = (f) => { fill.style.transform = `scaleX(${f})`; if (f >= 1) markReady(); };
  heroScrub.load();
  setTimeout(markReady, 20000);             // safety net on very slow connections

  /* ---------- Layout for the flying logo ---------- */
  let s0 = 180, dockX = 0, dockY = 0, dockS = 0.2;
  function layout() {
    const vh = heroScrub.stage.clientHeight;
    s0 = Math.round(clamp(vh * 0.26, 120, 200));
    hero.style.setProperty("--s0", s0 + "px");
    fly.style.setProperty("--s0", s0 + "px");
    const r = dock.getBoundingClientRect();
    dockX = r.left; dockY = r.top; dockS = r.width / s0;
    scrubs.forEach((s) => s.size());
  }

  const sents = $$(".sent");
  const bar = $("#progressFill");

  // hero-only extras: paragraph sentences + the logo flight
  heroScrub.onUpdate = (p) => {
    const [a, b] = CONFIG.beats.bPara.sentences;
    const q = clamp((p * 100 - a) / (b - a)) * sents.length;
    sents.forEach((s, i) => { s.style.opacity = clamp(q - i).toFixed(3); });

    const vw = heroScrub.stage.clientWidth, vh = heroScrub.stage.clientHeight;
    const [d0, d1] = CONFIG.logoDock;
    const t = ease(clamp((p * 100 - d0) / (d1 - d0)));
    const sx = (vw - s0) / 2, sy = (vh - s0) / 2;
    const x = sx + (dockX - sx) * t;
    const y = sy + (dockY - sy) * t;
    const s = 1 + (dockS - 1) * t;
    fly.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    fly.style.setProperty("--inv", (1 / s).toFixed(3));
    fly.classList.toggle("docked", t > 0.995);
  };

  /* ---------- Parallax ---------- */
  const px = $$("[data-parallax]");
  const pimg = $$("[data-parallax-img]");
  function parallax() {
    if (reduced) return;
    const vh = innerHeight;
    px.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    });
    pimg.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const off = clamp((r.top + r.height / 2 - vh / 2) * -0.05, -16, 16);
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(1.03)`;
    });
  }

  /* ---------- Main loop ---------- */
  let lastT = performance.now(), lastScroll = -1;
  function tick(now = performance.now()) {
    const dt = Math.min((now - lastT) / 16.667, 4);
    lastT = now;

    const sc = window.scrollY;
    if (sc !== lastScroll) {
      lastScroll = sc;
      scrubs.forEach((s) => { s.target = s.progress(); });
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleY(${max > 0 ? clamp(sc / max) : 0})`;
      parallax();
    }
    scrubs.forEach((s) => s.tick(dt));
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => { layout(); lastScroll = -1; });
  layout();
  scrubs.forEach((s) => { s.target = s.cur = s.progress(); });
  requestAnimationFrame(tick);

  /* ---------- Navbar / mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#menu");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
  }
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  fly.addEventListener("click", () => setMenu(false));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  $$(".cards, .events, .perks").forEach((grid) => {
    const cols = grid.classList.contains("events") || grid.classList.contains("perks") ? 2 : 3;
    Array.from(grid.children).forEach((c, i) => c.style.setProperty("--d", `${(i % cols) * 0.1}s`));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------- About particles ---------- */
  if (!reduced) {
    const box = $("#particles");
    const cols = ["#B24BF3", "#3ED8E8", "#E8B4F5"];
    for (let i = 0; i < (mobile ? 14 : 28); i++) {
      const p = document.createElement("i");
      const sz = 2 + Math.random() * 3;
      p.style.cssText = `left:${Math.random() * 100}%;top:${45 + Math.random() * 55}%;width:${sz}px;height:${sz}px;--c:${cols[i % 3]};--t:${8 + Math.random() * 9}s;--dl:${-Math.random() * 14}s`;
      box.appendChild(p);
    }
  }

  /* ---------- Card tilt ---------- */
  if (fine && !reduced) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
        card.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Join form (mailto, no backend) ---------- */
  const form = $("#joinForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      note.textContent = "Fill in your name, email and year to continue.";
      return;
    }
    const d = new FormData(form);
    const body = `Hi FunTech team,\n\nI'd like to join the club.\n\nName: ${d.get("name")}\nEmail: ${d.get("email")}\nYear of study: ${d.get("year")}\n`;
    const href = `mailto:${CONFIG.join.email}?subject=${encodeURIComponent(CONFIG.join.subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Opening your email app. Hit send to finish joining.";
    window.location.href = href;
  });

  /* ---------- Join section background video ---------- */
  const joinVideo = $(".join-bg-video");
  if (joinVideo) {
    if (reduced) {
      joinVideo.removeAttribute("autoplay");
      joinVideo.pause();
    } else {
      const tryPlay = () => joinVideo.play().catch(() => {});
      tryPlay();
      // pause/resume as it enters/leaves view, so it always resumes the loop when visible
      const joinIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? tryPlay() : joinVideo.pause()));
      }, { threshold: 0.05 });
      joinIO.observe($("#join"));
    }
  }
})();
