// Opening sequence: Pipo catches the Campus Bus, then the paper lifts into the homepage.
// Additive and self-contained: it never touches main.js or the homepage DOM, plays once per session,
// is skippable, and does not run at all for reduced-motion visitors. Sound is opt-in (sound.js).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sound } from './sound.js';

const html = document.documentElement;
if (html.classList.contains('intro-pending')) try { play(); } catch { document.querySelector('.intro')?.remove(); html.classList.remove('intro-on', 'intro-pending'); } // the head guard already decided: first visit this session, motion allowed

function play() {
  const small = Math.min(innerWidth, innerHeight) < 700;
  const dpr = Math.min(devicePixelRatio, 1.5);
  // renderer first: with no WebGL there is nothing to play, so leave the page exactly as if the intro never existed
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !small }); } catch {
    html.classList.remove('intro-pending'); document.querySelector('.pending-skip')?.remove(); return;
  }
  const root = document.createElement('div');
  root.className = 'intro'; root.setAttribute('role', 'region'); root.setAttribute('aria-label', 'Opening animation: Pipo catches the Campus Bus');
  root.innerHTML = `<p class="intro-route" aria-hidden="true"><span>Earth</span><i class="route-line"><em class="route-mid">Event Horizon</em><b class="route-dot"></b></i><span>back to Earth</span></p>
    <div class="intro-tools"><button class="intro-sound" type="button">Sound on</button><button class="intro-skip" type="button">Skip intro</button></div>`;
  root.prepend(canvas);
  document.body.prepend(root);
  document.querySelector('.pending-skip')?.remove();
  html.classList.remove('intro-pending');
  html.classList.add('intro-on');

  // ---------- inks + characters: same construction as the hero (main.js), so they are the same Pipo and the same bus ----------
  // ponytail: duplicated from main.js on purpose (the homepage code must stay untouched); extract a shared module if both ever change together.
  const C = { pink: [255, 72, 176], blue: [0, 120, 191], yellow: [255, 232, 0], white: [255, 255, 255] };
  const V = (c) => new THREE.Vector3(c[0] / 255, c[1] / 255, c[2] / 255);
  const DEG = Math.PI / 180, ANG = { blue: 15 * DEG, pink: 75 * DEG, yellow: 0 };
  const CELL = (small ? 4.5 : 5.5) * dpr;
  const vert = `varying vec3 vN; varying vec2 vUv;
    void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
  const dots = `float dots(float k, float a){ float c = cos(a), s = sin(a); vec2 p = mat2(c, -s, s, c) * gl_FragCoord.xy / uCell;
    float d = length(fract(p) - .5), r = sqrt(clamp(k, 0., 1.)) * .74; return (1. - smoothstep(r - .09, r + .03, d)) * step(.03, k); }`;
  const frag = `uniform vec3 uTint, uInk, uL; uniform float uTintAmt, uCell, uAngle, uDark; varying vec3 vN; ${dots}
    void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
      float diff = max(dot(n, normalize(uL)), 0.), rim = pow(1. - abs(n.z), 3.);
      float k = clamp((1. - diff) * .8 + rim * .55 + uDark, 0., 1.);
      gl_FragColor = vec4(mix(vec3(1.), uTint, uTintAmt) * mix(vec3(1.), uInk, dots(k * k, uAngle)), 1.); }`;
  const L = new THREE.Vector3(-0.5, 0.8, 0.9);
  const ink = (tint, amt, shade, x = {}) => new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, side: x.side ?? THREE.FrontSide,
    uniforms: { uTint: { value: V(C[tint]) }, uTintAmt: { value: amt }, uInk: { value: V(C[shade]) }, uAngle: { value: ANG[shade] }, uCell: { value: CELL }, uL: { value: L }, uDark: { value: x.dark ?? 0 } } });

  function makePipo() {
    const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.36, 1.16, 1.0, 5, 0.36), ink('yellow', 1, 'blue')); body.position.y = 1.0; rig.add(body);
    const face = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.62, 0.14, 4, 0.08), ink('blue', 1, 'blue', { dark: -.4 })); face.position.set(0, 1.06, 0.47); rig.add(face);
    const eyeG = new THREE.CapsuleGeometry(0.075, 0.13, 4, 10), eyeM = ink('white', 0, 'blue', { dark: -1 });
    const eyes = [-0.21, 0.21].map((x) => { const e = new THREE.Mesh(eyeG, eyeM); e.position.set(x, 1.08, 0.55); rig.add(e); return e; });
    const cheekM = ink('pink', 1, 'pink', { dark: -1 });
    [-0.5, 0.5].forEach((x) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), cheekM); c.position.set(x, 0.86, 0.47); c.scale.z = .4; rig.add(c); });
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), ink('blue', 1, 'blue')); stalk.position.y = 1.78; rig.add(stalk);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), ink('pink', 1, 'blue')); bulb.position.y = 2.02; rig.add(bulb);
    const limb = (r, h) => new THREE.CapsuleGeometry(r, h, 4, 10);
    const arms = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0.72 * s, 1.12, 0);
      const a = new THREE.Mesh(limb(0.1, 0.3), ink('blue', .85, 'blue')); a.position.y = -0.24; p.add(a); p.rotation.z = 0.25 * s; rig.add(p); return p; });
    const legs = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(0.32 * s, 0.44, 0);
      const l = new THREE.Mesh(limb(0.13, 0.16), ink('pink', .9, 'blue')); l.position.y = -0.2; p.add(l); rig.add(p); return p; });
    return { g, rig, eyes, arms, legs, bulb };
  }
  function makeBus() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); // body rides on the suspension; wheels stay on the road
    body.add(new THREE.Mesh(new RoundedBoxGeometry(2.7, 1.1, 1.05, 4, 0.2), ink('yellow', 1, 'blue')));
    const winM = ink('blue', 1, 'blue', { dark: -.5 });
    for (let i = 0; i < 5; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 1.08), winM); w.position.set(-0.98 + i * 0.44, 0.16, 0); body.add(w); }
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.8), winM); shield.position.set(1.34, 0.14, 0); body.add(shield);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.12, 1.07), ink('pink', 1, 'pink', { dark: -1 })); stripe.position.y = -0.2; body.add(stripe);
    const wheelG = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 20), wheelM = ink('blue', 1, 'blue'), wheels = [];
    for (const x of [-0.82, 0.82]) for (const z of [-0.5, 0.5]) { const w = new THREE.Mesh(wheelG, wheelM); w.rotation.x = Math.PI / 2; w.position.set(x, -0.55, z); g.add(w); wheels.push(w); }
    return { g, body, wheels };
  }
  // a halftone contact shadow: dots that thin out towards the edge
  const shadowMat = () => new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uCell: { value: CELL }, uInk: { value: V(C.blue) }, uK: { value: 0.5 } }, vertexShader: vert,
    fragmentShader: `uniform float uCell, uK; uniform vec3 uInk; varying vec2 vUv; ${dots}
      void main(){ float r = length(vUv - .5) * 2.; float k = uK * (1. - smoothstep(.35, 1., r)); if (k < .03) discard;
        gl_FragColor = vec4(uInk, dots(k, 0.2618)); }` });

  // ---------- stage: the scene renders off screen, then one pass composites it with the iris ----------
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0); // transparent black: the composite pass reads alpha as coverage
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  const pipo = makePipo(), bus = makeBus();
  const pShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat()), bShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat());
  [pShadow, bShadow].forEach((s) => { s.rotation.x = -Math.PI / 2; s.renderOrder = -1; });
  bShadow.material.uniforms.uK.value = 0.62;
  const world = new THREE.Group(); world.add(pShadow, bShadow, bus.g, pipo.g); scene.add(world);
  bus.g.rotation.y = Math.PI; // nose to the left, as in the hero
  const PS = 0.55, BS = 1.3, GROUND = -1.25;
  pipo.g.scale.setScalar(PS); bus.g.scale.setScalar(BS);

  // ---------- Event Horizon: one ring on the road, with a window of space in it ----------
  const ringFrag = `uniform float uT, uOn, uCell, uInner, uSpin; varying vec2 vUv; ${dots}
    void main(){
      vec2 p = vUv * 2. - 1.; float r = length(p), a = atan(p.y, p.x);
      float disc = smoothstep(uInner - .01, uInner + .07, r) * (1. - smoothstep(.72, 1., r));
      float swirl = .5 + .5 * sin(a * 3. - uT * 5. * uSpin + r * 16.);
      float streak = .5 + .5 * sin(a * 13. + uT * 9. * uSpin - r * 34.);
      float beam = 1. + .55 * cos(a - 2.3);                       // one side brighter: Doppler beaming
      float photon = exp(-pow((r - uInner) / .022, 2.)) * 1.6;      // the thin photon ring
      float halo = exp(-pow(max(r - .55, 0.) / .5, 2.)) * .18;
      float I = (disc * (.45 + .55 * swirl) * (.65 + .35 * streak) * beam + photon + halo) * uOn * (1. - smoothstep(.86, .99, r));
      I = mix(I, dots(clamp(I, 0., 1.), .2618) * 1.15, .4);       // halftoned, printed in the same inks
      vec3 col = mix(vec3(1., .28, .69), vec3(1., .91, 0.), swirl * .8 + photon * .4);
      col = mix(col, vec3(1., .98, .9), clamp(photon * .6, 0., 1.));
      gl_FragColor = vec4(col, clamp(I, 0., 1.6)); }`;
  const INNER = 0.74;
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uOn: { value: 0 }, uCell: { value: CELL }, uInner: { value: INNER }, uSpin: { value: 1 } },
    vertexShader: vert, fragmentShader: ringFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor })); // light adds to colour, never to coverage
  ring.renderOrder = 2; ring.visible = false; world.add(ring);

  // ---------- composite: paper outside the iris, space (riso stars) inside it, the ring printed on top ----------
  const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { tScene: { value: target.texture }, uRes: { value: new THREE.Vector2() }, uC: { value: new THREE.Vector2(.5, .5) },
      uIris: { value: 0 }, uEll: { value: 1 }, uEdge: { value: .002 }, uStar: { value: 0 }, uStreak: { value: 0 }, uFlash: { value: 0 }, uAsp: { value: 1 }, uT: { value: 0 }, uRip: { value: 0 }, uMis: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `uniform sampler2D tScene; uniform vec2 uRes, uC; uniform float uIris, uEll, uEdge, uStar, uStreak, uFlash, uAsp, uT, uRip, uMis; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec3 stars(vec2 px, float sz, float seed){
        vec2 q = px / sz, cell = floor(q), f = fract(q) - .5; f.x /= 1. + uStreak;
        float hh = h(cell + seed), star = step(.9, hh) * (1. - smoothstep(.07, .13, length(f - (vec2(h(cell + 1.3), h(cell + 7.1)) - .5) * .6)));
        vec3 sc = hh > .97 ? vec3(1., .28, .69) : hh > .94 ? vec3(1., .91, 0.) : vec3(.8, .88, 1.);
        return sc * star * (.65 + .35 * sin(uT * 3. + hh * 40.)); }
      vec3 comp(vec2 uv){
        vec2 q = uv - uC, d = q; d.x *= uAsp / uEll; float L = length(d);
        if (uRip > 0.) {   // the crossing: a shockwave rolls out from the iris edge, and the edge itself shudders
          float rr = L - uIris - uRip * .5, w = sin(rr * 60.) * exp(-rr * rr / .015) * (1. - uRip);
          uv += normalize(q + 1e-5) * w * .012;
          L += w * .02 + .01 * sin(atan(d.y, d.x) * 9. + uRip * 14.) * (1. - uRip);
        }
        float ins = uIris > .001 ? 1. - smoothstep(uIris - uEdge, uIris + uEdge, L) : 0.;   // the iris: inside is space, outside is paper
        vec4 s = texture2D(tScene, uv);
        vec3 bg = mix(vec3(.957, .933, .882), vec3(.035, .055, .2), ins);
        vec2 px = uv * uRes;
        bg += (stars(px - vec2(uStar * .6, 0.), 26., 0.) + stars(px - vec2(uStar * 1.5, 17.), 44., 9.3)) * ins;   // two layers, sliding sideways as the bus moves
        float a = clamp(s.a, 0., 1.);
        vec3 L3 = s.rgb * (1. - a); float m = max(L3.r, max(L3.g, L3.b));
        vec3 ink = mix(vec3(1., .28, .69), vec3(0., .47, .75), smoothstep(.5, 1., L3.g / max(m, .001)));
        vec3 lit = bg + L3;                                                  // in space the ring is light
        vec3 inked = bg * mix(vec3(1.), ink, clamp(m, 0., 1.));             // on paper it is pink and blue ink
        return mix(inked, lit, ins) * (1. - a) + s.rgb * a;
      }
      void main(){
        vec3 col = comp(vUv);
        if (uMis > 0.) { vec3 c2 = comp(vUv + vec2(uMis, -uMis * .35) / uRes); col.g = c2.g; col.b = mix(col.b, c2.b, .5); }   // the pink plate slips (pink absorbs green)
        col += vec3(1., .96, .82) * uFlash;
        gl_FragColor = vec4(col, 1.); }` }));
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  post.frustumCulled = false; postScene.add(post);
  const PU = post.material.uniforms;

  // ---------- print-language VFX: halftone dust at the tyres and heels, misregistered speed lines ----------
  const puffGeo = new THREE.PlaneGeometry(1, 1);
  const puffMat = () => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexShader: vert,
    uniforms: { uCell: { value: CELL * .7 }, uInk: { value: V(C.blue) }, uP: { value: 0 } },
    fragmentShader: `uniform float uCell, uP; uniform vec3 uInk; varying vec2 vUv; ${dots}
      void main(){ vec2 q = vUv - .5; float a = atan(q.y, q.x), r = length(q) * 2. * (1. + .18 * sin(a * 3. + uP * 2.) + .1 * sin(a * 7.));   // lumpy edge
        float k = (1. - smoothstep(.1, 1., r)) * (1. - uP * uP) * .46;   // never fills a cell: reads as sparse ink dots thinning to nothing
        if (k < .04) discard; gl_FragColor = vec4(uInk, dots(k, .2618)); }` });
  const puffs = [];
  const mkPuff = (ts, on, w, dx, s, life = .7) => { const m = new THREE.Mesh(puffGeo, puffMat()); m.visible = false; m.renderOrder = 1; world.add(m); puffs.push({ m, ts, on, w, dx, s, life, x: null }); };
  for (let i = 0; i < 5; i++) mkPuff(1.95 + i * .12, 'bus', i % 2 ? 1 : -1, -.9, 1.1);  // braking into the stop: the tyres kick ink-dust ahead
  for (let i = 0; i < 4; i++) mkPuff(6.9 + i * .09, 'bus', 1, 1., 1.1);               // pulling away: dust left at the tail
  mkPuff(6.76, 'pipo', -1, -.5, .5, .6); mkPuff(6.76, 'pipo', 1, .5, .5, .6);        // Pipo's landing
  const lineMat = (c) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexShader: vert, uniforms: { uC: { value: V(C[c]) }, uA: { value: 0 } },
    fragmentShader: `uniform vec3 uC; uniform float uA; varying vec2 vUv; void main(){ gl_FragColor = vec4(uC, uA * (1. - smoothstep(.5, 1., vUv.x))); }` });
  const lmP = lineMat('pink'), lmB = lineMat('blue');
  const streaks = [[-.3, 1.9], [.12, 1.2], [.42, 1.6]].map(([y, len]) => [y, len, new THREE.Mesh(puffGeo, lmB), new THREE.Mesh(puffGeo, lmP)]);
  streaks.forEach((l) => { l[2].visible = l[3].visible = false; world.add(l[2], l[3]); });

  let W, H, k = 1, wx = 6, narrow = false;
  const base = new THREE.Vector3(), baseLook = new THREE.Vector3(), baseOff = new THREE.Vector3(), closeOff = new THREE.Vector3();
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false); target.setSize(Math.round(W * dpr), Math.round(H * dpr));
    camera.aspect = W / H; camera.updateProjectionMatrix();
    narrow = camera.aspect < 1;
    base.set(narrow ? -1.6 : -3.4, 2.6, 15); baseLook.set(narrow ? 0 : -0.3, -0.55, 0); // three-quarter view: the bus has a nose and a depth
    wx = Math.tan(15 * DEG) * 15 * camera.aspect; // half the visible width at z=0
    k = narrow ? wx / 3.3 : Math.min(1, wx / 5.6); world.scale.setScalar(k);
    baseOff.subVectors(base, baseLook); closeOff.set(-5.0 * k, 1.1 * k, 9.0 * k);
    PU.uRes.value.set(W * dpr, H * dpr); PU.uAsp.value = W / H; PU.uEdge.value = 1.5 / H;
  }
  resize(); addEventListener('resize', resize);

  // ---------- the route strip under the scene ----------
  const dot = root.querySelector('.route-dot');

  // ---------- timeline ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const io = (x) => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;   // drive
  const out = (x) => 1 - (1 - x) ** 3;                                 // brake into a stop
  const inn = (x) => x * x * x;                                         // pull away
  const smoothstep01 = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const bell = (t, a, b) => Math.sin(seg(t, a, b) * Math.PI);
  const SEAT = GROUND + 0.42;   // low enough that all of Pipo, antenna included, rides inside the bus
  const DOOR = 0.95 * BS;       // front door, measured from the bus centre towards its nose
  const NOSE = 1.38 * BS;
  const END = 7.5, SPEED = 1.15;
  const fired = {}, eng = sound.loop('engine'); let spaceL = null;
  // the drive: leave the stop, cross Event Horizon's ring, come out the other side and stop at the drop-off
  const DRIVE = [3.75, 6.25], RING_ON = 3.7;
  let busX = 99, lastBusX = 99, lastS = 0, lastT = 0, spd = 0, busV = 0, spring = 0, springV = 0, done = false, t0 = null, skipAt = null;
  const rw = new THREE.Vector3(), pr = new THREE.Vector3(), pe = new THREE.Vector3(), focus = new THREE.Vector3();

  function hopArc(p, a, b, h) { return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p + Math.sin(p * Math.PI) * h, a[2] + (b[2] - a[2]) * p]; }

  function frame(now) {
    if (done) return;
    if (t0 === null) t0 = now; // the clock starts on the first painted frame, not when the script loaded
    try { draw((now - t0) / 1000 * SPEED); } catch { finish(true); return; }
    requestAnimationFrame(frame);
  }
  function draw(t) {
    const STOP = narrow ? 0.85 : 1.9, DROP = narrow ? -0.55 : -2.0, WAIT = STOP - DOOR, LAND = DROP - DOOR - (narrow ? 0.35 : 1.5);
    // geometry of the drive, in the bus's own frame (u): the ring sits G ahead of the nose; the bus ends 0.9 clear of it
    const G = narrow ? 0.55 : 1.3, D = 2 * NOSE + G + 0.9, XR = STOP - NOSE - G, S1 = DROP - (XR - NOSE - 0.9);
    const tauAt = (p) => p <= .5 ? Math.sqrt(p / 2) : 1 - Math.sqrt((1 - p) / 2);   // inverse of io
    const tauC = tauAt(G / D), tauL = tauAt((G + 2 * NOSE) / D);
    const tc = DRIVE[0] + (DRIVE[1] - DRIVE[0]) * tauC, tcl = DRIVE[0] + (DRIVE[1] - DRIVE[0]) * tauL; // nose crosses the ring; tail clears it
    const tShift = (tc + .5 + tcl - .1) / 2; // the screen is all space here: the scene is re-based so the bus ends at the drop-off
    const OFF = wx / k + 3; // fully off stage, whatever the screen width
    const cue = (at, name, op) => { if (t >= at && !fired[name + at]) { fired[name + at] = 1; if (t - at < .5 && skipAt === null) sound.play(name, op); } };

    let u;
    if (t < 1.0) u = OFF;
    else if (t < 2.5) u = STOP + (OFF - STOP) * (1 - out(seg(t, 1.0, 2.5)));
    else if (t < DRIVE[0]) u = STOP;
    else if (t < DRIVE[1]) { const tau = seg(t, ...DRIVE); u = STOP - D * io(tau - 0.04 * bell(tau, tauC - .1, tauC + .1)); } // fast approach, a dip as the nose goes in
    else u = XR - NOSE - 0.9;
    const S = t > tShift ? S1 : 0;
    busX = t > 6.85 ? DROP - 9 * inn(seg(t, 6.85, 7.6)) : u + S;
    const v = lastBusX === 99 ? 0 : busX - lastBusX - (S - lastS); lastBusX = busX; lastS = S;
    spd = Math.abs(v) / Math.max(t - lastT, 1e-3); lastT = t;
    const acc = v - busV; busV = v;
    // suspension: braking dips the nose, pulling away lifts it; a damped spring settles it
    springV += (-acc * 10 - spring) * 0.18; springV *= 0.82; spring += springV;
    bus.body.rotation.z = clamp(spring, -0.09, 0.09);
    bus.body.position.y = Math.abs(Math.sin(t * 17)) * 0.012 * (Math.abs(v) > 0.002 ? 1 : 0) - landBump(t) * 0.05;
    bus.wheels.forEach((w) => (w.rotation.y += v / 0.25));
    bus.g.position.set(busX, GROUND + 0.8 * BS, 0);
    bShadow.position.set(busX, GROUND + 0.01, 0.05); bShadow.scale.set(2.7 * BS * 1.12, 1.3 * BS, 1);

    // the ring grows in before the bus gets there, and closes once it is through
    const grow = out(seg(t, RING_ON, RING_ON + .4)) * (1 - io(seg(t, tcl + .35, tcl + .85)));
    const RING = narrow ? 3.1 : 2.4, PSI = narrow ? .7 : .9, Rc = RING * grow;
    ring.visible = grow > 0.01; ring.material.uniforms.uOn.value = clamp(grow * 3); ring.material.uniforms.uT.value = t;
    ring.position.set(XR + S, GROUND + 0.9, 0); ring.scale.setScalar(Math.max(Rc, 1e-3)); ring.rotation.set(0, -PSI, 0); // turned so the camera, off to the left, sees it nearly face on
    // iris: opens as a window in the ring, floods the screen as the nose goes in, shuts back onto the ring once the tail is out
    const e1 = io(seg(t, tc - .15, tc + .5)), e2 = 1 - io(seg(t, tcl - .1, tcl + .55)), e = e1 * e2;
    pShadow.material.uniforms.uK.value = 0.5 * (1 - e); bShadow.material.uniforms.uK.value = 0.62 * (1 - e);

    // camera: eases onto the ring (the bus drives across the frame), phones zoom less; then back out to the paper
    const rel = 1 - io(seg(t, tcl + .25, tcl + .8));
    const track = io(seg(t, 3.9, 4.6)) * rel, zoom = (narrow ? 0.45 : 1) * io(seg(t, 4.0, 4.7)) * rel;
    world.updateMatrixWorld(); ring.getWorldPosition(rw);
    focus.lerpVectors(baseLook, rw, track);
    camera.position.lerpVectors(baseOff, closeOff, zoom).add(focus); camera.lookAt(focus);
    camera.updateMatrixWorld();

    // pipo
    const r = pipo.rig; let pos = [WAIT, GROUND, 1.25], turn = 0, tilt = 0, squash = 1, wave = 0, inside = false;
    const appear = out(seg(t, 0, 0.45)); // pops up out of the paper
    if (t > 0.55 && t < 2.45) { turn = 0.75 * out(seg(t, 0.55, 0.85)); tilt = 0.14 * out(seg(t, 0.6, 0.95)); }          // hears it coming, head tilt
    if (t >= 2.45 && t < 2.95) { turn = 0.75 * (1 - out(seg(t, 2.45, 2.7))); pos[1] += bell(t, 2.55, 2.85) * 0.22; } // "that's mine": a little bounce
    if (t >= 2.95 && t < 3.1) squash = 1 - 0.18 * bell(t, 2.95, 3.1);                                                     // anticipation
    if (t >= 3.1 && t < 3.55) { pos = hopArc(out(seg(t, 3.1, 3.55)), [WAIT, GROUND, 1.25], [STOP - DOOR + 0.25, SEAT, 0], 0.45); squash = 1.08; }
    if (t >= 3.55 && t < 6.3) { inside = true; pos = [busX - DOOR + 0.25, SEAT + bus.body.position.y, 0]; }
    if (t >= 6.3 && t < 6.75) { pos = hopArc(out(seg(t, 6.3, 6.75)), [DROP - DOOR + 0.25, SEAT, 0], [LAND, GROUND, 1.3], 0.8); squash = t < 6.4 ? 1.12 : 1; }
    // lands, watches the bus pull away behind him, then turns round and waves at you
    if (t >= 6.75) { pos = [LAND, GROUND, 1.3]; squash = t < 6.9 ? 1 - 0.16 * bell(t, 6.75, 6.9) : 1; turn = -0.8 * out(seg(t, 6.8, 7.0)) * (1 - out(seg(t, 7.1, 7.35))); wave = seg(t, 7.2, 7.4); }
    // fully inside the bus for the ride: nothing pokes through the roof; he vanishes as he passes the side wall
    pipo.g.visible = !inside && !(t >= 3.1 && t < 3.55 && pos[2] < 0.75);
    pipo.g.position.set(pos[0], pos[1] - (1 - appear) * 0.6, pos[2]);
    pipo.g.rotation.y = -0.18 + turn;
    r.scale.set(appear / Math.sqrt(squash), appear * squash, appear / Math.sqrt(squash));
    r.rotation.z = tilt + Math.sin(t * 1.4) * 0.02;
    r.position.y = Math.sin(t * 2.2) * 0.03;
    pipo.arms[1].rotation.z = 0.25 + wave * (1.9 + Math.sin(t * 9) * 0.35);
    // the antenna bulb lights up: when he hears the bus, and as he lands
    pipo.bulb.scale.setScalar(1 + 0.6 * (bell(t, 0.5, 0.8) + bell(t, 6.5, 6.9)) + wave * Math.abs(Math.sin(t * 6)) * 0.4);
    const blink = (t % 2.9) < 0.11 ? 0.12 : 1; pipo.eyes.forEach((q) => (q.scale.y = blink));
    const air = Math.max(0, pos[1] - GROUND);
    pShadow.visible = !inside; pShadow.position.set(pos[0], GROUND + 0.012, pos[2]); pShadow.scale.setScalar(PS * 1.6 / (1 + air * 0.9));

    // dust: halftone puffs at the tyres (braking, pulling away) and Pipo's heels, riso blue
    for (const q of puffs) {
      const p = (t - q.ts) / q.life, vis = p >= 0 && p < 1; q.m.visible = vis;
      if (!vis) continue;
      if (q.x === null) q.x = q.on === 'bus' ? busX + q.w * .82 * BS : pipo.g.position.x + q.w * .3;
      const e = out(p), sz = q.s * (.6 + 1.1 * e);
      q.m.position.set(q.x + q.dx * e, GROUND + .08 + sz * .3 + e * .3, q.on === 'bus' ? 1.1 * BS : 1.45); q.m.scale.setScalar(sz);
      q.m.material.uniforms.uP.value = p;
    }
    // speed lines: pink and blue plates a hair out of register, trailing the tail while the bus accelerates at the ring
    const sl = t >= DRIVE[0] ? clamp((spd - .4) / 2.2) * (1 - seg(t, tc + .05, tc + .25)) : 0, tail = busX + 1.38 * BS + .1;
    lmP.uniforms.uA.value = lmB.uniforms.uA.value = sl * .9;
    streaks.forEach(([y, len, mb, mp], i) => {
      const vis = sl > .02, L2 = len * sl * (.8 + .2 * Math.sin(t * 40 + i * 2));
      mb.visible = mp.visible = vis; if (!vis) return;
      mb.position.set(tail + L2 / 2, GROUND + .8 * BS + y * BS, .2); mb.scale.set(L2, .04, 1);
      mp.position.set(tail + .15 + L2 * .4, GROUND + .8 * BS + y * BS + .04, .2); mp.scale.set(L2 * .8, .04, 1);
    });

    // sound, on the same beats
    cue(.05, 'pop'); cue(.55, 'blip'); cue(2.45, 'blip', { p: 1.3 }); cue(2.05, 'brake');
    cue(2.85, 'door'); cue(3.1, 'hop'); cue(3.55, 'land', { v: .5 }); cue(RING_ON, 'ring'); cue(tc - .15, 'warp'); cue(tcl - .05, 'emerge');
    cue(6.25, 'door'); cue(6.3, 'hop', { p: 1.15 }); cue(6.75, 'land'); cue(7.25, 'wave');
    eng.set({ s: clamp(spd / 5), g: seg(t, .9, 1.8) * (1 - seg(t, 6.9, 7.6)) * (1 - .6 * e) });
    if (!spaceL && skipAt === null && t > tc - .2 && t < tcl + .8) spaceL = sound.loop('space');
    if (spaceL) { spaceL.set({ g: e }); if (t > tcl + .8 || skipAt !== null) { spaceL.stop(); spaceL = null; } }

    // route progress: Earth, out to Event Horizon, back to Earth
    dot.style.setProperty('--p', (0.5 * io(seg(t, tc - .5, tc + .5)) + 0.5 * io(seg(t, tcl - .3, tcl + .5))).toFixed(3));
    root.classList.toggle('in-space', e > 0.5);

    // iris geometry from the ring as the camera sees it: centre, rim height and rim width (the ring is an ellipse)
    const rim = INNER * Rc * k, asp = PU.uAsp.value;
    pr.copy(rw).project(camera);
    pe.copy(rw); pe.y += rim; pe.project(camera); const ry = (pe.y - pr.y) * .5;
    pe.copy(rw); pe.x += Math.cos(PSI) * rim; pe.z += Math.sin(PSI) * rim; pe.project(camera);
    const rx = Math.hypot((pe.x - pr.x) * .5 * asp, (pe.y - pr.y) * .5), ell = clamp(rx / Math.max(ry, 1e-4), .3, 1.6);
    const cx = pr.x * .5 + .5, cy = pr.y * .5 + .5, cover = Math.hypot(Math.max(cx, 1 - cx) * asp, Math.max(cy, 1 - cy)) + .05;
    PU.uC.value.set(cx, cy);
    PU.uIris.value = ring.visible ? ry * smoothstep01(grow / .35) + (cover - ry) * e : 0; // the window closes a little ahead of the ring, so no dark dot is left behind
    PU.uEll.value = ell + (1 - ell) * e;
    PU.uStar.value = (STOP - u) * 40 * dpr; PU.uStreak.value = clamp(spd / 4) * (e > 0 ? 1 : 0);
    PU.uFlash.value = Math.exp(-(((t - tc) / .1) ** 2)) * 0.14; PU.uT.value = t;
    const rp = seg(t, tc - .05, tc + .4); PU.uRip.value = rp < 1 ? rp : 0;                                   // shockwave, ~.4 s
    PU.uMis.value = Math.max(bell(t, tc - .02, tc + .3), .5 * bell(t, tcl - .1, tcl + .15)) * 4 * dpr;      // the print slips, a few px

    renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);

    if (skipAt === null && t > END) finish(false);
  }
  function landBump(t) { return bell(t, 3.55, 3.75) + bell(t, 6.3, 6.45) * 0.6; }

  // ---------- hand-off: the paper sheet lifts and the homepage is just there ----------
  function finish(skipped) {
    if (skipAt !== null) return;
    skipAt = performance.now();
    root.classList.add(skipped ? 'leave-fast' : 'leave');
    eng.stop(); spaceL?.stop(); unbind();
    if (skipped) sound.hush(); else sound.play('lift');
    html.classList.remove('intro-on');
    setTimeout(() => { done = true; target.dispose(); renderer.dispose(); renderer.forceContextLoss(); root.remove(); }, skipped ? 320 : 900);
    removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onHide); removeEventListener('keydown', onKey); removeEventListener('wheel', onSkip); removeEventListener('touchmove', onSkip);
  }
  const onSkip = () => finish(true), onHide = () => { if (document.hidden) finish(true); };
  const onKey = (e) => { if (!['Tab', 'Shift'].includes(e.key) && !e.target.closest?.('.intro-sound')) finish(true); }; // Enter/Space on Sound must not skip
  root.querySelector('.intro-skip').addEventListener('click', onSkip);
  const unbind = sound.bind(root.querySelector('.intro-sound'), 'Sound on', 'Sound off');
  addEventListener('keydown', onKey); addEventListener('wheel', onSkip, { passive: true }); addEventListener('touchmove', onSkip, { passive: true });
  canvas.addEventListener('webglcontextlost', () => finish(true));
  document.addEventListener('visibilitychange', onHide);
  requestAnimationFrame(frame);
}
