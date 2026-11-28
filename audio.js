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

/* ===== KARAKTER UTAMA: Black_Hoodie_Rigged.glb =====
   Taruh file models/Black_Hoodie_Rigged.glb di repo. Kalau ada, dipakai menggantikan karakter lama di SEMUA tempat
   (menu karakter, pembalap di motor, dan karakter jalan kaki). Kalau file tidak ada/rusak -> otomatis pakai karakter lama.
   Dipasang di file ini karena harus aktif SEBELUM models3d.js memanggil gLoad(), dan hanya file ini yang dimuat di antara core.js dan models3d.js.
   Model ini tidak punya tulang HeadTop_End (dipakai game buat ukur tinggi), jadi ditambahkan saat dimuat (ujung kepala setinggi 1,903 m).
   Material diperhalus untuk malam: metalik 0 + sedikit emissive dari tekstur warna supaya hoodie hitam tidak hilang di gelap.
   Matikan dengan window.CHAR_HOODIE=false sebelum game mulai. */
(function(){
 const FILE='Black_Hoodie_Rigged.glb',orig=window.chB64ToBuf;
 if(typeof orig!=='function')return;
 let P=null;
 const fix=buf=>{try{
  const dv=new DataView(buf),jl=dv.getUint32(12,true);
  const js=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl)));
  if(js.nodes.some(n=>n.name==='HeadTop_End'))return buf;
  const hi=js.nodes.findIndex(n=>n.name==='Head');if(hi<0)return buf;
  js.nodes.push({name:'HeadTop_End',translation:[0,.253,0]});
  (js.nodes[hi].children=js.nodes[hi].children||[]).push(js.nodes.length-1);
  const m=js.materials&&js.materials[0];
  if(m&&m.pbrMetallicRoughness){m.pbrMetallicRoughness.metallicFactor=0;
   const bt=m.pbrMetallicRoughness.baseColorTexture;if(bt){m.emissiveFactor=[.2,.2,.2];m.emissiveTexture={index:bt.index,texCoord:0}}}
  const jb=new TextEncoder().encode(JSON.stringify(js)),pad=(4-jb.length%4)%4,jb2=new Uint8Array(jb.length+pad);
  jb2.set(jb);for(let i=0;i<pad;i++)jb2[jb.length+i]=32;
  const rest=new Uint8Array(buf,20+jl),out=new Uint8Array(20+jb2.length+rest.length);
  out.set(new Uint8Array(buf,0,20));out.set(jb2,20);out.set(rest,20+jb2.length);
  const o=new DataView(out.buffer);o.setUint32(8,out.length,true);o.setUint32(12,jb2.length,true);
  return out.buffer}catch(e){console.warn('patch Black Hoodie',e);return buf}};
 const load=()=>P||(P=fetch('models/'+FILE).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' models/'+FILE);return r.arrayBuffer()})
  .then(b=>{if(b.byteLength<1000||new DataView(b).getUint32(0,true)!==0x46546C67)throw new Error('bukan GLB');return fix(b)}));
 window.chB64ToBuf=function(b64,file){
  if(file==='karakter.glb'&&window.CHAR_HOODIE!==false)return load().catch(e=>{console.warn('Black Hoodie tidak dimuat, pakai karakter lama:',e&&e.message||e);return orig(b64,file)});
  return orig(b64,file)};
})();
