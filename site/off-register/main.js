import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ---------- inks (raw sRGB; shaders write them unconverted, the canvas multiplies onto paper) ----------
const C = { pink: [255, 72, 176], blue: [0, 120, 191], yellow: [255, 232, 0], white: [255, 255, 255] };
const V = (c) => new THREE.Vector3(c[0] / 255, c[1] / 255, c[2] / 255);
const css = (c) => `rgb(${c})`;
const DEG = Math.PI / 180;
const ANG = { blue: 15 * DEG, pink: 75 * DEG, yellow: 0 }; // one screen angle per drum, like a real riso

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = Math.min(innerWidth, innerHeight) < 700;
const dpr = Math.min(devicePixelRatio, small ? 1.5 : 1.75);

// ---------- paper grain (generated once, tiled by CSS) ----------
{
  const g = document.createElement('canvas'); g.width = g.height = 180;
  const x = g.getContext('2d'), d = x.createImageData(180, 180);
  for (let i = 0; i < d.data.length; i += 4) { const v = 225 + Math.random() * 30; d.data[i] = v; d.data[i + 1] = v - 4; d.data[i + 2] = v - 10; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
  document.body.style.setProperty('--grain', `url(${g.toDataURL()})`);
}

// ---------- renderer ----------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(dpr);
renderer.setClearColor(0xffffff, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const CELL = (small ? 4.5 : 5.5) * dpr;

const vert = /* glsl */`
varying vec3 vN; varying vec2 vUv;
void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
const frag = /* glsl */`
uniform vec3 uTint, uInk, uL; uniform float uTintAmt, uCell, uAngle, uDark;
varying vec3 vN;
float dots(float k, float a){
  float c = cos(a), s = sin(a);
  vec2 p = mat2(c, -s, s, c) * gl_FragCoord.xy / uCell;
  float d = length(fract(p) - .5), r = sqrt(clamp(k, 0., 1.)) * .74;
  return (1. - smoothstep(r - .09, r + .03, d)) * step(.03, k);
}
void main(){
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  float diff = max(dot(n, normalize(uL)), 0.);
  float rim = pow(1. - abs(n.z), 3.);
  float k = clamp((1. - diff) * .8 + rim * .55 + uDark, 0., 1.);
  vec3 col = mix(vec3(1.), uTint, uTintAmt) * mix(vec3(1.), uInk, dots(k * k, uAngle));
  gl_FragColor = vec4(col, 1.);
}`;
const L = new THREE.Vector3(-0.5, 0.8, 0.9);
function ink(tint, amt, shade, extra = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, side: extra.side ?? THREE.FrontSide,
    uniforms: {
      uTint: { value: V(C[tint]) }, uTintAmt: { value: amt }, uInk: { value: V(C[shade]) },
      uAngle: { value: ANG[shade] }, uCell: { value: CELL }, uL: { value: L }, uDark: { value: extra.dark ?? 0 },
    },
  });
}

// type set as a real object in the scene so things can pass in front of and behind it
function typePlane(text, color, worldH) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const fs = 300; x.font = `900 ${fs}px "Big Shoulders Display"`;
  const w = Math.ceil(x.measureText(text).width) + 40;
  c.width = w; c.height = fs * 1.05;
  x.font = `900 ${fs}px "Big Shoulders Display"`; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  x.fillText(text, 20, fs * 0.86);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uMap: { value: tex }, uInk: { value: V(C[color]) } },
    vertexShader: vert,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uInk; varying vec2 vUv;
      void main(){ float a = texture2D(uMap, vUv).a; gl_FragColor = vec4(uInk, a * .94); }`,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(worldH * c.width / c.height, worldH), m);
}

// ---------- Pipo (original: a squat yellow body, a blue face screen, paper-white eyes knocked out of it) ----------
function makePipo() {
  const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.36, 1.16, 1.0, 5, 0.36), ink('yellow', 1, 'blue'));
  body.position.y = 1.0; rig.add(body);
  const face = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.62, 0.14, 4, 0.08), ink('blue', 1, 'blue', { dark: -.4 }));
  face.position.set(0, 1.06, 0.47); rig.add(face);
  const eyeG = new THREE.CapsuleGeometry(0.075, 0.13, 4, 10), eyeM = ink('white', 0, 'blue', { dark: -1 });
  const eyes = [-0.21, 0.21].map((x) => { const e = new THREE.Mesh(eyeG, eyeM); e.position.set(x, 1.08, 0.55); rig.add(e); return e; });
  const cheekM = ink('pink', 1, 'pink', { dark: -1 });
  [-0.5, 0.5].forEach((x) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), cheekM); c.position.set(x, 0.86, 0.47); c.scale.z = .4; rig.add(c); });
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), ink('blue', 1, 'blue'));
  stalk.position.y = 1.78; rig.add(stalk);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), ink('pink', 1, 'blue'));
  bulb.position.y = 2.02; rig.add(bulb);
  const limb = (r, h) => new THREE.CapsuleGeometry(r, h, 4, 10);
  const arms = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(0.72 * s, 1.12, 0);
    const a = new THREE.Mesh(limb(0.1, 0.3), ink('blue', .85, 'blue')); a.position.y = -0.24; p.add(a);
    p.rotation.z = 0.25 * s; rig.add(p); return p;
  });
  const legs = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(0.32 * s, 0.44, 0);
    const l = new THREE.Mesh(limb(0.13, 0.16), ink('pink', .9, 'blue')); l.position.y = -0.2; p.add(l);
    g.add(p); return p;
  });
  return { g, rig, eyes, arms, legs, bulb };
}

// ---------- Event Horizon: a planet, its ring, a moon on a dashed orbit ----------
function makePlanet() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), ink('pink', .5, 'blue')));
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.42, 2.05, 96), ink('yellow', 1, 'pink', { side: THREE.DoubleSide }));
  ring.rotation.set(-1.02, 0.3, 0.2); g.add(ring);
  const tilt = new THREE.Group(); tilt.rotation.set(0.35, 0, -0.3); g.add(tilt);
  const pts = new THREE.EllipseCurve(0, 0, 3.1, 3.1).getPoints(120).map((p) => new THREE.Vector3(p.x, 0, p.y));
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: new THREE.Color().setRGB(0, 120 / 255, 191 / 255, THREE.SRGBColorSpace), dashSize: .14, gapSize: .12 }));
  orbit.computeLineDistances(); tilt.add(orbit);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), ink('blue', .75, 'blue'));
  tilt.add(moon);
  return { g, moon };
}

// ---------- Campus Bus ----------
function makeBus() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(2.7, 1.1, 1.05, 4, 0.2), ink('yellow', 1, 'blue')));
  const winM = ink('blue', 1, 'blue', { dark: -.5 });
  for (let i = 0; i < 5; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 1.08), winM); w.position.set(-0.98 + i * 0.44, 0.16, 0); g.add(w); }
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.8), winM); shield.position.set(1.34, 0.14, 0); g.add(shield);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.12, 1.07), ink('pink', 1, 'pink', { dark: -1 })); stripe.position.y = -0.2; g.add(stripe);
  const wheelG = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 20), wheelM = ink('blue', 1, 'blue');
  const wheels = [];
  for (const x of [-0.82, 0.82]) for (const z of [-0.5, 0.5]) { const w = new THREE.Mesh(wheelG, wheelM); w.rotation.x = Math.PI / 2; w.position.set(x, -0.55, z); g.add(w); wheels.push(w); }
  return { g, wheels };
}

// ---------- Pipo's phone: the room he lives in ----------
function makePhone() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(3.4, 6.3, 0.3, 5, 0.42), ink('blue', .16, 'blue')));
  const sky = new THREE.ShaderMaterial({
    vertexShader: vert,
    uniforms: { uNight: { value: 0 }, uCell: { value: CELL }, uY: { value: V(C.yellow) }, uP: { value: V(C.pink) }, uB: { value: V(C.blue) } },
    fragmentShader: /* glsl */`
      uniform float uNight, uCell; uniform vec3 uY, uP, uB; varying vec2 vUv;
      float dots(float k, float a){ float c=cos(a), s=sin(a); vec2 p = mat2(c,-s,s,c)*gl_FragCoord.xy/uCell;
        float d = length(fract(p)-.5), r = sqrt(clamp(k,0.,1.))*.74; return (1.-smoothstep(r-.09, r+.03, d))*step(.03,k); }
      void main(){
        float day = 1. - uNight;
        vec3 c = mix(vec3(1.), uY, dots(day * (.35 + .5 * vUv.y), 0.));
        c *= mix(vec3(1.), uP, dots(.55 * sin(3.1416 * uNight) * (1. - vUv.y), 1.309));
        c *= mix(vec3(1.), uB, dots(uNight * (.22 + .4 * vUv.y), .2618));
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 5.7), sky); screen.position.z = 0.16; g.add(screen);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), ink('yellow', 1, 'pink', { dark: .25 })); sun.position.z = 0.18; g.add(sun);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.4), ink('pink', .55, 'pink')); floor.position.set(0, -2.6, 0.75); g.add(floor);
  // what he builds: a little house, brick by brick
  const house = new THREE.Group(); house.position.set(-0.85, -2.56, 0.9); g.add(house);
  const bricks = [];
  const bG = new RoundedBoxGeometry(0.34, 0.22, 0.32, 2, 0.04), bM = ink('pink', .8, 'blue');
  [[-0.18, 0.11], [0.18, 0.11], [-0.18, 0.34], [0.18, 0.34]].forEach(([x, y]) => { const b = new THREE.Mesh(bG, bM); b.position.set(x, y, 0); house.add(b); bricks.push(b); });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.36, 4), ink('yellow', 1, 'blue')); roof.rotation.y = Math.PI / 4; roof.position.y = 0.63; house.add(roof); bricks.push(roof);
  return { g, sky, sun, bricks };
}

const pipo = makePipo(), planet = makePlanet(), bus = makeBus(), phone = makePhone();
scene.add(pipo.g, planet.g, bus.g, phone.g);
let shipPlane, fastPlane;

// ---------- layout (desktop vs portrait) ----------
let W = innerWidth, H = innerHeight, portrait = W / H < 0.8;
const LAY = () => portrait ? {
  pipo: [0.75, -0.75, 1.5, .58], planet: [-0.75, 2.75, -2, .42], bus: [-0.95, -2.9, 0.6, .4],
  ship: [-0.3, 0.2, -2.5, 1.4], fast: [0.2, -2.0, 2.6, 1.1],
  phone: [0, 0.2, 0, .8], home: [0.45, -2.6, 0.95],
} : {
  pipo: [2.3, -0.9, 1.6, .95], planet: [0.2, 1.7, -2.4, .95], bus: [1.5, -3.05, 1.3, .7],
  ship: [3.0, 1.35, -3.4, 2.0], fast: [-0.9, -2.55, 2.9, 1.05],
  phone: [2.7, 0.05, 0, .96], home: [0.45, -2.6, 0.95],
};
let lay = LAY();

function resize() {
  W = innerWidth; H = innerHeight; portrait = W / H < 0.8; lay = LAY();
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  measure();
}

// ---------- scroll ----------
const hero = document.getElementById('hero'), pipoSec = document.getElementById('pipo'), rest = document.getElementById('rest');
let heroTop = 0, heroLen = 1, pipoTop = 0, pipoLen = 1, restTop = 0;
function measure() {
  heroTop = hero.offsetTop; heroLen = hero.offsetHeight - H;
  pipoTop = pipoSec.offsetTop; pipoLen = pipoSec.offsetHeight - H;
  restTop = rest.offsetTop;
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

const heroBack = document.querySelector('#hero .back'), heroFront = document.querySelector('#hero .front'), notes = document.querySelector('#hero .notes');
const pipoLayers = document.querySelectorAll('#pipo .layer');
const pinkPlate = document.querySelector('.plate-pink'), pipoWord = document.querySelector('.pipo-word');
const steps = [...document.querySelectorAll('.steps li')];
const bubble = document.querySelector('.bubble'), zz = document.querySelector('.zz');
const noteEls = [...document.querySelectorAll('.note')];
const leaders = document.getElementById('leaders');
leaders.innerHTML = noteEls.map(() => '<path/><circle r="3.5"/>').join('');
const lPaths = leaders.querySelectorAll('path'), lDots = leaders.querySelectorAll('circle');

// ---------- pointer ----------
const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX / W * 2 - 1; ptr.y = e.clientY / H * 2 - 1; }, { passive: true });

// ---------- state ----------
const tmp = new THREE.Vector3();
function toScreen(obj, oy = 0) {
  obj.getWorldPosition(tmp); tmp.y += oy; tmp.project(camera);
  return [(tmp.x * .5 + .5) * W, (-tmp.y * .5 + .5) * H];
}
let sp = 0, walkPhase = 0, lastX = 0, curStep = -1, running = false, visible = true;
const t0 = performance.now();

function frame(now) {
  running = false;
  if (!visible) return;
  const y = scrollY;
  if (y > restTop) { canvas.style.visibility = 'hidden'; leaders.style.visibility = 'hidden'; return; } // coda covers everything: stop drawing
  canvas.style.visibility = leaders.style.visibility = 'visible';

  const t = reduced ? 0 : (now - t0) / 1000;
  sp = reduced ? y : lerp(sp, y, 0.14);
  ptr.sx = lerp(ptr.sx, ptr.x, 0.06); ptr.sy = lerp(ptr.sy, ptr.y, 0.06);
  const hp = clamp((sp - heroTop) / heroLen), pp = clamp((sp - pipoTop) / pipoLen);
  const into = ss(0.6, 0.95, hp); // hero -> pipo hand-off

  // camera: slow dolly through the hero, pointer sway
  camera.position.set(ptr.sx * 0.35, -ptr.sy * 0.25, lerp(13, 10.5, ss(0, .6, hp)) + into * 1.2);
  camera.lookAt(0, 0, 0);

  // ----- hero objects pass between type layers -----
  const P = lay;
  const thru = ss(0, 0.6, hp);
  planet.g.position.set(P.planet[0] - thru * 2.6 - into * 4, P.planet[1] + thru * 0.4 + into * 4, lerp(P.planet[2], 3.6, thru));
  planet.g.scale.setScalar(P.planet[3]);
  planet.g.rotation.y = t * 0.15;
  planet.moon.position.set(Math.cos(t * 0.6) * 3.1, 0, Math.sin(t * 0.6) * 3.1);
  planet.g.visible = into < 0.999;

  const drive = ss(0.05, 0.75, hp);
  bus.g.position.set(P.bus[0] - drive * (portrait ? 5 : 11), P.bus[1] + Math.abs(Math.sin(t * 7)) * 0.03, lerp(P.bus[2], portrait ? 1 : 1.2, drive));
  bus.g.rotation.y = Math.PI + Math.sin(t * .7) * 0.04;
  bus.g.scale.setScalar(P.bus[3]);
  bus.wheels.forEach((w) => (w.rotation.y = -sp * 0.02));
  bus.g.visible = drive < 0.999 && into < 0.999;

  if (shipPlane) {
    shipPlane.position.set(P.ship[0] + ptr.sx * -0.2, P.ship[1] + hp * 1.5 + into * 6, P.ship[2]);
    fastPlane.position.set(P.fast[0] - hp * 1.5 + ptr.sx * 0.3, P.fast[1] - into * 6, P.fast[2]);
    shipPlane.visible = fastPlane.visible = into < 0.999;
  }

  // ----- pipo: hero spot -> his phone -----
  const ph = P.phone, ho = P.home;
  const rise = ss(0.4, 0.88, hp);
  phone.g.position.set(ph[0], lerp(-9, ph[1], rise), ph[2]);
  phone.g.scale.setScalar(ph[3]);
  phone.g.rotation.y = lerp(-0.5, -0.12 + ptr.sx * 0.06, rise) * (portrait ? 0.4 : 1);
  phone.g.visible = rise > 0.001;

  const step = pp * 7, k = Math.min(6, Math.floor(step)), f = step - k;
  // where he stands, in phone space
  let px = ho[0], face = 0, out = 0;
  if (k === 4) { out = ss(0.1, 0.9, f); px = lerp(ho[0], ho[0] + 4.4, out); face = Math.PI / 2 * ss(0, .2, f); }
  if (k === 5) { out = 1 - ss(0.1, 0.8, f); px = lerp(ho[0], ho[0] + 4.4, out); face = -Math.PI / 2 * (1 - ss(.7, 1, f)); }
  const homeW = new THREE.Vector3(px, ho[1], ho[2]).multiplyScalar(ph[3]).applyEuler(phone.g.rotation).add(phone.g.position);
  const heroPos = new THREE.Vector3(P.pipo[0] + Math.sin(t * .5) * .08, P.pipo[1], P.pipo[2]);
  pipo.g.position.lerpVectors(heroPos, homeW, into);
  pipo.g.scale.setScalar(lerp(P.pipo[3], ph[3] * 0.74, into));
  const lookX = into < 0.5 ? ptr.sx * 0.5 : 0;
  pipo.g.rotation.y = lerp(-0.35 + lookX, phone.g.rotation.y, into) + face;

  const dx = Math.abs(pipo.g.position.x - lastX); lastX = pipo.g.position.x;
  walkPhase += dx * 9 + (into > 0 && into < 1 ? 0.12 : 0);
  const walking = dx > 0.0005;
  pipo.legs[0].rotation.x = walking ? Math.sin(walkPhase) * 0.6 : 0;
  pipo.legs[1].rotation.x = walking ? -Math.sin(walkPhase) * 0.6 : 0;

  // nap / build / wave poses
  const nap = pp > 0 && k === 3 ? ss(0, .25, f) * (1 - ss(.85, 1, f)) : 0;
  const build = pp > 0 && k === 2 ? 1 : 0;
  const wave = pp > 0 && k >= 5 && !(k === 5 && f < .6) ? 1 : (into < 0.3 ? 0.35 : 0);
  pipo.rig.position.y = Math.sin(t * 2.2) * 0.04 * (1 - nap) - nap * 0.12 + (walking ? Math.abs(Math.sin(walkPhase)) * 0.06 : 0);
  pipo.rig.rotation.z = nap * 0.14 + Math.sin(t * 1.3) * 0.02;
  pipo.rig.rotation.x = nap * 0.12 - (k === 1 && pp > 0 ? 0.12 : 0);
  const blink = !reduced && (t % 3.4) < 0.12 ? 0.12 : 1;
  pipo.eyes.forEach((e) => (e.scale.y = Math.min(blink, lerp(1, 0.14, nap))));
  pipo.arms[1].rotation.z = 0.25 + wave * (1.9 + Math.sin(t * 9) * 0.35);
  pipo.arms[0].rotation.z = -0.25 - build * (0.9 + Math.abs(Math.sin(t * 8)) * 0.6);
  pipo.bulb.scale.setScalar(1 + (k === 6 ? Math.abs(Math.sin(t * 6)) * .5 : 0));

  // phone world: lights out, sun crosses, he builds
  const night = pp <= 0 ? 0 : k === 0 ? ss(.2, .9, f) : k <= 4 ? 0.55 + 0.45 * Math.cos(((step - 1) / 4) * Math.PI * 2) : 1 - ss(0, .7, f) * (k === 5 ? 1 : 1);
  phone.sky.uniforms.uNight.value = k >= 6 ? 0 : night;
  const sa = clamp((step - 1) / 4) * Math.PI;
  phone.sun.position.set(-Math.cos(sa) * 1.15, 0.2 + Math.sin(sa) * 2.2, 0.18);
  phone.sun.visible = step > 1 && step < 5;
  const built = clamp(step - 2) * phone.bricks.length;
  phone.bricks.forEach((b, i) => { const s = ss(i, i + 0.7, built); b.scale.setScalar(Math.max(s, 0.0001)); });

  renderer.render(scene, camera);

  // ----- DOM layers -----
  const heroOn = 1 - ss(0.82, 0.97, hp);
  heroBack.style.opacity = heroFront.style.opacity = heroOn;
  heroBack.style.transform = `translate3d(${ptr.sx * -10}px, ${-hp * 14}vh, 0)`;
  heroFront.style.transform = `translate3d(0, ${-hp * 42}vh, 0)`;
  pinkPlate.style.setProperty('--mx', `${0.028 * (1 - thru) + ptr.sx * 0.02}em`);
  pinkPlate.style.setProperty('--my', `${-0.018 * (1 - thru) + ptr.sy * 0.012}em`);
  const noteOn = (1 - ss(0.3, 0.5, hp)) * heroOn;
  notes.style.opacity = noteOn;
  const targets = { pipo: [pipo.bulb, 0.15], planet: [planet.g, 1.0 * P.planet[3]], bus: [bus.g, 0.6 * P.bus[3]] };
  noteEls.forEach((el, i) => {
    const [o, oy] = targets[el.dataset.for];
    const [ax, ay] = toScreen(o, oy);
    const left = el.dataset.for !== 'pipo' || portrait;
    const ew = el.offsetWidth, eh = el.offsetHeight, f = el.dataset.for;
    // portrait: planet note to its right, pipo note to his left, bus note above
    const nx = portrait ? clamp(f === 'planet' ? ax + 34 : f === 'pipo' ? ax - ew - 40 : ax - 20, 8, W - ew - 8) : left ? ax - ew - 70 : ax + 60;
    const ny = portrait ? (f === 'pipo' ? ay - 10 : f === 'planet' ? ay + 30 : ay - eh - 50) : ay - 64;
    el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
    const ex = nx + ew / 2 < ax ? nx + ew : nx + 12, ey = ny + eh;
    lPaths[i].setAttribute('d', `M${ex},${ey} Q${(ex + ax) / 2},${ey + 26} ${ax},${ay}`);
    lDots[i].setAttribute('cx', ax); lDots[i].setAttribute('cy', ay);
  });
  leaders.style.opacity = noteOn;

  const pipoOn = ss(0.86, 1, hp) * (1 - ss(0.985, 1, (sp - pipoTop) / (pipoLen + H * 0.6)));
  pipoLayers.forEach((l) => { l.style.opacity = pipoOn; l.style.visibility = pipoOn > 0.01 ? 'visible' : 'hidden'; });
  pipoWord.style.setProperty('--px', `${-pp * 18}vw`);
  const ks = pp > 0 ? k : 0;
  if (ks !== curStep) {
    curStep = ks;
    steps.forEach((li, i) => { li.classList.toggle('on', i === ks); li.classList.toggle('past', i < ks); });
  }
  const [hx, hy] = toScreen(pipo.bulb, 0.2);
  zz.style.opacity = nap > 0.5 ? 1 : 0;
  zz.style.transform = `translate3d(${hx + 20}px, ${hy - 10}px, 0)`;
  bubble.style.opacity = k === 6 && pp > 0 ? 1 : 0;
  bubble.style.transform = `translate3d(${clamp(hx - 40, 10, W - bubble.offsetWidth - 10)}px, ${hy - bubble.offsetHeight - 30}px, 0)`;

  if (!reduced || Math.abs(sp - y) > 0.5) loop();
}
function loop() { if (!running) { running = true; requestAnimationFrame(frame); } }

// reduced motion: draw on scroll/resize only
addEventListener('scroll', loop, { passive: true });
addEventListener('resize', () => { resize(); loop(); });
document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) loop(); });

// frame-time probe for measurement (median ms over the last 240 frames)
if (location.search.includes('probe')) {
  const ft = []; let lastT = 0;
  (function probe(n) { if (lastT) { ft.push(n - lastT); if (ft.length > 240) ft.shift(); } lastT = n; requestAnimationFrame(probe); })(0);
  window.__ft = () => { const s = [...ft].sort((a, b) => a - b); return s[s.length >> 1]; };
}

document.fonts.load('900 300px "Big Shoulders Display"').finally(() => {
  shipPlane = typePlane('ship small.', 'pink', lay.ship[3]);
  fastPlane = typePlane('learn fast.', 'yellow', lay.fast[3]);
  scene.add(shipPlane, fastPlane);
  loop();
});
resize();
loop();
