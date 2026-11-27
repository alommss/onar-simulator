/* ===== MONITOR PERFORMA =====
   Buka/tutup: ketuk 5x cepat di pojok kiri-atas layar (area 70x70 px), di menu maupun saat main.
   FPS    = frame per detik rata-rata 1 detik terakhir
   JS     = waktu CPU (JS + kirim perintah gambar) per frame: rata-rata / terburuk
   JANK   = jumlah frame lebih lama dari 20 ms dalam 1 detik terakhir (patah-patah yang terasa)
   DRAW   = jumlah draw call, TRI = jumlah segitiga yang digambar per frame (frame terakhir)
   Cara baca: JS tinggi (>10 ms)  -> beban di CPU/kode game.
              JS rendah tapi FPS turun/JANK banyak -> beban di GPU (resolusi, bloom, bayangan, banyak objek).
   LIM 60 = pembatas 60 FPS aktif (layar 120Hz terdeteksi). */
(function(){
'use strict';
if(typeof document==='undefined'||typeof loop!=='function'||typeof renderer==='undefined')return;
const box=document.createElement('div');
box.style.cssText='position:fixed;left:calc(8px + env(safe-area-inset-left,0px));top:calc(8px + env(safe-area-inset-top,0px));z-index:2147483000;display:none;padding:6px 9px;border-radius:8px;background:#000c;color:#7dffb0;font:700 11px/1.45 ui-monospace,Menlo,monospace;white-space:pre;pointer-events:none;letter-spacing:.02em';
document.body.appendChild(box);
const hot=document.createElement('div');
hot.style.cssText='position:fixed;left:0;top:0;width:70px;height:70px;z-index:2147483001;background:transparent;touch-action:manipulation';
document.body.appendChild(hot);
let on=false;try{on=localStorage.getItem('dmPerf')==='1'}catch(e){}
box.style.display=on?'block':'none';
let taps=[];
hot.addEventListener('pointerdown',e=>{const t=performance.now();taps=taps.filter(x=>t-x<1600);taps.push(t);if(taps.length>=5){taps=[];on=!on;box.style.display=on?'block':'none';try{localStorage.setItem('dmPerf',on?'1':'0')}catch(_){}}});
try{renderer.info.autoReset=false}catch(e){}
let fr=0,sumJs=0,maxJs=0,jank=0,maxGap=0,t0=performance.now(),prev=0,dc=0,tr=0;
const orig=loop;
loop=function(n){
 const a=performance.now();
 try{renderer.info.reset()}catch(e){}
 orig(n);
 const js=performance.now()-a;
 fr++;sumJs+=js;if(js>maxJs)maxJs=js;
 if(prev){const g=n-prev;if(g>maxGap)maxGap=g;if(g>20)jank++}
 prev=n;
 try{dc=renderer.info.render.calls;tr=renderer.info.render.triangles}catch(e){}
 const now=performance.now();
 if(now-t0>=1000){
  if(on){box.textContent='FPS '+(fr*1000/(now-t0)).toFixed(0)+(LIM&&LIM.on?'  LIM 60':'')+'\nJS  '+(sumJs/fr).toFixed(1)+' / '+maxJs.toFixed(0)+' ms\nJANK '+jank+'  (maks '+maxGap.toFixed(0)+' ms)\nDRAW '+dc+'  TRI '+(tr>9999?(tr/1000).toFixed(0)+'k':tr)}
  fr=0;sumJs=0;maxJs=0;jank=0;maxGap=0;t0=now}
};
})();
