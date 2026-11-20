/* ===== Suara mesin dari rekaman (idle, gas, lepas gas, burnout) ===== */
const ENG={loading:0,ready:0,b:{},n:{},gasPrev:0,burnPrev:0,gasT:0,burnT:0};



// Granular: potongan acak dari rekaman saling bertumpuk (cross-fade) -> suara panjang tanpa terdengar mengulang
// suara lepas gas kecepatan tinggi: masuk perlahan (bukan langsung), supaya menyatu dengan suara mesin sebelumnya

const GW=(()=>{const a=new Float32Array(64);for(let i=0;i<64;i++)a[i]=Math.sin(Math.PI*i/63);return a})();



// ===== MODE SANTAYY: rekaman 8 detik; mulai dari 0 kalau baru jalan, kalau sudah melaju mulai dari posisi sesuai kecepatan =====


// ===== SUARA GAS UTAMA (rekaman motor, outro TikTok sudah dipotong): main dari awal sampai habis; kalau gas masih ditahan -> disambung granular dari bagian stabil (REV_SS..REV_SE detik) =====
const REV_SS=2.5,REV_SE=7.6;




(function(){const b=document.getElementById('drod'),n=document.getElementById('onarr');
 // dua mode: SANTAYY (pelan, maks ~61 km/j, tanpa nunduk/efek ngebut) dan ONARR (normal); hanya satu yang menyala
 const setM=v=>{ENG.drod=v?1:0;b.classList.toggle('on',!!v);n.classList.toggle('on',!v);try{localStorage.setItem('drod',v?'1':'0')}catch(_){}if(!v&&ENG.dr)drodStop(99)};
 let init=false;try{init=localStorage.getItem('drod')==='1'}catch(e){}
 setM(init);
 b.addEventListener('pointerdown',e=>{e.preventDefault();setM(1)});
 n.addEventListener('pointerdown',e=>{e.preventDefault();setM(0)})})();

