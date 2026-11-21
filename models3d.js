/* ===== MOTOR HQ: Honda Vario 150 (GLB asli, tidak dikompres) =====
   Model: "Honda Vario 150 0" oleh seenkonkgrng (CC BY 4.0) - https://sketchfab.com/3d-models/honda-vario-150-0-7092ec8980ff4190845fd441918d89f5
   Gagal dimuat -> tetap pakai model ringan lama (loadVarioLQ). */
let VARIO_ST='Belum dipilih',VARIO_TRI=0;

// simpan file motor di penyimpanan browser (IndexedDB) supaya cukup dipilih sekali







/* ===== HOME SHOWROOM: motor 3D + kamera sinematik pelan ===== */
// Sudut awal kamera: Math.PI = lihat dari depan motor. Kalau yang tampil malah belakang motor, ganti ke 0.
const HB_FRONT=Math.PI;
const HB={cv:$('homeBike'),bike:null,t:0,last:0,w:0,h:0,set(){}};
(function(){try{
 const r=new THREE.WebGLRenderer({canvas:HB.cv,alpha:true,antialias:true});
 r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.2;r.setClearColor(0,0);
 const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1.4,.1,60);
 sc.add(new THREE.HemisphereLight(0x8fa4d8,0x120f14,.9));
 const L=(c,i,x,y,z)=>{const d=new THREE.DirectionalLight(c,i);d.position.set(x,y,z);sc.add(d)};
 L(0xffe2b8,1.6,-3,4,3);L(0xff8a2a,2,3.5,2.2,-3.5);L(0x3b8cff,1.6,-4,1.8,-3);
 const fl=new THREE.PointLight(0xffb060,1.1,12);fl.position.set(0,.4,2.5);sc.add(fl);
 // lantai: cahaya oranye, bayangan, cincin
 const gt=ctex(256,256,(g,w,h)=>{const q=g.createRadialGradient(128,128,10,128,128,128);q.addColorStop(0,'rgba(210,220,255,.16)');q.addColorStop(.55,'rgba(210,220,255,.06)');q.addColorStop(1,'rgba(210,220,255,0)');g.fillStyle=q;g.fillRect(0,0,w,h)});
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(7,7),new THREE.MeshBasicMaterial({map:gt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.rotation.x=-Math.PI/2;glow.position.y=.004;/* glow lantai dihapus */
 const st2=ctex(128,128,(g,w,h)=>{const q=g.createRadialGradient(64,64,4,64,64,64);q.addColorStop(0,'rgba(0,0,0,.85)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,w,h)});
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.9),new THREE.MeshBasicMaterial({map:st2,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.008;sc.add(sh);
 const ring=new THREE.Mesh(new THREE.RingGeometry(2.1,2.14,96),new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.5,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.01;/* cincin dihapus */
 // percikan api melayang pelan
 const N=70,pp=new Float32Array(N*3);for(let i=0;i<N;i++){pp[i*3]=(Math.random()-.5)*7;pp[i*3+1]=Math.random()*3;pp[i*3+2]=(Math.random()-.5)*7}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
 sc.add(new THREE.Points(pg,new THREE.PointsMaterial({map:glowT,color:0xffa84a,size:.14,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending})));
 HB.set=function(){try{if(HB.bike)sc.remove(HB.bike);
  const ps=playerSrc(),b=ps?norm(ps):procBike('#ff9a1f','#7a1c1c');if(ps&&(ps.userData.hq||ps.userData.lq))envBike(b,r,1);paintApply(b);b.traverse(o=>o.layers.set(0));sc.add(b);HB.bike=b;HB.cv.classList.add('on')}catch(e){console.error(e)}};
 // ---- gestur: 1 jari putar, 2 jari cubit zoom + geser, ketuk 2x reset, scroll mouse zoom. Kamera sinematik tetap jalan (offset ditambahkan di atasnya) ----
 const T={yaw:0,el:0,zoom:1,px:0,py:0},U={yaw:0,el:0,zoom:1,px:0,py:0},ptr=new Map(),cl=(v,a,b)=>Math.max(a,Math.min(b,v));let g0=null,lastTap=0;
 const hint=document.createElement('div');hint.className='hbHint';hint.textContent='GESER PUTAR · CUBIT ZOOM · KETUK 2× RESET';$('home').appendChild(hint);
 const inCv=(x,y)=>{if(!HB.cv.clientWidth)return false;const c=HB.cv.getBoundingClientRect();return x>=c.left&&x<=c.right&&y>=c.top&&y<=c.bottom};
 const gsnap=()=>{const a=[...ptr.values()];g0=a.length>=2?{d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2}:null};
 $('home').addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('button'))return;if(ptr.size>=2||!inCv(e.clientX,e.clientY))return;
  ptr.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:performance.now()});gsnap();hint.classList.add('off')});
 addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptr.size===1){T.yaw-=dx*.008;T.el=cl(T.el+dy*.012,-.5,3.2)}
  else if(g0){const a=[...ptr.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,mx=(a[0].x+a[1].x)/2,my=(a[0].y+a[1].y)/2,k=2*(HB.D||4)*Math.tan(cam.fov*Math.PI/360)/Math.max(1,HB.h);
   T.zoom=cl(T.zoom*g0.d/d,.3,1.7);T.px=cl(T.px-(mx-g0.mx)*k,-1.5,1.5);T.py=cl(T.py+(my-g0.my)*k,-.9,1.2);g0={d,mx,my}}});
 const up=e=>{const p=ptr.get(e.pointerId);if(!p)return;ptr.delete(e.pointerId);gsnap();const n=performance.now();
  if(Math.hypot(e.clientX-p.x0,e.clientY-p.y0)<10&&n-p.t0<300){if(n-lastTap<350){U.yaw=((U.yaw%6.2832)+9.4248)%6.2832-3.1416;T.yaw=T.el=T.px=T.py=0;T.zoom=1;lastTap=0}else lastTap=n}};
 addEventListener('pointerup',up);addEventListener('pointercancel',up);
 addEventListener('wheel',e=>{if(inCv(e.clientX,e.clientY)){T.zoom=cl(T.zoom*Math.exp(e.deltaY*.0012),.3,1.7);hint.classList.add('off')}},{passive:true});
 function loop(n){requestAnimationFrame(loop);
  if(document.hidden||!HB.bike||!HB.cv.clientWidth)return;if(HB.last&&n-HB.last<30)return;
  const w=HB.cv.clientWidth,h=HB.cv.clientHeight;
  if(w!==HB.w||h!==HB.h){HB.w=w;HB.h=h;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  const dt=HB.last?Math.min(.05,(n-HB.last)/1000):0;HB.last=n;HB.t+=dt;const t=HB.t;
  // kamera sinematik: intro dolly-in, lalu mengayun pelan di sekitar motor
  const e=Math.min(1,t/3.5),e2=e*e*(3-2*e),fit=Math.max(1,1.45/cam.aspect);
  const kk=Math.min(1,dt*9);for(const q in T)U[q]+=(T[q]-U[q])*kk;HB.h=h;
  const a=HB_FRONT+Math.sin(t*.11)*1.05+(1-e2)*.9+U.yaw,D=(4.3+Math.sin(t*.07+1.2)*.45+(1-e2)*1.2)*fit*U.zoom;HB.D=D;
  const rx=Math.cos(a)*U.px,rz=-Math.sin(a)*U.px;
  cam.position.set(Math.sin(a)*D+Math.sin(t*.9)*.012+rx,Math.max(.12,.85+Math.sin(t*.1+.6)*.28+(1-e2)*.3+Math.sin(t*1.3+2)*.01+U.el+U.py),Math.cos(a)*D+rz);
  cam.lookAt(Math.sin(t*.05)*.12+rx,.55+Math.sin(t*.09)*.05+U.py,rz);
  cam.fov=30+Math.sin(t*.06)*2.5;cam.updateProjectionMatrix();
  const pa=pg.attributes.position;for(let i=0;i<N;i++){let y=pa.array[i*3+1]+dt*(.08+(i%3)*.05);if(y>3.2)y=0;pa.array[i*3+1]=y;pa.array[i*3]+=Math.sin(t*.4+i)*dt*.03}pa.needsUpdate=true;
  ring.rotation.z=t*.05;r.render(sc,cam)}
 requestAnimationFrame(loop);
}catch(e){console.error('HB',e)}})();
loadVario();
if(VEHSEL==='vario_mod')ensureModG().then(()=>{try{if(P&&P.sk)skin(P,P.sk[0],P.sk[1]);HB.set()}catch(e){console.error(e)}}).catch(e=>console.error('Vario Mod',e));
/* ===== KARAKTER GLB DI DALAM GAME (rider + pejalan) =====
   Memakai file GLB yang sama dengan menu KARAKTER (CHAR_GLB_B64, byte asli, tidak dikompres).
   Gagal dimuat -> otomatis pakai model kotak lama. */
let GCH=null,GCHp=null;




// Pembalap duduk di motor: kerangka GLB di-pose dengan IK (kaki ke pijakan, tangan ke stang, badan condong sesuai kecepatan)

// Karakter berjalan (saat turun dari motor): animasi Idle / Walk / Run bawaan file GLB

(function(){try{const im=document.getElementById('lgImg'),sh=document.getElementById('lgShine');if(!im||!sh)return;const u='url("'+im.src+'")';sh.style.webkitMaskImage=u;sh.style.maskImage=u;sh.style.display='block'}catch(e){}})();
/* ===== LED VIDEO WALL (model GLB led_video_wall.glb, byte asli tidak diubah) =====
   Layar 3 m x 2,2 m, tinggi total ~2,4 m. Dipasang di koordinat dunia X -23.7, Z -43.9.
   Ubah LEDW.x / LEDW.z / LEDW.rdeg / LEDW.s untuk geser, putar (derajat), atau perbesar. rdeg 90 = layar menghadap arah +X (ke arah pemain berdiri di X -19.8); 270 = menghadap -X. */
window.LEDW={x:-23.7,z:-43.9,rdeg:90,s:5};
chB64ToBuf(typeof LED_GLB_B64!=='undefined'?LED_GLB_B64:null,'led_video_wall.glb').then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
 const m=gl.scene;
 /* KEBAL CAHAYA (hanya LAYAR): material 'screen' diganti MeshBasicMaterial -> tidak terpengaruh lampu, bayangan, refleksi/specular, clearcoat.
   Rangka/kabinet/baut tetap material asli. Kecerahan layar tetap = LEDW.bright. */
 LEDW.bright=LEDW.bright||1.3;
 m.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=true;
  const conv=q=>{if(!q||q.name!=='screen'||!q.emissiveMap)return q;
   /* TAJAM dari jauh: anisotropy maksimum + mipmap trilinear + LOD bias negatif (pilih mip lebih tajam). */
   const tx=q.emissiveMap;try{tx.anisotropy=Math.max(tx.anisotropy||1,renderer.capabilities.getMaxAnisotropy());tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;tx.generateMipmaps=true;tx.needsUpdate=true}catch(e){}
   const nb=new THREE.MeshBasicMaterial({name:'screen',side:q.side,map:tx});
   nb.color.setScalar(LEDW.bright);nb.toneMapped=false;
   nb.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 texelColor=texture2D(map,vUv,-1.6);\n texelColor=mapTexelToLinear(texelColor);\n diffuseColor*=texelColor;\n#endif')};
   nb.customProgramCacheKey=()=>'ledSharp';return nb};
  o.material=Array.isArray(o.material)?o.material.map(conv):conv(o.material);
  if([].concat(o.material).some(q=>q&&q.name==='screen')){o.castShadow=false;o.receiveShadow=false}});
 const g=new THREE.Group();g.add(m);
 let y=0;try{y=gpcH(LEDW.x,LEDW.z)||0}catch(e){}
 g.position.set(LEDW.x,y,LEDW.z);g.rotation.y=LEDW.rdeg*Math.PI/180;g.scale.setScalar(LEDW.s);
 owG.add(g);window.LED_OBJ=g;
}).catch(e=>console.error('LED WALL GLB',e));
/* ===== BILLBOARD ONAR SIMULATOR (model GLB billboard_onar_simulator-edited.glb, byte asli tidak diubah) =====
   Tinggi ~6,1 m, lebar ~3,5 m, 1 tiang. Dipasang tepat di depan titik X -23.9, Z -32.7 (H 271) sejauh 15 m, layar menghadap pemain.
   Ubah BBD.x / BBD.z untuk geser, BBD.rdeg untuk putar (derajat; 270 = layar menghadap -X, 90 = menghadap +X), BBD.s untuk skala. BBD.on=false untuk menyembunyikan. */
window.BBD={on:true,x:-26.5,z:-34.0,rdeg:0,s:1}; /* di samping LED wall (ujung sisi +z), layar menghadap +Z = ke arah jalan aspal */
if(BBD.on)chB64ToBuf(typeof BBD_GLB_B64!=='undefined'?BBD_GLB_B64:null,'billboard_onar_simulator.glb').then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
 const m=gl.scene;
 m.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=true;[].concat(o.material).forEach(q=>{if(!q)return;
  if(q.name==='screen'){q.emissive=new THREE.Color(0xffffff);q.emissiveIntensity=.95}
  else if(q.name==='lens'){q.emissiveIntensity=1.4}
  else if(q.color&&!q.transparent){q.emissive=q.color.clone().multiplyScalar(.35)}
  q.needsUpdate=true})});
 const g=new THREE.Group();g.add(m);
 let y=0;try{y=gpcH(BBD.x,BBD.z)||0}catch(e){}
 g.position.set(BBD.x,y,BBD.z);g.rotation.y=BBD.rdeg*Math.PI/180;g.scale.setScalar(BBD.s);
 owG.add(g);window.BBD_OBJ=g;
 (window.GP_POLES=window.GP_POLES||[]).push([BBD.x,BBD.z]); // tiang billboard bisa ditabrak
}).catch(e=>console.error('BILLBOARD GLB',e));
/* ===== HALTE RAWASARI (model GLB halte_rawasari-edited.glb, byte asli tidak diubah) =====
   Panjang ~22,8 m (sumbu panjang searah jalan), dalam ~3 m, tinggi ~5,7 m. Titik tengah di X 16.3, Z -90.4 (trotoar kiri jalan utama).
   Ubah HRW.x / HRW.z / HRW.rdeg / HRW.s untuk geser, putar (derajat), atau skala. rdeg 90 = sisi depan (fasad berlian) menghadap +X (ke arah jalan); 270 = sebaliknya. */
const HRW_GLB_B64=(typeof __BIG!=='undefined'?__BIG:[])[18];
window.HRW={x:16.3,z:-90.4,rdeg:90,s:1};
chB64ToBuf(HRW_GLB_B64,'halte_rawasari.glb').then(buf=>{
 // kekuatan emissive per material dibaca dari JSON GLB (three r128 belum mengenal KHR_materials_emissive_strength)
 const st={};try{const dv=new DataView(buf),n=dv.getUint32(12,true),js=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,n)));
  (js.materials||[]).forEach(m=>{const e=m.extensions&&m.extensions.KHR_materials_emissive_strength;if(e&&m.name)st[m.name]=e.emissiveStrength})}catch(e){}
 return new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',gl=>ok([gl,st]),no))}).then(([gl,st])=>{
 const m=gl.scene;m.updateMatrixWorld(true);
 m.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=true;[].concat(o.material).forEach(q=>{if(!q)return;
  if(st[q.name]!=null)q.emissiveIntensity=st[q.name];
  if(q.map&&!q.emissiveMap&&!q.transparent){q.emissiveMap=q.map;q.emissive=new THREE.Color(0xffffff);q.emissiveIntensity=.5}
  q.needsUpdate=true})});
 const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3());
 m.position.set(-c.x,-bb.min.y,-c.z);
 const g=new THREE.Group();g.add(m);
 let y=0;try{y=gpcH(HRW.x,HRW.z)||0}catch(e){}
 g.position.set(HRW.x,y,HRW.z);g.rotation.y=HRW.rdeg*Math.PI/180;g.scale.setScalar(HRW.s);
 owG.add(g);window.HRW_OBJ=g;
}).catch(e=>console.error('HALTE RAWASARI GLB',e));
/* ===== MOTOR UTAMA: Honda Vario 150 "speedometer baru fix4" (GLB asli, 900.574 segitiga) =====
   Model: "Honda Vario 150 0" oleh seenkonkgrng (CC BY 4.0) - https://sketchfab.com/3d-models/honda-vario-150-0-7092ec8980ff4190845fd441918d89f5
   File honda_vario_150_speedometer_baru_fix4.glb disimpan UTUH di bawah (hanya dikompres gzip tanpa kehilangan data, dibuka lagi saat game jalan).
   Game mulai dengan motor ringan dulu, lalu otomatis diganti motor ini begitu selesai dimuat. Gagal dimuat -> tetap pakai motor ringan.
   Matikan dengan VARIO_HQ_ON=false kalau HP terasa berat. */
window.VARIO_HQ_ON=true;
const VARIO_FIX4_GZ_B64=(typeof __BIG!=='undefined'?__BIG:[])[19];
/* Cadangan: kalau data tertanam (__BIG[19]) kosong/rusak/bergeser, motor dimuat dari file models/vario_fix4.glb.gz di repo. */
(async()=>{try{
 if(!window.VARIO_HQ_ON)return;
 await Promise.resolve(window.__lqP).catch(()=>{});
 const okGlb=b=>!!b&&b.byteLength>1000&&new DataView(b).getUint32(0,true)===0x46546C67;
 const unz=st=>new Response(st.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 let ab=null,why='';
 if(typeof VARIO_FIX4_GZ_B64==='string'&&VARIO_FIX4_GZ_B64.length>1000){
  try{let stream;
   try{stream=(await fetch('data:application/gzip;base64,'+VARIO_FIX4_GZ_B64)).body}
   catch(e){const bin=atob(VARIO_FIX4_GZ_B64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);stream=new Blob([u]).stream()}
   ab=await unz(stream)}catch(e){why='data tertanam: '+(e&&e.message||e)}
  if(!okGlb(ab)){ab=null;why=why||'data tertanam bukan GLB'}}
 else why='data tertanam kosong (__BIG[19])';
 if(!ab){console.warn('Vario fix4: '+why+' -> coba muat dari folder models');
  /* Web: models/vario_fix4.glb.gz. APK: workflow memampatkan ulang .gz jadi .gz.gz, jadi coba dua nama dan buka kompresi sampai ketemu GLB (maks. 3 lapis). */
  const urls=['models/vario_fix4.glb.gz','models/vario_fix4.glb.gz.gz'],errs=[];
  for(const u of urls){try{const r=await fetch(u);if(!r.ok){errs.push(u+' HTTP '+r.status);continue}
    let raw=await r.arrayBuffer();for(let k=0;k<3&&!okGlb(raw);k++)raw=await unz(new Blob([raw]).stream());
    if(okGlb(raw)){ab=raw;break}errs.push(u+' bukan GLB')}catch(e){errs.push(u+': '+(e&&e.message||e))}}
  if(!ab)throw new Error('gagal dari folder models ['+errs.join('; ')+'] ('+why+')')}
 await varioLoad(ab,false);
}catch(e){console.error('Vario fix4',e);try{varioStatus('Gagal: '+(e&&e.message||e))}catch(_){}}})();
hqInit();
gLoad();
/* start game loop (dulu di js/openworld.js) */
requestAnimationFrame(loop);
