/* ===== LAGU LED WALL: volume mengecil saat menjauh dari layar LED =====
   Lagu diputar berulang (loop) selama mode Open World. Volume dihitung dari jarak kamera/pemain ke LEDW (x,z).
   Area musik diperkecil (r0 10->5, r1 140->50). Ubah LEDSND.r0 (jarak masih full, meter), LEDSND.r1 (jarak sunyi total, meter), LEDSND.vol (volume maks 0-1), LEDSND.on=false untuk mematikan. */
window.LEDSND={on:false,r0:5,r1:50,vol:1,curve:2}; /* DIMATIKAN (bikin lag). Ubah on:true untuk menyalakan lagi */
(function(){
 const B64=window.LED_SONG_B64;
 let au=null,cur=0,blocked=false;
 function make(){
  if(au)return au;
  try{const bin=atob(B64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
   au=new Audio(URL.createObjectURL(new Blob([u],{type:'audio/mp4'})));au.loop=true;au.preload='auto';au.volume=0}catch(e){au=null}
  return au}
 function tryPlay(){const a=make();if(!a||!a.paused)return;const p=a.play();if(p&&p.catch)p.catch(()=>{blocked=true})}
 ['pointerdown','touchstart','keydown'].forEach(n=>addEventListener(n,()=>{if(blocked&&typeof st!=='undefined'&&st==='ow'){blocked=false;tryPlay()}},true));
 function vol(){
  const L=window.LEDSND,W=window.LEDW;if(!L||!L.on||!W)return 0;
  let x,z;try{x=cam.position.x;z=cam.position.z}catch(e){try{x=ow.x;z=ow.z}catch(_){return 0}}
  const d=Math.hypot(x-W.x,z-W.z),r0=L.r0,r1=Math.max(L.r1,r0+1);
  const k=Math.max(0,Math.min(1,1-(d-r0)/(r1-r0)));
  let m=1;try{m=typeof MUS==='number'?MUS:1}catch(e){}
  return Math.pow(k,L.curve||2)*L.vol*m}
 function tick(){
  requestAnimationFrame(tick);
  let inOW=false;try{inOW=st==='ow'}catch(e){}
  const L=window.LEDSND;
  if(!inOW||document.hidden||!L||!L.on){if(au&&!au.paused){cur=0;au.volume=0;au.pause()}return}
  const a=make();if(!a)return;
  if(a.paused&&!blocked)tryPlay();
  cur+=(vol()-cur)*.15;               // halus, tanpa loncatan
  a.volume=Math.max(0,Math.min(1,cur))}
 requestAnimationFrame(tick);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&au)au.pause()});
})();
