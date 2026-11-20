// ===== OPEN WORLD =====
let mode='drag';
const inp={l:0,r:0,brk:0,bn:0},ow={x:40,z:0,h:0,odo:0,steer:0,cb:0},blocks=new Map(),owG=new THREE.Group();scene.add(owG);owG.visible=false;
/* ===== JALAN LEBAR SISI KIRI (calon perempatan, tahap 1 = sisi KIRI dulu) =====
   Acuan dari screenshot: X 18.7, Z -63.1, motor menghadap -z, jadi "kiri" = arah -x.
   LKR.z = sumbu tengah jalan (z dunia), LKR.w = lebar, LKR.x0 = ujung kanan (menempel tepi jalan utama),
   LKR.len = panjang ke kiri (-x), LKR.y = tinggi permukaan jalan.
   LKR.clear = true -> gedung / pohon / tembok / tiang lampu yang ketimpa jalan dihapus otomatis. */
const LKR={z:-63.1,w:24,x0:19,len:200,y:.1,clear:true};
const LFT_Z0=LKR.z-LKR.w/2-.3; // batas: mulai dari sini ke arah -z sisi kiri dikosongkan
const GPE=Math.max(-60,Math.min(60,-(LKR.z+LKR.w/2))); // trotoar Green Pramuka dipotong di sini (sisi -z) supaya tidak nabrak jalan baru


const owT=ctex(512,512,(g,w,h)=>{g.fillStyle='#17181c';g.fillRect(0,0,w,h);g.fillStyle='#3b3b42';g.fillRect(95,0,322,h);g.fillRect(0,95,w,322);
 g.fillStyle='#202127';g.fillRect(121,0,270,h);g.fillRect(0,121,w,270);
 for(let i=0;i<24000;i++){const a=Math.random()<.5,px=a?121+Math.random()*270:Math.random()*w,py=a?Math.random()*h:121+Math.random()*270;g.fillStyle=i%2?'rgba(255,255,255,.05)':'rgba(0,0,0,.12)';g.fillRect(px,py,1.2,1.2)}
 sgrain(g,w,h,4000,.04);
 g.fillStyle='#d8c050';for(let k=0;k<8;k++){const p=k*64+16;if(Math.abs(p+16-256)>167){g.fillRect(253,p,6,32);g.fillRect(p,253,32,6)}}},8,8);
const owRoad=add(new THREE.Mesh(new THREE.PlaneGeometry(640,640),new THREE.MeshStandardMaterial({map:owT,roughness:.35,metalness:.2})),0,0,0,owG);owRoad.rotation.x=-Math.PI/2;
const winT=ctex(64,128,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);for(let y=0;y<16;y++)for(let x=0;x<8;x++)if(Math.random()<.45){g.fillStyle=Math.random()<.8?'#ffd98a':'#9fd2ff';g.fillRect(x*8+1,y*8+2,5,4)}},2,3);
const bmat=['#2b2f3a','#3a302b','#24343a','#33333a'].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.85,emissive:0xffffff,emissiveMap:winT,emissiveIntensity:.8}));

/* ===== KAWASAN "GREEN PRAMUKA CITY" di sisi kiri titik spawn Open World (replika dari foto referensi) =====
   Sistem koordinat lokal grup: x = kanan pemain yang menghadap gerbang, y = atas, z+ = ke arah pemain/jalan raya. Gerbang ada di z=0. */
(function(){try{
const GP=new THREE.Group();GP.position.set(-20,0,0);GP.rotation.y=Math.PI/2;owG.add(GP);window.GPG=GP;
const cv=(w,h,fn,rx,ry)=>ctex(w,h,fn,rx,ry);
const R=k=>Math.abs(Math.sin(k*12.9898+4.1)*43758.5453)%1;
const mbas=(o)=>new THREE.MeshBasicMaterial(o),mstd=(c,r,e)=>new THREE.MeshStandardMaterial({color:c,roughness:r==null?.85:r,emissive:e||0});
const box=(w,h,d,m,x,y,z)=>add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),x,y,z,GP);
const flat=(w,d,m,x,y,z)=>{const q=add(new THREE.Mesh(new THREE.PlaneGeometry(w,d),m),x,y,z,GP);q.rotation.x=-Math.PI/2;return q};
const face=(w,h,m,x,y,z)=>add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m),x,y,z,GP);
const gmat=(t,ei)=>new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:ei,roughness:.65,metalness:.05,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const noise=(g,w,h,n,a)=>{sgrain(g,w,h,n,a);};
// ---------- tekstur dasar ----------
const grassT=cv(128,128,(g,w,h)=>{g.fillStyle='#17181c';g.fillRect(0,0,w,h);noise(g,w,h,900,.07)},24,24);
const pavT=cv(256,256,(g,w,h)=>{g.fillStyle='#4a4742';g.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<8;c++){const x=c*32+(r%2?16:0),y=r*16,s=.9+R(r*8+c)*.22;g.fillStyle='rgb('+(96*s|0)+','+(91*s|0)+','+(84*s|0)+')';g.fillRect(x+1,y+1,30,14)}},30,10);
const asphT=cv(128,128,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);noise(g,w,h,1200,.06)},12,12);
const gG=gmat(grassT,.3),gP=gmat(pavT,.45),gA=gmat(asphT,.3);
// ---------- lantai ----------
flat(180,152,gG,0,.03,-81);                 // rumput belakang gerbang
flat(60,150,gA,0,.06,-75);                  // aspal jalan masuk
flat(120,40,gP,0,.05,15);                  // plaza paving
const yl=mbas({color:0xb89418});flat(120,.34,yl,0,.09,30);   // garis kuning melintang
flat(120,1.3,mbas({color:0x77746d}),0,.075,34.2);
// TROTOAR pejalan kaki: tanjakan landai dari plaza & dari jalan raya, lantai paving, jalur pemandu kuning, lampu jalan putih (ada tabrakan). z lokal 28.4..37.1, x -60..60, tinggi atas .22
{const pvT=cv(256,256,(g,w,h)=>{g.fillStyle='#8e8b84';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const s=.88+R(r*8+c+500)*.24;g.fillStyle='rgb('+(150*s|0)+','+(146*s|0)+','+(138*s|0)+')';g.fillRect(c*32+1,r*32+1,30,30)}noise(g,w,h,1200,.06)},30,1.1);
 const pvM=new THREE.MeshStandardMaterial({map:pvT,emissiveMap:pvT,emissive:0xffffff,emissiveIntensity:.4,roughness:.85,side:THREE.DoubleSide}),sdM=mstd('#a29f97',.85,0x24231f);
 const fbBox=box(GPE+60,.22,4.5,[sdM,sdM,pvM,sdM,sdM,sdM],(GPE-60)/2,.11,32.65); // cadangan kalau GLB gagal dimuat
 const kbT=cv(128,32,(g,w,h)=>{g.fillStyle='#97958e';g.fillRect(0,0,w,h);g.fillStyle='#a9a79f';g.fillRect(0,0,62,h);g.fillStyle='#86847d';g.fillRect(64,0,62,h);g.fillStyle='#4d4b47';g.fillRect(62,0,2,h);g.fillRect(126,0,2,h);noise(g,w,h,300,.08)},50,1);
 const kbM=new THREE.MeshStandardMaterial({map:kbT,emissiveMap:kbT,emissive:0xffffff,emissiveIntensity:.35,roughness:.9,side:THREE.DoubleSide});
 // tanjakan: permukaan miring menyambung mulus ke lantai trotoar
 const ramp=(z0,h0,z1,h1,m)=>{const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-60,h0,z0,GPE,h0,z0,GPE,h1,z1,-60,h1,z1]),3));
  g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,0,1,0,1,1,0,1]),2));
  g.setIndex([0,2,1,0,3,2]);g.computeVertexNormals();const me=new THREE.Mesh(g,m);GP.add(me);return me};
 ramp(28.4,.052,30.4,.22,pvM);   // naik dari plaza
  // jalur pemandu kuning (guiding block) + blok titik peringatan
 const tbT=cv(64,32,(g,w,h)=>{g.fillStyle='#d9ae1e';g.fillRect(0,0,w,h);g.fillStyle='#a07f10';for(let i=0;i<4;i++)g.fillRect(0,i*8+5,w,2)},60,1);
 flat(GPE+60,.6,mbas({map:tbT,color:0xd4d4d4}),(GPE-60)/2,.228,32.2);
 const dtT=cv(64,64,(g,w,h)=>{g.fillStyle='#d9ae1e';g.fillRect(0,0,w,h);g.fillStyle='#9a780f';for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.beginPath();g.arc(8+i*16,8+j*16,4,0,7);g.fill()}},1,1);
 [-52,-24,6,30,52].filter(x=>x<GPE-1).forEach(x=>flat(1.2,1.2,mbas({map:dtT,color:0xd4d4d4}),x,.232,32.2));
 // lampu jalan putih melengkung ke arah jalan (tiang bisa ditabrak, tidak tembus)
 const poM=mstd('#f2f2ee',.5,0x30302c),lhM=mbas({color:0xfff0c4});
 /* Model trotoar: "TROTOAT 1_2X2 M T 10CM" oleh eventdesignws (CC BY 4.0) - https://sketchfab.com/3d-models/trotoat-1-2x2-m-t-10cm-0a250a56696e4e158231d7344a6d2761
   File GLB asli, byte tidak diubah/dikompres. sha256=05c21d8a29702e6d7ec567ba6b5ff7e9eca9b0beda135659732e2ccd4cec1250 . Modul 2 m x 1,2 m, tebal 10 cm, dipasang berulang (instancing) sepanjang trotoar. */
 chB64ToBuf(TRO_GLB_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  gl.scene.updateMatrixWorld(true);const ms=[];gl.scene.traverse(o=>{if(o.isMesh)ms.push(o)});
  const stone=ms.find(o=>/stone/i.test((o.material&&o.material.name)||''))||ms[0],edge=ms.find(o=>o!==stone);
  const prep=o=>{const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);const m=o.material;if(m.map){m.emissiveMap=m.map;m.emissive=new THREE.Color(0xffffff);m.emissiveIntensity=.4}m.side=THREE.DoubleSide;m.needsUpdate=true;return [g,m]};
  const NX=Math.max(1,Math.min(60,Math.round((GPE+61)/2))),TZ=[32.642,33.842,35.042],d=new THREE.Object3D();
  const [g0,m0]=prep(stone),im0=new THREE.InstancedMesh(g0,m0,NX*TZ.length);let k=0;
  for(let i=0;i<NX;i++)TZ.forEach(tz=>{d.position.set(-61+2*i,.12,tz);d.updateMatrix();im0.setMatrixAt(k++,d.matrix)});
  im0.frustumCulled=false;GP.add(im0);
  if(edge){const [g1,m1]=prep(edge),im1=new THREE.InstancedMesh(g1,m1,NX);
   for(let i=0;i<NX;i++){d.position.set(-61+2*i,.12,TZ[2]);d.updateMatrix();im1.setMatrixAt(i,d.matrix)}
   im1.frustumCulled=false;GP.add(im1)}
  fbBox.visible=false;
  box(GPE+60,.12,4.5,sdM,(GPE-60)/2,.06,32.65);
  box(GPE+60,.22,.782,[sdM,sdM,pvM,sdM,sdM,sdM],(GPE-60)/2,.11,30.791);
 }).catch(e=>console.error('TROTOAR GLB',e));
 window.GP_POLES=[];
 [-45,-15,15,45].forEach(x=>{add(new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,8,10),poM),x,4,34.2,GP);
  add(new THREE.Mesh(new THREE.BoxGeometry(.1,.1,2.6),poM),x,8,35.4,GP);
  add(new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.9),lhM),x,7.93,36.5,GP);
  const sp=new THREE.Sprite(sprM);sp.scale.set(7,7,1);sp.position.set(x,7.8,36.5);GP.add(sp);
  window.GP_POLES.push([-20+34.2,-x])})}
/* Model tenda: "TENDA+3X3 FACIA POLOS" oleh eventdesignws (CC BY 4.0) - https://sketchfab.com/3d-models/tenda3x3-facia-polos-f10d4d3444aa43199469951e16f7608b
   File GLB asli, byte tidak diubah/dikompres. sha256=06de25a443b2ea169cdc88f40124154c0c951972f54235a287cf1251e531749e . Dimuat sekali, lalu dipasang di beberapa tempat. */
const TENT_GLB_B64=__BIG[4];
window.TENT_P=chB64ToBuf(TENT_GLB_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
 gl.scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(mt=>{
  if(mt.userData&&mt.userData.tl)return;mt.userData=mt.userData||{};mt.userData.tl=1;
  if(mt.map){mt.emissiveMap=mt.map;mt.emissive=new THREE.Color(0xffffff);mt.emissiveIntensity=.3}
  else if(!mt.transparent&&mt.color){mt.emissive=mt.color.clone().multiplyScalar(.3)}
  mt.needsUpdate=true})});
 return gl});
// pasang satu salinan tenda: pusat alas di (x,z), alas menyentuh y; skala asli (3 x 3 m)
window.tentPlace=(parent,x,y,z,ry)=>window.TENT_P.then(gl=>{const m=gl.scene.clone(true),g=new THREE.Group();g.add(m);m.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(m),c=b.getCenter(new THREE.Vector3());m.position.set(-c.x,-b.min.y,-c.z);
 g.position.set(x,y,z);g.rotation.y=ry||0;parent.add(g);return g}).catch(err=>console.error('TENDA GLB',err));
// TENDA di atas jalur pemandu kuning (pas di tengah jalur): geser TX untuk memindahkan sepanjang trotoar
{const TX=49.5,TZ=32.2;tentPlace(GP,TX,.22,TZ,0);
 const sp=new THREE.Sprite(sprM);sp.scale.set(4,4,1);sp.position.set(TX,2.6,TZ);GP.add(sp)}           // pita beton pinggir
const gl=glowM(0x2cff7a);const gp=new THREE.Mesh(new THREE.PlaneGeometry(44,16),new THREE.MeshBasicMaterial({map:glowT,color:0x1fff6a,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.22,fog:false}));gp.rotation.x=-Math.PI/2;gp.position.set(0,.1,3);GP.add(gp);
// garis putus-putus putih jalan masuk
{const n=4*25,im=new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.02,3),mbas({color:0xcfcfcf}),n),d=new THREE.Object3D();let i=0;
 [-20,-10,10,20].forEach(x=>{for(let k=0;k<25;k++){d.position.set(x,.1,-4-k*6);d.updateMatrix();im.setMatrixAt(i++,d.matrix)}});GP.add(im)}
// ---------- bahu jalan belang kuning-hitam ----------
function stripeTex(vert,rep){return cv(vert?16:64,vert?64:16,(g,w,h)=>{g.fillStyle='#d9b020';g.fillRect(0,0,vert?w:w/2,vert?h/2:h);g.fillStyle='#141414';g.fillRect(vert?0:w/2,vert?h/2:0,w,h)},vert?1:rep,vert?rep:1)}
function curbBox(w,h,len,x,y,z){const s=mbas({map:stripeTex(0,len/1.6),color:0xc8c8c8}),t=mbas({map:stripeTex(1,len/1.6),color:0xc8c8c8}),e=mbas({color:0x222222});
 return box(w,h,len,[s,s,t,e,e,e],x,y,z)}
curbBox(.5,.28,148,-30,.14,-75);curbBox(.5,.28,148,30,.14,-75);
// median tengah di belakang gerbang
curbBox(3.8,.28,148,0,.14,-75);box(3.1,.32,147,mstd('#2a2b31',.9,0x0a0a0c),0,.17,-75);
// ---------- pulau rumput oval depan gerbang ----------
{const ct=cv(64,16,(g,w,h)=>{g.fillStyle='#d9b020';g.fillRect(0,0,w/2,h);g.fillStyle='#141414';g.fillRect(w/2,0,w/2,h)},22,1),cs=mbas({map:ct,color:0xc8c8c8}),gr=new THREE.MeshStandardMaterial({map:grassT,emissiveMap:grassT,emissive:0xffffff,emissiveIntensity:.3});
 const c1=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.3,40,1),[cs,gr,mbas({color:0x111111})]);c1.scale.set(11.6,1,6.4);add(c1,0,.15,17,GP);
 const c2=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.34,40),[gr,gr,gr]);c2.scale.set(10.6,1,5.5);add(c2,0,.18,17,GP);
 c2.material=new THREE.MeshStandardMaterial({map:grassT,emissiveMap:grassT,emissive:0xffffff,emissiveIntensity:.3});}
// kisi drainase (DIMATIKAN: daftar kosong. Isi lagi [[-15,21],[-4,26],[5,24],[16,22],[-24,15],[26,14]] untuk mengaktifkan)
{const dm=mbas({color:0x16161a});[].forEach(([x,z])=>{flat(4.2,1.3,dm,x,.11,z);flat(3.8,.12,mbas({color:0x2a2a30}),x,.115,z)})}
// ---------- gerbang ----------
const conc=mstd('#8c8981',.9,0x1a1814),dk=mstd('#2a2d33',.7,0x08090c);
[-19,19].forEach(x=>{box(1.7,7.4,1.7,conc,x,3.7,-1);box(3.6,.5,4,conc,x,7.3,-1)});
box(41,1.5,3.8,conc,0,6.9,-1);                       // balok gerbang
box(41,.18,3.2,mbas({color:0xf3f6e8}),0,6.1,-1);       // lampu bawah balok
// kabin penjaga
[-23,23].forEach(x=>{box(3.4,3.8,4.4,mstd('#a8a69d',.8,0x14130f),x,1.9,2);box(4,.3,5,dk,x,3.95,2);face(2.2,1.4,mbas({color:0x9fc4d8}),x,2.3,4.22);box(.5,3.2,.5,conc,x+(x<0?2.2:-2.2),1.6,4)});
[-14,14].forEach(x=>{box(2.6,3.4,3.6,mstd('#a8a69d',.8,0x14130f),x,1.7,2);box(3.2,.3,4.2,dk,x,3.55,2);face(1.8,1.2,mbas({color:0x9fc4d8}),x,2.1,3.82)});
// rangka & papan nama menyala (rangka tipis, papan gelap di belakang supaya tulisan jelas)
box(29,.2,.3,dk,0,11.9,-1.3);box(29,.2,.3,dk,0,7.55,-1.3);[-14.4,0,14.4].forEach(x=>box(.2,4.4,.3,dk,x,9.72,-1.3));
const signT=cv(2048,340,(g,w,h)=>{g.clearRect(0,0,w,h);g.textBaseline='alphabetic';g.lineJoin='round';
 const F1='bold 170px Georgia,"Times New Roman",serif',F2='bold 160px Georgia,"Times New Roman",serif',GAP=70,LOGO=230;
 g.font=F1;const w1=g.measureText('Green').width,w2=g.measureText('Pramuka').width;g.font=F2;const w3=g.measureText('CITY').width;
 const tot=w1+GAP+LOGO+GAP+w2+GAP*.8+w3,f=Math.min(1,(w-90)/tot);
 g.save();g.translate((w-tot*f)/2,0);g.scale(f,f);
 const base=232;
 const word=(txt,x,font)=>{g.font=font;
  g.shadowColor='#1cff66';g.shadowBlur=26;g.lineWidth=14;g.strokeStyle='#0c8a35';g.strokeText(txt,x,base);
  g.shadowBlur=0;g.lineWidth=5;g.strokeStyle='#baffd0';g.strokeText(txt,x,base);
  const gr=g.createLinearGradient(0,base-120,0,base);gr.addColorStop(0,'#c8ffd8');gr.addColorStop(.45,'#4cf27f');gr.addColorStop(1,'#1fd357');g.fillStyle=gr;g.fillText(txt,x,base)};
 let x=0;word('Green',x,F1);x+=w1+GAP;
 // logo daun tiga helai
 {const cx=x+LOGO/2,cy=base-6;
  const leaf=(ang,len,wid)=>{g.save();g.translate(cx,cy);g.rotate(ang);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(wid,-len*.3,wid*.7,-len*.8,0,-len);g.bezierCurveTo(-wid*.7,-len*.8,-wid,-len*.3,0,0);
   g.shadowColor='#1cff66';g.shadowBlur=22;g.lineWidth=9;g.strokeStyle='#0c8a35';g.stroke();g.shadowBlur=0;
   const gr=g.createLinearGradient(0,0,0,-len);gr.addColorStop(0,'#28d95e');gr.addColorStop(1,'#d8ffe4');g.fillStyle=gr;g.fill();
   g.lineWidth=3;g.strokeStyle='#eaffef';g.beginPath();g.moveTo(0,-len*.08);g.lineTo(0,-len*.78);g.stroke();g.restore()};
  leaf(-.82,150,40);leaf(.82,150,40);leaf(0,200,52);
  g.shadowColor='#1cff66';g.shadowBlur=16;g.lineWidth=11;g.strokeStyle='#0c8a35';g.beginPath();g.moveTo(cx-100,cy+6);g.quadraticCurveTo(cx,cy+34,cx+100,cy+6);g.stroke();
  g.shadowBlur=0;g.lineWidth=5;g.strokeStyle='#d8ffe4';g.stroke()}
 x+=LOGO+GAP;word('Pramuka',x,F1);x+=w2+GAP*.8;word('CITY',x,F2);g.restore()},1,1);
face(28,4.65,mbas({map:signT,transparent:true,depthWrite:false,fog:false}),0,9.72,-.95);
// ---------- papan rambu kiri (3 tiang) ----------
{const sg=cv(128,320,(g,w,h)=>{g.fillStyle='#e9e9e9';g.fillRect(0,0,w,h);
  g.lineWidth=11;g.strokeStyle='#c8201f';g.beginPath();g.arc(64,56,40,0,7);g.stroke();g.beginPath();g.moveTo(36,28);g.lineTo(92,84);g.stroke();
  g.fillStyle='#1f55b8';g.beginPath();g.arc(64,160,42,0,7);g.fill();g.fillStyle='#fff';g.fillRect(52,134,24,52);g.lineWidth=9;g.strokeStyle='#c8201f';g.beginPath();g.arc(64,160,42,0,7);g.stroke();
  g.lineWidth=11;g.beginPath();g.arc(64,262,40,0,7);g.stroke();g.fillStyle='#222';g.font='bold 54px sans-serif';g.textAlign='center';g.fillText('P',64,282)},1,1);
 const sm=mbas({map:sg,color:0xdddddd});[-34,-32.2,-30.4].forEach((x,i)=>{box(.14,4,.14,dk,x,2,6);face(1.5,3.4,sm,x,2.6,6.12)})}
// rambu P kanan
{const pt=cv(128,128,(g)=>{g.fillStyle='#fff';g.beginPath();g.arc(64,64,62,0,7);g.fill();g.fillStyle='#1f55b8';g.beginPath();g.arc(64,64,52,0,7);g.fill();g.fillStyle='#fff';g.font='bold 80px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('P',64,68);g.strokeStyle='#d02020';g.lineWidth=10;g.beginPath();g.arc(64,64,52,0,7);g.stroke();g.beginPath();g.moveTo(26,102);g.lineTo(102,26);g.stroke()},1,1);
 box(.14,4,.14,dk,30,2,6);face(1.7,1.7,mbas({map:pt}),30,4.2,6.12)}
// baliho magenta kiri
{const bt=cv(256,512,(g,w,h)=>{g.fillStyle='#b0206a';g.fillRect(0,0,w,h);g.fillStyle='#f2f2f2';g.fillRect(0,0,w,70);g.fillStyle='#b0206a';g.font='bold 46px sans-serif';g.textAlign='center';g.fillText('PRAMUKA',128,50);g.fillStyle='#fff';g.font='bold 40px sans-serif';g.fillText('Hunian',128,140);g.fillText('Hijau',128,190);g.fillStyle='#ffd24a';g.fillRect(30,230,196,120);g.fillStyle='#3a62c8';g.fillRect(30,370,196,100)},1,1);
 box(.5,9,.5,dk,-26,4.5,-4);box(4.2,7.4,.4,dk,-26,9.6,-4.2);face(3.8,7,mbas({map:bt,color:0xe0e0e0}),-26,9.6,-3.97)}
// kotak iklan di median
{const lt=cv(128,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a8fe0');gr.addColorStop(1,'#e8f4ff');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#f0a020';g.beginPath();g.arc(64,100,44,0,7);g.fill();g.fillStyle='#e0408a';g.fillRect(14,170,100,50);g.fillStyle='#fff';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('Green',64,200)},1,1);
 const lm=mbas({map:lt});box(3,4.6,.4,dk,0,2.6,-8);face(2.7,4.2,lm,0,2.6,-7.78);const b=face(2.7,4.2,lm,0,2.6,-8.22);b.rotation.y=Math.PI}
// ---------- kerucut oranye ----------
{const pos=[];for(let i=0;i<47;i++){pos.push([-28.6,-3-i*3.1]);pos.push([28.6,-3-i*3.1])}
 [[-37,9],[-35,7.6],[-33,6.6],[-31,5.6],[-28,4.6],[-25,3.8],[-22,3],[-19,2.2],[25,3.6],[28,4.4],[31,5.2],[34,6],[37,7],[40,8],[-40,10]].forEach(p=>pos.push(p));
 const im=new THREE.InstancedMesh(new THREE.ConeGeometry(.24,.78,10),new THREE.MeshStandardMaterial({color:0xff5a1f,roughness:.6,emissive:0x5a1a00}),pos.length),d=new THREE.Object3D();pos.forEach((p,i)=>{d.position.set(p[0],.39,p[1]);d.updateMatrix();im.setMatrixAt(i,d.matrix)});GP.add(im)}
// ---------- pagar tanaman & trotoar ----------
{const hm=mstd('#235a2a',.95,0x07180b),cm=mstd('#7b786f',.9,0x15140f);
 [[-47,24,8.5],[47,24,10]].forEach(([x,w,z])=>{box(w,.4,2.8,cm,x,.2,z);box(w,1.3,2.2,hm,x,1.05,z)});
 [[-45,26,-5],[-45,26,-9.5]].forEach(([x,w,z])=>box(w,1.6,2.4,hm,x,.8,z));
 for(let i=0;i<10;i++){box(2.4,1.6,2.2,hm,-52+i*2.3+R(i)*.6,.8,-14)}
 box(36,.5,.6,cm,-46,.25,-3.5);}
// ---------- tembok merah kanan "JAGALAH KEBERSIHAN" ----------
{const wt=cv(1024,128,(g,w,h)=>{g.fillStyle='#b4201e';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='900 78px Arial Black,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  const s='JAGALAH KEBERSIHAN';let x=70;for(const ch of s){g.fillText(ch,x,70);x+=ch===' '?30:g.measureText(ch).width+13}},1,1);
 box(30,3,.6,mstd('#6e1514',.9,0x1a0504),47,1.5,-4);face(29.4,2.8,mbas({map:wt,color:0xd8d8d8}),47,1.5,-3.68)}
// ---------- bangunan berwarna (mural) kanan ----------
{const mt=cv(512,320,(g,w,h)=>{g.fillStyle='#c24d88';g.fillRect(0,0,w,h);g.fillStyle='#e9b53a';g.beginPath();g.arc(120,110,95,0,7);g.fill();g.fillStyle='#3b63c9';g.beginPath();g.ellipse(360,200,130,80,.4,0,7);g.fill();g.fillStyle='#f3f0ea';g.fillRect(250,30,200,60);g.fillStyle='#2b9a8c';g.beginPath();g.arc(440,70,60,0,7);g.fill();g.fillStyle='rgba(60,20,60,.55)';for(let r=0;r<4;r++)for(let c=0;c<9;c++)g.fillRect(14+c*55,230+r*0,0,0);
  g.fillStyle='#f6f2c8';for(let c=0;c<8;c++)g.fillRect(24+c*62,262,34,34)},1,1);
 const pm=mbas({color:0xb04a80}),fm=mbas({map:mt,color:0xcfcfcf});box(30,17,13,[pm,pm,pm,pm,fm,pm],46,8.5,-12.5)}
// ---------- menara apartemen (jendela menyala) ----------
/* ===== GEDUNG APARTEMEN DARI FILE GLB (models/gedung_apartemen.glb) =====
   on:false -> balik ke gedung kotak lama. uniform:true -> proporsi asli model dijaga (tinggi bisa beda dari slot).
   rot: putar model. glow: terang tekstur malam hari. recolor: garis merah tiap gedung beda warna (tekstur dibuat ulang lewat canvas, tanpa shader).
   hues (0-1): .95 merah asli, .60 biru, .36 hijau, .08 oranye, .76 ungu, .50 tosca, .14 kuning, .68 indigo. texW = lebar tekstur hasil warna (kecil = hemat memori). */
const APT={on:true,file:'models/gedung_apartemen.glb',uniform:false,rot:0,glow:.45,P:null,recolor:true,n:0,texW:1024,
 hues:[.60,.36,.08,.76,.50,.14,.95,.68],tex:{}};
function aptBake(src,hue){ // ganti HANYA piksel merah jenuh -> hue baru; putih/abu-abu tidak berubah
 const k=hue.toFixed(2);if(APT.tex[k])return APT.tex[k];
 const im=src.image,W=Math.min(APT.texW,im.width||APT.texW),H=Math.round(W*(im.height||1)/(im.width||1)),cv_=document.createElement('canvas');cv_.width=W;cv_.height=H;
 const cx=cv_.getContext('2d');cx.drawImage(im,0,0,W,H);const id=cx.getImageData(0,0,W,H),a=id.data;
 for(let i=0;i<a.length;i+=4){const r=a[i]/255,g=a[i+1]/255,b=a[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(mx<.2||d/mx<.4)continue;
  let h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;if(!(h>.86||h<.04))continue;
  const s=d/mx,v=mx,hh=hue*6,f=hh-Math.floor(hh),p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));
  const c=[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][Math.floor(hh)%6];a[i]=c[0]*255;a[i+1]=c[1]*255;a[i+2]=c[2]*255}
 cx.putImageData(id,0,0);
 const tx=new THREE.CanvasTexture(cv_);tx.flipY=src.flipY;tx.encoding=src.encoding;tx.wrapS=src.wrapS;tx.wrapT=src.wrapT;tx.anisotropy=src.anisotropy;tx.needsUpdate=true;return APT.tex[k]=tx}
function aptTint(root,hue){root.traverse(o=>{if(!o.isMesh)return;
 const f=m=>{if(!m.map)return m;const c=m.clone(),t=aptBake(m.map,hue);c.map=t;c.emissiveMap=t;c.needsUpdate=true;return c};
 o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)})}
function aptLoad(){return APT.P||(APT.P=fetch(APT.file).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' '+APT.file);return r.arrayBuffer()})
 .then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  gl.scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(mt=>{
   if(mt.map){mt.emissiveMap=mt.map;mt.emissive=new THREE.Color(0xffffff);mt.emissiveIntensity=APT.glow}
   else if(mt.color){mt.emissive=mt.color.clone().multiplyScalar(APT.glow)}
   mt.needsUpdate=true})});
  gl.scene.updateMatrixWorld(true);gl.bb=new THREE.Box3().setFromObject(gl.scene);return gl}))}
function aptPlace(tw,w,h,d,x,z){return aptLoad().then(gl=>{
  if(!tw.parent)return true; // slot ini sudah dihapus (kena jalan LKR) -> jangan dipasang
  const sz=gl.bb.getSize(new THREE.Vector3()),c=gl.bb.getCenter(new THREE.Vector3()),m=gl.scene.clone(true),g=new THREE.Group();
  m.position.set(-c.x,-gl.bb.min.y,-c.z);g.add(m);
  if(APT.recolor){try{const hu=APT.hues[APT.n++%APT.hues.length];if(hu!==.95)aptTint(m,hu)}catch(e){console.error('GEDUNG warna',e)}}
  const sx=w/sz.x,sy=h/sz.y,sd=d/sz.z;
  if(APT.uniform){const s=Math.min(sx,sy,sd);g.scale.set(s,s,s)}else g.scale.set(sx,sy,sd);
  g.rotation.y=APT.rot;g.position.set(x,0,z);GP.add(g);return true
 }).catch(e=>{console.error('GEDUNG GLB',e);return false})}
function winTex(wall,cols,rows,lit,seed){return cv(cols*8,rows*8,(g,w,h)=>{g.fillStyle=wall;g.fillRect(0,0,w,h);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const on=R(seed+r*31+c*7)<lit;g.fillStyle=on?(R(r*c+seed)<.7?'#ffd98c':'#fff2c9'):'#1c2028';g.fillRect(c*8+1,r*8+2,5,4)}},1,1)}
function tower(w,d,h,x,z,wall,lit,seed,tint){const cw=Math.max(3,Math.round(w/2.7)),cd=Math.max(3,Math.round(d/2.7)),rows=Math.max(2,Math.round(h/3.4)),tc=tint||0xd0d0d0,
  mf=mbas({map:winTex(wall,cw,rows,lit,seed),color:tc}),ms_=mbas({map:winTex(wall,cd,rows,lit,seed+5),color:tc}),top=mbas({color:0x23252b});
 const tw_=box(w,h,d,[ms_,ms_,top,top,mf,mf],x,h/2,z);
 const fb=()=>{try{hqTower(tw_,[ms_,ms_,top,top,mf,mf],{GP,w,d,h,x,z,cw,cd,rows,wall,lit,seed,tc,R})}catch(e){console.error('hqTower',e)}};
 if(!APT.on){fb();return tw_}
 tw_.visible=false; // kotak lama disembunyikan; kalau GLB gagal dimuat, kotak lama dipakai lagi
 aptPlace(tw_,w,h,d,x,z).then(ok=>{if(!ok){tw_.visible=true;fb()}});
 return tw_}
const WALLS=['#8a8a8f','#b32a6c','#9a968c','#2a7f78','#a03230','#6d6f78','#8c8a96'],HL=[78,64,92,70,86,60,96];
// deretan gedung di SISI KIRI jalan lurus (150 m)
for(let i=0;i<7;i++){const lz=-16-i*22,lx=-50-(i%2)*7;tower(17,18,HL[i],lx,lz,WALLS[i],.32,60+i*13,i%2?0xe0e0e0:0xd0d0d0);
 tower(9,16,7+(i%3)*2,-41,lz-1,'#a9a49a',.5,200+i*7,0xdddddd)}   // ruko/podium rendah menghadap jalan
tower(14,12,70,-76,-30,'#8a8a8f',.3,51);
// deretan apartemen di SISI KANAN jalan lurus (cermin sisi kiri, 7 menara). x=44.4 & lebar 12 -> pas di strip rumput, tidak menyentuh jalan lebar (LKR) sehingga tidak ikut terhapus
for(let i=0;i<7;i++){const rz=-16-i*22;tower(12,18,HL[(i+3)%7],44.4,rz,WALLS[(i+4)%7],.32,310+i*13,i%2?0xd0d0d0:0xe0e0e0)}
// sisi kanan (lebih jauh) & penutup ujung jalan
for(let i=0;i<5;i++){tower(18,17,[74,88,66,96,80][i],60,-40-i*26,WALLS[(i+2)%7],.3,90+i*11)}
tower(22,17,74,62,-18,'#6d6f78',.3,43);
tower(16,14,104,-40,-168,'#2a7f78',.3,23);tower(16,14,96,40,-168,'#a03230',.28,29);
// ---------- pohon ----------
// ---- model pohon birch dari file pohon.glb (disederhanakan: 2 tingkat detail LOD, tekstur WebP 1024) ----
const treeTex=(()=>{const im=new Image(),tx=new THREE.Texture(im);tx.flipY=false;tx.encoding=THREE.sRGBEncoding;tx.anisotropy=Math.min(4,MAXA);
 im.onload=()=>{tx.needsUpdate=true};im.src='data:image/webp;base64,'+TREE_DATA.tex;return tx})();
const treeMat=new THREE.MeshStandardMaterial({map:treeTex,alphaTest:.5,side:THREE.DoubleSide,roughness:.9,metalness:0,emissive:0xffffff,emissiveMap:treeTex,emissiveIntensity:.34});
function treeGeo(o){const bin=atob(o.b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 const n=o.n,q=new Uint16Array(u.buffer.slice(0,n*6)),nr=new Int8Array(u.buffer.slice(n*6,n*9)),uv=new Uint16Array(u.buffer.slice(n*9,n*13)),ix=new Uint16Array(u.buffer.slice(n*13,n*13+o.ti*2));
 const p=new Float32Array(n*3);for(let i=0;i<n*3;i++)p[i]=o.lo[i%3]+q[i]/65535*o.sz[i%3];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(nr,3,true));g.setAttribute('uv',new THREE.BufferAttribute(uv,2,true));g.setIndex(new THREE.BufferAttribute(ix,1));g.computeBoundingSphere();return g}
const TREEG={L0:[treeGeo(TREE_DATA.L0.t),treeGeo(TREE_DATA.L0.l)],L1:[treeGeo(TREE_DATA.L1.t),treeGeo(TREE_DATA.L1.l)]};
function tree(x,z,h,sp,seed){const H=(h<10?h*1.6:h*1.3),lod=new THREE.LOD();
 [['L0',0],['L1',70]].forEach(([k,d])=>{const g=new THREE.Group();TREEG[k].forEach(ge=>g.add(new THREE.Mesh(ge,treeMat)));lod.addLevel(g,d)});
 lod.addLevel(new THREE.Object3D(),240);
 lod.position.set(x,0,z);lod.scale.setScalar(H);lod.rotation.y=R(seed*3.7)*6.283;GP.add(lod);return lod}
// ---- batch pohon GLB: dipakai semua pohon di luar area GP (instancing + LOD per potongan 60 m) ----
window.treeBatch=function(parent,list){ // list: [[x,y,z,tinggi_m,rotY],...] dalam koordinat lokal parent
 const cs=60,ch=new Map(),o=new THREE.Object3D();
 list.forEach(t=>{const k=Math.floor(t[0]/cs)+','+Math.floor(t[2]/cs);let c=ch.get(k);if(!c)ch.set(k,c=[]);c.push(t)});
 ch.forEach(arr=>{let cx=0,cz=0;arr.forEach(t=>{cx+=t[0];cz+=t[2]});cx/=arr.length;cz/=arr.length;
  const lod=new THREE.LOD();
  [['L0',0],['L1',55]].forEach(([k,d])=>{const g=new THREE.Group();
   TREEG[k].forEach(ge=>{const im=new THREE.InstancedMesh(ge,treeMat,arr.length);
    arr.forEach((t,i)=>{o.position.set(t[0]-cx,t[1],t[2]-cz);o.rotation.set(0,t[4],0);o.scale.setScalar(t[3]);o.updateMatrix();im.setMatrixAt(i,o.matrix)});
    im.frustumCulled=false;g.add(im)});
   lod.addLevel(g,d)});
  lod.addLevel(new THREE.Object3D(),260);lod.position.set(cx,0,cz);parent.add(lod)})};
[[-42,-2,14,10],[-52,-6,16,11],[-32,-10,11,8],[-60,-12,15,10],[-38,-22,13,9]].forEach((t,i)=>tree(t[0],t[1],t[2],t[3],i*11+3));
[[36,-3,17,12],[48,-5,19,13],[60,-7,17,12],[34,-20,14,9]].forEach((t,i)=>{if(i===0)return;/* pohon (dunia X -23, Z -36) dihapus: menutupi layar LED wall */tree(t[0],t[1],t[2],t[3],i*13+90)});
for(let i=0;i<15;i++){tree(-36,-14-i*10,8,4.2,300+i,'#2f7234',5);tree(36,-24-i*10,8,4.2,400+i,'#2f7234',5)}
// ---------- TENDA POSKO (model GLB, menggantikan tenda hijau lama) ----------
{tentPlace(GP,37,0,21,-.08);
 const sp=new THREE.Sprite(sprM);sp.scale.set(5,5,1);sp.position.set(37,2.4,21);GP.add(sp);
 const pl_=new THREE.Mesh(new THREE.PlaneGeometry(9,9),poolM);pl_.rotation.x=-Math.PI/2;pl_.position.set(37,.13,21);GP.add(pl_)}
// ---------- lampu jalan ----------
{const lampH=mstd('#3a3d44',.7),headM=mbas({color:0xfff0c4});
 [[-37,4],[37,4],[-22,26],[22,26]].concat(Array.from({length:12},(_,i)=>[-37,-16-i*12]),Array.from({length:12},(_,i)=>[37,-22-i*12])).filter(q=>!(q[0]===37&&q[1]===4)).forEach(([x,z])=>{box(.22,9,.22,lampH,x,4.5,z);const a=box(2.2,.18,.18,lampH,x+(x>0?-1:1)*1.0,9,z);add(new THREE.Mesh(new THREE.SphereGeometry(.32,8,8),headM),x+(x>0?-2:2)*1.0,8.85,z,GP);
  const sp=new THREE.Sprite(sprM);sp.scale.set(7,7,1);sp.position.set(x+(x>0?-2:2)*1.0,8.85,z);GP.add(sp);const p=new THREE.Mesh(new THREE.PlaneGeometry(13,13),poolM);p.rotation.x=-Math.PI/2;p.position.set(x+(x>0?-2:2)*1.0,.12,z);GP.add(p)})}
}catch(e){console.error('GPC',e)}})();



/* ===== KOORDINAT PETA di samping tombol MODE ONARR =====
   Tampil: X, Z (posisi dunia, satuan meter) dan H (arah hadap, derajat; 0 = menghadap -z / arah SPBU). Saat jalan kaki yang tampil posisi karakter.
   Ketuk kotaknya = salin "x:..., z:..., h:..." (h dalam radian, format sama dengan SPAWN) untuk ditempel ke chat. */
let coordRight=-1,coordN=0,coordFlash=0;
window.HUDS=(function(){let o={coord:1,perf:0};try{const j=JSON.parse(localStorage.getItem('dmHud')||'null');if(j)Object.assign(o,j)}catch(e){}return o})();
window.hudSave=function(){try{localStorage.setItem('dmHud',JSON.stringify(HUDS))}catch(e){}};

(function(){const c=document.getElementById('coord');if(!c)return;
 const fb=t=>{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}catch(_){}};
 c.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const o=DR.on?{x:DR.x,z:DR.z,h:DR.yaw}:(ow.foot?wk:ow),t='x:'+o.x.toFixed(1)+', z:'+o.z.toFixed(1)+', h:'+o.h.toFixed(2);
  try{navigator.clipboard.writeText(t).catch(()=>fb(t))}catch(_){fb(t)}
  coordFlash=performance.now()+1000})})();
/* TITIK SPAWN AWAL open world. Patokan: tenda putih di trotoar depan Green Pramuka City (tenda di atas jalur pemandu kuning, TX=49.5 -> dunia x=12,2 z=-49,5).
   Motor muncul di jalur motor (x=40), sejajar tenda itu (z=-49,5), menghadap -z (arah SPBU). Ubah SPAWN.z untuk maju/mundur, SPAWN.x untuk geser kiri/kanan.
   Tips: buka game dengan "#koordinat" di akhir alamat untuk melihat x, z, h motor, lalu salin angkanya ke sini. */
const SPAWN={x:40,z:-49.5,h:0};

const wk={x:0,z:0,h:0,v:0,t:0};let pov=false,lpitch=0;

const walker=mkWalker();walker.visible=false;scene.add(walker);
const riderObj=()=>P.obj.children.find(c=>c.name==='rider');

const LB={ch:0,rel:0,bt:0,pk:0,was:false,mul:1};
/* TENAGA MOTOR: acuan lama = 11 HP (HPV.base). HPV.hp = HP sekarang (18). Percepatan (termasuk akselerasi awal) dikali HPV.hp/HPV.base. Top speed tidak diubah. Ubah HPV.hp untuk menyetel. */
const HPV={base:11,hp:18};HPV.k=()=>HPV.hp/HPV.base;
// Burnout lalu gas: akselerasi awal naik (maks +55% kalau burnout lama), lalu turun pelan ke normal dalam 2,2 detik. Hanya mode ONARR.

// Kalibrasi rasa kecepatan di jalan: 1 = skala asli, makin besar motor terasa makin cepat pada km/j yang sama (angka km/j di HUD tidak berubah)
const FEEL=1.5;

/* ===== JALAN LAYANG (replika gambar referensi 2) =====
   Titik awal & arah ditaksir dari video (berhenti di odometer 976 m). Kalau meleset, cukup ubah RD.x, RD.z, RD.h.
   RD.x,RD.z = titik awal jalan di dunia; RD.h = arah hadap (rad, sama dengan ow.h; Math.PI = menghadap +z).
   Buka game dengan "#koordinat" di akhir alamat untuk melihat x, z, h motor (berguna untuk memindahkan jalan). */
/* Pilar dek kiri (x=45, tiap 35 m) yang z-nya di antara RD_HAPUS.z0 (awal) dan RD_HAPUS.z1 (akhir) tidak dibuat (visual + tabrakan).
   Sekarang: -45 s/d -135 = pilar di z -60, -95, -130. Mau dikembalikan semua: set z0:0,z1:0 (atau ubah rentangnya). */
const RD_HAPUS={z0:-24,z1:-135};const RD_HAPUS2={z0:-164,z1:-481};const inHapus=z=>(z<=RD_HAPUS.z0&&z>=RD_HAPUS.z1)||(z<=RD_HAPUS2.z0&&z>=RD_HAPUS2.z1); // pilar di z -25 ikut dihapus (permintaan: hapus beton dari Z -40.9 s/d -24.4)
/* ===== TIKUNGAN JALAN TOL LAYANG (dek kiri, x~45) =====
   Dek, pilar, trotoar lebar di bawahnya ikut melengkung ke +x (kiri dari arah hadap +z) sesuai garis merah di screenshot.
   Geser dek ke samping sebesar tbOff(z): 0 sebelum a0 (mulai belok di Z 71.6), naik halus sampai A di a1, lalu lurus terus (tetap geser A) sampai ujung.
   Ubah TB.A (seberapa jauh belok, meter), TB.a0/a1 (awal-akhir belokan). TB.on=false untuk mematikan. */
const TB={on:true,A:7,a0:71.6,a1:140};
const tbSS=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};



const RD={x:30,z:95,h:Math.PI,in:false,pd:0,H:6.5,D0:38,D1:150,D2:365.3,D3:477.3,HW:7.4};





(function(){try{
const G=new THREE.Group();G.position.set(RD.x,0,RD.z);G.rotation.y=RD.h;owG.add(G);
const L=6042,cx=3006,conc=std('#3a3c41',.9),O3=new THREE.Object3D();
const noise=(g,w,h)=>{sgrain(g,w,h,900,.05);};
const dash=(g,x,w)=>{g.fillStyle='#d8d8d8';g.fillRect(x-1,10,w,30);g.fillRect(x-1,110,w,30)};
// jalan datar: lajur berlawanan, 4 lajur utama, jalur sepeda hijau
const gT=ctex(256,200,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);noise(g,w,h);g.fillStyle='#2f6f4f';g.fillRect(75+150,0,28,h);
 [38,117,150,183,224].forEach(x=>dash(g,x,3));g.fillStyle='#d8d8d8';[73,77,254].forEach(x=>g.fillRect(x,0,3,h)) /* garis tepi putih di sisi trotoar (px 2, X~44.8) dihapus */},1,L/20);
const gp=add(new THREE.Mesh(new THREE.PlaneGeometry(25.6,L),new THREE.MeshStandardMaterial({map:gT,roughness:.35,metalness:.2})),-2.2,.03,-cx,G);gp.rotation.x=-Math.PI/2;
// dek tanjakan (naik 6,5 m, datar, turun lagi)
const N=(RD.D3-RD.D0)/4,dT=ctex(148,200,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);noise(g,w,h);[41,74,107].forEach(x=>dash(g,x,3));g.fillStyle='#d8d8d8';[5,142].forEach(x=>g.fillRect(x,0,3,h))},1,(RD.D3-RD.D0)/20);
const dg=new THREE.PlaneGeometry(14.8,RD.D3-RD.D0,1,N);dg.rotateX(-Math.PI/2);const pa=dg.attributes.position,mid=(RD.D0+RD.D3)/2;
for(let i=0;i<pa.count;i++)pa.setY(i,rdY(mid-pa.getZ(i))+.05);dg.computeVertexNormals();
add(new THREE.Mesh(dg,new THREE.MeshStandardMaterial({map:dT,roughness:.35,metalness:.2})),0,0,-mid,G);
const dm=add(new THREE.Mesh(dg,new THREE.MeshStandardMaterial({color:0x2e2f33,roughness:.95,side:THREE.DoubleSide})),0,-.9,-mid,G);
// pembatas beton di kiri-kanan tanjakan
const bI=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,1,4.1),conc,N*2);let k=0;
for(let i=0;i<N;i++){const a=RD.D0+i*4,ya=rdY(a),yb=rdY(a+4);[-7.15,7.15].forEach(x=>{O3.position.set(x,(ya+yb)/2+.55,-(a+2));O3.rotation.set(Math.atan2(yb-ya,4),0,0);O3.updateMatrix();bI.setMatrixAt(k++,O3.matrix)})}
G.add(bI);
// kerb hitam-putih di tepi kanan, trotoar, pagar
const cn=Math.floor(L/2),cI=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.2,2),std('#ddd',.7),cn),cc=new THREE.Color();
for(let i=0;i<cn;i++){O3.position.set(10.85,.1,-(i*2-30));O3.rotation.set(0,0,0);O3.updateMatrix();cI.setMatrixAt(i,O3.matrix);cI.setColorAt(i,cc.set(i%2?'#e6e6e6':'#15151a'))}
G.add(cI);
add(new THREE.Mesh(new THREE.BoxGeometry(5.9,.2,L),std('#4a4742',.9)),14.05,.1,-cx,G);
add(new THREE.Mesh(new THREE.BoxGeometry(.05,1,L),new THREE.MeshStandardMaterial({color:0x2b7a78,roughness:.6,transparent:true,opacity:.6})),16.8,.7,-cx,G);
// pohon, lampu jalan
const tG=new THREE.CylinderGeometry(.15,.2,2.4,6),cG=new THREE.SphereGeometry(1.6,8,8),tM=std('#3a2a1c'),lM2=std('#1f5a2a',.9);
const ds=[];for(let d=10;d<6022;d+=(d<460?40:80))ds.push(d);
const mkI=(g,m,f)=>{const im=new THREE.InstancedMesh(g,m,ds.length);ds.forEach((d,i)=>{f(O3.position,d);O3.rotation.set(0,0,0);O3.updateMatrix();im.setMatrixAt(i,O3.matrix)});G.add(im)};
if(window.treeBatch)treeBatch(G,ds.map(d=>[14.8,.15,-d,5.8+(d*37%11)/11*1.4,(d*2.399)%6.283]));else{mkI(tG,tM,(o,d)=>o.set(14.8,1.4,-d));mkI(cG,lM2,(o,d)=>o.set(14.8,3.6,-d));}
mkI(pG,pM,(o,d)=>o.set(12,3.8,-(d+20)));mkI(aG,pM,(o,d)=>o.set(11.1,7.4,-(d+20)));mkI(lG,lM,(o,d)=>o.set(10.2,7.35,-(d+20)));
ds.filter(d=>d<460).forEach(d=>{const sp=new THREE.Sprite(sprM);sp.scale.set(6,6,1);sp.position.set(10.2,7.35,-(d+20));G.add(sp)});
// jalan layang di sisi kiri + pilar bermural
const cL=std('#33353a',.9),tL=std('#222328',.5,.2);cL.fog=tL.fog=false;const sM=[cL,cL,tL,cL,cL,cL];
const TS=-340,TE=RD.D2; // ujung belakang (TS, negatif = mundur ke arah Green Pramuka) dan ujung depan (TE) jalan layang kiri, dalam m dari titik awal RD
{const bg=new THREE.BoxGeometry(14,1,TE-TS,1,1,Math.ceil((TE-TS)/4)),pp=bg.attributes.position;
 for(let i=0;i<pp.count;i++){const d=(TS+TE)/2-pp.getZ(i);pp.setX(i,pp.getX(i)-tbOff(RD.z+d))}
 bg.computeBoundingBox();bg.computeBoundingSphere();
 add(new THREE.Mesh(bg,sM),-15,6,-(TS+TE)/2,G)}
// turunan dek kiri: menurun dari tinggi 6.5 m di d=RD.D2 ke 0 di d=RD.D3 (sama dengan dek jalan utama)
{const rl=Math.hypot(RD.D3-RD.D2,RD.H),th=Math.atan2(-RD.H,RD.D3-RD.D2),rg=new THREE.BoxGeometry(14,1,rl,1,1,Math.ceil(rl/4)),rq=rg.attributes.position;
 for(let i=0;i<rq.count;i++){const d=(RD.D2+RD.D3)/2-rq.getY(i)*Math.sin(th)-rq.getZ(i)*Math.cos(th);rq.setX(i,rq.getX(i)-tbOff(RD.z+d))}
 rg.computeBoundingBox();rg.computeBoundingSphere();
 const rm=add(new THREE.Mesh(rg,sM),-15,RD.H/2-.5*Math.cos(th),-(RD.D2+RD.D3)/2,G);rm.rotation.x=th}
const mT=ctex(128,256,(g,w,h)=>{g.fillStyle='#b7b2a8';g.fillRect(0,0,w,h);const c=['#ff8a1f','#2f9bff','#ff3b8a','#ffd23f','#27c4a0','#7a4bd6'];for(let i=0;i<34;i++){g.fillStyle=c[i%6];g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,8+Math.random()*26,6+Math.random()*18,Math.random()*3,0,6.28);g.fill()}});
const pm=[std('#383a40',.9)],mu=new THREE.MeshStandardMaterial({map:mT,roughness:.8});pm[0].fog=mu.fog=false;
const pgG=new THREE.BoxGeometry(1.8,5.5,1.8),pls=[];
for(let i=-10;i<Math.floor((TE-20)/35)+1;i++){const d=20+i*35;const w=rdWorld(-15,d);if(inHapus(w[1]))continue;if(i)pls.push(d);else{const m0=add(new THREE.Mesh(pgG,mu),-15-tbOff(w[1]),2.75,-d,G);m0.rotation.y=tbYaw(w[1])}
 (window.GP_POLES=window.GP_POLES||[]).push([w[0]+tbOff(w[1]),w[1]])}
const pI=new THREE.InstancedMesh(pgG,pm[0],pls.length);pls.forEach((d,i)=>{const zw=RD.z+d;O3.position.set(-15-tbOff(zw),2.75,-d);O3.rotation.set(0,tbYaw(zw),0);O3.updateMatrix();pI.setMatrixAt(i,O3.matrix)});G.add(pI);
// pilar di bawah turunan dek kiri: tinggi mengikuti dek, hilang kalau sudah pendek
{const rp=[];for(let d=20+Math.floor((TE-20)/35+1)*35;d<RD.D3;d+=35){const h=rdY(d)-1;if(h>=1)rp.push([d,h])}
 const rI=new THREE.InstancedMesh(pgG,pm[0],Math.max(1,rp.length));rI.count=rp.length;
 rp.forEach(([d,h],i)=>{const w=rdWorld(-15,d);O3.position.set(-15-tbOff(w[1]),h/2,-d);O3.rotation.set(0,tbYaw(w[1]),0);O3.scale.set(1,h/5.5,1);O3.updateMatrix();rI.setMatrixAt(i,O3.matrix);(window.GP_POLES=window.GP_POLES||[]).push([w[0]+tbOff(w[1]),w[1]])});
 O3.scale.set(1,1,1);G.add(rI)}
// tiang tengah di bawah tanjakan
const cl=[];for(let d=66;d<RD.D3-10;d+=32){const y=rdY(d)-.9;if(y>1)cl.push([d,y])}
const cpI=new THREE.InstancedMesh(new THREE.BoxGeometry(1.6,1,1.6),pm[0],cl.length);cl.forEach(([d,y],i)=>{O3.position.set(0,y/2,-d);O3.rotation.set(0,0,0);O3.scale.set(1,y,1);O3.updateMatrix();cpI.setMatrixAt(i,O3.matrix)});O3.scale.set(1,1,1);G.add(cpI);
G.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false;if(o.isMesh&&o.material!==tM&&o.material!==lM2&&o.material!==pM)[].concat(o.material).forEach(m=>{m.fog=false})});
}catch(e){console.error('jalan layang',e)}})();

/* ===== SPBU SHELL (replika foto referensi): 300 m dari spawn, sisi kiri jalan =====
   SPBU.x, SPBU.z = pusat kanopi di dunia. Sumbu panjang kanopi sejajar jalan (sumbu z); sisi depan menghadap jalan (+x).
   Ubah SPBU.z kalau mau lebih jauh/dekat (spawn di z=0, motor maju ke -z). */
const SPBU={x:8,z:-330};
/* ===== ASPAL LENGKUNG SPBU SHELL (huruf U terbalik mengitari kanopi + minimarket) =====
   Kaki kiri/kanan mulai dari jalan utama (menyeberangi trotoar), lurus ke belakang sejajar apron, lalu melengkung di belakang minimarket.
   SPR.w = lebar aspal, SPR.a = jarak sumbu aspal dari tengah kanopi (sumbu z), SPR.b = kedalaman lengkung, SPR.xe = titik mulai lengkung, SPR.xs = ujung di jalan. */
const SPR={w:6,a:23.5,b:22,xs:20.2,xe:-10},SPR_P=[];
(function(){const zc=SPBU.z,L=SPR;
 for(let x=L.xs;x>L.xe;x-=.5)SPR_P.push([x,zc+L.a]);
 const n=Math.ceil(Math.PI*(L.a+L.b)/2/.5);for(let i=0;i<=n;i++){const t=Math.PI*i/n;SPR_P.push([L.xe-L.b*Math.sin(t),zc+L.a*Math.cos(t)])}
 for(let x=L.xe+.5;x<=L.xs;x+=.5)SPR_P.push([x,zc-L.a])})();

const SLOT={hz:31.2,xw:-35.5,xe:14.85,hz2:31.2,xr:20.4}; // aspal penuh SPBU: setengah lebar 31.2 (sampai Z karakter -298.8), sisi jalan raya 20
const SPBU_WALLS=[[SLOT.xw,SLOT.xe,SPBU.z+SLOT.hz,SPBU.z+SLOT.hz+.4],[SLOT.xw,SLOT.xe,SPBU.z-SLOT.hz-.4,SPBU.z-SLOT.hz],[SLOT.xw-.4,SLOT.xw,SPBU.z-SLOT.hz-.4,SPBU.z+SLOT.hz+.4]]; // tembok 3 m: sisi +Z, sisi -Z, belakang


(function(){try{
const G=new THREE.Group();G.position.set(SPBU.x,0,SPBU.z);owG.add(G);
const CY=5.6,RED='#d6201d',YEL='#ffcb0b',O3=new THREE.Object3D();
const W=std('#e9ecef',.7),CW=new THREE.MeshStandardMaterial({color:0xe9ecef,roughness:.7,emissive:0x8b939c}),CN=std('#a9a59d',.9);
const B=(w,h,d,m,x,y,z)=>add(new THREE.Mesh(bx(w,h,d),m),x,y,z,G);
const col=(x,z)=>(window.GP_POLES=window.GP_POLES||[]).push([SPBU.x+x,SPBU.z+z]);
const face=(w,h,m,x,y,z,ry)=>{const q=add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m),x,y,z,G);q.rotation.y=ry;return q};
// lantai beton
const pT=ctex(128,128,(g,w,h)=>{g.fillStyle='#b4b0a8';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;g.strokeRect(0,0,w,h);g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.stroke()},9,8);

// kanopi: pelat putih, fasia putih-kuning-merah, lampu bawah
B(14,.5,24,CW,0,CY+.25,0);
const fT=ctex(512,64,(g,w,h)=>{g.fillStyle='#f3f4f6';g.fillRect(0,0,w,h);g.fillStyle=YEL;g.fillRect(0,6,w,34);g.fillStyle=RED;g.fillRect(0,38,w,10)}),fM=new THREE.MeshBasicMaterial({map:fT});
B(.3,1.3,24.6,W,7,CY+.9,0);B(.3,1.3,24.6,W,-7,CY+.9,0);B(14.3,1.3,.3,W,0,CY+.9,12.2);B(14.3,1.3,.3,W,0,CY+.9,-12.2);
face(24.6,1.3,fM,7.16,CY+.9,0,Math.PI/2);face(24.6,1.3,fM,-7.16,CY+.9,0,-Math.PI/2);
const lamp=bas('#ffffff');[-3.5,3.5].forEach(x=>[-9,-3,3,9].forEach(z=>B(1.6,.05,.7,lamp,x,CY-.02,z)));
// tiang, papan harga merah, pulau & dispenser
const sT=ctex(256,160,(g,w,h)=>{g.fillStyle=RED;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.font='bold 38px sans-serif';g.fillText('Shell',w/2,56);g.font='bold 42px sans-serif';g.fillText('V-Power',w/2,106);g.font='22px sans-serif';g.fillText('Performance Fuels',w/2,140)}),sM=new THREE.MeshBasicMaterial({map:sT});
[-3,3].forEach(x=>{[-8,0,8].forEach(z=>{B(.7,CY,.7,W,x,CY/2,z);col(x,z)});B(.25,1.5,2.4,sM,x,3.6,0);B(1.4,.2,22,CN,x,.14,0)});
const pz=[-6.5,-2.2,2.2,6.5],pn=pz.length*2,mkP=(g,m,y)=>{const im=new THREE.InstancedMesh(g,m,pn);let k=0;[-3,3].forEach(x=>pz.forEach(z=>{O3.position.set(x,y,z);O3.rotation.set(0,0,0);O3.updateMatrix();im.setMatrixAt(k++,O3.matrix)}));im.frustumCulled=false;G.add(im)};
mkP(bx(.55,1.7,.9),W,1.09);mkP(bx(.57,.55,.92),std(YEL,.5),1.6);mkP(bx(.6,.14,.95),std(RED,.5),2.0);
[-3,3].forEach(x=>pz.forEach(z=>col(x,z)));
// minimarket putih di belakang, jendela menyala, pita merah-kuning
B(26,4.6,12,W,-30.5,2.3,-25.2);B(26,.3,2.2,W,-30.5,4.5,-18.3);
const wT=ctex(256,64,(g,w,h)=>{g.fillStyle='#2b3d46';g.fillRect(0,0,w,h);g.fillStyle='#ffe9b0';for(let i=0;i<8;i++)g.fillRect(i*32+3,4,26,h-8)});
face(23,2.2,new THREE.MeshBasicMaterial({map:wT}),-30.5,1.8,-19.15,0);face(26,.8,fM,-30.5,4.1,-19.15,0);
for(let t=-13;t<=13.1;t+=1.6)col(-30.5+t,-19.4);for(let z=-31;z<=-19;z+=1.6)col(-17.3,z);
// logo Shell (pecten) di kanopi dan di tiang harga dekat jalan
const lT=ctex(256,256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);const cx=128,cy=150,R=100,pt=[];for(let i=0;i<=7;i++){const a=Math.PI+i*Math.PI/7;pt.push([cx+R*Math.cos(a),cy+R*Math.sin(a)])}
 g.beginPath();g.moveTo(pt[0][0],pt[0][1]);for(let i=0;i<7;i++){const a=Math.PI+(i+.5)*Math.PI/7;g.quadraticCurveTo(cx+R*1.22*Math.cos(a),cy+R*1.22*Math.sin(a),pt[i+1][0],pt[i+1][1])}
 g.lineTo(cx+R*.62,cy+60);g.lineTo(cx-R*.62,cy+60);g.closePath();g.fillStyle=YEL;g.fill();g.lineWidth=10;g.strokeStyle=RED;g.lineJoin='round';g.stroke();
 g.lineWidth=6;for(let i=1;i<7;i++){const a=Math.PI+i*Math.PI/7;g.beginPath();g.moveTo(cx,cy+50);g.lineTo(cx+R*.95*Math.cos(a),cy+R*.95*Math.sin(a));g.stroke()}}),lM3=new THREE.MeshBasicMaterial({map:lT}),wh=bas('#f3f4f6');
const sign=(x,y,z,s)=>B(.5,s,s,[lM3,lM3,wh,wh,wh,wh],x,y,z);
sign(7,CY+2.5,4,3);B(.3,9,.3,W,8,4.5,28.8);B(3.4,3.4,.5,[wh,wh,wh,wh,lM3,lM3],8,9.6,28.8);B(2.6,1.5,.4,sM,8,7.2,28.8);col(8,28.8);
// kerucut oranye & pagar merah-putih
const cone=new THREE.Mesh(new THREE.ConeGeometry(.22,.7,12),std('#ff6a1f',.6));add(cone,9,.4,-12,G);
const bT=ctex(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(0,6,w,6);g.fillRect(0,h-12,w,6);g.fillStyle=RED;for(let i=0;i<=16;i++)g.fillRect(i*15.5,4,5,h-6)});
const bm=new THREE.MeshBasicMaterial({map:bT,transparent:true,alphaTest:.5,side:THREE.DoubleSide});face(3.2,.95,bm,9.5,.5,10,0);face(3.2,.95,bm,9.5,.5,-9,0);
G.traverse(o=>{if(o.isMesh)o.userData.noCast=1});
// bayangan lembut di bawah kanopi: gradasi berlapis, tepi membulat & memudar (menggantikan bayangan kotak keras)
const shT=ctex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(0,0,0,.30)');gr.addColorStop(.45,'rgba(0,0,0,.24)');gr.addColorStop(.7,'rgba(0,0,0,.10)');gr.addColorStop(.88,'rgba(0,0,0,.025)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
shT.isAsph=0;
const shM=new THREE.MeshBasicMaterial({map:shT,transparent:true,depthWrite:false,fog:false});
const shP=add(new THREE.Mesh(new THREE.PlaneGeometry(26,38),shM),0,.2,0,G);shP.rotation.x=-Math.PI/2;shP.renderOrder=2;shP.userData.hqS=1;
G.traverse(o=>{if(o.isMesh)[].concat(o.material).forEach(m=>{m.fog=false})});
}catch(e){console.error('SPBU',e)}})();
(function(){try{
 const P=SPR_P,n=P.length,pos=new Float32Array(n*6),nor=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[];let len=0;
 for(let i=0;i<n;i++){
  const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
  const nx=-tz,nz=tx,h=SPR.w/2,y=sprY(P[i][0]);
  if(i>0)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
  pos.set([P[i][0]+nx*h,y,P[i][1]+nz*h,P[i][0]-nx*h,y,P[i][1]-nz*h],i*6);nor.set([0,1,0,0,1,0],i*6);uv.set([0,len/8,1,len/8],i*4);
  if(i<n-1){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
 const tx=ctex(256,256,(c,w,h)=>{c.fillStyle='#202127';c.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){c.fillStyle=i%2?'rgba(255,255,255,.06)':'rgba(0,0,0,.16)';c.fillRect(Math.random()*w,Math.random()*h,1.3,1.3)}
  },1,1);
 tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tx,roughness:.9,metalness:0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1.5,polygonOffsetUnits:-6}));
 m.frustumCulled=false;m.userData.noCast=1;owG.add(m);
}catch(e){console.error('SPBU aspal',e)}})();
/* ===== HAPUS GARIS KUNING PUTUS-PUTUS tengah jalan utama: dari Z -68.6 sampai Z -472.8 (x tengah = 40) ===== */
try{(function(){
 const t=ctex(64,64,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);sgrain(g,w,h,150,.04)},1,404/8);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1.4,406),new THREE.MeshStandardMaterial({map:t,roughness:.35,metalness:.2,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3}));
 m.rotation.x=-Math.PI/2;m.position.set(40,.015,-270.7);owG.add(m);
})()}catch(e){console.error('hapus garis kuning',e)}
/* ===== ASPAL PENUH SPBU: menutup semua tanah hijau di bawah/sekitar Shell, sampai Z -298.8 (dan simetris sisi lain) ===== */
(function(){try{
 const tx=ctex(256,256,(c,w,h)=>{c.fillStyle='#202127';c.fillRect(0,0,w,h);for(let i=0;i<9000;i++){c.fillStyle=i%2?'rgba(255,255,255,.06)':'rgba(0,0,0,.16)';c.fillRect(Math.random()*w,Math.random()*h,1.3,1.3)}},7,8);
 tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
 const m=new THREE.MeshStandardMaterial({map:tx,roughness:.9,metalness:0,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1.5,polygonOffsetUnits:-5});
 const zc=SPBU.z,S=SLOT,xs=[S.xw,12.5,S.xe,18.9,20,S.xr];
 const mk=(xa,xb,hz)=>{const ya=sprY(xa)-.01,yb=sprY(xb)-.01;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([xa,ya,zc-hz,xb,yb,zc-hz,xb,yb,zc+hz,xa,ya,zc+hz]),3));
  g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0]),3));
  g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([xa/8,-hz/8,xb/8,-hz/8,xb/8,hz/8,xa/8,hz/8]),2));
  g.setIndex([0,2,1,0,3,2]);const q=new THREE.Mesh(g,m);q.frustumCulled=false;q.userData.noCast=1;owG.add(q)};
 mk(xs[0],xs[1],S.hz);mk(xs[1],xs[2],S.hz);mk(xs[2],xs[3],S.hz2);mk(xs[3],xs[4],S.hz2);mk(xs[4],xs[5],S.hz2);
const wm=new THREE.MeshStandardMaterial({color:0x9a968c,roughness:.9,emissive:0x2a2824});
 SPBU_WALLS.forEach(b=>{const q=new THREE.Mesh(new THREE.BoxGeometry(b[1]-b[0],3,b[3]-b[2]),wm);q.position.set((b[0]+b[1])/2,1.5,(b[2]+b[3])/2);q.userData.noCast=1;owG.add(q)});
}catch(e){console.error('SPBU aspal penuh',e)}})();

/* ===== JALAN TOL LAYANG (replika foto referensi 3) =====
   GJ.z0 = awal bagian jalan (z dunia). -530 = 200 m setelah SPBU Shell (z=-330). Ubah GJ.z0 untuk memindahkan, GJ.L = panjang.
   Koordinat lokal: x=0 = jalur motor (x dunia 40), kanan = +x; d = jarak maju (ke arah -z). */
const GJ={z0:-530,L:640};window.GJ_Z0=GJ.z0;
(function(){try{
const G=new THREE.Group();G.position.set(40,0,GJ.z0);owG.add(G);
const L=GJ.L,O3=new THREE.Object3D(),R=k=>Math.abs(Math.sin(k*12.9898+4.1)*43758.5453)%1;
const pole=(u,d)=>(window.GP_POLES=window.GP_POLES||[]).push([40+u,GJ.z0-d]);
const nz=(g,w,h,n,a)=>{sgrain(g,w,h,n,a);};
const M=(t,r,e)=>new THREE.MeshStandardMaterial({map:t||null,color:t?0xffffff:0x808080,roughness:r==null?.7:r,emissive:e?0xffffff:0,emissiveMap:e?t:null,emissiveIntensity:e||0});
const BM=t=>new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.5});
const B=(w,h,l,m,x,y,d)=>add(new THREE.Mesh(new THREE.BoxGeometry(w,h,l),m),x,y,-d,G);
const F=(w,l,m,x,y,d)=>{const q=add(new THREE.Mesh(new THREE.PlaneGeometry(w,l),m),x,y,-d,G);q.rotation.x=-Math.PI/2;return q};
const I=(g,m,a,col)=>{const im=new THREE.InstancedMesh(g,m,a.length),c=new THREE.Color();a.forEach(([x,y,d,sx,sy,sz,ry,cc],i)=>{O3.position.set(x,y,-d);O3.rotation.set(0,ry||0,0);O3.scale.set(sx||1,sy||1,sz||1);O3.updateMatrix();im.setMatrixAt(i,O3.matrix);if(col)im.setColorAt(i,c.set(cc))});O3.scale.set(1,1,1);im.frustumCulled=false;G.add(im);return im};
const conc=std('#3a3c41',.9),conc2=std('#45474d',.85);conc.fog=conc2.fog=false;
// ---- tanah: paving/pelataran di seluruh area (menutup jalan petak bawaan) ----
const gT=ctex(128,128,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);nz(g,w,h,500,.06)},34*12,L/4);
const gM=M(gT,.9);gM.polygonOffset=true;gM.polygonOffsetFactor=-1;gM.polygonOffsetUnits=-1;
F(2040,L,gM,10,.02,L/2);
// ---- badan jalan: jalur sepeda hijau, 2 lajur kiri, 3 lajur utama, gore bergaris miring, jalur kanan beraspal baru ----
const U0=-14.5,UW=39.5,PX=16,X=u=>(u-U0)*PX;
const rT=ctex(Math.round(UW*PX),512,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);g.fillStyle='#202127';g.fillRect(X(13.5),0,X(24.5)-X(13.5),h);
 nz(g,w,h,7000,.05)},1,L/32);
const rM=M(rT,.35);rM.metalness=.2;rM.polygonOffset=true;rM.polygonOffsetFactor=-3;rM.polygonOffsetUnits=-3;
F(UW,L,rM,U0+UW/2,.04,L/2);
// ---- jalan layang (kanan): dek, balok melintang, gelagar, pagar & pilar besar ----
const DL=L+120,dc=(L-40)/2+0;
const concD=std('#2b2c30',.9);concD.fog=false;B(34,2.2,DL,concD,22.5,10.1,L/2);B(.35,1.1,DL,conc2,5.7,11.75,L/2);B(.1,.1,DL,bas('#bbb'),5.7,12.4,L/2);
const bb=[],gp=[];for(let d=-40;d<L+80;d+=7)bb.push([22.5,8.55,d]);I(new THREE.BoxGeometry(33,.7,.8),conc,bb);
[9,18,28].forEach(u=>B(.9,1.1,DL,conc,u,8.5,L/2));for(let d=-40;d<L+80;d+=3)gp.push([5.7,12.1,d]);I(new THREE.BoxGeometry(.1,.7,.1),conc2,gp);
const ps=[],pc=[],pb=[];for(let d=20;d<L+60;d+=35){ps.push([12.2,4.2,d]);pc.push([12.2,8.3,d]);pb.push([12.2,.65,d]);[11.3,12.2,13.1].forEach(u=>pole(u,d))}
I(new THREE.BoxGeometry(2.4,8.4,2.2),conc,ps);I(new THREE.BoxGeometry(6.6,1.2,2.8),conc,pc);I(new THREE.BoxGeometry(3,1.3,2.6),conc,pb);
// dek kedua lebih rendah di kejauhan kanan + pohon di bawahnya
B(32,1.4,DL,conc,56,7.2,L/2);const p2=[];for(let d=10;d<L+80;d+=30)p2.push([44,3.2,d]);I(new THREE.BoxGeometry(1.8,6.4,1.8),conc,p2);
G.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false});
}catch(e){console.error('Jalan Tol Layang',e)}})();

/* ===== SAMBUNGAN JALAN LAYANG: dek kiri (RD) -> dek tol kanan (GJ) =====
   Menutup celah antara ujung depan dek kiri (dunia z sekitar -245) dan awal dek tol kanan (z = GJ.z0+40).
   Dek meliuk halus (smoothstep): lebar 14 -> 34 m, tinggi atas 6,5 -> 11,2 m, jadi kedua ujungnya pas rata dengan dek yang sudah ada.
   Ubah SJ.* kalau mau menyesuaikan. Visual saja (tidak bisa dikendarai), sama seperti dek kiri & kanannya. */
const SJ=(()=>{const a=rdWorld(-15,-340);return{xA:a[0],zA:a[1],wA:14,cA:6,tA:1,xB:40+22.5,zB:GJ.z0+40,wB:34,cB:10.1,tB:2.2,N:48}})();
(function(){try{
const G=new THREE.Group();owG.add(G);
const ss=t=>t*t*(3-2*t);
const at=t=>{const s=ss(t),th=SJ.tA+(SJ.tB-SJ.tA)*s,yc=SJ.cA+(SJ.cB-SJ.cA)*s,w=SJ.wA+(SJ.wB-SJ.wA)*s,xc=SJ.xA+(SJ.xB-SJ.xA)*s;return{z:SJ.zA+(SJ.zB-SJ.zA)*t,xc,w,xl:xc-w/2,xr:xc+w/2,yt:yc+th/2,yb:yc-th/2}};
const S=[];for(let i=0;i<=SJ.N;i++)S.push(at(i/SJ.N));
const tp=[],sd=[];
const quad=(r,a,b,c,d)=>r.push(...a,...b,...c,...a,...c,...d);
const TL=s=>[s.xl,s.yt,s.z],TR=s=>[s.xr,s.yt,s.z],BL=s=>[s.xl,s.yb,s.z],BR=s=>[s.xr,s.yb,s.z];
for(let i=0;i<SJ.N;i++){const p=S[i],q=S[i+1];
 quad(tp,TL(p),TR(p),TR(q),TL(q));
 quad(sd,BL(q),BR(q),BR(p),BL(p));
 quad(sd,BR(p),BR(q),TR(q),TR(p));
 quad(sd,TL(p),TL(q),BL(q),BL(p))}
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(tp.concat(sd)),3));
geo.addGroup(0,tp.length/3,0);geo.addGroup(tp.length/3,sd.length/3,1);geo.computeVertexNormals();
const mt=std('#222328',.5,.2),mc=std('#33353a',.9),pm=std('#383a40',.9);[mt,mc,pm].forEach(m=>{m.fog=false});mt.side=mc.side=THREE.DoubleSide;
G.add(new THREE.Mesh(geo,[mt,mc]));
// pilar mengikuti pola dek kiri (jarak 35 m); dek yang melebar ditopang 2 pilar + balok kepala
const pole=(x,z)=>(window.GP_POLES=window.GP_POLES||[]).push([x,z]);
const col=(x,z,h,w)=>{if(inHapus(z))return;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),pm);m.position.set(x,h/2,z);G.add(m);pole(x,z)};
for(let z=SJ.zA-25;z>SJ.zB+5;z-=35){const o=at((SJ.zA-z)/(SJ.zA-SJ.zB));
 if(o.w<=18)col(o.xc,z,o.yb,1.8);
 else{const cp=new THREE.Mesh(new THREE.BoxGeometry(o.w*.8,1.2,2.4),pm);cp.position.set(o.xc,o.yb-.6,z);G.add(cp);[-1,1].forEach(k=>col(o.xc+k*o.w*.28,z,o.yb-1.2,2.2))}}
}catch(e){console.error('Sambungan jalan layang',e)}})();



/* ===== TROTOAR LEBAR di bawah jalan tol (mulai X 46.2, Z -41.7, memanjang 1 km ke arah +z) =====
   TROT.h = tinggi trotoar = tinggi spakbor depan motor. Diukur dari model motor: puncak spakbor depan = 0,508 m -> dipakai 0,51 m.
   MOTOR TIDAK BISA NAIK: sisi trotoar jadi tembok (lihat trotWall). Karakter jalan kaki tetap bisa naik (langsung setinggi TROT.h). */
const TROT={x:46.2,z0:-24.4,len:982.7,w:10,h:.51}; // ujung depan digeser ke Z -24.4 (bagian Z -41.7 s/d -24.4 dihapus), ujung belakang tetap Z 958.3
 // ujung depan = setengah lingkaran (pusat Z z0+w/2)

// tabrakan motor vs trotoar: 3 titik badan motor (depan, tengah, belakang) didorong keluar dari kotak trotoar

(function(){try{
const T=TROT,z0=T.z0,hh=T.h,HW=T.w/2,zs=z0+HW,Ls=T.len-HW;
const pv=ctex(128,128,(g,w,h)=>{g.fillStyle='#8e8b84';g.fillRect(0,0,w,h);sgrain(g,w,h,500,.06);g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke()},T.w/2,T.len/2);
// permukaan atas (paving)
const topM=new THREE.MeshStandardMaterial({map:pv,roughness:.85,emissive:0x2b2926,side:THREE.DoubleSide});
const pg=new THREE.PlaneGeometry(T.w,Ls,1,Math.ceil(Ls/4));tbBend(pg,(x,y,z)=>zs+Ls/2-y);{const uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*Ls/T.len)}
const top=new THREE.Mesh(pg,topM);top.rotation.x=-Math.PI/2;top.position.set(T.x,hh,zs+Ls/2);owG.add(top);
// ujung depan setengah lingkaran (lantai paving)
const cg=new THREE.CircleGeometry(HW,64,0,Math.PI);{const p=cg.attributes.position,uv=cg.attributes.uv;for(let i=0;i<p.count;i++){uv.setXY(i,(p.getX(i)+HW)/T.w,Ls/T.len+p.getY(i)/T.len)}}
const cap=new THREE.Mesh(cg,topM);cap.rotation.x=-Math.PI/2;cap.position.set(T.x,hh,zs);owG.add(cap);
// dinding samping tegak (atas & bawah kotak disembunyikan, atas sudah ditutup bidang paving)
const hid=new THREE.MeshBasicMaterial({visible:false}),sdw=new THREE.MeshStandardMaterial({color:0xa5a29a,roughness:.9,emissive:0x2e2c28});
const wall=new THREE.Mesh(tbBend(new THREE.BoxGeometry(T.w,hh,Ls,1,1,Math.ceil(Ls/4)),(x,y,z)=>zs+Ls/2+z),[sdw,sdw,hid,hid,sdw,hid]);wall.position.set(T.x,hh/2,zs+Ls/2);owG.add(wall);
const cwall=new THREE.Mesh(new THREE.CylinderGeometry(HW,HW,hh,64,1,true,Math.PI/2,Math.PI),sdw);cwall.position.set(T.x,hh/2,zs);owG.add(cwall);
// bibir terang di tepi atas supaya sisi trotoar kelihatan jelas
const lipM=new THREE.MeshStandardMaterial({color:0xd6d3ca,roughness:.8,emissive:0x3a3833});
[-1,1].forEach(sd=>{const l=new THREE.Mesh(tbBend(new THREE.BoxGeometry(.14,.03,Ls,1,1,Math.ceil(Ls/4)),(x,y,z)=>zs+Ls/2+z),lipM);l.position.set(T.x+sd*(T.w/2-.07),hh+.012,zs+Ls/2);owG.add(l)});
const lipR=new THREE.Mesh(new THREE.RingGeometry(HW-.14,HW,64,1,0,Math.PI),new THREE.MeshStandardMaterial({color:0xd6d3ca,roughness:.8,emissive:0x3a3833,side:THREE.DoubleSide}));lipR.rotation.x=-Math.PI/2;lipR.position.set(T.x,hh+.027,zs);owG.add(lipR);
// jalur pemandu kuning di tengah trotoar
const gm=new THREE.Mesh(tbBend(new THREE.BoxGeometry(.4,.02,T.len-2,1,1,Math.ceil(T.len/4)),(x,y,z)=>z0+T.len/2+z),new THREE.MeshStandardMaterial({color:0xd9ae1e,roughness:.7,emissive:0x4a3a05}));
gm.position.set(T.x,hh+.012,z0+T.len/2);owG.add(gm);
}catch(e){console.error('Trotoar lebar',e)}})();

/* ===== JALAN LEBAR SISI KIRI (lihat parameter LKR di atas) ===== */
(function(){try{
const L=LKR,len=L.len,w=L.w,cx=L.x0-len/2;
// tekstur aspal: kerb hitam-putih di tepi, garis tepi putih, 4 lajur (garis putus-putus), garis tengah kuning ganda. Satu ulangan = 12 m
const rt=ctex(256,256,(g,W,H)=>{g.fillStyle='#202127';g.fillRect(0,0,W,H);
 sgrain(g,W,H,2200,.05);
 for(let x=0;x<W;x+=32){g.fillStyle=(x/32)%2?'#e8e8e8':'#18181c';g.fillRect(x,0,32,4);g.fillRect(x,H-4,32,4)}
 g.fillStyle='#dcdcd8';g.fillRect(0,12,W,3);g.fillRect(0,H-15,W,3);
 [69,187].forEach(y=>g.fillRect(8,y-1,64,3));
 g.fillStyle='#d9b020';g.fillRect(0,124,W,2);g.fillRect(0,130,W,2)},len/12,1);
const rm=new THREE.MeshStandardMaterial({map:rt,roughness:.35,metalness:.2});rm.polygonOffset=true;rm.polygonOffsetFactor=-4;rm.polygonOffsetUnits=-4;
const road=new THREE.Mesh(new THREE.PlaneGeometry(len,w),rm);road.rotation.x=-Math.PI/2;road.position.set(cx,L.y,L.z);owG.add(road);
// lampu jalan di kedua sisi, tiap 30 m, melengkung ke arah jalan (tiang bisa ditabrak)
for(let k=0;k<Math.floor((len-14)/30)+1;k++)[-1,1].forEach(sd=>{
 const px=L.x0-14-k*30,pz=L.z+sd*(w/2+1.4),g=new THREE.Group();g.position.set(px,0,pz);owG.add(g);
 add(new THREE.Mesh(pG,pM),0,3.6,0,g);
 const arm=add(new THREE.Mesh(aG,pM),0,7.2,-sd*.9,g);arm.rotation.y=Math.PI/2;
 add(new THREE.Mesh(lG,lM),0,7.15,-sd*1.8,g);
 const sp=new THREE.Sprite(sprM);sp.scale.set(6,6,1);sp.position.set(0,7.15,-sd*1.8);g.add(sp);
 const p=add(new THREE.Mesh(plG,poolM),0,L.y+.1,-sd*3.4,g);p.rotation.x=-Math.PI/2;
 (window.GP_POLES=window.GP_POLES||[]).push([px,pz])});
// bersihkan apa pun (gedung, pohon, tembok, pagar tanaman, tiang) yang ketimpa jalan; lantai/trotoar rendah dibiarkan
if(L.clear&&window.GPG){const G=window.GPG;G.updateMatrixWorld(true);const bb=new THREE.Box3(),xa=L.x0-len-.5,xb=L.x0+.5,za=L.z-w/2-.5,zb=L.z+w/2+.5;
 G.children.slice().forEach(ch=>{if(ch.isLight)return;bb.setFromObject(ch);if(bb.isEmpty()||bb.max.y<.3)return;
  if(bb.max.x<xa||bb.min.x>xb||bb.max.z<za||bb.min.z>zb)return;G.remove(ch)});
 if(window.GP_POLES)window.GP_POLES=window.GP_POLES.filter(q=>!lkrIn(q[0],q[1],1))}
}catch(e){console.error('Jalan lebar kiri',e)}})();
/* ===== PULAU LALU LINTAS + TIANG JALAN LAYANG BERMURAL + LAMPU LALU LINTAS (replika foto Street View) =====
   Titik pusat dari koordinat: X 46.4, Z -66.0 (tepat di bawah dek jalan layang kiri, di ujung depan trotoar lebar).
   ISL = pulau beton (w = lebar sumbu x, l = panjang sumbu z, h = tinggi). Motor TIDAK bisa naik; karakter jalan kaki bisa.
   PIL = tiang (sx x sz), menopang dek (dasar dek y = 5,5). Tiang menghalangi motor dan karakter. */
const ISL={x:46.4,z:-66,w:5.2,l:8,h:.2}; // bentuk OVAL: w = lebar (sumbu x), l = panjang (sumbu z)
const PIL={x:46.4,z:-66,sx:2.4,sz:3};
// daftar lokasi pulau+tiang (salinan). Tambah baris baru {x,z} untuk menambah lagi.
const ISLS=[{x:46.4,z:-66},{x:46.8,z:-43.2}];




ISLS.forEach(S=>{try{
const I=Object.assign({},ISL,S),Q=Object.assign({},PIL,S),DB=5.5; // DB = dasar dek layang
// pulau: lantai paving + dinding tegak + bibir terang
const pT=ctex(128,128,(g,w,h)=>{g.fillStyle='#8a8882';g.fillRect(0,0,w,h);sgrain(g,w,h,500,.06);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2)},I.w/2,I.l/2);
const ea=I.w/2,eb=I.l/2;
const top=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshStandardMaterial({map:pT,roughness:.85,emissive:0x2b2926,side:THREE.DoubleSide}));
top.scale.set(ea,eb,1);top.rotation.x=-Math.PI/2;top.position.set(I.x,I.h,I.z);owG.add(top);
const sdw=new THREE.MeshStandardMaterial({color:0xa09d95,roughness:.9,emissive:0x2e2c28,side:THREE.DoubleSide});
const wl=new THREE.Mesh(new THREE.CylinderGeometry(1,1,I.h,64,1,true),sdw);wl.scale.set(ea,1,eb);wl.position.set(I.x,I.h/2,I.z);owG.add(wl);
const lip=new THREE.MeshStandardMaterial({color:0xd0cdc4,roughness:.8,emissive:0x34322e,side:THREE.DoubleSide});
const rg2=new THREE.Mesh(new THREE.RingGeometry(.95,1,64),lip);rg2.scale.set(ea,eb,1);rg2.rotation.x=-Math.PI/2;rg2.position.set(I.x,I.h+.012,I.z);owG.add(rg2);
// mural tiang: latar oranye, orang-orangan (atlet), lingkaran, corat-coret abu-abu di bawah
const mT=ctex(256,512,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#f08a38');gr.addColorStop(1,'#d9622a');g.fillStyle=gr;g.fillRect(0,0,W,H);
 for(let i=0;i<9;i++){g.fillStyle=i%2?'rgba(255,214,90,.55)':'rgba(255,255,255,.28)';g.beginPath();g.arc(30+((i*83)%200),60+((i*61)%300),20+(i%3)*10,0,7);g.fill()}
 g.strokeStyle='#7a1f14';g.lineWidth=7;g.lineCap='round';
 for(let i=0;i<6;i++){const x=40+(i%2)*110+((i*29)%30),y=80+Math.floor(i/2)*100,a=(i%3-1)*.6;g.beginPath();g.arc(x,y,10,0,7);g.stroke();
  g.beginPath();g.moveTo(x,y+10);g.lineTo(x,y+48);g.moveTo(x,y+22);g.lineTo(x+22*Math.cos(a),y+22-16*Math.sin(a+.8));g.moveTo(x,y+22);g.lineTo(x-22*Math.cos(a),y+22+12);g.moveTo(x,y+48);g.lineTo(x+16,y+82);g.moveTo(x,y+48);g.lineTo(x-14,y+80);g.stroke()}
 g.fillStyle='#fff';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('JUARA',W/2,36);
 g.fillStyle='#8f8c86';g.fillRect(0,H*.8,W,H*.2);g.strokeStyle='#2b2b2b';g.lineWidth=5;g.beginPath();for(let x=10;x<W;x+=24){g.moveTo(x,H*.82);g.lineTo(x+14,H*.97);g.lineTo(x+22,H*.84)}g.stroke()},1,1);
const mm=new THREE.MeshStandardMaterial({map:mT,roughness:.85,emissive:0x2a1608,emissiveMap:mT,emissiveIntensity:.45}),cc=new THREE.MeshStandardMaterial({color:0x8c8a86,roughness:.9,emissive:0x1d1c1a});
const sh=DB-.6-I.h;
const shaft=new THREE.Mesh(new THREE.BoxGeometry(Q.sx,sh,Q.sz),[mm,mm,cc,cc,mm,mm]);shaft.position.set(Q.x,I.h+sh/2,Q.z);owG.add(shaft);
const cap=new THREE.Mesh(new THREE.BoxGeometry(Q.sx+1.1,.6,Q.sz+1),cc);cap.position.set(Q.x,DB-.3,Q.z);owG.add(cap);
const bs=new THREE.Mesh(new THREE.BoxGeometry(Q.sx+.3,.25,Q.sz+.3),cc);bs.position.set(Q.x,I.h+.125,Q.z);owG.add(bs);
// lampu lalu lintas di kedua ujung pulau (merah menyala), menghadap pengendara dari tiap arah
const rg=glowM(0xff2a2a),bk=std('#111',.6),pm=std('#3d3d42',.6,.5);
[[1,I.z+I.l/2-.7],[-1,I.z-I.l/2+.7]].forEach(([sd,pz])=>{
 const g=new THREE.Group();g.position.set(I.x,I.h,pz);owG.add(g);
 add(new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,3.6,8),pm),0,1.8,0,g);
 add(new THREE.Mesh(new THREE.BoxGeometry(.38,1.05,.32),bk),0,3.55,sd*.2,g);
 [['#ff2a2a',3.88],['#4a3a05',3.55],['#053a12',3.22]].forEach(([c,y])=>add(new THREE.Mesh(new THREE.SphereGeometry(.11,10,10),bas(c)),0,y,sd*.38,g));
 const sp=new THREE.Sprite(rg);sp.scale.set(1.6,1.6,1);sp.position.set(0,3.88,sd*.5);g.add(sp)});
}catch(e){console.error('Pulau & tiang layang',e)}});
// tinggi lantai kawasan Green Pramuka (lantai paving/aspal/rumput sedikit di atas y=0) supaya roda tidak tenggelam
let gpcGY=0,gpcPitch=0,gpcBY=0;
const NSW={x0:14.85,x1:18.9,y:.02,segs:[[-75.4,-298.8],[-361.2,-534.7]]}; // trotoar GLB di pinggir kiri jalan utama; terputus di apron SPBU Shell (Z -310..-350)


/* ===== TINGGI ASPAL NYATA (anti ban/velg tembus aspal) =====
   gpcH0 = tinggi lantai bawaan. Di area tanpa aturan khusus ia mengembalikan 0, padahal di atasnya bisa ada lapisan aspal/marka tipis (y 0.01-0.1)
   sehingga ban/velg tampak tenggelam. grdH menembakkan sinar ke bawah ke bidang-bidang lantai (anak langsung owG) dan memakai tinggi permukaan yang terlihat. */
const GRD={list:[],n:-1,rc:new THREE.Raycaster(),o:new THREE.Vector3(),d:new THREE.Vector3(0,-1,0),cache:new Map()};



/* ===== KAMERA TIDAK MENEMBUS TEMBOK SPBU SHELL =====
   Garis dari pemain ke kamera diuji terhadap tembok SPBU (tinggi 3 m) dan minimarket (tinggi 4,6 m); kalau terpotong, kamera ditarik maju ke depan tembok. */
const CAM_WALLS=SPBU_WALLS.map(b=>[b[0],b[1],b[2],b[3],3]).concat([[-35.5,-9.5,-361.2,-349.2,4.6]]);


const hold=(id,k)=>{const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}inp[k]=1});['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,()=>inp[k]=0))};
hold('bl','l');hold('br','r');hold('brk','brk');hold('bn','bn');hold('rv','rev');hold('run','run');
$('mt').addEventListener('pointerdown',e=>{e.preventDefault();toggleMount()});
addEventListener('keydown',e=>{if(e.code==='KeyE')toggleMount()});

const kk={ShiftLeft:'run',ShiftRight:'run',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',KeyS:'brk',ArrowDown:'brk',KeyB:'bn',KeyV:'rev'};
addEventListener('keydown',e=>{if(kk[e.code])inp[kk[e.code]]=1;if(e.code==='KeyW')setGas(true)});
addEventListener('keyup',e=>{if(kk[e.code])inp[kk[e.code]]=0;if(e.code==='KeyW')setGas(false)});

$('bk').onclick=()=>openGameMenu();

let last=performance.now();
let qAcc=0,qN=0,qPR=renderer.getPixelRatio();



document.addEventListener('visibilitychange',()=>{if(document.hidden){setGas(false);if(typeof joyReset==='function')joyReset()}else{last=performance.now();requestAnimationFrame(loop)}});
/* requestAnimationFrame(loop) dipindah ke akhir js/models3d.js supaya game loop baru mulai setelah semua file termuat */

let SND=1,MUS=1;try{const a=parseFloat(localStorage.getItem('vGame')),b=parseFloat(localStorage.getItem('vMus'));if(a>=0&&a<=1)SND=a;if(b>=0&&b<=1)MUS=b}catch(e){}

const HOME_IMG=__BIG[7];



tapHome('hOW',()=>{audio();reset();setMode('ow');cyaw=0;cpitch=.25;startOW();st='ow';hideHome()});
/* ===== ZEBRA CROSS: dari titik awal (X 39.4, Z -43.4) sampai titik akhir (X 21.1, Z -43.0) =====
   Belang putih berjajar di sepanjang garis A->E, tiap belang memanjang melintang garis itu (seperti foto referensi).
   ZW = panjang tiap belang (m), NB = jumlah belang (lebar belang = lebar celah, pas dari titik awal sampai titik akhir), Y = tinggi di atas aspal. */
try{(function(){
 const A={x:39.4,z:-43.4},E={x:21.1,z:-43.0},ZW=3.5,NB=19,Y=.02;
 const dx=E.x-A.x,dz=E.z-A.z,len=Math.hypot(dx,dz),W=2048,H=256,U=W/(2*NB-1);
 let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 for(let i=0;i<NB;i++){g.fillStyle='rgba(236,236,230,'+(.9+rnd()*.1).toFixed(3)+')';g.fillRect(i*2*U,0,U,H)}
 g.globalCompositeOperation='destination-out'; /* cat agak aus/terkelupas seperti di foto */
 for(let k=0;k<2600;k++){g.fillStyle='rgba(0,0,0,'+(.15+rnd()*.35).toFixed(2)+')';const s=1+rnd()*3;g.fillRect(rnd()*W,rnd()*H,s,s)}
 const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=MAXA;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(len,ZW),new THREE.MeshStandardMaterial({map:tx,transparent:true,roughness:.9,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
 m.rotation.x=-Math.PI/2;
 const G=new THREE.Group();G.position.set((A.x+E.x)/2,Y,(A.z+E.z)/2);G.rotation.y=Math.atan2(-dz,dx);G.add(m);owG.add(G);
})()}catch(e){console.error('zebra cross',e)}
/* ===== HAPUS JALAN: jalan lurus ke arah barat mulai dari X 18.1 (Z -116.5, menghadap 91°), aspal + marka + trotoar kiri-kanan =====
   Jalan dasar Open World adalah satu tekstur ubin 80 m (owRoad), jadi tidak bisa dihapus per bagian. Koridornya ditimpa tanah hijau gelap
   yang sama persis dengan area kosong di map. Jalan ini berpusat di Z -120: aspal 42.2 m + trotoar 4 m tiap sisi => setengah lebar 25.2 m (+margin).
   X0 = titik awal (ke arah X mengecil), LEN = panjang penimpa, CZ = pusat jalan, HW = setengah lebar koridor. */
try{(function(){
 const X0=18.1,LEN=20000,CZ=-120,HW=25.25,Y=.01;
 const t=ctex(512,512,(g,w,h)=>{g.fillStyle='#17181c';g.fillRect(0,0,w,h);
  sgrain(g,w,h,4000,.04);},LEN/80,HW*2/80);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(LEN,HW*2),new THREE.MeshStandardMaterial({map:t,roughness:.3,metalness:.3,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));
 m.rotation.x=-Math.PI/2;m.position.set(X0-LEN/2,Y,CZ);owG.add(m);
})()}catch(e){console.error('hapus jalan',e)}
/* ===== HAPUS SEMUA BELOKAN KIRI DI DEPAN (kecuali LKR) ===== */
try{(function(){
 const X0=18.1,XL=20000,ZL=20000,Y=.02,SW=false;
 const mat=t=>new THREE.MeshStandardMaterial({map:t,roughness:.3,metalness:.3,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});
 const t=ctex(512,512,(g,w,h)=>{g.fillStyle='#17181c';g.fillRect(0,0,w,h);
  sgrain(g,w,h,4000,.04);},XL/80,ZL/80);
 const ZE=Math.max(10,LFT_Z0-(window.GJ_Z0!=null?window.GJ_Z0:-530)); /* berhenti di Z -530: setelahnya tanah tol yang menutup (hindari 2 bidang menumpuk = kedip hitam) */
 const m=new THREE.Mesh(new THREE.PlaneGeometry(XL,ZE),mat(t));
 m.rotation.x=-Math.PI/2;m.position.set(X0-XL/2,Y,LFT_Z0-ZE/2);owG.add(m);
 if(SW){
  const s=ctex(8,8,(g,w,h)=>{g.fillStyle='#3b3b42';g.fillRect(0,0,w,h)},1,1);
  const sm=new THREE.Mesh(new THREE.PlaneGeometry(X0-14.84,ZL),mat(s));
  sm.rotation.x=-Math.PI/2;sm.position.set((X0+14.84)/2,Y+.005,LFT_Z0-ZL/2);owG.add(sm)}
})()}catch(e){console.error('hapus belokan kiri',e)}
/* ===== PERSEMPIT JALAN: jalan grid di Z -40 (membentang ke arah X) dibuat 1/K lebih sempit, lalu dilebarkan lagi ke kiri/kanan =====
   Jalan dasar adalah tekstur ubin 80 m (owRoad), jadi diatur dengan menimpa sisi luarnya pakai tanah hijau gelap yang sama (seperti "hapus jalan").
   Perempatan (lebar penuh) tidak diubah; hanya ruas lurus di antara perempatan. Ukuran asli: aspal 42.2 m + pinggir abu-abu 4.05 m tiap sisi.
   NR = daftar jalan: z = sumbu tengah jalan asli, k = pembagi lebar (3 = 3x lebih kecil),
   l = tambahan lebar ke KIRI (sisi -z, kiri saat menghadap +x), r = tambahan ke KANAN (sisi +z), satuannya 1 = satu lebar aspal sempit (k=3: 14.07 m).
   Batas: aspal tidak bisa melebihi lebar asli 42.2 m (untuk k=3: l+r maksimal 1 sisi dari tiap arah = 1). Garis kuning putus-putus dipindah ke tengah aspal yang baru. */
try{(function(){
 const NR=[{z:-40,k:3,l:1,r:0}];
 const AS=21.1,ED=25.15,Y=.02,XMIN=-320,XMAX=320;
 const mat=(t,o)=>new THREE.MeshStandardMaterial({map:t,roughness:.3,metalness:.3,polygonOffset:true,polygonOffsetFactor:-4-(o||0),polygonOffsetUnits:-4-(o||0)});
 const noise=(g,w,h,n)=>{sgrain(g,w,h,n,.04);};
 const grass=(rx,ry)=>ctex(128,128,(g,w,h)=>{g.fillStyle='#17181c';g.fillRect(0,0,w,h);noise(g,w,h,500)},rx,ry);
 const asph=ctex(64,64,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);noise(g,w,h,150)},1,1);
 const grey=ctex(8,8,(g,w,h)=>{g.fillStyle='#3b3b42';g.fillRect(0,0,w,h)},1,1);
 const yel=ctex(8,8,(g,w,h)=>{g.fillStyle='#d8c050';g.fillRect(0,0,w,h)},1,1);
 const strip=(t,x0,x1,z,d,y,o)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,d),mat(t,o));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,y,z);owG.add(m)};
 NR.forEach(N=>{if(!(N.k>1))return;
  const asN=AS/N.k,band=ED/N.k-asN,W=2*asN;
  const asL=Math.min(AS,asN+(N.l||0)*W),asR=Math.min(AS,asN+(N.r||0)*W),zc=N.z+(asR-asL)/2;
  for(let m=-4;m<=4;m++){ if(m===0)continue; // kolom x=0 = lantai Green Pramuka (plaza): jangan ditimpa tanah hijau
   // ruas di antara perempatan: kolom blok di x = 80*m, setengah lebar 40-ED
   const cx=80*m,x0=Math.max(XMIN,cx-(40-ED)),x1=Math.min(XMAX,cx+(40-ED));if(x1-x0<=.01)continue;
   [[-1,asL],[1,asR]].forEach(([s,as])=>{
    const outer=as+band,gd=ED+.05-outer;
    if(gd>0)strip(grass((x1-x0)/80,gd/80),x0,x1,N.z+s*(outer+gd/2),gd,Y,0);   // sisi luar -> tanah hijau
    strip(grey,x0,x1,N.z+s*(as+band/2),band,Y+.005,1)});                       // pinggir abu-abu baru (tipis)
   if(Math.abs(zc-N.z)>1){ // geser garis kuning putus-putus ke tengah aspal baru (2 garis per ruas, 5 m, di cx±(2.5..7.5))
    [-5,5].forEach(o=>{const dx=cx+o;if(dx-2.5<XMIN||dx+2.5>XMAX)return;
     strip(asph,dx-2.6,dx+2.6,N.z,1.4,Y+.002,1);      // tutup garis lama dengan aspal
     strip(yel,dx-2.5,dx+2.5,zc,.94,Y+.006,2)})}      // garis baru di tengah
  }
 })
})()}catch(e){console.error('persempit jalan',e)}
/* ===== TROTOAR GLB (pinggir kiri jalan utama): Z -75.4 s/d -534.7, terputus di SPBU Shell (apron Z -310..-350) =====
   Model: "TROTOAT 1_2X2 M T 10CM" oleh eventdesignws (CC BY 4.0), GLB yang sama dengan trotoar Green Pramuka. Lebar jalur abu-abu X 14,85..18,9 diisi 3 baris pelat + bibir trotoar membulat di sisi aspal.
   Tiap segmen dipotong pas di batas ubin (tanpa ubin terpotong), jadi ujung di apron SPBU rapi. Tinggi atas 12 cm (lihat nswH di gpcH). */
try{(function(){
 const L=NSW.x0,R=NSW.x1,EW=.118,NR=3,w=(R-EW-L)/NR,sz=w/1.2;
 chB64ToBuf(window.TRO_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  gl.scene.updateMatrixWorld(true);const ms=[];gl.scene.traverse(o=>{if(o.isMesh)ms.push(o)});
  const stone=ms.find(o=>/stone/i.test((o.material&&o.material.name)||''))||ms[0],edge=ms.find(o=>o!==stone);
  const prep=o=>{const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);const m=o.material;if(m.map){m.emissiveMap=m.map;m.emissive=new THREE.Color(0xffffff);m.emissiveIntensity=.4}m.side=THREE.DoubleSide;m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-8;m.needsUpdate=true;return [g,m]};
  const tiles=[];NSW.segs.forEach(q=>{const len=q[0]-q[1],n=Math.max(1,Math.round(len/2)),Lt=len/n;for(let i=0;i<n;i++)tiles.push([q[0]-i*Lt+Lt/2,Lt/2])});
  const d=new THREE.Object3D();d.rotation.y=Math.PI/2;
  const [g0,m0]=prep(stone),im0=new THREE.InstancedMesh(g0,m0,tiles.length*NR);let k=0;
  tiles.forEach(t=>{for(let r=0;r<NR;r++){d.position.set(R-EW-r*w+.26*sz,NSW.y,t[0]);d.scale.set(t[1],1,sz);d.updateMatrix();im0.setMatrixAt(k++,d.matrix)}});
  im0.frustumCulled=false;owG.add(im0);
  if(edge){const [g1,m1]=prep(edge),im1=new THREE.InstancedMesh(g1,m1,tiles.length);
   tiles.forEach((t,i)=>{d.position.set(R+.142,NSW.y,t[0]);d.scale.set(t[1],1,1);d.updateMatrix();im1.setMatrixAt(i,d.matrix)});
   im1.frustumCulled=false;owG.add(im1)}
 }).catch(e=>console.error('TROTOAR jalan utama',e));
})()}catch(e){console.error('trotoar jalan utama',e)}
/* ===== BARRIER BETON: X 45.4, Z -93.1 s/d -457.9 (dipasang rapat sepanjang tepi kanan jalan, di sisi dek jalan layang) =====
   Model: "Barrier béton" oleh aymen kmama (CC BY 4.0) - https://sketchfab.com/3d-models/barrier-beton-574405e702814309bae45ca661b66718
   Geometri asli tidak diubah; tekstur diperkecil ke 512 px (JPEG) supaya file game tidak berat. Ubah BRK.x untuk geser kiri/kanan, BRK.z0/z1 untuk panjangnya. Ada tabrakan (barWall). */
const BRK_SHIFT=5; /* geser barrier ke KIRI (arah -X) sekian meter. Naikkan untuk lebih kiri lagi, 0 = posisi lama */
const BRK={x:45.4-BRK_SHIFT,x0:45.4,z0:-93.1,z1:-457.9,hw:.4};window.BRK=BRK;
try{(function(){
 const BRK_B64=__BIG[8];
 chB64ToBuf(BRK_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  gl.scene.updateMatrixWorld(true);let me=null;gl.scene.traverse(o=>{if(o.isMesh&&!me)me=o});if(!me)return;
  const g=me.geometry.clone();g.applyMatrix4(me.matrixWorld);g.computeBoundingBox();
  let b=g.boundingBox,c=b.getCenter(new THREE.Vector3());g.translate(-c.x,-b.min.y,-c.z);g.computeBoundingBox();b=g.boundingBox;
  const sx=b.max.x-b.min.x,sz=b.max.z-b.min.z,Lm=Math.max(sx,sz),ry=sx>=sz?Math.PI/2:0;
  const m=me.material;m.metalnessMap=null;m.roughnessMap=null;m.aoMap=null;m.metalness=0;m.roughness=.9;
  if(m.map){m.emissiveMap=m.map;m.emissive=new THREE.Color(0xffffff);m.emissiveIntensity=.45}m.side=THREE.DoubleSide;m.needsUpdate=true;
  const len=BRK.z0-BRK.z1,n=Math.max(1,Math.round(len/Lm)),pitch=len/n,sl=pitch/Lm;
  const im=new THREE.InstancedMesh(g,m,n),d=new THREE.Object3D();d.rotation.y=ry;d.scale.set(ry?1:sl,1,ry?sl:1);
  for(let i=0;i<n;i++){d.position.set(BRK.x,.03,BRK.z0-pitch*(i+.5));d.updateMatrix();im.setMatrixAt(i,d.matrix)}
  im.frustumCulled=false;owG.add(im);
 }).catch(e=>console.error('BARRIER GLB',e));
})()}catch(e){console.error('barrier beton',e)}
// tabrakan motor/karakter vs barrier: 3 titik badan motor didorong keluar dari kotak barrier


/* ===== HALTE TRANSJAKARTA PASAR BARU: dipasang tepat di koordinat X 45.4, Z -91.8 (H 181) =====
   HLT.x, HLT.z = titik tengah halte; HLT.y = tinggi alas; HLT.s = skala; HLT.rdeg = putaran (derajat). Sumbu panjang model searah jalan (Z); -90 = sisi +z model menghadap ke jalan (arah -x). HLT.on=false untuk menyembunyikan. */
/* HLT.gap = jarak (meter) tepi halte terdekat dari sisi belakang barrier beton (BRK.x+BRK.hw) -> halte otomatis berada DI BELAKANG barrier. Naikkan untuk mundur lagi; isi null untuk pakai HLT.x manual. */
const HLT={on:true,x:45.4,z:-91.8,y:0,s:1,rdeg:-90,gap:.6};window.HLT=HLT;
try{if(HLT.on)(function(){
 const HLT_B64=__BIG[9];
 chB64ToBuf(HLT_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  const m=gl.scene;m.updateMatrixWorld(true);
  m.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=true;[].concat(o.material).forEach(q=>{if(!q)return;q.side=THREE.DoubleSide;if(q.map&&!q.transparent){q.emissiveMap=q.map;q.emissive=new THREE.Color(0xffffff);q.emissiveIntensity=.45}else if(q.color&&!q.transparent){q.emissive=q.color.clone().multiplyScalar(.3)}q.needsUpdate=true})});
  const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3());
  m.position.set(-c.x,-bb.min.y,-c.z);
  const g=new THREE.Group();g.add(m);g.scale.setScalar(HLT.s);g.position.set(HLT.x,HLT.y,HLT.z);g.rotation.y=HLT.rdeg*Math.PI/180;
  if(HLT.gap!=null&&window.BRK){g.updateMatrixWorld(true);const hb=new THREE.Box3().setFromObject(g);g.position.x+=((BRK.x0!=null?BRK.x0:BRK.x)+BRK.hw+HLT.gap)-hb.min.x} // tepi halte terdekat ke jalan = tepat di belakang barrier
  owG.add(g);window.HLT_OBJ=g;
 }).catch(e=>console.error('HALTE GLB',e));
})()}catch(e){console.error('halte transjakarta',e)}

/* ===== MOBIL POLISI: model "mobil+pak+polisi" oleh eventdesignws (CC BY 4.0), GLB di bawah sudah dikecilkan (tanpa UV, indeks 16-bit, normal 8-bit).
   POL.x, POL.z = titik tengah mobil di dunia; POL.hdeg = arah hadap (derajat, sama seperti H di HUD; mobil menghadap searah motor).
   Ada tabrakan (polWall): kotak berputar hl x hw. Ubah POL.on=false untuk menyembunyikan. */
const POL={on:true,x:21.7,z:-77.3,hdeg:5,hl:2.72,hw:1.16};POL.h=POL.hdeg*Math.PI/180+Math.PI; // model menghadap +z, jadi + PI supaya depan mobil searah H
try{if(POL.on)(function(){
 const B64=__BIG[10];
 chB64ToBuf(B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  const car=gl.scene;car.updateMatrixWorld(true);
  car.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=true;
   [].concat(o.material).forEach((m,i,arr)=>{
    let q=m;
    if(m.isMeshPhysicalMaterial){q=new THREE.MeshStandardMaterial({color:m.color.clone(),roughness:m.roughness,metalness:m.metalness,transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest});q.name=m.name}
    if(!q.transparent||q.opacity>.95){q.emissive=q.color.clone().multiplyScalar(.28)}
    q.roughness=Math.min(.75,q.roughness==null?.6:Math.max(.35,q.roughness));q.metalness=Math.min(q.metalness||0,.3);
    if(Array.isArray(o.material))o.material[i]=q;else o.material=q;
   })});
  const bb=new THREE.Box3().setFromObject(car),c=bb.getCenter(new THREE.Vector3());
  car.position.set(-c.x,-bb.min.y,-c.z);
  const g=new THREE.Group();g.add(car);g.position.set(POL.x,0,POL.z);g.rotation.y=POL.h;owG.add(g);window.POL_OBJ=g;
 }).catch(e=>console.error('MOBIL POLISI GLB',e));
})()}catch(e){console.error('mobil polisi',e)}
// tabrakan motor/karakter vs mobil polisi: kotak berputar, 3 titik badan motor didorong keluar


/* ===== TENDA BESAR di dekat mobil polisi: pakai model tenda 3x3 m yang sama (eventdesignws, CC BY 4.0), diperbesar TND.s kali, sisi depan menghadap mobil polisi.
   TND.x, TND.z = titik tengah tenda (X 14.5, Z -78.3); TND.s = skala (1.7 -> sekitar 5 x 5 m); TND.y = tinggi alas. TND.on=false untuk menyembunyikan. */
const TND={on:true,x:14.5,z:-78.3,y:.1,s:1.7};
try{if(TND.on)window.TENT_P.then(gl=>{const m=gl.scene.clone(true),g=new THREE.Group();g.add(m);m.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(m),c=b.getCenter(new THREE.Vector3());m.position.set(-c.x,-b.min.y,-c.z);
 const ry=Math.atan2(POL.x-TND.x,POL.z-TND.z)+Math.PI/2; /* sisi TERBUKA tenda (lantai merah) ada di sumbu -x lokal model, jadi putar +90 derajat supaya sisi terbuka menghadap mobil polisi */g.scale.setScalar(TND.s);g.position.set(TND.x,TND.y,TND.z);g.rotation.y=ry;owG.add(g);
 // 4 kaki tenda bisa ditabrak
 const hx=(b.max.x-b.min.x)/2*TND.s*.9,hz=(b.max.z-b.min.z)/2*TND.s*.9,cs=Math.cos(ry),sn=Math.sin(ry);
 [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([a,d])=>{const lx=a*hx,lz=d*hz;(window.GP_POLES=window.GP_POLES||[]).push([TND.x+lx*cs+lz*sn,TND.z-lx*sn+lz*cs])});
 }).catch(e=>console.error('TENDA BESAR',e))}catch(e){console.error('tenda besar',e)}

/* ===== BENSIN & SPBU =====
   Tangki FUEL.cap liter (maks. sekali isi 60 L), harga V-Power FUEL.price per liter dipotong dari MONEY. Konsumsi FUEL.lpk liter tiap 1 km (1000 m odometer).
   Zona isi = di bawah kanopi SPBU Shell (X 1..15, Z -342..-318), motor harus pelan (< FUEL.maxV m/s). Bensin tersimpan di localStorage 'onarFuel'. Bensin habis = gas mati. */
var FUEL={cap:60,price:20000,lpk:1.5,x0:1,x1:15,z0:-342,z1:-318,maxV:2};
var FUEL_L=30;try{const v=localStorage.getItem('onarFuel');if(v!==null&&isFinite(+v))FUEL_L=Math.max(0,Math.min(FUEL.cap,+v))}catch(e){}

var fuelWas=FUEL_L>0,fuelSaveT=0,fuelPanelOn=false,fuelAmt=10,fuelPosN=0,fuelPosL=-1;









(function(){const $q=id=>document.getElementById(id),p=$q('fuelPanel'),btn=$q('fuelBtn');if(!p||!btn)return;
 ['pointerdown','touchstart','mousedown'].forEach(n=>p.addEventListener(n,e=>e.stopPropagation()));
 btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fuelOpen()});
 p.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();fuelAmt+=+b.dataset.d;fuelPanelUI()}));
 $q('fpFull').addEventListener('click',e=>{e.preventDefault();fuelAmt=fuelMax();fuelPanelUI()});
 $q('fpNo').addEventListener('click',e=>{e.preventDefault();fuelClose()});
 $q('fpOk').addEventListener('click',e=>{e.preventDefault();fuelPay()})})();

/* ===== ANIMASI KLIK TOMBOL HOME: riak + membal ===== */
(function(){const SEL='.homeBtn,.homeSettings,#hON,#hUN,.srv,.mdlBtn';
 addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest(SEL);if(!b)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,x=document.createElement('span');x.className='rip';x.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';b.appendChild(x);setTimeout(()=>x.remove(),650)},true);
 addEventListener('click',e=>{const b=e.target.closest&&e.target.closest(SEL);if(!b)return;b.classList.remove('popA');requestAnimationFrame(()=>{b.classList.add('popA');setTimeout(()=>b.classList.remove('popA'),420)})},true)})();
tapHome('hST',()=>showSettings());
tapHome('hLC',()=>showLicense());

/* ===== ASPAL BLOK (models/aspal_blok-kasar2.glb) - TAHAP 1: JALAN UTAMA =====
   Balok aspal 4x4 m dipasang rapat di jalan utama (x tengah 40, arah -z). Aspal lama TIDAK dihapus kalau model gagal dimuat.
   ABK.zones = daftar area [x0,x1,z0,z1] (meter, koordinat dunia). Mau tambah jalan lain: tambah satu baris di zones.
   ABK.y = tinggi permukaan balok (0.02 = sedikit di atas jalan dasar). ABK.clean = hapus lapisan aspal/tanah lama yang rata & seluruhnya ada di dalam area.
   ABK.on=false untuk mematikan (kembali ke aspal lama). */
const ABK={on:false,file:'models/aspal_blok-kasar2.glb',zones:[[18.9,45.4,-530,-68.6]],y:.02,clean:true,rot:true};
(function(){if(!ABK.on)return;try{
 fetch(ABK.file).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' '+ABK.file);return r.arrayBuffer()})
 .then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no)))
 .then(gl=>{
  let src=null;gl.scene.updateMatrixWorld(true);gl.scene.traverse(o=>{if(!src&&o.isMesh)src=o});
  if(!src)throw new Error('mesh balok tidak ditemukan');
  const geo=src.geometry.clone();geo.applyMatrix4(src.matrixWorld);geo.computeBoundingBox();
  const bb=geo.boundingBox,bw=bb.max.x-bb.min.x,bd=bb.max.z-bb.min.z;
  geo.translate(-(bb.min.x+bb.max.x)/2,-bb.max.y,-(bb.min.z+bb.max.z)/2); // pusat di tengah, permukaan atas tepat di y=0
  const mat=src.material;mat.polygonOffset=true;mat.polygonOffsetFactor=-2;mat.polygonOffsetUnits=-4;mat.side=THREE.FrontSide;
  const O=new THREE.Object3D(),col=new THREE.Color(),rs=k=>Math.abs(Math.sin(k*12.9898+4.1)*43758.5453)%1;
  const inst=[];
  ABK.zones.forEach(([x0,x1,z0,z1])=>{
   const nx=Math.max(1,Math.round((x1-x0)/bw)),nz=Math.max(1,Math.round((z1-z0)/bd)),sx=(x1-x0)/(nx*bw),sz=(z1-z0)/(nz*bd);
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)inst.push([x0+(i+.5)*(x1-x0)/nx,z0+(j+.5)*(z1-z0)/nz,sx,sz])});
  const im=new THREE.InstancedMesh(geo,mat,inst.length);
  inst.forEach((p,k)=>{const rk=ABK.rot?Math.floor(rs(k)*4):0,q=rk%2; // putaran kelipatan 90 derajat; kalau ganjil, tukar skala x/z supaya tetap rapat
   O.position.set(p[0],ABK.y,p[1]);O.rotation.set(0,rk*Math.PI/2,0);
   O.scale.set(q?p[3]:p[2],1,q?p[2]:p[3]);O.updateMatrix();im.setMatrixAt(k,O.matrix);
   const s=.9+rs(k+999)*.1;im.setColorAt(k,col.setRGB(s,s,s))});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
  im.frustumCulled=false;im.receiveShadow=true;im.userData.noCast=1;im.name='aspalBlok';owG.add(im);
  // hapus lapisan aspal/tanah lama yang rata, tidak transparan, dan seluruhnya di dalam area balok
  let n=0;
  if(ABK.clean){const bx=new THREE.Box3(),e=.6;
   owG.children.slice().forEach(o=>{if(o===im||!o.isMesh||o.isInstancedMesh||o.userData.abkKeep)return;
    const m=o.material;if(!m||Array.isArray(m)||m.transparent||m.blending===THREE.AdditiveBlending)return;
    bx.setFromObject(o);if(bx.isEmpty())return;
    if(bx.max.y-bx.min.y>.06||bx.max.y>.12)return;
    if(ABK.zones.some(([x0,x1,z0,z1])=>bx.min.x>=x0-e&&bx.max.x<=x1+e&&bx.min.z>=z0-e&&bx.max.z<=z1+e)){o.visible=false;n++}})}
  console.log('[aspal blok] '+inst.length+' balok dipasang, '+n+' lapisan lama disembunyikan');
 }).catch(e=>console.error('[aspal blok] gagal, aspal lama tetap dipakai:',e));
}catch(e){console.error('aspal blok',e)}})();
