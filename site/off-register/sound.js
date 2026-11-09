// Synthesised sound for the whole site: Web Audio only, no files. Off until a visitor opts in, and the
// AudioContext is only created/resumed from a user gesture (the buttons below, or the first tap/key when the choice was saved as on).
// Voicing rule: phones roll off below ~300 Hz and laptops below ~150 Hz, so every cue lives in 250 Hz-5 kHz; "weight" comes from
// harmonics (saw/square through a lowpass, octave partials, a soft waveshaper), never from a sub layer.
let C, M, R, NB, P = 1, V = 1, on = false, woke = 0;
try { on = localStorage.getItem('sound') === '1'; } catch {}
const subs = new Set(), notify = () => subs.forEach((f) => f());
const live = () => !!(on && C && C.state === 'running');
const GAIN = 0.9, LV = .55; // LV: voice trim, so the limiter at the end only shaves peaks instead of flattening everything
const SHP = new Float32Array(1025).map((_, i) => Math.tanh(2.2 * (i / 512 - 1)) / Math.tanh(2.2));
const mf = (m) => 440 * 2 ** ((m - 69) / 12);

// the shared graph on a real or offline context: master -> limiter -> out, a noise buffer, and one convolution reverb on a send bus
function init(ctx) {
  C = ctx; M = C.createGain(); M.gain.value = 0;
  const z = C.createDynamicsCompressor(); z.threshold.value = -10; z.knee.value = 0; z.ratio.value = 12; z.attack.value = .002; z.release.value = .15;
  M.connect(z).connect(C.destination);
  const sr = C.sampleRate;
  NB = C.createBuffer(1, sr * 2, sr); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const len = Math.round(sr * 2.2), ir = C.createBuffer(2, len, sr); // decaying noise that darkens as it dies: a warm room
  for (let c = 0; c < 2; c++) {
    const q = ir.getChannelData(c); let lp = 0;
    for (let i = 0; i < len; i++) { const x = i / sr, a = 1 - Math.exp(-6.283 * (9000 * Math.exp(-x * 1.3) + 1200) / sr); lp += a * (Math.random() * 2 - 1 - lp); q[i] = lp * Math.exp(-x * 3.1) * Math.min(1, x / .015); }
  }
  const cv = C.createConvolver(), wet = C.createGain(); cv.buffer = ir; wet.gain.value = .9;
  R = C.createGain(); R.connect(cv); cv.connect(wet).connect(M);
}
function unlock() {
  try {
    if (!C) { init(new (window.AudioContext || window.webkitAudioContext)()); M.gain.value = on ? GAIN : 0; C.onstatechange = notify; }
    if (C.state !== 'running') C.resume().then(notify, () => {});
  } catch {}
}
function set(v) {
  on = !!v;
  try { localStorage.setItem('sound', on ? '1' : '0'); } catch {}
  if (on) unlock();
  if (M) M.gain.setTargetAtTime(on ? GAIN : 0, C.currentTime, .05);
  notify();
}

// voices. env: quick attack a, optional hold until h, exponential decay to silence at d.
// o = oscillator (pair when det, in cents) with optional glide f0 -> f1, lowpass lp -> lp1 (q), waveshaper drive sh; n = filtered noise.
// x.send feeds the reverb, x.pan places it.
const env = (g, t, a, d, v, h = a) => { g.setValueAtTime(.0001, t); g.linearRampToValueAtTime(v * V * LV, t + a); if (h > a) g.setValueAtTime(v * V * LV, t + h); g.exponentialRampToValueAtTime(.0001, t + d); };
function out(g, x) {
  let s = g;
  if (x.pan) { const p = C.createStereoPanner(); p.pan.value = x.pan; g.connect(p); s = p; }
  if (x.dry !== 0) s.connect(M); if (x.send) { const k = C.createGain(); k.gain.value = x.send; s.connect(k).connect(R); }
}
function chain(g, t, d, x) {
  let head = g;
  if (x.lp) { const f = C.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = x.q ?? 1; f.frequency.setValueAtTime(x.lp * P, t); f.frequency.exponentialRampToValueAtTime((x.lp1 || x.lp) * P, t + d); f.connect(head); head = f; }
  if (x.sh) { const w = C.createWaveShaper(), k = C.createGain(); w.curve = SHP; k.gain.value = x.sh; k.connect(w); w.connect(head); head = k; }
  return head;
}
function o(type, f0, f1, t, d, v, a = .006, x = {}) {
  const g = C.createGain(), head = chain(g, t, d, x);
  for (const c of x.det ? [-x.det, x.det] : [0]) {
    const s = C.createOscillator(); s.type = type; s.detune.value = c;
    s.frequency.setValueAtTime(f0 * P, t); s.frequency.exponentialRampToValueAtTime(f1 * P, t + d);
    s.connect(head); s.start(t); s.stop(t + d + .02);
  }
  env(g.gain, t, a, d, x.det ? v * .6 : v, x.h); out(g, x);
}
function n(type, f0, f1, t, d, v, a = .01, q = 1, x = {}) {
  const s = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain();
  s.buffer = NB; s.loop = true; f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0 * P, t); f.frequency.exponentialRampToValueAtTime(f1 * P, t + d);
  env(g.gain, t, a, d, v, x.h); s.connect(f).connect(g); out(g, x); s.start(t, Math.random()); s.stop(t + d + .02);
}
// glassy bell: a sine plus the inharmonic partials of a struck bar
const bell = (f, t, v, d = 1.8, x = {}) => { o('sine', f, f, t, d, v, .003, { send: .85, ...x }); o('sine', f * 2.76, f * 2.76, t, d * .5, v * .4, .003, { send: .6, ...x }); o('sine', f * 5.4, f * 5.4, t, d * .25, v * .18, .002, x); };

// the cues: a small print shop through a toy synth, loud enough to register on a phone
const K = {
  pop: (t) => { o('triangle', 380, 1100, t, .16, .7, .004, { sh: 1.5, send: .1 }); o('sine', 760, 2200, t, .1, .25); n('highpass', 3500, 3500, t, .05, .25, .002); },
  blip: (t) => { o('triangle', 700, 1000, t, .16, .55, .004, { send: .1 }); o('square', 1400, 2000, t, .09, .12, .004, { lp: 3500 }); },
  brake: (t) => {
    n('highpass', 3200, 1400, t, .55, .4, .06); n('bandpass', 1200, 600, t + .35, .2, .4, .004, 1.5);
    o('sawtooth', 300, 140, t + .35, .26, .5, .006, { lp: 1600, lp1: 600, sh: 2 });
  },
  door: (t) => {
    n('bandpass', 2200, 1500, t, .16, .45, .004, 2);
    o('triangle', 659, 659, t + .08, .18, .45, .005, { send: .2 }); o('triangle', 523, 523, t + .2, .28, .45, .005, { send: .2 }); o('sine', 1318, 1318, t + .08, .12, .12);
  },
  hop: (t) => { n('bandpass', 400, 2200, t, .3, .3, .12, 1.5); o('triangle', 320, 900, t, .26, .6, .03, { send: .2 }); o('square', 640, 1800, t, .2, .12, .03, { lp: 2500 }); },
  ring: (t) => {
    n('bandpass', 200, 2000, t, .9, .7, .6, 3, { send: .2 });
    o('sawtooth', 200, 560, t, .9, .35, .6, { det: 12, lp: 600, lp1: 2000, q: 3, send: .2 }); o('sine', 600, 1400, t, .9, .2, .6);
  },
  warp: (t) => { // the big hit: noise burst, a pitched body with strong 2nd-4th harmonics, a high crack, a long reverb tail
    n('lowpass', 9000, 500, t, 1.1, .9, .002, .7, { send: .7 }); n('bandpass', 1800, 300, t, .9, .6, .01, .8);
    o('sawtooth', 180, 90, t, .9, .6, .004, { det: 6, lp: 3000, lp1: 700, q: 2, sh: 2.5, send: .3 });
    [2, 3, 4].forEach((h, i) => o('sine', 180 * h, 90 * h, t, .8 - i * .1, .3 / (1 + i * .5), .004));
    n('highpass', 5000, 5000, t, .1, .7, .001);
    for (let i = 0; i < 9; i++) n('highpass', 5000, 5000, t + .12 + Math.random() * .4, .02, .25, .001);
    n('bandpass', 2500, 800, t, 1.2, .35, .002, .7, { send: 1.4 }); bell(587, t + .05, .5, 2.4, { send: 1 });
    o('sawtooth', 440, 330, t + .05, 2.2, .5, .02, { det: 10, lp: 2500, lp1: 600, send: 3.6, dry: 0 }); n('bandpass', 1500, 600, t, 2, .9, .01, .7, { send: 3.6, dry: 0 });
  },
  emerge: (t) => { n('bandpass', 300, 3200, t, .6, .5, .5, .8, { send: .3 }); bell(1175, t + .5, .35); bell(1480, t + .6, .25); },
  land: (t) => { o('triangle', 420, 200, t, .24, .8, .002, { sh: 2.5 }); n('lowpass', 2000, 600, t, .16, .6, .002); o('sawtooth', 300, 150, t, .2, .4, .003, { lp: 1600, lp1: 600 }); },
  wave: (t) => { o('triangle', 880, 880, t, .18, .5, .005, { send: .3 }); o('triangle', 1175, 1175, t + .12, .3, .5, .005, { send: .3 }); o('sine', 1760, 1760, t + .12, .2, .15); },
  lift: (t) => { n('bandpass', 2400, 700, t, .8, .55, .08, .7, { send: .2 }); n('highpass', 5000, 5000, t + .02, .3, .15, .02); o('triangle', 600, 1200, t, .6, .2, .1); },
  // homepage
  tick: (t) => o('triangle', 1900, 1500, t, .05, .3, .001),
  press: (t) => { o('triangle', 420, 200, t, .09, .6, .002, { sh: 2 }); o('triangle', 1700, 1200, t, .03, .12, .001); },
  page: (t) => { n('bandpass', 3200, 1100, t, .12, .5, .012, .8); n('bandpass', 2600, 900, t + .09, .16, .4, .01, .8); },
  build: (t) => { o('triangle', 900, 600, t, .05, .5, .001); o('triangle', 1000, 650, t + .13, .05, .5, .001); },
  snore: (t) => { o('sawtooth', 230, 190, t, 1.4, .2, .6, { det: 15, lp: 1500, lp1: 900, sh: 2 }); n('bandpass', 700, 1100, t, 1.4, .6, .7, 2); },
  step: (t) => { o('triangle', 420, 200, t, .09, .4, .002); n('bandpass', 1200, 900, t, .05, .2, .002); },
  chime: (t) => { bell(1319, t, .4, 1); bell(1760, t + .07, .3, 1); },
};
function play(name, op = {}) {
  if (!live() || !K[name]) return;
  P = op.p || 1; V = op.v ?? 1;
  try { K[name](C.currentTime + .02 + (op.delay || 0)); } catch {}
  P = V = 1;
}

// ---------- the intro score: the opening is driven by sound.score(t), called every frame with the timeline time ----------
// Notes whose time has passed within the last .25 s fire (enabling sound mid-intro joins in sync, never in a burst).
// D major / B minor, a toy synth through a riso press: detuned saw plucks, felt-piano triangles, an airy pad, glassy bells.
const pluck = (m, t, v = .3, d = .5, br = 1) => { const f = mf(m); o('sawtooth', f, f, t, d, v, .004, { det: 9, lp: 4200 * br, lp1: 700, q: 2, sh: 1.4, send: .25 }); o('triangle', f * 2, f * 2, t, d * .5, v * .35, .003); };
const piano = (m, t, v = .25, d = 2) => { const f = mf(m); o('triangle', f, f, t, d, v, .004, { send: .5 }); o('sine', f * 2, f * 2, t, d * .5, v * .4, .003, { send: .4 }); o('sine', f * 3, f * 3, t, d * .25, v * .15, .003); };
const bass = (m, t, v = .5) => { const f = mf(m); o('sawtooth', f, f, t, .55, v, .01, { det: 6, lp: 900, lp1: 500, q: 1.2, sh: 2 }); };
const shake = (t, v = .16) => { n('highpass', 7000, 7000, t, .07, v, .003); n('bandpass', 9000, 9000, t + .01, .05, v * .6, .003, 1); };
const pad = (ms, t, dur, a, v = .11, up = 2200) => ms.forEach((m, i) => { const f = mf(m); o('sawtooth', f, f, t, dur, v, a, { det: 7, lp: 500, lp1: up, q: .8, h: Math.max(a, dur * .55), send: .7, pan: (i % 2 ? 1 : -1) * (.2 + .15 * i) }); });
const EV = [], ev = (at, f, w = .25) => EV.push({ at, f, w, d: 0 });
const motif = (at, ms, v, br) => ms.forEach((m, i) => ev(at + i * .3, (t) => pluck(m, t, v, .5, br)));
// Pipo alone, the bus arriving, then boarding: a four-note motif every 1.2 s, soft shaker on the off-beats
for (let r = 0; r < 3; r++) motif(.15 + r * 1.2, [71, 74, 78, r === 2 ? 83 : 74], .34, 1);
for (let k = 0; k < 6; k++) ev(.45 + k * .6, (t) => shake(t));
[[2, 47], [2.6, 50], [3.2, 54], [3.8, 47]].forEach(([at, m]) => ev(at, (t) => bass(m, t)));
// the ring grows, departure: filtered noise riser, a string swell, a rising B minor arpeggio
ev(3.7, (t) => { n('bandpass', 500, 7000, t, .62, .55, .55, 4); o('sawtooth', 247, 262, t, .65, .3, .55, { det: 8, lp: 500, lp1: 4000, q: 2, send: .3 }); o('sawtooth', 370, 392, t, .65, .22, .55, { det: 8, lp: 500, lp1: 4000, q: 2, send: .3 }); }, .5);
[71, 74, 78, 83, 86, 90].forEach((m, i) => ev(3.7 + i * .1, (t) => pluck(m, t, .3, .3, 1.3)));
// inside space: a wide Bm add9 pad, slow filter, a few bells
ev(4.6, (t, late) => pad([59, 62, 66, 71, 73], t, 1.6 - late, late ? .1 : .6), 1);
[[4.75, 90], [5, 83], [5.2, 86], [5.35, 90]].forEach(([at, m], i) => ev(at, (t) => bell(mf(m), t, .32, 2, { pan: i % 2 ? .5 : -.5 })));
// back on paper: resolve to D major, the motif returns brighter, the last bar resolves into a soft chord on 7.3
ev(5.5, (t, late) => pad([62, 66, 69, 74, 78], t, 1.8 - late, late ? .1 : .35, .1, 3000), 1);
motif(5.6, [74, 78, 81, 78], .36, 1.6);
[[5.6, 50], [6.2, 45]].forEach(([at, m]) => ev(at, (t) => bass(m, t, .45)));
[5.9, 6.5, 7.1].forEach((at) => ev(at, (t) => shake(t, .14)));
ev(6.8, (t) => pluck(78, t, .34, .5, 1.6)); ev(7.05, (t) => pluck(81, t, .34, .5, 1.6));
ev(7.3, (t, late) => { [62, 66, 69, 74, 78, 86].forEach((m, i) => piano(m, t, .2 - i * .008, 2.4 - late)); pad([62, 69, 74], t, 2.2 - late, .1, .08, 2400); bass(50, t, .45); }, 1);
let lastT = 0;
function score(t) {
  if (!live()) return;
  if (t < lastT - .5) EV.forEach((e) => (e.d = 0)); // the timeline restarted
  lastT = t;
  for (const e of EV) if (!e.d && t >= e.at && t - e.at < e.w) { e.d = 1; try { e.f(C.currentTime + .02, t - e.at); } catch {} }
}

// loops: a node graph kept alive and steered with set(); built the moment sound is both on and running.
// set/end take an optional audio time so an offline render can schedule them.
const ease = (p, v, at = C.currentTime) => p.setTargetAtTime(v, at, .06);
const LP = {
  engine() { // a detuned saw pair, fundamental 90-180 Hz, lowpass 600-1800 Hz following speed; the highpass keeps it out of the bass, tyre noise rides on top
    const f = C.createBiquadFilter(), hp = C.createBiquadFilter(), g = C.createGain(), l = C.createOscillator(), lg = C.createGain(), ns = C.createBufferSource(), nb = C.createBiquadFilter(), ng = C.createGain();
    f.type = 'lowpass'; f.Q.value = 5; hp.type = 'highpass'; hp.frequency.value = 250; hp.Q.value = .9; g.gain.value = 0; lg.gain.value = 0; ng.gain.value = 0;
    const xs = [-9, 9].map((c) => { const x = C.createOscillator(); x.type = 'sawtooth'; x.detune.value = c; x.connect(f); x.start(); return x; });
    f.connect(hp).connect(g).connect(M); l.connect(lg).connect(g.gain); l.start();
    nb.type = 'bandpass'; nb.frequency.value = 900; nb.Q.value = .7; ns.buffer = NB; ns.loop = true; ns.connect(nb).connect(ng).connect(g); ns.start();
    return {
      set({ s = 0, g: m = 1 }, at) { const v = m * (.04 + .07 * s); xs.forEach((x) => ease(x.frequency, 92 + 86 * s, at)); ease(f.frequency, 600 + 1200 * s, at); ease(l.frequency, 9 + 9 * s, at); ease(g.gain, v, at); ease(lg.gain, v * .35, at); ease(ng.gain, .3 + .9 * s, at); },
      end(at = C.currentTime) { ease(g.gain, 0, at); ease(lg.gain, 0, at); [...xs, l, ns].forEach((x) => x.stop(at + .6)); },
    };
  },
  space() { // a pad in 200-1500 Hz with a slowly sweeping filter, and a little air
    const g = C.createGain(), f = C.createBiquadFilter(), ns = C.createBufferSource(), hp = C.createBiquadFilter(), ng = C.createGain(), l = C.createOscillator(), lg = C.createGain();
    g.gain.value = 0; g.connect(M); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 1.5; f.connect(g);
    l.frequency.value = .3; lg.gain.value = 500; l.connect(lg).connect(f.frequency); l.start();
    hp.type = 'highpass'; hp.frequency.value = 3500; ng.gain.value = .1; ns.buffer = NB; ns.loop = true; ns.connect(hp).connect(ng).connect(g); ns.start();
    const xs = [247, 370, 494, 587].flatMap((fr, i) => [-7, 7].map((c) => { const x = C.createOscillator(), q = C.createGain(); x.type = 'sawtooth'; x.frequency.value = fr; x.detune.value = c; q.gain.value = .2 / (1 + i * .3); x.connect(q).connect(f); x.start(); return x; }));
    return { set({ g: m = 1 }, at) { ease(g.gain, m * .55, at); }, end(at = C.currentTime) { ease(g.gain, 0, at); [ns, l, ...xs].forEach((x) => x.stop(at + .8)); } };
  },
};
function loop(name) {
  const h = { p: {}, n: null, dead: 0, t: 0,
    set(p) { Object.assign(h.p, p); if (h.n && C.currentTime - h.t > .04) { h.t = C.currentTime; h.n.set(h.p); } },
    stop() { h.dead = 1; subs.delete(h.up); try { h.n && h.n.end(); } catch {} h.n = null; } };
  h.up = () => { if (h.n || h.dead || !live()) return; try { h.n = LP[name](); h.n.set(h.p); } catch { h.dead = 1; } };
  subs.add(h.up); h.up(); return h;
}
// a skip must not leave a cue hanging: drop the master for a moment
function hush() { if (M) { M.gain.cancelScheduledValues(0); M.gain.setTargetAtTime(0, C.currentTime, .06); setTimeout(() => on && M.gain.setTargetAtTime(GAIN, C.currentTime, .05), 450); } }

// a toggle button: its text names the action (a changing name and aria-pressed together would contradict each other).
// Saved as on but the browser still wants a gesture: it reads "Tap for sound", and that tap unlocks instead of switching off.
function bind(el, off, onLabel) {
  const locked = () => on && !(C && C.state === 'running');
  const s = () => { el.textContent = on ? (locked() ? 'Tap for sound' : onLabel) : off; el.dataset.on = on; };
  el.addEventListener('click', () => { if (locked() || performance.now() - woke < 500) unlock(); else set(!on); }); subs.add(s); s();
  return () => subs.delete(s);
}

// Offline rendering for verification: build(api) schedules cues/score/loops at absolute times on an OfflineAudioContext.
export async function renderOffline(build, seconds, sr = 44100) {
  const keep = [C, M, R, NB, P, V], ctx = new OfflineAudioContext(2, Math.ceil(seconds * sr), sr);
  let task;
  try {
    init(ctx); M.gain.value = GAIN;
    build({ cue(name, t, op = {}) { P = op.p || 1; V = op.v ?? 1; try { K[name](t); } finally { P = V = 1; } },
      score() { EV.forEach((e) => e.f(e.at, 0)); },
      loop(name, pts, end) { const l = LP[name](); pts.forEach(([t, p]) => l.set(p, t)); l.end(end); },
      names: Object.keys(K) });
    task = ctx.startRendering();
  } finally { [C, M, R, NB, P, V] = keep; }
  return task;
}

export const sound = {
  get enabled() { return on; }, set, toggle: () => set(!on), unlock, play, loop, hush, bind, score,
  onChange(f) { subs.add(f); return () => subs.delete(f); },
};

if (on) { // saved as on: wake the audio on the first real gesture
  const g = () => { removeEventListener('pointerup', g, true); removeEventListener('keydown', g, true); if (on) { woke = performance.now(); unlock(); } };
  addEventListener('pointerup', g, true); addEventListener('keydown', g, true);
}
if (window.AudioContext || window.webkitAudioContext) document.querySelectorAll('.sound-toggle').forEach((el) => { el.hidden = false; bind(el, 'sound on', 'sound off'); });
