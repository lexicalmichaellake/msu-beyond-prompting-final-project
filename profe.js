/*  The Profe: a pixel-art teacher who stands above the dialog box and reacts
    the way a TPRS teacher does: big, warm and a little theatrical.
    Art: profe-sprites.js, made by tools/make_profe_sprites.py.

    app.js calls
      Profe.start(), Profe.stop()   when the reading screen opens or closes
      Profe.react(name)             a reaction from REACT below
      Profe.talk(on)                the mouth moves while the dialog types
      Profe.say(chars)              a short burst of talking (instant text speed)
      Profe.refresh()               after the "El Profe" option changes

    The stage is decorative (aria-hidden): the dialog text says everything.
    Like the old VGA games, every sprite pixel is 1.2 times taller than wide.
    Nothing here loads from outside: the sprite sheet is a data URI. */
window.Profe = (() => {
  'use strict';

  const D = window.PROFE_SPRITES;
  const stage = document.getElementById('stage');
  const cv = document.getElementById('profe');
  const g = cv && cv.getContext ? cv.getContext('2d') : null;
  const none = { start() {}, stop() {}, react() {}, talk() {}, say() {}, refresh() {} };
  if (!D || !stage || !g) return none;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TICK = 100;                         // ms per animation step, about 10 frames a second
  const ticks = (ms) => Math.round(ms / TICK);
  const F = D.frames;

  // Reactions. seq: body frames, each shown for `step` ticks, looping.
  // talk: frames used instead while the dialog is typing. face: expression.
  // hold: ms before moving on to `then`. bored: where to go after a quiet
  // wait (a TPRS teacher never just stands there). still: the one frame to
  // show when the learner asked for reduced motion.
  const REACT = {
    idle:      { seq: ['idle'], talk: ['explain', 'explain', 'idle', 'open', 'open', 'idle'], step: 4, face: 'smile' },
    welcome:   { seq: ['welcome'], face: 'excited', hold: 1600, then: 'idle' },
    present:   { seq: ['present'], face: 'look', hold: 1700, then: 'idle' },
    gasp:      { seq: ['gasp'], face: 'gasp', hold: 1400, then: 'idle' },
    ask:       { seq: ['ask'], face: 'curious', bored: 'ear' },
    ear:       { seq: ['ear'], face: 'curious', hold: 1700, then: 'ask' },
    yay:       { seq: ['yay', 'yay2'], step: 2, face: 'happy', hold: 1100, then: 'idle' },
    clap:      { seq: ['clap', 'clap2'], step: 1, face: 'happy', hold: 1100, then: 'idle' },
    encourage: { seq: ['shrug'], face: 'kind', hold: 2600, then: 'ask' },
    think:     { seq: ['think'], face: 'think', bored: 'ask' },
    celebrate: { seq: ['jump', 'land', 'yay', 'yay2'], step: 2, face: 'happy', hold: 2600, then: 'idle', still: 'yay' }
  };

  const sheet = new Image();
  let loaded = false;
  let running = false;
  let timer = 0;
  let sayTimer = 0;
  let n = 0;                                // ticks since the page opened
  let cur = REACT.idle;
  let t0 = 0;                               // tick when the current reaction began
  let boredAt = 0;
  let talking = false;
  let mouth = false;
  let blinkTill = -1;
  let nextBlink = 30;
  let lastKey = '';

  const shown = () => running && stage.offsetParent !== null && !document.hidden;

  function frameName() {
    const seq = talking && cur.talk ? cur.talk : cur.seq;
    if (reduceMotion) return cur.still || seq[0];
    return seq[Math.floor((n - t0) / (cur.step || 1)) % seq.length];
  }

  function headName() {
    const base = 'head:' + cur.face + (talking && mouth ? ':talk' : '');
    return n <= blinkTill && F[base + ':blink'] ? base + ':blink' : base;
  }

  function blit(name, x, y) {
    const f = F[name];
    if (f) g.drawImage(sheet, f[0], f[1], f[2], f[3], x, y, f[2], f[3]);
  }

  function draw(force) {
    if (!loaded || !shown()) return;
    const pose = frameName();
    const head = headName();
    const key = pose + '|' + head + '|' + cv.width;
    if (!force && key === lastKey) return;
    lastKey = key;
    const bg = F.bg;
    const w = Math.min(cv.width, bg[2]);
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(sheet, bg[0], bg[1], w, bg[3], 0, 0, w, bg[3]);
    blit('shadow', D.home + D.shadow[0], D.shadow[1]);
    const body = F['body:' + pose];
    blit('body:' + pose, D.home, 0);
    blit(head, D.home + body[4], body[5]);
    blit('front:' + pose, D.home, 0);
  }

  function tick() {
    n += 1;
    if (cur.hold && (n - t0) * TICK >= cur.hold) {
      react(cur.then);
    } else if (cur.bored && !talking && !reduceMotion && n >= boredAt) {
      if (Math.random() < 0.6) react(cur.bored);
      else boredAt = n + ticks(3000);
    }
    if (talking && !reduceMotion && Math.random() < 0.7) mouth = !mouth;
    if (!reduceMotion && n >= nextBlink) {
      blinkTill = n + 1;
      nextBlink = n + 25 + Math.floor(Math.random() * 40);
    }
    draw();
  }

  // Integer device pixels across; each row 1.2 times taller (the VGA look).
  function resize() {
    const want = parseFloat(getComputedStyle(stage).getPropertyValue('--stage-h')) || 0;
    const inner = stage.clientWidth;
    if (!inner || want <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.floor((want * dpr) / (D.bg[1] * D.aspect)));
    const s = k / dpr;
    const w = Math.min(D.bg[0], Math.ceil(inner / s));
    if (cv.width !== w) cv.width = w;
    if (cv.height !== D.bg[1]) cv.height = D.bg[1];
    cv.style.width = w * s + 'px';
    cv.style.height = D.bg[1] * s * D.aspect + 'px';
    draw(true);
  }

  function react(name) {
    const r = REACT[name];
    if (!r) return;
    cur = r;
    t0 = n;
    boredAt = n + ticks(3500 + Math.random() * 2500);
    draw(true);
  }

  function talk(on) {
    clearTimeout(sayTimer);
    talking = !!on;
    mouth = talking;
    if (!talking) boredAt = n + ticks(3500 + Math.random() * 2500);
    draw();
  }

  function say(chars) {
    talk(true);
    sayTimer = setTimeout(() => talk(false), Math.min(2200, 300 + chars * 30));
  }

  function start() {
    running = true;
    resize();
    if (!timer) timer = setInterval(tick, TICK);
  }

  function stop() {
    running = false;
    talk(false);
    clearInterval(timer);
    timer = 0;
  }

  sheet.onload = () => { loaded = true; resize(); };
  sheet.src = D.sheet;
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => draw(true));

  return { start, stop, react, talk, say, refresh: resize };
})();
