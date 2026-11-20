/* ===== Suara mesin dari rekaman (idle, gas, lepas gas, burnout) ===== */
const ENG={loading:0,ready:0,b:{},n:{},gasPrev:0,burnPrev:0,gasT:0,burnT:0};
function EBUS(){if(!window.EB&&typeof AC!=='undefined'&&AC&&window.MG){try{window.EB=AC.createGain();window.EB.gain.value=1;window.EB.connect(window.MG)}catch(e){}}return window.EB||window.MG}
function engLoop(buf){const s=AC.createBufferSource();s.buffer=buf;s.loop=true;const g=AC.createGain();g.gain.value=0;s.connect(g);g.connect(EBUS());s.start();return{s,g}}
function engShot(buf,vol,rate,dest){const s=AC.createBufferSource();s.buffer=buf;s.playbackRate.value=rate||1;const g=AC.createGain();g.gain.value=vol;s.connect(g);g.connect(dest||EBUS());s.start();return{s,g}}
// Granular: potongan acak dari rekaman saling bertumpuk (cross-fade) -> suara panjang tanpa terdengar mengulang
// suara lepas gas kecepatan tinggi: masuk perlahan (bukan langsung), supaya menyatu dengan suara mesin sebelumnya
function relShot(buf,vol,rate){const t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.playbackRate.value=rate;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.09);s.connect(g);g.connect(EBUS());s.start(t);return{s,g}}
const GW=(()=>{const a=new Float32Array(64);for(let i=0;i<64;i++)a[i]=Math.sin(Math.PI*i/63);return a})();
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
// ===== MODE SANTAYY: rekaman 8 detik; mulai dari 0 kalau baru jalan, kalau sudah melaju mulai dari posisi sesuai kecepatan =====
function drodStart(kmh){if(!ENG.b.drod)return;if(ENG.dr)drodStop(99);const b=ENG.b.drod,t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();
 s.buffer=b;s.loop=true;s.loopStart=b.duration-2.5;s.loopEnd=b.duration;
 const off=kmh<=3?0:Math.min(b.duration-2.6,kmh/100*b.duration);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.03);s.connect(g);g.connect(EBUS());s.start(t,off);ENG.dr={s,g,t0:t}}
function drodStop(held){const D=ENG.dr;if(!D)return;ENG.dr=null;const t=AC.currentTime,at=held<.5?Math.max(t+.04,D.t0+.3):t+.02;
 try{D.g.gain.setValueAtTime(D.g.gain.value,at);D.g.gain.linearRampToValueAtTime(0,at+.15);D.s.stop(at+.18)}catch(e){}}
// ===== SUARA GAS UTAMA (rekaman motor, outro TikTok sudah dipotong): main dari awal sampai habis; kalau gas masih ditahan -> disambung granular dari bagian stabil (REV_SS..REV_SE detik) =====
const REV_SS=2.5,REV_SE=7.6;
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

(function(){const b=document.getElementById('drod'),n=document.getElementById('onarr');
 // dua mode: SANTAYY (pelan, maks ~61 km/j, tanpa nunduk/efek ngebut) dan ONARR (normal); hanya satu yang menyala
 const setM=v=>{ENG.drod=v?1:0;b.classList.toggle('on',!!v);n.classList.toggle('on',!v);try{localStorage.setItem('drod',v?'1':'0')}catch(_){}if(!v&&ENG.dr)drodStop(99)};
 let init=false;try{init=localStorage.getItem('drod')==='1'}catch(e){}
 setM(init);
 b.addEventListener('pointerdown',e=>{e.preventDefault();setM(1)});
 n.addEventListener('pointerdown',e=>{e.preventDefault();setM(0)})})();
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
