/* ===== COLOR GRADING v2 (Grafik Tinggi) =====
   Cara pakai: tambahkan <script src="grade.js"></script> di index.html, SETELAH script core.js / race.js.
   Cara kerja: nunggu post-process ULT.mC dibuat game, lalu ganti fragment shader-nya dengan grading baru.
   Aman: shader dites kompilasi dulu di canvas terpisah. Kalau gagal, grading lama tetap dipakai (tidak ada layar hitam).
   Look: night-city sinematik. Bayangan teal-biru, highlight hangat (lampu sodium), vibrance, S-curve lembut,
   blacks sedikit terangkat, bloom hangat, vignette dingin, grain tipis di area gelap.
   Atur kekuatan saat game jalan (console): ULT.mC.uniforms.gs.value = 0..1  (0 = mati, 1 = penuh) */
(function () {
  var FS = [
    'varying vec2 vUv;',
    'uniform sampler2D t;uniform sampler2D b;uniform vec2 res;uniform float tm;',
    'uniform float bk;uniform float vg;uniform float gr;uniform float ca;uniform float gs;',
    'float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    ' vec2 d=vUv-.5;float r2=dot(d,d);vec2 o=d*r2*ca*4.;',
    ' vec3 c=vec3(texture2D(t,vUv+o).r,texture2D(t,vUv).g,texture2D(t,vUv-o).b);',
    ' c+=texture2D(b,vUv).rgb*bk*vec3(1.05,1.0,.93);',
    ' vec3 raw=c;',
    ' float l=dot(c,vec3(.2126,.7152,.0722));',
    ' float sat=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));',
    ' c=mix(vec3(l),c,1.+.26*(1.-clamp(sat,0.,1.)));',
    ' c=clamp(c,0.,1.);',
    ' c=mix(c,c*c*(3.-2.*c),.38);',
    ' c=c*.985+.012;',
    ' float sh=1.-smoothstep(0.,.42,l);float hi=smoothstep(.42,.95,l);',
    ' c+=vec3(-.010,.006,.022)*sh;',
    ' c+=vec3(.030,.012,-.020)*hi;',
    ' float ov=max(max(c.r,max(c.g,c.b))-.86,0.);c-=ov*ov*1.4;',
    ' float v=smoothstep(.10,.62,r2*1.6);',
    ' c*=1.-vg*v;c=mix(c,c*vec3(.90,.95,1.05),v*.5);',
    ' float n=hs(vUv*res+vec2(fract(tm*7.3)*91.7,fract(tm*3.1)*57.3))-.5;',
    ' c+=n*gr*(1.25-l);',
    ' c=mix(raw,c,gs);',
    ' gl_FragColor=vec4(clamp(c,0.,1.),1.);',
    '}'
  ].join('\n');

  // tes kompilasi di canvas terpisah supaya game tidak pernah kena layar hitam
  function compiles() {
    try {
      var cv = document.createElement('canvas'),
          g = cv.getContext('webgl') || cv.getContext('experimental-webgl');
      if (!g) return false;
      var s = g.createShader(g.FRAGMENT_SHADER);
      g.shaderSource(s, 'precision mediump float;\n' + FS);
      g.compileShader(s);
      var ok = !!g.getShaderParameter(s, g.COMPILE_STATUS);
      if (!ok) console.error('grade.js shader:', g.getShaderInfoLog(s));
      return ok;
    } catch (e) { return false; }
  }

  if (!compiles()) return;

  var tries = 0;
  var iv = setInterval(function () {
    try {
      if (typeof ULT !== 'undefined' && ULT && ULT.mC) {
        clearInterval(iv);
        // tuning bloom / vignette / grain / chromatic aberration
        ULT.K.th = .55; ULT.K.bk = .52; ULT.K.vg = .30; ULT.K.gr = .013; ULT.K.ca = .003;
        ULT.mC.fragmentShader = FS;
        ULT.mC.uniforms.gs = { value: 1 };
        ULT.mC.needsUpdate = true;
      } else if (++tries > 2400) {
        clearInterval(iv);
      }
    } catch (e) { clearInterval(iv); console.error('grade.js', e); }
  }, 250);
})();
