/* ===== MOTOR HQ: Honda Vario 150 (GLB asli, tidak dikompres) =====
   Model: "Honda Vario 150 0" oleh seenkonkgrng (CC BY 4.0) - https://sketchfab.com/3d-models/honda-vario-150-0-7092ec8980ff4190845fd441918d89f5
   Gagal dimuat -> tetap pakai model ringan lama (loadVarioLQ). */
let VARIO_ST='Belum dipilih',VARIO_TRI=0;
async function varioFromBuf(buf){
 let gl=await new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no));
 gl.scene.updateMatrixWorld(true);
 const meshes=[];gl.scene.traverse(o=>{if(o.isMesh)meshes.push(o)});
 const AX=[new THREE.Vector3(0,.31,-.72),new THREE.Vector3(0,.30,.90)];
 const FR=new Set(['ban001_4','wheel_front001_54','disk002_16']),RR=new Set(['ban_3','wheel_rear003_55']);
 const g=new THREE.Group(),W=AX.map(a=>{const x=new THREE.Group();x.name='wheel';x.position.copy(a);g.add(x);return x});
 const wheelOf=o=>{for(let p=o;p;p=p.parent){const n=(p.name||'').replace(/\./g,'');if(FR.has(n))return 0;if(RR.has(n))return 1}return -1};
 const rimOf=o=>{for(let p=o;p;p=p.parent){if(/^wheel_(front|rear)/i.test((p.name||'').replace(/\./g,'')))return true}return false}; // VELG = mesh di dalam node wheel_front/wheel_rear (bukan ban / disk)
 const tune=m=>{if(m.metalness!==undefined){m.userData.mo=[m.metalness,m.roughness];m.metalness=Math.min(m.metalness,.3);m.roughness=Math.max(m.roughness,.35)}
  if(/^mika/.test(m.name||'')){m.transparent=true;m.opacity=.45;m.depthWrite=false;m.side=THREE.DoubleSide}m.needsUpdate=true};
 const last=meshes.length-1;
 meshes.forEach((me,i)=>{
  if(i===last&&me.geometry.index&&me.geometry.index.count<=6)return; // bidang datar 2 segitiga (bayangan), dibuang
  const w=wheelOf(me);
  me.matrixWorld.decompose(me.position,me.quaternion,me.scale);
  if(w>=0)me.position.sub(AX[w]);
  if(CPI.has(i))me.userData.cp=1;
  (Array.isArray(me.material)?me.material:[me.material]).forEach(tune);
  {const isArr=Array.isArray(me.material),ms=isArr?me.material:[me.material],rim=rimOf(me),pm=[];let any=false;
   ms.forEach((mt,j)=>{pm[j]=null;if(!mt||!mt.color||!mt.emissive)return;const nm=mt.name||'',key=(rim||(w>=0&&/^ruji/i.test(nm)))?'v':(isBodyMat(mt,nm)?'b':'');
    if(key){const u={k:key,dc:mt.color.toArray(),de:mt.emissive.toArray(),dm:[mt.metalness,mt.roughness]};pm[j]=u;any=true;if(!isArr){me.userData.pk=key;me.userData.dc=u.dc;me.userData.de=u.de;me.userData.dm=u.dm}}});
   if(!isArr&&ms[0]&&ms[0].map&&/speedometer/i.test(ms[0].name||''))me.userData.sp=1;
   if(isArr&&any)me.userData.pm=pm} // REPAINT: tandai BODY & VELG (mendukung multi-material)
  if(me.parent)me.parent.remove(me);
  (w>=0?W[w]:g).add(me)});
 let tri=0;meshes.forEach(m=>{if(m.geometry&&m.geometry.index)tri+=m.geometry.index.count/3});VARIO_TRI=Math.round(tri);
 gl=null;
 rigSteer(g);g.userData.hq=true;g.userData.gnd=true; /* y=0 model = permukaan tanah (telapak ban). Jangan pakai titik terendah model: ada bagian (Object_124) yang menjorok 0,167 di bawah ban -> motor melayang */ custom=g;
 if(P&&P.sk)skin(P,P.sk[0],P.sk[1]);
 if(O&&O.sk)skin(O,O.sk[0],O.sk[1]);
 HB.set()}
// simpan file motor di penyimpanan browser (IndexedDB) supaya cukup dipilih sekali
function idb(){return new Promise((ok,no)=>{const r=indexedDB.open('dmVario',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function idbGet(k){const d=await idb();return new Promise((ok,no)=>{const q=d.transaction('f').objectStore('f').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
async function idbSet(k,v){const d=await idb();return new Promise((ok,no)=>{const t=d.transaction('f','readwrite');t.objectStore('f').put(v,k);t.oncomplete=()=>ok();t.onerror=()=>no(t.error)})}
function varioStatus(t){VARIO_ST=t;const e=document.getElementById('vst');if(e)e.textContent=t}
async function varioLoad(buf,save){
 varioStatus('Memuat motor… (bisa beberapa detik)');
 try{await varioFromBuf(buf);varioStatus('Aktif: Honda Vario 150 asli, '+VARIO_TRI.toLocaleString('id-ID')+' segitiga (motor lama: 250.714)');if(save){try{await idbSet('vario',buf)}catch(e){console.error('idb',e)}}}
 catch(e){console.error('Vario HQ',e);varioStatus('Gagal: '+(e&&e.message||e))}}
function loadVario(){window.__lqP=loadVarioLQ();
 }

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
function gDbg(t){console.log('GLB '+t)}
function gLoad(){if(GCHp)return GCHp;
 GCHp=chB64ToBuf(CHAR_GLB_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  gl.scene.traverse(o=>{if(o.isMesh||o.isSkinnedMesh)o.frustumCulled=false});GCH=gl;gDbg('termuat');
  try{if(custom&&P&&P.sk)skin(P,P.sk[0],P.sk[1])}catch(e){console.error('GCH skin',e)}
  try{gAttachWalker()}catch(e){console.error('GCH walker',e)}
  return gl}).catch(e=>{console.error('GCH',e);gDbg('gagal muat: '+(e&&e.message||e))});
 return GCHp}
function gPT(a,b,cb){cb(a,b);for(let i=0;i<a.children.length;i++)gPT(a.children[i],b.children[i],cb)}
function gClone(src){ // klon model + kerangka (sama seperti SkeletonUtils.clone)
 const sl=new Map(),cl=new Map(),c=src.clone();
 gPT(src,c,(s,d)=>{sl.set(d,s);cl.set(s,d)});
 c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=sl.get(n);n.skeleton=s.skeleton.clone();n.bindMatrix.copy(s.bindMatrix);n.skeleton.bones=s.skeleton.bones.map(b=>cl.get(b));n.bind(n.skeleton,n.bindMatrix)});
 return c}
// Pembalap duduk di motor: kerangka GLB di-pose dengan IK (kaki ke pijakan, tangan ke stang, badan condong sesuai kecepatan)
function gRider(jac){
 if(!GCH)return null;
 try{
  const V=THREE.Vector3,Q=THREE.Quaternion,X=new V(1,0,0);
  const g=new THREE.Group();g.name='rider';
  const m=gClone(GCH.scene),w=new THREE.Group();w.rotation.y=Math.PI;w.add(m);g.add(w);
  const B={};m.traverse(o=>{if(o.name)B[o.name]=o});
  ['Hips','Head','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand'].forEach(n=>{if(!B[n])throw new Error('bone '+n)});
  const upd=()=>g.updateMatrixWorld(true),gp=(o,v)=>g.worldToLocal(o.getWorldPosition(v||new V()));
  upd();
  const topY=()=>B.HeadTop_End?gp(B.HeadTop_End).y:gp(B.Head).y+(gp(B.Head).y-gp(B.Neck||B.Hips).y)*1.6,span=topY()-gp(B.Hips).y;w.scale.setScalar(.77/span);upd();
  const HIP=new V(0,.745,.25),hp=gp(B.Hips);w.position.set(HIP.x-hp.x,HIP.y-hp.y,HIP.z-hp.z);upd();
  const rest=[];m.traverse(o=>{if(o.isBone)rest.push([o,o.quaternion.clone()])});
  const ln=(a,b)=>gp(a).distanceTo(gp(b));if(!isFinite(span)||span<=0)throw new Error('span '+span);
  const LEN={L:[ln(B.LeftUpLeg,B.LeftLeg),ln(B.LeftLeg,B.LeftFoot)],R:[ln(B.RightUpLeg,B.RightLeg),ln(B.RightLeg,B.RightFoot)],
   AL:[ln(B.LeftArm,B.LeftForeArm),ln(B.LeftForeArm,B.LeftHand)],AR:[ln(B.RightArm,B.RightForeArm),ln(B.RightForeArm,B.RightHand)]};
  const sL0=gp(B.LeftUpLeg).x<0?-1:1; // sisi kiri model ada di x negatif atau positif (dilihat dari ruang rider)
  const eye=new THREE.Object3D();B.Head.add(eye);
  {const h=gp(B.Head),e=new V(h.x,h.y+(topY()-h.y)*.55,h.z-.08);eye.position.copy(B.Head.worldToLocal(g.localToWorld(e)))}
  const eyeBase=eye.position.clone(),hs={v:1};
  function rotG(b,dq){upd();const G=g.getWorldQuaternion(new Q()),Gi=G.clone().invert();
   const bq=Gi.clone().multiply(b.getWorldQuaternion(new Q())),nq=dq.clone().multiply(bq),pq=Gi.clone().multiply(b.parent.getWorldQuaternion(new Q()));
   b.quaternion.copy(pq.invert().multiply(nq))}
  function aim(b,c,t){upd();const bp=gp(b),cp=gp(c).sub(bp).normalize(),ds=t.clone().sub(bp).normalize();rotG(b,new Q().setFromUnitVectors(cp,ds))}
  function limb(u,mi,e,t,pole,l1,l2){upd();const A=gp(u),d=t.clone().sub(A);let L=d.length();
   L=Math.min((l1+l2)*.995,Math.max(Math.abs(l1-l2)*1.01+.001,L));d.normalize();
   const a=(l1*l1-l2*l2+L*L)/(2*L),h=Math.sqrt(Math.max(0,l1*l1-a*a)),p=pole.clone().addScaledVector(d,-pole.dot(d)).normalize();
   const knee=A.clone().addScaledVector(d,a).addScaledVector(p,h);
   aim(u,mi,knee);aim(mi,e,A.clone().addScaledVector(d,L))}
  const base=w.position.clone(),HB=.09,GRIP={x:.29,y:.86,z:-.30}; // GRIP = posisi pergelangan tangan di grip gas/stang Honda Vario (koordinat motor ternormalisasi: x kiri-kanan, y tinggi, z depan = negatif) // HB = seberapa jauh tangan ditarik ke belakang saat bungkuk (naikkan kalau masih kurang mundur)
  const sm=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)},lr=(p,q,t)=>p+(q-p)*t;
  const FING=['Index','Middle','Ring','Pinky'],CURL=[.6,.75,.5],THUMB=[.35,.3,.25];
  function curl(n){upd();const Xc=g.userData.xs||X;if(g.userData.rq)rotG(B[n+'Hand'],g.userData.rq);rotG(B[n+'Hand'],new Q().setFromAxisAngle(Xc,-.25)); // telapak sedikit turun mengikuti grip
   FING.forEach(f=>CURL.forEach((a,i)=>{const b=B[n+'Hand'+f+(i+1)];if(b)rotG(b,new Q().setFromAxisAngle(Xc,-a))}));
   THUMB.forEach((a,i)=>{const b=B[n+'HandThumb'+(i+1)];if(b)rotG(b,new Q().setFromAxisAngle(Xc,-a))})}
  const _sq0=new Q();let _an=0,_stS=null;
  // stang berputar pada sumbu garpu (S.quaternion). Tangan memakai rotasi YANG SAMA dengan stang, diambil langsung dari objek stang.
  const stPrep=fac=>{_an=0;_stS=null;g.userData.rq=null;g.userData.xs=null;const t=g.userData.str,S=t&&t.S;if(!S||!S.parent||!S.userData||!S.userData.ax)return;
   _sq0.set(0,0,0,1).slerp(S.quaternion,Math.max(0,Math.min(1,fac)));const an=2*Math.acos(Math.min(1,Math.abs(_sq0.w)));if(!(an>.002))return;
   g.updateWorldMatrix(true,false);S.parent.updateWorldMatrix(true,false);_an=an;_stS=S;
   const G=g.getWorldQuaternion(new Q()),Pq=S.parent.getWorldQuaternion(new Q()),R=G.clone().invert().multiply(Pq).multiply(_sq0).multiply(Pq.clone().invert()).multiply(G);
   g.userData.rq=R;g.userData.xs=X.clone().applyQuaternion(R)};
  const stv=v=>{if(!_an||!_stS)return v;const S=_stS,p=S.parent.worldToLocal(g.localToWorld(v.clone())).sub(S.position).applyQuaternion(_sq0).add(S.position);return g.worldToLocal(S.parent.localToWorld(p))};
  g.userData.pose=(k,s,f)=>{
   s=s||0;
   // transisi bertahap: badan tiarap dulu (0-55%), kaki terangkat & lurus ke belakang menyusul (30-100%), siku melebar (0-80%)
   const sT=sm(s/.55),sL=sm((s-.3)/.7),sA=sm(s/.8);stPrep(1);
   // TARGET TANGAN: HAND_BACK = tangan ditarik mundur ke arah badan saat tegak/bungkuk; SUP_UP/SUP_BACK = posisi grip gas saat superman (naik & mendekat kepala)
   const HAND_BACK=.03,SUP_UP=0,SUP_BACK=0,HT=sx=>stv(new V(sx*GRIP.x,GRIP.y+SUP_UP*sT,GRIP.z+HAND_BACK*(1-sT)+SUP_BACK*sT),1-sT);
   rest.forEach(([o,q])=>o.quaternion.copy(q));
   w.position.set(base.x,base.y+.075*sT,base.z+.27*sT); // pinggul bergeser ke belakang & sedikit naik saat tiarap
   const th=lr(.42+k*.45,1.45,sT);g.userData.th=th;
   rotG(B.Hips,new Q().setFromAxisAngle(X,-th));
   // punggung melengkung sedikit, leher & kepala mendongak (dangak) menatap ke depan saat superman
   const spB=B.Spine2||B.Spine1||B.Spine;
   if(spB&&sT>0)rotG(spB,new Q().setFromAxisAngle(X,.2*sT));
   if(B.Neck&&sT>0)rotG(B.Neck,new Q().setFromAxisAngle(X,.5*sT));
   rotG(B.Head,new Q().setFromAxisAngle(X,th*lr(.75,1,sT)-(B.Neck?.3:.0)*sT+(B.Neck?0:.15*sT)));
   if(g.userData.hy)rotG(B.Head,new Q().setFromAxisAngle(new V(0,1,0),g.userData.hy)); // NENGOK: kepala berputar kiri/kanan sesuai arah pandang POV pemain
   const kc=Math.max(0,Math.min(1,k))*(1-sT); // 0..1 seberapa bungkuk
   // ---- KAKI: f={l,r,rv,ph} -> l/r = seberapa turun menapak aspal (kiri/kanan), rv = intensitas memundurkan motor, ph = fase langkah ----
   const F=f||{l:0,r:0,rv:0,ph:0};
   const FT=(n,sx)=>{const dn=(n==='Left'?F.l:F.r)*(1-sL);
    const peg=new V(lr(sx*.12,sx*.11,sL)+sx*.14*Math.sin(Math.PI*sL),lr(.26,1.05,sL*sL),lr(-.08,1.1,sL));
    if(dn<=.001)return peg;
    let gz=-.04,gy=.065;
    if(F.rv>.001){ // melangkah bergantian: kaki menapak aspal bergerak ke depan (motor terdorong mundur), lalu terangkat & kembali ke belakang
     const u=(((F.ph+(n==='Left'?0:.5))%1)+1)%1,A=.13;let z0,lf=0;
     if(u<.6)z0=A*(1-2*u/.6);else{const t=(u-.6)/.4;z0=-A+2*A*sm(t);lf=.1*Math.sin(Math.PI*t)}
     gz+=z0*F.rv;gy+=lf*F.rv}
    return peg.lerp(new V(sx*.27,gy,gz),dn)};
   // jangkauan kaki: kalau kaki tidak sampai aspal, pinggul diturunkan sedikit
   upd();let lneed=0;
   [['Left',sL0,'L'],['Right',-sL0,'R']].forEach(([n,sx,lk])=>{if((n==='Left'?F.l:F.r)<.5)return;const dd=gp(B[n+'UpLeg']).distanceTo(FT(n,sx)),rc=(LEN[lk][0]+LEN[lk][1])*.985;if(dd>rc)lneed=Math.max(lneed,dd-rc)});
   if(lneed>0){w.position.y-=Math.min(.08,lneed*1.1);upd()}
   // jangkauan: kalau lengan tidak sampai ke grip, badan dimajukan sedikit supaya tangan tetap menempel di grip
   upd();let need=0;
   [['Left',sL0,'AL'],['Right',-sL0,'AR']].forEach(([n,sx,ak])=>{const d=gp(B[n+'Arm']).distanceTo(HT(sx)),rc=(LEN[ak][0]+LEN[ak][1])*.93;if(d>rc)need=Math.max(need,d-rc)});
   if(need>0){w.position.z-=Math.min(.14,need*1.2);upd()}
   [['Left',sL0,'L','AL'],['Right',-sL0,'R','AR']].forEach(([n,sx,lk,ak])=>{
    // kaki: dari pijakan -> ayun keluar melewati samping jok -> lurus terangkat di belakang
    const ank=FT(n,sx);
    const pole=new V(sx*lr(.25,.2,sL),lr(.3,-1,sL),lr(-1,.1,sL));
    limb(B[n+'UpLeg'],B[n+'Leg'],B[n+'Foot'],ank,pole,LEN[lk][0],LEN[lk][1]);
    if(B[n+'ToeBase'])aim(B[n+'Foot'],B[n+'ToeBase'],ank.clone().add(new V(0,lr(lr(.01,-.03,(n==='Left'?F.l:F.r)),-.05,sL),lr(-.15,.15,sL))));
    // tangan: tetap di stang; saat bungkuk ditarik ke belakang (HB), siku melebar saat superman
    limb(B[n+'Arm'],B[n+'ForeArm'],B[n+'Hand'],HT(sx),new V(sx*lr(.7,1,sA),lr(-.6,.15,sA),lr(.5,.2,sA)),LEN[ak][0],LEN[ak][1]);curl(n)});
  };
  // Jangkar kamera POV: posisi kepala dengan kemiringan badan dikunci ke sudut acuan 'ref' (rotasi sumbu X dari pinggul), sehingga kamera tetap di tempat yang sama saat duduk tegak maupun menunduk
  g.userData.povAnchor=ref=>{upd();return gp(B.Head)}; // kamera POV = sendi leher (pangkal kepala) yang asli
  g.userData.head=eye;g.userData.jac=jac;g.userData.povHide=()=>[];
  // POV: kepala (+rambut, mata, rahang) disembunyikan supaya kamera tidak menembus kepala; badan, bahu, lengan, tangan, kaki tetap terlihat
  g.userData.povHead=on=>{const v=on?.001:1;if(hs.v===v)return;hs.v=v;B.Head.scale.setScalar(v);eye.position.copy(eyeBase).divideScalar(v)};
  g.userData.pose(0);
  return g
 }catch(e){console.error('gRider',e);gDbg('rider: '+(e&&e.message||e));return null}}
// Karakter berjalan (saat turun dari motor): animasi Idle / Walk / Run bawaan file GLB
function gAttachWalker(){
 if(!GCH||walker.userData.gm)return;
 const m=gClone(GCH.scene),w=new THREE.Group();w.rotation.y=Math.PI;w.add(m);
 const B={};m.traverse(o=>{if(o.name)B[o.name]=o});
 const g=new THREE.Group();g.add(w);g.updateMatrixWorld(true);
 const top=g.worldToLocal(B.HeadTop_End?B.HeadTop_End.getWorldPosition(new THREE.Vector3()):new THREE.Vector3(0,1.8,0)).y;
 w.scale.setScalar(1.78/Math.max(.5,top));
 const an=GCH.animations,F=n=>THREE.AnimationClip.findByName(an,n)||an[0];
 const mx=new THREE.AnimationMixer(m),ac=[F('Idle'),F('Walk'),F('Run')].map(c=>mx.clipAction(c));
 let cur=0;ac[0].play();
 walker.children.forEach(c=>c.visible=false);walker.add(w);
 walker.userData.gm=(dt,v)=>{const want=v<.25?0:v<3.6?1:2;
  if(want!==cur){ac[cur].fadeOut(.2);ac[want].reset().fadeIn(.2).play();cur=want}
  ac[1].timeScale=Math.max(.6,Math.min(1.8,v/1.5));ac[2].timeScale=Math.max(.7,Math.min(1.5,v/4.2));mx.update(dt)}}
(function(){try{const im=document.getElementById('lgImg'),sh=document.getElementById('lgShine');if(!im||!sh)return;const u='url("'+im.src+'")';sh.style.webkitMaskImage=u;sh.style.maskImage=u;sh.style.display='block'}catch(e){}})();
/* ===== LED VIDEO WALL (model GLB led_video_wall.glb, byte asli tidak diubah) =====
   Layar 3 m x 2,2 m, tinggi total ~2,4 m. Dipasang di koordinat dunia X -23.7, Z -43.9.
   Ubah LEDW.x / LEDW.z / LEDW.rdeg / LEDW.s untuk geser, putar (derajat), atau perbesar. rdeg 90 = layar menghadap arah +X (ke arah pemain berdiri di X -19.8); 270 = menghadap -X. */
window.LEDW={x:-23.7,z:-43.9,rdeg:90,s:5};
chB64ToBuf(LED_GLB_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
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
if(BBD.on)chB64ToBuf(BBD_GLB_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
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
const HRW_GLB_B64=__BIG[18];
window.HRW={x:16.3,z:-90.4,rdeg:90,s:1};
chB64ToBuf(HRW_GLB_B64).then(buf=>{
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
const VARIO_FIX4_GZ_B64=__BIG[19];
(async()=>{try{
 if(!window.VARIO_HQ_ON)return;
 await Promise.resolve(window.__lqP).catch(()=>{});
 let stream;
 try{stream=(await fetch('data:application/gzip;base64,'+VARIO_FIX4_GZ_B64)).body}
 catch(e){const bin=atob(VARIO_FIX4_GZ_B64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);stream=new Blob([u]).stream()}
 const ab=await new Response(stream.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 await varioLoad(ab,false);
}catch(e){console.error('Vario fix4',e);try{varioStatus('Gagal: '+(e&&e.message||e))}catch(_){}}})();
hqInit();
gLoad();
/* start game loop (dulu di js/openworld.js) */
requestAnimationFrame(loop);
