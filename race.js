// ===== lintasan =====
const roadT=ctex(256,192,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);sgrain(g,w,h,2500,.05);
 g.fillStyle='rgba(0,0,0,.4)';[-2.6,-1.95,1.85,2.45].forEach(x=>g.fillRect((x+8)*16,0,6,h));
 g.fillStyle='#d8d8d8';g.fillRect(w/2-2,0,4,48);g.fillRect(8,0,3,h);g.fillRect(w-11,0,3,h)},1,640/12);
const road=add(new THREE.Mesh(new THREE.PlaneGeometry(16,640),new THREE.MeshStandardMaterial({map:roadT,roughness:.35,metalness:.2})),0,0,-300);road.rotation.x=-Math.PI/2;
const curbT=ctex(8,64,g=>{g.fillStyle='#ddd';g.fillRect(0,0,8,32);g.fillStyle='#111';g.fillRect(0,32,8,32)},1,640/6);
[-1,1].forEach(s=>{add(new THREE.Mesh(bx(.5,.16,640),new THREE.MeshStandardMaterial({map:curbT,roughness:.6})),s*8.25,.08,-300);add(new THREE.Mesh(bx(9,.14,640),std('#34343b',.7)),s*12.5,.07,-300)});
const sl=add(new THREE.Mesh(new THREE.PlaneGeometry(16,.5),bas('#cfcfcf')),0,.03,-.25);sl.rotation.x=-Math.PI/2;
const ck=ctex(16,2,(g)=>{for(let i=0;i<16;i++)for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?'#fff':'#111';g.fillRect(i,j,1,1)}});ck.magFilter=THREE.NearestFilter;ck.repeat.set(1,1);
const fl=add(new THREE.Mesh(new THREE.PlaneGeometry(16,1.2),new THREE.MeshBasicMaterial({map:ck})),0,.03,-DIST);fl.rotation.x=-Math.PI/2;

[-8.4,8.4].forEach(x=>add(new THREE.Mesh(bx(.3,5.5,.3),std('#ddd')),x,2.75,-DIST));
add(new THREE.Mesh(bx(17,1,.3),std('#111')),0,5.5,-DIST);add(label('FINISH 500 M',8,.8,'#fff','#111'),0,5.5,-DIST+.2);
for(let d=100;d<=400;d+=100)add(label(d+' m',1.6,.8,'#111','#fff'),-7.4,1.4,-d);
// lampu jalan
const pG=new THREE.CylinderGeometry(.08,.11,7.2,8),pM=std('#4a4a50',.5,.6),aG=bx(1.8,.08,.08),lG=new THREE.SphereGeometry(.2,8,8),lM=bas('#fff3c4'),sprM=glowM(0xffb060),plG=new THREE.PlaneGeometry(9,13);
for(let k=-1;k<22;k++)[-1,1].forEach(sd=>{const z=-k*30-(sd>0?15:0),g=new THREE.Group();g.position.set(sd*9.6,0,z);scene.add(g);
 add(new THREE.Mesh(pG,pM),0,3.6,0,g);add(new THREE.Mesh(aG,pM),-sd*.9,7.2,0,g);add(new THREE.Mesh(lG,lM),-sd*1.8,7.15,0,g);
 const sp=new THREE.Sprite(sprM);sp.scale.set(6,6,1);sp.position.set(-sd*1.8,7.15,0);g.add(sp);
 const p=add(new THREE.Mesh(plG,poolM),-sd*3.4,.04,0,g);p.rotation.x=-Math.PI/2})
// bangunan, tembok, pohon
const bm=['#2c2c33','#383029','#24303a'].map(c=>std(c,.9)),shut=std('#15161a',.5,.4),tube=bas('#cfe8ff'),wm=std('#4d4d52',.95),trk=std('#3a2a1c'),crn=std('#1f4426',.9),crn2=std('#355f33',.9);
// kerucut
const cG=new THREE.ConeGeometry(.2,.7,12),cM=std('#ff5a1f',.6),cW=std('#eee',.6);
[[-7.3,4],[7.3,4],[-7.3,-8],[7.3,-8],[7.3,-26],[-7.3,-26]].forEach(([x,z])=>{add(new THREE.Mesh(cG,cM),x,.35,z);add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,.12,12),cW),x,.4,z)});
// pohon start
const lamps=[[],[]],offC=[0x3a2a05,0x3a2a05,0x3a2a05,0x3a2a05,0x3a2a05,0x052a0c,0x330808],onC=[0xffb000,0xffb000,0xffb000,0xffb000,0xffb000,0x27e04a,0xff2020],rowY=[3.55,3.35,3,2.65,2.3,1.95,1.6];
add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,3.7,8),std('#111')),5.6,1.85,-2);add(new THREE.Mesh(bx(1.6,2.6,.25),std('#111')),5.6,2.6,-2);
[5.2,6].forEach((x,c)=>rowY.forEach((y,r)=>{const m=add(new THREE.Mesh(new THREE.SphereGeometry(r<2?.1:.14,10,10),bas(offC[r])),x,y,-1.8);const sp=new THREE.Sprite(glowM(onC[r]));sp.scale.set(.8,.8,1);sp.visible=false;m.add(sp);lamps[c].push(m)}));
// ===== motor =====
const dragObjs=scene.children.filter(c=>!c.isLight);
let custom=null,customLQ=null;
let MODG=null,MODP=null,VEHSEL='vario150',MONEY=26000000,OWNED=['vario150'];
(function(){try{const m=localStorage.getItem('onarMoney');if(m!==null&&isFinite(+m))MONEY=Math.max(0,+m);const o=JSON.parse(localStorage.getItem('onarOwn')||'[]');if(Array.isArray(o))o.forEach(x=>{if(typeof x==='string'&&!OWNED.includes(x))OWNED.push(x)});const v=localStorage.getItem('onarVeh');if(v&&OWNED.includes(v))VEHSEL=v}catch(e){}})();



/* ===== KEMUDI: stang + garpu + spakbor depan + roda depan ikut belok ===== */

const _sA=new THREE.Vector3();




// ===== EFEK: motion blur radial, speed lines, asap knalpot, joystick, layar penuh =====
var fxReady=false;
let fxS=0,lastFoot=null,RT=null,FW=1,FH=1;
const fx=document.createElement('canvas');fx.id='fx';gl.parentNode.insertBefore(fx,$('hud'));const fc=fx.getContext('2d');
const post=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
 uniforms:{t:{value:null},s:{value:0},a:{value:1},c:{value:new THREE.Vector2(.5,.46)}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:'varying vec2 vUv;uniform sampler2D t;uniform float s;uniform float a;uniform vec2 c;void main(){vec2 d=vUv-c;float m=smoothstep(.10,.70,length(vec2(d.x*a,d.y)))*s;vec3 col=vec3(0.);float tw=0.;for(int i=0;i<10;i++){float f=float(i)/9.;float w=1.-f*.6;col+=texture2D(t,vUv-d*m*.22*f).rgb*w;tw+=w;}gl_FragColor=vec4(col/tw,1.);}',
 depthTest:false,depthWrite:false,toneMapped:false}));
post.frustumCulled=false;const pS=new THREE.Scene();pS.add(post);const pC=new THREE.OrthographicCamera(-1,1,1,-1,0,1);

const LN=[];for(let i=0;i<64;i++)LN.push({a:Math.random()*6.283,r:Math.random(),l:Math.random(),w:Math.random()});
/* GARIS NGEBUT 3D: garis-garis angin hidup di dunia (bukan radial di tengah layar), sejajar arah gerak motor yang dihitung dari perpindahan nyata.
   Jadi dari sudut kamera mana pun (samping, depan, belakang, atas) garisnya tetap searah gerakan dan punya perspektif. */
const SLN=72,SL=[];for(let i=0;i<SLN;i++)SL.push({x:0,y:0,z:0,w:Math.random(),l:Math.random(),on:false});
const fxRef=new THREE.Vector3(),fxPrev=new THREE.Vector3(),fxD=new THREE.Vector3(0,0,-1),fxSide=new THREE.Vector3(1,0,0),fxU=new THREE.Vector3(0,1,0),_fa=new THREE.Vector3(),_fb=new THREE.Vector3(),_fc=new THREE.Vector3();let fxHave=false,fxBX=0,fxBY=0;



const _oc=[];for(let i=0;i<8;i++)_oc.push(new THREE.Vector3());



/* ===== ULTRA REALISTIS (khusus Grafik Tinggi) =====
   1) Langit malam bergradasi + cahaya kota di horizon (menggantikan warna polos).
   2) Post-processing sinematik: bloom (lampu jalan, jendela, lampu motor berpendar), warna sinematik, vignette, chromatic aberration tipis, dither anti-banding.
   Beban dijaga: bloom dihitung di resolusi 1/4. Governor (HQ.lv>=2) otomatis mematikan efek ini kalau HP lag; shader error -> efek mati sendiri.
   Atur tampilan lewat ULT.K: th = ambang cahaya yang berpendar (naikkan = bloom lebih sedikit), bk = kekuatan bloom, vg = vignette, gr = grain halus (0 = mati), ca = chromatic aberration. */
var ULT={ok:true,err:0,sc:null,q:null,mA:null,mB:null,mC:null,r1:null,r2:null,bw:0,bh:0,K:{th:.58,bk:.5,vg:.3,gr:.012,ca:.0035}};
/* ===== PENCAHAYAAN ULTRA (Grafik Tinggi): cahaya bulan dingin + pantulan hangat lampu kota + berkas lampu depan volumetrik ===== */






fxReady=true;fxResize(gl.clientWidth,gl.clientHeight);

// ---- asap knalpot (sedikit) ----
const smT=ctex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.5,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const SM=[];for(let i=0;i<90;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smT,color:0xaeb0ba,transparent:true,opacity:0,depthWrite:false}));s.visible=false;s.layers.set(2);scene.add(s);SM.push({s,life:0,max:1,vx:0,vy:0,vz:0,sz:.2,o:.2})}
let smAcc=0;const smV=new THREE.Vector3();



// ---- pose pembalap (menunduk saat ngebut) & wheelie ----
const WH={on:0,p:0};

(function(){const el=$('wh');el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}setWH(1)});
 ['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,()=>setWH(0)));
 addEventListener('keydown',e=>{if(e.code==='KeyQ')setWH(1)});addEventListener('keyup',e=>{if(e.code==='KeyQ')setWH(0)})})();

// ---- pose SUPERMAN (tiarap di jok, kaki lurus ke belakang) dengan animasi transisi ----
const SUP={on:0};

(function(){const el=$('sup');if(!el)return;
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setSUP(SUP.on?0:1)});
 addEventListener('keydown',e=>{if(e.code==='KeyR'&&!e.repeat)setSUP(SUP.on?0:1)})})();
const SUP_IN=1.15,SUP_OUT=.95; // detik: durasi masuk / keluar pose



// ---- RPM realistis, burnout ----



const BN={k:0,a:0,t:0,i:0};
const SKg=new THREE.Group();scene.add(SKg);const SKm=[],skG=new THREE.PlaneGeometry(.2,.5);skG.rotateX(-Math.PI/2);
const skM=new THREE.MeshBasicMaterial({color:0x050505,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
for(let i=0;i<160;i++){const m=new THREE.Mesh(skG,skM);m.visible=false;SKg.add(m);SKm.push(m)}
let TN=null;




// ---- layer render & kamera POV mata ----
const CPI=new Set([28,58,59,60,61,79,80,81,82,83,84,91,92]);
cam.layers.mask=7;scene.children.filter(c=>c.isLight).forEach(l=>l.layers.enable(1));
const CW={x:0,v:0,pw:0},camQ=new THREE.Quaternion(),eyeV=new THREE.Vector3(),tmpV=new THREE.Vector3(),baseQ=new THREE.Quaternion(),lookQ=new THREE.Quaternion();

// Posisi kamera POV relatif kepala pembalap: BACK = seberapa jauh mundur ke belakang, UP = naik. Naikkan BACK kalau gas/setang masih belum kelihatan.
const POV_BACK=.015,POV_UP=.05,POV_REF=.87; // POV_REF = sudut badan acuan (.87 = posisi menunduk penuh)

// ---- joystick (saat turun dari motor) ----
const joy={x:0,y:0,id:null};

(function(){const el=$('joy'),k=$('jk');
 function upd(e){const r=el.getBoundingClientRect(),mr=r.width/2-10;let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);if(d>mr){dx*=mr/d;dy*=mr/d}joy.x=dx/mr;joy.y=dy/mr;k.style.transform='translate('+dx+'px,'+dy+'px)'}
 el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}joy.id=e.pointerId;upd(e)});
 el.addEventListener('pointermove',e=>{if(joy.id===e.pointerId)upd(e)});
 ['touchstart','touchmove'].forEach(n=>el.addEventListener(n,e=>e.preventDefault(),{passive:false}));
 ['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,e=>{if(joy.id===e.pointerId)joyReset()}))})();

document.addEventListener('touchmove',e=>{if(!(e.target.closest&&e.target.closest('#ov,#vehPaint,#fuelPanel')))e.preventDefault()},{passive:false});

// ---- efek suara UI ----
let SFX=null;



addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.hb,#card button');if(!t)return;uiSound(t.id==='hMP'?'ow':t.id==='hOW'?'ow':t.id==='hST'?'set':'click')},true);
// ---- layar penuh ----
const inFS=()=>document.fullscreenElement||document.webkitFullscreenElement;


let fsDone=false;const autoFS=()=>{if(!fsDone)goFS()};['pointerup','click','keydown','touchend'].forEach(n=>addEventListener(n,autoFS,true));goFS();
['fullscreenchange','webkitfullscreenchange'].forEach(n=>document.addEventListener(n,()=>{if(inFS())fsDone=true;setTimeout(rs,120)}));
addEventListener('orientationchange',()=>setTimeout(rs,200));

// ===== game =====
let st='menu',gas=false,P,O,tree,endT=0,best=null,AC,osc,gn;
try{best=parseFloat(localStorage.getItem('dm3d'))||null}catch(e){}


reset();



$('gas').addEventListener('pointerdown',e=>{e.preventDefault();try{$('gas').setPointerCapture(e.pointerId)}catch(_){}setGas(true)});
['pointerup','pointercancel'].forEach(n=>$('gas').addEventListener(n,()=>setGas(false)));
$('nos').addEventListener('pointerdown',e=>{e.preventDefault();useNos()});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();setGas(true)}if(e.code==='KeyN')useNos()});
addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='ArrowUp')setGas(false)});



const card=$('card'),ov=$('ov');



let cyaw=0,cpitch=.2,cdist=3.8,drag=null;
// ===== MODE KAMERA: 0 belakang, 1 POV, 2 samping, 3 depan, 4 atas, 5 custom 360° (bebas putar + zoom) =====
const CAM={mode:0,yaw:0,pitch:.35,dist:5,zm:[1,1,1,1,1,1]},CAM_N=['BELAKANG','POV','SAMPING','DEPAN','ATAS','CUSTOM 360°'];
const CB={t:1,p:new THREE.Vector3(),q:new THREE.Quaternion()};
let camTT=0;



(function(){const el=$('camb');if(!el)return;
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();camNext()});
 addEventListener('keydown',e=>{if(e.code==='KeyC'&&!e.repeat&&st==='ow')camNext()})})();



const gPtr=new Map();let pinch=0;
const ptrDist=()=>{const v=[...gPtr.values()];return v.length<2?0:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y)};
gl.addEventListener('pointerdown',e=>{gPtr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gPtr.size===1)drag={x:e.clientX,y:e.clientY};else{drag=null;pinch=ptrDist()}try{gl.setPointerCapture(e.pointerId)}catch(_){}});
gl.addEventListener('pointermove',e=>{const p=gPtr.get(e.pointerId);if(!p)return;
 if(gPtr.size>=2){p.x=e.clientX;p.y=e.clientY;const d=ptrDist();if(pinch>0&&d>0)zoomBy(d/pinch);pinch=d;return}
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;p.x=e.clientX;p.y=e.clientY;
 if(DR.on){DR.yaw-=dx*.008;DR.pitch=Math.max(-1.45,Math.min(1.45,DR.pitch-dy*.006))}
 else if(CAM.mode===5){CAM.yaw-=dx*.008;CAM.pitch=Math.max(.03,Math.min(1.5,CAM.pitch+dy*.006))}
 else if(CAM.mode>=2){}
 else{cyaw-=dx*.008;if(pov)lpitch=Math.max(-1.2,Math.min(1.2,lpitch-dy*.006));else cpitch=Math.max(.04,Math.min(1.3,cpitch+dy*.006))}
 drag.x=e.clientX;drag.y=e.clientY});
['pointerup','pointercancel'].forEach(n=>gl.addEventListener(n,e=>{gPtr.delete(e.pointerId);pinch=0;if(gPtr.size===1){const r=[...gPtr.values()][0];drag={x:r.x,y:r.y}}else drag=null}));
gl.addEventListener('wheel',e=>{zoomBy(Math.exp(-e.deltaY*.0015))},{passive:true});

/* ===== KAMERA DRONE (open world) =====
   Tombol 🚁 DRONE (kanan atas). Saat drone aktif: semua tombol game disembunyikan.
   Joystick kiri  = maju / mundur / geser kiri-kanan (datar, searah pandangan), TIDAK memutar arah pandang.
   Geser layar    = menentukan arah pandang (yaw + pitch).
   Tombol kanan   = NAIK / TURUN.
   Tombol ✕ KELUAR (kanan atas) = kembali ke kamera biasa. Keyboard: G = drone on/off, WASD, Spasi naik, Shift turun. */
const DR={on:false,x:0,y:0,z:0,yaw:0,pitch:0,vx:0,vy:0,vz:0,f:0,b:0,prev:0,sp:14,k:{f:0,b:0,l:0,r:0,u:0,d:0}};



(function(){
 const hd=(id,key)=>{const el=$(id);if(!el)return;
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{el.setPointerCapture(e.pointerId)}catch(_){}DR[key]=1;el.classList.add('on')});
  ['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,()=>{DR[key]=0;el.classList.remove('on')}))};
 hd('dfw','f');hd('dbk','b');
 const t=$('drn');if(t)t.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();DR.on?droneOff():droneOn()});
 const KM={KeyW:'f',ArrowUp:'f',KeyS:'b',ArrowDown:'b',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',Space:'u',ShiftLeft:'d',ShiftRight:'d',KeyQ:'d'};
 addEventListener('keydown',e=>{
  if(e.code==='KeyG'&&!e.repeat&&st==='ow'){e.preventDefault();e.stopImmediatePropagation();DR.on?droneOff():droneOn();return}
  if(!DR.on)return;
  if(e.code==='Escape'){droneOff();return}
  const m=KM[e.code];
  if(m||e.code==='KeyE'||e.code==='KeyB'||e.code==='KeyV'||e.code==='KeyC'||e.code==='KeyN'){e.preventDefault();e.stopImmediatePropagation();if(m)DR.k[m]=1}},true);
 addEventListener('keyup',e=>{const m=KM[e.code];if(m)DR.k[m]=0},true)})();
