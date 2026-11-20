/* ===== ONLINE (Firebase Realtime Database): Open World multiplayer ===== */
const FB_CFG={apiKey:"AIzaSyDJ9FRc8IISZQyI-mQYAv2owiFWl8S0W8c",authDomain:"onar-simulator.firebaseapp.com",databaseURL:"https://onar-simulator-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"onar-simulator",storageBucket:"onar-simulator.firebasestorage.app",messagingSenderId:"509631724111",appId:"1:509631724111:web:c213ecbc2535d34299483a"};
window.ONL=(function(){
 let ROOM='server1';const B='https://www.gstatic.com/firebasejs/10.14.1/',JK=['#7a1c1c','#1c4a7a','#1c7a3a','#7a6a1c','#5a1c7a','#1c7a7a','#7a3a1c'];
 let ownRoom=null,D=null,db=null,uid=null,meRef=null,pRef=null,subs=[],on=false,sT=0,lT=0,lk='',hud=null,hbd=null,cbar=null,clog=null,cin=null,hT=0,cn=0,lastC=0;const pl=new Map();
 const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
 const phash=(k,p)=>p?hash(k+'|'+p)+'.'+hash(p+'#'+k):'';
 function label(name){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.font='700 30px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=6;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(name,128,32);g.fillStyle='#fff';g.fillText(name,128,32);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(2.4,.6,1);s.renderOrder=999;return s}
 function mkGW(){if(typeof GCH==='undefined'||!GCH)return null;try{const m=gClone(GCH.scene),w=new THREE.Group();w.rotation.y=Math.PI;w.add(m);const B={};m.traverse(q=>{if(q.name)B[q.name]=q});const g=new THREE.Group();g.add(w);g.updateMatrixWorld(true);
  const top=g.worldToLocal(B.HeadTop_End?B.HeadTop_End.getWorldPosition(new THREE.Vector3()):new THREE.Vector3(0,1.8,0)).y;w.scale.setScalar(1.78/Math.max(.5,top));
  const an=GCH.animations,F=n=>THREE.AnimationClip.findByName(an,n)||an[0],mx=new THREE.AnimationMixer(m),ac=[F('Idle'),F('Walk'),F('Run')].map(c=>mx.clipAction(c));let cur=0;ac[0].play();
  g.userData.gm=(dt,v)=>{const want=v<.25?0:v<3.6?1:2;if(want!==cur){ac[cur].fadeOut(.2);ac[want].reset().fadeIn(.2).play();cur=want}ac[1].timeScale=Math.max(.6,Math.min(1.8,v/1.5));ac[2].timeScale=Math.max(.7,Math.min(1.5,v/4.2));mx.update(dt)};return g}catch(e){console.error('ONL walker',e);return null}}
 /* ===== SUARA MOTOR PEMAIN LAIN (pakai rekaman yang sama dengan mesin lokal, dengan jarak + panning stereo) ===== */
 const eok=()=>typeof ENG!=='undefined'&&ENG.ready&&typeof AC!=='undefined'&&!!AC&&!!window.MG;
 function newVoice(){const B=ENG.b,out=AC.createGain();out.gain.value=0;let pan=null;try{pan=AC.createStereoPanner();out.connect(pan);pan.connect(EBUS())}catch(e){pan=null;out.connect(EBUS())}
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;lp.Q.value=.4;lp.connect(out);
  const il=AC.createBufferSource();il.buffer=B.idle;il.loop=true;const ig=AC.createGain();ig.gain.value=0;il.connect(ig);ig.connect(out);il.start();
  return{out,pan,lp,il,ig,gas:engGrainer(B.gasL,out,.9),burn:engGrainer(B.burnL,lp,.5),full:engGrainer(B.fullL,out,1.0),rev:B.revS?engGrainer(B.revS,out,1.0):null,gasPrev:0,burnPrev:0,gasT:0,burnT:0,relT:0,intro:null,dr:null,rv:null,revFd:0,muted:false}}
 function vDrodStart(V,kmh){const B=ENG.b;if(!B.drod)return;if(V.dr)vDrodStop(V,99);const b=B.drod,t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.loop=true;s.loopStart=b.duration-2.5;s.loopEnd=b.duration;
  const off=kmh<=3?0:Math.min(b.duration-2.6,kmh/100*b.duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.03);s.connect(g);g.connect(V.out);s.start(t,off);V.dr={s,g,t0:t}}
 function vDrodStop(V,held){const D=V.dr;if(!D)return;V.dr=null;const t=AC.currentTime,at=held<.5?Math.max(t+.04,D.t0+.3):t+.02;try{D.g.gain.setValueAtTime(D.g.gain.value,at);D.g.gain.linearRampToValueAtTime(0,at+.15);D.s.stop(at+.18)}catch(e){}}
 function vRevStart(V,rpm){const B=ENG.b;if(!B.rev)return;if(V.rv)vRevStop(V,99);const b=B.rev,t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain(),off=rpm<=1500?0:Math.min(.9,(rpm-1250)/5750*.9),rem=b.duration-off,xf=.6,tx=t+Math.max(.04,rem-xf);
  V.gasT=t;s.buffer=b;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.03);g.gain.setValueAtTime(1,tx);g.gain.linearRampToValueAtTime(0,t+rem);s.connect(g);g.connect(V.out);s.start(t,off);V.rv={s,g,t0:t,tx}}
 function vRevStop(V,held){const R=V.rv;if(!R)return;V.rv=null;const t=AC.currentTime,at=held<.5?Math.max(t+.04,R.t0+.3):t+.02;try{R.g.gain.cancelScheduledValues(t);R.g.gain.setValueAtTime(R.g.gain.value,at);const fd=V.revFd||.15;R.g.gain.linearRampToValueAtTime(0,at+fd);R.s.stop(at+fd+.03)}catch(e){}}
 function vRelShot(V,buf,vol,rate){const t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.playbackRate.value=rate;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.09);s.connect(g);g.connect(V.out);s.start(t)}
 function muteV(V){V.muted=true;try{if(V.dr)vDrodStop(V,99);if(V.rv)vRevStop(V,99);V.gasPrev=V.burnPrev=0;V.intro=null;V.out.gain.setTargetAtTime(0,AC.currentTime,.05)}catch(e){}}
 function killVoice(V){if(!V)return;try{if(V.dr)vDrodStop(V,99);if(V.rv)vRevStop(V,99);V.il.stop();V.out.disconnect()}catch(e){}}
 function vUpdate(V,r){const t=AC.currentTime,B=ENG.b,set=(n,v,tc)=>n.g.gain.setTargetAtTime(v,t,tc||.1);
  const v=r.v||0,th=r.th||0,rpm=r.rp||1250,rr=Math.min(1,Math.max(0,(rpm-1200)/7800)),foot=!!r.f;
  const burn=!foot&&!!r.bn,gasOn=!foot&&!burn&&th>.2,rate=.75+.9*rr,drod=!!r.dr&&!burn&&!foot,rev=!drod&&!burn&&!foot&&!!B.rev;
  if(burn&&!V.burnPrev){V.burnT=t;engShot(B.burnI,.4,1,V.lp)}
  if(gasOn&&!V.gasPrev&&drod)vDrodStart(V,v*3.6);
  else if(gasOn&&!V.gasPrev&&rev)vRevStart(V,rpm);
  else if(gasOn&&!V.gasPrev){if(rpm<4000){V.gasT=t;V.intro=engShot(B.gasI,.9,rate,V.out)}else{V.gasT=t-1;V.intro=null}}
  if(gasOn&&V.gasPrev){const g0=V.gasT;if(drod&&!V.dr)vDrodStart(V,v*3.6);else if(rev&&!V.rv)vRevStart(V,rpm);V.gasT=g0}
  if(!gasOn&&V.gasPrev){const held=t-V.gasT;
   if(V.intro&&held<.95){const I=V.intro,at=Math.max(t+.04,V.gasT+.3);try{I.g.gain.setValueAtTime(I.g.gain.value,at);I.g.gain.linearRampToValueAtTime(0,at+.12);I.s.stop(at+.15)}catch(e){}}
   V.intro=null;if(V.dr)vDrodStop(V,held);const hadRev=!!V.rv;V.revFd=v*3.6>=97?.32:.15;if(V.rv)vRevStop(V,held);V.revFd=0;
   if(!burn&&v>2&&held>.5){const mx=B.rel60?Math.max(0,Math.min(1,(v*3.6-97)/6)):0;if(mx<1)engShot(B.rel,(hadRev?.7:.9)*(1-mx),.85+.35*rr,V.out);if(mx>0){vRelShot(V,B.rel60,1.1*mx,.95+.1*rr);V.relT=t}}}
  const fullOn=gasOn&&!drod&&!rev&&th>.9&&rpm>8200;V.gasPrev=gasOn;V.burnPrev=burn;
  V.gas.rate+=((burn?Math.max(1.4,rate):rate)-V.gas.rate)*.5;V.burn.rate=1;
  let gg=0;if(burn)gg=.6;else if(gasOn)gg=(drod||rev)?0:fullOn?.3:(t-V.gasT>.85)?.95:0;
  const bg=burn&&t-V.burnT>1.35?.32:0;
  set(V.gas,gg,gasOn&&gg===0?.02:.15);set(V.burn,bg,.15);set(V.full,fullOn?.9:0,.2);if(fullOn)engGrainRun(V.full,t);
  if(!drod&&V.dr)vDrodStop(V,99);if(!rev&&V.rv)vRevStop(V,99);
  if(V.rev){const R=V.rv,rg=!!R&&gasOn&&t>=R.tx-.05;set(V.rev,rg?.95:0,rg?.18:(v*3.6>=97?.14:.05));if(rg)engGrainRun(V.rev,t)}
  if(gg>0)engGrainRun(V.gas,t);if(bg>0)engGrainRun(V.burn,t);
  {const ir=Math.min(2.2,Math.pow(Math.max(1,rpm/1250),.6));V.il.playbackRate.setTargetAtTime(foot?1:ir,t,.07)}
  const dk=V.relT?Math.min(1,Math.max(0,(t-V.relT-.15)/1.7)):1,du=.25+.75*dk*dk*(3-2*dk);
  V.ig.gain.setTargetAtTime(foot?.22:(!gasOn&&!burn?(v<4?.75:.55)*du:0),t,.15)}
 const _cd=new THREE.Vector3(),_sv=new THREE.Vector3();let RSK=null,RSI=0;
 function ensureFx(){if(RSK)return;RSK=[];for(let i=0;i<120;i++){const m=new THREE.Mesh(skG,skM);m.visible=false;SKg.add(m);RSK.push(m)}
  for(let i=0;i<150;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smT,color:0xaeb0ba,transparent:true,opacity:0,depthWrite:false}));s.visible=false;s.layers.set(2);scene.add(s);SM.push({s,life:0,max:1,vx:0,vy:0,vz:0,sz:.2,o:.2})}}
 function voices(){if(!eok())return;const L=ow.foot?wk:ow,ar=[];
  for(const r of pl.values()){r.dist=Math.hypot(r.x-L.x,r.z-L.z);if(r.dist<130)ar.push(r);else if(r.vc&&!r.vc.muted)muteV(r.vc)}
  ar.sort((a,b)=>a.dist-b.dist);cam.getWorldDirection(_cd);const fx=_cd.x,fz=_cd.z,fl=Math.hypot(fx,fz)||1;
  ar.forEach((r,i)=>{if(i>=(GFX.q==='rendah'?2:4)){if(r.vc&&!r.vc.muted)muteV(r.vc);return}
   if(!r.vc)r.vc=newVoice();const V=r.vc;V.muted=false;const d=r.dist;
   const ag=d<=3?1:Math.max(0,Math.min(1,3.5/(3.5+(d-3)*1.1)));V.out.gain.setTargetAtTime(ag*.85,AC.currentTime,.08);
   if(V.pan){const dx=r.x-cam.position.x,dz=r.z-cam.position.z,dd=Math.hypot(dx,dz)||1;V.pan.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,((-fz*dx+fx*dz)/fl)/dd)),AC.currentTime,.1)}
   vUpdate(V,r)})}
 function bubble(text){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');let fs=36;g.font='700 '+fs+'px system-ui,sans-serif';while(g.measureText(text).width>470&&fs>16){fs-=2;g.font='700 '+fs+'px system-ui,sans-serif'}
  const w=Math.min(500,g.measureText(text).width+36);g.fillStyle='rgba(12,16,28,.82)';g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=3;const x=(512-w)/2,y=14,h=60,r=22;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,y+h/2+2);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(4.8,.9,1);s.renderOrder=1000;return s}
 function killBub(r){if(r.bub){if(r.bub.parent)r.bub.parent.remove(r.bub);r.bub.material.map.dispose();r.bub.material.dispose();r.bub=null}}
 function addLog(name,text,me){if(!clog)return;const d=document.createElement('div');d.style.cssText='margin-top:4px;padding:4px 9px;border-radius:9px;background:#0b0f1bb8;color:#fff;font:600 12px/1.25 system-ui,sans-serif;max-width:min(46vw,320px);word-break:break-word;transition:opacity .6s';
  const b=document.createElement('b');b.style.color=me?'#ffcf69':'#7dffc0';b.textContent=name+': ';d.appendChild(b);d.appendChild(document.createTextNode(text));clog.appendChild(d);while(clog.children.length>5)clog.removeChild(clog.firstChild);
  setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),700)},10000)}
 function onMsg(r,text){killBub(r);r.bub=bubble(text);r.bt=performance.now()+7000;addLog(r.n||'Pemain',text,0)}
 function sendChat(){if(!cin)return;const t=cin.value.replace(/\s+/g,' ').trim().slice(0,60);if(!t)return;const now=Date.now();if(now-lastC<1500)return;lastC=now;cn=(cn+1)%1000000;send({cm:t,cn});addLog(USERNAME,t,1);cin.value='';cbar.style.display='none';cin.blur()}
 function makeBike(vm,jac){const b=mk(2.2,0,0,'#2f9bff',jac);
  if(vm&&MODG){b.mod=true;skin(b,'#2f9bff',jac)}
  try{const gr=gRider(jac);if(gr){const old=b.obj.children.find(c=>c.name==='rider');if(old)b.obj.remove(old);b.obj.add(gr)}}catch(e){console.error('ONL rider',e)}
  b.obj.traverse(q=>q.layers.set(0));b.obj.rotation.order='YXZ';return b}
 function rebuildBike(r){const old=r.b.obj,lab=r.lab,bub=r.bub;if(lab&&lab.parent)lab.parent.remove(lab);if(bub&&bub.parent)bub.parent.remove(bub);
  const b=makeBike(r.vm,r.jac);b.obj.position.copy(old.position);b.obj.rotation.copy(old.rotation);scene.remove(old);
  r.b=b;r.vmB=(r.vm&&MODG)?1:0;r.rd=b.obj.children.find(c=>c.name==='rider')||null;r.pb=undefined;r.pv=undefined}
 function syncVeh(r){if(r.vm&&!MODG){ensureModG().then(()=>{pl.forEach(q=>syncVeh(q))}).catch(e=>console.error('ONL mod',e));return}
  if(((r.vm&&MODG)?1:0)!==r.vmB)rebuildBike(r)}
 function drop(id){const r=pl.get(id);if(!r)return;killBub(r);killVoice(r.vc);scene.remove(r.b.obj);scene.remove(r.w);pl.delete(id)}
 function upsert(id,d){if(!d||typeof d.x!=='number'||typeof d.z!=='number')return;let r=pl.get(id);
  if(!r){const jac=JK[hash(id)%JK.length],vm=d.vm?1:0,b=makeBike(vm,jac);
   const w=new THREE.Group();w.visible=false;scene.add(w);
   r={b,w,gw:null,vm,vmB:(vm&&MODG)?1:0,rd:b.obj.children.find(c=>c.name==='rider')||null,jac,n:null,lab:null,x:d.x,z:d.z,h:d.h||0,y:gpcH(d.x,d.z),tx:d.x,tz:d.z,ty:d.h||0,cx:d.wx==null?d.x:d.wx,cz:d.wz==null?d.z:d.wz,wx:d.x,wz:d.z,cwh:d.wh==null?(d.h||0):d.wh,twh:d.h||0,v:0,f:0,seen:0,ck:0,fl:1,fr:1,fph:0,s:0,sa:0,csa:0,bl:0,bk:0,pt:0,wp:0,cwp:0,rz:0,crz:0,su:0,rv:0,bn:0,cn:d.cn||0,pb:undefined,pv:undefined,bub:null,bt:0,ba:0,bm:0,ea:0,vc:null,th:0,rp:1250,dr:0,hy:0,chy:0,dist:999};pl.set(id,r)}
  {const hx=/^#[0-9a-f]{6}$/i,pb=hx.test(d.pb||'')?d.pb:null,pv=hx.test(d.pv||'')?d.pv:null;
   if(r.pb!==pb||r.pv!==pv){r.pb=pb;r.pv=pv;const sv=PAINT;PAINT={b:pb,v:pv};try{paintApply(r.b.obj.children[0])}catch(e){console.error('ONL paint',e)}finally{PAINT=sv}}}
  {r.vm=d.vm?1:0;syncVeh(r)}
  if((d.cn||0)!==r.cn){r.cn=d.cn||0;if(d.cm)onMsg(r,String(d.cm).slice(0,60))}
  r.seen=performance.now();r.tx=d.x;r.tz=d.z;r.ty=d.h||0;r.f=d.f?1:0;r.wx=d.wx==null?d.x:d.wx;r.wz=d.wz==null?d.z:d.wz;r.twh=d.wh==null?r.ty:d.wh;r.v=d.v||0;r.wp=d.wp||0;r.rz=d.rz||0;r.su=d.su?1:0;r.rv=d.rv||0;r.bn=d.bn?1:0;r.th=d.th||0;r.rp=d.rp||1250;r.dr=d.dr?1:0;r.sa=d.sa||0;r.hy=Math.max(-1.4,Math.min(1.4,+d.hy||0));
  const nm=String(d.n||'Pemain').slice(0,16);if(r.n!==nm){r.n=nm;if(r.lab){if(r.lab.parent)r.lab.parent.remove(r.lab);r.lab.material.map.dispose();r.lab.material.dispose()}r.lab=label(nm);r.lab.position.set(0,2.5,0);r.b.obj.add(r.lab)}}
 function send(o){if(!on||!meRef)return;try{D.update(meRef,o).catch(()=>{})}catch(e){}}
 return{
  get on(){return on},
  async connect(){
   if(D&&db&&uid)return;
   if(!this._cp)this._cp=(async()=>{const [A,AU,DB]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-database.js')]);
    const app=(A.getApps&&A.getApps().length)?A.getApp():A.initializeApp(FB_CFG),auth=AU.getAuth(app),db2=DB.getDatabase(app);
    if(!auth.currentUser)await AU.signInAnonymously(auth);
    uid=auth.currentUser.uid;db=db2;D=DB})().catch(e=>{this._cp=null;throw e});
   return this._cp
  },
  async join(room){if(room)ROOM=room;
   const data={n:USERNAME,x:SPAWN.x,z:SPAWN.z,h:SPAWN.h,v:0,f:0,wx:SPAWN.x,wz:SPAWN.z,wh:SPAWN.h,pb:(PAINT&&PAINT.b)||'',pv:(PAINT&&PAINT.v)||'',vm:VEHSEL==='vario_mod'?1:0,t:D.serverTimestamp()};
   meRef=D.ref(db,'rooms/'+ROOM+'/players/'+uid);pRef=D.ref(db,'rooms/'+ROOM+'/players');
   await Promise.race([D.set(meRef,data),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),9000))]);
   D.onDisconnect(meRef).remove();
   const ec=e=>console.error('ONL',e),up=s=>{if(s.key!==uid)upsert(s.key,s.val())};
   subs=[D.onChildAdded(pRef,up,ec),D.onChildChanged(pRef,up,ec),D.onChildRemoved(pRef,s=>drop(s.key),ec)];
   ensureFx();on=true;lk='';sT=lT=hT=0;
   subs.push(D.onValue(D.ref(db,'.info/connected'),s=>{if(s.val()!==true||!on||!meRef)return;
    try{D.onDisconnect(meRef).remove().catch(()=>{});lk=''}catch(e){console.error('ONL reconnect',e)}},e=>console.error('ONL',e)));
   const sa='calc(14px + env(safe-area-inset-left,0px))',st0='env(safe-area-inset-top,0px)';
   hud=document.createElement('div');hud.style.cssText='position:fixed;left:'+sa+';top:calc(182px + '+st0+');z-index:6;display:flex;gap:8px;align-items:center;pointer-events:none';
   hbd=document.createElement('div');hbd.style.cssText='padding:6px 10px;border-radius:10px;background:#0b1f18cc;border:1px solid #5fe3a566;color:#7dffc0;font:800 11px/1 system-ui,sans-serif;letter-spacing:1px';hbd.textContent='● ONLINE · 1 pemain';
   const cb=document.createElement('button');cb.type='button';cb.textContent='💬 CHAT';cb.style.cssText='pointer-events:auto;padding:6px 11px;border-radius:10px;background:#101626cc;border:1px solid #ffffff44;color:#fff;font:800 11px/1 system-ui,sans-serif;letter-spacing:1px;touch-action:manipulation';
   cb.onclick=()=>{cbar.style.display='flex';cin.focus()};hud.append(cb);document.body.appendChild(hud);
   clog=document.createElement('div');clog.style.cssText='position:fixed;left:'+sa+';top:calc(218px + '+st0+');z-index:6;pointer-events:none';document.body.appendChild(clog);
   cbar=document.createElement('div');cbar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:30;display:none;gap:8px;width:min(92vw,460px);padding:8px;border-radius:14px;background:#0e1220f0;border:1px solid #ffffff3a;box-sizing:border-box';
   cin=document.createElement('input');cin.type='text';cin.maxLength=60;cin.placeholder='Ketik pesan…';cin.autocomplete='off';cin.style.cssText='flex:1;min-width:0;min-height:40px;border-radius:10px;border:1px solid #ffffff3a;background:#070912;color:#fff;padding:0 12px;font:600 15px system-ui,sans-serif;outline:none';
   ['keydown','keyup','keypress'].forEach(t=>cin.addEventListener(t,e=>{e.stopPropagation();if(t==='keydown'){if(e.key==='Enter'){e.preventDefault();sendChat()}else if(e.key==='Escape'){cbar.style.display='none';cin.blur()}}}));
   const sb=document.createElement('button');sb.type='button';sb.textContent='KIRIM';sb.style.cssText='min-height:40px;padding:0 16px;border-radius:10px;border:1px solid #ffd18a;background:linear-gradient(180deg,#ffb84d,#f08a22);color:#1a1006;font:900 12px system-ui,sans-serif;letter-spacing:1px';sb.onclick=sendChat;
   const xb=document.createElement('button');xb.type='button';xb.textContent='✕';xb.style.cssText='min-height:40px;width:40px;border-radius:10px;border:1px solid #ffffff3a;background:#1a1f33;color:#fff;font:900 14px system-ui,sans-serif';xb.onclick=()=>{cbar.style.display='none';cin.blur()};
   cbar.append(cin,sb,xb);document.body.appendChild(cbar);cn=0
  },
  leave(){
   if(ownRoom&&D&&db){try{D.remove(D.ref(db,'rooms/'+ownRoom+'/meta')).catch(()=>{})}catch(e){}ownRoom=null}
   if(!on&&!meRef&&!pl.size)return;on=false;subs.forEach(u=>{try{u()}catch(e){}});subs=[];[...pl.keys()].forEach(drop);
   if(meRef){try{D.remove(meRef).catch(()=>{});D.onDisconnect(meRef).cancel()}catch(e){}meRef=null}
   [hud,clog,cbar].forEach(e=>{if(e)e.remove()});hud=hbd=clog=cbar=cin=null
  },
  async createRoom(name,pw){await this.connect();
   const key='r_'+(name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'room'),mr=D.ref(db,'rooms/'+key+'/meta');
   const sn=await D.get(mr);if(sn.exists())throw Object.assign(new Error('Nama room sudah dipakai, coba nama lain.'),{code:'room-exists'});
   await D.set(mr,{n:name,pw:phash(key,pw),o:uid,t:D.serverTimestamp()});ownRoom=key;try{D.onDisconnect(mr).remove()}catch(e){}
   await this.join(key)},
  async count(room){await this.connect();const sn=await D.get(D.ref(db,'rooms/'+room+'/players'));return sn.numChildren()},
  async listRooms(){await this.connect();const sn=await D.get(D.ref(db,'rooms')),out=[];this.cnt={};['server1','server2'].forEach(k=>{this.cnt[k]=sn.child(k+'/players').numChildren()});
   sn.forEach(c=>{const m=c.child('meta').val();if(m&&String(c.key).indexOf('r_')===0)out.push({key:c.key,name:String(m.n||c.key).slice(0,20),lock:!!m.pw,count:c.child('players').numChildren()})});return out},
  async joinRoom(key,pw){await this.connect();const sn=await D.get(D.ref(db,'rooms/'+key+'/meta'));
   if(!sn.exists())throw Object.assign(new Error('Room sudah tidak ada.'),{code:'room-gone'});
   const m=sn.val();if(m.pw&&m.pw!==phash(key,pw||''))throw Object.assign(new Error('Password salah.'),{code:'bad-pass'});
   await this.join(key)},
  send,
  tick(dt){
   if(!on)return;const now=performance.now();
   if(now-sT>=100){sT=now;const f=ow.foot?1:0,x=+ow.x.toFixed(2),z=+ow.z.toFixed(2),h=+ow.h.toFixed(3),wx=f?+wk.x.toFixed(2):x,wz=f?+wk.z.toFixed(2):z,wh=f?+wk.h.toFixed(3):h,v=+(f?Math.abs(wk.v):P.v).toFixed(1),wp=+(WH.p||0).toFixed(3),rz=+(f?0:ow.steer*LEANK(P.v)*.8).toFixed(3),su=(SUP.on&&!f)?1:0,rv=+((f?0:P.rv)||0).toFixed(2),bn=(P.burn&&!f)?1:0,th=+(f?0:(P.th||0)).toFixed(2),rp=Math.round((P.rpm||1250)/25)*25,dr=(typeof ENG!=='undefined'&&ENG.drod)?1:0,sa=+(f?0:(P.stA||0)).toFixed(3),hy=(!f&&pov)?+Math.max(-1.35,Math.min(1.35,Math.atan2(Math.sin(cyaw),Math.cos(cyaw)))).toFixed(2):0,key=[x,z,h,f,wx,wz,wh,wp,rz,su,rv,bn,th,rp,dr,sa,hy].join();
    if(key!==lk||now-lT>3000){lk=key;lT=now;send({n:USERNAME,vm:VEHSEL==='vario_mod'?1:0,pb:(PAINT&&PAINT.b)||'',pv:(PAINT&&PAINT.v)||'',x,z,h,v,f,wx,wz,wh,wp,rz,su,rv,bn,th,rp,dr,sa,hy,t:D.serverTimestamp()})}}
   const L0=ow.foot?wk:ow,LX=L0.x,LZ=L0.z,k=Math.min(1,dt*10);
   for(const [id,r] of pl){
    if(now-r.seen>20000){drop(id);continue}
    {const kh=Math.min(1,dt*14),vel=r.f?0:Math.max(0,r.v||0),ag=Math.min(.35,(now-r.seen)/1000);if(ag<.35){r.x+=-Math.sin(r.h)*vel*dt;r.z+=-Math.cos(r.h)*vel*dt}const pf=vel*(ag+.06),px=r.tx-Math.sin(r.ty)*pf,pz=r.tz-Math.cos(r.ty)*pf,kc=Math.min(1,dt*6);r.x+=(px-r.x)*kc;r.z+=(pz-r.z)*kc;let dh=r.ty-r.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));r.h+=dh*kh}
    if(Math.hypot(r.tx-r.x,r.tz-r.z)>40){r.x=r.tx;r.z=r.tz}
    {const fx=-Math.sin(r.h),fz=-Math.cos(r.h),wH=d=>{const x=r.x+fx*d,z=r.z+fz*d;return Math.max(gpcH(x,z),gpcH(x+fx*.22,z+fz*.22),gpcH(x-fx*.22,z-fz*.22))},Hf=wH(.67),Hr=wH(-.6),tgB=Hr+(Hf-Hr)*.6/1.27;
     r.y+=(tgB-r.y)*Math.min(1,dt*(tgB>r.y?45:18));r.pt+=(Math.atan2(Hf-Hr,1.27)-r.pt)*Math.min(1,dt*12);
     const sp=Math.sin(r.pt),nd=Math.max(Hr-(r.y-sp*.6),Hf-(r.y+sp*.67),0);if(nd>0)r.y+=nd}
    r.csa+=(r.sa-r.csa)*Math.min(1,dt*14);try{steerSet(r.b.obj.children[0],r.csa)}catch(e){}
    r.cwp+=(r.wp-r.cwp)*Math.min(1,dt*10);r.crz+=(r.rz-r.crz)*Math.min(1,dt*10);r.bk+=((r.bn?1:0)-r.bk)*Math.min(1,dt*8);
    const o=r.b.obj;o.visible=true;
    {const wf=r.cwp>.001?r.cwp:0,zr=.65,c=zr*(1-Math.cos(wf));o.position.set(r.x+c*Math.sin(r.h),r.y+zr*Math.sin(wf),r.z+c*Math.cos(r.h))}
    o.rotation.set(r.pt+r.cwp,r.h,r.crz+(r.bk>.01?(Math.random()-.5)*.05*r.bk:0));
    ((o.children[0]&&o.children[0].userData.W)||[]).forEach(w=>{w.rotation.x-=(r.v+r.rv)*dt*FEEL/.22;if(r.bk>.02){w.getWorldPosition(_sv);o.worldToLocal(_sv);if(_sv.z>0)w.rotation.x-=34*dt*r.bk}});
    if(!r.f&&Math.hypot(r.x-LX,r.z-LZ)<100){
     if(r.bn&&r.bk>.5){r.ba+=dt*40;o.updateWorldMatrix(true,false);const bx=Math.sin(r.h),bz=Math.cos(r.h);let n=0;
      while(r.ba>=1&&n++<3){r.ba-=1;const p=SM.find(q=>q.life<=0);if(!p)break;_sv.set((Math.random()-.5)*.18,.08,.66);o.localToWorld(_sv);
       p.s.material.color.setHex(0xe6e6ee);p.s.position.copy(_sv);p.max=p.life=.9+Math.random()*.5;p.sz=.3+Math.random()*.15;p.o=.34;p.vx=bx*1.5+(Math.random()-.5)*1.1;p.vz=bz*1.5+(Math.random()-.5)*1.1;p.vy=.45+Math.random()*.4;p.s.visible=true}
      r.bm+=dt;if(r.bm>.05){r.bm=0;_sv.set(0,.02,.66);o.localToWorld(_sv);const m=RSK[RSI++%RSK.length];m.position.set(_sv.x,r.y+.03,_sv.z);m.rotation.y=r.h;m.visible=true}}
     else if(r.th>.2){r.ea+=dt*(5+8*r.th);o.updateWorldMatrix(true,false);const bx=Math.sin(r.h),bz=Math.cos(r.h);let n=0;
      while(r.ea>=1&&n++<2){r.ea-=1;const p=SM.find(q=>q.life<=0);if(!p)break;_sv.set(.17,.3,.98);o.localToWorld(_sv);
       p.s.material.color.setHex(0xaeb0ba);p.s.position.copy(_sv);p.max=p.life=.7+Math.random()*.4;p.sz=.14+Math.random()*.06;p.o=.12+.1*r.th;p.vx=bx*.9+(Math.random()-.5)*.25;p.vz=bz*.9+(Math.random()-.5)*.25;p.vy=.3+Math.random()*.25;p.s.visible=true}}
     else r.ea=Math.min(r.ea,1)}
    if(r.rd){r.rd.visible=!r.f;const u=r.rd.userData;if(u.pose){
     r.cr=r.v>(r.cr?7.5:8.33);let tg=r.cr?1:0;if(r.bn)r.bl=2.2;else if(r.bl>0)r.bl-=dt;if(r.bl>0)tg=1;if(r.cwp>.15)tg=-.35;
     const rm=Math.max(0,Math.min(1,-r.rv/1.3));r.fd=r.fd?r.v<.7:r.v<.35;const up=r.cwp>.1||r.su;
     const tl=(!up&&!r.bn&&(r.fd||rm>.01))?1:0,tr=(!up&&(r.bn||r.fd||rm>.01))?1:0;
     r.fl+=(tl-r.fl)*Math.min(1,dt*10);r.fr+=(tr-r.fr)*Math.min(1,dt*10);r.fph+=Math.abs(r.rv)*dt/.5;r.ck+=(tg-r.ck)*Math.min(1,dt*7);
     r.chy+=(r.hy-r.chy)*Math.min(1,dt*10);const sg=r.su?1:0;if(r.s<sg)r.s=Math.min(sg,r.s+dt/1.15);else if(r.s>sg)r.s=Math.max(sg,r.s-dt/.95);
     if(u.k===undefined||Math.abs(r.chy-(u.hy||0))>.02||Math.abs(r.ck-u.k)>.003||Math.abs(r.s-(u.s||0))>.0004||Math.abs(r.fl-(u.fl||0))>.004||Math.abs(r.fr-(u.fr||0))>.004||rm>.001||Math.abs(rm-(u.rm||0))>.001||Math.abs(r.csa-(u.sa||0))>.004){u.hy=r.chy;u.k=r.ck;u.s=r.s;u.fl=r.fl;u.fr=r.fr;u.rm=rm;u.sa=r.csa;u.str={a:r.csa,S:r.b.obj.children[0]&&r.b.obj.children[0].userData.S};u.pose(r.ck,r.s,{l:r.fl,r:r.fr,rv:rm,ph:r.fph})}}}
    r.cx+=(r.wx-r.cx)*k;r.cz+=(r.wz-r.cz)*k;r.w.visible=!!r.f;
    if(r.f){if(!r.gw&&!r.gwT){r.gwT=1;const g=mkGW();if(g){r.gw=g;r.w.add(g)}else{const bd=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,1,10),std(r.jac,.7)),hd=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),std('#e0b090',.7));bd.position.y=.65;hd.position.y=1.35;r.w.add(bd,hd)}}
     let dw=r.twh-r.cwh;dw=Math.atan2(Math.sin(dw),Math.cos(dw));r.cwh+=dw*k;r.w.position.set(r.cx,gpcH(r.cx,r.cz),r.cz);r.w.rotation.y=r.cwh;
     if(r.gw&&r.gw.userData.gm)r.gw.userData.gm(dt,r.v)}
    if(r.lab){const par=r.f?r.w:o,ly=r.f?(r.gw?2.2:1.9):2.5;if(r.lab.parent!==par){par.add(r.lab)}r.lab.position.set(0,ly,0);if(r.bub){if(now>r.bt)killBub(r);else{if(r.bub.parent!==par)par.add(r.bub);r.bub.position.set(0,ly+.85,0)}}}
   }
   try{voices()}catch(e){console.error('ONL suara',e)}
   if(hbd&&now-hT>1000){hT=now;hbd.textContent='● ONLINE · '+(pl.size+1)+' pemain'}
  },
  err(e){const c=(e&&e.code)||'',m=(e&&e.message)||'';
   if(/^(room-exists|bad-pass|room-gone)$/.test(c))return m;
   if(/operation-not-allowed|admin-restricted/.test(c))return 'Login Anonymous belum diaktifkan di Firebase (Authentication → Sign-in method).';
   if(/unauthorized-domain/.test(c))return 'Domain game belum diizinkan di Firebase (Authentication → Settings → Authorized domains).';
   if(/PERMISSION_DENIED|permission/i.test(c+m))return 'Ditolak oleh aturan database. Cek Rules di Firebase.';
   if(/network|import|fetch|timeout|Failed/i.test(c+m))return 'Tidak bisa terhubung. Periksa internet lalu coba lagi.';
   return 'Gagal: '+(c||m||'tidak diketahui')}
 }
})();
/* ===== ONLINE + USERNAME ===== */
let USERNAME='Pemain';try{const u=localStorage.getItem('onarUser');if(u&&u.trim())USERNAME=u.trim().slice(0,16)}catch(e){}

setUN();
{const un=$('unIn'),ms=['onScr','unScr'];
 const open=id=>{$(id).classList.add('on')},close=id=>{$(id).classList.remove('on')};
 ['keydown','keyup','keypress'].forEach(t=>un.addEventListener(t,e=>{e.stopPropagation();if(t==='keydown'){if(e.key==='Enter'){e.preventDefault();saveUN()}else if(e.key==='Escape')close('unScr')}}));
 function saveUN(){const v=un.value.replace(/\s+/g,' ').trim().slice(0,16);if(!v){un.focus();return}USERNAME=v;try{localStorage.setItem('onarUser',v)}catch(e){}setUN();ONL.send({n:v});close('unScr')}
 tapHome('onClose',()=>close('onScr'));
 tapHome('hUN',()=>{un.value=USERNAME;open('unScr');setTimeout(()=>{un.focus();un.select()},60)});
 tapHome('unCancel',()=>close('unScr'));tapHome('unSave',saveUN);
 ms.forEach(id=>$(id).addEventListener('click',e=>{if(e.target.id===id)close(id)}));
 {const setSt=t=>{const e=$('onSt');if(e)e.textContent=t};let busy=false;
  tapHome('srv1',async()=>{if(busy)return;busy=true;setSt('Menghubungkan…');
   try{await ONL.connect();await ONL.join();setSt('');close('onScr');audio();reset();setMode('ow');cyaw=0;cpitch=.25;startOW();st='ow';hideHome()}
   catch(e){console.error(e);ONL.leave();setSt(ONL.err(e))}
   busy=false})}}
(function(){const $q=id=>document.getElementById(id),on=id=>$q(id).classList.add('on'),off=id=>$q(id).classList.remove('on');
 const setS=t=>{$q('mpSt').textContent=t||''};let busy=false,pend=null;
 const enter=()=>{off('mpScr');off('mpMk');off('mpPw');audio();reset();setMode('ow');cyaw=0;cpitch=.25;startOW();st='ow';hideHome()};
 async function go(fn,setT){if(busy)return;busy=true;setT('Menghubungkan\u2026');
  try{await fn();setT('');enter()}catch(e){console.error(e);try{ONL.leave()}catch(_){}setT(ONL.err(e))}busy=false}
 const setCnt=()=>{if(!ONL.cnt)return;[['mpS1','server1'],['mpS2','server2']].forEach(([id,k])=>{const el=$q(id).querySelector('small');if(el)el.textContent='\u25CF '+ONL.cnt[k]+' pemain'})};
 async function loadRooms(first){const box=$q('mpRooms');if(first)box.innerHTML='';
  try{const r=await ONL.listRooms();setCnt();
   if(!r.length){box.innerHTML='<p style="margin:14px 0 0;opacity:.7">Belum ada room.</p>';return}
   const f=document.createDocumentFragment(),h=document.createElement('p');h.style.margin='14px 0 0';h.textContent='ROOM TERSEDIA';f.appendChild(h);
   r.forEach(x=>{const b=document.createElement('button');b.type='button';b.className='srv';b.innerHTML='<i></i><span></span><small></small>';
    b.children[1].textContent=(x.lock?'\uD83D\uDD12 ':'')+x.name;b.children[2].textContent=x.count+' pemain';
    b.addEventListener('click',()=>{if(x.lock){pend=x;$q('pwN').textContent=x.name;$q('pwI').value='';$q('pwSt').textContent='';on('mpPw');setTimeout(()=>$q('pwI').focus(),60)}else go(()=>ONL.joinRoom(x.key,''),setS)});f.appendChild(b)});
   box.innerHTML='';box.appendChild(f)}
  catch(e){console.error(e);const c=String((e&&e.code)||'')+' '+String((e&&e.message)||'');
   box.innerHTML='<p style="margin:14px 0 0;color:#ffb0a0">'+(/permission/i.test(c)?'Daftar room ditolak Firebase: aturan (Rules) belum dipasang.':'Gagal memuat daftar room.')+'</p>'}}
 async function loadCounts(){for(const [id,room] of [['mpS1','server1'],['mpS2','server2']]){const el=$q(id).querySelector('small');if(!el)continue;el.textContent='…';
   try{const n=await ONL.count(room);el.textContent='● '+n+' pemain'}catch(e){console.error(e);const c=String((e&&e.code)||'')+' '+String((e&&e.message)||'');el.textContent=(ONL.cnt&&ONL.cnt[room]!=null)?'● '+ONL.cnt[room]+' pemain':(/permission/i.test(c)?'ditolak':'?')}}}
 window.mpOpen=()=>{setS('');on('mpScr');loadRooms(true);loadCounts();clearInterval(window._rl);window._rl=setInterval(()=>{if($q('mpScr').classList.contains('on'))loadRooms();else clearInterval(window._rl)},5000)};
 tapHome('hMP',()=>window.mpOpen());
 tapHome('mpS1',()=>go(()=>ONL.connect().then(()=>ONL.join('server1')),setS));
 tapHome('mpS2',()=>go(()=>ONL.connect().then(()=>ONL.join('server2')),setS));
 tapHome('mpNew',()=>{$q('mkSt').textContent='';on('mpMk');setTimeout(()=>$q('mkN').focus(),60)});
 tapHome('mpClose',()=>off('mpScr'));tapHome('mkCancel',()=>off('mpMk'));tapHome('pwCancel',()=>off('mpPw'));
 tapHome('mkGo',()=>{const n=$q('mkN').value.replace(/\s+/g,' ').trim().slice(0,20);if(!n){$q('mkSt').textContent='Isi nama room dulu.';$q('mkN').focus();return}
  go(()=>ONL.createRoom(n,$q('mkP').value.slice(0,20)),t=>{$q('mkSt').textContent=t})});
 tapHome('pwGo',()=>{if(!pend)return;const x=pend;go(()=>ONL.joinRoom(x.key,$q('pwI').value),t=>{$q('pwSt').textContent=t})});
 ['mpScr','mpMk','mpPw'].forEach(id=>$q(id).addEventListener('click',e=>{if(e.target.id===id)off(id)}));
 ['mkN','mkP','pwI'].forEach(id=>['keydown','keyup','keypress'].forEach(t=>$q(id).addEventListener(t,e=>{e.stopPropagation();if(t==='keydown'&&e.key==='Enter'){e.preventDefault();$q(id==='pwI'?'pwGo':'mkGo').click()}})))})();
tapHome('hCH',()=>showCharacter());
tapHome('hVH',()=>showVehicle());

