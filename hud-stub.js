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
