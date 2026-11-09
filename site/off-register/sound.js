// Synthesised sound for the whole site: Web Audio only, no files. Off until a visitor opts in, and the
// AudioContext is only created/resumed from a user gesture (the buttons below, or the first tap/key when the choice was saved as on).
let C, M, NB, P = 1, V = 1, on = false;
try { on = localStorage.getItem('sound') === '1'; } catch {}
const subs = new Set(), notify = () => subs.forEach((f) => f());
const live = () => !!(on && C && C.state === 'running');
const GAIN = 0.35;

function unlock() {
  try {
    if (!C) {
      C = new (window.AudioContext || window.webkitAudioContext)();
      M = C.createGain(); M.gain.value = on ? GAIN : 0;
      const z = C.createDynamicsCompressor(); z.threshold.value = -22; z.ratio.value = 4; z.attack.value = .005; z.release.value = .2;
      M.connect(z).connect(C.destination);
      NB = C.createBuffer(1, C.sampleRate, C.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      C.onstatechange = notify;
    }
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

// one oscillator voice (pitch glide f0 -> f1) and one filtered-noise voice; both: quick attack a, exponential decay to d
const env = (g, t, a, d, v) => { g.setValueAtTime(.0001, t); g.linearRampToValueAtTime(v * V, t + a); g.exponentialRampToValueAtTime(.0001, t + d); };
function o(type, f0, f1, t, d, v, a = .006) {
  const x = C.createOscillator(), g = C.createGain();
  x.type = type; x.frequency.setValueAtTime(f0 * P, t); x.frequency.exponentialRampToValueAtTime(f1 * P, t + d);
  env(g.gain, t, a, d, v); x.connect(g).connect(M); x.start(t); x.stop(t + d + .02);
}
function n(type, f0, f1, t, d, v, a = .01, q = 1) {
  const s = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain();
  s.buffer = NB; s.loop = true; f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0 * P, t); f.frequency.exponentialRampToValueAtTime(f1 * P, t + d);
  env(g.gain, t, a, d, v); s.connect(f).connect(g).connect(M); s.start(t, Math.random()); s.stop(t + d + .02);
}

// the cues: a small print shop, soft and warm
const K = {
  pop: (t) => { o('sine', 240, 620, t, .12, .55); n('highpass', 3500, 3500, t, .04, .1); },
  blip: (t) => o('triangle', 700, 1000, t, .1, .3),
  brake: (t) => { n('highpass', 3200, 1400, t, .4, .22, .05); o('sine', 80, 42, t + .3, .22, .6, .01); },
  door: (t) => { n('bandpass', 2200, 1500, t, .09, .25, .004, 2); o('triangle', 523, 523, t + .06, .1, .22); o('triangle', 392, 392, t + .16, .14, .22); },
  hop: (t) => { n('bandpass', 400, 2200, t, .28, .25, .12, 1.5); o('sine', 280, 620, t, .22, .2, .05); },
  ring: (t) => { n('lowpass', 90, 1100, t, 1, .45, .85, 2); o('sine', 55, 130, t, 1, .4, .8); },
  warp: (t) => {
    o('sine', 120, 38, t, .8, .7, .25); n('bandpass', 250, 4500, t, .7, .35, .5, .8);
    for (let i = 0; i < 9; i++) n('highpass', 5000, 5000, t + .15 + Math.random() * .4, .012, .3, .001);
  },
  emerge: (t) => { n('bandpass', 300, 3200, t, .55, .3, .5); o('sine', 1047, 1047, t + .55, .6, .22, .008); o('sine', 1568, 1568, t + .6, .5, .12, .008); },
  land: (t) => { o('sine', 130, 48, t, .2, .7); n('lowpass', 400, 150, t, .12, .35, .003); },
  wave: (t) => { o('sine', 880, 880, t, .09, .3); o('sine', 1175, 1175, t + .11, .14, .3); },
  lift: (t) => { n('bandpass', 2400, 700, t, .55, .38, .08, .7); n('highpass', 5000, 5000, t + .02, .2, .08, .02); },
  // homepage
  tick: (t) => o('triangle', 1900, 1500, t, .03, .14, .001),
  press: (t) => { o('sine', 240, 110, t, .07, .4, .002); o('triangle', 1700, 1200, t, .02, .1, .001); },
  page: (t) => { n('bandpass', 3200, 1100, t, .1, .3, .012, .8); n('bandpass', 2600, 900, t + .09, .14, .22, .01, .8); },
  build: (t) => { o('triangle', 900, 600, t, .035, .3, .001); o('triangle', 1000, 650, t + .13, .035, .3, .001); },
  snore: (t) => n('lowpass', 160, 380, t, 1.5, .4, .7, 1.5),
  step: (t) => { o('sine', 190, 90, t, .06, .25, .002); n('bandpass', 1200, 900, t, .03, .1, .002); },
  chime: (t) => { o('sine', 1319, 1319, t, .5, .22); o('sine', 1760, 1760, t + .07, .5, .16); },
};
function play(name, op = {}) {
  if (!live() || !K[name]) return;
  P = op.p || 1; V = op.v ?? 1;
  try { K[name](C.currentTime + .02 + (op.delay || 0)); } catch {}
  P = V = 1;
}

// loops: a node graph kept alive and steered with set(); built the moment sound is both on and running
const ease = (p, v) => p.setTargetAtTime(v, C.currentTime, .06);
const LP = {
  engine() {
    const x = C.createOscillator(), f = C.createBiquadFilter(), g = C.createGain(), l = C.createOscillator(), lg = C.createGain();
    x.type = 'sawtooth'; f.type = 'lowpass'; f.Q.value = 2; g.gain.value = 0;
    x.connect(f).connect(g).connect(M); l.connect(lg).connect(g.gain); x.start(); l.start();
    return {
      set({ s = 0, g: m = 1 }) { const v = m * (.05 + .17 * s); ease(x.frequency, 44 + 40 * s); ease(f.frequency, 200 + 650 * s); ease(l.frequency, 9 + 9 * s); ease(g.gain, v); ease(lg.gain, v * .4); },
      end() { ease(g.gain, 0); ease(lg.gain, 0); x.stop(C.currentTime + .6); l.stop(C.currentTime + .6); },
    };
  },
  space() {
    const g = C.createGain(), b = C.createBiquadFilter(), ns = C.createBufferSource(), ng = C.createGain(), l = C.createOscillator(), lg = C.createGain();
    g.gain.value = 0; g.connect(M); b.type = 'bandpass'; b.frequency.value = 900; b.Q.value = .6; ns.buffer = NB; ns.loop = true; ng.gain.value = .12;
    ns.connect(b).connect(ng).connect(g); l.frequency.value = .3; lg.gain.value = 400; l.connect(lg).connect(b.frequency);
    const xs = [110, 165.6, 221.5, 330.9].map((fr, i) => { const x = C.createOscillator(), q = C.createGain(); x.frequency.value = fr; q.gain.value = .5 / (i + 1); x.connect(q).connect(g); x.start(); return x; });
    ns.start(); l.start();
    return { set({ g: m = 1 }) { ease(g.gain, m * .18); }, end() { ease(g.gain, 0); [ns, l, ...xs].forEach((x) => x.stop(C.currentTime + .8)); } };
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

// a toggle button: its text names the action (a changing name and aria-pressed together would contradict each other)
function bind(el, off, onLabel) {
  const s = () => { el.textContent = on ? onLabel : off; el.dataset.on = on; };
  el.addEventListener('click', () => set(!on)); subs.add(s); s();
  return () => subs.delete(s);
}

export const sound = {
  get enabled() { return on; }, set, toggle: () => set(!on), unlock, play, loop, hush, bind,
  onChange(f) { subs.add(f); return () => subs.delete(f); },
};

if (on) { // saved as on: wake the audio on the first real gesture
  const g = () => { removeEventListener('pointerup', g, true); removeEventListener('keydown', g, true); if (on) unlock(); };
  addEventListener('pointerup', g, true); addEventListener('keydown', g, true);
}
if (window.AudioContext || window.webkitAudioContext) document.querySelectorAll('.sound-toggle').forEach((el) => { el.hidden = false; bind(el, 'sound on', 'sound off'); });
