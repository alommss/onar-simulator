/* ===== CINEMATIC =====
   Rekam video sinematik di Open World.
   - Kamera bebas (drone) + miring/roll (putar dua jari atau slider) + FOV.
   - Letakkan beberapa KEYFRAME, kamera meluncur mulus melewati semuanya (spline Catmull-Rom).
   - Tombol rekam bulat merah = mulai / berhenti rekam. Kalau ada >= 2 keyframe, kamera jalan otomatis dan rekaman berhenti di keyframe terakhir.
   - Video 1280x720, 60 FPS ASLI: game dijalankan frame-demi-frame (1/60 detik per frame, tidak tergantung kecepatan HP),
     tiap frame di-encode lewat WebCodecs dengan timestamp pasti, lalu dimux ke WebM yang timeline-nya tepat 60 fps.
     Kalau HP lambat, perekaman memang lebih lama dari durasi videonya, tapi videonya tetap 60 fps penuh (tidak ada frame duplikat).
   - Hasil disimpan di IndexedDB dan ditampilkan di tombol GALERI (home).
   Catatan: suara game belum ikut terekam. */
(function(){
'use strict';
const FPS=60,VW=1280,VH=720,MAXSEC=180,TICK=Math.round(1e9/FPS);

/* ---------- Muxer WebM minimal ----------
   TimecodeScale = 1/60 detik, jadi 1 frame = tepat 1 tick (timeline 60 fps eksak, tanpa pembulatan milidetik). */
function cat(parts){let n=0;for(const p of parts)n+=p.length;const o=new Uint8Array(n);let i=0;for(const p of parts){o.set(p,i);i+=p.length}return o}
function idB(id){const b=[];while(id>0){b.unshift(id%256);id=Math.floor(id/256)}return new Uint8Array(b)}
function szB(n,len){const b=new Uint8Array(len);let v=n;for(let i=len-1;i>=0;i--){b[i]=v%256;v=Math.floor(v/256)}b[0]|=(1<<(8-len));return b}
function minLen(n){for(let l=1;l<8;l++)if(n<Math.pow(2,7*l)-1)return l;return 8}
function el(id,payload,fix8){const p=Array.isArray(payload)?cat(payload):payload;return cat([idB(id),szB(p.length,fix8?8:minLen(p.length)),p])}
function uint(id,v){const b=[];let n=v;do{b.unshift(n%256);n=Math.floor(n/256)}while(n>0);return el(id,new Uint8Array(b))}
function str(id,s){return el(id,new TextEncoder().encode(s))}
function f64(id,v){const b=new Uint8Array(8);new DataView(b.buffer).setFloat64(0,v);return el(id,b)}
class WebmMux{
 constructor(w,h,codecId){this.w=w;this.h=h;this.codec=codecId;this.fr=[]}
 add(data,key,idx){this.fr.push({d:data,k:!!key,i:idx})}
 finish(){
  const F=this.fr,count=F.length?F[F.length-1].i+1:0;
  const ebml=el(0x1A45DFA3,[uint(0x4286,1),uint(0x42F7,1),uint(0x42F2,4),uint(0x42F3,8),str(0x4282,'webm'),uint(0x4287,4),uint(0x4285,2)]);
  const info=el(0x1549A966,[uint(0x2AD7B1,TICK),f64(0x4489,count),str(0x4D80,'OnarCinematic'),str(0x5741,'OnarCinematic')]);
  const tracks=el(0x1654AE6B,el(0xAE,[uint(0xD7,1),uint(0x73C5,1),uint(0x83,1),uint(0x9C,0),str(0x86,this.codec),uint(0x23E383,TICK),el(0xE0,[uint(0xB0,this.w),uint(0xBA,this.h)])]));
  const clusters=[];let cur=null;
  for(const f of F){
   if(!cur||f.k||f.i-cur.t0>=600){cur={t0:f.i,items:[],key:f.k};clusters.push(cur)}
   cur.items.push(f)}
  const cb=[],cues=[];let off=info.length+tracks.length;
  for(const c of clusters){
   const parts=[uint(0xE7,c.t0)];
   for(const f of c.items){const rel=f.i-c.t0;parts.push(el(0xA3,[new Uint8Array([0x81,(rel>>8)&255,rel&255,f.k?0x80:0]),f.d]))}
   const b=el(0x1F43B675,parts,true);
   if(c.key)cues.push(el(0xBB,[uint(0xB3,c.t0),el(0xB7,[uint(0xF7,1),uint(0xF1,off)])]));
   cb.push(b);off+=b.length}
  const cuesB=cues.length?el(0x1C53BB6B,cues):new Uint8Array(0);
  const kids=[info,tracks,...cb,cuesB];let n=0;for(const k of kids)n+=k.length;
  const segHead=cat([idB(0x18538067),szB(n,8)]);
  return new Blob([ebml,segHead,...kids],{type:'video/webm'})}
}

/* ---------- Jalur kamera (spline Catmull-Rom lewat semua keyframe) ---------- */
const PK=['x','y','z','yaw','pitch','roll','fov'];
function makePath(kf){
 const n=kf.length,T=[0];for(let i=1;i<n;i++)T[i]=T[i-1]+Math.max(.1,kf[i].d);
 const cr=(a,b,c,d,u)=>.5*(2*b+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u);
 return{total:n?T[n-1]:0,at(t){
  if(n===1)return Object.assign({},kf[0]);
  t=Math.max(0,Math.min(T[n-1],t));let i=0;while(i<n-2&&t>T[i+1])i++;
  const u=(t-T[i])/(T[i+1]-T[i]),p0=kf[Math.max(0,i-1)],p1=kf[i],p2=kf[i+1],p3=kf[Math.min(n-1,i+2)],o={};
  for(const k of PK)o[k]=cr(p0[k],p1[k],p2[k],p3[k],u);return o}}}

if(typeof module!=='undefined'&&module.exports){module.exports={WebmMux,makePath};return}
if(typeof document==='undefined')return;

/* ---------- Penyimpanan galeri (IndexedDB) ---------- */
let dbP=null;
function idb(){return dbP||(dbP=new Promise((res,rej)=>{const q=indexedDB.open('onarCinematic',1);
 q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('meta',{keyPath:'id'});d.createObjectStore('blob')};
 q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}))}
function dbRun(stores,mode,fn){return idb().then(d=>new Promise((res,rej)=>{const t=d.transaction(stores,mode);let r;try{r=fn(t)}catch(e){rej(e);return}
 t.oncomplete=()=>res(r&&r.result!==undefined?r.result:r);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('abort'))}))}
const GAL={
 save(meta,blob){return dbRun(['meta','blob'],'readwrite',t=>{t.objectStore('meta').put(meta);t.objectStore('blob').put(blob,meta.id)})},
 list(){return dbRun('meta','readonly',t=>t.objectStore('meta').getAll()).then(a=>(a||[]).sort((x,y)=>y.ts-x.ts))},
 blob(id){return dbRun('blob','readonly',t=>t.objectStore('blob').get(id))},
 del(id){return dbRun(['meta','blob'],'readwrite',t=>{t.objectStore('meta').delete(id);t.objectStore('blob').delete(id)})}};

/* ---------- State ---------- */
const $=id=>document.getElementById(id);
const toast=t=>{try{camToast(t)}catch(e){}};
const CIN=window.CIN={on:false,rec:false,play:null,roll:0,fov:72,kf:[],sel:-1,dur:3,_endAfter:false,ctl:'cam',rel:false,fromGame:false};
let R=null; /* sesi rekam */

/* ---------- CSS ---------- */
const css=document.createElement('style');
css.textContent=`
#w.cin #hud,#w.cin #coord,#w.cin #tr,#w.cin #drn{display:none!important}
#w.cin:not(.cinRide) #camb{display:none!important}
#cin.ride .cBar,#cin.ride .cSl,#cin.ride #cClr{display:none!important}
#cin.ride #cShut{bottom:auto;top:calc(48px + env(safe-area-inset-top,0px));right:calc(14px + env(safe-area-inset-right,0px))}
#cin .cB.on{background:#ffb020ee;color:#1a1204}
#cinb{display:none}#w.ow #cinb{display:flex}
#cin{position:fixed;inset:0;z-index:20;display:none;pointer-events:none;font-family:system-ui,sans-serif;color:#fff;-webkit-user-select:none;user-select:none}
#cin.on{display:block}
#cin button,#cin input,#cin label{pointer-events:auto;touch-action:manipulation}
#cin .cB{height:36px;padding:0 12px;border:1px solid #ffffff3a;border-radius:10px;background:#141a2ccc;color:#fff;font:800 12px/1 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap}
#cin .cB:active{filter:brightness(1.4)}
#cin .cTop{position:absolute;left:calc(10px + env(safe-area-inset-left,0px));right:calc(10px + env(safe-area-inset-right,0px));top:calc(8px + env(safe-area-inset-top,0px));display:flex;gap:8px;align-items:center}
#cin .cSp{flex:1}
#cin .cSl{display:flex;align-items:center;gap:6px;height:36px;padding:0 10px;border-radius:10px;background:#141a2ccc;border:1px solid #ffffff2a;font:800 10px/1 system-ui,sans-serif;letter-spacing:.05em}
#cin .cSl input{width:clamp(70px,13vw,130px);accent-color:#ff3b3b}
#cin .cSl b{min-width:34px;text-align:right;font-variant-numeric:tabular-nums}
#cRec{position:absolute;left:50%;top:calc(52px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:none;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:#000c;font:800 13px/1 system-ui,sans-serif;letter-spacing:.04em;font-variant-numeric:tabular-nums;white-space:nowrap}
#cRec.on{display:flex}
#cRec i{width:10px;height:10px;border-radius:50%;background:#ff2b2b;animation:cBlink 1s infinite}
@keyframes cBlink{50%{opacity:.25}}
#cin .cBar{position:absolute;left:calc(150px + env(safe-area-inset-left,0px));right:calc(190px + env(safe-area-inset-right,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:6px;align-items:stretch}
#cin .cAct{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#cin .cAct .cB{height:34px;padding:0 9px;font-size:11px}
#cin .cAdd{background:#ff3b3bee!important;border-color:#fff8!important}
#cin .cDur{display:flex;align-items:center;gap:4px;height:34px;padding:0 4px;border-radius:10px;background:#141a2ccc;border:1px solid #ffffff2a;font:800 11px/1 system-ui,sans-serif}
#cin .cDur button{width:28px;height:28px;border:0;border-radius:8px;background:#ffffff22;color:#fff;font:900 16px/1 system-ui,sans-serif}
#cin .cDur b{min-width:46px;text-align:center;font-variant-numeric:tabular-nums}
#cChips{display:flex;gap:6px;overflow-x:auto;padding:2px 0;max-width:100%;scrollbar-width:none;min-height:38px;align-items:center}
#cChips::-webkit-scrollbar{display:none}
#cChips .kfc{flex:0 0 auto;min-width:38px;height:36px;border-radius:10px;border:2px solid #ffffff44;background:#141a2ccc;color:#fff;font:900 14px/1 system-ui,sans-serif;pointer-events:auto}
#cChips .kfc.s{border-color:#ffb020;background:#ffb020;color:#1a1204}
#cChips .cEmpty{font:700 11px/1.3 system-ui,sans-serif;opacity:.75;padding:0 4px}
#cShut{position:absolute;right:calc(112px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));width:76px;height:76px;border-radius:50%;border:4px solid #fff;background:transparent;padding:0;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px #0008}
#cShut i{display:block;width:56px;height:56px;border-radius:50%;background:#ff2323;transition:all .15s}
#cShut:active i{filter:brightness(.8)}
#cShut.rec i{width:28px;height:28px;border-radius:7px;animation:cPulse 1s infinite}
@keyframes cPulse{50%{background:#ff6a6a}}
#cShut.busy{opacity:.5}
.cgBox{width:min(780px,100%);max-height:100%;display:flex;flex-direction:column;overflow:hidden;background:#10131f;border:1px solid #ffffff22;border-radius:16px;padding:14px;box-sizing:border-box;color:#fff;font-family:system-ui,sans-serif}
.cgHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex:0 0 auto}
#cgList{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain}
.cgHead h2{margin:0;font-size:18px;letter-spacing:.06em}
.cgGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.cgCard{background:#181d2e;border:1px solid #ffffff1c;border-radius:12px;overflow:hidden}
.cgTh{width:100%;aspect-ratio:16/9;background:#000 center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-size:34px;border:0;color:#fff;text-shadow:0 2px 8px #000}
.cgInfo{padding:8px 10px 4px;font-size:12px;line-height:1.4}
.cgInfo b{display:block;font-size:13px}
.cgInfo span{opacity:.7}
.cgBtns{display:flex;gap:6px;padding:6px 10px 10px}
.cgBtns button,.cgClose{height:34px;border:0;border-radius:9px;background:#ffffff1f;color:#fff;font:800 12px/1 system-ui,sans-serif;padding:0 11px;flex:1}
.cgBtns button.d{flex:0 0 auto;background:#ff3b3b55}
.cgClose{flex:0 0 auto}
.cgEmpty{padding:30px 10px;text-align:center;opacity:.75;font-size:14px;line-height:1.5}
#cinPl video{max-width:100%;max-height:100%;background:#000}
#cinPl .cgClose{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:12px;z-index:2}
@media (max-height:420px){#cin .cB{height:32px}#cin .cSl{height:32px}#cShut{width:66px;height:66px}#cShut i{width:48px;height:48px}#cin .cBar{left:calc(130px + env(safe-area-inset-left,0px));right:calc(176px + env(safe-area-inset-right,0px))}}
`;
document.head.appendChild(css);

/* ---------- UI overlay ---------- */
const ui=document.createElement('div');ui.id='cin';
ui.innerHTML=`<div class="cTop">
 <button class="cB" id="cX" type="button">✕ KELUAR</button>
 <label class="cSl">ROLL<input id="cRoll" type="range" min="-180" max="180" step="1" value="0"><b id="cRollV">0°</b></label>
 <label class="cSl">FOV<input id="cFov" type="range" min="20" max="110" step="1" value="72"><b id="cFovV">72°</b></label>
 <button class="cB" id="cMot" type="button">🏍 MOTOR: OFF</button>
 <span class="cSp"></span>
 <button class="cB" id="cPv" type="button">▶ PREVIEW</button>
 <button class="cB" id="cClr" type="button">🗑 BERSIHKAN</button>
</div>
<div id="cRec"><i></i><span id="cRecT">REC</span></div>
<div class="cBar">
 <div class="cAct">
  <button class="cB cAdd" id="cAdd" type="button">＋ KEYFRAME</button>
  <button class="cB" id="cUpd" type="button">↻ UPDATE</button>
  <button class="cB" id="cDel" type="button">✕ HAPUS</button>
  <button class="cB" id="cRel" type="button" title="Kamera ikut bergerak bersama motor">📌 IKUT MOTOR: OFF</button>
  <span class="cDur" title="Lama perjalanan menuju keyframe terpilih"><button id="cDm" type="button">−</button><b id="cDv">3.0 s</b><button id="cDp" type="button">＋</button></span>
 </div>
 <div id="cChips"></div>
</div>
<button id="cShut" type="button" aria-label="Rekam video"><i></i></button>`;
document.body.appendChild(ui);

/* ---------- Keyframe ---------- */
const TAU=Math.PI*2,unw=(a,ref)=>a+TAU*Math.round((ref-a)/TAU);
/* sudut dibuat menyambung dari keyframe sebelumnya supaya kamera tidak muter jauh lewat jalur terpanjang */
const bikeNow=()=>{const T=ow.foot?wk:ow;return{x:T.x,z:T.z,h:T.h,y:gpcGY}};
const pose=(ref)=>{const p={x:DR.x,y:DR.y,z:DR.z,yaw:DR.yaw,pitch:DR.pitch,roll:CIN.roll,fov:CIN.fov,b:bikeNow()};if(ref){p.yaw=unw(p.yaw,ref.yaw);p.roll=unw(p.roll,ref.roll)}return p};
function mkPath(rel){
 if(!rel)return makePath(CIN.kf);
 /* keyframe dihitung relatif terhadap posisi & arah motor saat keyframe dibuat; saat main, diterjemahkan ke posisi motor yang sedang jalan */
 let prev=null;
 const L=CIN.kf.map(k=>{const b=k.b,dx=k.x-b.x,dz=k.z-b.z,c=Math.cos(b.h),s=Math.sin(b.h);
  const o=Object.assign({},k,{x:dx*c-dz*s,z:dx*s+dz*c,y:k.y-b.y,yaw:k.yaw-b.h});
  if(prev)o.yaw=unw(o.yaw,prev.yaw);prev=o;return o});
 return makePath(L)}
function relToWorld(p){const b=bikeNow(),c=Math.cos(b.h),s=Math.sin(b.h);
 return Object.assign({},p,{x:b.x+p.x*c+p.z*s,z:b.z-p.x*s+p.z*c,y:p.y+b.y,yaw:p.yaw+b.h})}
const mkPlay=rec=>({t:0,path:mkPath(CIN.rel),rel:CIN.rel,rec});
/* Mode kontrol: 'cam' = kamera drone bebas (motor diam); 'ride' = tombol motor aktif, kamera mengikuti jalur keyframe (atau kamera game biasa kalau belum ada keyframe) */
function droneRide(){
 if(DR.on)return;DR.prev=CAM.mode;if(CAM.mode===1)camSet(0,true);
 const d=new THREE.Vector3();cam.getWorldDirection(d);
 DR.x=cam.position.x;DR.y=Math.max(cam.position.y,2);DR.z=cam.position.z;
 DR.yaw=Math.atan2(-d.x,-d.z);DR.pitch=Math.asin(Math.max(-1,Math.min(1,d.y)));
 DR.vx=DR.vy=DR.vz=0;DR.f=DR.b=0;for(const q in DR.k)DR.k[q]=0;
 drag=null;CB.t=1;DR.on=true}
function syncCtl(){
 if(!CIN.on)return;const w=$('w');
 if(CIN.ctl==='cam'){ui.classList.remove('ride');w.classList.remove('cinRide');
  if(st==='ow'&&!DR.on)droneOn();else if(DR.on)w.classList.add('drone')}
 else{ui.classList.add('ride');w.classList.add('cinRide');
  if(CIN.play){if(!DR.on)droneRide();w.classList.remove('drone')}
  else if(DR.on)droneOff();
  w.classList.remove('drone')}
 $('cMot').textContent='🏍 MOTOR: '+(CIN.ctl==='ride'?'ON':'OFF');$('cMot').classList.toggle('on',CIN.ctl==='ride');
 $('cRel').textContent='📌 IKUT MOTOR: '+(CIN.rel?'ON':'OFF');$('cRel').classList.toggle('on',CIN.rel)}
function applyPose(p){DR.x=p.x;DR.y=p.y;DR.z=p.z;DR.yaw=p.yaw;DR.pitch=Math.max(-1.45,Math.min(1.45,p.pitch));DR.vx=DR.vy=DR.vz=0;CIN.roll=p.roll;CIN.fov=p.fov}
function total(){let t=0;for(let i=1;i<CIN.kf.length;i++)t+=Math.max(.1,CIN.kf[i].d);return t}
function render(){
 const ch=$('cChips');ch.innerHTML='';
 if(!CIN.kf.length){const s=document.createElement('span');s.className='cEmpty';s.textContent='Atur kamera, lalu tekan ＋ KEYFRAME. Tanpa keyframe = rekam kamera bebas / kamera game.';ch.appendChild(s)}
 CIN.kf.forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.className='kfc'+(i===CIN.sel?' s':'');b.textContent=i+1;
  b.onclick=()=>{if(R||CIN.play)return;CIN.sel=i;applyPose(CIN.kf[i]);render()};ch.appendChild(b)});
 const k=CIN.kf[CIN.sel];$('cDv').textContent=(k&&CIN.sel>0?k.d:CIN.dur).toFixed(1)+' s';
 $('cPv').textContent=CIN.play&&!CIN.play.rec?'■ STOP':'▶ PREVIEW';
 const e=!!(R||CIN.play);

 ['cAdd','cUpd','cDel','cClr','cDm','cDp','cMot','cRel'].forEach(i=>{$(i).disabled=e&&i!=='cPv'});
 $('cShut').classList.toggle('rec',CIN.rec);
 if(CIN.kf.length>=2){$('cPv').title='Total '+total().toFixed(1)+' detik'}}
function syncSl(){const r=Math.round(CIN.roll*180/Math.PI);if(+$('cRoll').value!==r)$('cRoll').value=r;$('cRollV').textContent=r+'°';
 const f=Math.round(CIN.fov);if(+$('cFov').value!==f)$('cFov').value=f;$('cFovV').textContent=f+'°'}
$('cRoll').oninput=e=>{CIN.roll=+e.target.value*Math.PI/180;syncSl()};
$('cFov').oninput=e=>{CIN.fov=+e.target.value;syncSl()};
$('cAdd').onclick=()=>{const k=pose(CIN.kf[CIN.kf.length-1]);k.d=CIN.kf.length?CIN.dur:0;CIN.kf.push(k);CIN.sel=CIN.kf.length-1;render();toast('Keyframe '+CIN.kf.length+' ditempatkan')};
$('cUpd').onclick=()=>{if(CIN.sel<0)return toast('Pilih keyframe dulu');const d=CIN.kf[CIN.sel].d;CIN.kf[CIN.sel]=Object.assign(pose(CIN.kf[CIN.sel-1]||CIN.kf[CIN.sel]),{d});render();toast('Keyframe '+(CIN.sel+1)+' diperbarui')};
$('cDel').onclick=()=>{if(CIN.sel<0)return;CIN.kf.splice(CIN.sel,1);if(CIN.kf.length)CIN.kf[0].d=0;CIN.sel=Math.min(CIN.sel,CIN.kf.length-1);render()};
$('cClr').onclick=()=>{if(!CIN.kf.length)return;if(!confirm('Hapus semua keyframe?'))return;CIN.kf=[];CIN.sel=-1;render()};
const stepDur=dd=>{const k=CIN.kf[CIN.sel];if(k&&CIN.sel>0){k.d=Math.max(.5,Math.min(30,Math.round((k.d+dd)*10)/10))}else CIN.dur=Math.max(.5,Math.min(30,Math.round((CIN.dur+dd)*10)/10));render()};
$('cDm').onclick=()=>stepDur(-.5);$('cDp').onclick=()=>stepDur(.5);
$('cPv').onclick=()=>{
 if(R)return;
 if(CIN.play){CIN.play=null;syncCtl();render();return}
 if(CIN.kf.length<2)return toast('Butuh minimal 2 keyframe untuk preview');
 CIN.play=mkPlay(false);syncCtl();render()};
$('cMot').onclick=()=>{if(R||CIN.play)return;CIN.ctl=CIN.ctl==='ride'?'cam':'ride';syncCtl();render();toast(CIN.ctl==='ride'?'MOTOR ON · kendalikan motor, tombol rekam di kanan atas':'MOTOR OFF · kamera drone bebas')};
$('cRel').onclick=()=>{if(R||CIN.play)return;CIN.rel=!CIN.rel;syncCtl();toast(CIN.rel?'Kamera akan IKUT motor (posisi relatif ke motor)':'Kamera diam di posisi dunia')};
$('cX').onclick=()=>CIN.exit();
$('cShut').onclick=()=>{if(R&&R.stopping)return;if(R)CIN.stop();else CIN.start()};

/* putar dua jari = roll kamera */
const tp=new Map();let lastAng=null;
gl.addEventListener('pointerdown',e=>{tp.set(e.pointerId,{x:e.clientX,y:e.clientY});lastAng=null},true);
gl.addEventListener('pointermove',e=>{const p=tp.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
 if(!CIN.on||CIN.play||tp.size<2)return;const v=[...tp.values()],a=Math.atan2(v[1].y-v[0].y,v[1].x-v[0].x);
 if(lastAng!=null){let d=a-lastAng;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;CIN.roll+=d;syncSl()}lastAng=a},true);
['pointerup','pointercancel'].forEach(n=>gl.addEventListener(n,e=>{tp.delete(e.pointerId);lastAng=null},true));

/* ---------- Dipanggil dari game ---------- */
/* droneCam() memanggil ini tiap frame: saat preview/rekam jalur, kamera mengikuti spline. */
CIN.camStep=function(dt){
 const p=CIN.play;if(!p){syncSl();return}
 p.t+=dt;const done=p.t>=p.path.total;let q=p.path.at(Math.min(p.t,p.path.total));if(p.rel)q=relToWorld(q);applyPose(q);syncSl();
 if(done){CIN.play=null;if(p.rec)CIN._endAfter=true;else toast('Preview selesai');syncCtl();render()}};
CIN.busy=()=>!!(R&&R.enc&&R.enc.encodeQueueSize>6);
CIN.fit=function(){renderer.setPixelRatio(1);renderer.setSize(VW,VH,false);cam.aspect=VW/VH;cam.updateProjectionMatrix();if(window.fxResize)fxResize(VW,VH)};
/* dipanggil sesudah satu frame selesai digambar saat merekam */
CIN.cap=function(){
 if(!R||R.dead||R.stopping)return;
 const i=R.n;
 try{const fr=new VideoFrame(renderer.domElement,{timestamp:Math.round(i*1e6/FPS),duration:Math.round(1e6/FPS)});R.enc.encode(fr,{keyFrame:i%120===0});fr.close()}
 catch(e){fail(e);return}
 if(i===30)thumb();
 R.n++;
 if(i%6===0)$('cRecT').textContent='REC '+fmt(R.n/FPS)+' · 1280×720 · 60 FPS'+(CIN.play?'':'')+(R.n>=FPS*MAXSEC-1?' · BATAS':'');
 if(CIN._endAfter||R.n>=FPS*MAXSEC){CIN._endAfter=false;CIN.stop()}};
const fmt=s=>{s=Math.floor(s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function thumb(){try{const c=document.createElement('canvas');c.width=320;c.height=180;c.getContext('2d').drawImage(renderer.domElement,0,0,320,180);R.thumb=c.toDataURL('image/jpeg',.72)}catch(e){}}
function fail(e){console.error(e);if(R)R.dead=true;toast('Gagal merekam: '+((e&&e.message)||e));if(R&&!R.stopping)CIN.stop()}

/* ---------- Rekam ---------- */
async function pickCodec(){
 if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
 for(const [codec,id] of [['vp8','V_VP8'],['vp09.00.40.08','V_VP9'],['vp09.00.31.08','V_VP9']]){
  try{const cfg={codec,width:VW,height:VH,framerate:FPS,bitrate:16e6,latencyMode:'realtime'};const s=await VideoEncoder.isConfigSupported(cfg);if(s&&s.supported)return{cfg,id}}catch(e){}}
 return null}
CIN.start=async function(){
 if(R||!CIN.on)return;
 const pc=await pickCodec();
 if(!pc){toast('HP/WebView ini tidak mendukung rekam 60 FPS asli (WebCodecs)');return}
 const cv=renderer.domElement;
 R={n:0,mux:new WebmMux(VW,VH,pc.id),enc:null,thumb:'',stopping:false,dead:false,pr:renderer.getPixelRatio(),sty:cv.style.cssText,t0:Date.now(),codec:pc.cfg.codec};
 try{
  R.enc=new VideoEncoder({output:(ch)=>{const b=new Uint8Array(ch.byteLength);ch.copyTo(b);R.mux.add(b,ch.type==='key',Math.round(ch.timestamp*FPS/1e6))},error:e=>fail(e)});
  R.enc.configure(pc.cfg)}
 catch(e){R=null;toast('Encoder gagal: '+((e&&e.message)||e));return}
 cv.style.width='100%';cv.style.height='100%';cv.style.objectFit='contain';cv.style.background='#000';
 CIN.play=CIN.kf.length>=2?mkPlay(true):null;
 CIN._endAfter=false;
 CIN.rec=true;syncCtl();CIN.fit();
 $('cRec').classList.add('on');$('cRecT').textContent='REC 00:00 · 1280×720 · 60 FPS';
 toast(CIN.play?'Merekam jalur keyframe…':(CIN.ctl==='ride'?'Merekam sambil jalan…':'Merekam kamera bebas…'));
 render()};
CIN.stop=async function(){
 if(!R||R.stopping)return;
 const S=R;S.stopping=true;CIN.rec=false;CIN.play=null;
 $('cShut').classList.add('busy');$('cRecT').textContent='MENYIMPAN VIDEO…';
 let blob=null;
 try{if(!S.dead){await S.enc.flush()}try{S.enc.close()}catch(e){}
  if(!S.dead&&S.n>=2){blob=S.mux.finish()}}
 catch(e){console.error(e)}
 const cv=renderer.domElement;cv.style.cssText=S.sty;renderer.setPixelRatio(S.pr);rs();
 try{
  if(blob){const d=new Date(),p=n=>String(n).padStart(2,'0'),id='v'+Date.now();
   await GAL.save({id,name:'Cinematic '+p(d.getDate())+'-'+p(d.getMonth()+1)+'-'+d.getFullYear()+' '+p(d.getHours())+'.'+p(d.getMinutes())+'.'+p(d.getSeconds()),ts:Date.now(),frames:S.n,dur:S.n/FPS,w:VW,h:VH,fps:FPS,size:blob.size,thumb:S.thumb,codec:S.codec},blob);
   toast('Video tersimpan di GALERI ('+fmt(S.n/FPS)+', 60 FPS)')}
  else if(!S.dead)toast('Rekaman terlalu pendek, tidak disimpan')}
 catch(e){console.error(e);toast('Gagal menyimpan video: '+((e&&e.message)||e))}
 R=null;$('cRec').classList.remove('on');$('cShut').classList.remove('busy');syncCtl();render()};

/* ---------- Masuk / keluar mode ---------- */
CIN.enter=function(o){
 if(CIN.on)return;
 CIN.on=true;CIN.fromGame=!!(o&&o.fromGame);CIN.ctl='cam';CIN.kf=[];CIN.sel=-1;CIN.roll=0;CIN.fov=72;CIN.play=null;
 $('w').classList.add('cin');ui.classList.add('on');render();syncSl();syncCtl();
 setTimeout(()=>{if(!CIN.on)return;syncCtl();toast('CINEMATIC · atur kamera → ＋ KEYFRAME → tombol merah untuk rekam · 🏍 MOTOR = rekam sambil jalan')},CIN.fromGame?50:500)};
CIN.exit=async function(){
 if(!CIN.on)return;
 if(R&&!R.stopping)await CIN.stop();
 else if(R){let n=0;while(R&&n++<200)await new Promise(r=>setTimeout(r,100))}
 CIN.on=false;CIN.play=null;ui.classList.remove('on','ride');$('w').classList.remove('cin','cinRide');
 if(CIN.fromGame){CIN.fromGame=false;if(DR.on)droneOff();toast('Kembali ke game')}
 else goHome()};
/* Esc / tombol G bisa mematikan drone: nyalakan lagi selama mode cinematic aktif */
setInterval(()=>{if(CIN.on&&CIN.ctl==='cam'&&st==='ow'&&!DR.on)droneOn()},400);

/* ---------- Galeri ---------- */
const gal=document.createElement('div');gal.id='cinGal';gal.className='mdl';
gal.innerHTML='<div class="cgBox"><div class="cgHead"><h2>GALERI CINEMATIC</h2><button class="cgClose" id="cgX" type="button">TUTUP</button></div><div id="cgList"></div></div>';
document.body.appendChild(gal);
const pl=document.createElement('div');pl.id='cinPl';pl.className='mdl';pl.style.cssText='z-index:60;background:#000;padding:0';
pl.innerHTML='<button class="cgClose" id="cpX" type="button">✕ TUTUP</button><video id="cpV" controls playsinline></video>';
document.body.appendChild(pl);
let plUrl=null;
function closePl(){const v=$('cpV');try{v.pause()}catch(e){}v.removeAttribute('src');v.load();if(plUrl){URL.revokeObjectURL(plUrl);plUrl=null}pl.style.display='none'}
$('cpX').onclick=closePl;
async function play(m){const b=await GAL.blob(m.id);if(!b)return toast('File video tidak ditemukan');plUrl=URL.createObjectURL(b);const v=$('cpV');v.src=plUrl;pl.style.display='flex';try{await v.play()}catch(e){}}
async function saveOut(m){
 const b=await GAL.blob(m.id);if(!b)return;const f=new File([b],m.name.replace(/[^\w.\- ]+/g,'_')+'.webm',{type:'video/webm'});
 if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:m.name});return}catch(e){if(e&&e.name==='AbortError')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000);toast('Mengunduh '+f.name)}
async function showGal(){
 gal.style.display='flex';const box=$('cgList');box.innerHTML='<div class="cgEmpty">Memuat…</div>';
 let a=[];try{a=await GAL.list()}catch(e){box.innerHTML='<div class="cgEmpty">Galeri tidak bisa dibuka di perangkat ini.</div>';return}
 if(!a.length){box.innerHTML='<div class="cgEmpty">Belum ada video.<br>Rekam dulu lewat tombol CINEMATIC di home.</div>';return}
 box.innerHTML='<div class="cgGrid"></div>';const g=box.firstChild;
 for(const m of a){
  const c=document.createElement('div');c.className='cgCard';
  const mb=(m.size/1048576).toFixed(1);
  c.innerHTML='<button class="cgTh" type="button" aria-label="Putar"'+(m.thumb?' style="background-image:url('+m.thumb+')"':'')+'>▶</button><div class="cgInfo"><b></b><span>'+fmt(m.dur)+' · '+m.w+'×'+m.h+' · '+m.fps+' FPS · '+mb+' MB</span></div><div class="cgBtns"><button type="button" class="p">PUTAR</button><button type="button" class="s">SIMPAN</button><button type="button" class="d" aria-label="Hapus">🗑</button></div>';
  c.querySelector('b').textContent=m.name;
  c.querySelector('.cgTh').onclick=c.querySelector('.p').onclick=()=>play(m);
  c.querySelector('.s').onclick=()=>saveOut(m);
  c.querySelector('.d').onclick=async()=>{if(!confirm('Hapus video "'+m.name+'"?'))return;try{await GAL.del(m.id)}catch(e){}showGal()};
  g.appendChild(c)}}
$('cgX').onclick=()=>{closePl();gal.style.display='none'};

/* ---------- Tombol di home ---------- */
tapHome('hCN',()=>{audio();reset();setMode('ow');cyaw=0;cpitch=.25;startOW();st='ow';hideHome();CIN.enter()});
tapHome('hGL',()=>showGal());
/* tombol CINEMATIC di dalam game open world (samping tombol drone) */
(function(){const tr=$('tr');if(!tr)return;const b=document.createElement('button');b.type='button';b.className='tb';b.id='cinb';b.setAttribute('aria-label','Cinematic');b.textContent='🎬 CINEMATIC';
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(st==='ow'&&!CIN.on)CIN.enter({fromGame:true})});
 tr.insertBefore(b,tr.firstChild)})();
})();
