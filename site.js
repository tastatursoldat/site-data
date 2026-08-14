// site.js — michelelsasser.com  (hosted in tastatursoldat/site-data, loaded by Cargo)
// Loads the Vimeo Player SDK, then runs the full overlay app.
// Landing = DIAL canvas (every film is a live clock). Index + player unchanged.
(function(){
  if(!window.Vimeo){
    var s=document.createElement('script');
    s.src='https://player.vimeo.com/api/player.js';
    s.onload=boot; document.head.appendChild(s);
  } else { boot(); }
  function boot(){
(function(){
  var existingVp=document.querySelector('meta[name="viewport"]');
  if(existingVp) existingVp.remove();
  var vp=document.createElement('meta'); vp.name='viewport';
  vp.content='width=device-width, initial-scale=1, viewport-fit=cover';
  document.head.appendChild(vp);
  document.title='DIAL — Michel Elsasser';
  var DATA_URL     = "https://cdn.jsdelivr.net/gh/tastatursoldat/site-data@main/website-projects.json";
  var MUSIC_PLAYLIST = "PLAMrTQJLnU5E"; // YouTube playlist id for the radio
  var RADIO_URL    = "https://cdn.jsdelivr.net/gh/tastatursoldat/site-data@main/radio.json"; // khz + note per track
  var ABOUT_EMAIL  = "m@michelelsasser.com";
  var ABOUT_INSTAGRAM = "@michelelsasser";
  var ABOUT_TEXT =
    "Hi, I’m Michel. I’m a Swiss director based in Zurich. Born near Baden, I grew up in a small "+
    "room shared with my brother, where tight space and visual noise shaped my eye for order. "+
    "Self-taught, I developed a monochrome, minimal discipline – structure, muted palettes, and open space.\n\n"+
    "I started in fashion, writing and directing campaigns before moving into film. I work across "+
    "commercials, music videos, and films.\nUncluttered frames. Documentary or scripted.";
  var FONT='"Helvetica Neue",Helvetica,Arial,sans-serif';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var st=document.createElement('style');
  st.textContent =
    'html,body{overflow:hidden !important;height:100% !important;}'+
    '#me-app{position:fixed;inset:0;background:#EFEFEC;z-index:2147483000;overflow:hidden;font-family:'+FONT+';color:#111;'+
      '-webkit-font-smoothing:antialiased;}'+
    // dial landing
    '#me-dial{position:absolute;inset:0;}'+
    '#me-app.browse #me-dial{display:none !important;}'+
    '#me-field{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:default;}'+
    '#me-brand{position:fixed;top:1.15rem;left:1.2rem;z-index:10;font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;}'+
    '#me-ctrl{position:fixed;top:1.15rem;right:1.2rem;z-index:10;display:flex;gap:1.1rem;align-items:center;}'+
    '#me-ctrl button,#me-corner button{font:inherit;border:0;background:none;cursor:pointer;padding:0;}'+
    '#me-ctrl .txt,#me-corner .txt{font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '#me-ctrl .icon,#me-corner .icon{color:#0a0a0a;display:flex;align-items:center;}'+
    '#me-ctrl .icon svg,#me-corner .icon svg{width:15px;height:15px;}'+
    /* the bottom-right corner is the radio's home: the word radio, or —
       while a song plays — the pause glyph and the title in its place */
    '#me-corner{position:fixed;right:1.2rem;bottom:1.05rem;z-index:10;display:flex;gap:.8rem;align-items:center;}'+
    '#me-corner #me-stop{display:none;}'+
    '#me-app.radio-on #me-stop{display:flex;}'+
    '#me-music{font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;'+
      'min-height:1em;max-width:44vw;white-space:nowrap;overflow:hidden;display:none;}'+
    '#me-app.titled #me-music{display:block;}'+
    '#me-app.titled #me-corner #me-radio{display:none;}'+
    '#me-music .in{display:inline-block;white-space:nowrap;}'+
    '#me-music.scroll .in{animation:me-marq 6s ease-in-out infinite alternate;}'+
    '@keyframes me-marq{from{transform:translateX(0);}to{transform:translateX(var(--me-shift,0px));}}'+
    /* the hover title moved to the free bottom-left corner */
    '#me-tc{position:fixed;left:1.2rem;bottom:1.05rem;z-index:10;font:700 15px/1.55 '+FONT+';'+
      'font-variant-numeric:tabular-nums;color:#0a0a0a;pointer-events:none;min-height:1em;}'+
    '#me-app.browse #me-tc{display:none;}'+
    // radio dial — a receiver wheel seen head-on: the needle is fixed dead
    // centre and the scale itself slides underneath as you scrub
    '#me-band{position:fixed;left:0;right:0;top:50%;transform:translateY(-50%);z-index:9;display:none;'+
      'height:230px;overflow:hidden;cursor:ew-resize;touch-action:none;font-family:'+FONT+';}'+
    '#me-app.radio-mode #me-band{display:block;}'+
    '#me-app.radio-mode #me-tc{display:none;}'+
    '#me-band-in{position:absolute;top:0;height:230px;will-change:transform;}'+
    '#me-band-in.glide{transition:transform .9s cubic-bezier(.22,1,.36,1);}'+
    /* two rules like the reference set: fm on top, a decorative am row below */
    '#me-band .rule{position:absolute;height:1px;background:#9a9a9a;}'+
    '#me-band .g-tick{position:absolute;width:1px;background:#c8c8c4;}'+
    '#me-band .g-tick.major{background:#9a9a9a;}'+
    '#me-band .g-label{position:absolute;top:70px;transform:translateX(-50%);font-size:12px;color:#bdbdbd;'+
      'font-variant-numeric:tabular-nums;white-space:nowrap;}'+
    '#me-band .g-label.am{top:142px;font-size:10px;}'+
    /* the band designations are printed on the glass, not the wheel */
    '#me-band .g-unit{position:absolute;left:1.2rem;font-size:10px;color:#bdbdbd;letter-spacing:1px;}'+
    '#me-band .station{position:absolute;top:88px;height:26px;width:2px;transform:translateX(-50%);}'+
    '#me-band .station i{position:absolute;left:0;top:0;width:2px;height:26px;background:#c2c2be;'+
      'transition:background .25s ease;}'+
    /* the needle never moves — it lives on the glass, not the scale */
    '#me-band .needle{position:absolute;left:50%;top:60px;width:2px;height:96px;background:#0a0a0a;'+
      'pointer-events:none;transform:translateX(-50%);}'+
    '#me-band .b-note{position:absolute;top:14px;left:50%;transform:translateX(-50%);font:700 15px/1.55 '+FONT+';'+
      'color:#0a0a0a;text-transform:lowercase;letter-spacing:1px;width:84%;max-width:640px;text-align:center;'+
      'opacity:0;transition:opacity .35s ease;}'+
    '#me-band .b-title{position:absolute;top:170px;left:50%;transform:translateX(-50%);font:700 15px/1.55 '+FONT+';'+
      'color:#0a0a0a;white-space:nowrap;opacity:0;transition:opacity .35s ease;}'+
    '#me-band.near .b-note,#me-band.near .b-title{opacity:1;}'+
    '#me-band .b-freq{position:absolute;top:198px;left:50%;transform:translateX(-50%);font-size:11px;color:#9a9a9a;'+
      'font-variant-numeric:tabular-nums;white-space:nowrap;}'+
    '@media (max-width:480px){#me-band .g-label{font-size:10px;}#me-band .g-label.am{display:none;}}'+
    // browse
    '#me-browse{position:absolute;inset:0;display:none;}'+
    '#me-app.browse #me-browse{display:block;}'+
    '#me-list{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:84%;'+
      'font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '.me-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr) minmax(0,3fr) minmax(0,2fr);gap:1em;cursor:pointer;}'+
    '.me-row.head{cursor:default;margin-bottom:.2em;}'+
    '.me-row span{transition:opacity .15s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
    '.me-row span{opacity:1;}'+
    '.me-row[data-dim] span{opacity:.35;}'+
    /* the picked rows answer in the deal's colour — hover is never grey */
    '.me-row[data-hot] span{color:var(--me-theme,#111);}'+
    /* desktop: the list is one grid with content-sized columns — names are
       never cut — and the hovered film plays on the right, sized to whatever
       room the list leaves (measured in js). rows keep their behaviour via
       display:contents. a film without a preview gets a big live clock */
    '@media (min-width:701px){'+
      '#me-list{display:grid;grid-template-columns:repeat(5,max-content);column-gap:2em;'+
        'left:clamp(20px,4vw,64px);width:auto;transform:translateY(-50%);}'+
      '.me-row{display:contents;}'+
      '.me-row span{cursor:pointer;}'+
      '.me-row.head span{margin-bottom:.2em;cursor:default;}'+
      '#me-prev{position:fixed;right:clamp(20px,4vw,64px);top:50%;transform:translateY(-50%);'+
        'aspect-ratio:16/9;display:none;background:#000;}'+
      '#me-prev video{width:100%;height:100%;object-fit:cover;display:block;}'+
      '#me-prev canvas{width:100%;height:100%;display:block;}'+
      '#me-prev.ph{background:transparent;}'+
      '#me-prev.ph video{display:none;}'+
      '#me-prev:not(.ph) canvas{display:none;}'+
      '#me-app.browse #me-prev.on{display:block;}'+
    '}'+
    // player
    '#me-player{position:fixed;inset:0;background:#EFEFEC;z-index:2147483600;display:none;}'+
    '#me-player.show{display:block;}'+
    '#me-embed{position:absolute;inset:6% 8%;}'+
    '#me-player:fullscreen #me-embed{inset:0;}'+
    '#me-player:-webkit-full-screen #me-embed{inset:0;}'+
    '#me-player iframe{position:absolute;inset:0;width:100% !important;height:100% !important;border:0;display:block;}'+
    '#me-bar{position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;align-items:center;'+
      'gap:24px;padding:0 clamp(20px,4vw,64px);color:#fff;mix-blend-mode:difference;z-index:3;opacity:1;transition:opacity .4s ease;'+
      'font:700 15px/1 '+FONT+';}'+
    '#me-bar.idle{opacity:0;}'+
    '#me-bar button{background:none;border:0;color:#fff;font:inherit;cursor:pointer;padding:4px 0;white-space:nowrap;}'+
    '#me-bar button:hover{opacity:.55;}'+
    '#me-track{position:relative;flex:1;height:16px;cursor:pointer;display:flex;align-items:center;}'+
    '#me-track::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.85);transform:translateY(-50%);}'+
    '#me-head{position:absolute;top:50%;left:0;width:1px;height:13px;background:#fff;transform:translate(-50%,-50%);}'+
    '#me-close{position:absolute;top:clamp(16px,3vw,40px);right:clamp(16px,3vw,40px);z-index:4;background:none;border:0;'+
      'color:#fff;mix-blend-mode:difference;font:700 15px/1.55 '+FONT+';cursor:pointer;}#me-close:hover{opacity:.55;}'+
    '#me-info{position:absolute;top:clamp(16px,3vw,40px);left:clamp(20px,4vw,64px);z-index:4;color:#fff;mix-blend-mode:difference;'+
      'font:700 15px/1.55 '+FONT+';max-width:60vw;opacity:0;pointer-events:none;transition:opacity .2s;}'+
    '#me-info.show{opacity:1;}#me-info .t{margin-bottom:.4em;}#me-info .d{opacity:.7;}'+
    // mobile: compact desktop-style list, full-screen About
    '#me-about-screen{position:fixed;inset:0;background:#EFEFEC;z-index:2147483700;'+
      'padding:max(24px,env(safe-area-inset-top)) 24px 40px;box-sizing:border-box;overflow-y:auto;}'+
    '#me-about-close{position:absolute;top:max(16px,env(safe-area-inset-top));right:20px;'+
      'background:none;border:0;font:400 16px/1 '+FONT+';cursor:pointer;color:#111;}'+
    '#me-about-screen .txt{margin-top:60px;font:400 16px/1.6 '+FONT+';white-space:pre-line;color:#111;}'+
    '#me-about-screen .txt a{color:#111;text-decoration:none;}'+
    '#me-about-screen .ab-brand{position:fixed;top:1.15rem;left:1.2rem;font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;}'+
    '@media (max-width:700px){'+
      '#me-app.browse #me-browse{overflow:hidden;height:100vh;display:flex;align-items:center;}'+
      '@supports (height:100dvh){#me-app.browse #me-browse{height:100dvh;}}'+
      '#me-list{position:relative;left:auto;top:auto;transform:none;width:100%;'+
        'padding:0 18px;box-sizing:border-box;font-size:14px;}'+
      '.me-row{grid-template-columns:3em 2.4em minmax(0,1fr);gap:.6em;padding:7px 0;}'+
      '.me-row span{font-size:14px;}'+
      '.me-row span:nth-child(3),.me-row span:nth-child(5){display:none;}'+
      '#me-music{max-width:calc(100vw - 2.4rem);}'+
      '#me-bar [data-a="full"]{display:none;}'+
    '}';
  document.head.appendChild(st);

  // ── build shell ─────────────────────────────────────────────────
  var app=document.createElement('div'); app.id='me-app';
  app.innerHTML=
    '<div id="me-dial"><canvas id="me-field" aria-label="Films as dials — click one to open the film"></canvas></div>'+
    '<div id="me-browse"><div id="me-list"></div></div>'+
    '<div id="me-brand">dial</div>'+
    '<div id="me-ctrl">'+
      /* top right: the views and the about page, in the voice of the mark */
      '<button id="me-btnview" class="txt" aria-label="Cinema — toggle index view">cinema</button>'+
      '<button id="me-btnabout" class="txt" aria-label="About — open the about page">about</button>'+
    '</div>'+
    /* bottom right: the radio corner — the word, or pause + title while playing */
    '<div id="me-corner">'+
      '<button id="me-stop" class="icon" aria-label="Pause music">'+
        '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" stroke="none">'+
          '<rect x="5" y="4.5" width="3.4" height="11" rx="1"/>'+
          '<rect x="11.6" y="4.5" width="3.4" height="11" rx="1"/>'+
        '</svg>'+
      '</button>'+
      '<div id="me-music" role="button" aria-label="Radio — current song"></div>'+
      '<button id="me-radio" class="txt" aria-pressed="false" aria-label="Radio — toggle radio view">radio</button>'+
    '</div>'+
    '<div id="me-tc" aria-hidden="true"></div>';
  document.body.appendChild(app);

  var listEl=app.querySelector('#me-list');
  var tcEl=app.querySelector('#me-tc');

  var pl=document.createElement('div'); pl.id='me-player';
  pl.innerHTML='<div id="me-embed"></div><button id="me-close">close</button><div id="me-info"></div>'+
    '<div id="me-bar"><button data-a="play">play</button><button data-a="mute">mute</button>'+
    '<div id="me-track"><div id="me-head"></div></div>'+
    '<button data-a="full">fullscreen</button><button data-a="info">info</button></div>';
  document.body.appendChild(pl);
  var bar=pl.querySelector('#me-bar'), track=pl.querySelector('#me-track'), head=pl.querySelector('#me-head');
  var infoEl=pl.querySelector('#me-info');
  var bPlay=bar.querySelector('[data-a=play]'), bMute=bar.querySelector('[data-a=mute]'), bFull=bar.querySelector('[data-a=full]');
  var player=null, dragging=false, PROJECTS=[];

  // ── dial field — films and songs as clocks ──────────────────────
  var FILM_DIALS=[]; /* about lives in the top-right word now — no clock points to it */
  var fieldMode='dial'; /* 'dial' = About+films | 'radio' = the tuning scale alone */
  var fieldMult=[1,1,1,2,2,3][Math.floor(Math.random()*6)]; /* films repeat per deal — mostly once or twice */
  function fieldEntries(){
    /* songs live on the radio page only; the radio view itself has no clocks.
       films may appear several times — copies are identical repeated units */
    if(fieldMode==='radio')return[];
    var out=[];
    for(var m=0;m<fieldMult;m++){
      FILM_DIALS.forEach(function(f){
        /* copies keep the film link but each clock is a unique piece */
        out.push(m===0?f:Object.assign({},f,{copy:m}));
      });
    }
    return out;
  }

  /* one color theme per load */
  /* the reference palette — these six colours and nothing else */
  var THEMES=[
    {key:'#29ABE2',glow:'#5CC4EE'},   /* cyan   */
    {key:'#1B75BC',glow:'#4A96D2'},   /* blue   */
    {key:'#8DC63F',glow:'#A9D765'},   /* green  */
    {key:'#E8112D',glow:'#F04357'},   /* red    */
    {key:'#F7931E',glow:'#FAAE55'},   /* orange */
    {key:'#EF8FB4',glow:'#F5AFC9'}    /* pink   */
  ];
  var theme=THEMES[Math.floor(Math.random()*THEMES.length)];
  /* the palette a deal actually paints with — greyscale on black-and-white deals */
  var BW_KEY='#8f8f8a',BW_GLOW='#adada7';
  var paletteKey=theme.key,paletteGlow=theme.glow;

  var cvs=app.querySelector('#me-field'),ctx=cvs.getContext('2d');
  var W=0,H=0,DPR=Math.min(devicePixelRatio||1,2),nodes=[],hover=-1,casings=[];
  var pendingSlabs=null; /* filled silhouettes hand their slabs straight to the casing pass */

  function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  function hashSeed(x){ /* avalanche — sequential film seeds would correlate the LCG */
    x=(x^23)>>>0;
    x^=x>>>16;x=Math.imul(x,0x45d9f3b)>>>0;
    x^=x>>>16;x=Math.imul(x,0x45d9f3b)>>>0;
    x^=x>>>16;return x>>>0;
  }
  function shade(hex,amt){var n=parseInt(hex.slice(1),16);
    var R=(n>>16)+amt,G=((n>>8)&255)+amt,B=(n&255)+amt;
    R=Math.max(0,Math.min(255,R));G=Math.max(0,Math.min(255,G));B=Math.max(0,Math.min(255,B));
    return '#'+((R<<16)|(G<<8)|B).toString(16).padStart(6,'0');}
  function shuffled(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}return b;}

  var uniformSize=false; /* cased deals: a steady big/small rhythm, like the cabinets */
  function makeSizes(base,n){
    /* palindromic sizes — the sequence reads the same from either end, so any
       layout that lays clocks out in order comes out mirror-symmetric */
    var h=Math.ceil(n/2),s=[],i;
    if(uniformSize){
      var big=base*(0.05+Math.random()*0.02),small=big*(0.36+Math.random()*0.16);
      for(i=0;i<h;i++)s.push(i%2?small:big);
    }else{
      for(i=0;i<h;i++)s.push(base*(i<1?0.07+Math.random()*0.035:0.03+Math.random()*0.028));
      s=shuffled(s);
    }
    var out=s.slice();
    for(var j=n-h-1;j>=0;j--)out.push(s[j]);
    return out;
  }
  function evenR(base){ return uniformSize?base*0.045:base*(0.03+Math.random()*0.045); }

  function chaoticClump(fs,base,spreadK,sepK,bimodal){
    /* organic, but mirrored: scatter one half, reflect it, centre the odd one */
    var cx=W/2,cy=H/2,spread=base*spreadK;
    function gauss(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5;}
    var n=fs.length,half=Math.floor(n/2),odd=n%2,out=[],left=[];
    var bigAt=Math.floor(Math.random()*half);
    if(!odd&&half){ /* even counts have no centre clock — straddle the axis instead */
      var R0=bimodal?base*0.075:(uniformSize?base*0.045:base*0.05);
      left.push({x:cx-R0*1.04,y:cy,R:R0});
    }
    for(var i=left.length;i<half;i++){
      var R=bimodal?(i%3===0?base*(0.072+Math.random()*0.022):base*(0.026+Math.random()*0.018))
                   :(uniformSize?base*0.045:base*(i===bigAt?0.055+Math.random()*0.03:0.026+Math.random()*0.026));
      var x,y,tries=0;
      do{
        x=cx-Math.abs(gauss())*spread*1.6-R*1.05;
        y=cy+gauss()*spread*1.05;
        tries++;
      }while(tries<300&&left.some(function(p){return Math.hypot(p.x-x,p.y-y)<(p.R+R)*sepK;}));
      left.push({x:x,y:y,R:R});
    }
    var fi=0;
    left.forEach(function(p){ out.push({f:fs[fi++],x:p.x,y:p.y,R:p.R}); });
    left.forEach(function(p){ out.push({f:fs[fi++],x:2*cx-p.x,y:p.y,R:p.R}); });
    if(odd)out.push({f:fs[fi++],x:cx,y:cy,R:uniformSize?base*0.045:base*0.05});
    return out;
  }

  /* distribute clocks evenly along a normalized (0..1) path — one uniform size,
     so every constellation built on it is symmetric by construction */
  function polyLayout(fs,base,polys,closed,sizeK){
    var segs=[],total=0;
    polys.forEach(function(poly){
      var p=closed?poly.concat([poly[0]]):poly;
      for(var i=0;i<p.length-1;i++){
        var a=p[i],b=p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
        if(L>1e-6){segs.push({a:a,b:b,L:L,s:total});total+=L;}
      }
    });
    var n=fs.length,S=base*(sizeK||0.8),out=[];
    var step=total/(closed?n:Math.max(1,n-1));
    var r=Math.max(base*0.022,Math.min(base*0.07,step*S*0.46));
    for(var i=0;i<n;i++){
      var t=Math.min(total,closed?(i+0.5)*step:i*step),seg=segs[0];
      for(var k=0;k<segs.length;k++){ if(t>=segs[k].s&&t<=segs[k].s+segs[k].L){seg=segs[k];break;} }
      var u=(t-seg.s)/seg.L;
      out.push({f:fs[i],
        x:W/2+(seg.a[0]+(seg.b[0]-seg.a[0])*u-0.5)*S,
        y:H/2+(seg.a[1]+(seg.b[1]-seg.a[1])*u-0.5)*S,R:r});
    }
    return out;
  }

  /* centre hub plus four identical arms — every arm shares one size sequence,
     so opposite arms mirror each other exactly */
  function armLayout(fs,base,dirs,tags){
    var per=Math.floor((fs.length-1)/4);
    var armR=makeSizes(base,per);
    var cR=uniformSize?base*0.045:base*0.075;
    var gap=cR*0.08,nodes=[{f:fs[0],x:W/2,y:H/2,R:cR,cas:tags&&tags[0]}],fi=1;
    dirs.forEach(function(d,ai){
      var dist=cR+gap;
      armR.forEach(function(r){
        /* tags[0] is the hub, so arm n takes tags[n+1] */
        nodes.push({f:fs[fi++],x:W/2+d[0]*(dist+r),y:H/2+d[1]*(dist+r),R:r,cas:tags&&tags[ai+1]});
        dist+=2*r+gap;
      });
    });
    while(fi<fs.length)nodes.push({f:fs[fi++],x:W/2,y:H/2,R:cR*0.5}); /* guard */
    return nodes;
  }

  /* solid letterforms — a clock in every cell of a mask, the casing filling the
     silhouette behind them (the packed cabinets on the reference sheet) */
  var MASKS={
    /* wide columns hold the big drivers, narrow ones the small clocks between */
    /* pairs of very narrow columns flank every driver, so the small clocks
       crowd in tight beside the big ones */
    packT:{cols:[0.3,1,0.3,0.3,1,0.3,0.3,1,0.3,0.3,1,0.3],
           rows:[1,1,0.3,1,1,1,0.3,1],
           cells:['111111111111','111111111111','111111111111','111111111111',
                  '000011110000','000011110000','000011110000','000011110000']},
    /* 2 = a square-cased clock: the horn tweeters on top of the H */
    packH:{cols:[0.3,1,0.3,0.55,0.3,1,0.3],rows:[0.65,1,0.3,1,1,0.3,1],
           cells:['0200020','0100010','0100010','1111111','0100010','0100010','1100011']},
    packI:{cols:[0.3,1,0.3,0.4,0.3,1,0.3],rows:[1,0.3,1,0.3,1],
           cells:['1111111','0001000','0001000','0001000','1111111']}
  };
  function cellLayout(fs,base,spec){
    var cw=spec.cols,rh=spec.rows,cells=spec.cells;
    var tw=cw.reduce(function(a,b){return a+b;},0);
    var th=rh.reduce(function(a,b){return a+b;},0);
    var unit=Math.min(base*0.92/tw,base*0.92/th);
    var xs=[],ys=[],acc=0,i;
    for(i=0;i<cw.length;i++){xs.push(acc+cw[i]/2);acc+=cw[i];}
    acc=0;
    for(i=0;i<rh.length;i++){ys.push(acc+rh[i]/2);acc+=rh[i];}
    var nodes=[],fi=0;
    for(var ri=0;ri<cells.length;ri++)for(var ci=0;ci<cw.length;ci++){
      var ch=cells[ri].charAt(ci);
      if((ch!=='1'&&ch!=='2')||fi>=fs.length)continue;
      var wpx=cw[ci]*unit,hpx=rh[ri]*unit;
      var r=Math.min(wpx,hpx)*0.42;
      /* padKX/padKY make each slab exactly its own cell, so the cells tile
         into one solid letter silhouette behind the clocks */
      nodes.push({f:fs[fi++],
        x:W/2+(xs[ci]-tw/2)*unit,y:H/2+(ys[ri]-th/2)*unit,R:r,
        forceShape:ch==='2'?'square':null,
        padKX:wpx/2/r,padKY:hpx/2/r,cas:'c'+ri+'_'+ci});
    }
    return nodes;
  }

  /* grow a pool to exactly n clocks — About once, films duplicated freely and
     unevenly, exactly as many as the formation wants */
  function padPool(fs,n){
    var out=fs.slice(0,Math.min(fs.length,n)),k=0;
    if(!FILM_DIALS.length)return out; /* pre-data the field stays empty anyway */
    while(out.length<n){
      out.push(Object.assign({},FILM_DIALS[k%FILM_DIALS.length],{copy:300+k}));
      k++;
    }
    return out;
  }

  /* silhouettes for filled cabinets — unit space, centred, mirror-symmetric.
     rects are [cx,cy,w,h]; bigs sit on a fixed skeleton, squares are the
     horn-tweeter positions */
  var FILL_SIL={
    fillH:{rects:[[-0.62,0,0.36,1.6],[0.62,0,0.36,1.6],[0,0,0.88,0.5]],
           bigs:[[-0.62,-0.32],[0.62,-0.32],[-0.62,0.55],[0.62,0.55],[0,0]],
           squares:[[-0.62,-0.65],[0.62,-0.65]]},
    fillT:{rects:[[0,-0.55,1.6,0.5],[0,0.35,0.5,1.3]],
           bigs:[[-0.55,-0.55],[0.55,-0.55],[0,-0.55],[0,0.1],[0,0.65]]},
    fillI:{rects:[[0,-0.62,1.5,0.36],[0,0,0.44,0.94],[0,0.62,1.5,0.36]],
           bigs:[[-0.5,-0.62],[0.5,-0.62],[0,-0.2],[0,0.2],[-0.5,0.62],[0.5,0.62]]},
    fillTower:{rects:[[0,0,0.62,1.8]],
           bigs:[[0,-0.25],[0,0.62]],squares:[[0,-0.68]]},
    fillPlus:{rects:[[0,0,1.5,0.46],[0,0,0.46,1.5]],
           bigs:[[0,0],[-0.52,0],[0.52,0],[0,-0.52],[0,0.52]]},
    fillU:{rects:[[-0.62,-0.1,0.36,1.4],[0.62,-0.1,0.36,1.4],[0,0.78,1.6,0.36]],
           bigs:[[-0.62,-0.6],[0.62,-0.6],[-0.62,0.15],[0.62,0.15],[0,0.78]]},
    fillFrame:{rects:[[0,-0.72,1.8,0.4],[0,0.72,1.8,0.4],[-0.7,0,0.4,1.04],[0.7,0,0.4,1.04]],
           bigs:[[-0.7,-0.72],[0.7,-0.72],[-0.7,0.72],[0.7,0.72],[0,-0.72],[0,0.72],[-0.7,0],[0.7,0]]}
  };

  /* fill a silhouette with clocks: big drivers on the skeleton, then
     super-small ones packed mirror-first into every gap — the green-H and
     pink-tower posters. The slabs themselves become the casing. */
  function fillCase(fs,base,sil){
    var S=base*0.62;
    /* every deal reshapes the silhouette a little — same letter, never the
       same cabinet. Per-axis scale keeps the mirror and the containment */
    var jx=0.88+Math.random()*0.27,jy=0.88+Math.random()*0.27;
    var rects=sil.rects.map(function(r){
      return {x:W/2+r[0]*S*jx,y:H/2+r[1]*S*jy,w:r[2]*S*jx,h:r[3]*S*jy};
    });
    pendingSlabs=rects.map(function(r){return {x:r.x-r.w/2,y:r.y-r.h/2,w:r.w,h:r.h};});
    var geo=[];
    function inside(x,y,R){
      return rects.some(function(r){
        return x>=r.x-r.w/2+R&&x<=r.x+r.w/2-R&&y>=r.y-r.h/2+R&&y<=r.y+r.h/2-R;
      });
    }
    function collide(x,y,R){
      return geo.some(function(g){return Math.hypot(g.x-x,g.y-y)<(g.R+R)*1.06;});
    }
    function rectAt(x,y){
      var best=rects[0],bd=1e9;
      rects.forEach(function(r){
        var d=Math.hypot(r.x-x,r.y-y);
        if(d<bd){bd=d;best=r;}
      });
      return best;
    }
    (sil.bigs||[]).forEach(function(p){
      var x=W/2+p[0]*S*jx,y=H/2+p[1]*S*jy,r=rectAt(x,y);
      var R=Math.min(Math.min(r.w,r.h)/2*0.84,base*0.115);
      if(!collide(x,y,R))geo.push({x:x,y:y,R:R});
    });
    (sil.squares||[]).forEach(function(p){
      var x=W/2+p[0]*S*jx,y=H/2+p[1]*S*jy,r=rectAt(x,y);
      var R=Math.min(Math.min(r.w,r.h)/2*0.62,base*0.08);
      if(!collide(x,y,R))geo.push({x:x,y:y,R:R,forceShape:'square'});
    });
    /* mirrored gap fill — density and the small-size bias re-roll per deal,
       from sparse dots to a near-solid swarm */
    var capN=40+Math.floor(Math.random()*52);
    var pw=[1.6,2,2.8][Math.floor(Math.random()*3)];
    for(var t=0;t<800&&geo.length<capN;t++){
      var r2=rects[Math.floor(Math.random()*rects.length)];
      var x=r2.x-r2.w/2+Math.random()*r2.w;
      var y=r2.y-r2.h/2+Math.random()*r2.h;
      var R=base*(0.013+Math.pow(Math.random(),pw)*0.05);
      if(x>W/2+R*1.12)continue;                   /* build left, mirror right */
      /* the centre band must clear the collision radius — a clock any closer
         to the axis would overlap its own mirror twin, so it snaps onto it */
      var center=Math.abs(x-W/2)<R*1.12;
      if(center)x=W/2;
      if(!inside(x,y,R)||collide(x,y,R))continue;
      if(center){geo.push({x:x,y:y,R:R});}
      else{
        var mx=W-x;
        if(!inside(mx,y,R)||collide(mx,y,R))continue;
        geo.push({x:x,y:y,R:R});
        geo.push({x:mx,y:y,R:R});
      }
    }
    var fs2=padPool(fs,geo.length);
    return geo.map(function(g,i){g.f=fs2[i];return g;});
  }

  /* symmetric cores of big drivers with tiny satellites around them — the
     face, quincunx, blue-figure and flower posters */
  var CORES=[
    {big:[[0,0],[-1.05,-0.95],[1.05,-0.95],[-1.05,0.95],[1.05,0.95]]},        /* quincunx */
    {big:[[-0.62,-0.3],[0.62,-0.3]],mid:[[0,0.72]],squares:[[-0.62,-1.18],[0.62,-1.18]]}, /* face */
    {big:[[0,-0.55],[-1.15,-0.55],[1.15,-0.55],[-0.6,0.55],[0.6,0.55]]},      /* flower */
    {big:[[0,-0.95],[0,0.95]],mid:[[-1.0,0],[1.0,0],[0,0]]},                  /* diamond */
    {big:[[0,-1],[-0.95,-0.31],[0.95,-0.31],[-0.59,0.81],[0.59,0.81]]},       /* star */
    {big:[[0,0]],ringN:12,ringR:1.5},                                         /* clockface */
    {big:[[0,0]],mid:[[0,-1],[0.87,-0.5],[0.87,0.5],[0,1],[-0.87,0.5],[-0.87,-0.5]]}, /* bloom */
    {big:[[0,0]],mid:[[-1.5,0],[1.5,0],[-0.95,-0.42],[-0.32,-0.6],[0.32,-0.6],[0.95,-0.42],
                      [-0.95,0.42],[-0.32,0.6],[0.32,0.6],[0.95,0.42]]},      /* eye */
    {big:[[0,-0.85],[-0.85,0.62],[0.85,0.62]],mid:[[0,0.1]]}                  /* triangle */
  ];
  function coreSatLayout(fs,base){
    var ci=Math.floor(Math.random()*CORES.length),core=CORES[ci];
    cvs.dataset.core=String(ci);
    /* scale and proportions re-roll per deal — the same core never repeats 1:1 */
    var S=base*(0.38+Math.random()*0.1);
    var bigR=base*(0.09+Math.random()*0.025);
    var midR=bigR*(0.5+Math.random()*0.12),tinyR=base*(0.016+Math.random()*0.008);
    var geo=[];
    (core.big||[]).forEach(function(p){geo.push({x:W/2+p[0]*S,y:H/2+p[1]*S,R:bigR});});
    (core.mid||[]).forEach(function(p){geo.push({x:W/2+p[0]*S,y:H/2+p[1]*S,R:midR});});
    if(core.ringN){ /* dots on a dial — starts at 12 o'clock, mirror-exact */
      var rn=core.ringN+2*Math.floor(Math.random()*3)-2;
      var rr=core.ringR*(0.92+Math.random()*0.25);
      for(var rk=0;rk<rn;rk++){
        var ra=-Math.PI/2+rk*2*Math.PI/rn;
        geo.push({x:W/2+Math.cos(ra)*rr*S,y:H/2+Math.sin(ra)*rr*S,R:midR});
      }
    }
    (core.squares||[]).forEach(function(p){
      geo.push({x:W/2+p[0]*S,y:H/2+p[1]*S,R:midR*0.8,forceShape:'square',satTiny:true});
    });
    var minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
    geo.forEach(function(g){
      minX=Math.min(minX,g.x-g.R);maxX=Math.max(maxX,g.x+g.R);
      minY=Math.min(minY,g.y-g.R);maxY=Math.max(maxY,g.y+g.R);
    });
    var cw=(maxX-minX)/2,ch=(maxY-minY)/2,gap=base*0.045,deco=0;
    function tiny(x,y){geo.push({x:x,y:y,R:tinyR,satTiny:true});}
    if(Math.random()<0.7){ /* flank columns */
      deco++;
      var nc=2+Math.floor(Math.random()*3);
      for(var i=0;i<nc;i++){
        var fy=H/2+((i+0.5)/nc-0.5)*2*ch*0.8;
        tiny(W/2-cw-gap-tinyR,fy);tiny(W/2+cw+gap+tinyR,fy);
      }
    }
    if(Math.random()<0.5){ /* stack above the crown */
      deco++;
      var ns=2+Math.floor(Math.random()*2);
      for(var s2=0;s2<ns;s2++)tiny(W/2,H/2-ch-gap-tinyR-(s2*2.4*tinyR));
    }
    if(Math.random()<0.4){deco++;tiny(W/2,H/2+ch+gap+tinyR);}
    if(Math.random()<0.4){ /* corner dots, like the pink flower poster */
      deco++;
      tiny(W/2-cw-gap,H/2-ch-gap);tiny(W/2+cw+gap,H/2-ch-gap);
      tiny(W/2-cw-gap,H/2+ch+gap);tiny(W/2+cw+gap,H/2+ch+gap);
    }
    if(!deco||Math.random()<0.35){ /* dotted ring around everything */
      var K=3+Math.floor(Math.random()*3);
      var ea=cw*1.35+gap,eb=ch*1.35+gap;
      for(var k2=0;k2<K;k2++){
        var a=(k2+0.5)/K*(Math.PI/2);
        var ex=Math.cos(a)*ea,ey=Math.sin(a)*eb;
        tiny(W/2+ex,H/2+ey);tiny(W/2-ex,H/2+ey);
        tiny(W/2+ex,H/2-ey);tiny(W/2-ex,H/2-ey);
      }
    }
    var fs2=padPool(fs,geo.length);
    return geo.map(function(g,i){g.f=fs2[i];return g;});
  }

  /* a stack of mid clocks, each flanked by a pair of tiny ones — runs
     vertical or horizontal */
  function stackSatLayout(fs,base){
    var n=3+Math.floor(Math.random()*2);
    var midR=base*(0.055+Math.random()*0.015),tinyR=base*0.02,gap=midR*0.5;
    var horiz=Math.random()<0.4;
    var geo=[],step=2*midR+gap*(horiz?1.6:1);
    for(var i=0;i<n;i++){
      var c=(i-(n-1)/2)*step;
      if(horiz){
        geo.push({x:W/2+c,y:H/2,R:midR});
        geo.push({x:W/2+c,y:H/2-midR-tinyR*1.9,R:tinyR,satTiny:true});
        geo.push({x:W/2+c,y:H/2+midR+tinyR*1.9,R:tinyR,satTiny:true});
      }else{
        geo.push({x:W/2,y:H/2+c,R:midR});
        geo.push({x:W/2-midR-tinyR*1.9,y:H/2+c,R:tinyR,satTiny:true});
        geo.push({x:W/2+midR+tinyR*1.9,y:H/2+c,R:tinyR,satTiny:true});
      }
    }
    var fs2=padPool(fs,geo.length);
    return geo.map(function(g,i){g.f=fs2[i];return g;});
  }

  var LAYOUTS={
    fillH:function(fs,base){return fillCase(fs,base,FILL_SIL.fillH);},
    fillT:function(fs,base){return fillCase(fs,base,FILL_SIL.fillT);},
    fillI:function(fs,base){return fillCase(fs,base,FILL_SIL.fillI);},
    fillTower:function(fs,base){return fillCase(fs,base,FILL_SIL.fillTower);},
    fillPlus:function(fs,base){return fillCase(fs,base,FILL_SIL.fillPlus);},
    fillU:function(fs,base){return fillCase(fs,base,FILL_SIL.fillU);},
    fillFrame:function(fs,base){return fillCase(fs,base,FILL_SIL.fillFrame);},
    coreSat:function(fs,base){return coreSatLayout(fs,base);},
    stackSat:function(fs,base){return stackSatLayout(fs,base);},
    lineH:function(fs,base){
      var R=makeSizes(base,fs.length);
      var total=R.reduce(function(a,r){return a+2*r;},0);
      var x=(W-total)/2;
      return fs.map(function(f,i){var r=R[i];var n={f:f,x:x+r,y:H/2,R:r,cas:'a'};x+=2*r;return n;});
    },
    lineV:function(fs,base){
      var R=makeSizes(base,fs.length);
      var total=R.reduce(function(a,r){return a+2*r;},0);
      var y=(H-total)/2;
      return fs.map(function(f,i){var r=R[i];var n={f:f,x:W/2,y:y+r,R:r,cas:'a'};y+=2*r;return n;});
    },
    cross:function(fs,base){ /* casing = a vertical slab crossed by a horizontal one */
      return armLayout(fs,base,[[0,-1],[0,1],[-1,0],[1,0]],['v','v','v','h','h']);
    },
    xshape:function(fs,base){
      var q=Math.SQRT1_2;
      return armLayout(fs,base,[[-q,-q],[q,-q],[-q,q],[q,q]]);
    },
    ring:function(fs,base){
      var cx=W/2,cy=H/2,rad=Math.min(W,H)*0.33;
      /* never wider than the gap between neighbours on the circle */
      var r=Math.min(evenR(base),rad*Math.sin(Math.PI/Math.max(fs.length,3))*0.92);
      return fs.map(function(f,i){
        var a=i/fs.length*Math.PI*2-Math.PI/2;
        return {f:f,x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,R:r};
      });
    },
    grid:function(fs,base){
      var cols=4,rows=Math.ceil(fs.length/cols);
      var gw=Math.min(W*0.7,base*1.3),gh=base*0.28*(rows-1);
      var oy=(H-gh)/2;
      var nodes=[],rr=evenR(base);
      for(var r=0;r<rows;r++){
        var inRow=Math.min(cols,fs.length-r*cols);
        var rowW=gw*(inRow-1)/(cols-1||1);
        var ox=(W-rowW)/2;
        for(var c=0;c<inRow;c++){
          nodes.push({f:fs[r*cols+c],x:ox+(inRow>1?rowW*(c/(inRow-1)):0),y:oy+(rows>1?gh*(r/(rows-1)):0),R:rr,cas:'g'});
        }
      }
      return nodes;
    },
    cluster:function(fs,base){ /* loose organic clump, mild overlap */
      return chaoticClump(fs,base,0.22,0.88);
    },
    pile:function(fs,base){ /* denser pile, heavier overlap but nothing buried */
      return chaoticClump(fs,base,0.16,0.74);
    },
    rings:function(fs,base){ /* circle inside a circle — ordered chaos; adapts to film count */
      var cx=W/2,cy=H/2;
      var n=fs.length;
      var innerN=Math.min(3,Math.max(0,Math.floor((n-1)/3)));
      var outerN=n-1-innerN;
      var rOut=Math.min(W,H)*0.34,rIn=rOut*0.5;
      var rHub=uniformSize?base*0.045:base*0.06;
      var rMid=uniformSize?base*0.045:base*0.034;
      var rEdge=uniformSize?base*0.045:base*0.042;
      var nodes=[{f:fs[0],x:cx,y:cy,R:rHub}];      /* no jitter — rings stay true */
      for(var i=0;i<innerN;i++){
        var a=i/innerN*Math.PI*2-Math.PI/2;
        nodes.push({f:fs[1+i],x:cx+Math.cos(a)*rIn,y:cy+Math.sin(a)*rIn,R:rMid});
      }
      for(var o=0;o<outerN;o++){
        var a2=o/outerN*Math.PI*2-Math.PI/2;
        nodes.push({f:fs[1+innerN+o],x:cx+Math.cos(a2)*rOut,y:cy+Math.sin(a2)*rOut,R:rEdge});
      }
      return nodes;
    },
    flower:function(fs,base){ /* mirrored rows of 3 and 2 — uniform drivers */
      var n=fs.length;
      var counts=[],left=n,want=3;
      while(left>0){counts.push(Math.min(want,left));left-=Math.min(want,left);want=want===3?2:3;}
      var r=base*0.05,gap=r*0.25,rowStep=2*r+gap*0.5;
      var totalH=(counts.length-1)*rowStep;
      var nodes=[],fi=0;
      counts.forEach(function(c,ri){
        var rowW=c*2*r+(c-1)*gap;
        var y=H/2-totalH/2+ri*rowStep;
        for(var i=0;i<c;i++)nodes.push({f:fs[fi++],x:W/2-rowW/2+r+i*(2*r+gap),y:y,R:r});
      });
      return nodes;
    },
    packT:function(fs,base){ return cellLayout(fs,base,MASKS.packT); },
    packH:function(fs,base){ return cellLayout(fs,base,MASKS.packH); },
    packI:function(fs,base){ return cellLayout(fs,base,MASKS.packI); },
    quincunx:function(fs,base){ /* five drivers, satellites around the flanks */
      /* corners sit 1.6r out on each axis, so the diagonal clears the centre
         clock (needs >1.41r) and separation never has to touch the formation */
      var n=fs.length,big=base*0.1,small=base*0.031;
      var d=big*1.6,nodes=[],fi=0;
      nodes.push({f:fs[fi++],x:W/2,y:H/2,R:big});
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
        if(fi<n)nodes.push({f:fs[fi++],x:W/2+s[0]*d,y:H/2+s[1]*d,R:big});
      });
      var m=n-fi,rx=d+big*1.05+small*1.2,ry=rx;
      if(m%2===1){nodes.push({f:fs[fi++],x:W/2,y:H/2-ry*1.08,R:small});m--;}
      var np=m/2;
      for(var k=0;k<np;k++){
        var t=(k+1)/(np+1),a=(-70+t*140)*Math.PI/180;
        var px=W/2+Math.cos(a)*rx,py=H/2+Math.sin(a)*ry;
        nodes.push({f:fs[fi++],x:px,y:py,R:small});
        nodes.push({f:fs[fi++],x:W-px,y:py,R:small});
      }
      return nodes;
    },
    bloom:function(fs,base){ /* mirrored bouquet — big cones with small ones between */
      return chaoticClump(fs,base,0.2,0.99,true);
    },
    star:function(fs,base){
      var pts=[];
      for(var k=0;k<10;k++){
        var a=k/10*Math.PI*2-Math.PI/2, rr=(k%2?0.21:0.5);
        pts.push([0.5+Math.cos(a)*rr,0.5+Math.sin(a)*rr]);
      }
      return polyLayout(fs,base,[pts],true);
    },
    eye:function(fs,base){
      var pts=[],N=26,i,t,x,y;
      for(i=0;i<=N;i++){ t=i/N;                       /* upper lid */
        x=(1-t)*(1-t)*0.02+2*(1-t)*t*0.5+t*t*0.98;
        y=(1-t)*(1-t)*0.5+2*(1-t)*t*0.06+t*t*0.5;
        pts.push([x,y]);
      }
      for(i=1;i<N;i++){ t=i/N;                        /* lower lid */
        x=(1-t)*(1-t)*0.98+2*(1-t)*t*0.5+t*t*0.02;
        y=(1-t)*(1-t)*0.5+2*(1-t)*t*0.94+t*t*0.5;
        pts.push([x,y]);
      }
      var nodes=polyLayout(fs.slice(1),base,[pts],true,0.86);
      var pr=Math.max.apply(null,nodes.map(function(n){return n.R;}))*1.7;
      nodes.unshift({f:fs[0],x:W/2,y:H/2,R:pr});      /* pupil */
      return nodes;
    },
    clockface:function(fs,base){
      var rad=Math.min(W,H)*0.35;
      var rest=fs.slice(1),outer=Math.min(12,rest.length);
      var r=2*rad*Math.sin(Math.PI/12)*0.44;
      var nodes=[{f:fs[0],x:W/2,y:H/2,R:r*1.5}];      /* hub */
      var i,a;
      for(i=0;i<outer;i++){
        a=i/12*Math.PI*2-Math.PI/2;
        nodes.push({f:rest[i],x:W/2+Math.cos(a)*rad,y:H/2+Math.sin(a)*rad,R:r});
      }
      var inner=rest.slice(outer);
      for(i=0;i<inner.length;i++){
        a=i/inner.length*Math.PI*2-Math.PI/2;
        nodes.push({f:inner[i],x:W/2+Math.cos(a)*rad*0.52,y:H/2+Math.sin(a)*rad*0.52,R:r*0.8});
      }
      return nodes;
    },
    columns:function(fs,base){
      /* both columns share one size sequence — equal counts, equal heights */
      var per=Math.floor(fs.length/2);
      var R=makeSizes(base,per),xs=[W*0.36,W*0.64],nodes=[],fi=0;
      var tot=R.reduce(function(a,r){return a+2*r;},0);
      for(var c=0;c<2;c++){
        var y=(H-tot)/2;
        for(var i=0;i<per;i++){nodes.push({f:fs[fi++],x:xs[c],y:y+R[i],R:R[i],cas:c===0?'a':'b'});y+=2*R[i];}
      }
      return nodes;
    }
  };

  function layoutField(){
    var pool=fieldEntries();
    if(!pool.length||!W||!H){nodes=[];casings=[];ctx.clearRect(0,0,W,H);return;}
    var base=Math.min(W,H);
    /* half of all posters come in a box; the weights lean on the reference-sheet
       archetypes — filled letter cabinets when boxed, core+satellite comps when free */
    var PACKED={packT:1,packH:1,packI:1};   /* one clock per mask cell, casing tiled off radii */
    var FILLED={fillH:1,fillT:1,fillI:1,fillTower:1,fillPlus:1,fillU:1,fillFrame:1}; /* organic mixed-size fill */
    var GEO={coreSat:1,stackSat:1};         /* geometry-first — pool pads itself */
    function weighted(list){
      var tot=0;list.forEach(function(e){tot+=e[1];});
      var t=Math.random()*tot;
      for(var wi=0;wi<list.length;wi++){t-=list[wi][1];if(t<=0)return list[wi][0];}
      return list[list.length-1][0];
    }
    var cased=Math.random()<0.5;
    var pick=cased
      ?weighted([['fillH',4],['fillT',3],['fillTower',3],['fillI',2],['fillPlus',2],
                 ['fillU',3],['fillFrame',3],
                 ['packT',3],['packH',3],['packI',2],
                 ['lineV',1],['columns',1],['cross',1]])
      :weighted([['coreSat',12],['stackSat',2],
                 ['lineH',1],['lineV',1],['columns',1],['cross',1],['xshape',1]]);
    cvs.dataset.core='';
    /* the organic piles never mirror — the requested formations (quincunx, star,
       bloom, clockface, eye) live on as cores inside coreSat instead */
    cvs.dataset.layout=pick;
    cvs.dataset.cased=cased?'1':'0';
    uniformSize=cased&&!PACKED[pick]&&!FILLED[pick];
    pendingSlabs=null;
    /* one case shape for the whole deal — the field is never a mix of forms */
    var CASE_EXT={circle:[1,1],square:[0.94,0.94],pill:[1.08,0.9],tv:[0.8,1.02]};
    var shapeRoll=Math.random();
    /* boxed posters and the satellite comps use round drivers, like the reference */
    var dealShape=(cased||GEO[pick]||pick==='bloom')?'circle'
      :(shapeRoll<0.5?'circle':(shapeRoll<0.78?'square':(shapeRoll<0.9?'pill':'tv')));
    var ext=CASE_EXT[dealShape];

    /* symmetry beats completeness: pad with duplicate films until the count
       fits the formation, so no arm, column or row is ever left ragged */
    var NEED={
      columns:function(n){return n+(n%2);},
      cross:function(n){return n+((4-((n-1)%4))%4);},
      xshape:function(n){return n+((4-((n-1)%4))%4);},
      grid:function(n){return n+((4-(n%4))%4);},
      eye:function(n){return n+((n-1)%2);},
      flower:function(n){return n;},
      clockface:function(n){return n<13?13:n;}
    };
    if(PACKED[pick]){
      /* a solid letterform needs exactly one clock per cell */
      var cells=0;
      /* every non-zero cell holds a clock — '2' is the forced-square cell */
      MASKS[pick].cells.forEach(function(row){for(var c=0;c<row.length;c++)if(row.charAt(c)!=='0')cells++;});
      pool=[];
      for(var pk=0;pool.length<cells&&FILM_DIALS.length;pk++){
        pool.push(pk<FILM_DIALS.length?FILM_DIALS[pk]
          :Object.assign({},FILM_DIALS[pk%FILM_DIALS.length],{copy:200+pk}));
      }
    }else if(NEED[pick]){
      var target=NEED[pick](pool.length),k=0;
      while(pool.length<target&&FILM_DIALS.length){
        pool.push(Object.assign({},FILM_DIALS[k%FILM_DIALS.length],{copy:100+k}));
        k++;
      }
    }
    var fs=shuffled(pool);
    nodes=LAYOUTS[pick](fs,base);

    /* mirror pairs on both axes — a cross must match top-to-bottom as well as
       left-to-right. Pairing is by position, so it only fires where the
       formation genuinely is symmetric on that axis (a T never pairs its stem). */
    function axes(){
      var minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
      nodes.forEach(function(n){
        minX=Math.min(minX,n.x);maxX=Math.max(maxX,n.x);
        minY=Math.min(minY,n.y);maxY=Math.max(maxY,n.y);
      });
      return {x:(minX+maxX)/2,y:(minY+maxY)/2};
    }
    function mirrorPairs(mode){
      var ax=axes(),pairs=[],used={};
      for(var i=0;i<nodes.length;i++){
        if(used[i])continue;
        var A=nodes[i];
        var onAxis=mode==='h'?Math.abs(A.y-ax.y)<A.R*0.35:Math.abs(A.x-ax.x)<A.R*0.35;
        if(onAxis){used[i]=1;continue;}
        var tx=mode==='h'?A.x:2*ax.x-A.x;
        var ty=mode==='h'?2*ax.y-A.y:A.y;
        var best=-1,bd=1e9;
        for(var j=0;j<nodes.length;j++){
          if(j===i||used[j])continue;
          var d=Math.hypot(nodes[j].x-tx,nodes[j].y-ty);
          if(d<bd){bd=d;best=j;}
        }
        /* every layout builds exact mirrors, so the true partner sits at the
           reflected spot — pairing then forces size symmetry too */
        if(best>=0&&bd<Math.max(A.R,nodes[best].R)*0.9){
          used[i]=1;used[best]=1;pairs.push([i,best]);
        }
      }
      return pairs;
    }
    /* filled silhouettes and packed letters mirror left-right only — greedy
       top-bottom pairing would grab near-misses across unequal rows and
       resize them into overlap (a letter is never top-bottom symmetric) */
    var pairsV=mirrorPairs('v'),pairsH=(FILLED[pick]||PACKED[pick])?[]:mirrorPairs('h');
    /* left→right first, then top→bottom: styles propagate from one representative */
    pairsV.forEach(function(p){ nodes[p[1]].R=nodes[p[0]].R; });
    pairsH.forEach(function(p){ nodes[p[1]].R=nodes[p[0]].R; });

    /* fit: scale + center the whole arrangement into the safe area */
    var lastFit=null; /* slab casings ride through the same transform as the clocks */
    function fitField(){
      var minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
      nodes.forEach(function(n){
        minX=Math.min(minX,n.x-n.R*ext[0]);maxX=Math.max(maxX,n.x+n.R*ext[0]);
        minY=Math.min(minY,n.y-n.R*ext[1]);maxY=Math.max(maxY,n.y+n.R*ext[1]);
      });
      var bw=maxX-minX,bh=maxY-minY;
      var mX=W*0.08,mTop=H*0.12;
      var mBot=fieldMode==='radio'?Math.max(H*0.14,150):H*0.14; /* keep the tuning band clear */
      var sc=Math.min((W-2*mX)/bw,(H-mTop-mBot)/bh,1);
      var bcx=(minX+maxX)/2,bcy=(minY+maxY)/2;
      var tx=W/2,ty=mTop+(H-mTop-mBot)/2;
      lastFit={sc:sc,bcx:bcx,bcy:bcy,tx:tx,ty:ty};
      nodes.forEach(function(n){
        n.x=tx+(n.x-bcx)*sc;
        n.y=ty+(n.y-bcy)*sc;
        n.R*=sc;
      });
    }
    /* no clock ever overlays another — the case outline decides, not a circle:
       square/pill/tv reach past R at their corners, so they get a box test */
    function pairOverlap(A,B){
      var dx=B.x-A.x,dy=B.y-A.y;
      if(dealShape==='circle')return (A.R+B.R)-Math.hypot(dx,dy);
      return Math.min((A.R+B.R)*ext[0]-Math.abs(dx),(A.R+B.R)*ext[1]-Math.abs(dy));
    }
    function separate(){
      var pad=1.03;
      for(var it=0;it<200;it++){
        var moved=false;
        for(var a2=0;a2<nodes.length;a2++)for(var b2=a2+1;b2<nodes.length;b2++){
          var A=nodes[a2],B=nodes[b2];
          var dx=B.x-A.x,dy=B.y-A.y;
          if(dealShape==='circle'){
            var dist=Math.hypot(dx,dy)||0.001,minD=(A.R+B.R)*pad;
            if(dist<minD){
              var push=(minD-dist)/2,ux=dx/dist,uy=dy/dist;
              A.x-=ux*push;A.y-=uy*push;B.x+=ux*push;B.y+=uy*push;moved=true;
            }
          }else{
            var ox=(A.R+B.R)*ext[0]*pad-Math.abs(dx);
            var oy=(A.R+B.R)*ext[1]*pad-Math.abs(dy);
            if(ox>0&&oy>0){ /* push along the shallower axis */
              if(ox<oy){var sx=(dx<0?-1:1)*ox/2;A.x-=sx;B.x+=sx;}
              else{var sy=(dy<0?-1:1)*oy/2;A.y-=sy;B.y+=sy;}
              moved=true;
            }
          }
        }
        if(!moved)break;
      }
    }
    function worstOverlap(){
      var w=-1e9;
      for(var a3=0;a3<nodes.length;a3++)for(var b3=a3+1;b3<nodes.length;b3++){
        w=Math.max(w,pairOverlap(nodes[a3],nodes[b3]));
      }
      return w;
    }
    /* separation can nudge a clock off its mirror — snap pairs back onto the axes */
    function snapMirror(){
      var ax=axes();
      pairsV.forEach(function(p){
        var L=nodes[p[0]],Rn=nodes[p[1]];
        var lx=(L.x+(2*ax.x-Rn.x))/2,ly=(L.y+Rn.y)/2;
        L.x=lx;L.y=ly;Rn.x=2*ax.x-lx;Rn.y=ly;
      });
      pairsH.forEach(function(p){
        var T=nodes[p[0]],B=nodes[p[1]];
        var tx=(T.x+B.x)/2,ty=(T.y+(2*ax.y-B.y))/2;
        T.x=tx;T.y=ty;B.x=tx;B.y=2*ax.y-ty;
      });
      /* unpaired nodes that live on the axis stay ON it — the hub of a cross
         must not creep sideways as the arms are pushed around it */
      var inV={};
      pairsV.forEach(function(p){inV[p[0]]=1;inV[p[1]]=1;});
      nodes.forEach(function(n,i){
        if(!inV[i]&&Math.abs(n.x-ax.x)<n.R*0.6)n.x=ax.x;
      });
    }
    fitField();
    /* packed masks and filled silhouettes are collision-free by construction and
       their casings derive from the clocks — separating or shrinking would tear
       gaps in the letter */
    if(!PACKED[pick]&&!FILLED[pick]){
      /* fitting can re-tighten what separation just opened — settle, then verify */
      for(var round=0;round<6;round++){
        separate();
        snapMirror();
        fitField();
        if(worstOverlap()<=0.01)break;
      }
      /* snapping back onto the axis can undo a push, so the two can oscillate on
         organic layouts. Shrinking every clock equally always converges and keeps
         the mirror exact — no arrangement ever leaves this loop overlapping. */
      for(var shrink=0;shrink<40&&worstOverlap()>0.01;shrink++){
        nodes.forEach(function(n){n.R*=0.97;});
      }
    }
    cvs.dataset.overlap=String(Math.round(worstOverlap()*10)/10);
    cvs._nodes=nodes; /* audit handle, like the dataset flags */

    /* sometimes the formation lives in a casing — a filled silhouette IS its own
       casing (the slabs, fitted like the clocks); otherwise slabs derive per group */
    casings=[];
    if(pendingSlabs&&lastFit){
      casings=pendingSlabs.map(function(s){
        return {x:lastFit.tx+(s.x-lastFit.bcx)*lastFit.sc,
                y:lastFit.ty+(s.y-lastFit.bcy)*lastFit.sc,
                w:s.w*lastFit.sc,h:s.h*lastFit.sc};
      });
    }else if(cased){
      var groups={},cm={};
      nodes.forEach(function(n){ if(n.cas)(groups[n.cas]=groups[n.cas]||[]).push(n); });
      Object.keys(groups).forEach(function(k){
        var g=groups[k];
        var maxR=Math.max.apply(null,g.map(function(n){return n.R;}));
        var base2=Math.max(ext[0],ext[1])*1.12;
        var padX=maxR*(g[0].padKX||base2),padY=maxR*(g[0].padKY||base2);
        var gx0=Math.min.apply(null,g.map(function(n){return n.x;}))-padX;
        var gx1=Math.max.apply(null,g.map(function(n){return n.x;}))+padX;
        var gy0=Math.min.apply(null,g.map(function(n){return n.y;}))-padY;
        var gy1=Math.max.apply(null,g.map(function(n){return n.y;}))+padY;
        var c={x:gx0,y:gy0,w:gx1-gx0,h:gy1-gy0}; /* hard corners */
        cm[k]=c;casings.push(c);
      });
    }

    /* the reference sheet runs roughly 7 coloured posters to 5 black-and-white */
    var bw=Math.random()<0.4;
    paletteKey=bw?BW_KEY:theme.key;
    paletteGlow=bw?BW_GLOW:theme.glow;
    cvs.dataset.bw=bw?'1':'0';
    /* the index hover borrows the deal's colour — even on a b/w deal it stays colourful */
    document.documentElement.style.setProperty('--me-theme',theme.key);
    /* satellite comps: the tiny outriders stay quiet, the core may wear full colour */
    var coreColored=!bw&&GEO[pick]&&Math.random()<0.6;
    var coreMode=['ring','dial'][Math.floor(Math.random()*2)];

    /* often the whole field is one and the same simple watch — different times only.
       inside a casing it always is: one watch, one size, like the reference posters */
    var uni=null;
    if(cased||Math.random()<0.35){
      uni={
        model:[0,1,2,4,5,6,10,11,13][Math.floor(Math.random()*9)],
        /* clocks sitting on a coloured casing read dark, like the reference */
        tone:cased?['black','dark'][Math.floor(Math.random()*2)]
                  :['black','dark','mid','light'][Math.floor(Math.random()*4)],
        dialDark:Math.random()<0.5,
        bez:0.08+Math.random()*0.14,
        slim:Math.random()<0.5,
        /* an open deal often wears its colour on every clock — but inside a
           casing the box carries the colour and the clocks stay dark */
        accentAll:!cased&&!bw&&Math.random()<0.55,
        accentMode:['ring','dial'][Math.floor(Math.random()*2)]
      };
    }
    cvs.dataset.uniform=uni?'1':'0';
    cvs.dataset.shape=dealShape;

    var accentBudget=bw?0:5+Math.floor(Math.random()*3);
    var order=shuffled(nodes.map(function(_,i){return i;}));
    nodes.forEach(function(n,i){
      var seed=hashSeed((n.f.year*1000+parseInt(n.f.no,10))+(n.f.copy||0)*7919);
      var r=rng(seed);
      var model=Math.floor(r()*15); /* circuit-board face (15) retired */
      r(); /* keep the seed stream stable (shape is deal-level now) */
      var toneRoll=r();
      n.style={
        model:model,
        seed:seed,
        shape:n.forceShape||dealShape,
        tone:toneRoll<0.22?'black':(toneRoll<0.62?'dark':(toneRoll<0.85?'mid':'light')),
        dialDark:toneRoll>=0.85?true:r()<0.15,   /* light rings always get a dark cone — contrast */
        texture:r()<0.18?(r()<0.5?'grille':'ribbed'):null,
        bez:0.08+r()*0.14,
        slim:model===7||r()<0.4,
        accentMode:['ring','dial','hairline'][Math.floor(r()*3)],
        hairForeign:r()<0.5?(r(),null):null, /* off-palette hairlines retired; stream kept stable */
        tinted:r()<0.4,
        off:Math.floor(r()*43200000)
      };
      n.accent=order.indexOf(i)<accentBudget;
      n.foreignHair=(r(),false); /* every colour on the field comes from the theme */
      /* soundbox leftovers from the reference — corner screws + dust-cap dome — show rarely */
      n.style.cornerDots=r()<0.35; /* squares are ~1 in 5 dials, so ≈ one screwed plate per load */
      n.style.dome=r()<0.1;
      if(uni){ /* uniform deal: identical simple watch, per-clock time offset stays */
        n.style.model=uni.model;n.style.tone=uni.tone;
        n.style.dialDark=uni.dialDark;n.style.bez=uni.bez;n.style.slim=uni.slim;
        n.style.texture=null;n.style.tinted=false;n.style.cornerDots=false;n.style.dome=false;
        n.style.accentMode=uni.accentMode;
        n.accent=uni.accentAll;n.foreignHair=false;
      }
      /* the tiny outriders read as dots — no accents, no ornament on them */
      if(n.satTiny){n.accent=false;n.style.texture=null;n.style.cornerDots=false;n.style.dome=false;}
      else if(coreColored){n.accent=true;n.style.accentMode=coreMode;}
    });

    /* symmetry: a mirrored clock is the same clock — style, accent and all */
    function copyStyle(p){
      var A=nodes[p[0]],B=nodes[p[1]];
      B.style=Object.assign({},A.style,{off:B.style.off}); /* own time, same watch */
      B.accent=A.accent;B.foreignHair=A.foreignHair;
    }
    pairsV.forEach(copyStyle);
    pairsH.forEach(copyStyle);
  }

  /* watch renderer — real time */
  function drawWatch(n,hot){
    var R=n.R,cx=n.x,cy=n.y;
    var key=paletteKey,st=n.style;
    var aRing=n.accent&&st.accentMode==='ring';
    var aDial=n.accent&&st.accentMode==='dial';
    var aHair=n.accent&&st.accentMode==='hairline';

    function casePath(scale){
      if(st.shape==='square'){
        var S2=R*0.94*scale,rr=R*0.16*scale;
        ctx.beginPath();
        ctx.moveTo(cx-S2+rr,cy-S2);
        ctx.arcTo(cx+S2,cy-S2,cx+S2,cy+S2,rr);
        ctx.arcTo(cx+S2,cy+S2,cx-S2,cy+S2,rr);
        ctx.arcTo(cx-S2,cy+S2,cx-S2,cy-S2,rr);
        ctx.arcTo(cx-S2,cy-S2,cx+S2,cy-S2,rr);
        ctx.closePath();
      }else if(st.shape==='pill'){
        var w=R*1.08*scale,h=R*0.9*scale,r2=h*0.55;
        ctx.beginPath();
        ctx.moveTo(cx-w+r2,cy-h);
        ctx.arcTo(cx+w,cy-h,cx+w,cy+h,r2);
        ctx.arcTo(cx+w,cy+h,cx-w,cy+h,r2);
        ctx.arcTo(cx-w,cy+h,cx-w,cy-h,r2);
        ctx.arcTo(cx-w,cy-h,cx+w,cy-h,r2);
        ctx.closePath();
      }else if(st.shape==='tv'){
        var tw=R*0.8*scale,th=R*1.02*scale,tr=R*0.18*scale;
        ctx.beginPath();
        ctx.moveTo(cx-tw+tr,cy-th);
        ctx.arcTo(cx+tw,cy-th,cx+tw,cy+th,tr);
        ctx.arcTo(cx+tw,cy+th,cx-tw,cy+th,tr);
        ctx.arcTo(cx-tw,cy+th,cx-tw,cy-th,tr);
        ctx.arcTo(cx-tw,cy-th,cx+tw,cy-th,tr);
        ctx.closePath();
      }else{
        ctx.beginPath();ctx.arc(cx,cy,R*scale,0,7);
      }
    }

    /* ring / frame */
    var ringTones={black:'#101214',dark:'#2e3236',mid:'#6f7377',light:'#c9c9c5'};
    ctx.save();
    if(hot){ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=R*0.7;}
    else if(aRing){ctx.shadowColor=paletteGlow;ctx.shadowBlur=R*0.3;}
    else{ctx.shadowColor='rgba(0,0,0,.15)';ctx.shadowBlur=R*0.12;ctx.shadowOffsetY=R*0.04;}
    ctx.fillStyle=aRing?key:ringTones[st.tone];
    casePath(1);ctx.fill();
    ctx.restore();
    ctx.strokeStyle='rgba(0,0,0,.3)';
    ctx.lineWidth=Math.max(.5,R*0.014);
    casePath(1);ctx.stroke();

    /* square plates carry corner dots — rare */
    if(st.shape==='square'&&st.cornerDots){
      ctx.fillStyle='#141618';
      var d0=R*0.9;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
        ctx.beginPath();ctx.arc(cx+s[0]*d0,cy+s[1]*d0,R*0.09,0,7);ctx.fill();
      });
    }

    /* cone dial — matte, tone-dependent; colored cone if accent-dial */
    var DIAL_FIT={pill:0.8,tv:0.7};
    var Rd=R*(1-st.bez)*(DIAL_FIT[st.shape]||1);
    var g=ctx.createRadialGradient(cx,cy,Rd*0.05,cx,cy,Rd);
    if(aDial){g.addColorStop(0,shade(key,60));g.addColorStop(.65,key);g.addColorStop(1,shade(key,-80));}
    else if(st.tone==='black'&&st.tinted){g.addColorStop(0,shade(key,-95));g.addColorStop(1,shade(key,-130));}
    else if(st.tone==='black'){g.addColorStop(0,'#191b1e');g.addColorStop(1,'#0a0b0d');}
    else if(st.tone==='light'&&!st.dialDark){g.addColorStop(0,'#f2f2ee');g.addColorStop(.7,'#c9c9c4');g.addColorStop(1,'#9a9a94');}
    else if(st.tone==='light'){g.addColorStop(0,'#5c6166');g.addColorStop(.7,'#33373b');g.addColorStop(1,'#1c1f22');}
    else if(st.tone==='mid'){g.addColorStop(0,'#9a9ea2');g.addColorStop(.7,'#5f6368');g.addColorStop(1,'#3c4044');}
    else{g.addColorStop(0,'#5c6166');g.addColorStop(.7,'#33373b');g.addColorStop(1,'#1c1f22');}
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(cx,cy,Rd,0,7);ctx.fill();

    /* textures */
    if(st.texture==='grille'){
      ctx.fillStyle='rgba(0,0,0,.35)';
      var step=Math.max(3,Rd*0.16);
      for(var gy=-Rd;gy<=Rd;gy+=step)for(var gx=-Rd;gx<=Rd;gx+=step){
        if(gx*gx+gy*gy<Rd*Rd*0.72){
          ctx.beginPath();ctx.arc(cx+gx,cy+gy,Math.max(.6,Rd*0.03),0,7);ctx.fill();
        }
      }
    }else if(st.texture==='ribbed'){
      ctx.strokeStyle='rgba(0,0,0,.18)';
      ctx.lineWidth=Math.max(.4,Rd*0.012);
      for(var kk=0.25;kk<0.95;kk+=0.09){
        ctx.beginPath();ctx.arc(cx,cy,Rd*kk,0,7);ctx.stroke();
      }
    }

    /* thin hairline rings — theme on accents, foreign colors on a few greys */
    if(aHair||n.foreignHair){
      ctx.strokeStyle=key;
      ctx.lineWidth=Math.max(.8,Rd*0.02);
      ctx.beginPath();ctx.arc(cx,cy,Rd*0.8,0,7);ctx.stroke();
    }

    var light=(st.tone==='light'&&!st.dialDark&&!aDial);
    var faint=light?'rgba(25,28,30,.3)':'rgba(0,0,0,.4)';
    var mid=Math.max(.8,R*0.03), soft=Math.max(.6,R*0.02);

    ctx.strokeStyle=faint;ctx.fillStyle=faint;
    switch(st.model){
      case 0:
        ctx.lineWidth=mid;
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.78,0,7);ctx.stroke();
        break;
      case 1:
        ctx.lineWidth=Math.max(1,R*0.045);
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.7,0,7);ctx.stroke();
        break;
      case 2:
        ctx.lineWidth=soft;
        [0.8,0.6,0.4].forEach(function(k){ctx.beginPath();ctx.arc(cx,cy,Rd*k,0,7);ctx.stroke();});
        break;
      case 3:
        ctx.lineWidth=Math.max(1.4,R*0.09);
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.58,0,7);ctx.stroke();
        break;
      case 4:
        ctx.lineWidth=soft;
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.82,0,7);ctx.stroke();
        ctx.lineWidth=mid;
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.5,0,7);ctx.stroke();
        break;
      case 5:
        for(var q=0;q<4;q++){
          var a5=q*Math.PI/2+Math.PI/4;
          ctx.beginPath();ctx.arc(cx+Math.cos(a5)*Rd*0.84,cy+Math.sin(a5)*Rd*0.84,Rd*0.05,0,7);ctx.fill();
        }
        break;
      case 6:
        for(var t6=0;t6<14;t6++){
          var a6=t6/14*Math.PI*2;
          ctx.beginPath();ctx.arc(cx+Math.cos(a6)*Rd*0.72,cy+Math.sin(a6)*Rd*0.72,Rd*0.05,0,7);ctx.fill();
        }
        break;
      case 10:
        for(var t10=0;t10<60;t10++){
          var a10=t10/60*Math.PI*2;var maj=t10%5===0;
          ctx.lineWidth=Math.max(.4,R*(maj?0.014:0.006));
          ctx.beginPath();
          ctx.moveTo(cx+Math.cos(a10)*Rd*(maj?0.82:0.86),cy+Math.sin(a10)*Rd*(maj?0.82:0.86));
          ctx.lineTo(cx+Math.cos(a10)*Rd*0.92,cy+Math.sin(a10)*Rd*0.92);ctx.stroke();
        }
        break;
      case 11:
        for(var t11=0;t11<12;t11++){
          var a11=t11/12*Math.PI*2;
          ctx.lineWidth=mid;
          ctx.beginPath();
          ctx.moveTo(cx+Math.cos(a11)*Rd*0.76,cy+Math.sin(a11)*Rd*0.76);
          ctx.lineTo(cx+Math.cos(a11)*Rd*0.9,cy+Math.sin(a11)*Rd*0.9);ctx.stroke();
        }
        break;
      case 13: case 14:
        ctx.lineWidth=soft;
        ctx.beginPath();ctx.moveTo(cx-Rd*0.84,cy);ctx.lineTo(cx+Rd*0.84,cy);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx,cy-Rd*0.84);ctx.lineTo(cx,cy+Rd*0.84);ctx.stroke();
        break;
      case 15:{ /* exposed circuit board (U-Boat capsule) */
        var cr=rng(st.seed+7);
        ctx.fillStyle=shade(key,-95); /* the board wears the theme, never a foreign green */
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.86,0,7);ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=Math.max(.5,Rd*0.02);
        ctx.beginPath();ctx.arc(cx,cy,Rd*0.86,0,7);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.7)';ctx.fillStyle='rgba(255,255,255,.7)';
        ctx.lineWidth=Math.max(.5,Rd*0.015);
        for(var tr2=0;tr2<5;tr2++){
          var ta=cr()*6.283,td=cr()*Rd*0.5;
          var ax=cx+Math.cos(ta)*td,ay=cy+Math.sin(ta)*td;
          var bx=ax+(cr()-0.5)*Rd*0.5,by=ay;
          var ex=bx,ey=ay+(cr()-0.5)*Rd*0.5;
          ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();
          ctx.beginPath();ctx.arc(ax,ay,Rd*0.028,0,7);ctx.fill();
          ctx.beginPath();ctx.arc(ex,ey,Rd*0.028,0,7);ctx.fill();
        }
        for(var rs=0;rs<3;rs++){
          var ra=cr()*6.283,rdd=cr()*Rd*0.5;
          var rx=cx+Math.cos(ra)*rdd,ry=cy+Math.sin(ra)*rdd;
          ctx.save();
          ctx.translate(rx,ry);
          if(cr()<0.5)ctx.rotate(Math.PI/2);
          var L2=Rd*0.3,Wd=Rd*0.11,hw2=L2/2,hh2=Wd/2,rr3=hh2*0.9;
          ctx.strokeStyle='#d9d9d4';ctx.lineWidth=Math.max(.5,Rd*0.018);
          ctx.beginPath();ctx.moveTo(-L2*0.72,0);ctx.lineTo(L2*0.72,0);ctx.stroke();
          ctx.fillStyle=shade(key,70);
          ctx.beginPath();
          ctx.moveTo(-hw2+rr3,-hh2);
          ctx.arcTo(hw2,-hh2,hw2,hh2,rr3);ctx.arcTo(hw2,hh2,-hw2,hh2,rr3);
          ctx.arcTo(-hw2,hh2,-hw2,-hh2,rr3);ctx.arcTo(-hw2,-hh2,hw2,-hh2,rr3);
          ctx.closePath();ctx.fill();
          ctx.fillStyle='#1a1c1e';
          ctx.fillRect(-hw2*0.55,-hh2,Wd*0.2,Wd);
          ctx.fillRect(-hw2*0.05,-hh2,Wd*0.2,Wd);
          ctx.fillRect(hw2*0.4,-hh2,Wd*0.2,Wd);
          ctx.restore();
        }
        for(var cs=0;cs<2;cs++){
          var ca=cr()*6.283,cd=cr()*Rd*0.5;
          var ox=cx+Math.cos(ca)*cd,oy=cy+Math.sin(ca)*cd;
          ctx.fillStyle=key;
          ctx.beginPath();ctx.arc(ox,oy,Rd*0.085,0,7);ctx.fill();
          ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=Math.max(.4,Rd*0.012);
          ctx.beginPath();ctx.arc(ox,oy,Rd*0.085,0,7);ctx.stroke();
        }
        ctx.fillStyle='#15181b';
        ctx.fillRect(cx-Rd*0.15,cy+Rd*0.42,Rd*0.3,Rd*0.17);
        break;}
      /* 7,8,9,12: clean-ish faces, dust-cap dome below carries them */
    }

    /* dust-cap dome — the bright center of the reference cones — rare */
    if((st.model===7||st.model===8||st.model===9||st.model===12||st.tone==='light')&&st.model<15&&st.dome){
      var Rc=Rd*0.22;
      var dome=ctx.createRadialGradient(cx-Rc*0.35,cy-Rc*0.4,Rc*0.05,cx,cy,Rc);
      if(light){dome.addColorStop(0,'#ffffff');dome.addColorStop(1,'#8f8f8a');}
      else{dome.addColorStop(0,'#b9bdc1');dome.addColorStop(1,'#26292c');}
      ctx.fillStyle=dome;
      ctx.beginPath();ctx.arc(cx,cy,Rc,0,7);ctx.fill();
    }

    /* live time, shifted per film — every face is analog now */
    {
      var now=new Date(Date.now()+st.off);
      var ms=now.getMilliseconds();
      var sec=now.getSeconds()+ms/1000;
      var min=now.getMinutes()+sec/60;
      var hr=(now.getHours()%12)+min/60;
      var hA=hr/12*Math.PI*2-Math.PI/2;
      var mA=min/60*Math.PI*2-Math.PI/2;
      var sA=sec/60*Math.PI*2-Math.PI/2;

      var inkH=(st.tone==='black'||st.tone==='dark')&&!aDial?'rgba(200,203,206,.85)':'#14171a';
      var hw=st.slim?0.04:0.06,mw=st.slim?0.026:0.038;
      ctx.strokeStyle=inkH;ctx.lineCap='round';
      ctx.lineWidth=Math.max(1.2,R*hw);
      ctx.beginPath();ctx.moveTo(cx-Math.cos(hA)*Rd*0.08,cy-Math.sin(hA)*Rd*0.08);
      ctx.lineTo(cx+Math.cos(hA)*Rd*0.44,cy+Math.sin(hA)*Rd*0.44);ctx.stroke();
      ctx.lineWidth=Math.max(.9,R*mw);
      ctx.beginPath();ctx.moveTo(cx-Math.cos(mA)*Rd*0.1,cy-Math.sin(mA)*Rd*0.1);
      ctx.lineTo(cx+Math.cos(mA)*Rd*0.66,cy+Math.sin(mA)*Rd*0.66);ctx.stroke();
      ctx.strokeStyle=n.accent?key:inkH;
      ctx.lineWidth=Math.max(.7,R*0.016);
      ctx.beginPath();ctx.moveTo(cx-Math.cos(sA)*Rd*0.14,cy-Math.sin(sA)*Rd*0.14);
      ctx.lineTo(cx+Math.cos(sA)*Rd*0.7,cy+Math.sin(sA)*Rd*0.7);ctx.stroke();
      ctx.lineCap='butt';

      ctx.fillStyle=inkH;
      ctx.beginPath();ctx.arc(cx,cy,Math.max(1.1,Rd*0.06),0,7);ctx.fill();
    }
  }

  function renderField(){
    /* hover = glow only; the dial keeps its place in the stack */
    ctx.clearRect(0,0,W,H);
    if(casings.length){
      /* one path, one fill, one shadow — overlapping slabs merge seamlessly */
      ctx.save();
      ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;
      ctx.fillStyle=paletteKey;
      ctx.beginPath();
      casings.forEach(function(c){ctx.rect(c.x,c.y,c.w,c.h);});
      ctx.fill();
      ctx.restore();
    }
    nodes.forEach(function(n,i){drawWatch(n,i===hover);});
  }
  (function loop(){
    try{
      if(nodes.length && !app.classList.contains('browse') && !pl.classList.contains('show')) renderField();
      /* the index placeholder clock ticks even while the field sleeps */
      if(typeof prevEl!=='undefined'&&prevEl&&phActive())drawPlaceholder();
    }catch(e){} /* one bad frame must never kill the loop */
    requestAnimationFrame(loop);
  })();

  function sizeField(){
    W=innerWidth;H=innerHeight;
    cvs.width=W*DPR;cvs.height=H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    layoutField();
  }
  function rearrange(){ /* same as a fresh page load: new theme + arrangement + film count */
    theme=THEMES[Math.floor(Math.random()*THEMES.length)];
    fieldMult=[1,1,1,2,2,3][Math.floor(Math.random()*6)];
    layoutField();
  }
  addEventListener('resize',sizeField);
  addEventListener('resize',function(){if(app.classList.contains('browse')&&typeof sizePreview==='function')sizePreview();});
  /* preview iframes settle late — re-measure once after load */
  setTimeout(function(){if(innerWidth!==W||innerHeight!==H)sizeField();},400);

  function hitTest(x,y){
    for(var i=nodes.length-1;i>=0;i--){
      var n=nodes[i];
      if(Math.hypot(x-n.x,y-n.y)<Math.max(n.R*1.15,26))return i;
    }
    return -1;
  }
  function refCode(f){return f.code||f.year+'-'+String(parseInt(f.no,10)).padStart(2,'0');}
  cvs.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;
    var prev=hover;
    hover=hitTest(e.clientX,e.clientY);
    cvs.style.cursor=hover>=0?'pointer':'default';
    if(hover!==prev)tcEl.textContent=hover>=0?refCode(nodes[hover].f):'';
  });
  cvs.addEventListener('pointerdown',function(e){
    var i=hitTest(e.clientX,e.clientY);
    if(i<0){if(e.pointerType==='touch')tcEl.textContent='';return;}
    tcEl.textContent=refCode(nodes[i].f);
    var f=nodes[i].f;
    if(f.p && f.p.film) openPlayer(f.p);
  });

  // ── view toggle + radio ─────────────────────────────────────────
  /* view navigation lives in the radio section (needs the player helpers) */

  /* radio — plays a YouTube playlist; current track title bottom-left */
  var radioBtn=app.querySelector('#me-radio');
  var musicEl=app.querySelector('#me-music');
  var brandEl=app.querySelector('#me-brand');
  function updateBrand(){
    /* the mark always reads dial — cinema and radio sit top right on every view */
    brandEl.textContent='dial';
  }
  var ytPlayer=null,ytReady=false,radioPlaying=false,titleTimer=null,ytJumped=false;
  var musicIn=document.createElement('span');musicIn.className='in';musicEl.appendChild(musicIn);
  var lastTitle='';
  function cleanTitle(t){
    /* song name only — no artist prefix, nothing in brackets */
    t=String(t||'').replace(/\s*[\(\[][^\)\]]*[\)\]]\s*/g,' ');
    var ix=t.indexOf(' - ');
    if(ix>-1)t=t.slice(ix+3);
    return t.replace(/\s+/g,' ').trim();
  }
  function setTitle(t){
    /* full title always readable — marquee back and forth when wider than the label */
    if(t===lastTitle) return;
    lastTitle=t;
    musicIn.textContent=t;
    /* a playing title takes the radio word's place in the corner */
    app.classList.toggle('titled',!!t&&radioPlaying);
    musicEl.classList.remove('scroll');
    musicIn.style.removeProperty('--me-shift');
    if(!t) return;
    var over=musicIn.scrollWidth-musicEl.clientWidth;
    if(over>2){
      musicIn.style.setProperty('--me-shift',(-over)+'px');
      musicIn.style.animationDuration=Math.max(4,over/25)+'s';
      musicEl.classList.add('scroll');
    }
  }
  function updateTitle(){
    if(!radioPlaying||!ytPlayer||!ytPlayer.getVideoData){setTitle('');return;}
    try{var d=ytPlayer.getVideoData();setTitle(cleanTitle((d&&d.title)?d.title:''));}catch(e){}
    /* the dial never moves by itself — stations loop their own broadcast and
       tuning is entirely in the user's hand (plus the initial random park).
       the periodic pass keeps the near-station title fresh once its video
       has actually loaded */
    if(app.classList.contains('radio-mode'))tuneAudio();
  }
  function startPlayback(){
    /* first start per load: the set wakes up tuned to a random station,
       mid-broadcast, never the same one twice in a row */
    try{
      if(!ytJumped){
        var list=SONG_IDS.length?SONG_IDS:(ytPlayer.getPlaylist()||[]);
        if(list.length){
          ytJumped=true;
          if(!SONG_IDS.length)SONG_IDS=list.slice();
          var last=-1;try{last=parseInt(localStorage.getItem('me-radio-last'),10);}catch(e){}
          var i=Math.floor(Math.random()*list.length);
          if(i===last)i=(i+1)%list.length;
          try{localStorage.setItem('me-radio-last',String(i));}catch(e){}
          tuneLoad(list[i]);
          bandId=list[i];
          if(bandTicks[list[i]])parkDial(list[i]);else pendingDial=list[i];
        }
      }else{
        ytPlayer.playVideo();
      }
    }catch(e){}
  }
  function ensureYT(){
    if(document.getElementById('me-yt-api')) return;
    var holder=document.createElement('div');holder.id='me-yt';
    holder.style.cssText='position:fixed;left:-9999px;bottom:0;width:200px;height:200px;';
    document.body.appendChild(holder);
    window.onYouTubeIframeAPIReady=function(){
      ytPlayer=new YT.Player('me-yt',{
        width:200,height:200,
        playerVars:{listType:'playlist',list:MUSIC_PLAYLIST},
        events:{
          onReady:function(){ytReady=true;buildSongs();if(radioPlaying)startPlayback();},
          onStateChange:function(ev){
            buildSongs();
            /* every station is a broadcast that has been running since epoch:
               on the first PLAYING after a load, jump to where the song would
               be right now (wall clock mod duration, never the last seconds).
               the mute-hold releases only once the seek has landed, so neither
               the cut nor the 0:00 start is ever audible — the new signal
               ramps in from under the static */
            if(ev&&ev.data===1){
              if(pendingSeek&&pendingSeek===currentVid()){
                pendingSeek=null;
                try{
                  var dur=ytPlayer.getDuration();
                  if(dur&&dur>60)ytPlayer.seekTo((Date.now()/1000)%(dur-20)+8,true);
                }catch(e){}
              }
              if(muteHold&&!pendingSeek){muteHold=false;rampMusic(lawVol,350);}
            }
            /* a station never plays another station's song: at the end of the
               video the broadcast simply loops */
            if(ev&&ev.data===0){try{ytPlayer.seekTo(0,true);ytPlayer.playVideo();}catch(e){}}
            if(!ytJumped&&radioPlaying)startPlayback();
            updateTitle();
          }
        }
      });
    };
    var s=document.createElement('script');s.id='me-yt-api';s.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  ensureYT(); /* preload cued player so the radio click starts playback inside the gesture */
  function buildSongs(){
    /* build the tuning band once the playlist is known */
    try{
      var l=ytPlayer&&ytPlayer.getPlaylist?ytPlayer.getPlaylist():null;
      if(l&&l.length&&!SONG_IDS.length)buildBand();
    }catch(e){}
  }

  /* ── radio tuning band — every song a tick on the scale ────────── */
  var bandEl=document.createElement('div');bandEl.id='me-band';
  bandEl.innerHTML='<div id="me-band-in"></div>';
  app.appendChild(bandEl);
  var bandIn=bandEl.querySelector('#me-band-in');
  var RADIO_META={},bandTicks={},bandId=null,SONG_IDS=[],needleEl=null,bNote=null,bTitle=null,bFreq=null;

  /* ── tuner audio: radio static in the void between stations. the noise is
     generated (looped white noise through a lowpass — no assets), and the
     nearest station's signal crossfades in as the needle approaches it.
     the YouTube iframe can't be routed through Web Audio, but its volume can
     be driven, which is all a crossfade needs. */
  var AC=null,staticGain=null;
  function ensureStatic(){
    if(AC){try{if(AC.state==='suspended')AC.resume();}catch(e){}return;}
    try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    var len=Math.floor(AC.sampleRate*2),buf=AC.createBuffer(1,len,AC.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
    var src=AC.createBufferSource();src.buffer=buf;src.loop=true;
    var lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
    staticGain=AC.createGain();staticGain.gain.value=0;
    src.connect(lp);lp.connect(staticGain);staticGain.connect(AC.destination);
    src.start();
  }
  function setStatic(v){
    if(!AC||!staticGain)return;
    try{
      var t=AC.currentTime;
      staticGain.gain.cancelScheduledValues(t);
      staticGain.gain.setTargetAtTime(v*0.18,t,0.06); /* a proper hiss — present, not painful */
    }catch(e){}
  }
  /* a station switch must never be heard: while a load+broadcast-seek is in
     flight the music is held at zero under the static, and only ramps back in
     once the new signal is actually sitting mid-song. the onset ramp chases
     the live law value, so a moving hand stays in charge */
  var muteHold=false,lawVol=0,volRAF=null,rampUntil=0;
  function setMusicVol(v){
    lawVol=v;
    if(muteHold){try{ytPlayer.setVolume(0);}catch(e){}return;}
    if(performance.now()<rampUntil)return; /* the onset ramp is chasing lawVol */
    try{ytPlayer.setVolume(Math.round(v*100));}catch(e){}
  }
  function rampMusic(target,ms){
    lawVol=target;
    var from=0;try{from=ytPlayer.getVolume();}catch(e){}
    var t0=performance.now();rampUntil=t0+ms;
    cancelAnimationFrame(volRAF);
    (function step(now){
      var u=Math.min(1,(now-t0)/ms);
      try{ytPlayer.setVolume(Math.round(from+(lawVol*100-from)*u));}catch(e){}
      if(u<1)volRAF=requestAnimationFrame(step);else rampUntil=0;
    })(t0);
  }
  fetch(RADIO_URL,{cache:'no-cache'}).then(function(r){return r.json();})
    .then(function(j){RADIO_META=(j&&j.tracks)||{};buildBand();})
    .catch(function(){buildBand();});
  function hzFor(id){
    /* each track's number is its measured average audio frequency (spectral centroid, Hz) */
    var m=RADIO_META[id];
    if(m){
      if(typeof m.hz==='number')return m.hz;
      if(typeof m.khz==='number')return Math.round(m.khz*1000); /* legacy data */
    }
    var h=0;for(var i=0;i<id.length;i++){h=(h*31+id.charCodeAt(i))>>>0;}
    return 800+(h%2400);
  }
  function noteFor(id){var m=RADIO_META[id];return (m&&m.note)?String(m.note).toLowerCase():'';}
  /* the dial reads as FM — each song's measured spectral frequency decides its
     ORDER and spread on the scale, remapped into the 88-108 mhz band */
  var FM_LO=88,FM_HI=108;
  function mhzFor(ids,id){
    var hzs=ids.map(hzFor);
    var mn=Math.min.apply(null,hzs),mx=Math.max.apply(null,hzs);
    var u=mx>mn?(hzFor(id)-mn)/(mx-mn):0.5;
    return 88.9+u*(107.1-88.9);
  }
  function fmtMhz(m){return m.toFixed(1);} /* the dial speaks in plain numbers */
  function bandAccent(){return theme.key;}
  function buildBand(){
    var ids=SONG_IDS.length?SONG_IDS.slice():null;
    if(!ids){try{ids=ytPlayer&&ytPlayer.getPlaylist?ytPlayer.getPlaylist():null;}catch(e){return;}}
    if(!ids||!ids.length)return;
    SONG_IDS=ids.slice();
    /* the dial is a wheel: one cycle covers 88..108 plus a half-tick seam
       back to 88, and the strip carries three joined copies so the viewport
       is never empty — crossing the seam just re-normalises the position */
    var CY=FM_HI-FM_LO+0.5;
    var px=Math.max(72,Math.round((bandEl.clientWidth||innerWidth)*1.4/CY)); /* px per mhz */
    var P=CY*px,x0=P;                              /* world x of 88.0, middle copy */
    bandIn.style.width=(3*P)+'px';
    bandCal={x0:x0,P:P,px:px};
    bandIn.classList.remove('glide');
    bandIn.innerHTML='';
    /* both rules run the full strip — the scale never visibly ends */
    var rF=document.createElement('div');rF.className='rule';
    rF.style.left='0';rF.style.width=(3*P)+'px';rF.style.top='100px';
    bandIn.appendChild(rF);
    var rA=document.createElement('div');rA.className='rule';
    rA.style.left='0';rA.style.width=(3*P)+'px';rA.style.top='134px';
    bandIn.appendChild(rA);
    var la=Math.log(550),lb=Math.log(1600);
    bandTicks={};
    for(var k=-1;k<=1;k++){
      var off=x0+k*P;
      /* fm graduation: plain numbers on the majors, like the printed dial */
      for(var m=FM_LO;m<=FM_HI+0.001;m+=0.5){
        var mj=Math.abs(m/2-Math.round(m/2))<0.001;
        var gt=document.createElement('div');
        gt.className='g-tick'+(mj?' major':'');
        gt.style.left=(off+(m-FM_LO)*px)+'px';
        gt.style.top=mj?'88px':'94px';
        gt.style.height=mj?'12px':'6px';
        bandIn.appendChild(gt);
        if(mj){
          var gl=document.createElement('div');gl.className='g-label';
          gl.style.left=(off+(m-FM_LO)*px)+'px';gl.textContent=String(Math.round(m));
          bandIn.appendChild(gl);
        }
      }
      /* decorative am row, log-spaced across the cycle */
      [550,600,700,800,1000,1200,1400,1600].forEach(function(f){
        var ax=off+(Math.log(f)-la)/(lb-la)*(P-px*0.5);
        var at=document.createElement('div');at.className='g-tick major';
        at.style.left=ax+'px';at.style.top='134px';at.style.height='8px';
        bandIn.appendChild(at);
        var al=document.createElement('div');al.className='g-label am';
        al.style.left=ax+'px';al.textContent=String(f);
        bandIn.appendChild(al);
      });
      /* stations repeat in every copy so the wheel finds them from any side */
      ids.forEach(function(id){
        var sm=mhzFor(ids,id),sx=off+(sm-FM_LO)*px;
        var s=document.createElement('div');s.className='station';
        s.style.left=sx+'px';
        s.innerHTML='<i></i>';
        bandIn.appendChild(s);
        if(!bandTicks[id])bandTicks[id]={x:x0+(sm-FM_LO)*px,mhz:sm,note:noteFor(id),els:[]};
        bandTicks[id].els.push(s.querySelector('i'));
      });
    }
    /* the glass chrome — needle, readouts, band designations — built once */
    if(!needleEl){
      needleEl=document.createElement('div');needleEl.className='needle';
      bNote=document.createElement('div');bNote.className='b-note';
      bTitle=document.createElement('div');bTitle.className='b-title';
      bFreq=document.createElement('div');bFreq.className='b-freq';
      var tF=document.createElement('div');tF.className='g-unit';tF.style.top='70px';tF.textContent='fm';
      var tA=document.createElement('div');tA.className='g-unit';tA.style.top='142px';tA.textContent='am';
      bandEl.appendChild(needleEl);bandEl.appendChild(bNote);bandEl.appendChild(bTitle);
      bandEl.appendChild(bFreq);bandEl.appendChild(tF);bandEl.appendChild(tA);
    }
    paintDial();
    if(pendingDial&&bandTicks[pendingDial]){var pd=pendingDial;pendingDial=null;bandId=pd;parkDial(pd);}
    /* a rebuild can remap stations (radio.json landing after the first build):
       an untouched dial follows its station to the new position */
    else if(!dialTouched&&bandId&&bandTicks[bandId])parkDial(bandId);
    else setDial(dialU>=0?x0+dialU*P:x0+P/2,false);
  }
  function paintDial(){
    /* the theme colour lives on the needle and the note */
    if(!needleEl)return;
    needleEl.style.background=bandAccent();
    bNote.style.color=bandAccent();
  }

  /* ── the wheel: the needle is fixed dead centre and the scale slides under
     it, like a tuning wheel seen head-on. drag to spin — with momentum, no
     snapping — and the set sits wherever you leave it. static hisses in the
     void; the nearest station's broadcast fades in with proximity, and its
     note and title only appear once you are near. */
  var bandCal=null,dialNx=-1,dialU=-1,pendingDial=null,pendingSeek=null;
  var wheelGrab=null,wheelV=0,wheelRAF=null,tuneQueuedId=null,tuneLoadTimer=null,dialTouched=false;
  function nearestStation(x){
    /* distance on the circle — a station just past the seam is still close */
    var best=null;
    Object.keys(bandTicks).forEach(function(id){
      var d0=Math.abs(bandTicks[id].x-x)%bandCal.P;
      var d=Math.min(d0,bandCal.P-d0);
      if(!best||d<best.d)best={id:id,d:d,x:bandTicks[id].x};
    });
    return best;
  }
  function mhzAt(x){
    if(!bandCal)return FM_LO;
    var m=FM_LO+(x-bandCal.x0)/bandCal.px;
    if(m>FM_HI+0.25)m-=FM_HI-FM_LO+0.5; /* the seam half-tick reads as low 88s */
    return m;
  }
  function tuneZone(){return bandCal?bandCal.px*1.1:40;} /* ≈1.1 mhz of signal */
  function currentVid(){
    var v='';try{var d=ytPlayer.getVideoData();v=(d&&d.video_id)||'';}catch(e){}
    return v;
  }
  function tuneLoad(id){
    /* single-video load: a station can only ever play its own song, and the
       broadcast-time seek lands mid-song before the hold releases */
    pendingSeek=id;
    muteHold=true;
    cancelAnimationFrame(volRAF);
    try{ytPlayer.setVolume(0);}catch(e){}
    try{ytPlayer.loadVideoById({videoId:id});}catch(e){}
  }
  function setDial(nx,glide){
    if(!bandCal)return;
    /* the wheel has no ends — position wraps around the cycle. the strip
       repeats with the same period, so the re-normalising jump is invisible */
    nx=bandCal.x0+(((nx-bandCal.x0)%bandCal.P)+bandCal.P)%bandCal.P;
    dialNx=nx;dialU=(nx-bandCal.x0)/bandCal.P;
    bandIn.classList.toggle('glide',!!glide);
    bandIn.style.transform='translateX('+((bandEl.clientWidth||innerWidth)/2-nx)+'px)';
  }
  function parkDial(id){
    if(!bandTicks[id])return;
    setDial(bandTicks[id].x,true);
    tuneAudio();
  }
  function proxAt(x){
    var d0=Math.abs(x-dialNx)%bandCal.P;
    var d=Math.min(d0,bandCal.P-d0);
    return Math.max(0,1-d/tuneZone());
  }
  function tuneAudio(){
    if(!bandCal||dialNx<0||!needleEl)return;
    var st=nearestStation(dialNx);if(!st)return;
    var pn=Math.max(0,1-st.d/tuneZone());
    if(radioPlaying){
      /* what you hear is the PLAYING station at its own signal strength —
         leaving it fades it naturally even while another station is nearer */
      var cur=currentVid();
      var pp=bandTicks[cur]?proxAt(bandTicks[cur].x):0;
      var v=pp*pp;
      setMusicVol(v);
      setStatic(1-(muteHold?0:v));
      /* the nearer station takes over — loaded under the hold, so the
         handover happens in silence beneath the hiss */
      if(pn>0.35&&st.id!==cur&&st.id!==tuneQueuedId){
        tuneQueuedId=st.id;
        clearTimeout(tuneLoadTimer);
        var qid=st.id;
        tuneLoadTimer=setTimeout(function(){bandId=qid;tuneLoad(qid);},180);
      }
      if(pn<0.3)tuneQueuedId=null;
    }
    var prox=pn;
    var near=prox>0.55;
    bandEl.classList.toggle('near',near);
    Object.keys(bandTicks).forEach(function(id){
      var bg=(near&&id===st.id)?bandAccent():'';
      bandTicks[id].els.forEach(function(el){el.style.background=bg;});
    });
    if(near){
      bNote.textContent=bandTicks[st.id].note||'';
      var tt='';
      if(st.id===currentVid()){try{var d=ytPlayer.getVideoData();tt=(d&&d.title)||'';}catch(e){}}
      bTitle.textContent=cleanTitle(tt);
    }
    bFreq.textContent=fmtMhz(mhzAt(dialNx));
  }
  bandEl.addEventListener('pointerdown',function(ev){
    if(!bandCal)return;
    ensureStatic();
    armRadio(); /* touching the dial switches the set on — hiss and all */
    dialTouched=true;
    cancelAnimationFrame(wheelRAF);
    bandIn.classList.remove('glide');
    wheelGrab={px:ev.clientX,nx:dialNx<0?bandCal.x0+bandCal.P/2:dialNx,t:performance.now()};
    wheelV=0;
    try{bandEl.setPointerCapture(ev.pointerId);}catch(e){}
    ev.preventDefault();
  });
  bandEl.addEventListener('pointermove',function(ev){
    if(!wheelGrab)return;
    var now=performance.now();
    /* dragging the glass right spins lower frequencies under the needle */
    var prev=dialNx;
    setDial(wheelGrab.nx-(ev.clientX-wheelGrab.px),false);
    /* a real wheel is heavily damped: floor the event delta and cap the spin
       so a flick nudges the dial rather than hurling it across the band */
    var dt=Math.max(8,now-wheelGrab.t);
    wheelV=0.8*wheelV+0.2*((dialNx-prev)/dt);
    wheelV=Math.max(-0.6,Math.min(0.6,wheelV));
    wheelGrab.t=now;
    tuneAudio();
  });
  function wheelRelease(){
    if(!wheelGrab)return;
    wheelGrab=null;
    /* momentum: the wheel coasts and settles on friction — never snapping */
    var last=performance.now();
    cancelAnimationFrame(wheelRAF);
    wheelRAF=requestAnimationFrame(function coast(now){
      var dt=Math.min(48,now-last);last=now;
      if(Math.abs(wheelV)>0.02){
        setDial(dialNx+wheelV*dt,false); /* no end stops — friction alone brakes */
        wheelV*=Math.exp(-dt/200);
        tuneAudio();
        wheelRAF=requestAnimationFrame(coast);
      }
    });
  }
  bandEl.addEventListener('pointerup',wheelRelease);
  bandEl.addEventListener('pointercancel',wheelRelease);
  function exitBandAudio(){
    /* static belongs to the radio view alone. leaving with a station audible
       commits to it at full volume; leaving deep in the void lets the set
       power down quietly */
    setStatic(0);
    clearTimeout(tuneLoadTimer);
    cancelAnimationFrame(wheelRAF);wheelGrab=null;wheelV=0;
    if(!radioPlaying)return;
    var st=dialNx>=0?nearestStation(dialNx):null;
    var prox=st?Math.max(0,1-st.d/tuneZone()):0;
    if(prox>0.45)rampMusic(1,400);
    else stopRadio();
  }
  addEventListener('resize',function(){ if(SONG_IDS.length)buildBand(); });
  function updateModeClass(){
    app.classList.toggle('radio-mode', fieldMode==='radio' && !app.classList.contains('browse'));
  }
  function stopRadio(){
    setStatic(0); /* the hiss dies with the music */
    if(!radioPlaying) return;
    radioPlaying=false;
    radioBtn.classList.remove('playing');
    app.classList.remove('radio-on');
    if(ytReady){try{ytPlayer.pauseVideo();}catch(e){}}
    clearInterval(titleTimer);setTitle('');
    updateBrand();
  }
  function armRadio(){
    if(radioPlaying) return;
    radioPlaying=true;
    radioBtn.classList.add('playing');
    app.classList.add('radio-on');
    clearInterval(titleTimer);titleTimer=setInterval(updateTitle,800);
    updateBrand();
  }
  /* three views, two buttons: film and radio open their view; clicking the
     view you are already on returns to the main dial page. music is untouched
     by navigation — only stop or opening a film ends it. */
  function currentView(){
    return app.classList.contains('browse')?'film':(fieldMode==='radio'?'radio':'dial');
  }
  function goDial(){
    exitBandAudio();
    app.classList.remove('browse');
    fieldMode='dial';
    rearrange(); /* returning home always deals a fresh composition */
    tcEl.textContent='';hover=-1;
    radioBtn.setAttribute('aria-pressed','false');
    updateModeClass();updateBrand();
  }
  function goFilm(){
    exitBandAudio();
    app.classList.add('browse');
    tcEl.textContent='';hover=-1;
    radioBtn.setAttribute('aria-pressed','false');
    updateModeClass();updateBrand();
    /* the panel opens with a clock and waits for a hover */
    requestAnimationFrame(function(){try{sizePreview();setPreview(null);}catch(e){}});
  }
  function goRadio(){
    fieldMode='radio';
    app.classList.remove('browse');
    rearrange();
    armRadio();
    if(ytReady)startPlayback();
    radioBtn.setAttribute('aria-pressed','true');
    updateModeClass();
    paintDial();tuneAudio(); /* theme re-rolled — refresh needle and readouts */
    updateBrand();
  }
  app.querySelector('#me-btnview').addEventListener('click', function(){
    if(currentView()==='film')goDial();else goFilm();
  });
  radioBtn.addEventListener('click', function(){
    if(currentView()==='radio')goDial();else goRadio();
  });
  /* the title stands where the radio word stood — it answers the same way */
  musicEl.addEventListener('click', function(){
    if(currentView()==='radio')goDial();else goRadio();
  });
  app.querySelector('#me-btnabout').addEventListener('click', function(){ openAboutScreen(); });
  app.querySelector('#me-stop').addEventListener('click', stopRadio);
  brandEl.addEventListener('click', function(){ goDial(); }); /* the mark always leads home */

  // ── data + render list ──────────────────────────────────────────
  fetch(DATA_URL,{cache:"no-cache"}).then(function(r){return r.json();}).then(function(d){
    PROJECTS=(d.projects||[]).filter(function(p){return p.published!==false;});
    var html='<div class="me-row head"><span>Year</span><span>№</span><span>Client</span><span>Title</span><span>Category</span></div>';
    PROJECTS.forEach(function(p,i){
      var no=p.num||String(i+1).padStart(3,'0');
      html+='<div class="me-row" data-i="'+i+'">'+
        '<span data-field="year" data-value="'+esc(p.year)+'">'+esc(p.year)+'</span>'+
        '<span>'+no+'</span>'+
        '<span data-field="client" data-value="'+esc(p.client)+'">'+esc(p.client)+'</span>'+
        '<span>'+esc(p.title)+'</span>'+
        '<span data-field="type" data-value="'+esc(p.type||'')+'">'+esc(p.type||'')+'</span>'+
      '</div>';
    });
    listEl.innerHTML=html;

    /* film clocks — About and song clocks join in fieldEntries() */
    FILM_DIALS=PROJECTS.map(function(p,i){
      return {kind:'film',year:+p.year||0,no:p.num||String(i+1).padStart(3,'0'),client:p.client,title:p.title,cat:p.type||'',p:p};
    });
    sizeField();
  }).catch(function(e){ console.error('[site-data]',e); listEl.textContent='Could not load projects.'; });

  // ── about ───────────────────────────────────────────────────────
  function buildAboutHTML(){
    var igUrl='https://instagram.com/'+ABOUT_INSTAGRAM.replace('@','');
    return esc(ABOUT_TEXT).replace(/\n/g,'<br>')+'<br><br>'+
      '<a href="'+igUrl+'" target="_blank" rel="noopener">'+esc(ABOUT_INSTAGRAM)+'</a><br>'+
      '<a href="mailto:'+ABOUT_EMAIL+'">'+esc(ABOUT_EMAIL)+'</a>';
  }
  // ── list interactions ───────────────────────────────────────────
  function isMobile(){ return window.matchMedia('(max-width:700px)').matches; }
  function rows(){ return listEl.querySelectorAll('.me-row:not(.head)'); }
  function rowMatchesField(row,field,value){
    if(row.dataset.about) return false;
    var cell=row.querySelector('[data-field="'+field+'"]');
    return !!cell && cell.dataset.value===value;
  }
  function applyDim(hoveredRow,field,value){
    var any=!!(hoveredRow||field);
    rows().forEach(function(r){
      var dim = field ? !rowMatchesField(r,field,value) : (hoveredRow ? r!==hoveredRow : false);
      if(dim) r.setAttribute('data-dim',''); else r.removeAttribute('data-dim');
      /* whatever survives the dim lights up in the theme colour */
      if(any&&!dim) r.setAttribute('data-hot',''); else r.removeAttribute('data-hot');
    });
  }
  applyDim(null);

  /* the hovered row's film plays on the right — the old index preview.
     a film without a (working) preview shows a big live clock instead */
  var prevEl=document.createElement('div');prevEl.id='me-prev';
  var prevVid=document.createElement('video');
  prevVid.muted=true;prevVid.loop=true;prevVid.playsInline=true;prevVid.autoplay=true;
  var phCanvas=document.createElement('canvas');
  var phCtx=phCanvas.getContext('2d');
  var phNode=null,phW=0,phH=0;
  prevEl.appendChild(prevVid);prevEl.appendChild(phCanvas);
  app.querySelector('#me-browse').appendChild(prevEl);
  function sizePreview(){
    /* the panel takes whatever room the content-sized list leaves */
    if(isMobile()||!app.classList.contains('browse'))return;
    var margin=Math.min(Math.max(innerWidth*0.04,20),64);
    var lr=listEl.getBoundingClientRect().right;
    var w=Math.max(220,Math.min(innerWidth-lr-margin*2,innerWidth*0.42));
    prevEl.style.width=w+'px';
    var h=w*9/16;
    phCanvas.width=Math.round(w*DPR);phCanvas.height=Math.round(h*DPR);
    phCtx.setTransform(DPR,0,0,DPR,0,0);
    phW=w;phH=h;
  }
  function randomWatchNode(){
    /* same recipe as the field clocks, rolled fresh per hover */
    var seed=hashSeed(Math.floor(Math.random()*1e9));
    var r=rng(seed);
    var model=Math.floor(r()*15);r();
    var toneRoll=r();
    return {x:0,y:0,R:100,f:{},accent:Math.random()<0.5,foreignHair:false,
      style:{model:model,seed:seed,shape:'circle',
        tone:toneRoll<0.22?'black':(toneRoll<0.62?'dark':(toneRoll<0.85?'mid':'light')),
        dialDark:toneRoll>=0.85?true:r()<0.15,
        texture:r()<0.18?(r()<0.5?'grille':'ribbed'):null,
        bez:0.08+r()*0.14,slim:model===7||r()<0.4,
        accentMode:['ring','dial','hairline'][Math.floor(r()*3)],
        hairForeign:null,tinted:r()<0.4,off:Math.floor(r()*43200000)}};
  }
  function drawPlaceholder(){
    /* borrows the field renderer for one frame — swap the context, draw, swap back */
    if(!phNode||!phW)return;
    var mainCtx=ctx;ctx=phCtx;
    try{
      ctx.clearRect(0,0,phW,phH);
      phNode.x=phW/2;phNode.y=phH/2;phNode.R=Math.min(phW,phH)*0.42;
      drawWatch(phNode,false);
    }catch(e){}
    ctx=mainCtx;
  }
  function phActive(){return prevEl.classList.contains('on')&&prevEl.classList.contains('ph')&&app.classList.contains('browse');}
  function showPlaceholder(){
    sizePreview();
    phNode=phNode||randomWatchNode();
    prevEl.classList.add('ph');prevEl.classList.add('on');
    try{prevVid.pause();}catch(e){}
  }
  prevVid.addEventListener('error',function(){
    /* a dead preview url falls back to the clock */
    if(prevEl.classList.contains('on')&&!prevEl.classList.contains('ph'))showPlaceholder();
  });
  function setPreview(row){
    var url=null;
    if(row){var p=PROJECTS[+row.dataset.i];url=(p&&p.preview)||null;}
    if(!url){
      /* no film under the cursor (or none hovered at all): the page's ONE
         clock holds the panel — rolled once per load, never re-rolled */
      showPlaceholder();
      return;
    }
    sizePreview();
    prevEl.classList.remove('ph');
    if(prevEl.dataset.cur!==url){prevEl.dataset.cur=url;prevVid.src=url;}
    prevEl.classList.add('on');
    try{var pr=prevVid.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){}
  }
  // desktop: hover a Year/Client/Category cell -> highlight every row sharing that value.
  // hover anywhere else on a row -> dim the rest.
  listEl.addEventListener('mouseover', function(e){
    if(isMobile()) return;
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')){ applyDim(null); setPreview(null); return; }
    var cell=e.target.closest('[data-field]');
    if(cell){ applyDim(null,cell.dataset.field,cell.dataset.value); }
    else { applyDim(row); }
    setPreview(row);
  });
  listEl.addEventListener('mouseleave', function(){ applyDim(null); setPreview(null); });

  // click -> opens the film
  listEl.addEventListener('click', function(e){
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')) return;
    var p=PROJECTS[+row.dataset.i];
    if(p && p.film) openPlayer(p);
  });

  function openAboutScreen(){
    if(document.getElementById('me-about-screen')) return;
    var ov=document.createElement('div'); ov.id='me-about-screen';
    ov.innerHTML='<button id="me-about-close">close</button>'+
      '<div class="ab-brand">'+esc(brandEl.textContent)+'</div>'+
      '<div class="txt">'+buildAboutHTML()+'</div>';
    document.body.appendChild(ov);
    ov.querySelector('#me-about-close').addEventListener('click', function(){ ov.remove(); });
    ov.querySelector('.ab-brand').addEventListener('click', function(){ ov.remove(); });
  }

  // ── player ──────────────────────────────────────────────────────
  function openPlayer(p){
    stopRadio(); /* film audio replaces the radio */
    pl.classList.add('show'); infoEl.classList.remove('show');
    infoEl.innerHTML='<div class="t">'+esc(p.title)+'</div><div>'+esc(p.client)+'</div>'+
      '<div class="d">'+[p.type,p.location,p.year].filter(Boolean).map(esc).join('<br>')+'</div>';
    if(player) player.destroy();
    var opt={controls:false,title:false,byline:false,portrait:false,transparent:true,quality:'1080p'};
    if(/^\d+$/.test(String(p.film))) opt.id=Number(p.film); else opt.url=p.film;
    player=new Vimeo.Player('me-embed',opt);
    bPlay.textContent='pause'; bMute.textContent='mute';
    player.on('play', function(){bPlay.textContent='pause';});
    player.on('pause',function(){bPlay.textContent='play';});
    player.on('timeupdate',function(d){ if(!dragging) head.style.left=(d.percent*100)+'%'; });
    player.play().catch(function(){ bPlay.textContent='play'; });
    wake();
  }
  function closePlayer(){
    applyDim(null);
    if(document.fullscreenElement) document.exitFullscreen();          // leave fullscreen on close
    else if(document.webkitFullscreenElement) document.webkitExitFullscreen();
    pl.classList.remove('show'); if(player){player.destroy();player=null;}
  }

  bar.addEventListener('click', function(e){
    var b=e.target.closest('button'); if(!b||!player) return;
    var act=b.dataset.a;
    if(act==='play') player.getPaused().then(function(x){ return x?player.play():player.pause(); });
    else if(act==='mute') player.getMuted().then(function(m){return player.setMuted(!m);}).then(function(m){ bMute.textContent=m?'unmute':'mute'; });
    else if(act==='full'){ if(document.fullscreenElement) document.exitFullscreen(); else (pl.requestFullscreen||pl.webkitRequestFullscreen).call(pl); }
    else if(act==='info'){ infoEl.classList.toggle('show'); }
  });
  pl.querySelector('#me-close').addEventListener('click', closePlayer);
  document.addEventListener('fullscreenchange', function(){ bFull.textContent=document.fullscreenElement?'exit':'fullscreen'; });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && pl.classList.contains('show')) closePlayer(); });

  function seek(e){
    var r=track.getBoundingClientRect();
    var x=((e.touches?e.touches[0].clientX:e.clientX)-r.left);
    var f=Math.min(1,Math.max(0,x/r.width));
    head.style.left=(f*100)+'%';
    if(player) player.getDuration().then(function(d){ player.setCurrentTime(f*d); });
  }
  track.addEventListener('pointerdown',function(e){dragging=true;track.setPointerCapture(e.pointerId);seek(e);});
  track.addEventListener('pointermove',function(e){if(dragging)seek(e);});
  track.addEventListener('pointerup',function(){dragging=false;});

  var t; function wake(){ bar.classList.remove('idle'); clearTimeout(t);
    t=setTimeout(function(){ if(player) player.getPaused().then(function(x){ if(!x) bar.classList.add('idle'); }); },2500); }
  pl.addEventListener('mousemove',wake);

  sizeField();
})();
  }
})();
