/* ===== Suara mesin dari rekaman (idle, gas, lepas gas, burnout) ===== */
const ENG={loading:0,ready:0,b:{},n:{},gasPrev:0,burnPrev:0,gasT:0,burnT:0};



// Granular: potongan acak dari rekaman saling bertumpuk (cross-fade) -> suara panjang tanpa terdengar mengulang
// suara lepas gas kecepatan tinggi: masuk perlahan (bukan langsung), supaya menyatu dengan suara mesin sebelumnya

const GW=(()=>{const a=new Float32Array(64);for(let i=0;i<64;i++)a[i]=Math.sin(Math.PI*i/63);return a})();



// ===== MODE SANTAYY: rekaman 8 detik; mulai dari 0 kalau baru jalan, kalau sudah melaju mulai dari posisi sesuai kecepatan =====


// ===== SUARA GAS UTAMA (rekaman motor, outro TikTok sudah dipotong): main dari awal sampai habis; kalau gas masih ditahan -> disambung granular dari bagian stabil (REV_SS..REV_SE detik) =====
const REV_SS=2.5,REV_SE=7.6;




(function(){const b=document.getElementById('drod'),n=document.getElementById('onarr');
 // dua mode: SANTAYY (pelan, maks ~61 km/j, tanpa nunduk/efek ngebut) dan ONARR (normal); hanya satu yang menyala
 const setM=v=>{ENG.drod=v?1:0;b.classList.toggle('on',!!v);n.classList.toggle('on',!v);try{localStorage.setItem('drod',v?'1':'0')}catch(_){}if(!v&&ENG.dr)drodStop(99)};
 let init=false;try{init=localStorage.getItem('drod')==='1'}catch(e){}
 setM(init);
 b.addEventListener('pointerdown',e=>{e.preventDefault();setM(1)});
 n.addEventListener('pointerdown',e=>{e.preventDefault();setM(0)})})();

/* ===== KARAKTER UTAMA: Black_Hoodie_Rigged.glb =====
   Taruh file models/Black_Hoodie_Rigged.glb di repo. Kalau ada, dipakai menggantikan karakter lama di SEMUA tempat
   (menu karakter, pembalap di motor, dan karakter jalan kaki). Kalau file tidak ada/rusak -> otomatis pakai karakter lama.
   Dipasang di file ini karena harus aktif SEBELUM models3d.js memanggil gLoad(), dan hanya file ini yang dimuat di antara core.js dan models3d.js.
   Model ini tidak punya tulang HeadTop_End (dipakai game buat ukur tinggi), jadi ditambahkan saat dimuat (ujung kepala setinggi 1,903 m).
   Material diperhalus untuk malam: metalik 0 + sedikit emissive dari tekstur warna supaya hoodie hitam tidak hilang di gelap.
   Matikan dengan window.CHAR_HOODIE=false sebelum game mulai. */
(function(){
 const FILE='Black_Hoodie_Rigged.glb',orig=window.chB64ToBuf;
 if(typeof orig!=='function')return;
 let P=null;
 const fix=buf=>{try{
  const dv=new DataView(buf),jl=dv.getUint32(12,true);
  const js=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl)));
  if(js.nodes.some(n=>n.name==='HeadTop_End'))return buf;
  const hi=js.nodes.findIndex(n=>n.name==='Head');if(hi<0)return buf;
  js.nodes.push({name:'HeadTop_End',translation:[0,.253,0]});
  (js.nodes[hi].children=js.nodes[hi].children||[]).push(js.nodes.length-1);
  const m=js.materials&&js.materials[0];
  if(m&&m.pbrMetallicRoughness){m.pbrMetallicRoughness.metallicFactor=0;
   const bt=m.pbrMetallicRoughness.baseColorTexture;if(bt){m.emissiveFactor=[.2,.2,.2];m.emissiveTexture={index:bt.index,texCoord:0}}}
  const jb=new TextEncoder().encode(JSON.stringify(js)),pad=(4-jb.length%4)%4,jb2=new Uint8Array(jb.length+pad);
  jb2.set(jb);for(let i=0;i<pad;i++)jb2[jb.length+i]=32;
  const rest=new Uint8Array(buf,20+jl),out=new Uint8Array(20+jb2.length+rest.length);
  out.set(new Uint8Array(buf,0,20));out.set(jb2,20);out.set(rest,20+jb2.length);
  const o=new DataView(out.buffer);o.setUint32(8,out.length,true);o.setUint32(12,jb2.length,true);
  return out.buffer}catch(e){console.warn('patch Black Hoodie',e);return buf}};
 const load=()=>P||(P=fetch('models/'+FILE).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' models/'+FILE);return r.arrayBuffer()})
  .then(b=>{if(b.byteLength<1000||new DataView(b).getUint32(0,true)!==0x46546C67)throw new Error('bukan GLB');return fix(b)}));
 window.chB64ToBuf=function(b64,file){
  if(file==='karakter.glb'&&window.CHAR_HOODIE!==false)return load().catch(e=>{console.warn('Black Hoodie tidak dimuat, pakai karakter lama:',e&&e.message||e);return orig(b64,file)});
  return orig(b64,file)};
})();

/* ===== CEWE: tombol ganti karakter + taruh cewe di mana saja, dan HP motor 20 =====
   - Tombol "👧 CEWE" di toolbar kanan atas (di game) dan di bar atas mode CINEMATIC membuka panel:
     KARAKTER: COWOK/CEWE   = karakter yang kamu kendalikan saat JALAN KAKI diganti model cewe (tobrut_animated.glb). Pembalap di motor tetap karakter utama.
     TARUH DI TITIK TENGAH LAYAR = cewe dipindah ke titik tanah yang ada di tengah layar (cocok dipakai dari kamera drone cinematic).
     TARUH DI DEPAN SAYA    = cewe dipindah 1,8 m di depan karakter, menghadap ke kamu.
     PUTAR 45°, SEMBUNYIKAN/TAMPILKAN.
   - Kalau cewe tidak punya animasi Walk/Run sendiri, dipinjam dari karakter utama (hanya rotasi tulang; hanya dipakai kalau nama tulangnya cocok), kalau tidak cocok tetap Idle.
   - HP motor: HP_TARGET di bawah. Percepatan ikut naik sebanding HP_TARGET / HP lama (kecepatan maksimum tidak diubah). */
(function(){
 'use strict';
 const HP_TARGET=20;
 let t1=0;
 const iv1=setInterval(()=>{
  let hpOk=false,shOk=false;
  try{
   if(typeof HPV!=='undefined'&&HPV){
    if(!HPV.__hpT){
     const hp0=+HPV.hp,k0=HPV.k;
     if(hp0>0&&typeof k0==='function'){
      const kb=k0.call(HPV);
      try{HPV.hp=HP_TARGET}catch(e){}
      const ka=k0.call(HPV);
      if(!(Math.abs(ka-kb)>1e-9)&&hp0!==HP_TARGET){try{HPV.k=function(){return k0.call(this)*(HP_TARGET/hp0)}}catch(e){}}
      try{HPV.__hpT=1}catch(e){}}}
    hpOk=true}
   if(typeof SHOP_VEH!=='undefined'&&SHOP_VEH&&SHOP_VEH[0]){SHOP_VEH[0].ket='Motor awal kamu (gratis) · '+HP_TARGET+' HP';shOk=true}
  }catch(e){console.error('HP motor',e)}
  if((hpOk&&shOk)||++t1>300)clearInterval(iv1)},200);

 let t2=0;
 const iv2=setInterval(()=>{
  let ok=false;
  try{ok=!!(window.CIN&&window.CWE&&CWE.obj&&typeof walker!=='undefined'&&typeof scene!=='undefined'&&typeof cam!=='undefined'&&document.getElementById('tr'))}catch(e){}
  if(ok){clearInterval(iv2);try{init()}catch(e){console.error('cewe ui',e)}}
  else if(++t2>600)clearInterval(iv2)},200);

 function init(){
  const toast=t=>{try{camToast(t)}catch(e){}};
  const st={cewe:false,prev:null,gm0:null,w2:null};
  const css=document.createElement('style');
  css.textContent='#cweb{display:none}#w.ow #cweb{display:flex}'+
   '#cwP{position:fixed;z-index:40;right:calc(10px + env(safe-area-inset-right,0px));top:calc(54px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;padding:10px;border-radius:14px;background:#10131fee;border:1px solid #ffffff2a;color:#fff;max-width:min(270px,60vw);max-height:calc(100% - 70px);overflow:auto}'+
   '#cwP.on{display:flex}#cwP h3{margin:0 0 2px;font:800 12px/1.2 system-ui,sans-serif;letter-spacing:.06em;opacity:.8}'+
   '#cwP button{height:38px;border:0;border-radius:10px;background:#ffffff1f;color:#fff;font:800 12px/1.1 system-ui,sans-serif;padding:0 10px;text-align:left;touch-action:manipulation}'+
   '#cwP button.on{background:#ffb020;color:#1a1204}#cwP button:active{filter:brightness(1.4)}';
  document.head.appendChild(css);
  const P=document.createElement('div');P.id='cwP';
  P.innerHTML='<h3>👧 CEWE</h3><button id="cwK" type="button"></button><button id="cwC" type="button">🎯 TARUH DI TITIK TENGAH LAYAR</button><button id="cwF" type="button">📍 TARUH DI DEPAN SAYA</button><button id="cwR" type="button">⟳ PUTAR 45°</button><button id="cwH" type="button"></button>';
  document.body.appendChild(P);
  ['pointerdown','touchstart'].forEach(n=>P.addEventListener(n,e=>e.stopPropagation()));
  const $=id=>document.getElementById(id);
  const label=()=>{$('cwK').textContent='🧍 KARAKTER (JALAN KAKI): '+(st.cewe?'CEWE':'COWOK');$('cwK').classList.toggle('on',st.cewe);
   $('cwH').textContent=CWE.on?'🙈 SEMBUNYIKAN CEWE':'👁 TAMPILKAN CEWE'};
  label();

  /* tombol pembuka panel: toolbar game + bar atas cinematic */
  const tg=()=>{P.classList.toggle('on');label()};
  const tr=$('tr'),b=document.createElement('button');b.type='button';b.className='tb';b.id='cweb';b.textContent='👧 CEWE';
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();tg()});tr.insertBefore(b,tr.firstChild);
  try{const top=document.querySelector('#cin .cTop');if(top){const c=document.createElement('button');c.type='button';c.className='cB';c.id='cCwe';c.textContent='👧 CEWE';c.onclick=tg;top.insertBefore(c,top.querySelector('.cSp'))}}catch(e){console.error('cCwe',e)}

  /* ---- taruh cewe ---- */
  const put=(x,y,z,th)=>{CWE.on=true;CWE.far=500;CWE.x=x;CWE.y=y;CWE.z=z;CWE.h=th;const g=CWE.obj;g.position.set(x,y,z);g.rotation.y=th;g.visible=true;label()};
  const me=()=>{const T=ow.foot?wk:ow;return{x:T.x,z:T.z,h:T.h}};
  const rc=new THREE.Raycaster(),v2=new THREE.Vector2(0,0);
  const okHit=h=>{const o=h.object;if(!o||o.isSprite||o.isPoints||o.isLine)return false;
   if([].concat(o.material).some(q=>q&&(q.depthWrite===false||(q.transparent&&q.opacity<.5))))return false;
   for(let p=o;p;p=p.parent){if(!p.visible||p===CWE.obj||p===walker)return false}return true};
  const ground=(x,y,z)=>{rc.set(new THREE.Vector3(x,y+3,z),new THREE.Vector3(0,-1,0));rc.far=12;
   const h=rc.intersectObjects(scene.children,true).find(okHit);return h?h.point.y:y};
  $('cwC').onclick=()=>{
   cam.updateMatrixWorld(true);rc.setFromCamera(v2,cam);rc.far=600;
   const hs=rc.intersectObjects(scene.children,true).filter(okHit);
   if(!hs.length)return toast('Arahkan kamera ke tanah dulu');
   const p=hs[0].point,y=ground(p.x,p.y,p.z);
   put(p.x,y,p.z,Math.atan2(cam.position.x-p.x,cam.position.z-p.z));toast('Cewe ditaruh di titik tengah layar')};
  $('cwF').onclick=()=>{const p=me(),x=p.x-Math.sin(p.h)*1.8,z=p.z-Math.cos(p.h)*1.8;
   put(x,typeof gpcGY==='number'?gpcGY:0,z,Math.atan2(p.x-x,p.z-z));toast('Cewe ditaruh di depan kamu')};
  $('cwR').onclick=()=>{CWE.h+=Math.PI/4;CWE.obj.rotation.y=CWE.h};
  $('cwH').onclick=()=>{CWE.on=!CWE.on;CWE.obj.visible=CWE.on;label()};

  /* ---- ganti karakter jalan kaki ---- */
  function swap(on,quiet){
   if(on===st.cewe)return true;
   const gm=walker.userData.gm;
   if(on){
    if(!gm){if(!quiet)toast('Karakter belum siap, coba lagi sebentar');return false}
    const src=CWE.obj.children[0];if(!src||typeof gClone!=='function'){if(!quiet)toast('Model cewe belum dimuat');return false}
    const m2=gClone(src),w=new THREE.Group();w.scale.copy(CWE.obj.scale);w.rotation.y=Math.PI;w.add(m2);
    m2.traverse(o=>{if(o.isSkinnedMesh)o.frustumCulled=false});
    const mx=new THREE.AnimationMixer(m2);
    const own=(CWE.mx&&CWE.mx._actions||[]).map(a=>a._clip).filter(Boolean),lend=(typeof GCH!=='undefined'&&GCH&&GCH.animations)||[];
    const by=(arr,n)=>arr.find(c=>c.name===n);
    const strip=c=>c&&new THREE.AnimationClip(c.name,c.duration,c.tracks.filter(t=>!/\.(position|scale)$/.test(t.name)));
    const usable=c=>!!c&&c.tracks.length>0&&c.tracks.filter(t=>m2.getObjectByName(t.name.split('.')[0])).length>=c.tracks.length*.6;
    const cI=by(own,'Idle')||own[0];
    if(!cI){if(!quiet)toast('Cewe tidak punya animasi');return false}
    const cW0=by(own,'Walk')||strip(by(lend,'Walk')||lend[0]),cR0=by(own,'Run')||strip(by(lend,'Run')||by(lend,'Walk')||lend[0]);
    const cW=usable(cW0)?cW0:cI,cR=usable(cR0)?cR0:cW;
    const A=[cI,cW,cR].map(c=>mx.clipAction(c));let cur=0;A[0].play();
    st.gm0=gm;
    walker.userData.gm=(dt,v)=>{const want=v<.25?0:v<3.6?1:2;
     if(want!==cur){if(A[want]!==A[cur]){A[cur].fadeOut(.2);A[want].reset().fadeIn(.2).play()}cur=want}
     if(A[1]!==A[0])A[1].timeScale=Math.max(.6,Math.min(1.8,v/1.5));
     if(A[2]!==A[1]&&A[2]!==A[0])A[2].timeScale=Math.max(.7,Math.min(1.5,v/4.2));
     mx.update(dt)};
    st.prev=walker.children.filter(c=>c.visible);st.prev.forEach(c=>c.visible=false);walker.add(w);st.w2=w;
    if(!quiet)toast(cW===cI?'Karakter jalan kaki: CEWE (animasi jalan belum cocok, pakai Idle)':'Karakter jalan kaki: CEWE')}
   else{
    if(st.w2)walker.remove(st.w2);(st.prev||[]).forEach(c=>c.visible=true);if(st.gm0)walker.userData.gm=st.gm0;st.w2=null;
    if(!quiet)toast('Karakter jalan kaki: COWOK')}
   st.cewe=on;try{localStorage.setItem('onarCewe',on?'1':'0')}catch(e){}label();return true}
  $('cwK').onclick=()=>swap(!st.cewe);
  /* ingat pilihan terakhir: terapkan otomatis begitu karakter jalan kaki siap */
  let want=false;try{want=localStorage.getItem('onarCewe')==='1'}catch(e){}
  if(want){let n=0;const iv=setInterval(()=>{if(swap(true,true)||++n>40)clearInterval(iv)},1000)}
 }
})();
