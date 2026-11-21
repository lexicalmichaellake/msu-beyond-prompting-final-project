/*  Sound kit for the circle reader. Every sound is synthesized with the
    Web Audio API, so there are no audio files to host.
    Browsers only allow sound after the first tap or key press, so the page
    calls Sound.unlock() from its input handlers. */
window.Sound = (() => {
  let ctx = null;
  let out = null;
  let fx = null;
  let on = true;
  let blips = true;
  let lastBlip = 0;
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; return; }
    out = ctx.createGain();
    out.gain.value = 0.55;
    out.connect(ctx.destination);
    // A short echo gives the chimes a little sparkle, like an old sound chip with reverb.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.12;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;
    const wet = ctx.createGain();
    wet.gain.value = 0.2;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(out);
    fx = ctx.createGain();
    fx.connect(out);
    fx.connect(delay);
  }

  // Returns a running context, or null when sound is off or still locked.
  function live() {
    if (!on || !ctx) return null;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(c, midi, at, len, opts) {
    const o = Object.assign({ wave: 'triangle', vol: 0.15, bend: 1, dry: false }, opts);
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = o.wave;
    osc.frequency.setValueAtTime(hz(midi), at);
    if (o.bend !== 1) osc.frequency.exponentialRampToValueAtTime(hz(midi) * o.bend, at + len);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(o.vol, at + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(amp);
    amp.connect(o.dry ? out : fx);
    osc.start(at);
    osc.stop(at + len + 0.05);
  }

  return {
    configure(settings) {
      on = !!settings.sound;
      blips = !!settings.blips;
    },

    unlock() {
      if (!on) return;
      if (!ctx) build();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },

    // Next sentence: a soft two-note bell that rises a fifth.
    next() {
      const c = live(); if (!c) return;
      const t = c.currentTime + 0.02;
      tone(c, 84, t, 0.22, { vol: 0.16 });
      tone(c, 96, t, 0.18, { wave: 'sine', vol: 0.05 });
      tone(c, 91, t + 0.09, 0.42, { vol: 0.15 });
      tone(c, 103, t + 0.09, 0.3, { wave: 'sine', vol: 0.04 });
    },

    // Correct answer: a bright rising arpeggio (C, E, G, C).
    correct() {
      const c = live(); if (!c) return;
      const t = c.currentTime + 0.02;
      [84, 88, 91, 96].forEach((m, i) => {
        const last = i === 3;
        tone(c, m, t + i * 0.06, last ? 0.42 : 0.12, { wave: 'square', vol: 0.05 });
        tone(c, m, t + i * 0.06, last ? 0.46 : 0.14, { vol: 0.12 });
      });
    },

    // Wrong answer: a gentle "almost!" that steps down, then lifts back up.
    // The three notes outline a major chord, so it stays friendly.
    wrong() {
      const c = live(); if (!c) return;
      const t = c.currentTime + 0.02;
      tone(c, 69, t, 0.16, { vol: 0.16, bend: 0.985 });
      tone(c, 65, t + 0.13, 0.24, { vol: 0.15, bend: 0.98 });
      tone(c, 72, t + 0.42, 0.18, { vol: 0.1 });
    },

    // Typewriter tick, very quiet.
    blip() {
      if (!blips) return;
      const c = live(); if (!c || c.state !== 'running') return;
      const now = c.currentTime;
      if (now - lastBlip < 0.03) return;
      lastBlip = now;
      tone(c, 83 + Math.floor(Math.random() * 3), now + 0.005, 0.035, { wave: 'square', vol: 0.028, dry: true });
    },

    // End of a reading: a short, cheerful jingle.
    fanfare() {
      const c = live(); if (!c) return;
      const t = c.currentTime + 0.05;
      const seq = [[72, 0, 0.1], [76, 0.1, 0.1], [79, 0.2, 0.1], [84, 0.3, 0.18], [79, 0.5, 0.1], [84, 0.6, 0.65]];
      seq.forEach(([m, d, len]) => {
        tone(c, m, t + d, len, { wave: 'square', vol: 0.045 });
        tone(c, m + 12, t + d, len, { vol: 0.08 });
        tone(c, m - 12, t + d, len, { vol: 0.06 });
      });
    }
  };
})();
