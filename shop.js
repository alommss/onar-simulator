// ===== LICENCY (kredit / lisensi model 3D), dibuka dari tombol LICENCY di home =====

// ===== MENU DALAM GAME (tombol garis 3): HOME + PENGATURAN =====

// ===== PENGATURAN > GRAFIK: kualitas (normal/tinggi) + resolusi 0-100 =====



// ===== KARAKTER / BAJU / CELANA =====
// Slot baju & celana sengaja KOSONG (null) karena file-nya belum ada.
// Nanti isi slot dengan {id:'baju1',nama:'Jaket Merah'} dst. Slot terisi otomatis bisa dipilih.
const WARDROBE={
 karakter:[{id:'pembalap',nama:'Pembalap'},null,null],
 baju:[null,null,null,null,null,null],
 celana:[null,null,null,null,null,null]
};
let CHSEL={karakter:'pembalap',baju:null,celana:null};
try{const o=JSON.parse(localStorage.getItem('dmChar')||'null');if(o&&typeof o==='object')CHSEL=Object.assign(CHSEL,o)}catch(e){}

// model karakter berdiri (kotak-kotak sewarna rider: jaket merah, celana gelap, helm putih)

const CHV={r:null,sc:null,cam:null,fig:null,raf:0,on:false,yaw:0,drag:null,last:0,w:0,h:0,mixer:null,model:null,loading:false};
// muat model GLB karakter (kerangka 69 tulang + animasi bawaan file). Gagal dimuat -> pakai model kotak cadangan.





const CH_SOON=true; // true = semua slot karakter/baju/celana tampil COMING SOON (belum bisa dipilih). Ubah ke false kalau file sudah ada.

// ===== KENDARAAN (upgrade / modifikasi) =====
// [id, label, jumlah slot]. Semua slot masih KOSONG karena file part belum ada.
const UPG=[['repaint','REPAINT',5],['knalpot','KNALPOT',5],['velg','VELG & BAN',5],['mounting','MOUNTING',5],['downsize','DOWNSIZE',5],['mesin','MESIN',5]];

/* ===== REPAINT: warna BODY / VELG + pemilih warna (HSV) ===== */
var PAINT={b:null,v:null},PAINT_DIRTY=false,PU=null;
try{const o=JSON.parse(localStorage.getItem('dmPaint')||'null');if(o&&typeof o==='object')['b','v'].forEach(k=>{if(typeof o[k]==='string'&&/^#[0-9a-f]{6}$/i.test(o[k]))PAINT[k]=o[k]})}catch(e){}


const PDEF={b:[.92,.14,.6],v:[.74,.74,.76]};
/* KEMIRINGAN MOTOR SAAT BELOK: LEAN_MIN = miring dasar di 0 km/h, LEAN_RATE = tambahan per kecepatan, LEAN_MAX = batas. Naikkan LEAN_MIN/LEAN_RATE kalau masih kurang miring. */
window.LEAN_MIN=.2;window.LEAN_RATE=1/12;window.LEAN_MAX=.5;

/* BODY: selain material 'bodiputi', material berwarna pink muda (area sekitar speedometer) juga ikut di-repaint.
   Kalau masih ada bagian yang tidak berubah, lihat Console (log '[VARIO mat]') lalu isi window.BODY_EXTRA = /namaMaterial/i */
window.BODY_EXTRA=window.BODY_EXTRA||null;



const rgb2hex=a=>'#'+a.map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();


const VH={r:null,sc:null,cam:null,piv:null,src:null,raf:0,on:false,yaw:Math.PI*.62,drag:null,w:0,h:0,px:0};





/* ===== TOKO: Kendaraan / Knalpot / Velg / Ban =====
   Model motor: "Honda Vario Modification" oleh seenkonkgrng (CC BY 4.0) - https://sketchfab.com/3d-models/honda-vario-modification-6a7938c7fa46451e8f9899be7add00a6
   File GLB asli (honda_vario_modification.glb) disimpan UTUH (hanya dikompres gzip tanpa kehilangan data) di file vario_model.js (satu folder dengan game). Mesh, warna, material tidak diubah. */
const SHOP_VEH=[{id:'vario150',nama:'HONDA VARIO 150',ket:'Motor awal kamu (gratis) · '+HPV.hp+' HP',ico:'🛵',harga:0},{id:'vario_mod',nama:'HONDA VARIO MODIFICATION',ket:'Motor modifikasi',ico:'🏍️',harga:25000000}];
const SHOP_CAT=[['kendaraan','KENDARAAN'],['knalpot','KNALPOT'],['velg','VELG'],['ban','BAN']];
const SH={r:null,sc:null,cam:null,piv:null,raf:0,on:false,yaw:Math.PI*.62,drag:null,w:0,h:0,model:null,loading:null,cat:'kendaraan',sel:'vario_mod',failed:false};



const fmtRp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');




/* Susun model TOKO jadi motor yang bisa dikendarai: skala + posisi disamakan dengan motor lama (sumbu roda -0,72 & 0,90),
   roda depan/belakang dipisah supaya berputar. Mesh, warna, material TIDAK diubah. */





tapHome('hSH',()=>showShop());
showHome();

/* Peta lingkungan (pantulan cahaya) buatan sendiri, per renderer, supaya bagian logam motor tampil seperti aslinya (tidak putih pucat) */
const ENVC=new WeakMap();



