'use strict';
const $ = id => document.getElementById(id), cv = $('cv'), view = $('view');

/* ---------- Renderer, kamera, kontrol (render hanya saat ada perubahan = hemat baterai) ---------- */
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.outputEncoding = THREE.sRGBEncoding;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, .01, 2000);
cam.position.set(3, 2, 4);
const ctl = new THREE.OrbitControls(cam, cv);
ctl.screenSpacePanning = true;
let dirty = true; const draw = () => { dirty = true; };
ctl.addEventListener('change', draw);
(function loop() { requestAnimationFrame(loop); if (dirty) { dirty = false; renderer.render(scene, cam); } })();
new ResizeObserver(() => {
  const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); draw();
}).observe(view);

const grid = new THREE.GridHelper(20, 20, 0x555b66, 0x2a2e36), axes = new THREE.AxesHelper(2);
scene.add(grid, axes);
scene.background = new THREE.Color('#14161b');
const lights = new THREE.Group(); scene.add(lights);
const dl = (i, x, y, z) => { const d = new THREE.DirectionalLight(0xffffff, i); d.position.set(x, y, z); return d; };
const LT = {
  studio: () => [new THREE.HemisphereLight(0xffffff, 0x444455, .8), dl(1.1, 3, 5, 4), dl(.4, -4, 2, -3)],
  terang: () => [new THREE.AmbientLight(0xffffff, 1.3), dl(1, 2, 4, 3)],
  gelap: () => [new THREE.AmbientLight(0xffffff, .15), dl(1.2, 4, 1, 2)]
};
function setLight(k) { lights.clear(); LT[k]().forEach(l => lights.add(l)); draw(); }
setLight('studio');

/* ---------- Util ---------- */
let tt;
function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 4500); }
let bc = 0; const busy = on => { bc = Math.max(0, bc + (on ? 1 : -1)); $('busy').hidden = !bc; };
const fmt = s => s > 1048576 ? (s / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(s / 1024)) + ' KB';
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const meshesOf = r => { const a = []; r && r.traverse(o => o.isMesh && a.push(o)); return a; };

/* ---------- State ---------- */
const models = []; let cur = null, selMesh = null, undoS = [], redoS = [], last = null, uid = 0;
const st = o => ({ p: o.position.toArray(), r: [o.rotation.x, o.rotation.y, o.rotation.z], s: o.scale.x });
const ap = (o, s) => { o.position.fromArray(s.p); o.rotation.set(s.r[0], s.r[1], s.r[2]); o.scale.setScalar(s.s); draw(); };

/* ---------- Import ---------- */
async function openFiles(list) {
  const fl = [...list], res = {};
  fl.forEach(f => res[f.name] = URL.createObjectURL(f)); // untuk .gltf yang punya .bin/tekstur terpisah
  const mains = fl.filter(f => /\.(glb|gltf)$/i.test(f.name));
  if (!mains.length) { toast('File tidak valid: pilih file .glb atau .gltf'); return; }
  busy(1);
  for (const f of mains) {
    try { await loadOne(f, res); } catch (e) { toast('Gagal membuka ' + f.name + ': ' + ((e && e.message) || 'file tidak valid')); }
  }
  busy(0); setTimeout(() => Object.values(res).forEach(u => URL.revokeObjectURL(u)), 3000);
}
function loadOne(f, res) {
  return new Promise(async (ok, no) => {
    try {
      const mgr = new THREE.LoadingManager();
      mgr.setURLModifier(u => res[decodeURIComponent(u.split('/').pop().split('?')[0])] || u);
      const buf = await f.arrayBuffer();
      new THREE.GLTFLoader(mgr).parse(buf, '', g => {
        const root = new THREE.Group(); root.name = f.name.replace(/\.(glb|gltf)$/i, '');
        root.userData = { id: ++uid, file: f.name, size: f.size };
        root.add(g.scene);
        const b = new THREE.Box3().setFromObject(g.scene), c = b.getCenter(new THREE.Vector3());
        g.scene.position.set(-c.x, -b.min.y, -c.z); // taruh di tengah, menapak grid
        scene.add(root); models.push(root); cur = root; selMesh = null; last = st(root);
        fit(); refresh(); ok();
      }, e => no(e instanceof Error ? e : new Error('format tidak dikenali')));
    } catch (e) { no(e); }
  });
}

/* ---------- Kamera ---------- */
function fit() {
  const b = new THREE.Box3();
  cur ? b.setFromObject(cur) : b.set(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 1, 1));
  const c = b.getCenter(new THREE.Vector3()), d = Math.max(b.getSize(new THREE.Vector3()).length(), .1);
  ctl.target.copy(c);
  cam.position.copy(c).add(new THREE.Vector3(.8, .55, 1).normalize().multiplyScalar(d * 1.1));
  cam.near = d / 200; cam.far = d * 200; cam.updateProjectionMatrix(); ctl.update(); draw();
}

/* ---------- UI ---------- */
function li(ul, txt, sub, on, act, del) {
  const e = document.createElement('li'); if (on) e.className = 'on';
  e.innerHTML = '<span></span><small></small>'; e.children[0].textContent = txt; e.children[1].textContent = sub || '';
  e.onclick = act;
  if (del) { const b = document.createElement('button'); b.textContent = '✕'; b.title = 'Hapus'; b.onclick = ev => { ev.stopPropagation(); del(); }; e.append(b); }
  ul.append(e);
}
const F = ['p0', 'p1', 'p2', 'r0', 'r1', 'r2', 'sc'].map($);
function writeT() {
  if (!cur) { F.forEach(e => e.value = ''); return; }
  const d = 180 / Math.PI, r = n => +n.toFixed(3);
  [cur.position.x, cur.position.y, cur.position.z, cur.rotation.x * d, cur.rotation.y * d, cur.rotation.z * d, cur.scale.x].forEach((n, i) => F[i].value = r(n));
}
function readT() {
  const v = F.map(e => parseFloat(e.value) || 0), d = Math.PI / 180;
  cur.position.set(v[0], v[1], v[2]); cur.rotation.set(v[3] * d, v[4] * d, v[5] * d);
  cur.scale.setScalar(Math.max(.001, parseFloat(F[6].value) || 1)); draw();
}
function commit() {
  const b = st(cur); undoS.push({ o: cur, a: last, b }); if (undoS.length > 100) undoS.shift();
  last = b; redoS.length = 0; btns();
}
F.forEach(e => { e.oninput = () => cur && readT(); e.onchange = () => { if (!cur) return; readT(); commit(); stats(); }; });

function hist(from, to, key) {
  let e; while ((e = from.pop())) if (models.includes(e.o)) break;
  if (!e || !models.includes(e.o)) { btns(); return; }
  ap(e.o, e[key]); to.push(e); cur = e.o; last = e[key]; selMesh = null; refresh();
}
const tmats = () => { const s = new Set(); (selMesh ? [selMesh] : meshesOf(cur)).forEach(m => [].concat(m.material).forEach(x => x && s.add(x))); return [...s]; };
function matSync() {
  const m = tmats()[0]; $('col').disabled = $('op').disabled = !m;
  $('matT').textContent = selMesh ? '(' + (selMesh.name || 'mesh') + ')' : '(semua mesh)';
  if (!m) return;
  $('col').value = '#' + (m.color ? m.color.getHexString() : 'ffffff'); $('op').value = m.opacity;
}
$('col').oninput = e => { tmats().forEach(m => m.color && m.color.set(e.target.value)); draw(); };
$('op').oninput = e => { const v = +e.target.value; tmats().forEach(m => { m.transparent = v < 1 || m.userData.t; m.opacity = v; m.depthWrite = v >= 1; m.needsUpdate = true; }); draw(); };

function stats() {
  if (!cur) { $('stats').textContent = '—'; return; }
  const ms = meshesOf(cur), mt = new Set(); let v = 0, t = 0;
  ms.forEach(m => { const g = m.geometry, p = g.attributes.position; if (p) { v += p.count; t += (g.index ? g.index.count : p.count) / 3; } [].concat(m.material).forEach(x => mt.add(x)); });
  const s = new THREE.Box3().setFromObject(cur).getSize(new THREE.Vector3());
  $('stats').innerHTML = `Mesh: ${ms.length}<br>Vertices: ${v.toLocaleString()}<br>Triangles: ${Math.round(t).toLocaleString()}<br>Materials: ${mt.size}<br>Dimensi: ${s.x.toFixed(2)} × ${s.y.toFixed(2)} × ${s.z.toFixed(2)}`;
}
function btns() {
  $('bUndo').disabled = !undoS.length; $('bRedo').disabled = !redoS.length;
  $('bGlb').disabled = $('bGltf').disabled = $('bShot').disabled = !cur;
}
function refresh() {
  const ml = $('models'), me = $('meshes'); ml.innerHTML = me.innerHTML = '';
  models.forEach(r => li(ml, r.userData.file, fmt(r.userData.size), r === cur, () => { cur = r; selMesh = null; last = st(r); refresh(); }, () => del(r)));
  meshesOf(cur).slice(0, 200).forEach((m, i) => li(me, m.name || 'Mesh ' + (i + 1), '', m === selMesh, () => { selMesh = selMesh === m ? null : m; refresh(); }));
  $('empty').classList.toggle('off', models.length > 0);
  writeT(); matSync(); stats(); btns();
}
function del(r) {
  scene.remove(r);
  r.traverse(o => { o.geometry && o.geometry.dispose(); [].concat(o.material || []).forEach(m => { for (const k in m) m[k] && m[k].isTexture && m[k].dispose(); m.dispose(); }); });
  models.splice(models.indexOf(r), 1);
  undoS = undoS.filter(e => e.o !== r); redoS = redoS.filter(e => e.o !== r);
  if (cur === r) { cur = models[models.length - 1] || null; selMesh = null; last = cur && st(cur); }
  refresh(); draw();
}

/* ---------- Export ---------- */
function exportModel(bin) {
  if (!cur) return toast('Belum ada model');
  busy(1);
  try {
    new THREE.GLTFExporter().parse(cur, r => {
      const blob = bin ? new Blob([r], { type: 'model/gltf-binary' }) : new Blob([JSON.stringify(r)], { type: 'model/gltf+json' });
      download(blob, (cur.name || 'model') + (bin ? '.glb' : '.gltf')); busy(0);
    }, { binary: bin, onlyVisible: false, maxTextureSize: 4096 });
  } catch (e) { busy(0); toast('Export gagal: ' + (e.message || e)); }
}

/* ---------- Event ---------- */
$('bOpen').onclick = () => $('file').click();
$('file').onchange = e => { e.target.files.length && openFiles(e.target.files); e.target.value = ''; };
$('bUndo').onclick = () => hist(undoS, redoS, 'a');
$('bRedo').onclick = () => hist(redoS, undoS, 'b');
$('bReset').onclick = fit;
$('bGlb').onclick = () => exportModel(true);
$('bGltf').onclick = () => exportModel(false);
$('bSide').onclick = () => document.body.classList.toggle('sb');
$('bFs').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : view.requestFullscreen(); } catch (e) { toast('Fullscreen tidak didukung'); } };
$('bShot').onclick = () => { renderer.render(scene, cam); cv.toBlob(b => b ? download(b, (cur.name || 'model') + '.png') : toast('Screenshot gagal')); };
$('bg').oninput = e => { scene.background.set(e.target.value); draw(); };
$('light').onchange = e => setLight(e.target.value);
$('grid').onchange = e => { grid.visible = e.target.checked; draw(); };
$('axes').onchange = e => { axes.visible = e.target.checked; draw(); };
let dc = 0;
addEventListener('dragenter', e => { e.preventDefault(); dc++; $('drop').classList.add('on'); });
addEventListener('dragover', e => e.preventDefault());
addEventListener('dragleave', () => { if (--dc <= 0) { dc = 0; $('drop').classList.remove('on'); } });
addEventListener('drop', e => { e.preventDefault(); dc = 0; $('drop').classList.remove('on'); e.dataTransfer.files.length && openFiles(e.dataTransfer.files); });
addEventListener('keydown', e => {
  if (/INPUT|SELECT/.test(e.target.tagName) || !(e.ctrlKey || e.metaKey)) return;
  if (e.key === 'z') { e.preventDefault(); hist(undoS, redoS, 'a'); } else if (e.key === 'y') { e.preventDefault(); hist(redoS, undoS, 'b'); }
});
refresh();
