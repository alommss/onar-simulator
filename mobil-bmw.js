/* ===== BMW M3 2007 + CEWE (ANIMASI IDLE) =====
   Model: models/bmw_m3_2007.glb dan models/tobrut_animated.glb (byte asli, tidak diubah).
   BMW.x, BMW.z   = titik tengah mobil di dunia (koordinat HUD: X 7.1  Z 43.0)
   BMW.hdeg       = arah hadap depan mobil (derajat, sama seperti H di HUD). 183 = depan mobil menghadap ke arah pemain yang datang dari H 3.
   BMW.y          = tinggi alas (0 = aspal/lantai dasar).  BMW.on=false untuk menyembunyikan.
   CWE.beside     = jarak cewe ke KIRI mobil (meter dari sumbu mobil), CWE.along = geser maju (+) / mundur (-) searah mobil.
   CWE.tinggi     = tinggi cewe (meter).  CWE.hdeg = arah hadap cewe (null = sama dengan mobil).
   Keduanya ada tabrakan (kotak/lingkaran) dan hanya digambar bila dekat (BMW.far / CWE.far meter) supaya FPS aman. */
(function(){
'use strict';
if(typeof owG==='undefined'||typeof chB64ToBuf!=='function'||typeof THREE==='undefined')return;
const D2R=Math.PI/180;
const BMW=window.BMW={on:true,x:7.1,z:43.0,y:0,hdeg:183,hl:2.3,hw:.95,far:260};
const CWE=window.CWE={on:true,beside:1.75,along:.3,y:0,tinggi:1.68,hdeg:null,far:90,r:.32};
const ch=BMW.hdeg*D2R,fwd=[-Math.sin(ch),-Math.cos(ch)],left=[-Math.cos(ch),Math.sin(ch)]; /* depan & kiri mobil di dunia */
BMW.h=ch+Math.PI; /* model menghadap +z, jadi + PI supaya depan mobil searah H (sama seperti mobil polisi) */
CWE.x=BMW.x+left[0]*CWE.beside+fwd[0]*CWE.along;CWE.z=BMW.z+left[1]*CWE.beside+fwd[1]*CWE.along;
CWE.h=(CWE.hdeg==null?BMW.hdeg:CWE.hdeg)*D2R+Math.PI;

const load=f=>chB64ToBuf(null,f).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no)));

/* ---- BMW ---- */
if(BMW.on)load('bmw_m3_2007.glb').then(gl=>{
 const car=gl.scene;car.updateMatrixWorld(true);
 car.traverse(o=>{if(!o.isMesh)return;o.userData.noCast=1;o.castShadow=false;o.frustumCulled=true;
  [].concat(o.material).forEach((m,i,arr)=>{
   let q=m;
   if(m.isMeshPhysicalMaterial){q=new THREE.MeshStandardMaterial({color:m.color.clone(),roughness:m.roughness,metalness:m.metalness,transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest,emissive:m.emissive.clone()});q.name=m.name}
   const lamp=q.emissive&&(q.emissive.r+q.emissive.g+q.emissive.b)>.05; /* lampu DRL/belakang: ekstensi emissive_strength tidak didukung three r128, jadi dikuatkan manual */
   if(lamp)q.emissiveIntensity=3.5;
   else if(!q.transparent||q.opacity>.95){q.emissive=q.color.clone().multiplyScalar(.2)} /* malam gelap & tanpa env map: logam murni tampil hitam, jadi dilunakkan seperti mobil polisi */
   if(!q.transparent){q.roughness=Math.min(.75,q.roughness==null?.6:Math.max(.3,q.roughness));q.metalness=Math.min(q.metalness||0,.35)}
   if(Array.isArray(o.material))o.material[i]=q;else o.material=q})});
 const bb=new THREE.Box3().setFromObject(car),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());
 car.position.set(-c.x,-bb.min.y,-c.z);
 /* kotak tabrakan mengikuti ukuran asli model (sedikit dirapatkan) */
 if(sz.z>2&&sz.z<9&&sz.x>1&&sz.x<4){BMW.hl=sz.z/2*.97;BMW.hw=sz.x/2*.93}
 const g=new THREE.Group();g.add(car);g.position.set(BMW.x,BMW.y,BMW.z);g.rotation.y=BMW.h;g.visible=false;owG.add(g);BMW.obj=g;
 console.log('BMW M3 dimuat',sz.x.toFixed(2),sz.y.toFixed(2),sz.z.toFixed(2),'m');
}).catch(e=>console.error('BMW M3 GLB',e));

/* ---- CEWE idle ---- */
if(CWE.on)load('tobrut_animated.glb').then(gl=>{
 const m=gl.scene;m.updateMatrixWorld(true);
 const wy=n=>{const b=m.getObjectByName(n);return b?new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).y:null};
 /* tinggi & telapak kaki diambil dari tulang (pose diam), bukan dari kotak mesh yang bisa meleset untuk model berkulit */
 const head=wy('HeadTop'),sole=Math.min(...[wy('LeftToesEnd'),wy('RightToesEnd')].filter(v=>v!=null));
 let s=1,off=0;
 if(head!=null&&isFinite(sole)&&head>sole){s=CWE.tinggi/(head-sole);off=-sole}
 else{const bb=new THREE.Box3().setFromObject(m);s=CWE.tinggi/Math.max(.5,bb.max.y-bb.min.y);off=-bb.min.y}
 m.traverse(o=>{if(!o.isMesh)return;o.userData.noCast=1;o.castShadow=false;
  [].concat(o.material).forEach(q=>{if(q&&q.map){q.emissiveMap=q.map;q.emissive=new THREE.Color(.24,.24,.24)}})}); /* malam: terangkan tekstur kulit/baju tanpa mengubah warna aslinya */
 m.position.y=off;
 const g=new THREE.Group();g.add(m);g.scale.setScalar(s);g.position.set(CWE.x,CWE.y,CWE.z);g.rotation.y=CWE.h;g.visible=false;owG.add(g);CWE.obj=g;
 if(gl.animations&&gl.animations.length){const mx=new THREE.AnimationMixer(m);
  mx.clipAction(THREE.AnimationClip.findByName(gl.animations,'Idle')||gl.animations[0]).play();CWE.mx=mx}
}).catch(e=>console.error('CEWE GLB',e));

/* animasi mengikuti dt game (ikut timestep tetap saat merekam cinematic), hanya saat cewe terlihat */
window.CWE_tick=function(dt){if(CWE.mx&&CWE.obj&&CWE.obj.visible)CWE.mx.update(dt)};

/* hanya digambar kalau kamera dekat */
setInterval(()=>{if(typeof cam==='undefined')return;const cx=cam.position.x,cz=cam.position.z;
 if(BMW.obj)BMW.obj.visible=BMW.on&&Math.hypot(cx-BMW.x,cz-BMW.z)<BMW.far;
 if(CWE.obj)CWE.obj.visible=CWE.on&&Math.hypot(cx-CWE.x,cz-CWE.z)<CWE.far},400);

/* tabrakan motor/karakter: kotak berputar (sama seperti polWall) */
function box(x0,z0,h,hl,hw){
 const o=ow.foot?wk:ow,r=ow.foot?.3:.42,c=Math.cos(h),sn=Math.sin(h),fx=-Math.sin(ow.h),fz=-Math.cos(ow.h);let hit=0;
 for(const dd of(ow.foot?[0]:[.85,0,-.85])){const px=o.x+fx*dd,pz=o.z+fz*dd,dx=px-x0,dz=pz-z0;
  if(dx*dx+dz*dz>(hl+hw+r+1)**2)continue;
  const lx=dx*c-dz*sn,lz=dx*sn+dz*c,cx=Math.max(-hw,Math.min(hw,lx)),cz=Math.max(-hl,Math.min(hl,lz)),ex=lx-cx,ez=lz-cz,L=Math.hypot(ex,ez);
  if(L>=r)continue;let nx,nz,push;
  if(L>1e-4){nx=ex/L;nz=ez/L;push=r-L}
  else{const a=lx+hw,b=hw-lx,d1=lz+hl,d2=hl-lz,m=Math.min(a,b,d1,d2);if(m===a){nx=-1;nz=0}else if(m===b){nx=1;nz=0}else if(m===d1){nx=0;nz=-1}else{nx=0;nz=1}push=m+r}
  const wx=nx*c+nz*sn,wz=-nx*sn+nz*c;o.x+=wx*push;o.z+=wz*push;hit=Math.max(hit,Math.abs(wx*fx+wz*fz))}
 if(!ow.foot&&hit>.2)P.v*=Math.max(0,1-(hit-.2)*.6)}
window.bmwWall=function(){if(BMW.on&&BMW.obj&&BMW.obj.visible)box(BMW.x,BMW.z,BMW.h,BMW.hl,BMW.hw);
 if(CWE.on&&CWE.obj&&CWE.obj.visible)box(CWE.x,CWE.z,0,CWE.r,CWE.r)};
})();
