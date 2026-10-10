// Hero centerpiece, "Neural Singularity": a liquid-metal core inside a cut-glass shell,
// wrapped in twisted dipole field lines, three instrument orbits and a thin Keplerian disk.
// Loaded lazily from main.js; all motion runs on the GPU or in one rAF loop, no per-frame allocation.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PAL = {
  dark: { a: "#8095ff", v: "#8b5cf6", t: "#2dd4bf", hot: "#eef1ff", core: "#7d8ad6", glass: "#5d6ab8" },
  light: { a: "#2348d8", v: "#7c3aed", t: "#0d9488", hot: "#1a2a8a", core: "#8f9bd6", glass: "#9aa8f0" },
};

const RINGS = [
  { R: 1.62, tube: 0.005, rot: [1.15, 0.2, 0.35], prec: 0.05, bead: 0.55, c: "a", op: 0.5 },
  { R: 1.98, tube: 0.0035, arc: 1.72 * Math.PI, rot: [-0.55, 0.5, 1.1], prec: -0.035, bead: -0.32, c: "v", op: 0.55 },
  { R: 2.3, ticks: 72, rot: [1.42, -0.3, -0.6], prec: 0.02, bead: 0.18, c: "t", op: 0.6 },
];

const DITHER = "float dither(){ return (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.; }";

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - (1 - x) ** 4);
const seg = (T, start, dur) => ease((T - start) / dur);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export function start(canvas, still) {
  const small = innerWidth < 640;
  const low = small || innerWidth < 1024 || (navigator.hardwareConcurrency || 8) <= 4;
  const Q = small
    ? { dpr: 1.5, seg: 64, fils: 4, parts: 70, tube: 64 }
    : low
      ? { dpr: 1.75, seg: 96, fils: 6, parts: 140, tube: 96 }
      : { dpr: 2, seg: 160, fils: 8, parts: 240, tube: 160 };

  // Throws without WebGL; main.js catches it and shows the CSS fallback.
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q.dpr));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose?.();
  pmrem.dispose();
  scene.environment = env;

  const time = { value: 0 };
  const tinted = []; // [THREE.Color, palette key] pairs, re-coloured on theme change
  const glows = []; // materials that are additive in dark mode, normal in light mode
  const tint = (key) => { const c = new THREE.Color(); tinted.push([c, key]); return c; };
  const glow = (m) => { glows.push(m); return m; };
  const paint = (m, key) => { tinted.push([m.color, key]); return m; }; // materials copy colours, so register their own

  // root: pointer + scroll. system: the tilted magnetic axis everything else hangs from.
  const root = new THREE.Group();
  const system = new THREE.Group();
  system.rotation.set(0.32, 0, -0.38);
  root.add(system);
  scene.add(root);

  // Atmosphere: a soft two-tone haze behind the sculpture.
  const haloU = { uA: { value: tint("a") }, uB: { value: tint("v") }, uOp: { value: 0 }, uTime: time };
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 6.4),
    glow(new THREE.ShaderMaterial({
      uniforms: haloU, transparent: true, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: `uniform vec3 uA, uB; uniform float uOp, uTime; varying vec2 vUv; ${DITHER}
        void main(){
          vec2 p = vUv - .5; float d = length(p) * 2.;
          float g = (exp(-d * d * 7.) * .5 + exp(-d * d * 2.4) * .22) * smoothstep(1., .55, d);
          vec3 c = mix(uA, uB, smoothstep(-.35, .35, p.x - p.y * .6 + .12 * sin(uTime * .15)));
          gl_FragColor = vec4(c, g * uOp + dither());
          #include <colorspace_fragment>
        }`,
    }))
  );
  halo.position.z = -2.5;
  scene.add(halo);

  // Liquid-metal core: a sphere displaced in the vertex shader, normals rebuilt from neighbours.
  const coreU = { uTime: time, uAmp: { value: 0.06 } };
  const coreMat = paint(new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.22, envMapIntensity: 0.7,
    iridescence: 0.3, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520], }), "core");
  coreMat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, coreU);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", `#include <common>
        uniform float uTime, uAmp;
        float disp(vec3 p){
          float t = uTime * .55;
          return uAmp * (sin(p.x * 3.1 + t) * sin(p.y * 2.7 + t * 1.3) * sin(p.z * 3.3 - t * .8)
            + .45 * sin(dot(p, vec3(5.1, 4.3, -3.7)) + t * 1.7));
        }`)
      .replace("#include <beginnormal_vertex>", `
        vec3 tg = normalize(cross(normal, abs(normal.y) < .99 ? vec3(0., 1., 0.) : vec3(1., 0., 0.)));
        vec3 bt = cross(normal, tg);
        vec3 p0 = position + normal * disp(position);
        vec3 p1 = position + tg * .01; p1 += normalize(p1) * disp(p1);
        vec3 p2 = position + bt * .01; p2 += normalize(p2) * disp(p2);
        vec3 objectNormal = normalize(cross(p1 - p0, p2 - p0));`)
      .replace("#include <begin_vertex>", "vec3 transformed = p0;");
  };
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.78, Q.seg, Q.seg / 2), coreMat);
  system.add(core);

  // Cut-glass shell with faint engraved edges and a fresnel rim.
  const shellGeo = new THREE.IcosahedronGeometry(1.18, 1);
  const shellMat = paint(new THREE.MeshPhysicalMaterial({ metalness: 0.1, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.8,
    iridescence: 0.7, iridescenceIOR: 1.3, flatShading: true, transparent: true, opacity: 0, depthWrite: false, }), "glass");
  const shell = new THREE.Mesh(shellGeo, shellMat);
  const edgeMat = glow(paint(new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), "a"));
  shell.add(new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo), edgeMat));
  system.add(shell);

  const rimU = { uA: { value: tint("a") }, uB: { value: tint("v") }, uOp: { value: 0 } };
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(1.26, 64, 32),
    glow(new THREE.ShaderMaterial({
      uniforms: rimU, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vN, vV, vP;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uA, uB; uniform float uOp; varying vec3 vN, vV, vP;
        void main(){
          float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 3.);
          gl_FragColor = vec4(mix(uB, uA, vP.y * .5 + .5), f * uOp);
          #include <colorspace_fragment>
        }`,
    }))
  );
  system.add(rim);

  // Filaments: dipole field lines r = L sin²θ, twisted, leaving and re-entering the shell.
  const filMats = [];
  const fils = new THREE.Group();
  system.add(fils);
  const filVert = `uniform float uTime, uSeed; varying float vU, vF;
    void main(){
      vU = uv.x;
      vec3 p = position + normalize(position) * .05 * sin(uv.x * 3.14159) * sin(uTime * .7 + uSeed * 6.283 + uv.x * 4.);
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      vF = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
      gl_Position = projectionMatrix * mv;
    }`;
  const filFrag = `uniform vec3 uColor, uHot; uniform float uTime, uSeed, uReveal, uOp, uSpeed, uPulse; varying float vU, vF;
    void main(){
      if (vU > uReveal) discard;
      float ends = smoothstep(0., .14, vU) * smoothstep(1., .86, vU);
      float d = fract(vU - uTime * uSpeed - uSeed + .5) - .5;
      float pulse = exp(-d * d * 260.) * uPulse;
      float front = exp(-pow((vU - uReveal) * 28., 2.)) * step(uReveal, .999);
      float a = (.26 + pulse * .9 + front) * ends * (.45 + .55 * vF) * uOp;
      gl_FragColor = vec4(mix(uColor, uHot, clamp(pulse + front, 0., 1.)), a);
      #include <colorspace_fragment>
    }`;
  for (let k = 0; k < Q.fils; k++) {
    const L = k % 2 ? 2.05 : 2.4;
    const phi0 = (k / Q.fils) * Math.PI * 2;
    const th0 = Math.asin(Math.sqrt(1.2 / L));
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const th = th0 + ((Math.PI - 2 * th0) * i) / 48;
      const r = L * Math.sin(th) ** 2;
      const phi = phi0 + 0.55 * (th - Math.PI / 2);
      pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi)));
    }
    const m = glow(new THREE.ShaderMaterial({
      uniforms: {
        uTime: time, uSeed: { value: k / Q.fils }, uReveal: { value: 0 }, uOp: { value: 1 },
        uSpeed: { value: 0.09 + (k % 3) * 0.035 }, uPulse: { value: k % 2 ? 0.45 : 1 },
        uColor: { value: tint(k % 4 === 3 ? "t" : k % 2 ? "v" : "a") }, uHot: { value: tint("hot") },
      },
      vertexShader: filVert, fragmentShader: filFrag, transparent: true, depthWrite: false,
    }));
    filMats.push(m);
    fils.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Q.tube, k % 2 ? 0.006 : 0.009, 6, false), m));
  }

  // Accretion disk: tiny lights orbiting the magnetic equator, inner ones faster (Kepler).
  const n = Q.parts;
  const orbit = new Float32Array(n * 3), motion = new Float32Array(n * 2), pcol = new Float32Array(n * 3);
  const pk = ["a", "a", "a", "t", "v"];
  const partColors = pk.map((k) => tint(k));
  for (let i = 0; i < n; i++) {
    const r = 1.45 + Math.random() ** 0.8 * 1.9;
    orbit.set([r, Math.random() * Math.PI * 2, (Math.random() + Math.random() - 1) * 0.12 * r], i * 3);
    motion.set([0.42 / r ** 1.5, Math.random()], i * 2);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(orbit, 3));
  pGeo.setAttribute("aMotion", new THREE.BufferAttribute(motion, 2));
  pGeo.setAttribute("aColor", new THREE.BufferAttribute(pcol, 3));
  const fillPartColors = () => {
    for (let i = 0; i < n; i++) partColors[i % pk.length].toArray(pcol, i * 3);
    pGeo.attributes.aColor.needsUpdate = true;
  };
  const partU = { uTime: time, uReveal: { value: 0 }, uScale: { value: 300 }, uOp: { value: 1 } };
  const parts = new THREE.Points(pGeo, glow(new THREE.ShaderMaterial({
    uniforms: partU, transparent: true, depthWrite: false,
    vertexShader: `attribute vec2 aMotion; attribute vec3 aColor; uniform float uTime, uReveal, uScale; varying float vA; varying vec3 vC;
      void main(){
        float a = position.y + uTime * aMotion.x;
        vec4 mv = modelViewMatrix * vec4(cos(a) * position.x, position.z, sin(a) * position.x, 1.);
        gl_Position = projectionMatrix * mv;
        vA = (.5 + .5 * sin(uTime * (.5 + aMotion.y) + aMotion.y * 40.)) * smoothstep(aMotion.y * .7, aMotion.y * .7 + .3, uReveal);
        vC = aColor;
        gl_PointSize = .045 * (.5 + aMotion.y) * uScale / -mv.z;
      }`,
    fragmentShader: `uniform float uOp; varying float vA; varying vec3 vC;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(vC, a * a * vA * uOp);
        #include <colorspace_fragment>
      }`,
  })));
  parts.frustumCulled = false;
  system.add(parts);

  // Orbits: each on its own pivot under root (not system), so they move independently of the core.
  const glowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.25, "rgba(255,255,255,.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const dummy = new THREE.Object3D();
  const rings = RINGS.map((cfg) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(...cfg.rot);
    const mat = glow(paint(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), cfg.c));
    let body;
    if (cfg.ticks) {
      body = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.006, 0.006), mat, cfg.ticks);
      for (let i = 0; i < cfg.ticks; i++) {
        const a = (i / cfg.ticks) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * cfg.R, Math.sin(a) * cfg.R, 0);
        dummy.rotation.z = a;
        dummy.scale.set(i % 6 ? 1 : 2.4, 1, 1);
        dummy.updateMatrix();
        body.setMatrixAt(i, dummy.matrix);
      }
    } else {
      body = new THREE.Mesh(new THREE.TorusGeometry(cfg.R, cfg.tube, 6, Q.seg * 2, cfg.arc || Math.PI * 2), mat);
    }
    const beadMat = glow(paint(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false }), "hot"));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 8), beadMat);
    const spriteMat = glow(paint(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), cfg.c));
    const halo = new THREE.Sprite(spriteMat);
    halo.scale.setScalar(0.34);
    bead.add(halo);
    pivot.add(body, bead);
    root.add(pivot);
    return { cfg, pivot, body, bead, mat, beadMat, spriteMat, halo, lag: { x: 0, y: 0 } };
  });

  // Lights: cool key, violet rim from behind, teal underlight, and one that follows the cursor.
  const key = new THREE.DirectionalLight(0xdfe4ff, 0);
  key.position.set(3, 4, 5);
  const back = new THREE.DirectionalLight(0x8b5cf6, 0);
  back.position.set(-4, 1.5, -3);
  const under = new THREE.PointLight(0x2dd4bf, 0, 0, 2);
  under.position.set(1.2, -2.2, 1.6);
  const cursor = new THREE.PointLight(0x9aadff, 0, 0, 2);
  scene.add(key, back, under, cursor);

  // Theme
  let lightTheme = false;
  const applyTheme = () => {
    lightTheme = document.documentElement.dataset.theme === "light";
    const pal = PAL[lightTheme ? "light" : "dark"];
    tinted.forEach(([c, k]) => c.set(pal[k]));
    fillPartColors();
    for (const m of glows) { m.blending = lightTheme ? THREE.NormalBlending : THREE.AdditiveBlending; m.needsUpdate = true; }
    renderer.toneMappingExposure = lightTheme ? 0.95 : 1.05;
    if (still) render();
  };

  // Sizing: fit a ~2.75-unit radius into the shorter side, whatever the canvas shape.
  let dist = 10;
  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    dist = 2.75 / (tan * Math.min(1, camera.aspect));
    camera.updateProjectionMatrix();
    partU.uScale.value = (h * renderer.getPixelRatio()) / (2 * tan);
    if (still) render();
  };

  // Pointer (mouse/pen only; touch drags are scrolls) and scroll progress through the hero.
  const ptr = { x: 0, y: 0, p: 0 }, cur = { x: 0, y: 0, p: 0 };
  const section = canvas.closest("section") || canvas;
  let scroll = 0;
  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    ptr.x = clamp(x, -1.6, 1.6) / 1.6;
    ptr.y = clamp(y, -1.6, 1.6) / 1.6;
    ptr.p = clamp(1 - Math.hypot(x, y) / 1.4, 0, 1);
  };
  const onLeave = (e) => { if (!e.relatedTarget) ptr.x = ptr.y = ptr.p = 0; };
  const onBlur = () => { ptr.x = ptr.y = ptr.p = 0; };
  const onScroll = () => {
    const r = section.getBoundingClientRect();
    scroll = clamp(-r.top / Math.max(r.height, 1), 0, 1);
  };

  // Frame. T drives the entrance; t drives idle motion.
  let t = 0, T = 0, last = 0;
  const update = (dt, real = dt) => {
    t += dt; T += real; // entrance follows the wall clock even when frames are slow
    time.value = t;

    // Entrance: atmosphere → fragments → core → staggered orbits → filaments.
    const eHalo = seg(T, 0, 1.4), eParts = seg(T, 0.15, 1.8), eCore = seg(T, 0.45, 1.6), eLight = seg(T, 0.35, 1.8);
    partU.uReveal.value = eParts;
    core.scale.setScalar(0.25 + 0.75 * eCore);
    shell.scale.setScalar(0.85 + 0.15 * eCore);
    shellMat.opacity = 0.16 * eCore;
    filMats.forEach((m, i) => (m.uniforms.uReveal.value = seg(T, 1.6 + i * 0.08, 1.4)));

    // Pointer, damped; orbits trail behind with their own slower springs.
    const k = 1 - Math.exp(-dt * 2.4);
    cur.x += (ptr.x - cur.x) * k;
    cur.y += (ptr.y - cur.y) * k;
    cur.p += (ptr.p - cur.p) * k;

    const breathe = Math.sin(t * 0.8);
    haloU.uOp.value = eHalo * (lightTheme ? 0.4 : 0.85) * (0.92 + 0.08 * Math.sin(t * 0.4));
    rimU.uOp.value = eCore * (lightTheme ? 0.35 : 0.55) * (0.85 + 0.15 * breathe + 0.35 * cur.p);
    edgeMat.opacity = eCore * (lightTheme ? 0.25 : 0.12) * (0.85 + 0.15 * Math.sin(t * 0.6 + 1));
    coreU.uAmp.value = 0.055 + 0.03 * cur.p;
    key.intensity = eLight * (2.3 + 0.25 * Math.sin(t * 0.5));
    back.intensity = eLight * (4 + 0.6 * Math.sin(t * 0.37 + 2));
    under.intensity = eLight * (5 + 1.2 * Math.sin(t * 0.63 + 4));
    cursor.intensity = cur.p * 6;
    cursor.position.set(cur.x * 2.6, -cur.y * 2, 2.6);

    // Idle: every layer on its own clock.
    shell.rotation.set(t * 0.03, t * 0.07, 0);
    core.rotation.y = -t * 0.05;
    fils.rotation.y = t * 0.035;

    rings.forEach((r, i) => {
      const e = seg(T, 0.95 + i * 0.24, 1.5);
      const lk = 1 - Math.exp(-dt * (1.5 - i * 0.35));
      r.lag.x += (cur.x - r.lag.x) * lk;
      r.lag.y += (cur.y - r.lag.y) * lk;
      r.pivot.rotation.set(
        r.cfg.rot[0] + (r.lag.y - cur.y) * 0.5,
        r.cfg.rot[1] + t * r.cfg.prec + (r.lag.x - cur.x) * 0.6,
        r.cfg.rot[2] + (1 - e) * 0.9
      );
      r.pivot.scale.setScalar(1.16 - 0.16 * e);
      r.mat.opacity = r.cfg.op * e;
      const a = t * r.cfg.bead + i * 2.1;
      const arc = r.cfg.arc;
      // On the open arc the bead sweeps back and forth instead of jumping the gap.
      const ang = arc ? arc * (0.5 + 0.5 * Math.sin(a)) : a;
      r.bead.position.set(Math.cos(ang) * r.cfg.R, Math.sin(ang) * r.cfg.R, 0);
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2);
      r.beadMat.opacity = e;
      r.spriteMat.opacity = e * (0.55 + 0.45 * pulse);
      r.halo.scale.setScalar(0.28 + 0.1 * pulse);
    });

    // Parallax + scroll: the camera drifts toward the cursor; scrolling away tips and recedes the sculpture.
    root.rotation.set(cur.y * 0.18 + scroll * 0.55, cur.x * 0.3 + scroll * 0.4, 0);
    root.position.y = scroll * 1.1;
    root.scale.setScalar(1 - scroll * 0.22);
    camera.position.set(cur.x * 0.35, -cur.y * 0.22, dist);
    camera.lookAt(0, 0, 0);
  };
  const render = () => renderer.render(scene, camera);
  const frame = (now) => {
    const real = last ? (now - last) / 1000 : 0.016;
    last = now;
    update(Math.min(real, 0.05), real);
    render();
  };

  // Run only while on screen and the tab is visible.
  let onScreen = true;
  const sync = () => {
    const go = !still && onScreen && !document.hidden;
    last = 0;
    renderer.setAnimationLoop(go ? frame : null);
  };

  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
  io.observe(canvas);
  const mo = new MutationObserver(applyTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (!still) {
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave);
    addEventListener("blur", onBlur);
    addEventListener("scroll", onScroll, { passive: true });
  }
  document.addEventListener("visibilitychange", sync);

  fit();
  applyTheme();
  if (still) { T = 99; t = 8; update(0); render(); } // reduced motion: one settled frame
  sync();

  const stop = () => {
    renderer.setAnimationLoop(null);
    ro.disconnect(); io.disconnect(); mo.disconnect();
    removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerout", onLeave);
    removeEventListener("blur", onBlur);
    removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", sync);
    scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose()); });
    env.dispose(); glowTex.dispose(); renderer.dispose();
  };
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stop(); canvas.classList.add("no-webgl"); }, { once: true });
  return stop;
}

// Hero backdrop: a field of soft points spanning the whole hero, drifting slowly toward the viewer
// at different depths (near ones move and parallax more), so the section reads as deep space.
export function startField(canvas, still) {
  const n = innerWidth < 640 ? 260 : innerWidth < 1024 ? 520 : 900;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

  const pos = new Float32Array(n * 3), seed = new Float32Array(n), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()], i * 3); // screen x, screen y, depth phase
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));

  const tan = Math.tan(Math.PI / 6);
  const U = {
    uTime: { value: 0 }, uAspect: { value: 1 }, uScale: { value: 300 }, uOp: { value: 0 },
    uPtr: { value: new THREE.Vector2() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float aSeed; attribute vec3 aColor;
      uniform float uTime, uAspect, uScale, uOp; uniform vec2 uPtr; varying float vA; varying vec3 vC;
      void main(){
        float ph = fract(position.z + uTime * .018 * (.6 + aSeed * .8)); // 0 = far, 1 = near
        float d = mix(30., 3., ph);
        vec2 xy = position.xy * vec2(${tan.toFixed(4)} * uAspect, ${tan.toFixed(4)}) * d * 1.08;
        xy += vec2(sin(uTime * .15 + aSeed * 30.), cos(uTime * .12 + aSeed * 20.)) * .12;
        xy -= uPtr * .7; // constant world offset -> nearer points shift more on screen
        gl_Position = projectionMatrix * vec4(xy, -d, 1.);
        vA = uOp * smoothstep(0., .12, ph) * smoothstep(1., .82, ph) * (.6 + .4 * sin(uTime * (.6 + aSeed) + aSeed * 50.));
        vC = aColor;
        gl_PointSize = min((.035 + aSeed * .045) * uScale / d, 7.);
      }`,
    fragmentShader: `varying float vA; varying vec3 vC;
      void main(){
        float r = length(gl_PointCoord - .5);
        float a = smoothstep(.5, .1, r);
        gl_FragColor = vec4(vC, a * a * vA);
        #include <colorspace_fragment>
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  const keys = ["a", "a", "a", "a", "v", "v", "t"];
  let lightTheme = false;
  const applyTheme = () => {
    lightTheme = document.documentElement.dataset.theme === "light";
    const pal = PAL[lightTheme ? "light" : "dark"], c = new THREE.Color();
    for (let i = 0; i < n; i++) c.set(pal[keys[i % keys.length]]).toArray(col, i * 3);
    geo.attributes.aColor.needsUpdate = true;
    mat.blending = lightTheme ? THREE.NormalBlending : THREE.AdditiveBlending;
    mat.needsUpdate = true;
    if (still) render();
  };

  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    U.uAspect.value = camera.aspect;
    U.uScale.value = (h * renderer.getPixelRatio()) / (2 * tan);
    if (still) render();
  };

  const ptr = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    ptr.x = (e.clientX / innerWidth) * 2 - 1;
    ptr.y = -((e.clientY / innerHeight) * 2 - 1);
  };
  const onLeave = (e) => { if (!e.relatedTarget) ptr.x = ptr.y = 0; };

  const render = () => renderer.render(scene, camera);
  let t = 0, last = 0;
  const frame = (now) => {
    const real = last ? (now - last) / 1000 : 0.016;
    last = now;
    const dt = Math.min(real, 0.05);
    t += real;
    const k = 1 - Math.exp(-dt * 1.8);
    cur.x += (ptr.x - cur.x) * k;
    cur.y += (ptr.y - cur.y) * k;
    U.uTime.value = t;
    U.uPtr.value.set(cur.x, cur.y);
    U.uOp.value = ease(t / 1.8) * (lightTheme ? 0.7 : 1);
    render();
  };

  let onScreen = true;
  const sync = () => {
    last = 0;
    renderer.setAnimationLoop(!still && onScreen && !document.hidden ? frame : null);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
  io.observe(canvas);
  const mo = new MutationObserver(applyTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (!still) {
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave);
  }
  document.addEventListener("visibilitychange", sync);

  fit();
  if (still) { U.uTime.value = 40; U.uOp.value = 1; }
  applyTheme();
  sync();

  const stop = () => {
    renderer.setAnimationLoop(null);
    ro.disconnect(); io.disconnect(); mo.disconnect();
    removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerout", onLeave);
    document.removeEventListener("visibilitychange", sync);
    geo.dispose(); mat.dispose(); renderer.dispose();
  };
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stop(); }, { once: true });
  return stop;
}
