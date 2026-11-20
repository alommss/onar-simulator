// ===== KONFIGURASI MODEL =====
// Isi dengan alamat file .glb jika file HTML ini ditaruh satu folder dengan modelnya, mis. 'motor.glb'.

const MODEL_B64=__BIG[1];
let flip=false; // model glTF umumnya menghadap +Z, game ini maju ke -Z
const DIST=500;
const gl=document.getElementById('gl'),$=id=>document.getElementById(id);
const IS_ANDROID=/Android/i.test(navigator.userAgent||'');
const renderer=new THREE.WebGLRenderer({antialias:!(()=>{try{const o=JSON.parse(localStorage.getItem('dmGfx')||'null');return !!o&&o.q==='rendah'}catch(e){return false}})(),powerPreference:'high-performance',precision:'highp'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,(()=>{try{const o=JSON.parse(localStorage.getItem('dmGfx')||'null');return o&&o.q==='tinggi'?1.75:1.15}catch(e){return 1.15}})()));
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
gl.appendChild(renderer.domElement);const MAXA=renderer.capabilities.getMaxAnisotropy();
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070914);scene.fog=new THREE.FogExp2(0x0a0c1c,.0055);
const cam=new THREE.PerspectiveCamera(62,1,.1,7000);
function rs(){const w=gl.clientWidth,h=gl.clientHeight;if(!w||!h)return;renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();if(window.fxResize)fxResize(w,h)}
addEventListener('resize',rs,{passive:true});addEventListener('orientationchange',()=>setTimeout(rs,180),{passive:true});
if(window.visualViewport)visualViewport.addEventListener('resize',rs,{passive:true});
if(window.ResizeObserver){const glResizeObserver=new ResizeObserver(rs);glResizeObserver.observe(gl)}
rs();
/* ===== GRAFIK: kualitas (normal/tinggi) + resolusi 0-100, disimpan di localStorage 'dmGfx' =====
   Normal = tampilan game yang sekarang (resolusi maks 1.75x, efek blur gerak). Tinggi = Normal + bayangan, pantulan body motor, tekstur detail, bangunan hidup (resolusi maks 2x).
   Resolusi 0-100 = 40%..100% dari batas kualitas. Selama belum disentuh pemain, auto-turun resolusi (qAdapt) tetap jalan seperti dulu. */
const GFX={q:'normal',res:100,user:false,blur:false};var hqPR=1;
try{const o=JSON.parse(localStorage.getItem('dmGfx')||'null');if(o&&typeof o==='object'){if(o.q==='rendah'||o.q==='normal'||o.q==='tinggi')GFX.q=o.q;if(typeof o.res==='number'&&o.res>=0&&o.res<=100)GFX.res=Math.round(o.res);GFX.user=!!o.user}}catch(e){}
function gfxCeil(){const d=devicePixelRatio||1;return GFX.q==='rendah'?Math.min(d,.9):GFX.q==='normal'?Math.min(d,1.3):Math.min(d,1.5)}
function gfxLow(){const lo=GFX.q==='rendah';try{cam.far=lo?900:7000;cam.updateProjectionMatrix();scene.fog.density=lo?.0075:.0055}catch(e){}}
function gfxApply(){GFX.blur=GFX.q==='tinggi';try{ASP.lt.value=GFX.q==='tinggi'?0:1}catch(e){}gfxLow();const t=(GFX.user?gfxCeil()*(.4+.6*GFX.res/100):Math.min(devicePixelRatio||1,GFX.q==='tinggi'?1.75:1.15))*(GFX.q==='tinggi'?hqPR:1);renderer.setPixelRatio(t);try{qPR=t}catch(e){}rs();if(window.__hqReady)hqApply()}
function gfxSet(o){Object.assign(GFX,o);GFX.user=true;try{localStorage.setItem('dmGfx',JSON.stringify({q:GFX.q,res:GFX.res,user:true}))}catch(e){}gfxApply()}
if(GFX.user)gfxApply();
scene.add(new THREE.HemisphereLight(0x6677aa,0x181820,.7));
const dl=new THREE.DirectionalLight(0x8899cc,.35);dl.position.set(-5,10,5);scene.add(dl);
const pl=new THREE.PointLight(0xffc27a,2.4,30);scene.add(pl);
/* ===== ASPAL FOTO: Asphalt002 (warna + normal + roughness, 1024 px, ubin tanpa sambungan) dipasang ke SEMUA aspal game lewat koordinat dunia =====
   Marka (garis putih/kuning, lajur hijau, kerb) tetap dipertahankan: foto hanya menggantikan area aspal gelap.
   Atur: AK = kecerahan aspal (naikkan kalau terlalu gelap), AS = ukuran ubin foto (meter), NS = kekuatan relief. */
const ASP={lt:{value:GFX.q==='tinggi'?0:1},on:{value:0},c:{value:null},n:{value:null},r:{value:null},k:{value:.12},ns:{value:.8}};
(function(){try{const L=new THREE.TextureLoader();let cnt=0;
 const mk=(k,sl)=>{const t=L.load('data:image/jpeg;base64,'+ASP_B64[k],()=>{if(++cnt>=3)ASP.on.value=1});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(MAXA,4);return t};
 ASP.c.value=mk('c');ASP.n.value=mk('n');ASP.r.value=mk('r');
 const P=THREE.MeshStandardMaterial.prototype,baseKey=THREE.Material.prototype.customProgramCacheKey;
 P.customProgramCacheKey=function(){return(this.map&&this.map.isAsph)?'aspPhoto1':baseKey.call(this)};
 window.__aspHook=function(sh){
  sh.uniforms.uAspC=ASP.c;sh.uniforms.uAspN=ASP.n;sh.uniforms.uAspR=ASP.r;sh.uniforms.uAspOn=ASP.on;sh.uniforms.uAspK=ASP.k;sh.uniforms.uAspNS=ASP.ns;sh.uniforms.uAspLt=ASP.lt;
  sh.vertexShader='varying vec3 vAW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vAW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader='varying vec3 vAW;\nuniform sampler2D uAspC;\nuniform sampler2D uAspN;\nuniform sampler2D uAspR;\nuniform float uAspOn;\nuniform float uAspK;\nuniform float uAspNS;\nuniform float uAspLt;\n'+sh.fragmentShader
   .replace('#include <map_fragment>',[
    '#include <map_fragment>',
    'vec2 aU1=vAW.xz/vec2(2.4,1.55);',
    'vec2 aU2=vec2(vAW.x*.8-vAW.z*.6,vAW.x*.6+vAW.z*.8)/vec2(3.7,2.4)+vec2(.37,.61);',
    'vec3 aPc;if(uAspLt>.5){aPc=pow(texture2D(uAspC,aU1).rgb,vec3(2.2));}else{aPc=pow(mix(texture2D(uAspC,aU1).rgb,texture2D(uAspC,aU2).rgb,.45),vec3(2.2));}',
    'float aLum=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));',
    'float aM=uAspOn*(1.0-smoothstep(.05,.10,aLum));',
    'diffuseColor.rgb=mix(diffuseColor.rgb,aPc*uAspK*mix(1.0,.55,smoothstep(1.0,5.0,vAW.y)),aM);'].join('\n'))
   .replace('#include <roughnessmap_fragment>',[
    '#include <roughnessmap_fragment>',
    'if(uAspLt<.5)roughnessFactor=mix(roughnessFactor,clamp(texture2D(uAspR,aU1).r,.25,1.0),aM*.6);'].join('\n'))
   .replace('#include <normal_fragment_maps>',[
    '#include <normal_fragment_maps>',
    'if(uAspLt<.5){float aUp=clamp(dot(normalize(normal),normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz)),0.,1.);',
    'vec3 aNt=texture2D(uAspN,aU1).xyz*2.0-1.0;',
    'normal=normalize(normal+(viewMatrix*vec4(aNt.x,0.,aNt.y,0.)).xyz*uAspNS*aM*smoothstep(.7,.95,aUp));}'].join('\n'))};
 P.onBeforeCompile=function(sh){if(this.map&&this.map.isAsph)window.__aspHook(sh)};
}catch(e){console.error('Aspal foto',e)}})();
// ===== helper =====
const rnd=k=>Math.abs(Math.sin(k*127.1)*43758.5)%1;
function ctex(w,h,fn,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.isAsph=/#202127/.test(String(fn))?1:0;t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=Math.min(MAXA,4);return t}
function sgrain(g,w,h,n,a){n=Math.max(30,Math.min(380,((n||900)/10)|0));a=Math.min(a||.05,.035);
 for(let i=0;i<n;i++){const x=Math.random()*w,y=Math.random()*h,r=5+Math.random()*11,lt=i%2===0,al=lt?a:Math.min(.05,a*1.6),c=lt?'255,255,255':'0,0,0';
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+c+','+al.toFixed(3)+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
const std=(c,r,m)=>new THREE.MeshStandardMaterial({color:c,roughness:r==null?.8:r,metalness:m||0});
const bas=c=>new THREE.MeshBasicMaterial({color:c});
function add(m,x,y,z,p){m.position.set(x,y,z);(p||scene).add(m);return m}
const bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const glowT=ctex(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const glowM=c=>new THREE.SpriteMaterial({map:glowT,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false});
const poolM=new THREE.MeshBasicMaterial({map:glowT,color:0xff9a40,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55,fog:false});
/* ===== GRAFIK TINGGI (HQ) =====
   Bayangan dinamis, pantulan body motor (clearcoat + peta lingkungan malam kota), tekstur detail (noise, bump, genangan basah),
   bangunan lebih hidup (jendela berkedip, lampu atap, LED, kaca memantul), bintang + bulan, lampu depan motor.
   Mode NORMAL tidak disentuh: semua objek/lampu/shader HQ disembunyikan atau dimatikan lewat uniform. */
var __hqReady=false;
const HQ={on:false,sw:[],deco:[],mats:[],pools:[],lampS:[],blink:[],leds:[],dragSet:new Set(),ts:0,lt:0,dirty:false,built:false,
 UT:{value:0},UH:{value:0},dir:new THREE.Vector3(-.42,.78,.34).normalize(),ext:24,ema:.016,slow:0,err:0,lv:0,fc:0,NT:{value:null},
 sun:null,spot:null,stars:null,moon:null,hemi:null,blobT:null,blobG:null,blobM:null,poolM:null,bumpOK:true};
const HQ_ENVC=new WeakMap();
const HQ_GLSL=`
vec2 hqUV(vec3 p){return p.xz+vec2(p.y*0.61,p.y*0.37);}
`;
const HQ_COL=`
float hqA=0.5;float hqVD=length(vViewPosition);vec2 hqU=hqUV(vWPq);
if(uHQ>0.5){float n1=texture2D(uHQN,hqU*0.021).r;float n2=texture2D(uHQN,hqU*0.07).g;
float nr=1.0-smoothstep(10.0,60.0,hqVD);hqA=n2;float qv=mix(n1,n1*0.6+n2*0.4,nr);diffuseColor.rgb*=0.9+0.2*qv;}
`;
const HQ_ROU=`
if(uHQ>0.5){float wq=texture2D(uHQN,hqU*0.013+0.37).b;float wet=smoothstep(0.66,0.86,wq)*uWet;
roughnessFactor=clamp(mix(roughnessFactor*(0.88+0.24*hqA),roughnessFactor*0.4,wet),0.05,1.0);}
`;
const HQ_FLK=`
if(uHQ>0.5){vec2 hc=floor(vUv*uGrid);float hh2=fract(sin(dot(hc,vec2(12.9898,78.233)))*43758.5453);float hk=1.0;
if(hh2>0.9){hk=step(0.2,sin(uTq*0.35+hh2*100.0))*(0.9+0.1*sin(uTq*3.0+hh2*40.0));}
else if(hh2>0.8){hk=0.72+0.28*sin(uTq*5.0+hh2*60.0)*sin(uTq*1.3+hh2*11.0);}
totalEmissiveRadiance*=hk;}
`;
/* Patch shader: variasi warna/kekasaran halus dari 1 tekstur noise kecil (tanpa bintik, tanpa bump, murah). Diatur on/off lewat uniform uHQ. */
function hqMakeNoise(){const S=128,d=new Uint8Array(S*S*4);
 const lat=(n,seed)=>{const a=new Float32Array(n*n);let q=seed;for(let i=0;i<a.length;i++){q=(q*1664525+1013904223)>>>0;a[i]=q/4294967296}return a};
 const sm=t=>t*t*(3-2*t);
 const samp=(a,n,x,y)=>{x*=n;y*=n;const xi=Math.floor(x),yi=Math.floor(y),fx=sm(x-xi),fy=sm(y-yi),x0=((xi%n)+n)%n,y0=((yi%n)+n)%n,x1=(x0+1)%n,y1=(y0+1)%n;
  return(a[y0*n+x0]*(1-fx)+a[y0*n+x1]*fx)*(1-fy)+(a[y1*n+x0]*(1-fx)+a[y1*n+x1]*fx)*fy};
 const ch=(n1,n2,seed)=>{const A=lat(n1,seed),B=lat(n2,seed+77),v=new Float32Array(S*S);let mn=1e9,mx=-1e9;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const q=samp(A,n1,x/S,y/S)*.65+samp(B,n2,x/S,y/S)*.35;v[y*S+x]=q;if(q<mn)mn=q;if(q>mx)mx=q}
  const k=1/Math.max(1e-4,mx-mn);for(let i=0;i<v.length;i++)v[i]=(v[i]-mn)*k;return v};
 const R=ch(8,16,12345),G=ch(8,16,6789),B=ch(4,8,424242);
 for(let i=0;i<S*S;i++){d[i*4]=R[i]*255;d[i*4+1]=G[i]*255;d[i*4+2]=B[i]*255;d[i*4+3]=255}
 const t=new THREE.DataTexture(d,S,S,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t}
function hqPatch(m,grid,bump,wet){
  if(m.userData.hqD)return;m.userData.hqD=1;
  const key=grid?'hqF2':'hqG2';
  m.customProgramCacheKey=function(){return key+((m.map&&m.map.isAsph)?'A':'')};
  m.onBeforeCompile=function(sh){
   if(!HQ.NT.value)HQ.NT.value=hqMakeNoise();
   sh.uniforms.uHQ=HQ.UH;sh.uniforms.uTq=HQ.UT;sh.uniforms.uWet={value:wet};sh.uniforms.uHQN=HQ.NT;
   if(grid)sh.uniforms.uGrid={value:new THREE.Vector2(grid[0],grid[1])};
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPq;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 hqW=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nhqW=instanceMatrix*hqW;\n#endif\nvWPq=(modelMatrix*hqW).xyz;');
   let f=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPq;\nuniform float uHQ;\nuniform float uTq;\nuniform float uWet;\nuniform sampler2D uHQN;\n'+(grid?'uniform vec2 uGrid;\n':'')+HQ_GLSL);
   f=f.replace('#include <map_fragment>','#include <map_fragment>\n'+HQ_COL);
   f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n'+HQ_ROU);
   if(grid)f=f.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+HQ_FLK);
   sh.fragmentShader=f;if(m.map&&m.map.isAsph&&window.__aspHook)window.__aspHook(sh)};
  m.needsUpdate=true;HQ.mats.push(m)}
/* Peta lingkungan malam kota (pantulan body motor + jalan basah + kaca gedung) */
function hqEnvTex(r){if(HQ_ENVC.has(r))return HQ_ENVC.get(r);let t=null;
 try{const es=new THREE.Scene(),g=new THREE.SphereGeometry(50,48,24),ps=g.attributes.position,cs=new Float32Array(ps.count*3);
  const top=new THREE.Color(0x14224a),mid=new THREE.Color(0x3a3350),hor=new THREE.Color(0x9a6038),bot=new THREE.Color(0x0a0a10),c=new THREE.Color();
  for(let i=0;i<ps.count;i++){const y=ps.getY(i)/50;if(y>0)c.copy(hor).lerp(mid,Math.min(1,y*4)).lerp(top,Math.pow(y,.6));else c.copy(hor).multiplyScalar(.3).lerp(bot,Math.min(1,-y*3));cs[i*3]=c.r;cs[i*3+1]=c.g;cs[i*3+2]=c.b}
  g.setAttribute('color',new THREE.BufferAttribute(cs,3));
  es.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
  const PS=(az,el)=>new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)).multiplyScalar(36);
  const lt=(w,h,az,el,col,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(k),side:THREE.DoubleSide}));m.position.copy(PS(az,el));m.lookAt(0,0,0);es.add(m)};
  lt(26,12,-.8,.9,0xdfe8ff,3.2);lt(18,9,2.4,.35,0xffa050,3.5);lt(22,7,-2.6,.2,0x6aa0ff,2.6);lt(16,6,.6,.5,0xffffff,2);
  for(let k=0;k<9;k++)lt(2.4,1,-1.3+k*.33,.3+(k%2)*.05,0xffc27a,9);
  lt(9,.9,.9,.08,0xff3da0,6);lt(7,.9,-1.7,.1,0x33e0ff,6);lt(6,.8,2.9,.12,0xff3da0,5);
  for(let i=0;i<70;i++){const a=Math.abs(Math.sin(i*91.7)*43758.5)%1,b=Math.abs(Math.sin(i*37.1+5)*12345.6)%1,cc=Math.abs(Math.sin(i*7.7+2)*999.1)%1;
   lt(.7+cc*.9,.5+b*.5,a*6.283,.02+b*.2,cc<.6?0xffd890:0xa8ccff,3)}
  const pm=new THREE.PMREMGenerator(r);t=pm.fromScene(es,.02).texture;pm.dispose()}catch(e){console.error('hqEnv',e);t=null}
 HQ_ENVC.set(r,t);return t}
/* Material motor -> MeshPhysicalMaterial (clearcoat) dengan pantulan kuat */
function hqPhys(m0,t,k){
 const rough=m0.roughness==null?.6:m0.roughness,metal=m0.metalness||0,glass=m0.transparent&&m0.opacity<.9,rubber=rough>.72&&metal<.25;
 const p=new THREE.MeshPhysicalMaterial({color:m0.color.clone(),map:m0.map||null,normalMap:m0.normalMap||null,roughnessMap:m0.roughnessMap||null,metalnessMap:m0.metalnessMap||null,aoMap:m0.aoMap||null,
  emissive:m0.emissive?m0.emissive.clone():new THREE.Color(0),emissiveMap:m0.emissiveMap||null,emissiveIntensity:m0.emissiveIntensity==null?1:m0.emissiveIntensity,
  side:m0.side,transparent:m0.transparent,opacity:m0.opacity,depthWrite:m0.depthWrite,alphaTest:m0.alphaTest||0,vertexColors:m0.vertexColors||false});
 if(m0.normalScale)p.normalScale.copy(m0.normalScale);
 p.name=m0.name;p.userData=Object.assign({},m0.userData);p.metalness=metal;p.roughness=rough;p.envMap=t;
 if(glass){p.roughness=.04;p.metalness=0;p.envMapIntensity=k*2.2;p.clearcoat=1;p.clearcoatRoughness=.03}
 else if(rubber){p.envMapIntensity=k*.5}
 else{p.roughness=Math.max(.1,rough*(metal>.6?.8:.6));if(metal<.5)p.metalness=Math.min(.45,metal+.2);
  p.envMapIntensity=k*(metal>.6?1.25:1.6);p.clearcoat=metal>.6?0:1;p.clearcoatRoughness=.05}
 return p}
function hqBike(root,r,k){const t=hqEnvTex(r);if(!t)return;const K=Math.max(k,.95),mc=new Map();
 root.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m0=o.material;let m=mc.get(m0);if(!m){m=hqPhys(m0,t,K);mc.set(m0,m)}o.material=m})}
function hqAfterSkin(b){if(!HQ.on||!b||!b.obj||!HQ.blobM)return;
 const bl=new THREE.Mesh(HQ.blobG,HQ.blobM);bl.rotation.x=-Math.PI/2;bl.position.set(0,.025,0);bl.renderOrder=2;bl.layers.set(1);b.obj.add(bl);(HQ.blobL=HQ.blobL||[]).push({bl,o:b.obj});HQ.dirty=true}
/* ---- Bangunan (tower) ---- */
function hqTower(mesh,orig,o){HQ.sw.push({mesh,orig,hq:null,o})}
function hqWinTex(wall,cols,rows,lit,seed,R){
 const cw=20,W=cols*cw,H=rows*cw,SC=.7,d=document.createElement('canvas'),e=document.createElement('canvas');d.width=e.width=Math.max(8,Math.round(W*SC));d.height=e.height=Math.max(8,Math.round(H*SC));
 const g=d.getContext('2d'),ge=e.getContext('2d');g.scale(SC,SC);ge.scale(SC,SC);
 g.fillStyle=wall;g.fillRect(0,0,W,H);
 const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,255,255,.07)');gr.addColorStop(.7,'rgba(0,0,0,.05)');gr.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 for(let i=0;i<cols*3;i++){const x=R(seed+i*3.1)*W,w=2+R(seed+i*7.7)*6,sg=g.createLinearGradient(0,0,0,H);sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(0,0,0,.18)');g.fillStyle=sg;g.fillRect(x,0,w,H)}
 ge.fillStyle='#000';ge.fillRect(0,0,W,H);
 for(let r=0;r<rows;r++){
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,r*cw,W,2);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,r*cw+2,W,1);
  for(let c=0;c<cols;c++){
   const x=c*cw,y=r*cw,on=R(seed+r*31+c*7)<lit,h=R(seed*1.7+r*13+c*5),wx=x+3,wy=y+4,ww=cw-6,wh=cw-9;
   g.fillStyle='rgba(20,22,26,.9)';g.fillRect(wx-1,wy-1,ww+2,wh+2);
   const gl=g.createLinearGradient(wx,wy,wx+ww,wy+wh);
   if(on){gl.addColorStop(0,'#2a2418');gl.addColorStop(1,'#14110c')}else{gl.addColorStop(0,'#2b3a52');gl.addColorStop(.5,'#141c2a');gl.addColorStop(1,'#0c1018')}
   g.fillStyle=gl;g.fillRect(wx,wy,ww,wh);
   if(!on){g.fillStyle='rgba(150,190,255,.14)';g.beginPath();g.moveTo(wx,wy+wh*.55);g.lineTo(wx+ww*.5,wy);g.lineTo(wx+ww*.75,wy);g.lineTo(wx,wy+wh*.85);g.fill()}
   g.fillStyle='rgba(10,10,12,.7)';g.fillRect(wx+ww/2-.5,wy,1,wh);
   if(h>.88){g.fillStyle='#8c8f94';g.fillRect(x+cw-8,y+cw-5,7,4);g.fillStyle='#5a5d62';g.fillRect(x+cw-7,y+cw-4,5,2)}
   if(r%4===3){g.fillStyle='rgba(200,200,205,.35)';g.fillRect(x,y+cw-3,cw,2)}
   if(on){const warm=h<.7,col=warm?(h<.35?'#ffcf7a':'#ffe3a8'):(h<.85?'#bfe0ff':'#ffd2f0');
    const eg=ge.createLinearGradient(wx,wy,wx,wy+wh);eg.addColorStop(0,col);eg.addColorStop(1,warm?'#e0902c':'#7fa8d8');
    ge.fillStyle=eg;ge.globalAlpha=.65+R(seed+r*17+c*3)*.35;ge.fillRect(wx,wy,ww,wh);ge.globalAlpha=1;
    if(h>.45){ge.fillStyle='rgba(0,0,0,.35)';ge.fillRect(wx,wy,ww,Math.round(wh*(.15+R(c+r*9+seed)*.35)))}
    ge.fillStyle='rgba(0,0,0,.6)';ge.fillRect(wx+ww/2-.5,wy,1,wh)}}}
 const mk=cv=>{const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(MAXA,4);return t};
 return{d:mk(d),e:mk(e)}}
function hqFacade(tex,tc,cols,rows){
 const m=new THREE.MeshStandardMaterial({map:tex.d,emissiveMap:tex.e,emissive:0xffffff,emissiveIntensity:1.15,color:new THREE.Color(tc).multiplyScalar(1.6),roughness:.55,metalness:.18});
 m.userData.hqEnv=1;m.userData.hqEI=.35;hqPatch(m,[cols,rows],.02,.25);return m}
function hqDeco(rec){
 const o=rec.o,R=o.R,GPg=o.GP,w=o.w,d=o.d,h=o.h,s=o.seed,g=new THREE.Group();g.position.set(o.x,0,o.z);g.visible=false;
 const roofM=new THREE.MeshStandardMaterial({color:0x3b3e46,roughness:.85,metalness:.1}),metM=new THREE.MeshStandardMaterial({color:0x7d8087,roughness:.6,metalness:.5});
 const bxm=(bw,bh,bd,m,x,y,z)=>{const q=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),m);q.position.set(x,y,z);g.add(q);return q};
 bxm(w+.5,.7,d+.5,roofM,0,h+.35,0);
 const n=2+((R(s*3.3)*3)|0);
 for(let i=0;i<n;i++){const bw=1.5+R(s+i*5.1)*3,bh=1+R(s+i*2.3)*2,bd=1.5+R(s+i*8.9)*3;
  bxm(bw,bh,bd,i%2?metM:roofM,(R(s+i*1.9)*2-1)*(w/2-bw/2-.6),h+.7+bh/2,(R(s+i*4.7)*2-1)*(d/2-bd/2-.6))}
 const tk=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,2.2,12),metM);tk.position.set(w/2-2.2,h+1.8,d/2-2.2);g.add(tk);
 const mh=8+R(s*1.3)*8,mast=new THREE.Mesh(new THREE.CylinderGeometry(.07,.12,mh,6),metM);mast.position.set(0,h+.7+mh/2,0);g.add(mast);
 const bs=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:0xff2a2a,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));
 bs.scale.set(h>=60?5:3.2,h>=60?5:3.2,1);bs.position.set(0,h+.7+mh+.2,0);g.add(bs);HQ.blink.push({s:bs,ph:R(s*.77)*3});
 const sx=o.x<0?1:-1,lb=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:0xffb060,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.6,fog:false}));
 lb.scale.set(14,7,1);lb.position.set(sx*(w/2+1.2),3,0);g.add(lb);
 if((s|0)%3===0){const lm=new THREE.MeshBasicMaterial({color:0x33e0ff,fog:false}),ld=bxm(.5,h*.92,.5,lm,sx*(w/2+.15),h*.46,d/2-.1);ld.castShadow=false;HQ.leds.push({m:lm,ph:R(s*.31)})}
 g.traverse(q=>{q.userData.hqS=1;q.castShadow=false;q.receiveShadow=false});GPg.add(g);rec.deco=g;HQ.deco.push(g)}
function hqBuildTowers(){
 HQ.sw.forEach(rec=>{if(rec.deco&&!rec.mesh.parent&&rec.deco.parent)rec.deco.parent.remove(rec.deco);if(rec.hq||!rec.mesh.parent)return;const o=rec.o; // gedung yang sudah dihapus (mis. kena jalan lebar kiri) tidak dibuatkan dekorasi atap/LED/lampu lagi
  const tf=hqWinTex(o.wall,o.cw,o.rows,o.lit,o.seed,o.R),ts=hqWinTex(o.wall,o.cd,o.rows,o.lit,o.seed+5,o.R);
  const mf=hqFacade(tf,o.tc,o.cw,o.rows),ms=hqFacade(ts,o.tc,o.cd,o.rows),top=new THREE.MeshStandardMaterial({color:0x2a2c33,roughness:.9,metalness:.05});
  rec.hq=[ms,ms,top,top,mf,mf];hqDeco(rec)})}
/* ---- Pemindaian objek: bayangan, detail shader, kolam cahaya lampu ---- */
function hqScan(){
 const allowed=o=>{let p=o;while(p&&p.parent&&p.parent!==scene)p=p.parent;return p===owG||HQ.dragSet.has(p)};
 scene.traverse(o=>{
  if(o.userData.hqS)return;
  if(o.isSprite){o.userData.hqS=1;
   if(o.material===sprM&&o.parent&&o.parent!==scene){HQ.lampS.push({s:o,b:o.scale.x,ph:HQ.lampS.length*1.7});
    let rt=o;while(rt.parent&&rt.parent!==scene)rt=rt.parent;if(rt!==owG)return;
    const p=new THREE.Mesh(new THREE.PlaneGeometry(10,10),HQ.poolM);p.rotation.x=-Math.PI/2;p.position.set(o.position.x,.13,o.position.z);p.renderOrder=1;o.parent.add(p);p.userData.hqS=1;HQ.pools.push(p)}
   return}
  if(!o.isMesh)return;o.userData.hqS=1;
  const mats=Array.isArray(o.material)?o.material:[o.material],mat=mats[0];if(!mat)return;
  const glow=mat.blending===THREE.AdditiveBlending||(mat.transparent&&mat.depthWrite===false)||mat.visible===false||mat.isShaderMaterial||mat.isSpriteMaterial;
  const gt=o.geometry&&o.geometry.type,flat=gt==='PlaneGeometry'||gt==='RingGeometry'||gt==='CircleGeometry';
  o.receiveShadow=!glow;o.castShadow=!glow&&!flat&&!o.isInstancedMesh&&!mat.transparent&&!o.userData.noCast&&!(gt==='BufferGeometry'&&(()=>{const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();return (g.boundingBox.max.y-g.boundingBox.min.y)*Math.abs(o.scale.y)<.3})());
  if(!o.isSkinnedMesh&&allowed(o))mats.forEach(m=>{
   if(!m||!m.isMeshStandardMaterial||m.isMeshPhysicalMaterial||m.transparent||m.alphaTest>0||m.userData.hqD)return;
   const ground=gt==='PlaneGeometry',glossy=m.roughness<.5;
   if(glossy)m.userData.hqEnv=1;m.userData.hqEI=.15;
   hqPatch(m,null,ground?.045:.02,glossy?1:.25);
   if(HQ.on&&glossy){m.envMap=hqEnvTex(renderer);m.envMapIntensity=.15;m.needsUpdate=true}})})}
/* ---- Per frame ---- */
const _hqLz=new THREE.Vector3(),_hqLx=new THREE.Vector3(),_hqLy=new THREE.Vector3(),_hqP=new THREE.Vector3(),_hqY=new THREE.Vector3(0,1,0);
function hqFrame(c){
 if(HQ.blobL)HQ.blobL=HQ.blobL.filter(q=>q.bl.parent===q.o),HQ.blobL.forEach(q=>{q.bl.rotation.x=-Math.PI/2-q.o.rotation.x}); // bayangan motor tetap rata di tanah (tidak ikut naik saat wheelie)
 const now=performance.now(),T=now*.001,dt=HQ.lt?Math.min(.2,(now-HQ.lt)/1000):.016;HQ.lt=now;HQ.UT.value=T%3600;
 let fx,fz;if(st==='ow'&&ow.foot){fx=walker.position.x;fz=walker.position.z}else{fx=P.obj.position.x;fz=P.obj.position.z}
 const ts=(HQ.ext*2)/HQ.sun.shadow.mapSize.x;
 _hqLz.copy(HQ.dir);_hqLx.crossVectors(_hqY,_hqLz).normalize();_hqLy.crossVectors(_hqLz,_hqLx);
 _hqP.set(fx,0,fz);const a=Math.round(_hqP.dot(_hqLx)/ts)*ts,b=Math.round(_hqP.dot(_hqLy)/ts)*ts,d=_hqP.dot(_hqLz);
 _hqP.copy(_hqLx).multiplyScalar(a).addScaledVector(_hqLy,b).addScaledVector(_hqLz,d);
 HQ.sun.target.position.copy(_hqP);HQ.sun.position.copy(_hqP).addScaledVector(_hqLz,130);HQ.sun.target.updateMatrixWorld();HQ.sun.updateMatrixWorld();
 if(HQ.spot.parent!==P.obj){P.obj.add(HQ.spot);P.obj.add(HQ.spot.target)}
 if(HQ.beam){if(HQ.beam.parent!==P.obj)P.obj.add(HQ.beam);let pv=false;try{pv=!!pov||(st==='ow'&&ow.foot)}catch(e){}HQ.beam.visible=!pv&&P.obj.visible}
 HQ.spot.visible=false; /* lampu sorot di tanah dimatikan: bayangan/cahaya di SPBU harus menetap, tidak ikut motor/kamera */
 if(HQ.sky)HQ.sky.position.copy(c.position);HQ.stars.position.copy(c.position);HQ.moon.position.set(c.position.x-1500,c.position.y+1900,c.position.z-2300);
 if(T-HQ.ts>3||HQ.dirty){HQ.ts=T;HQ.dirty=false;hqScan()}
 HQ.blink.forEach(k=>{k.s.material.opacity=((T*.7+k.ph)%1)<.18?1:.06});
 HQ.leds.forEach(l=>l.m.color.setHSL((T*.04+l.ph)%1,.85,.55));
 const nl=((HQ.fc=(HQ.fc|0)+1)&1)?0:Math.min(HQ.lampS.length,200);for(let i=0;i<nl;i++){const l=HQ.lampS[i];l.s.scale.setScalar(l.b*(1+.045*Math.sin(T*2.1+l.ph)))}
 HQ.ema+=(dt-HQ.ema)*.05;
 if(HQ.ema>.036)HQ.slow+=dt;else HQ.slow=Math.max(0,HQ.slow-dt*.5);
 if(HQ.slow>2.5&&HQ.lv<3){HQ.lv++;HQ.slow=0;HQ.ema=.02;setTimeout(hqLod,0)}}
/* Governor: kalau frame rate turun, beban Grafik Tinggi diturunkan bertahap (bayangan kecil -> resolusi sedikit turun -> bayangan mati) */
function hqLod(){const L=HQ.lv;
 try{if(L>=1&&HQ.sun&&HQ.sun.shadow.mapSize.x>512){HQ.sun.shadow.mapSize.set(512,512);if(HQ.sun.shadow.map){HQ.sun.shadow.map.dispose();HQ.sun.shadow.map=null}}
  hqPR=L>=3?.7:L>=2?.82:1;if(L>=3&&HQ.sun)HQ.sun.castShadow=false;gfxApply()}catch(e){console.error('hqLod',e)}}
function hqFallback(){
 try{HQ.mats.forEach(m=>{delete m.onBeforeCompile;delete m.customProgramCacheKey;m.userData.hqD=0;m.needsUpdate=true});HQ.mats.length=0}catch(e){}
 GFX.q='normal';try{localStorage.setItem('dmGfx',JSON.stringify({q:'normal',res:GFX.res,user:true}))}catch(e){}
 try{hqApply()}catch(e){}
 try{HQ.sw.forEach(r=>{r.mesh.material=r.orig})}catch(e){}
 try{camToast('Grafik Tinggi tidak didukung perangkat ini, kembali ke Normal')}catch(e){}}
function hqApply(){
 if(!__hqReady)return;
 const on=GFX.q==='tinggi',ch=on!==HQ.on;HQ.on=on;HQ.UH.value=on?1:0;try{ASP.lt.value=on?0:1}catch(e){}
 if(on&&!HQ.built){HQ.built=true;
  HQ.blobT=ctex(64,64,g=>{const r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(0,0,0,.85)');r.addColorStop(.55,'rgba(0,0,0,.35)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
  HQ.blobG=new THREE.PlaneGeometry(1.2,2.4);HQ.blobM=new THREE.MeshBasicMaterial({map:HQ.blobT,transparent:true,depthWrite:false,opacity:.7});
  HQ.poolM=poolM.clone();HQ.poolM.opacity=.34;
  try{hqBuildTowers()}catch(e){console.error('hqTowers',e)}}
 HQ.sun.visible=on;HQ.sun.castShadow=on&&HQ.lv<3;HQ.spot.visible=false;HQ.stars.visible=on;HQ.moon.visible=on;if(HQ.sky)HQ.sky.visible=on;
 if(HQ.hemi){HQ.hemi.intensity=on?.85:.7;HQ.hemi.color.setHex(on?0x5a6fb0:0x6677aa);HQ.hemi.groundColor.setHex(on?0x2a2220:0x181820)}
 renderer.toneMappingExposure=on?1.22:1.15;if(!on&&HQ.beam)HQ.beam.visible=false;
 HQ.sw.forEach(r=>{if(r.hq)r.mesh.material=on?r.hq:r.orig});
 HQ.deco.forEach(g=>g.visible=on);HQ.pools.forEach(p=>p.visible=on);
 if(on)hqScan();
 const env=on?hqEnvTex(renderer):null;
 HQ.mats.forEach(m=>{if(m.userData.hqEnv){m.envMap=env;m.envMapIntensity=m.userData.hqEI||.2;m.needsUpdate=true}});
 if(on)HQ.dirty=true;
 if(ch){try{if(P&&P.sk)skin(P,P.sk[0],P.sk[1]);if(O&&O.sk)skin(O,O.sk[0],O.sk[1]);if(typeof HB!=='undefined'&&HB.set)HB.set()}catch(e){console.error('hqApply',e)}}}
function hqInit(){
 try{
  HQ.bumpOK=!!(renderer.capabilities.isWebGL2||renderer.extensions.has('OES_standard_derivatives'));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const big=renderer.capabilities.maxTextureSize>=4096,sun=new THREE.DirectionalLight(0xa9bbff,1.6);
  sun.castShadow=false;sun.visible=false;sun.shadow.mapSize.set(1024,1024);
  const sc=sun.shadow.camera;sc.left=-HQ.ext;sc.right=HQ.ext;sc.top=HQ.ext;sc.bottom=-HQ.ext;sc.near=.5;sc.far=260;sc.updateProjectionMatrix();
  sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;scene.add(sun);scene.add(sun.target);HQ.sun=sun;
  const sp=new THREE.SpotLight(0xfff2d6,1.0,45,.6,1,1.2);sp.position.set(0,.95,-.55);sp.target.position.set(0,0,-9);sp.visible=false;scene.add(sp);scene.add(sp.target);HQ.spot=sp;
  const N=700,pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){const u=Math.random()*6.283,v=.05+Math.random()*.95,r=Math.sqrt(1-v*v);pos[i*3]=Math.cos(u)*r*3500;pos[i*3+1]=v*3500;pos[i*3+2]=Math.sin(u)*r*3500}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  HQ.stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xdfe6ff,size:1.6,sizeAttenuation:false,transparent:true,opacity:.85,depthWrite:false,fog:false}));
  HQ.stars.frustumCulled=false;HQ.stars.visible=false;scene.add(HQ.stars);
  try{HQ.sky=ultSky();scene.add(HQ.sky)}catch(e){console.error('sky',e)}
  /* berkas lampu depan motor di Grafik Tinggi dihapus (permintaan) */
  const moon=new THREE.Group(),mg=new THREE.Sprite(glowM(0x9fb4ff)),mc=new THREE.Sprite(glowM(0xeef2ff));mg.scale.set(900,900,1);mc.scale.set(150,150,1);moon.add(mg);moon.add(mc);moon.visible=false;scene.add(moon);HQ.moon=moon;
  HQ.hemi=scene.children.find(c=>c.isHemisphereLight)||null;
  dragObjs.forEach(o=>HQ.dragSet.add(o));
  const _rr=renderer.render;
  renderer.render=function(s,c){if(HQ.on&&s===scene){try{hqFrame(c)}catch(e){if(HQ.err++<3)console.error('hqFrame',e)}}return _rr.call(this,s,c)};
  const _env0=envBike;envBike=function(root,r,k){_env0(root,r,k);if(GFX.q==='tinggi'){try{hqBike(root,r,k)}catch(e){console.error('hqBike',e)}}};
  const _skin0=skin;skin=function(b,col,jac){_skin0(b,col,jac);try{hqAfterSkin(b)}catch(e){console.error('hqSkin',e)}};
  const _ce=console.error;console.error=function(){try{const a=arguments[0];if(HQ.on&&typeof a==='string'&&a.indexOf('THREE.WebGLProgram')===0&&!HQ.failed){HQ.failed=true;setTimeout(hqFallback,0)}}catch(e){}return _ce.apply(console,arguments)};
  __hqReady=true;hqApply();
 }catch(e){console.error('hqInit',e);__hqReady=false}}

