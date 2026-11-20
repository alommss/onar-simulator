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
function label(t,w,h,fg,bg){const tx=ctex(256,Math.round(256*h/w),(g,a,b)=>{g.fillStyle=bg;g.fillRect(0,0,a,b);g.fillStyle=fg;g.font='bold '+b*.6+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,a/2,b/2)});return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx}))}
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
/* ===== KEMUDI: stang + garpu + spakbor depan + roda depan ikut belok ===== */
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
const _sA=new THREE.Vector3();
function steerSet(o,ang){const S=o&&o.userData&&o.userData.S;if(!S||!S.userData.ax)return;const a=S.userData.ax;_sA.set(a[0],a[1],a[2]);S.quaternion.setFromAxisAngle(_sA,ang)}
function norm(src){const m=src.clone(true),b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3()),k=1.8/Math.max(s.x,s.z,.01);m.scale.multiplyScalar(k);
 const b2=new THREE.Box3().setFromObject(m),c=b2.getCenter(new THREE.Vector3());m.position.set(-c.x,src.userData.gnd?0:-b2.min.y,-c.z);m.traverse(q=>{if(q.material)[].concat(q.material).forEach(mt=>['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'].forEach(k=>{if(mt[k])mt[k].anisotropy=MAXA}))});const g=new THREE.Group();g.add(m);g.rotation.y=flip?Math.PI:0;const o=new THREE.Group();o.add(g);o.userData.W=[];m.traverse(c=>{if(c.name==='wheel')o.userData.W.push(c);else if(c.name==='steer')o.userData.S=c});return o}
function skin(b,col,jac){b.sk=[col,jac];while(b.obj.children.length)b.obj.remove(b.obj.children[0]);const um=(b.mod!==undefined?!!b.mod:(b.x<0&&VEHSEL==='vario_mod'))&&!!MODG;if(custom||um){const sr=um?MODG:custom,nb=norm(sr);if(sr.userData.hq||sr.userData.lq)envBike(nb,renderer,.55);if(b.x<0)paintApply(nb);b.obj.add(nb);b.obj.add((b.x<0&&typeof gRider==='function'&&gRider(jac))||rider(jac))}else b.obj.add(procBike(col,jac));b.obj.traverse(o=>o.layers.set(1))}

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
function fxResize(w,h){if(!fxReady)return;FW=w;FH=h;
 const rp=renderer.getPixelRatio(),tw=Math.max(2,w*rp|0),th=Math.max(2,h*rp|0);
 if(!RT){const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};
  RT=renderer.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget?new THREE.WebGLMultisampleRenderTarget(tw,th,o):new THREE.WebGLRenderTarget(tw,th,o);RT.texture.encoding=THREE.sRGBEncoding;if('samples' in RT)RT.samples=Math.min(4,renderer.capabilities.maxSamples||4)}
 else RT.setSize(tw,th);
 const pr=(GFX.q==='tinggi'||GFX.q==='rendah')?1:Math.min(devicePixelRatio||1,2);fx.width=w*pr|0;fx.height=h*pr|0;fc.setTransform(pr,0,0,pr,0,0)}
const LN=[];for(let i=0;i<64;i++)LN.push({a:Math.random()*6.283,r:Math.random(),l:Math.random(),w:Math.random()});
/* GARIS NGEBUT 3D: garis-garis angin hidup di dunia (bukan radial di tengah layar), sejajar arah gerak motor yang dihitung dari perpindahan nyata.
   Jadi dari sudut kamera mana pun (samping, depan, belakang, atas) garisnya tetap searah gerakan dan punya perspektif. */
const SLN=72,SL=[];for(let i=0;i<SLN;i++)SL.push({x:0,y:0,z:0,w:Math.random(),l:Math.random(),on:false});
const fxRef=new THREE.Vector3(),fxPrev=new THREE.Vector3(),fxD=new THREE.Vector3(0,0,-1),fxSide=new THREE.Vector3(1,0,0),fxU=new THREE.Vector3(0,1,0),_fa=new THREE.Vector3(),_fb=new THREE.Vector3(),_fc=new THREE.Vector3();let fxHave=false,fxBX=0,fxBY=0;
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
const _oc=[];for(let i=0;i<8;i++)_oc.push(new THREE.Vector3());
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
/* ===== ULTRA REALISTIS (khusus Grafik Tinggi) =====
   1) Langit malam bergradasi + cahaya kota di horizon (menggantikan warna polos).
   2) Post-processing sinematik: bloom (lampu jalan, jendela, lampu motor berpendar), warna sinematik, vignette, chromatic aberration tipis, dither anti-banding.
   Beban dijaga: bloom dihitung di resolusi 1/4. Governor (HQ.lv>=2) otomatis mematikan efek ini kalau HP lag; shader error -> efek mati sendiri.
   Atur tampilan lewat ULT.K: th = ambang cahaya yang berpendar (naikkan = bloom lebih sedikit), bk = kekuatan bloom, vg = vignette, gr = grain halus (0 = mati), ca = chromatic aberration. */
var ULT={ok:true,err:0,sc:null,q:null,mA:null,mB:null,mC:null,r1:null,r2:null,bw:0,bh:0,K:{th:.58,bk:.5,vg:.3,gr:.012,ca:.0035}};
/* ===== PENCAHAYAAN ULTRA (Grafik Tinggi): cahaya bulan dingin + pantulan hangat lampu kota + berkas lampu depan volumetrik ===== */
function ultBeam(){const h=16,g=new THREE.ConeGeometry(3.6,h,24,1,true);g.translate(0,-h/2,0);
 const p=g.attributes.position,c=new Float32Array(p.count*3),k=new THREE.Color(0xffe6bd);
 for(let i=0;i<p.count;i++){const f=Math.pow(Math.max(0,1+p.getY(i)/h),1.6)*.22;c[i*3]=k.r*f;c[i*3+1]=k.g*f;c[i*3+2]=k.b*f}
 g.setAttribute('color',new THREE.BufferAttribute(c,3));g.rotateX(Math.PI/2-.06);
 const m=new THREE.MeshBasicMaterial({vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide});
 const s=new THREE.Mesh(g,m);s.position.set(0,.95,-.55);s.frustumCulled=false;s.visible=false;s.renderOrder=3;s.userData.noCast=1;return s}
function ultSky(){
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthTest:false,depthWrite:false,fog:false,toneMapped:false,
  vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 vD;void main(){float y=normalize(vD).y;vec3 zen=vec3(.010,.018,.050);vec3 mid=vec3(.040,.055,.125);vec3 hor=vec3(.20,.115,.105);vec3 gnd=vec3(.022,.024,.040);vec3 c=y>0.?mix(mix(hor,mid,smoothstep(0.,.16,y)),zen,smoothstep(.10,.70,y)):mix(hor*.30,gnd,smoothstep(0.,.25,-y));c+=vec3(.16,.075,.04)*exp(-abs(y)*16.)*.5;gl_FragColor=vec4(c,1.);}'});
 const s=new THREE.Mesh(new THREE.SphereGeometry(3000,32,16),m);s.frustumCulled=false;s.renderOrder=-1000;s.visible=false;return s}
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
fxReady=true;fxResize(gl.clientWidth,gl.clientHeight);

// ---- asap knalpot (sedikit) ----
const smT=ctex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.5,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const SM=[];for(let i=0;i<90;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smT,color:0xaeb0ba,transparent:true,opacity:0,depthWrite:false}));s.visible=false;s.layers.set(2);scene.add(s);SM.push({s,life:0,max:1,vx:0,vy:0,vz:0,sz:.2,o:.2})}
let smAcc=0;const smV=new THREE.Vector3();
function smoke(dt){
 const ok=P&&P.th>.2&&((st==='race'&&P.fin==null&&!P.dq)||(st==='ow'&&!ow.foot));
 if(ok){smAcc+=dt*(5+8*P.th);
  while(smAcc>=1){smAcc-=1;const p=SM.find(q=>q.life<=0);if(!p)break;
   P.obj.updateMatrixWorld(true);smV.set(.17,.3,.98);P.obj.localToWorld(smV);
   const h=st==='ow'?ow.h:0,bx_=Math.sin(h),bz_=Math.cos(h);
   p.s.material.color.setHex(0xaeb0ba);p.s.position.copy(smV);p.max=p.life=.7+Math.random()*.4;p.sz=.14+Math.random()*.06;p.o=.12+.1*P.th;
   p.vx=bx_*.9+(Math.random()-.5)*.25;p.vz=bz_*.9+(Math.random()-.5)*.25;p.vy=.3+Math.random()*.25;p.s.visible=true}}
 else smAcc=Math.min(smAcc,1);
 for(const p of SM){if(p.life<=0)continue;p.life-=dt;
  if(p.life<=0){p.s.visible=false;p.s.material.opacity=0;continue}
  const t=1-p.life/p.max,k=Math.max(0,1-dt*1.5);p.vx*=k;p.vy*=k;p.vz*=k;
  p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;
  const z=p.sz*(1+t*3.6);p.s.scale.set(z,z,1);
  p.s.material.opacity=p.o*Math.min(1,t*8)*(1-t)}
 burnEmit(dt)}


// ---- pose pembalap (menunduk saat ngebut) & wheelie ----
const WH={on:0,p:0};
function setWH(v){WH.on=v?1:0;$('wh').classList.toggle('on',!!v)}
(function(){const el=$('wh');el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}setWH(1)});
 ['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,()=>setWH(0)));
 addEventListener('keydown',e=>{if(e.code==='KeyQ')setWH(1)});addEventListener('keyup',e=>{if(e.code==='KeyQ')setWH(0)})})();
function santay(){try{return !!ENG.drod}catch(e){return false}}
// ---- pose SUPERMAN (tiarap di jok, kaki lurus ke belakang) dengan animasi transisi ----
const SUP={on:0};
function setSUP(v){SUP.on=v?1:0;const e=$('sup');if(e)e.classList.toggle('on',!!v)}
(function(){const el=$('sup');if(!el)return;
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setSUP(SUP.on?0:1)});
 addEventListener('keydown',e=>{if(e.code==='KeyR'&&!e.repeat)setSUP(SUP.on?0:1)})})();
const SUP_IN=1.15,SUP_OUT=.95; // detik: durasi masuk / keluar pose
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

// ---- RPM realistis, burnout ----
function idleRpm(t){return Math.max(1200,Math.min(1300,1250+24*Math.sin(t*.9)+12*Math.sin(t*2.3+1.1)+8*Math.sin(t*38)+(Math.random()-.5)*6))}
function rpmStep(b,dt,nos){const t=performance.now()/1000,idle=idleRpm(t),v=b.v||0,th=b.th||0;
 if(b.burn){b.rpm+=(8700+Math.sin(t*50)*250-b.rpm)*Math.min(1,dt*9);b.rpm=Math.min(9000,b.rpm);return}
 const sp=Math.min(1,v/34),su=Math.min(1,v/8),coast=v<.3?idle:1700+Math.min(v,34)*55,full=Math.min(9000,5000+2000*su*su*(3-2*su)+1300*Math.pow(sp,1.3)+(nos?700:0));
 let tg=coast+th*(full-coast);if(tg>8850)tg=8850+Math.random()*150;
 if(th<.02&&v<.3&&Math.abs(b.rpm-idle)<40){b.rpm=idle;return}
 b.rpm+=(tg-b.rpm)*Math.min(1,dt*(tg>b.rpm?7:3.2-1.4*Math.min(1,v/6)));b.rpm=Math.max(1200,Math.min(9000,b.rpm))}
function rpmHud(){}
const BN={k:0,a:0,t:0,i:0};
const SKg=new THREE.Group();scene.add(SKg);const SKm=[],skG=new THREE.PlaneGeometry(.2,.5);skG.rotateX(-Math.PI/2);
const skM=new THREE.MeshBasicMaterial({color:0x050505,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
for(let i=0;i<160;i++){const m=new THREE.Mesh(skG,skM);m.visible=false;SKg.add(m);SKm.push(m)}
let TN=null;
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

// ---- layer render & kamera POV mata ----
const CPI=new Set([28,58,59,60,61,79,80,81,82,83,84,91,92]);
cam.layers.mask=7;scene.children.filter(c=>c.isLight).forEach(l=>l.layers.enable(1));
const CW={x:0,v:0,pw:0},camQ=new THREE.Quaternion(),eyeV=new THREE.Vector3(),tmpV=new THREE.Vector3(),baseQ=new THREE.Quaternion(),lookQ=new THREE.Quaternion();
function povKick(dt){const wp=WH.p||0,dw=Math.min(6,Math.max(0,(wp-CW.pw)/Math.max(dt,.001)));CW.pw=wp;
 CW.v+=((wp*.1-CW.x)*140-CW.v*9+dw*2.5)*dt;CW.x+=CW.v*dt;
 camQ.setFromEuler(new THREE.Euler(P.obj.rotation.x*.7+CW.x,P.obj.rotation.y,P.obj.rotation.z*.35,'YXZ'))}
// Posisi kamera POV relatif kepala pembalap: BACK = seberapa jauh mundur ke belakang, UP = naik. Naikkan BACK kalau gas/setang masih belum kelihatan.
const POV_BACK=.015,POV_UP=.05,POV_REF=.87; // POV_REF = sudut badan acuan (.87 = posisi menunduk penuh)
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
// ---- joystick (saat turun dari motor) ----
const joy={x:0,y:0,id:null};
function joyReset(){joy.x=joy.y=0;joy.id=null;const k=$('jk');if(k)k.style.transform=''}
(function(){const el=$('joy'),k=$('jk');
 function upd(e){const r=el.getBoundingClientRect(),mr=r.width/2-10;let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);if(d>mr){dx*=mr/d;dy*=mr/d}joy.x=dx/mr;joy.y=dy/mr;k.style.transform='translate('+dx+'px,'+dy+'px)'}
 el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}joy.id=e.pointerId;upd(e)});
 el.addEventListener('pointermove',e=>{if(joy.id===e.pointerId)upd(e)});
 ['touchstart','touchmove'].forEach(n=>el.addEventListener(n,e=>e.preventDefault(),{passive:false}));
 ['pointerup','pointercancel'].forEach(n=>el.addEventListener(n,e=>{if(joy.id===e.pointerId)joyReset()}))})();

document.addEventListener('touchmove',e=>{if(!(e.target.closest&&e.target.closest('#ov,#vehPaint,#fuelPanel')))e.preventDefault()},{passive:false});

// ---- efek suara UI ----
let SFX=null;
function sfxCtx(){try{if(!SFX)SFX=new(window.AudioContext||window.webkitAudioContext)();if(SFX.state==='suspended')SFX.resume()}catch(e){}return SFX}
function tone(type,f0,f1,dur,vol,lp,at){const c=SFX,t=c.currentTime+(at||0),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*SND),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=o;
 if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.03)}
function uiSound(k){try{if(!SND)return;const c=sfxCtx();if(!c)return;
 if(k==='drag'){tone('square',900,450,.07,.07);tone('sawtooth',80,320,.55,.1,900,.02)}
 else if(k==='ow'){tone('square',900,450,.07,.07);tone('sawtooth',55,200,.65,.1,700,.02)}
 else if(k==='set'){tone('triangle',520,780,.09,.13);tone('triangle',780,1040,.1,.13,0,.08)}
 else tone('square',800,480,.07,.07)}catch(e){}}
addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.hb,#card button');if(!t)return;uiSound(t.id==='hMP'?'ow':t.id==='hOW'?'ow':t.id==='hST'?'set':'click')},true);
// ---- layar penuh ----
const inFS=()=>document.fullscreenElement||document.webkitFullscreenElement;
function goFS(){const e=document.documentElement,f=e.requestFullscreen||e.webkitRequestFullscreen;if(!f||inFS())return;
 try{const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}};const p=f.call(e,{navigationUI:'hide'});if(p&&p.then)p.then(lk).catch(()=>{});else lk()}catch(_){}}
function outFS(){const f=document.exitFullscreen||document.webkitExitFullscreen;try{f&&f.call(document)}catch(_){}try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(_){}}
let fsDone=false;const autoFS=()=>{if(!fsDone)goFS()};['pointerup','click','keydown','touchend'].forEach(n=>addEventListener(n,autoFS,true));goFS();
['fullscreenchange','webkitfullscreenchange'].forEach(n=>document.addEventListener(n,()=>{if(inFS())fsDone=true;setTimeout(rs,120)}));
addEventListener('orientationchange',()=>setTimeout(rs,200));

// ===== game =====
let st='menu',gas=false,P,O,tree,endT=0,best=null,AC,osc,gn;
try{best=parseFloat(localStorage.getItem('dm3d'))||null}catch(e){}
function mk(x,a0,vm,col,jac){const o=new THREE.Group();scene.add(o);const b={x,z:0,v:0,th:0,thT:0,rpm:1250,a0,vm,fin:null,top:0,react:null,nosT:0,nosUsed:false,dq:false,obj:o,tilt:0};skin(b,col,jac);return b}
function reset(){if(P){scene.remove(P.obj);scene.remove(O.obj)}P=mk(-2.2,4.4,33,'#ff9a1f','#7a1c1c');O=mk(2.2,4.2+Math.random()*.5,33+Math.random()*1.5,'#2f9bff','#222a3a');tree={t:0,amb:0,green:false,g0:0,gt:2.5+Math.random()*.5};endT=0;$('nos').classList.remove('off')}
reset();
function audio(){if(osc)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();osc=AC.createOscillator();osc.type='sawtooth';const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;gn=AC.createGain();gn.gain.value=0;osc.connect(f);f.connect(gn);const mg=AC.createGain();mg.gain.value=SND;window.MG=mg;gn.connect(mg);const lm=AC.createDynamicsCompressor();lm.threshold.value=-8;lm.knee.value=10;lm.ratio.value=10;lm.attack.value=.003;lm.release.value=.12;mg.connect(lm);lm.connect(AC.destination);osc.start()}catch(e){osc=null}}
function setGas(on){if(on===gas)return;gas=on;$('gas').classList.toggle('on',on);if(st!=='race'||!on||P.dq)return;if(!tree.green){P.dq=true;endT=0;return}if(P.react==null)P.react=tree.t-tree.g0}
function useNos(){if(st==='race'&&tree.green&&!P.dq&&!P.nosUsed&&P.fin==null){P.nosUsed=true;P.nosT=2.5;$('nos').classList.add('off')}}
$('gas').addEventListener('pointerdown',e=>{e.preventDefault();try{$('gas').setPointerCapture(e.pointerId)}catch(_){}setGas(true)});
['pointerup','pointercancel'].forEach(n=>$('gas').addEventListener(n,()=>setGas(false)));
$('nos').addEventListener('pointerdown',e=>{e.preventDefault();useNos()});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();setGas(true)}if(e.code==='KeyN')useNos()});
addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='ArrowUp')setGas(false)});
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
const card=$('card'),ov=$('ov');
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
let cyaw=0,cpitch=.2,cdist=3.8,drag=null;
// ===== MODE KAMERA: 0 belakang, 1 POV, 2 samping, 3 depan, 4 atas, 5 custom 360° (bebas putar + zoom) =====
const CAM={mode:0,yaw:0,pitch:.35,dist:5,zm:[1,1,1,1,1,1]},CAM_N=['BELAKANG','POV','SAMPING','DEPAN','ATAS','CUSTOM 360°'];
const CB={t:1,p:new THREE.Vector3(),q:new THREE.Quaternion()};
let camTT=0;
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
(function(){const el=$('camb');if(!el)return;
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();camNext()});
 addEventListener('keydown',e=>{if(e.code==='KeyC'&&!e.repeat&&st==='ow')camNext()})})();
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
 const b=$('drn');if(b)b.textContent='✕ KELUAR';
 camToast('DRONE · joystick = maju/mundur/geser · geser layar = arah · kanan = naik/turun')}
function droneOff(){
 if(!DR.on)return;
 DR.on=false;DR.f=DR.b=0;for(const q in DR.k)DR.k[q]=0;
 $('w').classList.remove('drone');joyReset();
 ['dfw','dbk'].forEach(i=>{const e=$(i);if(e)e.classList.remove('on')});
 CB.p.copy(cam.position);CB.q.copy(cam.quaternion);
 camSet(DR.prev,true);CB.t=0; // kembali mulus ke kamera biasa
 const b=$('drn');if(b)b.textContent='🚁 DRONE'}
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
