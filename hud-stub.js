window.hudApply=function(){};

/* ===== TEMBOK GP RACEWAY (selang-seling dengan tembok polos) =====
   Dua model (folder models/): tembok_gp_raceway_20m.glb (muka bergambar "GP RACEWAY") dan tembok_polos_20m.glb.
   Ukuran tiap tembok 20 m x 3 m x 0,3 m. Dipasang berurutan lurus dari titik A ke titik B, urutan: GP, polos, GP, polos, ...
   Koordinat diambil dari kotak "X Z H" di game:  A = X 79,4 / Z -102,9   B = X 97,8 / Z -1123,8
   Ubah angka di bawah untuk menggeser. TEMBOK_GP.on=false untuk mematikan.
   MUKA_BARAT:true = muka bergambar menghadap ke barat (-X, ke arah jalan utama); false = menghadap timur (+X).
   Tabrakan: tiap tembok dimasukkan ke FENCE_RECTS (dibaca pillarWall di core.js), jadi motor & karakter tidak bisa menembus. TABRAK:false = tembus. */
window.TEMBOK_GP={on:true,a:{x:79.4,z:-102.9},b:{x:97.8,z:-1123.8},panjang:20,y:.02,MUKA_BARAT:true,TABRAK:true,tebal:.3};
(function(){try{
 const T=window.TEMBOK_GP;if(!T.on)return;
 if(typeof THREE==='undefined'||typeof owG==='undefined'||typeof chB64ToBuf!=='function'){console.warn('Tembok GP: game belum siap');return}
 const dx=T.b.x-T.a.x,dz=T.b.z-T.a.z,L=Math.hypot(dx,dz),N=Math.max(1,Math.round(L/T.panjang)),seg=L/N;
 const ux=dx/L,uz=dz/L;
 const rotY=Math.atan2(-uz,ux)+(T.MUKA_BARAT?Math.PI:0); // sumbu panjang model (x lokal) searah garis A->B; muka (+z lokal) menghadap barat/timur
 const load=f=>chB64ToBuf(null,f).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no)));
 const night=gl=>gl.scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
  if(m&&m.map){m.emissiveMap=m.map;m.emissive=new THREE.Color(0xffffff);m.emissiveIntensity=.38;m.needsUpdate=true} // malam: angkat sedikit supaya terbaca
  });o.frustumCulled=true});
 Promise.all([load('tembok_gp_raceway_20m.glb'),load('tembok_polos_20m.glb')]).then(([gp,pl])=>{
  night(gp);night(pl);
  const G=new THREE.Group();G.name='tembok_gp';
  window.FENCE_RECTS=window.FENCE_RECTS||[];
  const hl=seg/2,ht=T.tebal/2+.05,c=Math.cos(rotY),s=Math.sin(rotY);
  for(let i=0;i<N;i++){
   const t=(i+.5)/N,cx=T.a.x+dx*t,cz=T.a.z+dz*t;
   const m=(i%2===0?gp:pl).scene.clone(true); // geometri & tekstur dipakai bersama, hemat memori
   m.position.set(cx,T.y,cz);m.rotation.y=rotY;m.scale.x=seg/20;G.add(m);
   if(T.TABRAK){ // kotak tabrakan (sejajar sumbu) yang membungkus tembok miring tipis
    const ex=Math.abs(c)*hl+Math.abs(s)*ht,ez=Math.abs(s)*hl+Math.abs(c)*ht;
    window.FENCE_RECTS.push([cx-ex,cx+ex,cz-ez,cz+ez])}
  }
  owG.add(G);console.log('Tembok GP: '+N+' tembok, '+L.toFixed(1)+' m, tiap '+seg.toFixed(2)+' m');
 }).catch(e=>console.error('Tembok GP',e));
}catch(e){console.error('Tembok GP',e)}})();

/* ===== TANAH GELAP -> TEKSTUR ASPAL JALAN UMUM =====
   Dua bidang penimpa tanah di sisi kiri (X < 18,1; dibuat openworld.js: "HAPUS JALAN" & "HAPUS SEMUA BELOKAN KIRI") memakai warna #17181c polos,
   makanya kelihatan hitam rata. Di sini teksturnya diganti ke aspal yang sama dengan jalan umum (warna #202127 = tanda "aspal" di game,
   jadi dapat butiran, retak & tambalan yang sama). ASPAL_TANAH.on=false untuk mengembalikan seperti semula. */
window.ASPAL_TANAH={on:true};
(function(){try{
 if(!ASPAL_TANAH.on)return;
 if(typeof owG==='undefined'||typeof ctex!=='function'){console.warn('Aspal tanah: game belum siap');return}
 let n=0;
 owG.children.forEach(m=>{
  if(!m.isMesh||!m.geometry||m.geometry.type!=='PlaneGeometry'||!m.geometry.parameters||m.geometry.parameters.width!==20000)return;
  const mt=m.material;if(!mt||Array.isArray(mt)||!mt.map)return;
  const old=mt.map,t=ctex(512,512,(g,w,h)=>{g.fillStyle='#202127';g.fillRect(0,0,w,h);sgrain(g,w,h,2200,.05)},old.repeat.x,old.repeat.y);
  mt.map=t;mt.roughness=.35;mt.metalness=.2;mt.needsUpdate=true;old.dispose();n++});
 console.log('Aspal tanah: '+n+' bidang diganti');
}catch(e){console.error('Aspal tanah',e)}})();

/* ===== PAGAR LANJUTAN (model pagar galvanis yang sama dengan pagar di depan gerbang tol) =====
   Lurus ke arah -Z, melanjutkan pagar kanan (X 36,2) dan pagar sebelahnya (X 26,2): dari Z -570,1 (gambar 2) sampai Z -597,4 (gambar 3).
   Tiap item: x = posisi pagar, z0 = titik awal, z1 = titik akhir. Edit / tambah / hapus item untuk geser. PAGAR_LANJUT.on=false untuk mematikan.
   Tabrakan lewat FENCE_RECTS (sama seperti pagar lain). */
window.PAGAR_LANJUT={on:true,y:.03,list:[{x:36.2,z0:-570.1,z1:-597.4},{x:26.2,z0:-570.1,z1:-597.4}]};
(function(){try{
 const P=window.PAGAR_LANJUT;if(!P.on)return;
 if(typeof THREE==='undefined'||typeof owG==='undefined'||typeof FENCE_B64==='undefined'){console.warn('Pagar lanjutan: game belum siap');return}
 window.FENCE_RECTS=window.FENCE_RECTS||[];
 P.list.forEach(F=>window.FENCE_RECTS.push([F.x-.04,F.x+.04,Math.min(F.z0,F.z1),Math.max(F.z0,F.z1)]));
 const s=atob(FENCE_B64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
 new THREE.GLTFLoader().parse(u.buffer,'',gl=>{try{
  gl.scene.traverse(o=>{if(o.isMesh){const m=o.material;m.metalness=.3;m.roughness=.5;if(m.emissive)m.emissive.setRGB(.1,.11,.13);m.fog=false;m.side=THREE.DoubleSide;m.needsUpdate=true}});
  const PW=3.984,G=new THREE.Group();G.name='pagar_lanjutan';
  P.list.forEach(F=>{const len=Math.abs(F.z0-F.z1),dir=F.z1<F.z0?-1:1,n=Math.max(1,Math.round(len/PW)),pw=len/n;
   for(let i=0;i<n;i++){const c=gl.scene.clone(true);c.scale.set(pw/PW,1,1);c.rotation.y=Math.PI/2;c.position.set(F.x,P.y,F.z0+dir*(i+.5)*pw);G.add(c)}});
  owG.add(G);console.log('Pagar lanjutan: '+P.list.length+' pagar dipasang');
 }catch(e){console.error('Pagar lanjutan',e)}},e=>console.error('Pagar lanjutan gagal dimuat',e));
}catch(e){console.error('Pagar lanjutan',e)}})();
