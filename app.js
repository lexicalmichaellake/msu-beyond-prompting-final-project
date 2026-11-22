/*  SSP Reading Booster: the circle reader.
    Reads window.LECTURA (see lectura-casco.js). Every sentence gets Blaine
    Ray's circle of questions (yes, either/or, no, question word) in a random
    order with shuffled answers. Each reading ends with inference questions,
    and then the learner chooses the next reading. */
(() => {
  'use strict';

  const L = window.LECTURA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((done) => setTimeout(done, reduceMotion ? Math.min(ms, 80) : ms));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const shuffle = (list) => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ───────── settings and progress, saved in this browser only ───────── */

  const KEY = 'ssp-booster:' + L.id + ':';
  const load = (name, fallback) => {
    try {
      const raw = localStorage.getItem(KEY + name);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  };
  const save = (name, value) => {
    try { localStorage.setItem(KEY + name, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
  };

  const settings = Object.assign(
    { sound: true, blips: true, speed: reduceMotion ? 'instant' : 'normal', howto: true, profe: true },
    load('settings', {})
  );
  const progress = load('progress', {});
  let totalPoints = Math.max(0, Math.floor(Number(load('points', 0)) || 0));
  const SPEEDS = ['slow', 'normal', 'fast', 'instant'];
  const SPEED_MS = { slow: 46, normal: 26, fast: 11, instant: 0 };
  const SPEED_NAME = { slow: 'Lenta', normal: 'Normal', fast: 'Rápida', instant: 'Ya' };
  Sound.configure(settings);

  const AFFIRM = ['¡Correcto!', '¡Exacto!', '¡Muy bien!', '¡Eso es!', '¡Excelente!', '¡Desde luego!'];
  const HINTS = [
    '¡Casi! Lee la oración otra vez.',
    'Todavía no. ¡Tú puedes!',
    '¡Buen intento! Mira la oración.',
    'Mmm... todavía no. ¡Otra vez!'
  ];
  const YES_NO = ['Sí', 'No'];
  const YES_NO_EMOJI = ['☑️', '❌'];
  const MODE_NAME = { emoji: 'respuestas con emojis', words: 'respuestas con palabras', sentences: 'respuestas con oraciones completas' };

  // Points. Circle answer: 10 on the first try, 5 after a retry. Inference
  // answer: 20 / 10. Finishing a reading adds a bonus of 50 times its number.
  // After "¡Quiero las preguntas!" the bonus only comes when every inference
  // answer was right on the first try (¿Te sientes con suerte?). Replaying a
  // reading earns points again: more reading, more input.
  const POINTS = { circle: [10, 5], inference: [20, 10], bonus: 50 };

  /* ───────── content check: warns in the console about mismatched answers ───────── */

  const allQuestions = [];
  L.levels.forEach((lv, li) => {
    lv.paragraphs.flat().forEach((s, si) => s.c.forEach((q, qi) => {
      allQuestions.push({ q, where: `Lectura ${li + 1}, oración ${si + 1}, pregunta ${qi + 1}` });
    }));
    (lv.inference || []).forEach((q, k) => allQuestions.push({ q, where: `Lectura ${li + 1}, inferencia ${k + 1}` }));
  });
  allQuestions.forEach(({ q, where }) => {
    const yesNo = q.type === 'yes' || q.type === 'no';
    const n = yesNo ? 2 : (q.options || []).length;
    if (!yesNo && !(q.options || []).includes(q.answer)) console.warn(where + ': "answer" no coincide con ninguna opción.');
    if (q.full && q.full.length !== n) console.warn(where + ': "full" necesita ' + n + ' oraciones.');
    if (q.emoji && q.emoji.length !== n) console.warn(where + ': "emoji" necesita ' + n + ' emojis.');
  });

  /* ───────── word highlighting ───────── */

  const entries = new Map();
  const terms = [];
  L.vocab.forEach((v, i) => {
    Object.assign(v, { id: 'v' + i, kind: 'vocab', count: 0 });
    entries.set(v.id, v);
    (v.forms || []).forEach((f) => terms.push([f.toLowerCase(), v]));
  });
  (L.extras || []).forEach((x, i) => {
    Object.assign(x, { id: 'x' + i, kind: 'extra' });
    entries.set(x.id, x);
    (x.forms || []).forEach((f) => terms.push([f.toLowerCase(), x]));
  });
  terms.sort((a, b) => b[0].length - a[0].length);   // longest first: "casco de seguridad" before "casco"
  const termFor = new Map(terms);
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const TERM_RE = new RegExp(
    '(^|[^\\p{L}])(' + terms.map((t) => escapeRe(t[0])).join('|') + ')(?=[^\\p{L}]|$)',
    'giu'
  );

  function tokens(text) {
    const out = [];
    let last = 0;
    for (const m of text.matchAll(TERM_RE)) {
      const start = m.index + m[1].length;
      if (start > last) out.push({ text: text.slice(last, start) });
      out.push({ text: m[2], entry: termFor.get(m[2].toLowerCase()) });
      last = start + m[2].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
  }

  // How often each chapter word appears in the readings, questions and answers.
  (function countRepetitions() {
    const tally = (text) => tokens(text).forEach((tok) => {
      if (tok.entry && tok.entry.kind === 'vocab') tok.entry.count += 1;
    });
    L.levels.forEach((lv) => lv.paragraphs.flat().forEach((s) => tally(s.t)));
    allQuestions.forEach(({ q }) => {
      tally(q.ask);
      tally(q.then);
      (q.options || []).forEach(tally);
      (q.full || []).forEach(tally);
    });
  })();
  const wordsUsed = L.vocab.filter((v) => v.count > 0).length;

  /* ───────── rendering text ───────── */

  const asParts = (content) => (typeof content === 'string' ? [{ text: content }] : content);
  const plain = (content) => asParts(content).map((p) => p.text).join('');

  function termSpan(entry, interactive) {
    const s = document.createElement('span');
    s.className = 'term ' + entry.kind;
    s.dataset.id = entry.id;
    if (interactive) {
      s.setAttribute('role', 'button');
      s.tabIndex = 0;
    }
    return s;
  }

  function partHost(frag, part) {
    if (!part.cls) return frag;
    const s = document.createElement('span');
    s.className = part.cls;
    frag.append(s);
    return s;
  }

  // Final text: plain text plus tappable words.
  function renderRich(el, content) {
    const frag = document.createDocumentFragment();
    for (const part of asParts(content)) {
      const host = partHost(frag, part);
      for (const tok of tokens(part.text)) {
        if (!tok.entry) { host.append(tok.text); continue; }
        const s = termSpan(tok.entry, true);
        s.textContent = tok.text;
        host.append(s);
      }
    }
    el.replaceChildren(frag);
  }

  // Typing version: the same layout with one hidden span per character,
  // so words never jump to the next line halfway through.
  function renderTyping(el, content) {
    const frag = document.createDocumentFragment();
    const chars = [];
    for (const part of asParts(content)) {
      const host = partHost(frag, part);
      for (const tok of tokens(part.text)) {
        const box = tok.entry ? termSpan(tok.entry, false) : host;
        for (const ch of tok.text) {
          const c = document.createElement('span');
          c.className = 'ch';
          c.textContent = ch;
          box.append(c);
          chars.push(c);
        }
        if (box !== host) host.append(box);
      }
    }
    el.replaceChildren(frag);
    return chars;
  }

  const live = $('#sr-live');
  function announce(text) {
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 30);
  }

  /* ───────── typewriter ───────── */

  let typing = null;
  const finishTyping = () => { if (typing) typing.finish(); };

  function typeText(el, content, opts = {}) {
    finishTyping();
    const text = plain(content);
    const ms = SPEED_MS[settings.speed];
    const profeTalks = el === fb || el === askEl;      // the Profe's mouth moves with the dialog
    return new Promise((resolve) => {
      let timer = 0;
      let finished = false;
      const me = {};
      const done = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (typing === me) typing = null;
        renderRich(el, content);
        el.removeAttribute('aria-hidden');
        if (!opts.quiet) announce(text);
        if (profeTalks) Profe.talk(false);
        resolve();
      };
      me.finish = done;
      if (!ms) {
        done();
        if (profeTalks && text) Profe.say(text.length);
        return;
      }
      const chars = renderTyping(el, content);
      el.setAttribute('aria-hidden', 'true');
      typing = me;
      if (profeTalks) Profe.talk(true);
      let i = 0;
      let n = 0;
      const step = () => {
        if (i >= chars.length) { done(); return; }
        const c = chars[i++];
        c.classList.add('on');
        const ch = c.textContent;
        if (ch.trim() && n++ % 2 === 0) Sound.blip();
        timer = setTimeout(step, /[.!?…:]/.test(ch) ? ms * 7 : /[,;]/.test(ch) ? ms * 3 : ms);
      };
      step();
    });
  }

  /* ───────── screens and routing ───────── */

  let screen = '';
  let run = 0;          // goes up on every screen change, so old timers stop
  let lastMenu = '';

  function show(name) {
    run += 1;
    finishTyping();
    hideGloss();
    $('#modal').hidden = true;
    dismissHowto();
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'screen-' + name; });
    document.body.classList.toggle('reading', name === 'read');
    screen = name;
    const el = $('#screen-' + name);
    $$('.win', el).forEach((w, i) => w.style.setProperty('--d', i));
    el.classList.remove('enter');
    void el.offsetWidth;
    el.classList.add('enter');
    if (name === 'title') Scene.start(); else Scene.stop();
    if (name === 'read') Profe.start(); else Profe.stop();
    window.scrollTo(0, 0);
  }

  function navigate(hash) {
    if (location.hash.slice(1) === hash) route();
    else location.hash = hash;
  }

  function route() {
    const h = location.hash.slice(1);
    const m = /^lectura-(\d+)$/.exec(h);
    if (m && L.levels[+m[1] - 1]) startLevel(+m[1] - 1);
    else if (h === 'vocabulario') showVocab();
    else if (h === 'como-funciona') { showTitle(); openHowto(); }
    else if (h === 'opciones') showOptions();
    else showTitle();
  }

  window.addEventListener('hashchange', route);
  $$('.back[data-go]').forEach((b) => b.addEventListener('click', () => navigate('')));

  /* ───────── menus ───────── */

  function menuButton(o) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.go = o.go;
    b.dataset.help = o.help || '';
    const name = document.createElement('span');
    name.className = 'm-name';
    name.textContent = o.name;
    const sub = document.createElement('span');
    sub.className = 'm-sub';
    sub.textContent = o.sub;
    b.append(name, sub);
    if (o.badge) {
      const badge = document.createElement('span');
      badge.className = 'm-badge';
      if (o.star) {
        const star = document.createElement('span');
        star.className = 'star';
        star.setAttribute('aria-hidden', 'true');
        star.textContent = '★';
        badge.append(star);
      }
      badge.append(o.badge);
      b.append(badge);
    }
    li.append(b);
    return li;
  }

  function levelButton(i, note) {
    const lv = L.levels[i];
    const paras = lv.paragraphs.length;
    const p = progress[i];
    const hasPts = p && typeof p.points === 'number';
    return menuButton({
      go: 'lectura-' + (i + 1),
      name: lv.title,
      sub: paras + (paras === 1 ? ' párrafo' : ' párrafos') + ' · ' + (MODE_NAME[lv.responses] || MODE_NAME.words) + (note || ''),
      help: lv.blurb + (p ? ' Tu mejor resultado: ' + (hasPts ? p.points + ' puntos, ' : '') + p.best + ' de ' + p.total + ' al primer intento.' : ''),
      badge: p ? (hasPts ? p.points + ' pts' : p.best + '/' + p.total) : '',
      star: !!p
    });
  }

  /* ───────── points: a running total, saved in this browser only ───────── */

  const ptsEl = $('#hud-pts');
  const ptsNum = $('.n', ptsEl);
  function showPoints() {
    ptsNum.textContent = String(totalPoints);
    ptsEl.title = 'Tus puntos: ' + totalPoints;
    const line = $('#score-line');
    line.hidden = totalPoints === 0;
    line.textContent = '★ Tus puntos: ' + totalPoints;
  }

  function award(n) {
    if (!n) return;
    S.points += n;
    totalPoints += n;
    save('points', totalPoints);
    showPoints();
    const pop = document.createElement('span');
    pop.className = 'pop';
    pop.setAttribute('aria-hidden', 'true');
    pop.textContent = '+' + n;
    ptsEl.append(pop);
    setTimeout(() => pop.remove(), 1100);
    ptsEl.classList.remove('bump');
    void ptsEl.offsetWidth;
    ptsEl.classList.add('bump');
  }

  function separator() {
    const li = document.createElement('li');
    li.className = 'sep';
    li.setAttribute('role', 'presentation');
    return li;
  }

  function showTitle() {
    if (screen !== 'title') show('title');
    const ul = $('#menu');
    ul.replaceChildren();
    L.levels.forEach((lv, i) => ul.append(levelButton(i)));
    ul.append(separator());
    ul.append(menuButton({ go: 'vocabulario', name: 'Vocabulario', sub: 'Las palabras del capítulo', help: wordsUsed + ' palabras del capítulo aparecen en la historia. Toca una para ver qué significa.' }));
    ul.append(menuButton({ go: 'como-funciona', name: 'Cómo funciona', sub: 'El círculo de preguntas', help: 'Lee esto primero: cómo contestar y qué significan los colores.' }));
    ul.append(menuButton({ go: 'opciones', name: 'Opciones', sub: 'Sonido y velocidad del texto', help: 'Sonido, bip del texto y velocidad del texto.' }));
    $('#helpline').textContent = L.levels[0].blurb;
    showPoints();
    if (lastMenu) {
      const again = $('#menu button[data-go="' + lastMenu + '"]');
      if (again) again.focus({ preventScroll: true });
    }
  }

  $('#menu').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-go]');
    if (!b) return;
    lastMenu = b.dataset.go;
    navigate(b.dataset.go);
  });
  const showHelp = (e) => {
    const b = e.target.closest('button[data-help]');
    if (b) $('#helpline').textContent = b.dataset.help;
  };
  $('#menu').addEventListener('mouseover', showHelp);
  $('#menu').addEventListener('focusin', showHelp);

  /* ───────── instructions sheet ("Cómo funciona") ───────── */

  // It pops up when the site opens and from the menu. "No mostrar al abrir"
  // is remembered in this browser only.
  const howto = $('#howto');
  const howtoBox = $('.sheet', howto);
  const howtoSkip = $('#howto-skip');
  let howtoThen = null;      // what to do after "¡Entendido!" (for example, open a linked reading)
  let howtoReturn = null;    // where keyboard focus goes back to

  function openHowto(then) {
    howtoThen = then || null;
    howtoReturn = document.activeElement;
    howtoSkip.checked = settings.howto === false;
    hideGloss();
    howto.hidden = false;
    $$('.screen').forEach((s) => { s.inert = true; });
    howtoBox.classList.remove('opening');
    void howtoBox.offsetWidth;
    howtoBox.classList.add('opening');
    $('.sheet-body', howto).scrollTop = 0;
    howtoBox.focus({ preventScroll: true });
  }

  // Hides the sheet without running anything after it (used when the screen changes).
  function dismissHowto() {
    if (howto.hidden) return;
    howto.hidden = true;
    howtoThen = null;
    $$('.screen').forEach((s) => { s.inert = false; });
  }

  function closeHowto() {
    if (howto.hidden) return;
    const then = howtoThen;
    dismissHowto();
    if (then) { then(); return; }
    if (location.hash === '#como-funciona') { navigate(''); return; }
    const back = howtoReturn && howtoReturn !== document.body && document.contains(howtoReturn) ? howtoReturn : $('#menu button');
    if (back) back.focus({ preventScroll: true });
  }

  function trapTab(e, box) {
    const items = $$('button, input, [href], [tabindex]:not([tabindex="-1"])', box).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const inside = box.contains(document.activeElement) && document.activeElement !== box;
    if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
  }

  howtoSkip.addEventListener('change', () => {
    settings.howto = !howtoSkip.checked;
    save('settings', settings);
  });
  $('#howto-go').addEventListener('click', closeHowto);
  $('#howto-x').addEventListener('click', closeHowto);
  howto.addEventListener('click', (e) => { if (e.target === howto) closeHowto(); });

  /* ───────── reading ───────── */

  const hud = $('.hud');
  const dotsEl = $('#dots');
  const story = $('#story');
  const storyBody = $('#story-body');
  const fb = $('#fb');
  const askEl = $('#ask');
  const choices = $('#choices');
  const more = $('#more');
  const storyFoot = $('#story-foot');
  const skipBtn = $('#skip');
  const wide = window.matchMedia('(min-width: 760px)');   // two columns: the reading is on the left
  const S = {
    level: 0, sents: [], idx: 0, order: [], phase: 'intro', k: 0,
    first: 0, asked: 0, infFirst: 0, infAsked: 0, points: 0, missed: false, done: false, skipped: false
  };
  const mode = () => L.levels[S.level].responses || 'words';

  function startLevel(li, resume) {
    show('read');
    const my = run;
    const lv = L.levels[li];
    const r = resume || {};
    S.level = li;
    S.done = false;
    S.missed = false;
    S.sents = [];
    lv.paragraphs.forEach((para, p) => para.forEach((s) => S.sents.push(Object.assign({ p }, s))));
    S.phase = r.phase === 'inference' && (lv.inference || []).length ? 'inference' : 'intro';
    S.idx = S.phase === 'inference' ? S.sents.length - 1 : Math.min(r.idx || 0, S.sents.length - 1);
    S.first = r.first || 0;
    S.asked = r.asked || 0;
    S.infFirst = r.infFirst || 0;
    S.points = r.points || 0;
    S.infAsked = r.infAsked || 0;
    S.skipped = !!r.skipped;
    $('#hud-lvl').textContent = lv.title.toUpperCase();
    $('#story-title').textContent = L.title + ' · ' + lv.title;
    story.classList.remove('fin');
    storyBody.replaceChildren();
    const shown = S.phase === 'inference' ? S.sents.length : S.idx;
    for (let i = 0; i < shown; i++) renderRich(addSentence(i, 'past'), S.sents[i].t);
    storyBody.scrollTop = storyBody.scrollHeight;
    choices.replaceChildren();
    choices.style.minHeight = '';
    clearDialog();
    syncSkip();
    Profe.react('idle');
    if (S.phase === 'inference') { startInference(my, r.k || 0); return; }
    S.order = S.sents[S.idx].c.map((_, i) => i);
    renderDots();
    hud.classList.remove('no-circle');
    updateCount();
    if (S.idx === 0) intro(my, lv);
    else playSentence(my);
  }

  async function intro(my, lv) {
    await wait(320);
    if (my !== run) return;
    Profe.react('welcome');                  // open arms: "¡Hola, clase!"
    await typeText(askEl, lv.intro);
    if (my !== run) return;
    showChoices([{ label: '¡Vamos!', go: true, action: true, onPick: () => playSentence(run) }]);
  }

  function addSentence(i, cls) {
    const s = S.sents[i];
    let para = storyBody.querySelector('p[data-p="' + s.p + '"]');
    if (!para) {
      para = document.createElement('p');
      para.dataset.p = s.p;
      storyBody.append(para);
    }
    if (para.childNodes.length) para.append(' ');
    const span = document.createElement('span');
    span.className = 'sent ' + cls;
    para.append(span);
    return span;
  }

  // The passage scrolls inside the reading window, under its title.
  function scrollToSentence(span) {
    const box = storyBody.getBoundingClientRect();
    const r = span.getBoundingClientRect();
    const pad = 12;
    let delta = 0;
    if (r.bottom > box.bottom - pad) delta = r.bottom - box.bottom + pad;
    if (r.top - delta < box.top + pad) delta = r.top - box.top - pad;
    if (delta) storyBody.scrollBy({ top: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // The answer buttons sit above the reading, so when they change size the
  // current sentence can slip out of view; this brings it back.
  function keepSentenceInView() {
    const el = $('.sent.now', storyBody);
    if (el) requestAnimationFrame(() => scrollToSentence(el));
  }

  async function playSentence(my) {
    if (my !== run) return;
    S.phase = 'circle';
    const s = S.sents[S.idx];
    $$('.sent.now', storyBody).forEach((el) => el.classList.replace('now', 'past'));
    clearDialog();
    S.order = shuffle(s.c.map((_, i) => i));        // a new circle order for every sentence
    renderDots();
    hud.classList.remove('no-circle');
    updateCount();
    Sound.next();
    Profe.react(Math.random() < 0.5 ? 'gasp' : 'present');   // "¡Ohhh! ¡Clase, miren!"
    const span = addSentence(S.idx, 'now');
    const typed = typeText(span, s.t);      // lays out the whole sentence at once
    scrollToSentence(span);
    await typed;
    if (my !== run) return;
    await wait(320);
    if (my !== run) return;
    askCircle(my, 0);
  }

  async function askCircle(my, step) {
    const q = S.sents[S.idx].c[S.order[step]];
    S.missed = false;
    setDot(step);
    clearChoices();
    Profe.react('ask');                      // palms up, waiting for the class
    await typeText(askEl, q.ask);
    if (my !== run) return;
    offer(my, q,
      (firstTry) => {
        S.asked += 1;
        if (firstTry) S.first += 1;
        markDot(step);
        award(POINTS.circle[firstTry ? 0 : 1]);
      },
      () => (step < S.order.length - 1 ? askCircle(my, step + 1) : endOfCircle()));
  }

  // Builds the answer buttons for one question. Positions are always shuffled.
  // Emoji readings sometimes show ☑️ / ❌ or picture emojis; sentence readings
  // show the complete sentences from "full".
  function optionsFor(q, how) {
    const yesNo = q.type === 'yes' || q.type === 'no';
    const keys = yesNo ? YES_NO : q.options;
    const right = yesNo ? (q.type === 'yes' ? 0 : 1) : q.options.indexOf(q.answer);
    const pics = yesNo ? YES_NO_EMOJI : q.emoji;
    const useEmoji = how === 'emoji' && !!pics && Math.random() < 0.5;
    const useFull = how === 'sentences' && !!q.full;
    return shuffle(keys.map((key, i) => ({
      key,
      correct: i === right,
      label: useEmoji ? pics[i] : useFull ? q.full[i] : key,
      speech: useFull ? q.full[i] : key,
      emoji: useEmoji,
      sentence: useFull
    })));
  }

  function offer(my, q, onRight, next) {
    const opts = optionsFor(q, mode());
    showChoices(
      opts.map((o) => ({ label: o.label, speech: o.speech, emoji: o.emoji, onPick: (btn) => answer(my, q, o, btn, onRight, next) })),
      { emoji: opts.some((o) => o.emoji), sentences: opts.some((o) => o.sentence) }
    );
    keepSentenceInView();
  }

  function affirmFor(then) {
    const fresh = AFFIRM.filter((a) => !then.includes(a.replace(/[¡!]/g, '')));
    return pick(fresh.length ? fresh : AFFIRM);
  }

  async function answer(my, q, o, btn, onRight, next) {
    if (my !== run || btn.disabled || choices.classList.contains('locked')) return;

    if (!o.correct) {
      Sound.wrong();
      S.missed = true;
      btn.disabled = true;
      btn.classList.add('wrong');
      const other = $('#choices button:not(:disabled)');
      if (other) other.focus({ preventScroll: true });
      pulseSentence();
      fb.className = 'fb hint';
      Profe.react('encourage');              // a kind shrug: "¡Casi!"
      typeText(fb, pick(HINTS));
      return;
    }

    Sound.correct();
    Profe.react(Math.random() < 0.5 ? 'yay' : 'clap');
    choices.classList.add('locked');
    btn.classList.add('right');
    $$('.choice', choices).forEach((b) => { if (b !== btn) b.classList.add('gone'); });
    onRight(!S.missed);
    await wait(480);
    if (my !== run) return;
    clearChoices();
    askEl.replaceChildren();
    fb.className = 'fb';
    await typeText(fb, [{ text: affirmFor(q.then) + ' ', cls: 'yay' }, { text: q.then }]);
    if (my !== run) return;
    await wait(450);
    if (my !== run) return;
    next();
  }

  function endOfCircle() {
    const last = S.idx === S.sents.length - 1;
    const inference = (L.levels[S.level].inference || []).length > 0;
    more.hidden = false;
    showChoices([{
      label: !last ? 'Siguiente oración' : inference ? 'Preguntas de inferencia' : 'Terminar la lectura',
      go: true,
      action: true,
      onPick: () => {
        if (!last) {
          S.idx += 1;
          playSentence(run);
        } else if (inference) startInference(run, 0);
        else finishLevel(run);
      }
    }]);
  }

  /* ───────── inference questions at the end of a reading ───────── */

  async function startInference(my, k) {
    S.phase = 'inference';
    $$('.sent.now', storyBody).forEach((el) => el.classList.replace('now', 'past'));
    story.classList.add('fin');
    storyBody.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    hud.classList.add('no-circle');
    clearDialog();
    syncSkip();
    Profe.react('think');
    if (k > 0) { askInference(my, k); return; }
    updateCount('Inferencia');
    const where = wide.matches ? 'a la izquierda' : 'abajo';
    await typeText(askEl, S.skipped
      ? '¿Te sientes con suerte? ¡Muy bien! Aquí están las preguntas. La lectura completa está ' + where + '.'
      : '¡Muy bien! Ahora contesta unas preguntas de inferencia. La lectura completa está ' + where + '.');
    if (my !== run) return;
    showChoices([{ label: '¡Vamos!', go: true, action: true, onPick: () => askInference(run, 0) }]);
  }

  async function askInference(my, k) {
    const list = L.levels[S.level].inference;
    const q = list[k];
    S.k = k;
    S.missed = false;
    updateCount('Inferencia ' + (k + 1) + '/' + list.length);
    clearChoices();
    Profe.react('think');                    // hand at the chin: read between the lines
    await typeText(askEl, q.ask);
    if (my !== run) return;
    offer(my, q,
      (firstTry) => {
        S.infAsked += 1;
        if (firstTry) S.infFirst += 1;
        award(POINTS.inference[firstTry ? 0 : 1]);
      },
      () => (k < list.length - 1 ? askInference(my, k + 1) : finishLevel(my)));
  }

  /* ───────── end of a reading: score, then the learner picks the next one ───────── */

  async function finishLevel(my) {
    S.phase = 'end';
    S.done = true;
    Sound.fanfare();
    Profe.react('celebrate');                // a happy jump with both arms up
    $$('.sent.now', storyBody).forEach((el) => el.classList.replace('now', 'past'));
    story.classList.add('fin');
    hud.classList.add('no-circle');
    updateCount('¡Fin!');
    // Bonus for finishing. After "¡Quiero las preguntas!" it needs every
    // inference answer right on the first try.
    const lucky = S.skipped;
    const bonus = !lucky || (S.infAsked > 0 && S.infFirst === S.infAsked) ? POINTS.bonus * (S.level + 1) : 0;
    award(bonus);
    const best = S.first + S.infFirst;
    const total = S.asked + S.infAsked;
    const prev = progress[S.level];
    // A shorter run (after "¡Quiero las preguntas!") never replaces a fuller run's record.
    if (!prev || total > prev.total) progress[S.level] = { best, total };
    else if (total === prev.total) progress[S.level] = { best: Math.max(prev.best, best), total };
    progress[S.level].points = Math.max((prev && prev.points) || 0, S.points);
    save('progress', progress);
    clearDialog();
    syncSkip();
    const isLast = S.level === L.levels.length - 1;
    const lv = L.levels[S.level];
    const parts = [];
    if (S.asked) parts.push('círculo ' + S.first + ' de ' + S.asked);
    if (S.infAsked) parts.push('inferencia ' + S.infFirst + ' de ' + S.infAsked);
    const lines = [
      { text: (isLast ? '¡Felicidades! Ya comprendes la historia completa.' : '¡Excelente! Ya comprendes la ' + lv.title + '.') + ' ', cls: 'yay' }
    ];
    if (parts.length) lines.push({ text: 'Al primer intento: ' + parts.join(', ') + '. ' });
    if (bonus) lines.push({ text: (lucky ? '¡Qué suerte! ' : '') + 'Bono: +' + bonus + ' puntos. ', cls: 'yay' });
    else if (lucky) lines.push({ text: 'No hay bono esta vez: necesitas todo correcto al primer intento. ' });
    lines.push({ text: 'Ganaste ' + S.points + ' puntos. Total: ' + totalPoints + '.' });
    await typeText(fb, lines);
    if (my !== run) return;
    Profe.react('welcome');
    await typeText(askEl, '¿Qué lectura quieres leer ahora?');
    if (my !== run) return;
    showLevelMenu();
  }

  function showLevelMenu() {
    choices.replaceChildren();
    choices.classList.remove('locked', 'has-emoji', 'mode-sentences');
    choices.style.minHeight = '';
    const next = S.level + 1 < L.levels.length ? S.level + 1 : -1;
    const box = document.createElement('nav');
    box.className = 'win end-menu';
    box.setAttribute('aria-label', '¿Qué lectura quieres leer ahora?');
    const ul = document.createElement('ul');
    ul.className = 'menu';
    L.levels.forEach((lv, i) => ul.append(levelButton(i, i === S.level ? ' · otra vez' : i === next ? ' · la siguiente' : '')));
    ul.append(separator());
    ul.append(menuButton({ go: '', name: 'Menú principal', sub: 'Vocabulario, opciones y más' }));
    box.append(ul);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-go]');
      if (!b || choices.classList.contains('locked')) return;
      choices.classList.add('locked');
      navigate(b.dataset.go);
    });
    choices.append(box);
    const target = $('button[data-go="lectura-' + ((next >= 0 ? next : S.level) + 1) + '"]', box);
    if (target) target.focus({ preventScroll: true });
  }

  /* ───────── answer buttons and dialog ───────── */

  function showChoices(items, opts = {}) {
    choices.replaceChildren();
    choices.classList.remove('locked');
    choices.classList.toggle('has-emoji', !!opts.emoji);
    choices.classList.toggle('mode-sentences', !!opts.sentences);
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice' + (it.go ? ' go' : '') + (it.emoji ? ' is-emoji' : '');
      b.style.setProperty('--i', i);
      if (it.emoji) b.setAttribute('aria-label', it.speech);
      const key = document.createElement('span');
      key.className = 'key';
      key.setAttribute('aria-hidden', 'true');
      key.textContent = String(i + 1);
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = it.label;
      b.append(key, label);
      b.addEventListener('click', () => {
        if (b.disabled || choices.classList.contains('locked')) return;
        if (it.action) {
          choices.classList.add('locked');
          more.hidden = true;
        }
        it.onPick(b);
      });
      choices.append(b);
    });
    choices.style.minHeight = '';
    const first = $('#choices button');
    if (first) first.focus({ preventScroll: true });
  }

  // Empties the answer area but keeps its height for a moment, so the reading
  // below it does not jump up and down between questions.
  function clearChoices() {
    const h = choices.offsetHeight;
    if (h) choices.style.minHeight = h + 'px';
    choices.replaceChildren();
    choices.classList.remove('locked', 'has-emoji', 'mode-sentences');
  }

  function clearDialog() {
    finishTyping();
    fb.replaceChildren();
    fb.className = 'fb';
    askEl.replaceChildren();
    clearChoices();
    more.hidden = true;
  }

  // One plain dot per question in the circle. The dots show progress only:
  // they never say whether the next question is a yes, no, either/or or
  // question-word question, so every question has to be read.
  function renderDots() {
    dotsEl.replaceChildren(...S.order.map(() => document.createElement('li')));
    dotsEl.setAttribute('aria-label', 'Pregunta 1 de ' + S.order.length);
  }
  const dots = () => $$('li', dotsEl);
  function setDot(step) {
    dots().forEach((d, i) => d.classList.toggle('now', i === step));
    dotsEl.setAttribute('aria-label', 'Pregunta ' + (step + 1) + ' de ' + S.order.length);
  }
  function markDot(step) {
    const d = dots()[step];
    if (!d) return;
    d.classList.remove('now');
    d.classList.add('done');
  }

  function updateCount(text) {
    const count = $('#hud-count');
    if (text) { count.textContent = text; return; }
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = 'Oración ';
    count.replaceChildren(lbl, (S.idx + 1) + '/' + S.sents.length);
  }

  function pulseSentence() {
    const el = $('.sent.now', storyBody);
    if (!el) return;
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
    scrollToSentence(el);
  }

  /* ───────── "¡Quiero las preguntas!": straight to the questions, whole reading on screen ───────── */

  const canSkip = () => screen === 'read'
    && (S.phase === 'intro' || S.phase === 'circle')
    && (L.levels[S.level].inference || []).length > 0;

  function syncSkip() { storyFoot.hidden = !canSkip(); }

  skipBtn.addEventListener('click', () => {
    if (!canSkip()) return;
    run += 1;                    // stops the sentence or question in progress
    finishTyping();
    hideGloss();
    Sound.next();
    S.skipped = true;
    storyBody.replaceChildren();
    S.sents.forEach((s, i) => renderRich(addSentence(i, 'past'), s.t));
    S.idx = S.sents.length - 1;
    startInference(run, 0);
  });

  /* ───────── leaving a reading ───────── */

  const modal = $('#modal');
  function askToLeave() {
    if (S.done) { navigate(''); return; }
    modal.hidden = false;
    $('#modal-no').focus();
  }
  function closeModal() {
    modal.hidden = true;
    const b = $('#choices button:not(:disabled)');
    if (b) b.focus({ preventScroll: true });
  }
  $('#hud-menu').addEventListener('click', askToLeave);
  $('#modal-yes').addEventListener('click', () => { modal.hidden = true; navigate(''); });
  $('#modal-no').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  /* ───────── sound button ───────── */

  const soundBtn = $('#hud-sound');
  function syncSound() {
    soundBtn.setAttribute('aria-pressed', String(settings.sound));
    soundBtn.title = settings.sound ? 'Sonido: sí' : 'Sonido: no';
  }
  // "El Profe: No" in Opciones hides the animated teacher (handy on small phones).
  function syncProfe() {
    document.body.classList.toggle('no-profe', !settings.profe);
    Profe.refresh();
  }

  soundBtn.addEventListener('click', () => {
    settings.sound = !settings.sound;
    save('settings', settings);
    Sound.configure(settings);
    if (settings.sound) { Sound.unlock(); Sound.next(); }
    syncSound();
  });

  /* ───────── glossary popup ───────── */

  const gloss = $('#gloss');
  let glossFor = null;

  function showGloss(t) {
    const entry = entries.get(t.dataset.id);
    if (!entry) return;
    if (glossFor === t && !gloss.hidden) { hideGloss(); return; }
    gloss.replaceChildren();
    const line = (cls, text) => {
      const s = document.createElement('span');
      s.className = cls;
      s.textContent = text;
      gloss.append(s);
    };
    line('g-tag', entry.kind === 'vocab' ? 'VOCABULARIO' : 'PALABRA EXTRA');
    line('g-es', entry.es);
    line('g-en', entry.en);
    if (entry.note) line('g-note', entry.note);
    gloss.classList.toggle('is-extra', entry.kind !== 'vocab');
    gloss.hidden = false;
    glossFor = t;
    const r = t.getBoundingClientRect();
    const w = gloss.offsetWidth;
    const h = gloss.offsetHeight;
    const x = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
    let y = r.bottom + 8;
    if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 8);
    gloss.style.left = x + 'px';
    gloss.style.top = y + 'px';
    gloss.style.animation = 'none';
    void gloss.offsetWidth;
    gloss.style.animation = '';
  }

  function hideGloss() {
    gloss.hidden = true;
    glossFor = null;
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('.term[role="button"]');
    if (t) { showGloss(t); return; }
    if (!e.target.closest('#gloss')) hideGloss();
  });
  storyBody.addEventListener('scroll', hideGloss, { passive: true });
  window.addEventListener('resize', hideGloss);

  /* ───────── vocabulary page ───────── */

  let vocabBuilt = false;
  function showVocab() {
    show('vocab');
    if (vocabBuilt) return;
    vocabBuilt = true;
    const host = $('#vocab-list');
    const groups = new Map();
    L.vocab.forEach((v) => {
      if (!groups.has(v.group)) groups.set(v.group, []);
      groups.get(v.group).push(v);
    });
    groups.forEach((list, name) => {
      const sec = document.createElement('section');
      sec.className = 'vgroup';
      const h = document.createElement('h3');
      h.textContent = name;
      const ul = document.createElement('ul');
      ul.className = 'vlist';
      list.forEach((v) => {
        const li = document.createElement('li');
        const es = document.createElement('span');
        es.className = 'v-es';
        es.textContent = v.es;
        const en = document.createElement('span');
        en.className = 'v-en';
        en.textContent = v.en;
        if (v.note) {
          const note = document.createElement('span');
          note.className = 'v-note';
          note.textContent = ' · ' + v.note;
          en.append(note);
        }
        li.append(es, en);
        if (v.forms && v.forms.length) {
          const n = document.createElement('span');
          n.className = 'v-n';
          n.textContent = '×' + v.count;
          n.title = v.count + ' veces en las lecturas, las preguntas y las respuestas';
          li.append(n);
        }
        ul.append(li);
      });
      sec.append(h, ul);
      host.append(sec);
    });
  }

  /* ───────── options page ───────── */

  function showOptions() {
    show('options');
    renderOptions();
    $('#speed-sample').replaceChildren();
  }

  function renderOptions(focusIndex) {
    const ul = $('#options-list');
    ul.replaceChildren();
    const rows = [
      { name: 'Sonido', sub: 'Campanas y efectos', value: settings.sound ? 'Sí' : 'No', toggle() { settings.sound = !settings.sound; } },
      { name: 'Bip del texto', sub: 'Un bip suave con las letras', value: settings.blips ? 'Sí' : 'No', toggle() { settings.blips = !settings.blips; } },
      { name: 'Velocidad del texto', sub: 'Lenta, normal, rápida o ya', value: SPEED_NAME[settings.speed], toggle() { settings.speed = SPEEDS[(SPEEDS.indexOf(settings.speed) + 1) % SPEEDS.length]; } },
      { name: 'El Profe', sub: 'El profe animado arriba del diálogo', value: settings.profe ? 'Sí' : 'No', toggle() { settings.profe = !settings.profe; } }
    ];
    rows.forEach((row, i) => {
      const li = menuButton({ go: '', name: row.name, sub: row.sub, badge: row.value });
      li.querySelector('button').addEventListener('click', () => {
        row.toggle();
        save('settings', settings);
        Sound.configure(settings);
        syncSound();
        syncProfe();
        renderOptions(i);
        if (i === 0 && settings.sound) { Sound.unlock(); Sound.correct(); }
        if (i === 1 || i === 2) typeText($('#speed-sample'), 'Es temprano y la agente Rivera camina por la ciudad.', { quiet: true });
      });
      ul.append(li);
    });
    if (focusIndex != null) $$('button', ul)[focusIndex].focus();
  }

  /* ───────── keyboard and pointer ───────── */

  function moveFocus(list, e) {
    const fwd = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    if (!list.length || (!fwd && !back)) return;
    e.preventDefault();
    let i = list.indexOf(document.activeElement);
    i = i < 0 ? 0 : (i + (fwd ? 1 : -1) + list.length) % list.length;
    list[i].focus();
  }

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k !== 'Escape' && k !== 'Tab') Sound.unlock();

    if (!howto.hidden) {
      if (k === 'Escape') { e.preventDefault(); closeHowto(); }
      else if (k === 'Tab') trapTab(e, howtoBox);
      else if (k === 'Enter' && document.activeElement === howtoBox) { e.preventDefault(); closeHowto(); }
      return;
    }

    if (!modal.hidden) {
      if (k === 'Escape') closeModal();
      if (k === 'Tab') {
        e.preventDefault();
        (document.activeElement === $('#modal-no') ? $('#modal-yes') : $('#modal-no')).focus();
      }
      return;
    }
    if (k === 'Escape' && !gloss.hidden) { hideGloss(); return; }

    const t = e.target;
    if (t.matches && t.matches('.term[role="button"]') && (k === 'Enter' || k === ' ')) {
      e.preventDefault();
      showGloss(t);
      return;
    }

    if (screen === 'read') {
      if (typing && (k === 'Enter' || k === ' ') && !t.closest('button')) {
        e.preventDefault();
        finishTyping();
        return;
      }
      if (/^[1-9]$/.test(k)) {
        const b = $$('#choices button')[+k - 1];
        if (b && !b.disabled && !e.repeat) { e.preventDefault(); b.click(); }
        return;
      }
      if (k === 'Escape') { askToLeave(); return; }
      moveFocus($$('#choices button:not(:disabled)'), e);
    } else if (screen === 'title') {
      if (k === 'ArrowDown' || k === 'ArrowUp') moveFocus($$('#menu button'), e);
    } else {
      if (k === 'ArrowDown' || k === 'ArrowUp') moveFocus($$('#options-list button'), e);
      if (k === 'Escape') navigate('');
    }
  });

  document.addEventListener('pointerup', () => Sound.unlock());
  document.addEventListener('click', () => Sound.unlock(), true);

  // A tap on the reading screen finishes the line that is typing.
  $('#screen-read').addEventListener('pointerdown', (e) => {
    if (typing && !e.target.closest('button, .hud')) finishTyping();
  });

  // When the ▼ shows, a tap on the dialog box goes on.
  $('#dialog').addEventListener('click', (e) => {
    if (more.hidden || typing || e.target.closest('.term')) return;
    const b = $('.choice.go', choices);
    if (b) b.click();
  });

  /* ───────── title scene: the city at dawn, the officer, and a cyclist ───────── */

  const Scene = (() => {
    const cv = $('#skyline');
    const g = cv && cv.getContext ? cv.getContext('2d') : null;
    if (!g) return { start() {}, stop() {} };
    const W = cv.width;
    const H = cv.height;

    const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const px = (ctx, x, y, color, pts) => {
      ctx.fillStyle = color;
      pts.forEach(([a, b]) => ctx.fillRect(x + a, y + b, 1, 1));
    };
    const ring = (cx, cy) => [
      [cx - 1, cy - 2], [cx, cy - 2], [cx + 1, cy - 2],
      [cx - 2, cy - 1], [cx + 2, cy - 1], [cx - 2, cy], [cx + 2, cy], [cx - 2, cy + 1], [cx + 2, cy + 1],
      [cx - 1, cy + 2], [cx, cy + 2], [cx + 1, cy + 2]
    ];

    function drawBank(b, x, y) {
      const w = 30;
      b.fillStyle = '#c9cdee';
      b.fillRect(x, y - 16, w, 16);
      b.fillStyle = '#e8eaff';
      b.fillRect(x - 2, y - 18, w + 4, 2);
      for (let i = 0; i < 6; i++) b.fillRect(x + 1 + i * 2, y - 19 - i, w - 2 - i * 4, 1);
      b.fillStyle = '#9097c9';
      for (let cx = x + 3; cx < x + w - 2; cx += 5) b.fillRect(cx, y - 15, 2, 13);
      b.fillStyle = '#6a3d2a';
      b.fillRect(x + 12, y - 9, 6, 9);
      b.fillStyle = '#ffe066';
      b.fillRect(x + 14, y - 22, 2, 2);
      b.fillStyle = '#b4b9e3';
      b.fillRect(x - 1, y - 2, w + 2, 2);
    }

    const bg = document.createElement('canvas');
    bg.width = W;
    bg.height = H;
    (function paint(b) {
      const sky = ['#0b1352', '#15216b', '#25317f', '#3d3b8e', '#5f4693', '#8f5292', '#c96784', '#f29a62'];
      const band = 5;
      b.fillStyle = sky[sky.length - 1];
      b.fillRect(0, 0, W, H);
      sky.forEach((c, i) => { b.fillStyle = c; b.fillRect(0, i * band, W, band); });
      for (let i = 0; i < sky.length - 1; i++) {
        b.fillStyle = sky[i + 1];
        for (let x = i % 2; x < W; x += 2) b.fillRect(x, i * band + band - 1, 1, 1);
      }
      const rnd = rng(7);
      b.fillStyle = '#ffffff';
      for (let i = 0; i < 26; i++) b.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * 13), 1, 1);
      b.fillStyle = '#2a2470';
      for (let x = 0; x < W;) {
        const w = 5 + Math.floor(rnd() * 9);
        const h = 8 + Math.floor(rnd() * 14);
        b.fillRect(x, 47 - h, w, h);
        x += w;
      }
      for (let x = -3; x < W;) {
        if (x > 120 && x < 168) { x = 170; continue; }      // room for the bank
        const w = 12 + Math.floor(rnd() * 13);
        const h = 14 + Math.floor(rnd() * 16);
        b.fillStyle = '#10154a';
        b.fillRect(x, 47 - h, w, h);
        for (let wy = 47 - h + 3; wy < 44; wy += 4) {
          for (let wx = x + 2; wx < x + w - 2; wx += 3) {
            if (rnd() < 0.5) {
              b.fillStyle = rnd() < 0.82 ? '#ffe066' : '#8fd3ff';
              b.fillRect(wx, wy, 1, 2);
            }
          }
        }
        x += w + 1;
      }
      drawBank(b, 132, 47);
      b.fillStyle = '#4a4f8f';
      b.fillRect(0, 47, W, 4);
      b.fillStyle = '#7e85c4';
      b.fillRect(0, 47, W, 1);
      b.fillStyle = '#1a1d4d';
      b.fillRect(0, 51, W, H - 51);
      b.fillStyle = '#9aa1d6';
      for (let x = 2; x < W; x += 12) b.fillRect(x, 58, 6, 1);
    })(bg.getContext('2d'));

    // La agente Rivera, standing on the sidewalk near the bank.
    function drawOfficer(x, y) {
      px(g, x, y, '#1b2a6b', [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1]]);
      px(g, x, y, '#ffe066', [[3, 0]]);
      px(g, x, y, '#2b1a10', [[1, 2], [5, 2], [1, 3], [5, 3], [5, 4]]);
      px(g, x, y, '#b9805a', [[2, 2], [3, 2], [4, 2], [2, 3], [3, 3], [4, 3], [3, 4]]);
      px(g, x, y, '#3d5bd9', [[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]]);
      px(g, x, y, '#ffe066', [[2, 6]]);
      px(g, x, y, '#0b1352', [[1, 8], [2, 8], [3, 8], [4, 8], [5, 8]]);
      px(g, x, y, '#b9805a', [[0, 8], [6, 8]]);
      px(g, x, y, '#1b2a6b', [[2, 9], [4, 9], [2, 10], [4, 10], [2, 11], [4, 11]]);
      px(g, x, y, '#02040f', [[1, 12], [2, 12], [4, 12], [5, 12]]);
    }

    // The cyclist, riding right, with a yellow safety helmet.
    function drawCyclist(x, y, frame) {
      px(g, x, y, '#e8ecff', ring(3, 11).concat(ring(12, 11)));
      px(g, x, y, '#8f96c8', frame ? [[3, 10], [3, 12], [12, 10], [12, 12]] : [[2, 11], [4, 11], [11, 11], [13, 11]]);
      px(g, x, y, '#8fd3ff', [[4, 10], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 10], [6, 8], [7, 10], [11, 8]]);
      px(g, x, y, '#02040f', [[5, 7], [6, 7]]);
      px(g, x, y, '#c9cdee', [[11, 7], [12, 7]]);
      px(g, x, y, '#2b3a8f', [[6, 6], [7, 6], [8, 6]]);
      px(g, x, y, '#2b3a8f', frame ? [[8, 7], [8, 8], [8, 9]] : [[8, 7], [9, 8], [9, 9]]);
      px(g, x, y, '#02040f', frame ? [[8, 10]] : [[9, 10]]);
      px(g, x, y, '#e8574a', [[8, 3], [9, 3], [7, 4], [8, 4], [9, 4], [7, 5], [8, 5], [10, 4]]);
      px(g, x, y, '#c98a5b', [[9, 2], [10, 2], [11, 2], [10, 3], [10, 5], [11, 6]]);
      px(g, x, y, '#2b1a10', [[8, 2]]);
      px(g, x, y, '#ffd84a', [[8, 0], [9, 0], [10, 0], [7, 1], [8, 1], [9, 1], [10, 1]]);
      px(g, x, y, '#c99a1e', [[11, 1]]);
    }

    let raf = 0;
    let t0 = 0;
    let running = false;
    function draw(sec) {
      g.drawImage(bg, 0, 0);
      drawOfficer(122, 38);
      const x = reduceMotion ? 92 : Math.floor((sec * 20) % (W + 40)) - 20;
      drawCyclist(x, 46, Math.floor(sec * 6) % 2);
    }
    function loop(t) {
      if (!running) return;
      if (!t0) t0 = t;
      draw((t - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    return {
      start() {
        draw(0);
        if (running || reduceMotion) return;
        running = true;
        t0 = 0;
        raf = requestAnimationFrame(loop);
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
  })();

  /* ───────── start ───────── */

  // Instructions first: the sheet pops up over the title screen when the site
  // opens, unless this browser chose "No mostrar al abrir". A link to a reading
  // (for example #lectura-2) opens that reading after the sheet is closed.
  // Nothing here talks to a server: progress and settings stay in localStorage.
  syncSound();
  syncProfe();
  showPoints();
  const startHash = location.hash.slice(1);
  if (settings.howto !== false || startHash === 'como-funciona') {
    showTitle();
    openHowto(startHash && startHash !== 'como-funciona' ? route : null);
  } else {
    route();
  }
})();
