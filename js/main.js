import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader }    from 'three/addons/loaders/FontLoader.js';
import { TextGeometry }  from 'three/addons/geometries/TextGeometry.js';

const canvas    = document.getElementById('hero3d');
const wrap      = canvas.parentElement;
const cuHint    = document.getElementById('cuHint');
const cuStatus  = document.getElementById('cuStatus');
const cuFill    = document.getElementById('cuFill');
const cuLayers  = document.getElementById('cuLayers');
const cuReplay  = document.getElementById('cuReplay');
const TOTAL_L   = 100;

// ── RENDERER ──────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.localClippingEnabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.9;

function resize() {
  const w = wrap.offsetWidth, h = wrap.offsetHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ── SCENE & CAMERA ────────────────────────────────────────────────────────
const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x050d0f);
scene.fog = new THREE.FogExp2(0x050d0f, 0.018);

const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 200);
const CAM_START = new THREE.Vector3(26, 19, 32);
const CAM_END   = new THREE.Vector3(16, 12, 22);
const LOOK      = new THREE.Vector3(0, 3.5, 0);
camera.position.copy(CAM_START);
camera.lookAt(LOOK);
resize();

// ── LIGHTS ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x183238, 7));

const key = new THREE.DirectionalLight(0x88cfe0, 3.8);
key.position.set(-12, 22, 14);
key.castShadow = true;
key.shadow.mapSize.setScalar(1024);
key.shadow.camera.left = -22; key.shadow.camera.right = 22;
key.shadow.camera.top  =  22; key.shadow.camera.bottom = -22;
scene.add(key);

const rim = new THREE.PointLight(0x003d33, 5, 55);
rim.position.set(-16, 10, -14); scene.add(rim);

const nozzleLight = new THREE.PointLight(0xff8800, 0, 14, 2);
scene.add(nozzleLight);

const bedGlow = new THREE.PointLight(0x00c9a7, 0, 22, 2);
bedGlow.position.set(0, -1, 0); scene.add(bedGlow);

// ── MATERIALS ─────────────────────────────────────────────────────────────
const M = {
  rail:     new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: .95, roughness: .10 }),
  frame:    new THREE.MeshStandardMaterial({ color: 0x1e1e1e, metalness: .85, roughness: .25 }),
  bed:      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: .15, roughness: .88 }),
  carriage: new THREE.MeshStandardMaterial({ color: 0x181818, metalness: .75, roughness: .30 }),
  screw:    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: .90, roughness: .22 }),
  hotend:   new THREE.MeshStandardMaterial({ color: 0x060606, metalness: .97, roughness: .04,
              emissive: new THREE.Color(0xff8800), emissiveIntensity: 0 }),
};

// ── BED ───────────────────────────────────────────────────────────────────
const bedGroup = new THREE.Group(); scene.add(bedGroup);
const bedPlat = new THREE.Mesh(new THREE.BoxGeometry(18,.5,16), M.bed);
bedPlat.position.y = -.25; bedPlat.receiveShadow = true;
bedGroup.add(bedPlat);

const gMat = new THREE.LineBasicMaterial({ color: 0x00c9a7, transparent: true, opacity: .09 });
const gPts = [];
for (let x=-9;x<=9;x+=2) gPts.push(x,.02,-8, x,.02,8);
for (let z=-8;z<=8;z+=2) gPts.push(-9,.02,z, 9,.02,z);
const gGeo = new THREE.BufferGeometry();
gGeo.setAttribute('position', new THREE.Float32BufferAttribute(gPts,3));
bedGroup.add(new THREE.LineSegments(gGeo, gMat));

[[-8,-7],[8,-7],[-8,7],[8,7]].forEach(([x,z]) => {
  const c = new THREE.Mesh(new THREE.BoxGeometry(.5,.65,.28), M.screw);
  c.position.set(x,.33,z); bedGroup.add(c);
});

// ── FRAME ─────────────────────────────────────────────────────────────────
const frameGroup = new THREE.Group(); scene.add(frameGroup);
const FH = 22;
[[-9,-8],[9,-8],[-9,8],[9,8]].forEach(([x,z]) => {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,FH,10), M.rail);
  p.position.set(x, FH/2-2, z); p.castShadow = true; frameGroup.add(p);
});
[-8,8].forEach(z => { const r = new THREE.Mesh(new THREE.BoxGeometry(18.5,.36,.36), M.rail); r.position.set(0,FH-2,z); frameGroup.add(r); });
[-9,9].forEach(x => { const r = new THREE.Mesh(new THREE.BoxGeometry(.36,.36,16.5), M.rail); r.position.set(x,FH-2,0); frameGroup.add(r); });
[-8,8].forEach(z => { const r = new THREE.Mesh(new THREE.BoxGeometry(18.5,.33,.33), M.frame); r.position.set(0,-2,z); frameGroup.add(r); });
[[-9,-8],[9,-8],[-9,8],[9,8]].forEach(([x,z]) => {
  const b  = new THREE.Mesh(new THREE.BoxGeometry(1.1,.44,1.1), M.screw); b.position.set(x,FH-2,z);  frameGroup.add(b);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.1,.44,1.1), M.screw); b2.position.set(x,-2,z);  frameGroup.add(b2);
});

// LED strip — teal
const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: new THREE.Color(0x00c9a7), emissiveIntensity: 2.2, transparent: true, opacity: .8 });
const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(17.4,.07,.11), ledMat);
ledStrip.position.set(0, FH-1.84, -8.12); frameGroup.add(ledStrip);
const stripLight = new THREE.PointLight(0x00c9a7, 2.0, 22);
stripLight.position.set(0, FH-1.8, -8.5); scene.add(stripLight);

// Status LED (green)
const sLedMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: new THREE.Color(0x00ff88), emissiveIntensity: 3 });
const sLed = new THREE.Mesh(new THREE.SphereGeometry(.1,8,8), sLedMat);
sLed.position.set(-9, 2, -8.1); frameGroup.add(sLed);
const sLight = new THREE.PointLight(0x00ff88, 0.7, 6);
sLight.position.copy(sLed.position); scene.add(sLight);

// Corner accent dots
const acMat = new THREE.MeshStandardMaterial({ color: 0x00c9a7, emissive: new THREE.Color(0x00c9a7), emissiveIntensity: 1.4, transparent: true, opacity: .65 });
[[-8.5,-7.5],[8.5,-7.5],[-8.5,7.5],[8.5,7.5]].forEach(([x,z]) => {
  const d = new THREE.Mesh(new THREE.SphereGeometry(.08,6,6), acMat);
  d.position.set(x, FH-2.2, z); frameGroup.add(d);
});

// ── GANTRY ────────────────────────────────────────────────────────────────
const gantryGroup = new THREE.Group(); gantryGroup.position.set(0,14,0); scene.add(gantryGroup);
gantryGroup.add(new THREE.Mesh(new THREE.BoxGeometry(18.5,.50,.50), M.rail));
[-9,9].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(.75,.75,.95), M.screw); b.position.set(x,0,0); gantryGroup.add(b); });

const carriageGroup = new THREE.Group(); gantryGroup.add(carriageGroup);
carriageGroup.add(new THREE.Mesh(new THREE.BoxGeometry(2.0,1.65,1.85), M.carriage));
const motor = new THREE.Mesh(new THREE.BoxGeometry(1.45,1.45,1.45), M.carriage);
motor.position.set(0,1.05,0); carriageGroup.add(motor);
const mLedMat = new THREE.MeshStandardMaterial({ color: 0x00c9a7, emissive: new THREE.Color(0x00c9a7), emissiveIntensity: 0 });
const mLed = new THREE.Mesh(new THREE.SphereGeometry(.07,6,6), mLedMat);
mLed.position.set(.68,1.48,.72); carriageGroup.add(mLed);
const ptfe = new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,3,6), new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true, opacity: .4 }));
ptfe.position.set(.28,2.65,0); carriageGroup.add(ptfe);
for (let i=0;i<5;i++) { const f=new THREE.Mesh(new THREE.BoxGeometry(.88,.08,.88),M.frame); f.position.set(0,-.40-i*.14,0); carriageGroup.add(f); }
const hotendBody = new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.82,10), M.frame);
hotendBody.position.set(0,-1.08,0); carriageGroup.add(hotendBody);
const nozzleMesh = new THREE.Mesh(new THREE.CylinderGeometry(.04,.21,.63,8), M.hotend);
nozzleMesh.position.set(0,-1.62,0); carriageGroup.add(nozzleMesh);
const nozzleDotMat = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: new THREE.Color(0xff9900), emissiveIntensity: 0 });
const nozzleDot = new THREE.Mesh(new THREE.SphereGeometry(.073,8,8), nozzleDotMat);
nozzleDot.position.set(0,-1.97,0); carriageGroup.add(nozzleDot);

// ── FLOOR ─────────────────────────────────────────────────────────────────
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120,120), new THREE.MeshStandardMaterial({ color: 0x060808, roughness: 1 }));
floor.rotation.x = -Math.PI/2; floor.position.y = -2.3; floor.receiveShadow = true; scene.add(floor);

// ── LAYER TEXTURE ─────────────────────────────────────────────────────────
function makeLayerTex() {
  const c = document.createElement('canvas'); c.width=64; c.height=256;
  const ctx = c.getContext('2d');
  for (let y=0;y<256;y++) {
    ctx.fillStyle = (y%6)<1 ? '#0a0a0a' : '#555';
    ctx.fillRect(0,y,64,1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2,5);
  return t;
}

// ── TEXT + SMOOTH GRADIENT SHADER ─────────────────────────────────────────
const clipPlane = new THREE.Plane(new THREE.Vector3(0,-1,0), -1);
let textMesh = null, textMinY = 0, textMaxY = 3, TEXT_Y = 0.05;

const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.158.0/examples/fonts/optimer_bold.typeface.json', (font) => {
  const geo = new TextGeometry('ZONA 3D', {
    font, size: 2.2, height: 0.9, curveSegments: 10,
    bevelEnabled: true, bevelThickness: .18, bevelSize: .14, bevelSegments: 8,
  });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.max.x-bb.min.x)/2, 0, -(bb.max.z-bb.min.z)/2);
  geo.computeBoundingBox();
  textMinY = geo.boundingBox.min.y + TEXT_Y;
  textMaxY = geo.boundingBox.max.y + TEXT_Y;
  clipPlane.constant = textMinY - .2;

  const layerTex = makeLayerTex();

  // Smooth world-Y gradient via onBeforeCompile — same from ALL angles
  function gradientMat(metalness, roughness) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness, roughness,
      roughnessMap: layerTex,
      clippingPlanes: [clipPlane], clipShadows: false,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uMinY  = { value: textMinY };
      shader.uniforms.uMaxY  = { value: textMaxY };
      // pass world pos to fragment
      shader.vertexShader = 'varying vec3 vWPos;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvWPos = worldPosition.xyz;'
      );
      shader.fragmentShader =
        'varying vec3 vWPos;\nuniform float uMinY;\nuniform float uMaxY;\n'
        + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `float gradT = clamp((vWPos.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
         // dark teal base → bright teal-white highlight
         // teal palette: --teal #00c9a7 / --teal-dim #00a688
         vec3 dark    = vec3(0.00, 0.18, 0.16);
         vec3 mid     = vec3(0.00, 0.65, 0.53);
         vec3 bright  = vec3(0.70, 1.00, 0.93);
         vec3 gradCol = gradT < 0.5
           ? mix(dark, mid, gradT * 2.0)
           : mix(mid, bright, (gradT - 0.5) * 2.0);
         vec4 diffuseColor = vec4(gradCol, opacity);`
      );
    };
    return mat;
  }

  const frontMat = gradientMat(0.60, 0.22);
  const sideMat  = gradientMat(0.75, 0.14);

  textMesh = new THREE.Mesh(geo, [frontMat, sideMat]);
  textMesh.position.y = TEXT_Y;
  textMesh.castShadow = true;
  scene.add(textMesh);
});

// ── ORBIT CONTROLS ────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, canvas);
controls.target.copy(LOOK);
controls.enableDamping = true; controls.dampingFactor = .06;
controls.enabled = false;
controls.minDistance = 6; controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * .52;

// ── ANIMATION STATE ───────────────────────────────────────────────────────
const clock = new THREE.Clock();
const T = { INTRO: 1.2, HOME: .65, PRINT: 5.5, ORBIT: 2.0 };
let phase = 'intro', phaseTime = 0;

function ease(t) { return t<.5?2*t*t:-1+(4-2*t)*t; }
function lerp(a,b,t) { return a+(b-a)*t; }
function clamp(v,lo,hi) { return Math.max(lo,Math.min(hi,v)); }

function resetAnim() {
  phase = 'intro'; phaseTime = 0;
  camera.position.copy(CAM_START); camera.lookAt(LOOK);
  gantryGroup.position.set(0,14,0);
  carriageGroup.position.x = 0;
  M.hotend.emissiveIntensity = 0;
  nozzleDotMat.emissiveIntensity = 0;
  mLedMat.emissiveIntensity = 0;
  nozzleLight.intensity = 0;
  bedGlow.intensity = 0;
  if (textMesh) clipPlane.constant = textMinY - .2;
  cuFill.style.width = '0%';
  cuLayers.textContent = 'Capa 0 / ' + TOTAL_L;
  cuStatus.classList.remove('on');
  cuReplay.classList.remove('on');
  cuHint.classList.remove('on');
  controls.enabled = false;
}
cuReplay.addEventListener('click', resetAnim);

// ── RENDER LOOP ───────────────────────────────────────────────────────────
function tick() {
  requestAnimationFrame(tick);
  const dt = clock.getDelta();
  phaseTime += dt;
  const pt = phaseTime;

  if (phase === 'intro') {
    const p = clamp(pt/T.INTRO,0,1);
    camera.position.lerpVectors(CAM_START, CAM_END, ease(p));
    camera.lookAt(LOOK);
    bedGlow.intensity = lerp(0,.7,ease(p));
    if (p>=1) { phase='home'; phaseTime=0; }

  } else if (phase === 'home') {
    const p=clamp(pt/T.HOME,0,1), ep=ease(p);
    M.hotend.emissiveIntensity      = lerp(0,1.5,ep);
    nozzleDotMat.emissiveIntensity  = lerp(0,3.5,ep);
    mLedMat.emissiveIntensity       = lerp(0,2.5,ep);
    nozzleLight.intensity           = lerp(0,6,ep);
    gantryGroup.position.y          = lerp(14,TEXT_Y+3.1,ep);
    carriageGroup.position.x        = lerp(0,-7,ep);
    if (p>=1) { phase='print'; phaseTime=0; cuStatus.classList.add('on'); }

  } else if (phase === 'print') {
    const p=clamp(pt/T.PRINT,0,1);
    if (textMesh) clipPlane.constant = lerp(textMinY-.2, textMaxY+.2, p);
    const nx = Math.sin(pt*2.8*Math.PI)*7.2;
    const ny = lerp(textMinY, textMaxY, p)+.2;
    carriageGroup.position.x = nx;
    gantryGroup.position.y   = ny+1.92;
    gantryGroup.position.z   = Math.sin(pt*.3)*.45;
    nozzleLight.position.set(nx, ny, gantryGroup.position.z);
    const gp = .88 + Math.sin(pt*22)*.13;
    M.hotend.emissiveIntensity     = gp;
    nozzleDotMat.emissiveIntensity = gp*3;
    mLedMat.emissiveIntensity      = gp*2;
    sLedMat.emissiveIntensity      = 2+Math.sin(pt*6)*1.1;
    cuFill.style.width  = (p*100)+'%';
    cuLayers.textContent= `Capa ${Math.round(p*TOTAL_L)} / ${TOTAL_L}`;
    if (p>=1) { phase='complete'; phaseTime=0; cuStatus.classList.remove('on'); }

  } else if (phase === 'complete') {
    const angle = pt*.22;
    const rad   = lerp(18,16,ease(clamp(pt/T.ORBIT,0,1)));
    camera.position.x = Math.sin(angle)*rad;
    camera.position.z = Math.cos(angle)*rad;
    camera.position.y = lerp(camera.position.y,9,.03);
    camera.lookAt(LOOK);
    gantryGroup.position.y = lerp(gantryGroup.position.y,18,.03);
    M.hotend.emissiveIntensity     = lerp(M.hotend.emissiveIntensity,0,.04);
    nozzleDotMat.emissiveIntensity = lerp(nozzleDotMat.emissiveIntensity,0,.04);
    nozzleLight.intensity          = lerp(nozzleLight.intensity,0,.04);
    mLedMat.emissiveIntensity      = lerp(mLedMat.emissiveIntensity,0,.04);
    if (pt>=T.ORBIT) {
      phase='idle'; phaseTime=0;
      controls.enabled=true; controls.target.copy(LOOK);
      cuReplay.classList.add('on');
      cuHint.classList.add('on');
    }
  } else {
    controls.update();
  }
  if (phase!=='idle') controls.update();
  renderer.render(scene, camera);
}

tick();
window.addEventListener('resize', resize);
// Also resize when container changes (e.g. on load)
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(resize).observe(wrap);
}
