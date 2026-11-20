// ===== LICENCY (kredit / lisensi model 3D), dibuka dari tombol LICENCY di home =====
function showLicense(){hideHome();ov.style.display='flex';
 const li=t=>'<p style="font-size:13px;margin:10px 0;opacity:.9">'+t+'</p>';
 card.innerHTML='<h1>LICENCY</h1>'+li('Model motor: "Honda Vario 150 0" oleh seenkonkgrng (CC BY 4.0)')+li('Model motor TOKO: "Honda Vario Modification" oleh seenkonkgrng (CC BY 4.0)')+li('Model trotoar: "TROTOAT 1_2X2 M T 10CM" oleh eventdesignws (CC BY 4.0)')+li('Model mobil polisi: "mobil+pak+polisi" oleh eventdesignws (CC BY 4.0)')+li('Model barrier beton: "Barrier béton" oleh aymen kmama (CC BY 4.0)')+li('Model tenda: "TENDA+3X3 FACIA POLOS" oleh eventdesignws (CC BY 4.0)')+'<button id="lcb" class="gmB">KEMBALI</button>';
 $('lcb').onclick=()=>{ov.style.display='none';showHome()}}
// ===== MENU DALAM GAME (tombol garis 3): HOME + PENGATURAN =====
function openGameMenu(){
 try{setGas(false)}catch(e){}try{joyReset()}catch(e){}try{inp.l=inp.r=inp.brk=inp.rev=0}catch(e){}
 ov.style.display='flex';
 card.innerHTML='<h1>MENU</h1><button id="gmH" class="gmB">HOME</button><button id="gmS" class="gmB">PENGATURAN</button><button id="gmC" class="gmB gmGhost">LANJUTKAN</button>';
 $('gmH').onclick=()=>{ov.style.display='none';goHome()};
 $('gmS').onclick=()=>showSettings('game');
 $('gmC').onclick=()=>{ov.style.display='none'}}
// ===== PENGATURAN > GRAFIK: kualitas (normal/tinggi) + resolusi 0-100 =====
function showGraphics(fg){showSettings(fg?'game':'home','g')}


// ===== KARAKTER / BAJU / CELANA =====
// Slot baju & celana sengaja KOSONG (null) karena file-nya belum ada.
// Nanti isi slot dengan {id:'baju1',nama:'Jaket Merah'} dst. Slot terisi otomatis bisa dipilih.
const WARDROBE={
 karakter:[{id:'pembalap',nama:'Pembalap'},null,null],
 baju:[null,null,null,null,null,null],
 celana:[null,null,null,null,null,null]
};
let CHSEL={karakter:'pembalap',baju:null,celana:null};
try{const o=JSON.parse(localStorage.getItem('dmChar')||'null');if(o&&typeof o==='object')CHSEL=Object.assign(CHSEL,o)}catch(e){}
function saveChar(){try{localStorage.setItem('dmChar',JSON.stringify(CHSEL))}catch(e){}}
// model karakter berdiri (kotak-kotak sewarna rider: jaket merah, celana gelap, helm putih)
function chFigure(){const g=new THREE.Group(),jm=std('#7a1c1c',.8),dk=std('#1d1d22',.8),sk=std('#d9a679',.7),bt=std('#0a0a0a',.8),hm=std('#e8e8ee',.3);
 const part=(geo,m,x,y,z,n)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.name=n;g.add(me);return me};
 [-1,1].forEach(s=>{
  part(bx(.17,.8,.2),dk,s*.1,.5,0,'celana');
  part(bx(.18,.1,.3),bt,s*.1,.05,.04,'sepatu');
  part(bx(.11,.56,.12),jm,s*.29,1.14,0,'baju').rotation.z=s*.05;
  part(new THREE.SphereGeometry(.06,10,10),sk,s*.31,.82,0,'tangan')});
 part(bx(.44,.2,.22),dk,0,.93,0,'celana');
 part(bx(.44,.55,.24),jm,0,1.2,0,'baju');
 part(new THREE.CylinderGeometry(.05,.06,.1,10),sk,0,1.52,0,'leher');
 part(new THREE.SphereGeometry(.18,16,16),hm,0,1.68,0,'helm');
 part(bx(.22,.07,.05),std('#0d0d12',.3),0,1.68,.16,'visor');
 return g}
const CHV={r:null,sc:null,cam:null,fig:null,raf:0,on:false,yaw:0,drag:null,last:0,w:0,h:0,mixer:null,model:null,loading:false};
// muat model GLB karakter (kerangka 69 tulang + animasi bawaan file). Gagal dimuat -> pakai model kotak cadangan.
function chB64ToBuf(b64){
 return fetch('data:application/octet-stream;base64,'+b64).then(r=>r.arrayBuffer()).catch(()=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer})}
function chLoadModel(){if(CHV.loading||CHV.model)return;CHV.loading=true;
 chB64ToBuf(CHAR_GLB_B64).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
  const m=gl.scene;m.traverse(o=>{if(o.isSkinnedMesh)o.frustumCulled=false});
  CHV.model=m;CHV.fig.add(m);
  if(gl.animations&&gl.animations.length){CHV.mixer=new THREE.AnimationMixer(m);
   CHV.mixer.clipAction(THREE.AnimationClip.findByName(gl.animations,'Idle')||gl.animations[0]).play()}
 }).catch(e=>{console.error('GLB',e);CHV.fig.add(chFigure())}).then(()=>{CHV.loading=false})}
function chInit(){if(CHV.r)return true;
 try{const cv=$('charCv'),r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio||1,3));
  r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1;r.setClearColor(0,0);
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,.7,.1,60);
  sc.add(new THREE.HemisphereLight(0x8fa4d8,0x120f14,.4));
  const L=(c,i,x,y,z)=>{const d=new THREE.DirectionalLight(c,i);d.position.set(x,y,z);sc.add(d)};
  L(0xffe2b8,.75,-3,4,3);L(0xff8a2a,.9,3.5,2.2,-3.5);L(0x3b8cff,.7,-4,1.8,-3);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.62,.66,.05,48),std('#14161f',.6,.3));base.position.y=-.025;sc.add(base);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.6,.64,64),new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.003;sc.add(ring);
  const fig=new THREE.Group();sc.add(fig);
  // 1 jari geser = putar karakter
  cv.addEventListener('pointerdown',e=>{CHV.drag={x:e.clientX,id:e.pointerId};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!CHV.drag||CHV.drag.id!==e.pointerId)return;CHV.yaw+=(e.clientX-CHV.drag.x)*.012;CHV.drag.x=e.clientX});
  const up=e=>{if(CHV.drag&&CHV.drag.id===e.pointerId)CHV.drag=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  CHV.r=r;CHV.sc=sc;CHV.cam=cam;CHV.fig=fig;chLoadModel();return true}
 catch(e){console.error('CHV',e);CHV.r=null;return false}}
function chLoop(n){if(!CHV.on)return;CHV.raf=requestAnimationFrame(chLoop);
 const cv=CHV.r.domElement,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
 if(w!==CHV.w||h!==CHV.h){CHV.w=w;CHV.h=h;CHV.r.setSize(w,h,false);CHV.cam.aspect=w/h;CHV.cam.updateProjectionMatrix();
  CHV.cam.position.set(0,1.15,Math.max(4.2,1.7/CHV.cam.aspect));CHV.cam.lookAt(0,.9,0)}
 const dt=CHV.last?Math.min(.05,(n-CHV.last)/1000):0;CHV.last=n;if(CHV.mixer)CHV.mixer.update(dt);
 if(!CHV.drag)CHV.yaw+=dt*.5;
 CHV.fig.rotation.y=CHV.yaw;CHV.r.render(CHV.sc,CHV.cam)}
function hideCharacter(){CHV.on=false;cancelAnimationFrame(CHV.raf);$('charScr').style.display='none'}
const CH_SOON=true; // true = semua slot karakter/baju/celana tampil COMING SOON (belum bisa dipilih). Ubah ke false kalau file sudah ada.
function showCharacter(tab){hideHome();ov.style.display='none';$('charScr').style.display='block';
 $('charBg').style.backgroundImage='url('+HOME_IMG+')';tab=WARDROBE[tab]?tab:'karakter';
 const T=[['karakter','KARAKTER'],['baju','BAJU'],['celana','CELANA']],items=WARDROBE[tab],clk=()=>{try{uiSound('click')}catch(e){}};
 const slots=items.map((it,i)=>(it&&!CH_SOON)?
  '<button class="chSlot'+(CHSEL[tab]===it.id?' on':'')+'" data-i="'+i+'" type="button"><b>'+it.nama+'</b></button>':
  '<button class="chSlot empty" data-i="'+i+'" type="button"><span>+</span><small>COMING SOON</small></button>').join('');
 const hint=CH_SOON?'Coming soon.':(tab==='karakter'?'Karakter lain belum tersedia.':'Slot masih kosong, belum ada file '+tab+'.');
 const P=$('charPanel');
 P.innerHTML='<h1>KARAKTER</h1><div class="chTabs">'+T.map(t=>'<button class="chTab'+(t[0]===tab?' on':'')+'" data-t="'+t[0]+'" type="button">'+t[1]+'</button>').join('')+'</div>'+
  '<div class="chGrid">'+slots+'</div><p class="chMsg" id="chMsg">'+hint+'</p><button id="charBack" type="button">KEMBALI</button>';
 P.querySelectorAll('.chTab').forEach(b=>b.onclick=()=>{clk();showCharacter(b.dataset.t)});
 P.querySelectorAll('.chSlot').forEach(b=>b.onclick=()=>{clk();const it=items[+b.dataset.i];
  if(!it||CH_SOON){$('chMsg').textContent=hint;return}
  CHSEL[tab]=it.id;saveChar();showCharacter(tab)});
 $('charBack').onclick=()=>{clk();hideCharacter();showHome()};
 if(!CHV.on&&chInit()){CHV.on=true;CHV.last=0;CHV.raf=requestAnimationFrame(chLoop)}}
// ===== KENDARAAN (upgrade / modifikasi) =====
// [id, label, jumlah slot]. Semua slot masih KOSONG karena file part belum ada.
const UPG=[['repaint','REPAINT',5],['knalpot','KNALPOT',5],['velg','VELG & BAN',5],['mounting','MOUNTING',5],['downsize','DOWNSIZE',5],['mesin','MESIN',5]];

/* ===== REPAINT: warna BODY / VELG + pemilih warna (HSV) ===== */
var PAINT={b:null,v:null},PAINT_DIRTY=false,PU=null;
try{const o=JSON.parse(localStorage.getItem('dmPaint')||'null');if(o&&typeof o==='object')['b','v'].forEach(k=>{if(typeof o[k]==='string'&&/^#[0-9a-f]{6}$/i.test(o[k]))PAINT[k]=o[k]})}catch(e){}
function savePaint(){PAINT_DIRTY=true;try{localStorage.setItem('dmPaint',JSON.stringify(PAINT))}catch(e){}}
function paintApply(root){if(!root||!PAINT)return;root.traverse(o=>{if(!o.isMesh||!o.userData)return;
 if(o.userData.sp&&o.material&&!Array.isArray(o.material)){ // foto speedometer: hanya bagian pink pada tekstur yang diwarnai, sisanya tetap hitam
  let m=o.material;
  if(!m.userData||!m.userData.pc){m=m.clone();m.userData=Object.assign({},m.userData,{pc:1});
   const U={value:new THREE.Vector3(0,0,0)},ON={value:0};m.userData.spU=U;m.userData.spON=ON;
   m.onBeforeCompile=sh=>{sh.uniforms.uSpC=U;sh.uniforms.uSpOn=ON;
    sh.fragmentShader='uniform vec3 uSpC;uniform float uSpOn;\n'+sh.fragmentShader.replace('#include <map_fragment>',
     '#include <map_fragment>\n#ifdef USE_MAP\n{float pk=smoothstep(.02,.10,min(texelColor.r,texelColor.b)-texelColor.g)*uSpOn;float lm=dot(texelColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(diffuseColor.rgb,uSpC*clamp(lm*2.4,0.,1.4),pk);}\n#endif')};
   m.customProgramCacheKey=()=>'spPaint';m.needsUpdate=true;o.material=m}
  const hx=PAINT.b;
  if(hx){const c=new THREE.Color(hx);c.convertSRGBToLinear();m.userData.spU.value.set(c.r,c.g,c.b);m.userData.spON.value=1}else m.userData.spON.value=0;
  return}
 const arr=Array.isArray(o.material),ms=arr?o.material:[o.material],pm=o.userData.pm;
 if(arr?!pm:!o.userData.pk)return;
 const out=ms.map((m0,j)=>{
  const u=arr?pm[j]:{k:o.userData.pk,dc:o.userData.dc,de:o.userData.de,dm:o.userData.dm};
  const k=u&&u.k;if(!k||!m0)return m0;
  let m=m0;if(!m.userData||!m.userData.pc){m=m.clone();m.userData=Object.assign({},m.userData,{pc:1})}
  const hx=PAINT[k];
  if(hx){const c=new THREE.Color(hx);c.convertSRGBToLinear();m.color.copy(c);
   if(k==='b'){m.emissive.copy(c).multiplyScalar(.22)}else{m.emissive.setRGB(0,0,0);m.metalness=.65;m.roughness=.25}}
  else{const d=u.dc,e=u.de,mr=u.dm;m.color.setRGB(d[0],d[1],d[2]);m.emissive.setRGB(e[0],e[1],e[2]);m.metalness=mr[0];m.roughness=mr[1]}
  return m});
 o.material=arr?out:out[0]})}
const PDEF={b:[.92,.14,.6],v:[.74,.74,.76]};
/* KEMIRINGAN MOTOR SAAT BELOK: LEAN_MIN = miring dasar di 0 km/h, LEAN_RATE = tambahan per kecepatan, LEAN_MAX = batas. Naikkan LEAN_MIN/LEAN_RATE kalau masih kurang miring. */
window.LEAN_MIN=.2;window.LEAN_RATE=1/12;window.LEAN_MAX=.5;
function LEANK(v){return Math.min(window.LEAN_MAX,window.LEAN_MIN+Math.abs(v)*window.LEAN_RATE)}
/* BODY: selain material 'bodiputi', material berwarna pink muda (area sekitar speedometer) juga ikut di-repaint.
   Kalau masih ada bagian yang tidak berubah, lihat Console (log '[VARIO mat]') lalu isi window.BODY_EXTRA = /namaMaterial/i */
window.BODY_EXTRA=window.BODY_EXTRA||null;
function isBodyMat(mt,nm){
 try{const c=mt.color;if(c){const o={};c.clone().convertLinearToSRGB().getHSL(o);console.log('[VARIO mat]',nm,'#'+c.clone().convertLinearToSRGB().getHexString(),'h'+o.h.toFixed(2),'s'+o.s.toFixed(2),'l'+o.l.toFixed(2))}}catch(e){}
 if(/bodiputi/i.test(nm))return true;
 if(window.BODY_EXTRA&&window.BODY_EXTRA.test(nm))return true;
 if(!mt||!mt.color||mt.transparent||(mt.opacity!==undefined&&mt.opacity<1))return false; // kaca/panel transparan tetap hitam
 if(/^(mika|kaca|glass|lens|lampu|ban|ruji|velg|disk|karet|rubber|krom|chrome)/i.test(nm))return false;
 try{const o={};mt.color.clone().convertLinearToSRGB().getHSL(o);
  // pink / lavender / putih keunguan (hue 0.70-1.0 atau 0-0.04), boleh pucat
  if((o.h>=.7||o.h<=.04)&&o.s>=.08&&o.l>=.5)return true}catch(e){}
 return false}
function hsv2rgb(h,s,v){h=(((h%360)+360)%360)/60;const i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));return [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6].map(x=>Math.round(x*255))}
function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return [h,mx?d/mx:0,mx]}
const rgb2hex=a=>'#'+a.map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
function paintBuild(){if(PU)return PU;
 const el=document.createElement('div');el.id='vehPaint';
 el.innerHTML='<div class="pnL"><div class="pnSV" id="pnSVw"><canvas id="pnSV" width="118" height="118"></canvas><i id="pnCur"></i></div><div class="pnHue" id="pnHue"><i id="pnHK"></i></div></div>'+
 '<div class="pnR"><div class="pnTg"><button type="button" class="pnT on" data-t="b">BODY</button><button type="button" class="pnT" data-t="v">VELG</button></div>'+
 '<div class="pnHx"><span id="pnSw"></span><input id="pnHex" type="text" maxlength="7" spellcheck="false" autocomplete="off" autocapitalize="characters"><button type="button" id="pnRs">RESET</button></div>'+
 ['H','S','V'].map(k=>'<div class="pnRow"><em>'+k+'</em><input type="range" id="pn'+k+'" min="0" max="255" value="0"><b id="pn'+k+'v">0</b></div>').join('')+'</div>';
 $('vehScr').appendChild(el);
 const cv=$('pnSV'),cx=cv.getContext('2d'),svw=$('pnSVw'),hue=$('pnHue'),cur=$('pnCur'),hk=$('pnHK'),hexI=$('pnHex'),sw=$('pnSw');
 const sl={H:$('pnH'),S:$('pnS'),V:$('pnV')},lb={H:$('pnHv'),S:$('pnSv'),V:$('pnVv')};
 let t='b',H=0,S=1,V=1;
 const css=a=>'rgb('+a.join(',')+')';
 const sync=(src,emit)=>{const rgb=hsv2rgb(H,S,V),hx=rgb2hex(rgb);
  const hc=hsv2rgb(H,1,1);cx.fillStyle=css(hc);cx.fillRect(0,0,118,118);
  let g=cx.createLinearGradient(0,0,118,0);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(0,0,118,118);
  g=cx.createLinearGradient(0,0,0,118);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'#000');cx.fillStyle=g;cx.fillRect(0,0,118,118);
  cur.style.left=(S*100)+'%';cur.style.top=((1-V)*100)+'%';hk.style.top=((1-H/360)*100)+'%';
  sl.H.value=Math.round(H/360*255);sl.S.value=Math.round(S*255);sl.V.value=Math.round(V*255);
  lb.H.textContent=sl.H.value;lb.S.textContent=sl.S.value;lb.V.textContent=sl.V.value;
  sl.S.style.background='linear-gradient(90deg,'+css(hsv2rgb(H,0,V))+','+css(hsv2rgb(H,1,V))+')';
  sl.V.style.background='linear-gradient(90deg,#000,'+css(hsv2rgb(H,S,1))+')';
  sw.style.background=hx;if(src!=='hex')hexI.value=hx;
  if(emit){PAINT[t]=hx;savePaint();if(typeof VH!=='undefined'&&VH.piv)paintApply(VH.piv)}};
 const setHex=hx=>{const m=/^#?([0-9a-f]{6})$/i.exec(hx.trim());if(!m)return false;const n=parseInt(m[1],16),a=rgb2hsv(n>>16&255,n>>8&255,n&255);if(a[1]>0&&a[2]>0)H=a[0];S=a[1];V=a[2];return true};
 const load=()=>{setHex(PAINT[t]||rgb2hex(new THREE.Color(PDEF[t][0],PDEF[t][1],PDEF[t][2]).convertLinearToSRGB().toArray().map(x=>Math.round(x*255))));sync('load',false)};
 const pos=(e,n)=>{const r=n.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))]};
 const drag=(n,fn)=>{let on=false;n.addEventListener('pointerdown',e=>{on=true;try{n.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();fn(e)});n.addEventListener('pointermove',e=>{if(on)fn(e)});const end=()=>{on=false};n.addEventListener('pointerup',end);n.addEventListener('pointercancel',end)};
 drag(svw,e=>{const p=pos(e,svw);S=p[0];V=1-p[1];sync('sv',true)});
 drag(hue,e=>{const p=pos(e,hue);H=(1-p[1])*360;sync('h',true)});
 sl.H.oninput=()=>{H=sl.H.value/255*360;sync('h',true)};
 sl.S.oninput=()=>{S=sl.S.value/255;sync('s',true)};
 sl.V.oninput=()=>{V=sl.V.value/255;sync('v',true)};
 hexI.addEventListener('input',()=>{let v=hexI.value.trim();if(v[0]!=='#')v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v)&&setHex(v))sync('hex',true)});
 hexI.addEventListener('change',()=>sync('x',false));
 ['keydown','keyup'].forEach(n=>hexI.addEventListener(n,e=>e.stopPropagation()));
 el.querySelectorAll('.pnT').forEach(b=>b.onclick=()=>{t=b.dataset.t;el.querySelectorAll('.pnT').forEach(x=>x.classList.toggle('on',x===b));load()});
 $('pnRs').onclick=()=>{PAINT[t]=null;savePaint();if(VH.piv)paintApply(VH.piv);load()};
 PU={el,open(){el.style.display='flex';load()},close(){el.style.display='none'}};return PU}
function paintOpen(on){if(on)paintBuild().open();else if(PU)PU.close()}
const VH={r:null,sc:null,cam:null,piv:null,src:null,raf:0,on:false,yaw:Math.PI*.62,drag:null,w:0,h:0,px:0};
function vhBuild(){if(!VH.piv)return;while(VH.piv.children.length)VH.piv.remove(VH.piv.children[0]);
 const ps=playerSrc(),b=ps?norm(ps):procBike('#ff9a1f','#7a1c1c');if(ps&&(ps.userData.hq||ps.userData.lq)&&VH.r)envBike(b,VH.r,1);paintApply(b);b.traverse(o=>o.layers.set(0));VH.piv.add(b);VH.src=ps}
function vhInit(){if(VH.r)return true;
 try{const cv=$('vehCv'),r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio||1,3));
  r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.2;r.setClearColor(0,0);
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(20,2,.1,80);
  sc.add(new THREE.HemisphereLight(0x8fa4d8,0x120f14,.9));
  const L=(c,i,x,y,z)=>{const d=new THREE.DirectionalLight(c,i);d.position.set(x,y,z);sc.add(d)};
  L(0xffe2b8,1.6,-3,4,3);L(0xff8a2a,2,3.5,2.2,-3.5);L(0x3b8cff,1.6,-4,1.8,-3);
  const fl=new THREE.PointLight(0xffb060,1.1,12);fl.position.set(0,.4,2.5);sc.add(fl);
  const piv=new THREE.Group();sc.add(piv);
  // geser 1 jari = putar motor 360 derajat
  cv.addEventListener('pointerdown',e=>{VH.drag={x:e.clientX,id:e.pointerId};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!VH.drag||VH.drag.id!==e.pointerId)return;VH.yaw+=(e.clientX-VH.drag.x)*.01;VH.drag.x=e.clientX});
  const up=e=>{if(VH.drag&&VH.drag.id===e.pointerId)VH.drag=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  VH.r=r;VH.sc=sc;VH.cam=cam;VH.piv=piv;vhBuild();return true}
 catch(e){console.error('VH',e);VH.r=null;return false}}
function vhLoop(){if(!VH.on)return;VH.raf=requestAnimationFrame(vhLoop);
 const cv=VH.r.domElement,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
 if(VH.src!==playerSrc())vhBuild();
 if(w!==VH.w||h!==VH.h){VH.w=w;VH.h=h;VH.r.setSize(w,h,false);VH.cam.aspect=w/h;VH.cam.updateProjectionMatrix();
  VH.cam.position.set(0,.8,4.5*Math.max(1,1.35/VH.cam.aspect));VH.cam.lookAt(0,.25,0)}
 {const open=PU&&PU.el.style.display==='flex'&&w>h*1.1;let tg=0;
  if(open){const pw=PU.el.offsetWidth,vis=2*VH.cam.position.z*Math.tan(VH.cam.fov*Math.PI/360)*VH.cam.aspect;tg=-((pw+14)/2)/w*vis}
  VH.px+=(tg-VH.px)*.18;VH.piv.position.x=VH.px}
 VH.piv.rotation.y=VH.yaw;VH.r.render(VH.sc,VH.cam)}
function hideVehicle(){VH.on=false;cancelAnimationFrame(VH.raf);$('vehScr').style.display='none';if(PU)PU.close();VH.px=0;if(VH.piv)VH.piv.position.x=0}
function showVehicle(){hideHome();ov.style.display='none';if(PU)PU.close();$('vehScr').style.display='block';
 $('vehBg').style.backgroundImage='url('+HOME_IMG+')';
 const clk=()=>{try{uiSound('click')}catch(e){}},tabs=$('vehTabs'),slots=$('vehSlots');
 tabs.innerHTML=UPG.map(u=>'<button class="vTab" data-k="'+u[0]+'" type="button">'+u[1]+'</button>').join('');
 slots.innerHTML='';
 tabs.querySelectorAll('.vTab').forEach(b=>b.onclick=()=>{clk();
  tabs.querySelectorAll('.vTab').forEach(x=>x.classList.toggle('on',x===b));
  const u=UPG.find(x=>x[0]===b.dataset.k);
  if(u[0]==='repaint'){slots.innerHTML='';paintOpen(true)}else{paintOpen(false);slots.innerHTML=Array.from({length:u[2]},()=>'<div class="vSlot"><span>+</span><small>COMING SOON</small></div>').join('')}});
 $('vehBack').onclick=()=>{clk();hideVehicle();showHome();if(PAINT_DIRTY){PAINT_DIRTY=false;try{if(P&&P.sk)skin(P,P.sk[0],P.sk[1]);HB.set()}catch(e){console.error(e)}}};
 if(!VH.on&&vhInit()){VH.on=true;VH.raf=requestAnimationFrame(vhLoop)}}
/* ===== TOKO: Kendaraan / Knalpot / Velg / Ban =====
   Model motor: "Honda Vario Modification" oleh seenkonkgrng (CC BY 4.0) - https://sketchfab.com/3d-models/honda-vario-modification-6a7938c7fa46451e8f9899be7add00a6
   File GLB asli (honda_vario_modification.glb) disimpan UTUH (hanya dikompres gzip tanpa kehilangan data) di file vario_model.js (satu folder dengan game). Mesh, warna, material tidak diubah. */
const SHOP_VEH=[{id:'vario150',nama:'HONDA VARIO 150',ket:'Motor awal kamu (gratis) · '+HPV.hp+' HP',ico:'🛵',harga:0},{id:'vario_mod',nama:'HONDA VARIO MODIFICATION',ket:'Motor modifikasi',ico:'🏍️',harga:25000000}];
const SHOP_CAT=[['kendaraan','KENDARAAN'],['knalpot','KNALPOT'],['velg','VELG'],['ban','BAN']];
const SH={r:null,sc:null,cam:null,piv:null,raf:0,on:false,yaw:Math.PI*.62,drag:null,w:0,h:0,model:null,loading:null,cat:'kendaraan',sel:'vario_mod',failed:false};
async function shopLoadModel(){
 if(SH.model)return SH.model;if(SH.loading)return SH.loading;
 SH.loading=(async()=>{
  if(!window.SHOP_VARIO_B64)await new Promise((ok,no)=>{const sc=document.createElement('script');sc.src='vario_model.js';sc.onload=ok;sc.onerror=()=>no(new Error('vario_model.js tidak ditemukan (taruh satu folder dengan file game)'));document.head.appendChild(sc)});
  const b64=window.SHOP_VARIO_B64;
  let stream;
  try{stream=(await fetch('data:application/gzip;base64,'+b64)).body}
  catch(e){const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);stream=new Blob([u]).stream()}
  const ab=await new Response(stream.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const gl=await new Promise((ok,no)=>new THREE.GLTFLoader().parse(ab,'',ok,no));
  // three r128 belum mengenal KHR_materials_emissive_strength -> terapkan manual dari JSON GLB (warna & material lain TIDAK diubah)
  const defs={};((gl.parser&&gl.parser.json&&gl.parser.json.materials)||[]).forEach(m=>{defs[m.name]=m});
  const seen=new Set();
  gl.scene.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=true;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
   if(!m||seen.has(m))return;seen.add(m);const d=defs[m.name],es=d&&d.extensions&&d.extensions.KHR_materials_emissive_strength;
   if(es&&m.emissive)m.emissive.multiplyScalar(es.emissiveStrength);m.needsUpdate=true})});
  SH.raw=gl.scene.clone(true);
  const root=new THREE.Group();root.add(gl.scene);
  const bb=new THREE.Box3().setFromObject(gl.scene),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=2.5/Math.max(sz.x,sz.y,sz.z);
  gl.scene.position.sub(ct);root.scale.setScalar(k);
  const wrap=new THREE.Group();wrap.add(root);SH.model=wrap;return wrap})();
 SH.loading.catch(e=>{console.error('Toko GLB',e);SH.failed=true;SH.loading=null});
 return SH.loading}
function shopInit(){if(SH.r)return true;
 try{const cv=$('shopCv'),r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio||1,2));
  r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.NoToneMapping;r.setClearColor(0,0);
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(20,2,.1,80);
  const env=envTex(r);if(env)sc.environment=env;
  sc.add(new THREE.HemisphereLight(0xdfe8ff,0x2a2530,.7));
  const L=(c,i,x,y,z)=>{const d=new THREE.DirectionalLight(c,i);d.position.set(x,y,z);sc.add(d)};
  L(0xffffff,1.1,-3,4,3);L(0xffe0c0,.6,3.5,2.2,-3.5);L(0xaac8ff,.5,-4,1.8,-3);
  const piv=new THREE.Group();sc.add(piv);
  cv.addEventListener('pointerdown',e=>{SH.drag={x:e.clientX,id:e.pointerId};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!SH.drag||SH.drag.id!==e.pointerId)return;SH.yaw+=(e.clientX-SH.drag.x)*.01;SH.drag.x=e.clientX});
  const up=e=>{if(SH.drag&&SH.drag.id===e.pointerId)SH.drag=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  SH.r=r;SH.sc=sc;SH.cam=cam;SH.piv=piv;return true}
 catch(e){console.error('Toko',e);SH.r=null;return false}}
function shopLoop(){if(!SH.on)return;SH.raf=requestAnimationFrame(shopLoop);
 const cv=SH.r.domElement,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
 if(w!==SH.w||h!==SH.h){SH.w=w;SH.h=h;SH.r.setSize(w,h,false);SH.cam.aspect=w/h;SH.cam.updateProjectionMatrix();
  SH.cam.position.set(0,.9,7.2*Math.max(1,1.5/SH.cam.aspect));SH.cam.lookAt(0,-.35,0)}
 SH.piv.rotation.y=SH.yaw;SH.r.render(SH.sc,SH.cam)}
const fmtRp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
function shopMoneyUI(){const e=$('shopMoney');if(e)e.textContent='💰 '+fmtRp(MONEY)}
function shopDefModel(){if(!custom||!SH.r)return null;if(SH.def&&SH.defSrc===custom)return SH.def;
 const b=norm(custom);if(custom.userData.hq||custom.userData.lq)envBike(b,SH.r,1);b.traverse(o=>o.layers.set(0));
 const bb=new THREE.Box3().setFromObject(b),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=2.5/Math.max(sz.x,sz.y,sz.z);
 b.position.sub(ct);const root=new THREE.Group();root.add(b);root.scale.setScalar(k);const w=new THREE.Group();w.add(root);SH.def=w;SH.defSrc=custom;return w}
function shopShowModel(){
 if(!SH.piv)return;const ld=$('shopLoad');
 while(SH.piv.children.length)SH.piv.remove(SH.piv.children[0]);
 if(SH.cat!=='kendaraan'){ld.style.display='none';return}
 if(SH.sel==='vario150'){const m=shopDefModel();if(m){SH.piv.add(m);ld.style.display='none'}else{ld.textContent='MEMUAT MODEL…';ld.style.display='block';setTimeout(()=>{if(SH.on&&SH.cat==='kendaraan'&&SH.sel==='vario150')shopShowModel()},700)}return}
 if(SH.model){SH.piv.add(SH.model);ld.style.display='none';return}
 ld.textContent='MEMUAT MODEL…';ld.style.display='block';
 shopLoadModel().then(()=>{if(SH.on&&SH.cat==='kendaraan'&&SH.sel==='vario_mod')shopShowModel()}).catch(()=>{ld.textContent='GAGAL MEMUAT MODEL (pastikan vario_model.js satu folder dengan game)';ld.style.display='block'})}
function shopRender(){
 const items=$('shopItems'),info=$('shopInfo'),tabs=$('shopTabs'),clk=()=>{try{uiSound('click')}catch(e){}};
 shopMoneyUI();
 tabs.innerHTML=SHOP_CAT.map(c=>'<button class="shTab'+(c[0]===SH.cat?' on':'')+'" data-k="'+c[0]+'" type="button">'+c[1]+'</button>').join('');
 tabs.querySelectorAll('.shTab').forEach(b=>b.onclick=()=>{clk();SH.cat=b.dataset.k;shopRender();shopShowModel()});
 if(SH.cat==='kendaraan'){
  items.innerHTML=SHOP_VEH.map(v=>{const own=OWNED.includes(v.id),st=VEHSEL===v.id?'SEDANG DIPAKAI':own?'MILIKMU':'';return '<button class="shItem'+(v.id===SH.sel?' on':'')+'" data-id="'+v.id+'" type="button"><span>'+v.ico+'</span><div><b>'+v.nama+'</b><small>'+st+'</small></div></button>'}).join('')+Array.from({length:3},()=>'<div class="shSoon"><span>+</span><small>COMING SOON</small></div>').join('');
  items.querySelectorAll('.shItem').forEach(b=>b.onclick=()=>{clk();SH.sel=b.dataset.id;SH.cf=null;shopRender();shopShowModel()});
  const v=SHOP_VEH.find(x=>x.id===SH.sel)||SHOP_VEH[0],own=OWNED.includes(v.id),sel=VEHSEL===v.id;
  let t,cl,dis=false;
  if(sel){t='SEDANG DIPAKAI';cl='on';dis=true}
  else if(own){t='PAKAI';cl='use'}
  else if(MONEY<v.harga){t='UANG KURANG · '+fmtRp(v.harga);cl='no';dis=true}
  else{t=SH.cf===v.id?'YAKIN? KETUK LAGI UNTUK BELI':'BELI · '+fmtRp(v.harga);cl='buy'}
  const hpI=v.id==='vario150'?'<div style="margin:0 0 10px;padding:10px 12px;border-radius:12px;background:#ffffff14;font:800 15px system-ui,sans-serif;text-align:center">⚡ TENAGA · '+HPV.hp+' HP</div>':'';
  info.innerHTML=hpI+'<button id="shAct" class="shAct '+cl+'" type="button"'+(dis?' disabled':'')+'>'+t+'</button>';
  const ab=$('shAct');
  if(ab&&!dis)ab.onclick=()=>{clk();
   if(own){ab.textContent='MEMUAT…';ab.disabled=true;applyVeh(v.id).then(()=>shopRender()).catch(e=>{console.error(e);ab.textContent='GAGAL MEMUAT · COBA LAGI';ab.disabled=false})}
   else if(SH.cf!==v.id){SH.cf=v.id;shopRender();clearTimeout(SH.cft);SH.cft=setTimeout(()=>{if(SH.cf===v.id){SH.cf=null;shopRender()}},4000)}
   else if(MONEY>=v.harga){MONEY-=v.harga;OWNED.push(v.id);SH.cf=null;saveEco();shopRender()}}}
 else{items.innerHTML=Array.from({length:5},()=>'<div class="shSoon"><span>+</span><small>COMING SOON</small></div>').join('');info.innerHTML=''}}
/* Susun model TOKO jadi motor yang bisa dikendarai: skala + posisi disamakan dengan motor lama (sumbu roda -0,72 & 0,90),
   roda depan/belakang dipisah supaya berputar. Mesh, warna, material TIDAK diubah. */
function buildMod(scene){
 scene.updateMatrixWorld(true);
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o)});
 const chain=o=>{let n='';for(let q=o;q;q=q.parent)n+='/'+(q.name||'');return n.toLowerCase()};
 const kind=o=>{const c=chain(o);if(/\/kaliper/.test(c))return -1;if(/\/disk/.test(c))return 0;if(/\/wheel_rear/.test(c))return 1;return -1};
 const info=meshes.map(me=>({me,k:kind(me),bb:new THREE.Box3().setFromObject(me)}));
 const F=info.filter(i=>i.k===0),R=info.filter(i=>i.k===1);
 if(!F.length||!R.length)throw new Error('roda model tidak ditemukan');
 const cen=a=>{const b=new THREE.Box3();a.forEach(i=>b.union(i.bb));return b.getCenter(new THREE.Vector3())};
 const cf=cen(F),cr=cen(R);
 if(cr.z<=cf.z)throw new Error('arah model tidak dikenali');
 const sc=1.62/(cr.z-cf.z),wMin=Math.min(...F.concat(R).map(i=>i.bb.min.y));
 const T=new THREE.Matrix4().makeTranslation(0,-sc*wMin,-sc*cf.z-.72).multiply(new THREE.Matrix4().makeScale(sc,sc,sc));
 const AX=[new THREE.Vector3(0,sc*(cf.y-wMin),-.72),new THREE.Vector3(0,sc*(cr.y-wMin),-.72+sc*(cr.z-cf.z))];
 const g=new THREE.Group(),W=AX.map(a=>{const x=new THREE.Group();x.name='wheel';x.position.copy(a);g.add(x);return x});
 info.forEach(({me,k})=>{
  const M=me.matrixWorld.clone().premultiply(T);M.decompose(me.position,me.quaternion,me.scale);
  const mt=me.material;if(mt&&!Array.isArray(mt)&&mt.color&&mt.emissive){const nm=mt.name||'',key=k<0?(isBodyMat(mt,nm)?'b':''):(/^(ruji|velg|pelek|rim)/i.test(nm)?'v':'');
   if(key){me.userData.pk=key;me.userData.dc=mt.color.toArray();me.userData.de=mt.emissive.toArray();me.userData.dm=[mt.metalness,mt.roughness]}}
  if(k>=0)me.position.sub(AX[k]);
  if(me.parent)me.parent.remove(me);
  (k>=0?W[k]:g).add(me)});
 rigSteer(g);g.userData.hq=true;g.userData.gnd=true;return g}
function ensureModG(){if(MODG)return Promise.resolve(MODG);
 if(!MODP)MODP=(async()=>{await shopLoadModel();if(!SH.raw)throw new Error('model belum siap');MODG=buildMod(SH.raw);return MODG})().catch(e=>{MODP=null;throw e});
 return MODP}
async function applyVeh(id){if(id==='vario_mod')await ensureModG();VEHSEL=id;saveEco();
 try{if(P&&P.sk)skin(P,P.sk[0],P.sk[1])}catch(e){console.error(e)}
 try{HB.set()}catch(e){console.error(e)}}
function hideShop(){SH.on=false;cancelAnimationFrame(SH.raf);$('shopScr').style.display='none'}
function showShop(){hideHome();ov.style.display='none';$('shopScr').style.display='block';
 $('shopBg').style.backgroundImage='url('+HOME_IMG+')';
 $('shopBack').onclick=()=>{try{uiSound('click')}catch(e){}hideShop();showHome()};
 SH.cat='kendaraan';SH.w=0;shopRender();
 if(!SH.on&&shopInit()){SH.on=true;shopShowModel();SH.raf=requestAnimationFrame(shopLoop)}
 else if(!SH.r){$('shopLoad').textContent='WEBGL TIDAK TERSEDIA';$('shopLoad').style.display='block'}}
tapHome('hSH',()=>showShop());
showHome();
function rider(jac){const g=new THREE.Group();g.name='rider';const jm=std(jac,.8),dk=std('#1d1d22',.8),V=THREE.Vector3;
 const put=(me,A,B)=>{const d=B.clone().sub(A);me.scale.z=d.length();me.position.copy(A).add(B).multiplyScalar(.5);me.quaternion.setFromUnitVectors(new V(0,0,1),d.normalize())};
 const L=(a,b,w,h,m)=>{const me=new THREE.Mesh(bx(w,h,1),m);put(me,new V(...a),new V(...b));g.add(me);return me};
 const hip=new V(0,.8,.2),tor=L([0,.8,.2],[0,1.22,.08],.4,.24,jm),arms=[],hands=[];
 [-1,1].forEach(s=>{L([s*.13,.78,.2],[s*.16,.78,-.28],.16,.16,dk);L([s*.16,.78,-.28],[s*.16,.2,-.12],.12,.12,dk);
  arms.push({me:L([s*.2,1.2,.08],[s*.24,.77,-.31],.1,.1,jm),s,hd:new V(s*.24,.77,-.31)});
  hands.push(add(new THREE.Mesh(new THREE.SphereGeometry(.06,8,8),dk),s*.24,.76,-.31,g))});
 const head=add(new THREE.Mesh(new THREE.SphereGeometry(.17,12,12),std('#e8e8ee',.3)),0,1.5,.02,g);
 const rot=(o,c,sn)=>new V(o.x,o.y*c+o.z*sn,-o.y*sn+o.z*c).add(hip);
 g.userData.pose=k=>{const th=k*.72,c=Math.cos(th),sn=Math.sin(th);
  put(tor,hip,rot(new V(0,.42,-.12),c,sn));
  arms.forEach(a=>put(a.me,rot(new V(a.s*.2,.4,-.12),c,sn),a.hd));
  head.position.copy(rot(new V(0,.7,-.18),c,sn))};
 g.userData.head=head;g.userData.jac=jac;g.userData.povHide=()=>[head,...arms.map(a=>a.me),...hands];
 return g}
/* Peta lingkungan (pantulan cahaya) buatan sendiri, per renderer, supaya bagian logam motor tampil seperti aslinya (tidak putih pucat) */
const ENVC=new WeakMap();
function envTex(r){if(ENVC.has(r))return ENVC.get(r);let t=null;
 try{const es=new THREE.Scene(),g=new THREE.SphereGeometry(50,32,16),ps=g.attributes.position,cs=new Float32Array(ps.count*3);
  const top=new THREE.Color(0x2c3860),hor=new THREE.Color(0x504540),bot=new THREE.Color(0x101016),c=new THREE.Color();
  for(let i=0;i<ps.count;i++){const y=ps.getY(i)/50;if(y>0)c.copy(hor).lerp(top,Math.pow(y,.6));else c.copy(hor).lerp(bot,Math.min(1,-y*2));cs[i*3]=c.r;cs[i*3+1]=c.g;cs[i*3+2]=c.b}
  g.setAttribute('color',new THREE.BufferAttribute(cs,3));
  es.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const lt=(w,h,x,y,z,col,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(k),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
  lt(30,12,-25,30,20,0xffe2b8,4);lt(20,10,30,15,-25,0xff9a50,3);lt(24,8,-30,10,-25,0x6aa0ff,2.5);lt(18,6,25,12,25,0xffffff,2);
  const pm=new THREE.PMREMGenerator(r);t=pm.fromScene(es,.02).texture;pm.dispose()}catch(e){console.error('env',e);t=null}
 ENVC.set(r,t);return t}
function envBike(root,r,k){const t=envTex(r);if(!t)return;const mc=new Map();
 root.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m0=o.material;let m=mc.get(m0);
  if(!m){m=m0.clone();m.userData=Object.assign({},m0.userData);const mo=m0.userData&&m0.userData.mo;if(mo){m.metalness=mo[0];m.roughness=Math.max(mo[1],.2)}m.envMap=t;m.envMapIntensity=k;m.needsUpdate=true;mc.set(m0,m)}o.material=m})}
async function loadVarioLQ(){try{
 const bin=Uint8Array.from(atob(MODEL_B64),c=>c.charCodeAt(0));
 const ab=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const L=new DataView(ab).getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,4,L))),D=(4+L+3)&~3;
 const LQ_ALU=new Set([9,14,15,20,30]),LQ_RIM=new Set([7,21]),LQ_CHR=new Set([0,2,12,35,18,39]);
 const mt=h.mats.map((m,i)=>{let c=[m[0][0],m[0][1],m[0][2]],me,ro,em=m[4];
  if(LQ_ALU.has(i)){c=[.62,.63,.65];me=.8;ro=.34}
  else if(LQ_RIM.has(i)){c=[.74,.74,.76];me=.92;ro=.2}
  else if(LQ_CHR.has(i)){if(i<=35&&i!==18)c=[.72,.72,.75];me=m[1];ro=Math.max(m[2],.18)}
  else if(i===24){c=[.92,.14,.6];me=.1;ro=.3;em=[.22,.02,.11]}
  else{me=Math.min(m[1],.3);ro=Math.max(m[2],.2)}
  return new THREE.MeshStandardMaterial({color:new THREE.Color(c[0],c[1],c[2]),metalness:me,roughness:ro,side:THREE.DoubleSide,transparent:!!m[3],opacity:m[3]?.45:1,emissive:new THREE.Color(em[0],em[1],em[2])})});
 const g=new THREE.Group();g.userData.lq=true;
 const W=h.ax.map(a=>{const x=new THREE.Group();x.name='wheel';x.position.set(a[0],a[1],a[2]);g.add(x);return x});
 h.meshes.forEach(([mi,nv,ni,it,po,no,io,w],mix)=>{const q=new Int16Array(ab,D+po,nv*3),p=new Float32Array(nv*3);
  for(let i=0;i<nv*3;i++)p[i]=(q[i]+32768)/65535*h.sc+h.lo[i%3];
  const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(p,3));gm.setAttribute('normal',new THREE.BufferAttribute(new Int8Array(ab,D+no,nv*3),3,true));
  gm.setIndex(new THREE.BufferAttribute(it==2?new Uint16Array(ab,D+io,ni):new Uint32Array(ab,D+io,ni),1));const pkv=w&&(mi===7||mi===21),me=new THREE.Mesh(gm,pkv?mt[mi].clone():mt[mi]);if(mi===24)me.userData.pk='b';else if(pkv)me.userData.pk='v';if(me.userData.pk){const M=me.material;me.userData.dc=M.color.toArray();me.userData.de=M.emissive.toArray();me.userData.dm=[M.metalness,M.roughness]}if(CPI.has(mix))me.userData.cp=1;if(w){const a=h.ax[w-1];me.position.set(-a[0],-a[1],-a[2]);W[w-1].add(me)}else g.add(me)});
 rigSteer(g);customLQ=g;if(!custom)custom=g;skin(P,'#ff9a1f','#7a1c1c');skin(O,'#2f9bff','#222a3a');HB.set()}catch(e){console.error(e)}}
