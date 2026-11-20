/* ===== VAR GLOBAL (di-hoist) =====
   Variabel "var" level-atas dideklarasikan di awal supaya bisa dibaca dari file mana pun sebelum nilainya diisi (nilai awal undefined), sama seperti saat masih satu skrip. */
var hqPR,__hqReady,fxReady,ULT,FUEL,FUEL_L,fuelWas,fuelSaveT,fuelPanelOn,fuelAmt,fuelPosN,fuelPosL,PAINT,PAINT_DIRTY,PU;
/* ===== FUNGSI GLOBAL (dikumpulkan di sini) =====
   Di file asli semua kode ada dalam satu skrip, jadi deklarasi function otomatis "hoisted" (bisa dipanggil sebelum didefinisikan).
   Setelah dipecah jadi banyak file itu tidak berlaku lagi, jadi semua function level-atas ditaruh di awal core.js supaya tetap bisa dipanggil dari file mana pun. */
function rs(){const w=gl.clientWidth,h=gl.clientHeight;if(!w||!h)return;renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();if(window.fxResize)fxResize(w,h)}
function gfxCeil(){const d=devicePixelRatio||1;return GFX.q==='rendah'?Math.min(d,.9):GFX.q==='normal'?Math.min(d,1.3):Math.min(d,1.5)}
function gfxLow(){const lo=GFX.q==='rendah';try{cam.far=lo?900:7000;cam.updateProjectionMatrix();scene.fog.density=lo?.0075:.0055}catch(e){}}
function gfxApply(){GFX.blur=GFX.q==='tinggi';try{ASP.lt.value=GFX.q==='tinggi'?0:1}catch(e){}gfxLow();const t=(GFX.user?gfxCeil()*(.4+.6*GFX.res/100):Math.min(devicePixelRatio||1,GFX.q==='tinggi'?1.75:1.15))*(GFX.q==='tinggi'?hqPR:1);renderer.setPixelRatio(t);try{qPR=t}catch(e){}rs();if(window.__hqReady)hqApply()}
function gfxSet(o){Object.assign(GFX,o);GFX.user=true;try{localStorage.setItem('dmGfx',JSON.stringify({q:GFX.q,res:GFX.res,user:true}))}catch(e){}gfxApply()}
function ctex(w,h,fn,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.isAsph=/#202127/.test(String(fn))?1:0;t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=Math.min(MAXA,4);return t}
function sgrain(g,w,h,n,a){n=Math.max(30,Math.min(380,((n||900)/10)|0));a=Math.min(a||.05,.035);
 for(let i=0;i<n;i++){const x=Math.random()*w,y=Math.random()*h,r=5+Math.random()*11,lt=i%2===0,al=lt?a:Math.min(.05,a*1.6),c=lt?'255,255,255':'0,0,0';
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+c+','+al.toFixed(3)+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
function add(m,x,y,z,p){m.position.set(x,y,z);(p||scene).add(m);return m}
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
 if(window.AUTO_GFX&&HQ.slow>2.5&&HQ.lv<3){HQ.lv++;HQ.slow=0;HQ.ema=.02;setTimeout(hqLod,0)}}
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
function label(t,w,h,fg,bg){const tx=ctex(256,Math.round(256*h/w),(g,a,b)=>{g.fillStyle=bg;g.fillRect(0,0,a,b);g.fillStyle=fg;g.font='bold '+b*.6+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,a/2,b/2)});return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx}))}
function saveEco(){try{localStorage.setItem('onarMoney',String(MONEY));localStorage.setItem('onarOwn',JSON.stringify(OWNED));localStorage.setItem('onarVeh',VEHSEL)}catch(e){}}
function playerSrc(){return(VEHSEL==='vario_mod'&&MODG)?MODG:custom}
function procBike(col,jac){const g=new THREE.Group(),W=[],blk=std('#0a0a0a',.8),cm=std(col,.4,.3),jm=std(jac,.8);
 [[.55],[-.7]].forEach(([z])=>{const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.12,16),blk),0,.3,z,g);w.rotation.z=Math.PI/2;W.push(w)});
 add(new THREE.Mesh(bx(.38,.1,.9),cm),0,.3,-.05,g);add(new THREE.Mesh(bx(.4,.4,.7),cm),0,.55,.35,g);add(new THREE.Mesh(bx(.36,.7,.1),cm),0,.65,-.55,g);
 add(new THREE.Mesh(bx(.36,.1,.6),blk),0,.82,.2,g);add(new THREE.Mesh(bx(.7,.06,.06),blk),0,1.12,-.5,g);
 add(new THREE.Mesh(bx(.42,.62,.3),jm),0,1.25,.15,g);add(new THREE.Mesh(bx(.4,.16,.6),jm),0,.95,-.15,g);
 [-.28,.28].forEach(x=>{const a=add(new THREE.Mesh(bx(.12,.12,.6),jm),x,1.2,-.2,g)});
 add(new THREE.Mesh(new THREE.SphereGeometry(.17,12,12),std('#e8e8ee',.3)),0,1.68,.05,g);
 add(new THREE.Mesh(bx(.2,.07,.04),bas('#ff2a2a')),0,.72,.72,g);g.userData.W=W;return g}
function rigSteer(g){try{
 const W0=g.children.find(c=>c.name==='wheel');if(!W0)return g;
 g.updateMatrixWorld(true);
 const A=W0.position.clone(),R=.36,st=new THREE.Group();st.name='steer';st.position.copy(A);st.userData.ax=[0,Math.cos(R),Math.sin(R)];
 const bb=new THREE.Box3(),c=new THREE.Vector3(),sz=new THREE.Vector3(),pick=[];
 g.children.forEach(o=>{if(!o.isMesh||o.name==='rider')return;bb.setFromObject(o);if(bb.isEmpty())return;bb.getCenter(c);bb.getSize(sz);
  const narrow=sz.x<.34&&Math.abs(c.x)<.14;
  const fork=narrow&&c.z<A.z+.3&&c.z>A.z-.45&&c.y>A.y-.02&&c.y<A.y+.95;
  const mt=Array.isArray(o.material)?o.material[0]:o.material,cl=mt&&mt.color,dark=!!cl&&(cl.r+cl.g+cl.b)<.15,fixedBlk=dark&&(sz.y>.2||sz.z>.3)&&c.y<A.y+.66;
  const bars=c.y>A.y+.58&&c.z>A.z+.1&&c.z<A.z+.55&&sz.z<.5&&!fixedBlk;
  if(fork||bars)pick.push(o)});
 pick.forEach(o=>{g.remove(o);o.position.sub(A);st.add(o)});
 g.remove(W0);W0.position.set(0,0,0);st.add(W0);g.add(st);
}catch(e){console.error('rigSteer',e)}return g}
function steerSet(o,ang){const S=o&&o.userData&&o.userData.S;if(!S||!S.userData.ax)return;const a=S.userData.ax;_sA.set(a[0],a[1],a[2]);S.quaternion.setFromAxisAngle(_sA,ang)}
function norm(src){const m=src.clone(true),b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3()),k=1.8/Math.max(s.x,s.z,.01);m.scale.multiplyScalar(k);
 const b2=new THREE.Box3().setFromObject(m),c=b2.getCenter(new THREE.Vector3());m.position.set(-c.x,src.userData.gnd?0:-b2.min.y,-c.z);m.traverse(q=>{if(q.material)[].concat(q.material).forEach(mt=>['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'].forEach(k=>{if(mt[k])mt[k].anisotropy=MAXA}))});const g=new THREE.Group();g.add(m);g.rotation.y=flip?Math.PI:0;const o=new THREE.Group();o.add(g);o.userData.W=[];m.traverse(c=>{if(c.name==='wheel')o.userData.W.push(c);else if(c.name==='steer')o.userData.S=c});return o}
function skin(b,col,jac){b.sk=[col,jac];while(b.obj.children.length)b.obj.remove(b.obj.children[0]);const um=(b.mod!==undefined?!!b.mod:(b.x<0&&VEHSEL==='vario_mod'))&&!!MODG;if(custom||um){const sr=um?MODG:custom,nb=norm(sr);if(sr.userData.hq||sr.userData.lq)envBike(nb,renderer,.55);if(b.x<0)paintApply(nb);b.obj.add(nb);b.obj.add((b.x<0&&typeof gRider==='function'&&gRider(jac))||rider(jac))}else b.obj.add(procBike(col,jac));b.obj.traverse(o=>o.layers.set(1))}
function fxResize(w,h){if(!fxReady)return;FW=w;FH=h;
 const rp=renderer.getPixelRatio(),tw=Math.max(2,w*rp|0),th=Math.max(2,h*rp|0);
 if(!RT){const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};
  RT=renderer.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget?new THREE.WebGLMultisampleRenderTarget(tw,th,o):new THREE.WebGLRenderTarget(tw,th,o);RT.texture.encoding=THREE.sRGBEncoding;if('samples' in RT)RT.samples=Math.min(4,renderer.capabilities.maxSamples||4)}
 else RT.setSize(tw,th);
 const pr=(GFX.q==='tinggi'||GFX.q==='rendah')?1:Math.min(devicePixelRatio||1,2);fx.width=w*pr|0;fx.height=h*pr|0;fc.setTransform(pr,0,0,pr,0,0)}
function fxTrack(dt){
 try{
  if(st==='ow'&&ow.foot)fxRef.set(wk.x,0,wk.z);else if(P&&P.obj){P.obj.updateMatrixWorld(true);P.obj.getWorldPosition(fxRef)}else return;
  if(fxHave&&dt>0){_fa.copy(fxRef).sub(fxPrev);const m=_fa.length();
   if(m>8)SL.forEach(L=>{L.on=false});
   else if(m>.004){_fa.multiplyScalar(1/m);_fc.copy(fxD).lerp(_fa,Math.min(1,dt*10));if(_fc.lengthSq()<1e-3)fxD.copy(_fa);else fxD.copy(_fc.normalize())}}
  fxPrev.copy(fxRef);fxHave=true;
  fxSide.crossVectors(fxD,_fc.set(0,1,0));if(fxSide.lengthSq()<1e-4)fxSide.set(1,0,0);fxSide.normalize();
  fxU.crossVectors(fxSide,fxD).normalize();
 }catch(e){}}
function fxBikeScr(){ // posisi motor di layar (pusat blur), dibatasi supaya tidak lari jauh dari tengah
 fxBX=FW*.5;fxBY=FH*.46;
 try{if(!fxHave)return;_fa.copy(fxRef);_fa.y+=.8;_fa.applyMatrix4(cam.matrixWorldInverse);if(_fa.z>-.3)return;_fa.applyMatrix4(cam.projectionMatrix);
  fxBX=Math.max(FW*.3,Math.min(FW*.7,(_fa.x*.5+.5)*FW));fxBY=Math.max(FH*.3,Math.min(FH*.65,(.5-_fa.y*.5)*FH))}catch(e){}}
function fxLines(dt){
 fc.clearRect(0,0,FW,FH);fxTrack(dt);if(fxS<.04||santay())return;fxBikeScr();
 // motion blur ringan: salinan frame diperbesar sedikit dari titik tengah, ditumpuk transparan
 try{const src=renderer.domElement;fc.save();fc.translate(fxBX,fxBY);
  (GFX.blur?[[1.015,.22],[1.032,.14]]:[]).forEach(q=>{const k=1+(q[0]-1)*fxS;fc.globalAlpha=q[1]*fxS;fc.save();fc.scale(k,k);fc.drawImage(src,-fxBX,-fxBY,FW,FH);fc.restore()});
  fc.restore()}catch(e){}
 const cx=FW*.5,cy=FH*.46,R=Math.hypot(FW,FH)*.5,inner=R*(.36-.07*fxS);
 const vg=fc.createRadialGradient(cx,cy,inner,cx,cy,R);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(.38*fxS).toFixed(3)+')');fc.fillStyle=vg;fc.fillRect(0,0,FW,FH);
 fc.lineCap='round';const n=0,vv=Math.max(8,Math.abs(curV())),Wm=cam.matrixWorldInverse,Pm=cam.projectionMatrix;
 for(let i=0;i<n;i++){const L=SL[i];let ra=0,rs=0;
  if(L.on){_fa.set(L.x-fxRef.x,L.y-fxRef.y,L.z-fxRef.z);ra=_fa.dot(fxD);rs=_fa.dot(fxSide)}
  if(!L.on||ra<-16||ra>38||Math.abs(rs)>13){ // daur ulang: munculkan di depan motor (dunia mengalir ke belakang)
   const a=L.on?14+Math.random()*22:-14+Math.random()*50,sd=(Math.random()<.5?-1:1)*(1.3+Math.random()*8.5),h=.25+Math.pow(Math.random(),1.4)*5;
   L.x=fxRef.x+fxD.x*a+fxSide.x*sd+fxU.x*h;L.y=fxRef.y+fxD.y*a+fxSide.y*sd+fxU.y*h;L.z=fxRef.z+fxD.z*a+fxSide.z*sd+fxU.z*h;
   L.on=true;L.w=Math.random();L.l=Math.random();continue}
  const len=Math.min(4,Math.max(.9,vv*.06*(.6+L.l*.9)));
  _fa.set(L.x,L.y,L.z).applyMatrix4(Wm);_fb.set(L.x+fxD.x*len,L.y+fxD.y*len,L.z+fxD.z*len).applyMatrix4(Wm);
  if(_fa.z>-.4||_fb.z>-.4)continue;
  const dep=-_fa.z;_fa.applyMatrix4(Pm);_fb.applyMatrix4(Pm);
  const x0=(_fa.x*.5+.5)*FW,y0=(.5-_fa.y*.5)*FH,x1=(_fb.x*.5+.5)*FW,y1=(.5-_fb.y*.5)*FH,
   al=fxS*.6*Math.min(1,dep/4)*(1-Math.min(1,dep/60));
  if(al<.01)continue;
  fc.strokeStyle='rgba(255,255,255,'+al.toFixed(3)+')';fc.lineWidth=Math.max(.7,Math.min(3.4,(.9+L.w*1.2)*16/dep+.5));
  fc.beginPath();fc.moveTo(x0,y0);fc.lineTo(x1,y1);fc.stroke()}fxClear();fxHoleP()}
function fxHoleP(){if(!P||!P.obj.visible||(st==='ow'&&(ow.foot||pov)))return;
 P.obj.updateMatrixWorld(true);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
 for(let i=0;i<8;i++){const v=_oc[i].set(i&1?.45:-.45,i&2?1.85:0,i&4?1:-1);v.applyMatrix4(P.obj.matrixWorld);v.applyMatrix4(cam.matrixWorldInverse);if(v.z>-.2)return;v.applyMatrix4(cam.projectionMatrix);
  const sx=(v.x*.5+.5)*FW,sy=(.5-v.y*.5)*FH;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
 fc.save();fc.globalCompositeOperation='destination-out';fc.translate((x0+x1)/2,(y0+y1)/2);fc.scale((x1-x0)*.68+16,(y1-y0)*.68+16);
 const g=fc.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#000');g.addColorStop(.6,'#000');g.addColorStop(1,'rgba(0,0,0,0)');
 fc.fillStyle=g;fc.beginPath();fc.arc(0,0,1,0,6.2832);fc.fill();fc.restore()}
function fxClear(){if(!O||!O.obj.visible||(st!=='race'&&st!=='done'))return;
 const px=O.obj.position.x,pz=O.obj.position.z;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
 for(let i=0;i<8;i++){const v=_oc[i].set(px+(i&1?.45:-.45),i&2?1.85:0,pz+(i&4?1:-1));v.applyMatrix4(cam.matrixWorldInverse);if(v.z>-.2)return;v.applyMatrix4(cam.projectionMatrix);
  const sx=(v.x*.5+.5)*FW,sy=(.5-v.y*.5)*FH;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}
 fc.save();fc.globalCompositeOperation='destination-out';fc.translate((x0+x1)/2,(y0+y1)/2);fc.scale((x1-x0)*.68+16,(y1-y0)*.68+16);
 const g=fc.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#000');g.addColorStop(.6,'#000');g.addColorStop(1,'rgba(0,0,0,0)');
 fc.fillStyle=g;fc.beginPath();fc.arc(0,0,1,0,6.2832);fc.fill();fc.restore()}
function curV(){try{if(st==='ow')return ow.foot?Math.abs(wk.v):P.v;return(st==='race'||st==='done')?P.v:0}catch(e){return 0}}
function ultBeam(){const h=16,g=new THREE.ConeGeometry(3.6,h,24,1,true);g.translate(0,-h/2,0);
 const p=g.attributes.position,c=new Float32Array(p.count*3),k=new THREE.Color(0xffe6bd);
 for(let i=0;i<p.count;i++){const f=Math.pow(Math.max(0,1+p.getY(i)/h),1.6)*.22;c[i*3]=k.r*f;c[i*3+1]=k.g*f;c[i*3+2]=k.b*f}
 g.setAttribute('color',new THREE.BufferAttribute(c,3));g.rotateX(Math.PI/2-.06);
 const m=new THREE.MeshBasicMaterial({vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide});
 const s=new THREE.Mesh(g,m);s.position.set(0,.95,-.55);s.frustumCulled=false;s.visible=false;s.renderOrder=3;s.userData.noCast=1;return s}
function ultSky(){
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthTest:false,depthWrite:false,fog:false,toneMapped:false,uniforms:{tS:{value:null},uS:{value:0}},
  vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tS;uniform float uS;varying vec3 vD;void main(){float y=normalize(vD).y;vec3 zen=vec3(.010,.018,.050);vec3 mid=vec3(.040,.055,.125);vec3 hor=vec3(.20,.115,.105);vec3 gnd=vec3(.022,.024,.040);vec3 c=y>0.?mix(mix(hor,mid,smoothstep(0.,.16,y)),zen,smoothstep(.10,.70,y)):mix(hor*.30,gnd,smoothstep(0.,.25,-y));c+=vec3(.16,.075,.04)*exp(-abs(y)*16.)*.5;if(uS>0.){vec3 d=normalize(vD);vec2 uv=vec2(atan(d.x,d.z)*.15915494+.5,asin(clamp(d.y,-1.,1.))*.31830989+.5);c+=texture2D(tS,uv*vec2(6.,3.)).rgb*uS*smoothstep(-.02,.10,d.y);}gl_FragColor=vec4(c,1.);}'});
 const s=new THREE.Mesh(new THREE.SphereGeometry(3000,32,16),m);s.frustumCulled=false;s.renderOrder=-1000;s.visible=false;
 /* BINTANG dari gambar models/langit.png (ditiling 6x3 di bola langit). Gagal dimuat -> tetap pakai bintang titik lama. uS = terang bintang. */
 try{new THREE.TextureLoader().load('models/langit.png',t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;
  m.uniforms.tS.value=t;m.uniforms.uS.value=1.3;if(HQ.stars)HQ.stars.material.visible=false},undefined,e=>console.error('langit.png',e))}catch(e){console.error('langit',e)}
 return s}
function ultInit(){
 const U=ULT,vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const mk=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false});
 U.mA=mk('varying vec2 vUv;uniform sampler2D t;uniform vec2 px;uniform float th;void main(){vec3 c=(texture2D(t,vUv+px*vec2(-1.,-1.)).rgb+texture2D(t,vUv+px*vec2(1.,-1.)).rgb+texture2D(t,vUv+px*vec2(-1.,1.)).rgb+texture2D(t,vUv+px*vec2(1.,1.)).rgb)*.25;float l=max(max(c.r,c.g),c.b);gl_FragColor=vec4(c*smoothstep(th,th+.3,l),1.);}',
  {t:{value:null},px:{value:new THREE.Vector2()},th:{value:U.K.th}});
 U.mB=mk('varying vec2 vUv;uniform sampler2D t;uniform vec2 d;void main(){vec3 c=texture2D(t,vUv).rgb*.227027+(texture2D(t,vUv+d*1.3846).rgb+texture2D(t,vUv-d*1.3846).rgb)*.316216+(texture2D(t,vUv+d*3.2308).rgb+texture2D(t,vUv-d*3.2308).rgb)*.07027;gl_FragColor=vec4(c,1.);}',
  {t:{value:null},d:{value:new THREE.Vector2()}});
 U.mC=mk('varying vec2 vUv;uniform sampler2D t;uniform sampler2D b;uniform vec2 res;uniform float tm;uniform float bk;uniform float vg;uniform float gr;uniform float ca;'+
  'float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}'+
  'void main(){vec2 d=vUv-.5;float r2=dot(d,d);vec2 o=d*r2*ca*4.;'+
  'vec3 c=vec3(texture2D(t,vUv+o).r,texture2D(t,vUv).g,texture2D(t,vUv-o).b);'+
  'c+=texture2D(b,vUv).rgb*bk;'+
  'float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.07);c=(c-.4)*1.05+.4;'+
  'c+=vec3(-.006,.003,.014)*(1.-smoothstep(0.,.5,l))+vec3(.012,.005,-.008)*smoothstep(.5,1.,l);'+
  'c*=1.-vg*smoothstep(.12,.55,r2*1.6);'+
  'c+=(hs(vUv*res+vec2(fract(tm*7.3)*91.7,fract(tm*3.1)*57.3))-.5)*gr;'+
  'gl_FragColor=vec4(clamp(c,0.,1.),1.);}',
  {t:{value:null},b:{value:null},res:{value:new THREE.Vector2(1,1)},tm:{value:0},bk:{value:U.K.bk},vg:{value:U.K.vg},gr:{value:U.K.gr},ca:{value:U.K.ca}});
 U.q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),U.mA);U.q.frustumCulled=false;U.sc=new THREE.Scene();U.sc.add(U.q)}
function ultUse(){return ULT.ok&&GFX.q==='tinggi'&&HQ.on&&HQ.lv<2&&fxReady&&!!RT&&('samples' in RT)&&RT.samples>0}
function ultRender(){
 if(!ultUse()){renderer.render(scene,cam);return}
 try{
  const U=ULT;if(!U.sc)ultInit();
  const W=RT.width,H=RT.height,bw=Math.max(2,W>>2),bh=Math.max(2,H>>2);
  if(!U.r1||U.bw!==bw||U.bh!==bh){if(U.r1){U.r1.dispose();U.r2.dispose()}
   const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false};
   U.r1=new THREE.WebGLRenderTarget(bw,bh,o);U.r2=new THREE.WebGLRenderTarget(bw,bh,o);U.bw=bw;U.bh=bh}
  renderer.setRenderTarget(RT);renderer.render(scene,cam);
  U.q.material=U.mA;U.mA.uniforms.t.value=RT.texture;U.mA.uniforms.px.value.set(1.5/W,1.5/H);U.mA.uniforms.th.value=U.K.th;
  renderer.setRenderTarget(U.r1);renderer.render(U.sc,pC);
  U.q.material=U.mB;
  for(let i=0;i<2;i++){
   U.mB.uniforms.t.value=U.r1.texture;U.mB.uniforms.d.value.set(1.2/bw,0);renderer.setRenderTarget(U.r2);renderer.render(U.sc,pC);
   U.mB.uniforms.t.value=U.r2.texture;U.mB.uniforms.d.value.set(0,1.2/bh);renderer.setRenderTarget(U.r1);renderer.render(U.sc,pC)}
  const u=U.mC.uniforms;u.t.value=RT.texture;u.b.value=U.r1.texture;u.res.value.set(W,H);u.tm.value=(performance.now()*.001)%97;
  u.bk.value=U.K.bk;u.vg.value=U.K.vg;u.gr.value=U.K.gr;u.ca.value=U.K.ca;
  U.q.material=U.mC;renderer.setRenderTarget(null);renderer.render(U.sc,pC)
 }catch(e){ULT.err++;try{renderer.setRenderTarget(null)}catch(_){}console.error('ultra',e);if(ULT.err>2)ULT.ok=false;renderer.render(scene,cam)}}
function draw(dt){
 if(santay()&&P&&P.v>17.2)P.v=Math.max(17.2,P.v-8*dt);
 riderPose(dt);burnPose(dt);engineSound(dt);wheelie(dt);povCam(dt);camBlend(dt);smoke(dt);rpmHud();
 const owF=st==='ow'&&!ow.foot,tg=santay()?0:(owF?Math.min(1,Math.max(0,(P.v-22.5)/3)):Math.min(1,Math.max(0,(curV()-22.2)/4)+((st==='race'&&P.nosT>0)?.2:0)));
 fxS+=(tg-fxS)*Math.min(1,dt*3);
 if(false&&RT){const u=post.material.uniforms;u.t.value=RT.texture;u.s.value=fxS;u.a.value=cam.aspect;
  cam.layers.mask=1;renderer.setRenderTarget(RT);renderer.render(scene,cam);renderer.setRenderTarget(null);renderer.render(pS,pC);
  const ac=renderer.autoClear;renderer.autoClear=false;renderer.clearDepth();cam.layers.mask=2;renderer.render(scene,cam);cam.layers.mask=4;renderer.render(scene,cam);renderer.autoClear=ac;cam.layers.mask=7}
 else{
  // Getar layar saat burnout (kamera): guncangan acak halus + denyut mesin, mengikuti BN.k
  const k=(typeof BN!=='undefined'&&P&&P.burn&&st==='ow'&&!ow.foot)?BN.k:0,sv=(!santay()&&!(st==='ow'&&ow.foot))?fxS:0;
  if(k>.02||sv>.04){const t=performance.now()*.001,pul=.65+.35*Math.sin(t*58),a=k*pul,r=()=>Math.random()-.5;
   const px=cam.position.x,py=cam.position.y,pz=cam.position.z,rx=cam.rotation.x,ry=cam.rotation.y,rz=cam.rotation.z;
   cam.position.x+=r()*.05*a+r()*.012*sv;cam.position.y+=(r()*.05+Math.sin(t*90)*.012)*a+(r()*.012+Math.sin(t*63)*.004)*sv;cam.position.z+=r()*.05*a+r()*.01*sv;
   cam.rotation.x+=r()*.012*a+r()*.003*sv;cam.rotation.y+=r()*.012*a+r()*.003*sv;cam.rotation.z+=r()*.02*a+(r()*.004+Math.sin(t*47)*.0015)*sv;
   cam.updateMatrixWorld(true);ultRender();
   cam.position.set(px,py,pz);cam.rotation.set(rx,ry,rz);cam.updateMatrixWorld(true)}
  else ultRender()}
 fxLines(dt)}
/* ASAP KNALPOT/BURNOUT dari gambar models/asap_knalpot.png: semua sprite asap (SM) dipasangi tekstur ini begitu daftar SM siap. Gagal dimuat -> asap lama. */
let smTexDone=false,smTexTry=0;
function smSwapTex(){if(smTexDone||smTexTry++>1800)return;let sm;try{sm=SM}catch(e){return}if(!sm||!sm.length)return;smTexDone=true;
 try{new THREE.TextureLoader().load('models/asap_knalpot.png',t=>{sm.forEach(p=>{if(!p||!p.s||!p.s.material)return;p.s.material.map=t;p.s.material.rotation=Math.random()*6.283;p.s.material.needsUpdate=true})},undefined,e=>console.error('asap_knalpot.png',e))}catch(e){console.error('asap',e)}}
function smoke(dt){
 if(!smTexDone)smSwapTex();
 const ok=P&&P.th>.2&&((st==='race'&&P.fin==null&&!P.dq)||(st==='ow'&&!ow.foot));
 if(ok){smAcc+=dt*(5+8*P.th);
  while(smAcc>=1){smAcc-=1;const p=SM.find(q=>q.life<=0);if(!p)break;
   P.obj.updateMatrixWorld(true);smV.set(.17,.3,.98);P.obj.localToWorld(smV);
   const h=st==='ow'?ow.h:0,bx_=Math.sin(h),bz_=Math.cos(h);
   p.s.material.color.setHex(0xaeb0ba);p.s.material.rotation=Math.random()*6.283;p.s.position.copy(smV);p.max=p.life=.7+Math.random()*.4;p.sz=.14+Math.random()*.06;p.o=.12+.1*P.th;
   p.vx=bx_*.9+(Math.random()-.5)*.25;p.vz=bz_*.9+(Math.random()-.5)*.25;p.vy=.3+Math.random()*.25;p.s.visible=true}}
 else smAcc=Math.min(smAcc,1);
 for(const p of SM){if(p.life<=0)continue;p.life-=dt;
  if(p.life<=0){p.s.visible=false;p.s.material.opacity=0;continue}
  const t=1-p.life/p.max,k=Math.max(0,1-dt*1.5);p.vx*=k;p.vy*=k;p.vz*=k;
  p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;
  const z=p.sz*(1+t*3.6);p.s.scale.set(z,z,1);
  p.s.material.opacity=p.o*Math.min(1,t*8)*(1-t)}
 burnEmit(dt)}
function setWH(v){WH.on=v?1:0;$('wh').classList.toggle('on',!!v)}
function santay(){try{return !!ENG.drod}catch(e){return false}}
function setSUP(v){SUP.on=v?1:0;const e=$('sup');if(e)e.classList.toggle('on',!!v)}
function riderPose(dt){if(SUP.on&&(st!=='ow'||ow.foot))setSUP(0);
 [P,O].forEach(b=>{if(!b)return;const r=b.obj.children.find(c=>c.name==='rider');if(!r||!r.userData.pose)return;
 b.cr=b.v>(b.cr?7.5:8.33);let tg=b.cr?1:0;if(b===P&&santay())tg=0;
 if(b===P){if(b.burn)b.bl=2.2;else if(b.bl>0)b.bl-=dt;if(b.bl>0)tg=1}
 if(b===P&&WH.p>.15)tg=-.35;
 let f;if(b===P){const v=b.v||0,rv=b.rv||0,rm=Math.max(0,Math.min(1,-rv/1.3));b.fdn=b.fdn?v<.7:v<.35;const bn=!!b.burn,up=(WH.p>.1)||SUP.on;
  const tl=(!up&&!bn&&(b.fdn||rm>.01))?1:0,tr=(!up&&(bn||b.fdn||rm>.01))?1:0;
  b.fl=(b.fl||0)+(tl-(b.fl||0))*Math.min(1,dt*10);b.fr=(b.fr||0)+(tr-(b.fr||0))*Math.min(1,dt*10);b.fph=(b.fph||0)+Math.abs(rv)*dt/.5;
  f=[b.fl,b.fr,rm,b.fph]}
 const k0=b.ck||0,k=k0+(tg-k0)*Math.min(1,dt*7);b.ck=k;
 const sg=(b===P&&SUP.on)?1:0;let s=b.sup||0;
 if(s<sg)s=Math.min(sg,s+dt/SUP_IN);else if(s>sg)s=Math.max(sg,s-dt/SUP_OUT);b.sup=s;
 const pf=r.userData.f,fc=f&&(!pf||Math.abs(f[0]-pf[0])>.004||Math.abs(f[1]-pf[1])>.004||f[2]>.001||Math.abs(f[2]-pf[2])>.001);
 const sa=b===P?(b.stA||0):0;if(r.userData.k===undefined||Math.abs(k-r.userData.k)>.003||Math.abs(s-(r.userData.s||0))>.0004||fc||Math.abs(sa-(r.userData.sa||0))>.004){r.userData.k=k;r.userData.s=s;r.userData.f=f;r.userData.sa=sa;r.userData.str={a:sa,S:b.obj.children[0]&&b.obj.children[0].userData.S};r.userData.pose(k,s,f?{l:f[0],r:f[1],rv:f[2],ph:f[3]}:undefined)}})}
function wheelie(dt){if(!P)return;
 const can=P.th>.3&&P.v>2&&((st==='ow'&&!ow.foot)||(st==='race'&&tree.green&&P.fin==null&&!P.dq));
 const tg=(WH.on&&can)?(P.v<22?.62:.48):0;
 WH.p+=(tg-WH.p)*Math.min(1,dt*(tg>WH.p?4:6));
 if(WH.p>.001)P.obj.rotation.x+=WH.p;
 const f=P.obj.rotation.x-(st==='ow'&&!ow.foot?gpcPitch:0);if(Math.abs(f)<.001)return;
 const zr=.65,c=zr*(1-Math.cos(f)),h=st==='ow'?ow.h:0;
 P.obj.position.x+=c*Math.sin(h);P.obj.position.y+=zr*Math.sin(f);P.obj.position.z+=c*Math.cos(h)}
function idleRpm(t){return Math.max(1200,Math.min(1300,1250+24*Math.sin(t*.9)+12*Math.sin(t*2.3+1.1)+8*Math.sin(t*38)+(Math.random()-.5)*6))}
function rpmStep(b,dt,nos){const t=performance.now()/1000,idle=idleRpm(t),v=b.v||0,th=b.th||0;
 if(b.burn){b.rpm+=(8700+Math.sin(t*50)*250-b.rpm)*Math.min(1,dt*9);b.rpm=Math.min(9000,b.rpm);return}
 const sp=Math.min(1,v/34),su=Math.min(1,v/8),coast=v<.3?idle:1700+Math.min(v,34)*55,full=Math.min(9000,5000+2000*su*su*(3-2*su)+1300*Math.pow(sp,1.3)+(nos?700:0));
 let tg=coast+th*(full-coast);if(tg>8850)tg=8850+Math.random()*150;
 if(th<.02&&v<.3&&Math.abs(b.rpm-idle)<40){b.rpm=idle;return}
 b.rpm+=(tg-b.rpm)*Math.min(1,dt*(tg>b.rpm?7:3.2-1.4*Math.min(1,v/6)));b.rpm=Math.max(1200,Math.min(9000,b.rpm))}
function rpmHud(){}
function tireSound(on){try{if(!AC||!window.MG)return;
 if(!TN){const n=AC.sampleRate*1.5|0,buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const src=AC.createBufferSource();src.buffer=buf;src.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=1.2;
  const g=AC.createGain();g.gain.value=0;src.connect(bp);bp.connect(g);g.connect(window.MG);src.start();TN={g,bp}}
 const tg=0;TN.g.gain.value+=(tg-TN.g.gain.value)*.25;if(on)TN.bp.frequency.value=1500+Math.random()*600}catch(e){}}
function burnPose(dt){const b=!!(P&&P.burn&&st==='ow'&&!ow.foot);BN.k+=((b?1:0)-BN.k)*Math.min(1,dt*8);tireSound(b);
 if(BN.k<.02)return;
 P.obj.rotation.z+=(Math.random()-.5)*.05*BN.k;
 (P.obj.children[0]?.userData.W||[]).forEach(w=>{w.getWorldPosition(smV);P.obj.worldToLocal(smV);if(smV.z>0)w.rotation.x-=34*dt*BN.k})}
function burnEmit(dt){SKg.visible=st==='ow';
 if(!(P&&P.burn&&st==='ow'&&!ow.foot&&BN.k>.5))return;
 P.obj.updateMatrixWorld(true);BN.a+=dt*55;const bx_=Math.sin(ow.h),bz_=Math.cos(ow.h);
 while(BN.a>=1){BN.a-=1;const p=SM.find(q=>q.life<=0);if(!p)break;
  smV.set((Math.random()-.5)*.18,.08,.66);P.obj.localToWorld(smV);
  p.s.material.color.setHex(0xe6e6ee);p.s.position.copy(smV);p.max=p.life=.9+Math.random()*.5;p.sz=.3+Math.random()*.15;p.o=.34;
  p.vx=bx_*1.5+(Math.random()-.5)*1.1;p.vz=bz_*1.5+(Math.random()-.5)*1.1;p.vy=.45+Math.random()*.4;p.s.visible=true}
 BN.t+=dt;if(BN.t>.05){BN.t=0;smV.set(0,.02,.66);P.obj.localToWorld(smV);const m=SKm[BN.i++%SKm.length];m.position.set(smV.x,.03,smV.z);m.rotation.y=ow.h;m.visible=true}}
function povKick(dt){const wp=WH.p||0,dw=Math.min(6,Math.max(0,(wp-CW.pw)/Math.max(dt,.001)));CW.pw=wp;
 CW.v+=((wp*.1-CW.x)*140-CW.v*9+dw*2.5)*dt;CW.x+=CW.v*dt;
 camQ.setFromEuler(new THREE.Euler(P.obj.rotation.x*.7+CW.x,P.obj.rotation.y,P.obj.rotation.z*.35,'YXZ'))}
function povCam(dt){
 const reset=()=>{if(cam.near!==.1){cam.near=.1;cam.updateProjectionMatrix()}};
 if(st!=='ow'||!P){reset();try{const rr=P&&riderObj();if(rr&&rr.userData.povHead)rr.userData.povHead(false)}catch(e){}return}
 const riding=!ow.foot,use=riding&&pov,r=riding?riderObj():null;
 if(r&&r.userData.povHide)r.userData.povHide().forEach(o=>o.visible=!use);
 if(r&&r.userData.povHead)r.userData.povHead(use);
 if(!use||!r||!r.userData.head){reset();return}
 P.obj.updateMatrixWorld(true);
 if(r.userData.povAnchor){const sp=Math.max(0,Math.min(1,(P.sup||0)/.55)),sk=sp*sp*(3-2*sp),rf=POV_REF+((r.userData.th==null?POV_REF:r.userData.th)-POV_REF)*sk;eyeV.copy(r.userData.povAnchor(rf));r.localToWorld(eyeV)}else r.userData.head.getWorldPosition(eyeV);
 baseQ.setFromEuler(new THREE.Euler(P.obj.rotation.x,P.obj.rotation.y,P.obj.rotation.z*.35,'YXZ'));
 eyeV.add(tmpV.set(0,POV_UP,POV_BACK).applyQuaternion(baseQ)); // mundur dari kepala (+z = ke belakang motor)
 cam.position.copy(eyeV);
 povKick(dt);cam.quaternion.copy(camQ).multiply(lookQ.setFromEuler(new THREE.Euler(lpitch-.08,cyaw,0,'YXZ')));
 cam.fov=80+(santay()?0:Math.min(10,P.v*.3))+(WH.p||0)*7;cam.near=.05;cam.updateProjectionMatrix();
}
function joyReset(){joy.x=joy.y=0;joy.id=null;const k=$('jk');if(k)k.style.transform=''}
function sfxCtx(){try{if(!SFX)SFX=new(window.AudioContext||window.webkitAudioContext)();if(SFX.state==='suspended')SFX.resume()}catch(e){}return SFX}
function tone(type,f0,f1,dur,vol,lp,at){const c=SFX,t=c.currentTime+(at||0),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*SND),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=o;
 if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.03)}
function uiSound(k){try{if(!SND)return;const c=sfxCtx();if(!c)return;
 if(k==='drag'){tone('square',900,450,.07,.07);tone('sawtooth',80,320,.55,.1,900,.02)}
 else if(k==='ow'){tone('square',900,450,.07,.07);tone('sawtooth',55,200,.65,.1,700,.02)}
 else if(k==='set'){tone('triangle',520,780,.09,.13);tone('triangle',780,1040,.1,.13,0,.08)}
 else tone('square',800,480,.07,.07)}catch(e){}}
function goFS(){const e=document.documentElement,f=e.requestFullscreen||e.webkitRequestFullscreen;if(!f||inFS())return;
 try{const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}};const p=f.call(e,{navigationUI:'hide'});if(p&&p.then)p.then(lk).catch(()=>{});else lk()}catch(_){}}
function outFS(){const f=document.exitFullscreen||document.webkitExitFullscreen;try{f&&f.call(document)}catch(_){}try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(_){}}
function mk(x,a0,vm,col,jac){const o=new THREE.Group();scene.add(o);const b={x,z:0,v:0,th:0,thT:0,rpm:1250,a0,vm,fin:null,top:0,react:null,nosT:0,nosUsed:false,dq:false,obj:o,tilt:0};skin(b,col,jac);return b}
function reset(){if(P){scene.remove(P.obj);scene.remove(O.obj)}P=mk(-2.2,4.4,33,'#ff9a1f','#7a1c1c');O=mk(2.2,4.2+Math.random()*.5,33+Math.random()*1.5,'#2f9bff','#222a3a');tree={t:0,amb:0,green:false,g0:0,gt:2.5+Math.random()*.5};endT=0;$('nos').classList.remove('off')}
function audio(){if(osc)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();osc=AC.createOscillator();osc.type='sawtooth';const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;gn=AC.createGain();gn.gain.value=0;osc.connect(f);f.connect(gn);const mg=AC.createGain();mg.gain.value=SND;window.MG=mg;gn.connect(mg);const lm=AC.createDynamicsCompressor();lm.threshold.value=-8;lm.knee.value=10;lm.ratio.value=10;lm.attack.value=.003;lm.release.value=.12;mg.connect(lm);lm.connect(AC.destination);osc.start()}catch(e){osc=null}}
function setGas(on){if(on===gas)return;gas=on;$('gas').classList.toggle('on',on);if(st!=='race'||!on||P.dq)return;if(!tree.green){P.dq=true;endT=0;return}if(P.react==null)P.react=tree.t-tree.g0}
function useNos(){if(st==='race'&&tree.green&&!P.dq&&!P.nosUsed&&P.fin==null){P.nosUsed=true;P.nosT=2.5;$('nos').classList.add('off')}}
function phys(b,dt,rt){
 b.th+=(b.thT-b.th)*Math.min(1,dt*7);
 const nos=b.nosT>0,vm=(b===P&&santay())?18.2:b.vm*(nos?1.08:1),fin=b.fin!=null,v0=b.v;
 const a=fin?-9:b.th*b.a0*(nos?1.4:1)*Math.max(0,1-Math.pow(b.v/vm,1.6))-(1-b.th)*(1.2+.004*b.v*b.v);
 b.v=Math.max(0,b.v+a*dt);b.z+=b.v*dt;b.top=Math.max(b.top,b.v);
 if(!fin&&b.z>=DIST)b.fin=rt-(b.z-DIST)/Math.max(b.v,1);
 rpmStep(b,dt,nos);
 b.tilt+=((b.th>.5&&b.v<14&&!fin?.12*(1-b.v/14):0)-b.tilt)*Math.min(1,dt*6)}
function step(dt){
 if(st!=='race')return;
 tree.t+=dt;tree.amb=tree.t>=2?3:tree.t>=1.5?2:tree.t>=1?1:0;
 if(!tree.green&&tree.t>=tree.gt){tree.green=true;tree.g0=tree.t;O.react=.15+Math.random()*.2}
 const rt=tree.green?tree.t-tree.g0:-1;
 P.thT=(gas&&!P.dq&&tree.green&&P.react!=null)?1:0;O.thT=(tree.green&&rt>=O.react)?1:0;
 if(P.nosT>0)P.nosT-=dt;
 phys(P,dt,rt);phys(O,dt,rt);
 if(P.fin!=null||P.dq){endT+=dt;if(endT>(P.dq?1.5:2.4))finish()}
 if(rt>60)finish()}
function show(t,html,btn){card.innerHTML='<h1>'+t+'</h1>'+html+'<button id="go">'+btn+'</button><br><button id="ow" style="background:#4cd964">OPEN WORLD</button>';ov.style.display='flex';


 $('go').onclick=()=>{audio();reset();setMode('drag');cyaw=0;cpitch=.2;st='race';ov.style.display='none'};$('ow').onclick=()=>{audio();reset();setMode('ow');cyaw=0;cpitch=.25;startOW();st='ow';ov.style.display='none'}}
function finish(){
 st='done';gas=false;$('gas').classList.remove('on');
 const win=!P.dq&&P.fin!=null&&(O.fin==null||P.fin<O.fin),et=P.fin!=null?P.fin-P.react:null;let nb='';
 if(!P.dq&&et!=null&&(best==null||et<best)){best=et;nb='<p>🏆 Rekor baru!</p>';try{localStorage.setItem('dm3d',et)}catch(e){}}
 const row=(a,b)=>'<tr><td>'+a+'</td><td>'+b+'</td></tr>';
 show(P.dq?'FALSE START':win?'KAMU MENANG!':'KAMU KALAH','<table style="margin:auto">'+row('Waktu 500 m',et!=null?et.toFixed(2)+' d':'-')+row('Kecepatan maks',(P.top*3.6).toFixed(0)+' km/j')+row('Reaksi',P.react!=null?P.react.toFixed(3)+' d':'-')+row('Lawan',O.fin!=null?(O.fin-O.react).toFixed(2)+' d':'belum finis')+row('Terbaik',best!=null?best.toFixed(2)+' d':'-')+'</table>'+nb,'MAIN LAGI')}
function rpiSet(){}
function frame(dt){
 const rt=tree.green?tree.t-tree.g0:0;
 if(P.stA){P.stA=0;steerSet(P.obj.children[0],0)}[P,O].forEach(b=>{b.obj.position.set(b.x,0,-b.z+.8);b.obj.rotation.x=b.tilt;(b.obj.children[0]?.userData.W||[]).forEach(w=>w.rotation.x-=b.v*dt/.22)});
 const sh=P.v*.0012,cx=P.x*.55;
 cam.fov=62+P.v*.5;cam.updateProjectionMatrix();
 {const tx=P.x,tz=-P.z+.8,D=cdist+P.v*.01,cp=Math.cos(cpitch);cam.position.set(tx+Math.sin(cyaw)*cp*D+(Math.random()-.5)*sh,.75+Math.sin(cpitch)*D+(Math.random()-.5)*sh,tz+Math.cos(cyaw)*cp*D);cam.lookAt(tx,.85,tz-1)}
 pl.position.set(P.x,4,-P.z+2);
 [0,1].forEach(c=>lamps[c].forEach((m,r)=>{let on;if(r<2)on=true;else if(r<5)on=tree.amb>r-2&&!(c===0&&P.dq);else if(r===5)on=tree.green&&!(c===0&&P.dq);else on=c===0&&P.dq;m.material.color.setHex(on?onC[r]:offC[r]);m.children[0].visible=on}));
 $('pbP').style.width=Math.min(100,P.z/DIST*100)+'%';$('pbO').style.left=Math.min(100,O.z/DIST*100)+'%';
 {const sd=$('spd'),tx='sisa '+Math.max(0,DIST-P.z|0)+' m';if(sd.__t!==tx){sd.__t=tx;sd.textContent=tx}}
 rpiSet();
 const tt=P.fin!=null?P.fin-P.react:P.react!=null?Math.max(0,rt-P.react):0;$('tm').textContent=tt.toFixed(2)+' s';$('rc').textContent=P.react!=null?'reaksi '+P.react.toFixed(3):'';
 let m='',c='#fff',sz=24;
 if(st==='race'){if(P.dq){m='FALSE START!';c='#ff3b2f';sz=32}else if(!tree.green){m=tree.amb?'TAHAN GAS SAAT HIJAU…':'SIAP…';sz=18}else if(rt<.5||(rt<.7&&P.react==null)){m='GO!';c='#4cd964';sz=44}}
 const e=$('msg');e.textContent=m;e.style.color=c;e.style.fontSize=sz+'px';
 if(osc){gn.gain.value=0}
 draw(dt)}
function camToast(t){const e=$('camt');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(camTT);camTT=setTimeout(()=>e.classList.remove('on'),1800)}
function camSet(m,quiet){
 if(!quiet){CB.p.copy(cam.position);CB.q.copy(cam.quaternion);CB.t=0}
 CAM.mode=m;
 if(m===5){ // mulai dari sudut pandang kamera saat ini supaya tidak melompat
  const T=ow.foot?wk:ow,ty=(ow.foot?1.0:.9)+gpcGY,dx=cam.position.x-T.x,dz=cam.position.z-T.z,dy=cam.position.y-ty,h=Math.hypot(dx,dz);
  CAM.yaw=Math.atan2(dx,dz);CAM.pitch=Math.max(.03,Math.min(1.5,Math.atan2(dy,h)));CAM.dist=Math.max(.8,Math.min(30,Math.hypot(h,dy)));if(CAM.dist<2.5)CAM.dist=4.5}
 else{cyaw=0;lpitch=(m===1?-.3:0);if(m===0)cpitch=.25}
 const b=$('camtx');if(b)b.textContent=CAM_N[m];
 if(!quiet)camToast(m===5?'KAMERA CUSTOM 360° · geser = putar · cubit = zoom':'KAMERA '+CAM_N[m])}
function camNext(){camSet((CAM.mode+1)%CAM_N.length)}
function camOrbit(T,spd){
 const m=CAM.mode,ty=(ow.foot?1.0:.9)+gpcGY;let ang,pit,D,tx=T.x,tz=T.z,tY=ty,fv=62;
 if(m===5){ang=CAM.yaw;pit=CAM.pitch;D=CAM.dist}
 else{const z=CAM.zm[m],h=T.h;
  if(m===2){ang=h+Math.PI/2;pit=.1;D=(3.8+spd*.02)*z;fv=56+spd*.3}
  else if(m===3){ang=h+Math.PI;pit=.16;D=(3.3+spd*.015)*z;fv=60+spd*.3}
  else{ang=h;pit=1.2;D=(8.5+spd*.05)*z;tx=T.x-Math.sin(h)*1.5;tz=T.z-Math.cos(h)*1.5;tY=.4+gpcGY;fv=58}}
 cam.fov=fv;cam.updateProjectionMatrix();const cp=Math.cos(pit);
 cam.position.set(tx+Math.sin(ang)*cp*D,tY+Math.sin(pit)*D,tz+Math.cos(ang)*cp*D);cam.lookAt(tx,tY,tz)}
function camBlend(dt){if(CB.t>=1)return;CB.t=Math.min(1,CB.t+dt/.7);const e=CB.t*CB.t*(3-2*CB.t);
 cam.position.lerpVectors(CB.p,cam.position,e);cam.quaternion.copy(CB.q.clone().slerp(cam.quaternion,e))}
function zoomBy(f){if(DR.on)return;const m=CAM.mode;
 if(m===0)cdist=Math.max(2.2,Math.min(9,cdist/f));
 else if(m===5)CAM.dist=Math.max(.8,Math.min(30,CAM.dist/f));
 else if(m>=2)CAM.zm[m]=Math.max(.5,Math.min(2.5,CAM.zm[m]/f))}
function droneOn(){
 if(st!=='ow'||DR.on)return;
 DR.prev=CAM.mode;if(CAM.mode===1)camSet(0,true);
 const d=new THREE.Vector3();cam.getWorldDirection(d);
 DR.x=cam.position.x;DR.y=Math.max(cam.position.y,2);DR.z=cam.position.z;
 DR.yaw=Math.atan2(-d.x,-d.z);DR.pitch=Math.asin(Math.max(-1,Math.min(1,d.y)));
 DR.vx=DR.vy=DR.vz=0;DR.f=DR.b=0;for(const q in DR.k)DR.k[q]=0;
 inp.l=inp.r=inp.brk=inp.bn=inp.rev=inp.run=0;setGas(false);setWH(0);setSUP(0);
 drag=null;CB.t=1;DR.on=true;
 $('w').classList.add('drone');joyReset();
 const b=$('drn');if(b){window.DRN_HTML=window.DRN_HTML||b.innerHTML;b.textContent='✕ KELUAR'}
 camToast('DRONE · joystick = maju/mundur/geser · geser layar = arah · kanan = naik/turun')}
function droneOff(){
 if(!DR.on)return;
 DR.on=false;DR.f=DR.b=0;for(const q in DR.k)DR.k[q]=0;
 $('w').classList.remove('drone');joyReset();
 ['dfw','dbk'].forEach(i=>{const e=$(i);if(e)e.classList.remove('on')});
 CB.p.copy(cam.position);CB.q.copy(cam.quaternion);
 camSet(DR.prev,true);CB.t=0; // kembali mulus ke kamera biasa
 const b=$('drn');if(b)b.innerHTML=window.DRN_HTML||'🚁 DRONE'}
function droneCam(dt){
 const cp=Math.cos(DR.pitch),sp=Math.sin(DR.pitch),sy=Math.sin(DR.yaw),cy=Math.cos(DR.yaw),k=DR.k;
 const jx=Math.abs(joy.x)>.1?joy.x:0,jy=Math.abs(joy.y)>.1?-joy.y:0;
 let mv=jy+(k.f?1:0)-(k.b?1:0),sx=jx+(k.r?1:0)-(k.l?1:0);const ml=Math.max(1,Math.hypot(mv,sx));mv/=ml;sx/=ml;
 const up=((DR.f||k.u)?1:0)-((DR.b||k.d)?1:0),S=DR.sp; // joystick: maju/mundur/geser datar searah pandangan; tombol kanan: naik/turun
 const tx=(-sy*mv+cy*sx)*S,ty=up*S*.6,tz=(-cy*mv-sy*sx)*S,a=Math.min(1,dt*5);
 DR.vx+=(tx-DR.vx)*a;DR.vy+=(ty-DR.vy)*a;DR.vz+=(tz-DR.vz)*a;
 DR.x+=DR.vx*dt;DR.z+=DR.vz*dt;DR.y+=DR.vy*dt;
 const T=ow.foot?wk:ow,dx=DR.x-T.x,dz=DR.z-T.z,dd=Math.hypot(dx,dz); // batas jangkauan 500 m dari pemain
 if(dd>500){DR.x=T.x+dx*500/dd;DR.z=T.z+dz*500/dd}
 let g=0;try{g=+gpcH(DR.x,DR.z)||0}catch(e){}
 DR.y=Math.max(g+.8,Math.min(150,DR.y));
 cam.fov=72;cam.updateProjectionMatrix();
 cam.position.set(DR.x,DR.y,DR.z);cam.lookAt(DR.x-sy*cp,DR.y+sp,DR.z-cy*cp)}
function lkrIn(x,z,m){const L=LKR;m=m||0;return x<=L.x0+m&&x>=L.x0-L.len-m&&Math.abs(z-L.z)<=L.w/2+m}
function lkrH(x,z){return lkrIn(x,z,0)?LKR.y:null}
function mkBlock(bi,bj){const g=new THREE.Group();g.position.set(bi*80,0,bj*80);
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const px=sx*17,pz=sz*17;if((bi*80+px>0&&bi*80+px<110&&bj*80+pz<-515&&bj*80+pz>-1250)||(LKR.clear&&lkrIn(bi*80+px,bj*80+pz,1.5))||(bi*80+px<10&&bj*80+pz<LFT_Z0)||(bi*80+px>-37&&bi*80+px<21&&bj*80+pz>-362&&bj*80+pz<-298))return;add(new THREE.Mesh(pG,pM),px,3.6,pz,g);add(new THREE.Mesh(lG,lM),px,7.2,pz,g);const sp=new THREE.Sprite(sprM);sp.scale.set(6,6,1);sp.position.set(px,7.2,pz);g.add(sp)});
 owG.add(g);return g}
function updBlocks(){const T=DR.on?DR:(ow.foot?wk:ow),ci=Math.round(T.x/80),cj=Math.round(T.z/80);
 for(let i=ci-2;i<=ci+2;i++)for(let j=cj-2;j<=cj+2;j++){const k=i+','+j;if(!blocks.has(k))blocks.set(k,mkBlock(i,j))}
 blocks.forEach((g,k)=>{const [i,j]=k.split(',').map(Number);if(Math.abs(i-ci)>3||Math.abs(j-cj)>3){owG.remove(g);blocks.delete(k)}})}
function setMode(m){window.__tm=-1;mode=m;const o=m==='ow';dragObjs.forEach(x=>x.visible=!o);owG.visible=o;O.obj.visible=!o;P.obj.rotation.order=o?'YXZ':'XYZ';P.obj.rotation.set(0,0,0);
 $('nos').style.display=o?'none':'';['bl','br','brk','bn','rv','bk','eye','mt'].forEach(i=>{const el=$(i);if(el)el.style.display=o?'flex':'none'});$('pb').style.display=o?'none':'';$('run').style.display='none';$('w').classList.toggle('ow',o);$('wh').style.display='flex';setWH(0);$('w').classList.remove('foot');$('joy').style.display='none';$('gas').style.display='';lastFoot=null;joyReset()}
function updCoord(o){const c=document.getElementById('coord');if(!c)return;
 if(!HUDS.coord){if(c.style.display!=='none')c.style.display='none';return}
 if(c.style.display!=='block')c.style.display='block';
 const por=innerHeight>innerWidth;c.classList.toggle('por',por);
 if(por){if(c.style.right)c.style.right='';coordRight=-1}
 else if(coordRight<0||++coordN%20===0){const n=document.getElementById('onarr');if(n){const r=n.getBoundingClientRect();if(r.width){coordRight=innerWidth-r.left;c.style.right=(coordRight+6)+'px'}}}
 const deg=(((o.h*180/Math.PI)%360)+360)%360,t=performance.now()<coordFlash?'TERSALIN \u2713':'X '+o.x.toFixed(1)+'  Z '+o.z.toFixed(1)+'  H '+Math.round(deg)+'\u00b0';
 if(c._t!==t){c.textContent=t;c._t=t}}
function startOW(){if(typeof FUEL_L!=='undefined'&&FUEL_L<3){FUEL_L=3;fuelWas=true;fuelSave()}ow.foot=false;walker.visible=false;pov=false;camSet(0,true);ow.x=SPAWN.x;ow.z=SPAWN.z;ow.h=SPAWN.h;ow.odo=0;ow.steer=0;P.v=0;P.th=0}
function mkWalker(){const g=new THREE.Group(),sk=std('#e0b090',.7),jk=std('#2f6f4a',.8),pn=std('#222833',.8),hr=std('#1a1410',.9);
 const part=(w,h,d,m,x,y,z,p)=>add(new THREE.Mesh(bx(w,h,d),m),x,y,z,p);
 const limb=(x,y,w,h,m,hand)=>{const p=new THREE.Group();p.position.set(x,y,0);part(w,h,w*1.1,m,0,-h/2,0,p);if(hand)part(w*.9,.1,w,sk,0,-h-.04,0,p);g.add(p);return p};
 part(.44,.62,.26,jk,0,1.2,0,g);
 add(new THREE.Mesh(new THREE.SphereGeometry(.14,12,12),sk),0,1.68,0,g);add(new THREE.Mesh(new THREE.SphereGeometry(.15,12,12,0,6.3,0,1.4),hr),0,1.7,0,g);
 g.userData={L:limb(-.11,.9,.16,.9,pn),R:limb(.11,.9,.16,.9,pn),AL:limb(-.28,1.48,.11,.62,jk,1),AR:limb(.28,1.48,.11,.62,jk,1)};
 g.rotation.order='YXZ';return g}
function toggleMount(){if(st!=='ow')return;
 if(!ow.foot){if(P.v>3)return;P.v=0;wk.x=ow.x-Math.cos(ow.h)*1.1;wk.z=ow.z+Math.sin(ow.h)*1.1;wk.h=ow.h;ow.cb=ow.h;wk.v=0;ow.foot=true;walker.visible=true;setGas(false);const r=riderObj();if(r)r.visible=false}
 else{if(Math.hypot(wk.x-ow.x,wk.z-ow.z)>3.5)return;ow.foot=false;walker.visible=false;const r=riderObj();if(r)r.visible=true}}
function launchBoost(dt,bn){
 if(santay()){LB.mul=1;LB.bt=LB.ch=LB.rel=0;LB.was=bn;return}
 if(bn)LB.ch=Math.min(1,LB.ch+dt/1.3);
 else{if(LB.was)LB.rel=1;LB.rel=Math.max(0,LB.rel-dt);if(LB.rel<=0&&LB.bt<=0)LB.ch=0}
 LB.was=bn;
 if(!bn&&gas&&LB.rel>0&&LB.ch>.12){LB.pk=.2+.35*LB.ch;LB.bt=2.2;LB.ch=0;LB.rel=0}
 if(LB.bt>0){LB.bt=Math.max(0,LB.bt-dt);LB.mul=1+LB.pk*(LB.bt/2.2)}else LB.mul=1}
function stepOW(dt){
 if(DR.on&&ow.foot){wk.v=0;P.th=0;P.burn=false;P.rv=0;rpmStep(P,dt,false);return}
 const jx=ow.foot&&Math.abs(joy.x)>.12?joy.x:0;ow.steer+=(Math.max(-1,Math.min(1,(inp.l?1:0)-(inp.r?1:0)-jx))-ow.steer)*Math.min(1,dt*8);
 if(ow.foot){const ya=ow.cb+cyaw;let ix=(inp.r?1:0)-(inp.l?1:0),iy=(gas?1:0)-(inp.brk?1:0),mg=(ix||iy)?(inp.run?1:.6):0;const jx=Math.abs(joy.x)>.12?joy.x:0,jy=Math.abs(joy.y)>.12?-joy.y:0;if(jx||jy){ix=jx;iy=jy;mg=Math.min(1,Math.hypot(jx,jy))}const il=Math.hypot(ix,iy)||1;ix/=il;iy/=il;let tv=0;if(mg>0){const dx=-Math.sin(ya)*iy+Math.cos(ya)*ix,dz=-Math.cos(ya)*iy-Math.sin(ya)*ix,tg=Math.atan2(-dx,-dz);let df=tg-wk.h;df=Math.atan2(Math.sin(df),Math.cos(df));wk.h+=df*Math.min(1,dt*10);tv=(mg<.75?mg/.75*2.2:2.2+Math.min(1,(mg-.75)/.25)*3.3)*Math.max(0,1-Math.abs(df)/2.2)}wk.v+=(tv-wk.v)*Math.min(1,dt*8);
  wk.x-=Math.sin(wk.h)*wk.v*dt;wk.z-=Math.cos(wk.h)*wk.v*dt;ow.odo+=Math.abs(wk.v)*dt;wk.t+=Math.abs(wk.v)*dt*2.6;P.th=0;P.burn=false;P.rv=0;rpmStep(P,dt,false);return}
 {const rvOK=!!(inp.rev&&P.v<.6&&!inp.bn&&!inp.brk&&!gas);P.rv=P.rv||0;P.rv+=((rvOK?-1.3:0)-P.rv)*Math.min(1,dt*(rvOK?4:9));if(Math.abs(P.rv)<.01)P.rv=0;const rb=$('rv');if(rb)rb.classList.toggle('on',!!inp.rev)}
 launchBoost(dt,!!(inp.bn&&P.v<6));
 P.th+=((gas&&(typeof FUEL_L==='undefined'||FUEL_L>0)?1:0)-P.th)*Math.min(1,dt*7);
 P.v=Math.max(0,P.v+P.th*4.6*HPV.k()*LB.mul*Math.max(0,1-Math.pow(P.v/(santay()?18.2:33),1.6))*dt-(1-P.th)*(1.2+.004*P.v*P.v)*dt-((inp.brk||(inp.bn&&P.v<6))?14*dt:0));
 P.burn=!!(inp.bn&&P.v<6);{const bb=$('bn');if(bb)bb.classList.toggle('on',P.burn)}rpmStep(P,dt,false);
 ow.h+=ow.steer*dt*FEEL*(Math.min(P.v,9)/9)*1.7/(1+P.v/22);if(P.burn)ow.h+=ow.steer*dt*1.5;if(P.rv<0)ow.h-=ow.steer*dt*.7*Math.min(1,-P.rv/1.3);
 const mv=P.v+P.rv,nx=ow.x-Math.sin(ow.h)*mv*dt*FEEL,nz=ow.z-Math.cos(ow.h)*mv*dt*FEEL;ow.x=nx;ow.z=nz;ow.odo+=(P.v+Math.abs(P.rv))*dt*FEEL;if(typeof fuelUse==='function')fuelUse((P.v+Math.abs(P.rv))*dt*FEEL)}
function tbOff(z){return TB.on?TB.A*tbSS((z-TB.a0)/(TB.a1-TB.a0)):0}
function tbYaw(z){return Math.atan((tbOff(z+.5)-tbOff(z-.5)))}
function tbBend(g,zOf){const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)+tbOff(zOf(p.getX(i),p.getY(i),p.getZ(i))));p.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();return g}
function rdLocal(x,z){const dx=x-RD.x,dz=z-RD.z,c=Math.cos(RD.h),s=Math.sin(RD.h);return[dx*c-dz*s,-(dx*s+dz*c)]}
function rdWorld(lx,d){const c=Math.cos(RD.h),s=Math.sin(RD.h);return[RD.x+lx*c-d*s,RD.z-lx*s-d*c]}
function rdY(d){const{H,D0,D1,D2,D3}=RD;return d<=D0||d>=D3?0:d<D1?H*(d-D0)/(D1-D0):d<=D2?H:H*(D3-d)/(D3-D2)}
function roadH(x,z){const[lx,d]=rdLocal(x,z);if(d<-30||d>RD.D3+10||lx<-15||lx>10.6)return null;
 if(RD.in&&d>RD.D0&&d<RD.D3&&Math.abs(lx)<=RD.HW)return rdY(d)+.05;return .03}
function roadWall(){
 if(location.hash==='#koordinat'){let e=document.getElementById('rdbg');if(!e){e=document.createElement('div');e.id='rdbg';e.style.cssText='position:absolute;left:50%;top:70px;transform:translateX(-50%);font:700 13px monospace;color:#9f9;text-shadow:0 1px 3px #000;pointer-events:none';$('hud').appendChild(e)}const o=ow.foot?wk:ow;e.textContent='x '+o.x.toFixed(1)+'  z '+o.z.toFixed(1)+'  h '+ow.h.toFixed(2)}
 if(ow.foot){RD.in=false;return}
 const[lx,d]=rdLocal(ow.x,ow.z);
 if(d<=RD.D0||d>=RD.D3)RD.in=false;
 else if(!RD.in&&Math.abs(lx)<6.4&&(RD.pd<=RD.D0||RD.pd>=RD.D3))RD.in=true;
 RD.pd=d;
 if(RD.in&&Math.abs(lx)>6.4){const dl=Math.sign(lx)*6.4-lx,c=Math.cos(RD.h),s=Math.sin(RD.h);ow.x+=dl*c;ow.z-=dl*s;P.v*=.85}}
function sprY(x){if(x>=18.9)return Math.max(.03,.15-.12*(x-18.9)/1.1);if(x>=14.85)return .15;if(x>=12.5)return .06+.09*(x-12.5)/2.35;return .06}
function spbuWall(){const o=ow.foot?wk:ow,r=ow.foot?.35:.7;
 for(const b of SPBU_WALLS){const x0=b[0]-r,x1=b[1]+r,z0=b[2]-r,z1=b[3]+r;
  if(o.x>x0&&o.x<x1&&o.z>z0&&o.z<z1){const d=[o.x-x0,x1-o.x,o.z-z0,z1-o.z],m=Math.min(...d),i=d.indexOf(m);
   if(i===0)o.x=x0;else if(i===1)o.x=x1;else if(i===2)o.z=z0;else o.z=z1;if(!ow.foot)P.v*=.5}}}
function sprH(x,z){if(x<SLOT.xw||x>SLOT.xr||Math.abs(z-SPBU.z)>SLOT.hz)return null;const r2=SPR.w*SPR.w/4;for(const p of SPR_P){const dx=x-p[0],dz=z-p[1];if(dx*dx+dz*dz<=r2)return sprY(x)}if(x<=SLOT.xe||Math.abs(z-SPBU.z)<=SLOT.hz2)return sprY(x);return null}
function trotIn(x,z){const T=TROT,hw=T.w/2,zs=T.z0+hw;x-=tbOff(z);if(x<T.x-hw||x>T.x+hw||z<T.z0||z>T.z0+T.len)return false;if(z>=zs)return true;const dx=x-T.x,dz=z-zs;return dx*dx+dz*dz<=hw*hw}
function trotH(x,z){if(!ow.foot)return null;if(trotIn(x,z))return TROT.h;return islIn(x,z)?ISL.h:null}
function trotWall(){if(ow.foot)return;
 const T=TROT,r=.42,hw=T.w/2,x0=T.x-hw,x1=T.x+hw,zs=T.z0+hw,z1=T.z0+T.len,fx=-Math.sin(ow.h),fz=-Math.cos(ow.h);let hit=0;
 for(const d of[.85,0,-.85]){const pz=ow.z+fz*d,px=ow.x+fx*d-tbOff(pz);let cx,cz;
  if(pz>=zs){cx=Math.max(x0,Math.min(x1,px));cz=Math.min(z1,pz)}
  else{const ax=px-T.x,az=pz-zs,L=Math.hypot(ax,az);if(L<=hw){cx=px;cz=pz}else{cx=T.x+ax/L*hw;cz=zs+az/L*hw}}
  const dx=px-cx,dz=pz-cz,dd=Math.hypot(dx,dz);
  if(dd>=r)continue;let nx,nz,push;
  if(dd>1e-4){nx=dx/dd;nz=dz/dd;push=r-dd}
  else if(pz<zs){const ax=px-T.x,az=pz-zs,L=Math.hypot(ax,az);if(L<1e-4){nx=0;nz=-1}else{nx=ax/L;nz=az/L}push=hw-L+r}
  else{const a=px-x0,b=x1-px,e=z1-pz,m=Math.min(a,b,e);if(m===a){nx=-1;nz=0}else if(m===b){nx=1;nz=0}else{nx=0;nz=1}push=m+r}
  ow.x+=nx*push;ow.z+=nz*push;hit=Math.max(hit,Math.abs(nx*fx+nz*fz))}
 if(hit>.2)P.v*=Math.max(0,1-(hit-.2)*.6)}
function islIn(x,z){return ISLS.some(S=>{const u=(x-S.x)/(ISL.w/2),v=(z-S.z)/(ISL.l/2);return u*u+v*v<=1})}
function rectPush(o,x0,x1,z0,z1,r,offs,fx,fz){let hit=0;
 for(const d of offs){const px=o.x+fx*d,pz=o.z+fz*d,cx=Math.max(x0,Math.min(x1,px)),cz=Math.max(z0,Math.min(z1,pz)),dx=px-cx,dz=pz-cz,dd=Math.hypot(dx,dz);
  if(dd>=r)continue;let nx,nz,push;
  if(dd>1e-4){nx=dx/dd;nz=dz/dd;push=r-dd}
  else{const a=px-x0,b=x1-px,c=pz-z0,e=z1-pz,m=Math.min(a,b,c,e);if(m===a){nx=-1;nz=0}else if(m===b){nx=1;nz=0}else if(m===c){nx=0;nz=-1}else{nx=0;nz=1}push=m+r}
  o.x+=nx*push;o.z+=nz*push;hit=Math.max(hit,Math.abs(nx*fx+nz*fz))}
 return hit}
function ellPush(o,cx,cz,a,b,r,offs,fx,fz){let hit=0;const A=a+r,B=b+r;
 for(const d of offs){const px=o.x+fx*d,pz=o.z+fz*d,dx=px-cx,dz=pz-cz,qx=dx/A,qz=dz/B,q=Math.hypot(qx,qz);
  if(q>=1)continue;let nx,nz,tx,tz;
  if(q<1e-4){nx=1;nz=0;tx=cx+A;tz=cz}else{tx=cx+qx/q*A;tz=cz+qz/q*B;const gx=dx/(A*A),gz=dz/(B*B),gl=Math.hypot(gx,gz);nx=gx/gl;nz=gz/gl}
  o.x+=tx-px;o.z+=tz-pz;hit=Math.max(hit,Math.abs(nx*fx+nz*fz))}
 return hit}
function pillarWall(){
 if(ow.foot){for(const S of ISLS)rectPush(wk,S.x-PIL.sx/2,S.x+PIL.sx/2,S.z-PIL.sz/2,S.z+PIL.sz/2,.35,[0],0,0);return}
 const fx=-Math.sin(ow.h),fz=-Math.cos(ow.h),O=[.85,0,-.85];let hit=0;
 for(const S of ISLS){const h1=ellPush(ow,S.x,S.z,ISL.w/2,ISL.l/2,.42,O,fx,fz),h2=rectPush(ow,S.x-PIL.sx/2,S.x+PIL.sx/2,S.z-PIL.sz/2,S.z+PIL.sz/2,.42,O,fx,fz);hit=Math.max(hit,h1,h2)}
 if(hit>.2)P.v*=Math.max(0,1-(hit-.2)*.6)}
function nswH(x,z){if(x<NSW.x0||x>NSW.x1)return null;for(const q of NSW.segs)if(z<=q[0]&&z>=q[1])return NSW.y+.1;return null}
function gpcH0(x,z){const spr=sprH(x,z);if(spr!=null)return spr;const nsw=nswH(x,z);if(nsw!=null)return nsw;const sw=trotH(x,z);if(sw!=null)return sw;const rh=roadH(x,z);if(rh!=null)return rh;const lk=lkrH(x,z);if(lk!=null)return lk;const lz=x+20,lx=-z,a=Math.abs(lx);if(lz>28.4&&lz<=35&&a<=60){if(lz<30.4)return .052+.168*(lz-28.4)/2;return lz<=34.9?.22:0}if(lz>35||lz<-157||a>90)return 0;
 if(lz<=0&&lz>=-150&&a<=30)return .06;if(lz>0)return a<=60?.05:0;if(lz>=-5)return a<=60?.05:0;return .03}
function grdCollect(){try{const L=[];owG.children.forEach(o=>{if(!o.isMesh||o.isInstancedMesh)return;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;if(g.type==='PlaneGeometry'||(g.attributes.position.count===4&&g.index&&g.index.count===6))L.push(o)});GRD.list=L;GRD.n=owG.children.length;GRD.cache.clear()}catch(e){console.error('grdCollect',e)}}
function grdH(x,z){try{if(GRD.n!==owG.children.length)grdCollect();if(!GRD.list.length)return null;
 const k=Math.round(x*10)+','+Math.round(z*10),c=GRD.cache.get(k);if(c!==undefined)return c;
 GRD.o.set(x,.2,z);GRD.rc.set(GRD.o,GRD.d);GRD.rc.near=0;GRD.rc.far=.4;let best=null;
 for(const m of GRD.list){if(!m.visible)continue;m.updateMatrixWorld();const h=GRD.rc.intersectObject(m,false);if(h.length){const y=h[0].point.y;if(y>-.05&&y<=.15&&(best==null||y>best))best=y}}
 const r=best==null?null:(best>.004?best+.02:0);if(GRD.cache.size>4000)GRD.cache.clear();GRD.cache.set(k,r);return r}catch(e){return null}}
function gpcH(x,z){const v=gpcH0(x,z);if(v!==0)return v;const g=grdH(x,z);return g==null?0:g}
function camWallClamp(T){try{
 const tx=T.x,tz=T.z,ty=(ow.foot?1.0:.9)+gpcGY,dx=cam.position.x-tx,dy=cam.position.y-ty,dz=cam.position.z-tz,m=.3;let best=1;
 for(const b of CAM_WALLS){let t0=0,t1=1,ok=true;
  for(const q of [[tx,dx,b[0]-m,b[1]+m],[ty,dy,-1,b[4]+m],[tz,dz,b[2]-m,b[3]+m]]){const o=q[0],d=q[1],lo=q[2],hi=q[3];
   if(Math.abs(d)<1e-9){if(o<lo||o>hi){ok=false;break}}
   else{let a=(lo-o)/d,c=(hi-o)/d;if(a>c){const w=a;a=c;c=w}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1){ok=false;break}}}
  if(ok&&t0>0&&t0<best)best=t0}
 if(best<1){const k=Math.max(.06,best-.03);cam.position.set(tx+dx*k,ty+dy*k,tz+dz*k)}
}catch(e){}}
function frameOW(dt){
 try{ONL.tick(dt)}catch(e){console.error(e)}
 roadWall();
  if(!ow.foot){const lzB=ow.x+20;if(ow.z>=-GPE&&ow.z<=60){const pl=window.GP_LZ;if(pl!=null){if(pl>35.9&&lzB<35.9){ow.x=-20+35.9;P.v*=.5}else if(pl<33.9&&lzB>33.9){ow.x=-20+33.9;P.v*=.5}}window.GP_LZ=ow.x+20}else window.GP_LZ=null}else window.GP_LZ=null;
  for(const q of (window.GP_POLES||[])){const o=ow.foot?wk:ow,dx=o.x-q[0],dz=o.z-q[1],d=Math.hypot(dx,dz),r=ow.foot?.55:.8;if(d<r&&d>.001){o.x=q[0]+dx/d*r;o.z=q[1]+dz/d*r;if(!ow.foot)P.v*=.5}}
 trotWall();barWall();polWall();if(typeof fuelFrame==='function')fuelFrame(dt);pillarWall();spbuWall();const T=ow.foot?wk:ow,spd=ow.foot?Math.abs(wk.v):P.v;pov=CAM.mode===1;if(CAM.mode===5&&ow.foot)cyaw=CAM.yaw-ow.cb;updBlocks();{const Q=DR.on?DR:T;owRoad.position.set(Math.round(Q.x/80)*80,0,Math.round(Q.z/80)*80)}
 {const fx=-Math.sin(ow.h),fz=-Math.cos(ow.h),wH=d=>{const x=ow.x+fx*d,z=ow.z+fz*d;return Math.max(gpcH(x,z),gpcH(x+fx*.22,z+fz*.22),gpcH(x-fx*.22,z-fz*.22))},Hf=wH(.67),Hr=wH(-.6),tgB=Hr+(Hf-Hr)*.6/1.27,tgY=ow.foot?gpcH(wk.x,wk.z):tgB,tgP=Math.atan2(Hf-Hr,1.27);
 gpcGY+=(tgY-gpcGY)*Math.min(1,dt*(tgY>gpcGY?45:18));gpcBY+=(tgB-gpcBY)*Math.min(1,dt*(tgB>gpcBY?45:18));gpcPitch+=(tgP-gpcPitch)*Math.min(1,dt*12);
 const sp=Math.sin(gpcPitch),nb=Math.max(Hr-(gpcBY-sp*.6),Hf-(gpcBY+sp*.67),0);if(nb>0)gpcBY+=nb;
 if(!ow.foot){const ng=Math.max(Hr-(gpcGY-sp*.6),Hf-(gpcGY+sp*.67),0);if(ng>0)gpcGY+=ng}}P.obj.position.set(ow.x,ow.foot?gpcBY:gpcGY,ow.z);P.obj.rotation.set(gpcPitch,ow.h,ow.foot?0:ow.steer*LEANK(P.v)*.8);
 (P.obj.children[0]?.userData.W||[]).forEach(w=>w.rotation.x-=(P.v+(P.rv||0))*dt*FEEL/.22);
 {const tg=ow.foot?0:ow.steer*(.55-.3*Math.min(1,Math.abs(P.v)/25));P.stA=P.stA||0;P.stA+=(tg-P.stA)*Math.min(1,dt*14);steerSet(P.obj.children[0],P.stA)}
 if(ow.foot){const s=Math.sin(wk.t),a=Math.min(.9,Math.abs(wk.v)*.4),u=walker.userData;walker.position.set(wk.x,gpcGY,wk.z);walker.rotation.set(u.gm?0:-Math.min(.25,Math.abs(wk.v)*.04),wk.h,0);u.L.rotation.x=s*a;u.R.rotation.x=-s*a;u.AL.rotation.x=-s*a;u.AR.rotation.x=s*a;if(u.gm)u.gm(dt,Math.abs(wk.v));walker.visible=!pov}
 const ya=(ow.foot?ow.cb:T.h)+cyaw,lh=ow.foot?ya:T.h;
 if(pov){const d=ow.foot?.12:.08,hx=T.x-Math.sin(T.h)*d,hy=(ow.foot?1.62:1.52)+gpcGY,hz=T.z-Math.cos(T.h)*d,cl=Math.cos(lpitch);
  cam.fov=78;cam.updateProjectionMatrix();cam.position.set(hx,hy,hz);cam.lookAt(hx-Math.sin(ya)*cl,hy+Math.sin(lpitch),hz-Math.cos(ya)*cl)}
 else if(CAM.mode>=2)camOrbit(T,spd);
 else{const D=cdist*(ow.foot?.85:1)+spd*.02,cp=Math.cos(cpitch),by=(ow.foot?1:.75)+gpcGY;cam.fov=62+Math.min(spd,45)*(ow.foot?.4:.65);cam.updateProjectionMatrix();
  cam.position.set(T.x+Math.sin(ya)*cp*D,by+Math.sin(cpitch)*D,T.z+Math.cos(ya)*cp*D);cam.lookAt(T.x-Math.sin(lh),by+.1,T.z-Math.cos(lh))}
 if(DR.on)droneCam(dt);else camWallClamp(T);
 pl.position.set(T.x,4,T.z);
 $('mt').setAttribute('aria-label',ow.foot?'Naik motor':'Turun motor');$('mt').style.opacity=(ow.foot?Math.hypot(wk.x-ow.x,wk.z-ow.z)<=3.5:P.v<=3)?1:.4;if(ow.foot!==lastFoot){lastFoot=ow.foot;const f=ow.foot;if(f){setWH(0);setSUP(0)}$('w').classList.toggle('foot',f);['bl','br','brk','bn','rv','gas','wh'].forEach(i=>$(i).style.display=f?'none':'flex');$('joy').style.display=f?'block':'none';if(!f)joyReset()}
 {const sp=$('spd');if(sp.__t!==''){sp.__t='';sp.textContent=''}}{const tv=Math.floor(ow.odo);if(tv!==window.__tm){window.__tm=tv;$('tm').textContent=tv.toLocaleString('id-ID')+' m'}}updCoord(DR.on?{x:DR.x,z:DR.z,h:DR.yaw}:(ow.foot?wk:ow));$('rc').textContent='';$('msg').textContent='';
 rpiSet();
 if(osc){gn.gain.value=0}
 draw(dt)}
function goHome(){try{droneOff()}catch(e){}ONL.leave();st='menu';engHush();ow.foot=false;walker.visible=false;pov=false;camSet(0,true);gas=false;inp.l=inp.r=inp.brk=inp.rev=0;reset();setMode('drag');showHome()}
function qAdapt(dt){if(!window.AUTO_GFX)return;qAcc+=dt;const hi=GFX.q==='tinggi';if(++qN<(hi?90:50))return;const avg=qAcc/qN;qAcc=0;qN=0;const fl=hi?1:.75;if(avg>(hi?.027:.024)&&qPR>fl&&!GFX.user){qPR=Math.max(fl,qPR-(hi?.25:.15));renderer.setPixelRatio(qPR);rs()}}
function engHush(){try{if(typeof AC==='undefined'||!AC)return;const t=AC.currentTime;
 if(typeof ENG!=='undefined'&&ENG.ready){const N=ENG.n||{};['idle','gas','burn','full','rev'].forEach(k=>{if(N[k]&&N[k].g)N[k].g.gain.setTargetAtTime(0,t,.04)});ENG.gasPrev=ENG.burnPrev=0;try{if(ENG.dr)drodStop(99)}catch(e){}try{if(ENG.rv)revStop(99)}catch(e){}}
 if(typeof gn!=='undefined'&&gn&&gn.gain)gn.gain.setTargetAtTime(0,t,.04)}catch(e){}}
function loop(n){if(document.hidden)return;const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;if(st==='menu'){if(!window.__hush){window.__hush=1;engHush()}requestAnimationFrame(loop);return}window.__hush=0;qAdapt(dt);try{if(st==='ow'){stepOW(dt);frameOW(dt)}else{step(dt);frame(dt)}}catch(e){console.error(e)}if(!document.hidden)requestAnimationFrame(loop)}
function saveVol(){try{localStorage.setItem('vGame',SND);localStorage.setItem('vMus',MUS)}catch(e){}if(window.MG)MG.gain.value=SND}
function showHome(){if(window.ONL)ONL.leave();const bt=$('boot');if(bt)bt.remove();const h=$('home');h.style.display='flex';ov.style.display='none';ov.style.background='';st='menu';
 $('homeBg').style.backgroundImage='url('+HOME_IMG+')'}
function hideHome(){$('home').style.display='none'}
function tapHome(id,fn){const el=$(id);if(!el)return;el.addEventListener('click',e=>{e.preventDefault();fn()})}
function barWall(){const B=window.BRK;if(!B)return;const o=ow.foot?wk:ow,r=ow.foot?.3:.42,x0=B.x-B.hw,x1=B.x+B.hw;
 const fx=-Math.sin(ow.h),fz=-Math.cos(ow.h);let hit=0;
 for(const dd of(ow.foot?[0]:[.85,0,-.85])){const px=o.x+fx*dd,pz=o.z+fz*dd;
  if(pz<B.z1-r||pz>B.z0+r||px<x0-r||px>x1+r)continue;
  const cx=Math.max(x0,Math.min(x1,px)),cz=Math.max(B.z1,Math.min(B.z0,pz)),dx=px-cx,dz=pz-cz,L=Math.hypot(dx,dz);
  if(L>=r)continue;let nx,nz,push;
  if(L>1e-4){nx=dx/L;nz=dz/L;push=r-L}else{const a=px-x0,c=x1-px;if(a<c){nx=-1;nz=0;push=a+r}else{nx=1;nz=0;push=c+r}}
  o.x+=nx*push;o.z+=nz*push;hit=Math.max(hit,Math.abs(nx*fx+nz*fz))}
 if(!ow.foot&&hit>.2)P.v*=Math.max(0,1-(hit-.2)*.6)}
function polWall(){if(!POL.on)return;const o=ow.foot?wk:ow,r=ow.foot?.3:.42,c=Math.cos(POL.h),sn=Math.sin(POL.h),fx=-Math.sin(ow.h),fz=-Math.cos(ow.h);let hit=0;
 for(const dd of(ow.foot?[0]:[.85,0,-.85])){const px=o.x+fx*dd,pz=o.z+fz*dd,dx=px-POL.x,dz=pz-POL.z;
  if(dx*dx+dz*dz>(POL.hl+POL.hw+r+1)**2)continue;
  const lx=dx*c-dz*sn,lz=dx*sn+dz*c,cx=Math.max(-POL.hw,Math.min(POL.hw,lx)),cz=Math.max(-POL.hl,Math.min(POL.hl,lz)),ex=lx-cx,ez=lz-cz,L=Math.hypot(ex,ez);
  if(L>=r)continue;let nx,nz,push;
  if(L>1e-4){nx=ex/L;nz=ez/L;push=r-L}
  else{const a=lx+POL.hw,b=POL.hw-lx,d1=lz+POL.hl,d2=POL.hl-lz,m=Math.min(a,b,d1,d2);if(m===a){nx=-1;nz=0}else if(m===b){nx=1;nz=0}else if(m===d1){nx=0;nz=-1}else{nx=0;nz=1}push=m+r}
  const wx=nx*c+nz*sn,wz=-nx*sn+nz*c;o.x+=wx*push;o.z+=wz*push;hit=Math.max(hit,Math.abs(wx*fx+wz*fz))}
 if(!ow.foot&&hit>.2)P.v*=Math.max(0,1-(hit-.2)*.6)}
function fuelSave(){try{localStorage.setItem('onarFuel',String(FUEL_L))}catch(e){}}
function fuelUse(m){if(!(m>0)||FUEL_L<=0)return;FUEL_L=Math.max(0,FUEL_L-m/1000*FUEL.lpk);if(FUEL_L<=0&&fuelWas){fuelWas=false;fuelToast('BENSIN HABIS! Dorong ke SPBU Shell untuk isi lagi')}}
function fuelFmtL(n){return n.toLocaleString('id-ID',{minimumFractionDigits:0,maximumFractionDigits:1})}
function fuelRp(n){return 'Rp '+Math.round(n).toLocaleString('id-ID')}
function fuelToast(t){const e=document.getElementById('fuelToast');if(!e)return;e.textContent=t;e.style.display='block';clearTimeout(fuelToast.t);fuelToast.t=setTimeout(()=>{e.style.display='none'},2800)}
function fuelMax(){return Math.max(0,Math.floor(Math.min(60,FUEL.cap-FUEL_L)*10)/10)}
function fuelPanelUI(){
 const mx=fuelMax();fuelAmt=Math.max(0,Math.min(mx,Math.round(fuelAmt*10)/10));
 const cost=Math.round(fuelAmt*FUEL.price),ok=fuelAmt>0&&MONEY>=cost,$q=id=>document.getElementById(id);
 $q('fpAmt').textContent=fuelFmtL(fuelAmt);$q('fpCur').textContent=fuelFmtL(FUEL_L)+' / '+FUEL.cap+' L';
 $q('fpTot').textContent=fuelRp(cost);$q('fpMon').textContent=fuelRp(MONEY);$q('fpPrice').textContent=fuelRp(FUEL.price);$q('fpCap').textContent=FUEL.cap;
 const b=$q('fpOk');b.disabled=!ok;b.textContent=fuelAmt<=0?(mx<=0?'TANGKI PENUH':'ISI 0 L'):(MONEY<cost?'UANG KURANG':'BAYAR & ISI')}
function fuelOpen(){if(fuelPanelOn||ow.foot||P.v>FUEL.maxV*1.5)return;fuelPanelOn=true;P.v=0;P.th=0;fuelAmt=Math.min(10,fuelMax());document.getElementById('fuelPanel').style.display='flex';document.getElementById('fuelBtn').style.display='none';fuelPanelUI()}
function fuelClose(){fuelPanelOn=false;document.getElementById('fuelPanel').style.display='none'}
function fuelPay(){const cost=Math.round(fuelAmt*FUEL.price);if(fuelAmt<=0||MONEY<cost)return;MONEY-=cost;try{saveEco()}catch(e){}
 const n=fuelAmt;FUEL_L=Math.min(FUEL.cap,FUEL_L+n);fuelWas=true;fuelSave();fuelClose();fuelToast('Isi '+fuelFmtL(n)+' L V-Power \u00b7 '+fuelRp(cost))}
function fuelFrame(dt){
 const hud=document.getElementById('fuelHud');if(!hud)return;
 if(hud.style.display!=='block')hud.style.display='block';
 const por=innerHeight>innerWidth;hud.classList.toggle('por',por);
 if(por){if(hud.style.left)hud.style.left='';fuelPosL=-1}
 else if(fuelPosL<0||++fuelPosN%20===0){const n=document.getElementById('drod');if(n){const r=n.getBoundingClientRect();if(r.width){fuelPosL=r.right+6;hud.style.left=fuelPosL+'px'}}}
 // gauge
 const f=Math.max(0,Math.min(1,FUEL_L/FUEL.cap)),n=Math.ceil(f*11-1e-9),key=n+'|'+Math.round(f*400)+'|'+Math.round(FUEL_L*10);
 if(key!==fuelFrame.k){fuelFrame.k=key;
  if(!fuelFrame.bars){fuelFrame.bars=[...hud.querySelectorAll('.fb')];fuelFrame.ar=document.getElementById('fuelArrow');fuelFrame.tx=document.getElementById('fuelTxt')}
  fuelFrame.bars.forEach((b,i)=>b.classList.toggle('on',n>=11-i));
  const yc=230+(1-f)*340;fuelFrame.ar.style.top='calc(var(--u)*'+(yc-44-105)+')';
  fuelFrame.tx.textContent=fuelFmtL(FUEL_L)+' L';hud.classList.toggle('low',f<.15)}
 // tombol ISI BENSIN di zona SPBU
 const inZ=!ow.foot&&!DR.on&&ow.x>=FUEL.x0&&ow.x<=FUEL.x1&&ow.z>=FUEL.z0&&ow.z<=FUEL.z1&&P.v<FUEL.maxV,btn=document.getElementById('fuelBtn');
 if(btn){const sh=inZ&&!fuelPanelOn?'block':'none';if(btn.style.display!==sh)btn.style.display=sh}
 if(!inZ&&fuelPanelOn)fuelClose();
 fuelSaveT+=dt;if(fuelSaveT>2){fuelSaveT=0;fuelSave()}}
function setUN(){const e=$('hUNt');if(e)e.textContent=USERNAME}
function EBUS(){if(!window.EB&&typeof AC!=='undefined'&&AC&&window.MG){try{window.EB=AC.createGain();window.EB.gain.value=1;window.EB.connect(window.MG)}catch(e){}}return window.EB||window.MG}
function engLoop(buf){const s=AC.createBufferSource();s.buffer=buf;s.loop=true;const g=AC.createGain();g.gain.value=0;s.connect(g);g.connect(EBUS());s.start();return{s,g}}
function engShot(buf,vol,rate,dest){const s=AC.createBufferSource();s.buffer=buf;s.playbackRate.value=rate||1;const g=AC.createGain();g.gain.value=vol;s.connect(g);g.connect(dest||EBUS());s.start();return{s,g}}
function relShot(buf,vol,rate){const t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.playbackRate.value=rate;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.09);s.connect(g);g.connect(EBUS());s.start(t);return{s,g}}
function engGrainer(buf,dest,len){const g=AC.createGain();g.gain.value=0;g.connect(dest);return{buf,g,len,rate:1,next:0,last:-1}}
function engGrainRun(G,t){
 if(G.next<t){G.next=t}
 while(G.next<t+.25){
  const d=G.len/G.rate,s=AC.createBufferSource(),e=AC.createGain();
  s.buffer=G.buf;s.playbackRate.value=G.rate;
  let o=Math.random()*(G.buf.duration-G.len*G.rate-.03);if(o<0)o=0;
  e.gain.setValueAtTime(0,G.next);e.gain.setValueCurveAtTime(GW,G.next,d);
  s.connect(e);e.connect(G.g);s.start(G.next,o,G.len*G.rate+.02);
  G.next+=d*(.42+Math.random()*.1)}}
async function engInit(){if(ENG.loading||!AC||!EBUS())return;ENG.loading=1;
 try{const dec=b=>{const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Promise((ok,no)=>AC.decodeAudioData(u.buffer,ok,no))};
  for(const k in ENG_B64)ENG.b[k]=await dec(ENG_B64[k]);
  // jalur burnout: lowpass supaya suara "cit cit" ban lebih halus
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;lp.Q.value=.4;lp.connect(EBUS());ENG.burnF=lp;
  ENG.n.idle=engLoop(ENG.b.idle);ENG.n.gas=engGrainer(ENG.b.gasL,EBUS(),.9);ENG.n.burn=engGrainer(ENG.b.burnL,lp,.5);ENG.n.full=engGrainer(ENG.b.fullL,EBUS(),1.0);
  if(ENG.b.rev){const rb=ENG.b.rev,sr=rb.sampleRate,a=Math.floor(REV_SS*sr),e=Math.floor(REV_SE*sr),sl=AC.createBuffer(1,e-a,sr);sl.copyToChannel(rb.getChannelData(0).slice(a,e),0);ENG.b.revS=sl;ENG.n.rev=engGrainer(sl,EBUS(),1.0)}
  ENG.ready=1}catch(e){console.error(e)}}
function drodStart(kmh){if(!ENG.b.drod)return;if(ENG.dr)drodStop(99);const b=ENG.b.drod,t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();
 s.buffer=b;s.loop=true;s.loopStart=b.duration-2.5;s.loopEnd=b.duration;
 const off=kmh<=3?0:Math.min(b.duration-2.6,kmh/100*b.duration);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.03);s.connect(g);g.connect(EBUS());s.start(t,off);ENG.dr={s,g,t0:t}}
function drodStop(held){const D=ENG.dr;if(!D)return;ENG.dr=null;const t=AC.currentTime,at=held<.5?Math.max(t+.04,D.t0+.3):t+.02;
 try{D.g.gain.setValueAtTime(D.g.gain.value,at);D.g.gain.linearRampToValueAtTime(0,at+.15);D.s.stop(at+.18)}catch(e){}}
function revStart(kmh){if(!ENG.b.rev)return;if(ENG.rv)revStop(99);const b=ENG.b.rev,t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();
 const rp=(P&&P.rpm)||1250,off=rp<=1500?0:Math.min(.9,(rp-1250)/5750*.9),rem=b.duration-off,xf=.6,tx=t+Math.max(.04,rem-xf);
 ENG.gasT=t;s.buffer=b;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.03);g.gain.setValueAtTime(1,tx);g.gain.linearRampToValueAtTime(0,t+rem);
 s.connect(g);g.connect(EBUS());s.start(t,off);ENG.rv={s,g,t0:t,tx}}
function revStop(held){const R=ENG.rv;if(!R)return;ENG.rv=null;const t=AC.currentTime,at=held<.5?Math.max(t+.04,R.t0+.3):t+.02;
 try{R.g.gain.cancelScheduledValues(t);R.g.gain.setValueAtTime(R.g.gain.value,at);const fd=ENG.revFd||.15;R.g.gain.linearRampToValueAtTime(0,at+fd);R.s.stop(at+fd+.03)}catch(e){}}
function engineSound(dt){
 {const dsp=(st==='ow'||st==='race')?'block':'none';['drod','onarr'].forEach(i=>{const e=$(i);if(e)e.style.display=dsp})}{const ce=$('coord');if(ce&&st!=='ow')ce.style.display='none'}{const fe=$('fuelHud');if(fe&&st!=='ow'){fe.style.display='none';const fb=$('fuelBtn');if(fb)fb.style.display='none'}}
 if(!AC||!window.MG)return;if(!ENG.loading)engInit();if(!ENG.ready)return;
 if(AC.state==='suspended')AC.resume();
 const t=AC.currentTime,N=ENG.n,B=ENG.b,set=(n,v,tc)=>n.g.gain.setTargetAtTime(v,t,tc||.1);
 const foot=st==='ow'&&!!ow.foot,on=P&&(st==='race'||st==='ow');
 {const d=foot?Math.hypot(wk.x-ow.x,wk.z-ow.z):0,ag=d<=3?1:Math.max(0,Math.min(1,3.5/(3.5+(d-3)*1.1)));const eb=EBUS();if(eb&&eb.gain&&eb!==window.MG)eb.gain.setTargetAtTime(d>160?0:ag,t,.08)}
 if(!on){set(N.idle,0);set(N.gas,0);set(N.burn,0);ENG.gasPrev=ENG.burnPrev=0;set(N.full,0);if(N.rev)set(N.rev,0);if(ENG.dr)drodStop(99);if(ENG.rv)revStop(99);return}
 const v=P.v||0,th=P.th||0,rpm=P.rpm||1200,r=Math.min(1,Math.max(0,(rpm-1200)/7800));
 const burn=!foot&&st==='ow'&&!!P.burn,gasOn=!foot&&!burn&&th>.2,rate=.75+.9*r,drod=!!ENG.drod&&!burn&&!foot,rev=!drod&&!burn&&!foot&&!!ENG.b.rev;
 if(burn&&!ENG.burnPrev){ENG.burnT=t;engShot(B.burnI,.4,1,ENG.burnF)}
 if(gasOn&&!ENG.gasPrev&&drod){drodStart(v*3.6)}
 else if(gasOn&&!ENG.gasPrev&&rev){revStart(v*3.6)}
 else if(gasOn&&!ENG.gasPrev){if(rpm<4000){ENG.gasT=t;ENG.intro=engShot(B.gasI,.9,rate)}else{ENG.gasT=t-1;ENG.intro=null}}
 // pindah mode saat gas sedang ditahan: nyalakan suara milik mode baru (sebelumnya hening sampai gas dilepas lalu ditekan lagi)
 if(gasOn&&ENG.gasPrev){const g0=ENG.gasT;if(drod&&!ENG.dr)drodStart(v*3.6);else if(rev&&!ENG.rv)revStart(v*3.6);ENG.gasT=g0}
 if(!gasOn&&ENG.gasPrev){const held=t-ENG.gasT;
  if(ENG.intro&&held<.95){/* ketukan singkat: potong suara awal gas jadi pendek "terrr" */const I=ENG.intro,at=Math.max(t+.04,ENG.gasT+.3);try{I.g.gain.setValueAtTime(I.g.gain.value,at);I.g.gain.linearRampToValueAtTime(0,at+.12);I.s.stop(at+.15)}catch(e){}}
  ENG.intro=null;if(ENG.dr)drodStop(held);const hadRev=!!ENG.rv;ENG.revFd=v*3.6>=97?.32:.15;if(ENG.rv)revStop(held);ENG.revFd=0;
  if(!burn&&v>2&&held>.5){const mx=B.rel60?Math.max(0,Math.min(1,(v*3.6-97)/6)):0;/* di bawah 97 km/j suara lama, di atas 103 km/j suara baru, di antaranya dicampur halus */
   if(mx<1)engShot(B.rel,(hadRev?.7:.9)*(1-mx),.85+.35*r);
   if(mx>0){relShot(B.rel60,1.1*mx,.95+.1*r);ENG.relT=t}}}
 const fullOn=gasOn&&!drod&&!rev&&th>.9&&rpm>8200;
 ENG.gasPrev=gasOn;ENG.burnPrev=burn;
 N.gas.rate+=((burn?Math.max(1.4,rate):rate)-N.gas.rate)*.5;
 N.burn.rate=1;
 let gg=0;
 if(burn)gg=.6;
 else if(gasOn)gg=(drod||rev)?0:fullOn?.3:(t-ENG.gasT>.85)?.95:0;
 /* meluncur tanpa gas: suara dari loop idle yang pitch-nya mengikuti RPM (lihat bawah) */
 const bg=burn&&t-ENG.burnT>1.35?.32:0;
 set(N.gas,gg,gasOn&&gg===0?.02:.15);
 set(N.burn,bg,.15);
 set(N.full,fullOn?.9:0,.2);if(fullOn)engGrainRun(N.full,t);
 if(!drod&&ENG.dr)drodStop(99);
 if(!rev&&ENG.rv)revStop(99);
 if(N.rev){const R=ENG.rv,rg=!!R&&gasOn&&t>=R.tx-.05;set(N.rev,rg?.95:0,rg?.18:(v*3.6>=97?.14:.05));if(rg)engGrainRun(N.rev,t)}
 if(gg>0)engGrainRun(N.gas,t);
 if(bg>0)engGrainRun(N.burn,t);
 {const ir=Math.min(2.2,Math.pow(Math.max(1,rpm/1250),.6));N.idle.s.playbackRate.setTargetAtTime(foot?1:ir,t,.07)}
 const dk=ENG.relT?Math.min(1,Math.max(0,(t-ENG.relT-.15)/1.7)):1,du=.25+.75*dk*dk*(3-2*dk);/* suara idle ditahan dulu lalu naik pelan setelah suara lepas gas */
 set(N.idle,foot?.22:(!gasOn&&!burn?(v<4?.75:.55)*du:0),.15)}
function showSettings(from,tab){const fg=from==='game';if(fg)hideHome();ov.style.background=fg?'':'#05060d73';ov.style.display='flex';tab=tab||'g';
 const row=(id,t,v)=>'<div style="margin:18px 0;text-align:left"><div class="tg" style="margin:0 0 8px"><span>'+t+'</span><span id="'+id+'v">'+Math.round(v*100)+'%</span></div><input id="'+id+'" type="range" min="0" max="100" value="'+Math.round(v*100)+'" style="width:100%;height:32px;accent-color:#ffb020"></div>';
 const seg=(id,t,on)=>'<button id="'+id+'" class="'+(on?'on':'')+'">'+t+'</button>';
 const D={rendah:'Untuk HP kentang: resolusi turun, efek blur gerak mati, jarak pandang lebih pendek, suara motor pemain lain dikurangi. Anti-alias (tepi halus) baru mati setelah game dibuka ulang.',normal:'Tampilan standar game seperti sekarang.',tinggi:'Ultra realistis: langit malam bergradasi, bloom (lampu berpendar), warna sinematik + vignette, tekstur lebih realistis, bayangan dinamis, pantulan body motor, bangunan lebih hidup (jendela berkedip, lampu atap, LED), bintang & bulan, lampu depan motor. Sudah dioptimalkan agar ringan; beban otomatis diturunkan bila HP terasa lag.'};
 const side='<div class="stgSide"><button id="stG" type="button" class="stgT'+(tab==='g'?' on':'')+'">GRAFIK</button><button id="stV" type="button" class="stgT'+(tab==='v'?' on':'')+'">VOLUME</button><button id="stH" type="button" class="stgT'+(tab==='h'?' on':'')+'">TAMPILAN</button><button id="stP" type="button" class="stgT'+(tab==='p'?' on':'')+'">PROFILE</button></div>';
 const pane=tab==='g'
  ?'<div style="margin:18px 0;text-align:left"><div class="tg" style="margin:0 0 8px"><span>Kualitas grafik</span></div><div class="gSegs">'+seg('gqR','RENDAH',GFX.q==='rendah')+seg('gqN','NORMAL',GFX.q==='normal')+seg('gqT','TINGGI',GFX.q==='tinggi')+'</div><p id="gqD" style="font-size:12px;opacity:.7;margin:8px 0 0"></p></div>'
   +'<div style="margin:18px 0;text-align:left"><div class="tg" style="margin:0 0 8px"><span>Resolusi</span><span id="grv">'+GFX.res+'</span></div><input id="gr" type="range" min="0" max="100" value="'+GFX.res+'" style="width:100%;height:32px;accent-color:#ffb020"></div>'
  :tab==='h'
  ?[['coord','Koordinat (X Z H)','Kotak posisi di bagian atas layar.']].map(r=>'<div style="margin:14px 0;text-align:left"><div class="tg" style="margin:0 0 6px"><span>'+r[1]+'</span></div><div class="gSegs">'+seg('hu_'+r[0]+'1','ON',HUDS[r[0]])+seg('hu_'+r[0]+'0','OFF',!HUDS[r[0]])+'</div><p style="font-size:12px;opacity:.7;margin:6px 0 0">'+r[2]+'</p></div>').join('')
  :tab==='p'
  ?'<div style="margin:18px 0;text-align:left"><div class="tg" style="margin:0 0 8px"><span>Username</span></div><input id="pfN" class="stgIn" type="text" maxlength="16" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Masukkan username"><p style="font-size:12px;opacity:.7;margin:8px 0 0">Nama yang tampil di game (maks. 16 karakter)</p><button id="pfS" type="button" class="gmB">SIMPAN</button></div>'
  :row('vm','Atur volume musik',MUS)+row('vg','Atur volume game',SND);
 card.innerHTML='<h1>PENGATURAN</h1><div class="stgWrap">'+side+'<div class="stgPane">'+pane+'</div></div><button id="stC" class="gmB">LANJUTKAN</button>';
 if(tab==='g'){
  const sync=()=>{$('gqR').classList.toggle('on',GFX.q==='rendah');$('gqN').classList.toggle('on',GFX.q==='normal');$('gqT').classList.toggle('on',GFX.q==='tinggi');$('gqD').textContent=D[GFX.q]};sync();
  $('gqR').onclick=()=>{gfxSet({q:'rendah',res:Math.min(GFX.res,75)});$('gr').value=GFX.res;$('grv').textContent=GFX.res;sync();try{camToast('Grafik Rendah aktif. Buka ulang game agar anti-alias mati')}catch(e){}};
  $('gqN').onclick=()=>{gfxSet({q:'normal'});sync()};
  $('gqT').onclick=()=>{gfxSet({q:'tinggi'});sync()};
  let tm=0;$('gr').oninput=e=>{const v=Math.max(0,Math.min(100,+e.target.value|0));$('grv').textContent=v;clearTimeout(tm);tm=setTimeout(()=>gfxSet({res:v}),90)}
 }else if(tab==='h'){
  ['coord'].forEach(k=>{const a=$('hu_'+k+'1'),b=$('hu_'+k+'0');
   const set=v=>{HUDS[k]=v?1:0;hudSave();a.classList.toggle('on',!!v);b.classList.toggle('on',!v);try{window.hudApply&&window.hudApply()}catch(e){}};
   a.onclick=()=>set(1);b.onclick=()=>set(0)})
 }else if(tab==='p'){
  const un=$('pfN');un.value=USERNAME;
  ['keydown','keyup','keypress'].forEach(t=>un.addEventListener(t,e=>e.stopPropagation()));
  const save=()=>{const v=un.value.replace(/\s+/g,' ').trim().slice(0,16);if(!v){un.focus();return}USERNAME=v;try{localStorage.setItem('onarUser',v)}catch(e){}try{setUN()}catch(e){}try{ONL.send({n:v})}catch(e){}$('pfS').textContent='TERSIMPAN \u2713'};
  $('pfS').onclick=save;un.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save()}});
 }else{
  $('vm').oninput=e=>{MUS=e.target.value/100;$('vmv').textContent=e.target.value+'%';saveVol()};
  $('vg').oninput=e=>{SND=e.target.value/100;$('vgv').textContent=e.target.value+'%';saveVol()}
 }
 $('stG').onclick=()=>showSettings(from,'g');
 $('stV').onclick=()=>showSettings(from,'v');
 $('stH').onclick=()=>showSettings(from,'h');
 $('stP').onclick=()=>showSettings(from,'p');
 $('stC').onclick=()=>{ov.style.display='none';if(!fg)showHome()}}
function showLicense(){hideHome();ov.style.display='flex';
 const li=t=>'<p style="font-size:13px;margin:10px 0;opacity:.9">'+t+'</p>';
 card.innerHTML='<h1>LICENCY</h1>'+li('Model motor: "Honda Vario 150 0" oleh seenkonkgrng (CC BY 4.0)')+li('Model motor TOKO: "Honda Vario Modification" oleh seenkonkgrng (CC BY 4.0)')+li('Model trotoar: "TROTOAT 1_2X2 M T 10CM" oleh eventdesignws (CC BY 4.0)')+li('Model mobil polisi: "mobil+pak+polisi" oleh eventdesignws (CC BY 4.0)')+li('Model barrier beton: "Barrier béton" oleh aymen kmama (CC BY 4.0)')+li('Model tenda: "TENDA+3X3 FACIA POLOS" oleh eventdesignws (CC BY 4.0)')+'<button id="lcb" class="gmB">KEMBALI</button>';
 $('lcb').onclick=()=>{ov.style.display='none';showHome()}}
function openGameMenu(){
 try{setGas(false)}catch(e){}try{joyReset()}catch(e){}try{inp.l=inp.r=inp.brk=inp.rev=0}catch(e){}
 ov.style.display='flex';
 card.innerHTML='<h1>MENU</h1><button id="gmH" class="gmB">HOME</button><button id="gmS" class="gmB">PENGATURAN</button><button id="gmC" class="gmB gmGhost">LANJUTKAN</button>';
 $('gmH').onclick=()=>{ov.style.display='none';goHome()};
 $('gmS').onclick=()=>showSettings('game');
 $('gmC').onclick=()=>{ov.style.display='none'}}
function showGraphics(fg){showSettings(fg?'game':'home','g')}
function saveChar(){try{localStorage.setItem('dmChar',JSON.stringify(CHSEL))}catch(e){}}
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
function chB64ToBuf(b64,file){ // b64 = data base64 (kalau ada); file = nama file di folder models/ sebagai cadangan (dipakai kalau data base64 kosong/tidak ada)
 const viaFile=()=>file?fetch('models/'+file).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' models/'+file);return r.arrayBuffer()}):Promise.reject(new Error('data model kosong dan tidak ada file cadangan'));
 if(typeof b64!=='string'||b64.length<100)return viaFile();
 return fetch('data:application/octet-stream;base64,'+b64).then(r=>r.arrayBuffer()).catch(()=>{try{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer}catch(e){return viaFile()}})}
function chLoadModel(){if(CHV.loading||CHV.model)return;CHV.loading=true;
 chB64ToBuf(typeof CHAR_GLB_B64!=='undefined'?CHAR_GLB_B64:null,'karakter.glb').then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
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
function LEANK(v){return Math.min(window.LEAN_MAX,window.LEAN_MIN+Math.abs(v)*window.LEAN_RATE)}
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
function gDbg(t){console.log('GLB '+t)}
function gLoad(){if(GCHp)return GCHp;
 GCHp=chB64ToBuf(typeof CHAR_GLB_B64!=='undefined'?CHAR_GLB_B64:null,'karakter.glb').then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no))).then(gl=>{
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
/* ===== akhir fungsi global ===== */
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

addEventListener('resize',rs,{passive:true});addEventListener('orientationchange',()=>setTimeout(rs,180),{passive:true});
if(window.visualViewport)visualViewport.addEventListener('resize',rs,{passive:true});
if(window.ResizeObserver){const glResizeObserver=new ResizeObserver(rs);glResizeObserver.observe(gl)}
rs();
/* ===== GRAFIK: kualitas (normal/tinggi) + resolusi 0-100, disimpan di localStorage 'dmGfx' =====
   Normal = tampilan game yang sekarang (resolusi maks 1.75x, efek blur gerak). Tinggi = Normal + bayangan, pantulan body motor, tekstur detail, bangunan hidup (resolusi maks 2x).
   Resolusi 0-100 = 40%..100% dari batas kualitas. Selama belum disentuh pemain, auto-turun resolusi (qAdapt) tetap jalan seperti dulu. */
window.AUTO_GFX=false; /* false = game TIDAK menurunkan grafik otomatis (resolusi & bayangan). true = perilaku lama */
const GFX={q:'normal',res:100,user:false,blur:false};var hqPR=1;
try{const o=JSON.parse(localStorage.getItem('dmGfx')||'null');if(o&&typeof o==='object'){if(o.q==='rendah'||o.q==='normal'||o.q==='tinggi')GFX.q=o.q;if(typeof o.res==='number'&&o.res>=0&&o.res<=100)GFX.res=Math.round(o.res);GFX.user=!!o.user}}catch(e){}




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


const std=(c,r,m)=>new THREE.MeshStandardMaterial({color:c,roughness:r==null?.8:r,metalness:m||0});
const bas=c=>new THREE.MeshBasicMaterial({color:c});

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


/* Peta lingkungan malam kota (pantulan body motor + jalan basah + kaca gedung) */

/* Material motor -> MeshPhysicalMaterial (clearcoat) dengan pantulan kuat */



/* ---- Bangunan (tower) ---- */





/* ---- Pemindaian objek: bayangan, detail shader, kolam cahaya lampu ---- */

/* ---- Per frame ---- */
const _hqLz=new THREE.Vector3(),_hqLx=new THREE.Vector3(),_hqLy=new THREE.Vector3(),_hqP=new THREE.Vector3(),_hqY=new THREE.Vector3(0,1,0);

/* Governor: kalau frame rate turun, beban Grafik Tinggi diturunkan bertahap (bayangan kecil -> resolusi sedikit turun -> bayangan mati) */





