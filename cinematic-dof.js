/* ===== CINEMATIC: BLUR LATAR BELAKANG OBJEK (depth of field) + redam terang area Green Pramuka =====
   1) Mode CINEMATIC: apa pun yang LEBIH JAUH dari objek (motor / karakter) di-blur, objek & yang di depannya tetap tajam.
      - Fokus otomatis: ke motor/karakter kalau ada di tengah layar, kalau tidak ke titik tengah layar.
      - Cara kerja: tiap frame digambar 1x peta kedalaman (scene.overrideMaterial = MeshDepthMaterial), lalu satu pass blur
        (24 sampel, bobot memihak latar supaya tidak ada halo di tepi objek). Dipasang di dalam ultRender() sebelum bloom/grading.
      - Tombol "BLUR: ON/OFF" ada di bar atas mode cinematic. Kekuatan: CIN.blurPx (piksel @720p, default 16).
      - Ikut terekam di video 1280x720 60 FPS (peta kedalaman dibuat resolusi penuh saat merekam, setengah saat preview).
      - Gagal/tidak didukung -> otomatis mati, game tetap jalan seperti biasa.
   2) GPC_DIM: meredupkan area Green Pramuka (kotak GPC_DIM.x0..x1 / z0..z1). pool = pengali cahaya genangan lampu jalan,
      facade = pengali terang jendela/fasad gedung. Kalau masih terlalu terang kecilkan angkanya, GPC_DIM.on=false untuk mematikan. */
(function(){
'use strict';
if(typeof document==='undefined')return;
let tries=0;
const iv=setInterval(()=>{
 if(window.CIN&&typeof renderer!=='undefined'&&typeof ultRender==='function'&&typeof ultUse==='function'&&typeof scene!=='undefined'&&typeof cam!=='undefined'){
  clearInterval(iv);try{init()}catch(e){console.error('cinematic-dof',e)}}
 else if(++tries>300)clearInterval(iv)},100);

const FS=[
 'varying vec2 vUv;',
 'uniform sampler2D tC;uniform sampler2D tD;uniform vec2 px;',
 'uniform float near;uniform float far;uniform float focus;uniform float maxR;uniform float kS;',
 /* depth packed RGBA (RGBADepthPacking) -> jarak lurus searah kamera (meter) */
 'float lin(vec2 uv){vec4 v=texture2D(tD,uv);float d=dot(v,vec4(5.9604645e-8,1.5258789e-5,.00390625,1.))*.99609375;return (near*far)/(far-(far-near)*d);}',
 'void main(){',
 ' float dz=lin(vUv);',
 ' float fz=focus;if(fz<0.)fz=lin(vec2(.5));',
 ' float tol=2.5+fz*.08;float sc=fz*.7+4.;',
 ' float coc=(1.-exp(-max(0.,dz-(fz+tol))/sc))*kS;',
 ' vec3 base=texture2D(tC,vUv).rgb;',
 ' float r=coc*maxR;',
 ' if(r<.5){gl_FragColor=vec4(base,1.);return;}',
 ' vec3 acc=base;float ws=1.;',
 ' for(int i=0;i<24;i++){',
 '  float fi=float(i);float a=fi*2.3999632;float rr=sqrt((fi+.5)/24.);',
 '  vec2 uv=vUv+vec2(cos(a),sin(a))*rr*r*px;',
 '  float tz=lin(uv);',
 '  float tc=(1.-exp(-max(0.,tz-(fz+tol))/sc))*kS;',
 '  float w=(tz<dz-.5)?smoothstep(.02,.3,tc):1.;', /* sampel yang lebih dekat & masih tajam (objek) tidak boleh bocor ke latar */
 '  acc+=texture2D(tC,uv).rgb*w;ws+=w;',
 ' }',
 ' gl_FragColor=vec4(acc/ws,1.);',
 '}'].join('\n');
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const FS_CP='varying vec2 vUv;uniform sampler2D t;void main(){gl_FragColor=vec4(texture2D(t,vUv).rgb,1.);}';

function init(){
 const CIN=window.CIN;
 if(CIN.blur===undefined)CIN.blur=true;
 if(CIN.blurPx===undefined)CIN.blurPx=16;
 const R0=THREE.WebGLRenderer.prototype.render; /* render asli (tanpa patch hqFrame) untuk pass tambahan */
 const D={ok:true,rt:null,out:null,mat:null,bm:null,cp:null,sc:null,q:null,oc:null,ign:[],ignT:0};
 const dir=new THREE.Vector3(),tv=new THREE.Vector3(),cc=new THREE.Color();

 function ensure(W,H,full){
  const dw=Math.max(2,Math.round(W*(full?1:.5))),dh=Math.max(2,Math.round(H*(full?1:.5)));
  if(!D.mat){
   D.mat=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});D.mat.side=THREE.DoubleSide;D.mat.skinning=true;
   D.bm=new THREE.ShaderMaterial({uniforms:{tC:{value:null},tD:{value:null},px:{value:new THREE.Vector2()},near:{value:.1},far:{value:1000},focus:{value:-1},maxR:{value:16},kS:{value:1}},
    vertexShader:VS,fragmentShader:FS,depthTest:false,depthWrite:false,toneMapped:false});
   D.cp=new THREE.ShaderMaterial({uniforms:{t:{value:null}},vertexShader:VS,fragmentShader:FS_CP,depthTest:false,depthWrite:false,toneMapped:false});
   D.sc=new THREE.Scene();D.q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),D.bm);D.q.frustumCulled=false;D.sc.add(D.q);
   D.oc=new THREE.OrthographicCamera(-1,1,1,-1,0,1)}
  if(!D.rt||D.rt.width!==dw||D.rt.height!==dh){if(D.rt)D.rt.dispose();
   D.rt=new THREE.WebGLRenderTarget(dw,dh,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false})}
  if(!D.out||D.out.width!==W||D.out.height!==H){if(D.out)D.out.dispose();
   D.out=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false})}
 }

 /* benda yang tidak boleh masuk peta kedalaman: sprite/partikel/garis & mesh transparan aditif (cahaya, asap, genangan lampu) */
 function refreshIgn(){
  const n=performance.now();if(D.ign.length&&n-D.ignT<1500)return;D.ignT=n;const a=[];
  scene.traverse(o=>{
   if(o.isSprite||o.isPoints||o.isLine){a.push(o);return}
   if(o.isMesh){const ms=[].concat(o.material);for(let i=0;i<ms.length;i++){const q=ms[i];if(q&&((q.transparent&&q.depthWrite===false)||q.blending===THREE.AdditiveBlending)){a.push(o);return}}}});
  D.ign=a}

 function depthPass(){
  const bg=scene.background,ov=scene.overrideMaterial,au=renderer.shadowMap.autoUpdate,ca=renderer.getClearAlpha(),hid=[];
  renderer.getClearColor(cc);const c0=cc.clone();
  refreshIgn();
  for(let i=0;i<D.ign.length;i++){const o=D.ign[i];if(o.visible){o.visible=false;hid.push(o)}}
  try{
   scene.background=null;scene.overrideMaterial=D.mat;renderer.shadowMap.autoUpdate=false;
   renderer.setClearColor(0xffffff,1);renderer.setRenderTarget(D.rt);renderer.clear(true,true,false);
   R0.call(renderer,scene,cam)}
  finally{
   for(let i=0;i<hid.length;i++)hid[i].visible=true;
   scene.background=bg;scene.overrideMaterial=ov;renderer.shadowMap.autoUpdate=au;renderer.setClearColor(c0,ca)}}

 /* jarak (searah kamera) ke motor/karakter kalau ada di depan kamera; -1 = fokus ke titik tengah layar */
 function focusZ(){
  try{const T=ow.foot?wk:ow;tv.set(T.x,gpcGY+.9,T.z).sub(cam.position);const d=tv.length();cam.getWorldDirection(dir);
   if(d>.5&&d<160){const c=tv.dot(dir)/d;if(c>.8)return d*c}}catch(e){}
  return -1}

 function blurPass(src,toScreen){
  const u=D.bm.uniforms,W=src.width,H=src.height;
  u.tC.value=src.texture;u.tD.value=D.rt.texture;u.px.value.set(1/W,1/H);u.near.value=cam.near;u.far.value=cam.far;
  u.maxR.value=CIN.blurPx*H/720;u.focus.value=focusZ();u.kS.value=1;
  D.q.material=D.bm;renderer.setRenderTarget(toScreen?null:D.out);R0.call(renderer,D.sc,D.oc)}

 function fail(e){console.error('cinematic blur',e);D.ok=false;try{renderer.setRenderTarget(null)}catch(_){}}

 /* dipanggil tepat setelah scene digambar ke RT: blur latar, lalu tulis balik ke RT supaya bloom & grading ikut */
 function blurInPlace(){
  ensure(RT.width,RT.height,!!CIN.rec);depthPass();blurPass(RT,false);
  D.q.material=D.cp;D.cp.uniforms.t.value=D.out.texture;renderer.setRenderTarget(RT);R0.call(renderer,D.sc,D.oc);D.q.material=D.bm}

 const active=()=>CIN.on&&CIN.blur&&D.ok&&typeof RT!=='undefined'&&!!RT&&fxReady;
 const orig=window.ultRender;
 window.ultRender=function(){
  if(!active())return orig.apply(this,arguments);
  if(!ultUse()){ /* grafik rendah: gambar ke RT, blur langsung ke layar */
   try{renderer.setRenderTarget(RT);R0.call(renderer,scene,cam);ensure(RT.width,RT.height,!!CIN.rec);depthPass();blurPass(RT,true);return}
   catch(e){fail(e);return orig.apply(this,arguments)}}
  const rr=renderer.render;let first=true;
  renderer.render=function(s,c){const r=rr.call(this,s,c);
   if(first&&s===scene&&c===cam&&renderer.getRenderTarget()===RT){first=false;try{blurInPlace()}catch(e){fail(e)}}
   return r};
  try{return orig.apply(this,arguments)}finally{renderer.render=rr}};

 /* tombol BLUR di bar atas cinematic */
 try{
  const top=document.querySelector('#cin .cTop');
  if(top){const b=document.createElement('button');b.type='button';b.className='cB';b.id='cBlr';
   const upd=()=>{b.textContent='🌫 BLUR: '+(CIN.blur?'ON':'OFF');b.classList.toggle('on',!!CIN.blur)};
   b.onclick=()=>{CIN.blur=!CIN.blur;upd();try{camToast(CIN.blur?'Latar belakang objek di-BLUR':'Blur mati')}catch(e){}};
   const mot=document.getElementById('cMot');top.insertBefore(b,mot?mot.nextSibling:null);upd()}
 }catch(e){console.error('cBlr',e)}

 /* ---- redam terang area Green Pramuka ---- */
 const GPC=window.GPC_DIM={on:true,x0:-180,x1:20,z0:-95,z1:95,pool:.55,facade:.7};
 const wp=new THREE.Vector3();
 function dimGpc(){
  if(!GPC.on||typeof HQ==='undefined')return;
  const inR=(x,z)=>x>=GPC.x0&&x<=GPC.x1&&z>=GPC.z0&&z<=GPC.z1;
  try{(HQ.pools||[]).forEach(p=>{if(p.userData.gpcD)return;p.userData.gpcD=1;p.getWorldPosition(wp);
   if(inR(wp.x,wp.z)&&p.material){p.material=p.material.clone();p.material.opacity*=GPC.pool}})}catch(e){}
  try{(HQ.sw||[]).forEach(rec=>{const o=rec&&rec.o;if(!o||!rec.hq||!inR(o.x,o.z))return;
   for(let i=0;i<rec.hq.length;i++){const m=rec.hq[i];if(!m||m.userData.gpcD)continue;m.userData.gpcD=1;
    if(m.emissiveIntensity!=null)m.emissiveIntensity*=GPC.facade;if(m.color)m.color.multiplyScalar(GPC.facade)}})}catch(e){}}
 setInterval(dimGpc,2000);dimGpc();
}
})();
