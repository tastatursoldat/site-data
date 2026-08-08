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
    '#me-ctrl button{font:inherit;border:0;background:none;cursor:pointer;padding:0;}'+
    '#me-ctrl .icon{color:#0a0a0a;display:flex;align-items:center;}'+
    '#me-ctrl .icon svg{width:15px;height:15px;}'+
    '#me-radio .wave{opacity:.25;}'+
    '#me-radio.playing .wave{opacity:1;}'+
    '#me-ctrl #me-stop{display:none;}'+
    '#me-app.radio-on #me-stop{display:flex;}'+
    '#me-btnview .ic-dial{display:none;}'+
    '#me-app.browse #me-btnview .ic-list{display:none;}'+
    '#me-app.browse #me-btnview .ic-dial{display:block;}'+
    '#me-tc{position:fixed;right:1.2rem;bottom:1.05rem;z-index:10;font:700 15px/1.55 '+FONT+';'+
      'font-variant-numeric:tabular-nums;color:#0a0a0a;pointer-events:none;min-height:1em;}'+
    '#me-music{position:fixed;left:1.2rem;bottom:1.05rem;z-index:10;font:700 15px/1.55 '+FONT+';color:#0a0a0a;'+
      'pointer-events:none;min-height:1em;max-width:44vw;white-space:nowrap;overflow:hidden;}'+
    '#me-music .in{display:inline-block;white-space:nowrap;}'+
    '#me-music.scroll .in{animation:me-marq 6s ease-in-out infinite alternate;}'+
    '@keyframes me-marq{from{transform:translateX(0);}to{transform:translateX(var(--me-shift,0px));}}'+
    '#me-app.browse #me-tc{display:none;}'+
    // radio tuning band — bottom edge of the radio view only
    '#me-band{position:fixed;left:0;right:0;bottom:0;z-index:9;display:none;overflow-x:auto;overflow-y:hidden;'+
      '-webkit-overflow-scrolling:touch;scrollbar-width:none;font-family:'+FONT+';}'+
    '#me-band::-webkit-scrollbar{display:none;}'+
    '#me-app.radio-mode #me-band{display:block;}'+
    '#me-app.radio-mode #me-music{display:none;}'+
    '#me-app.radio-mode #me-tc{display:none;}'+
    '#me-band-in{position:relative;height:128px;}'+
    '#me-band .rule{position:absolute;top:64px;height:1px;background:#9a9a9a;}'+
    '#me-band .tick-col{position:absolute;top:0;height:100%;transform:translateX(-50%);cursor:pointer;}'+
    '#me-band .t-note{position:absolute;top:30px;width:100%;text-align:center;font-size:11px;'+
      'letter-spacing:1px;text-transform:lowercase;color:#9a9a9a;white-space:nowrap;transition:color .15s;}'+
    '#me-band .tick-col:hover .t-note{color:#0a0a0a;}'+
    '#me-band .t-line{position:absolute;top:58px;left:50%;width:1px;height:12px;background:#9a9a9a;}'+
    '#me-band .t-freq{position:absolute;top:84px;width:100%;text-align:center;font-size:11px;'+
      'font-variant-numeric:tabular-nums;color:#bdbdbd;white-space:nowrap;}'+
    '#me-band .needle{position:absolute;top:30px;width:1.5px;height:68px;background:#0a0a0a;'+
      'pointer-events:none;transition:left .8s cubic-bezier(.3,1.45,.5,1);}'+
    '#me-band .n-title{position:absolute;top:102px;transform:translateX(-50%);font:700 12px/1.3 '+FONT+';'+
      'color:#0a0a0a;white-space:nowrap;pointer-events:none;transition:left .8s cubic-bezier(.3,1.45,.5,1);}'+
    '@media (max-width:480px){#me-band .t-freq{display:none;}}'+
    // browse
    '#me-browse{position:absolute;inset:0;display:none;}'+
    '#me-app.browse #me-browse{display:block;}'+
    '#me-list{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:84%;'+
      'font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '.me-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr) minmax(0,3fr) minmax(0,2fr);gap:1em;cursor:pointer;}'+
    '.me-row.head{cursor:default;margin-bottom:.2em;}'+
    '.me-row.about span{color:#b3b3b3;}'+
    '.me-row span{transition:opacity .15s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
    '.me-row span{opacity:1;}'+
    '.me-row[data-dim] span{opacity:.35;}'+
    // player
    '#me-player{position:fixed;inset:0;background:#000;z-index:2147483600;display:none;}'+
    '#me-player.show{display:block;}'+
    '#me-embed{position:absolute;inset:0;}'+
    '#me-player iframe{position:absolute;inset:0;width:100% !important;height:100% !important;border:0;display:block;}'+
    '#me-bar{position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;align-items:center;'+
      'gap:24px;padding:0 clamp(20px,4vw,64px);color:#fff;z-index:3;opacity:1;transition:opacity .4s ease;'+
      'font:400 clamp(15px,1.4vw,18px)/1 '+FONT+';}'+
    '#me-bar.idle{opacity:0;}'+
    '#me-bar button{background:none;border:0;color:#fff;font:inherit;cursor:pointer;padding:4px 0;white-space:nowrap;}'+
    '#me-bar button:hover{opacity:.55;}'+
    '#me-track{position:relative;flex:1;height:16px;cursor:pointer;display:flex;align-items:center;}'+
    '#me-track::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.85);transform:translateY(-50%);}'+
    '#me-head{position:absolute;top:50%;left:0;width:1px;height:13px;background:#fff;transform:translate(-50%,-50%);}'+
    '#me-close{position:absolute;top:clamp(16px,3vw,40px);right:clamp(16px,3vw,40px);z-index:4;background:none;border:0;'+
      'color:#fff;font:400 16px/1 '+FONT+';cursor:pointer;}#me-close:hover{opacity:.55;}'+
    '#me-info{position:absolute;top:clamp(16px,3vw,40px);left:clamp(20px,4vw,64px);z-index:4;color:#fff;'+
      'font:400 15px/1.5 '+FONT+';max-width:60vw;opacity:0;pointer-events:none;transition:opacity .2s;}'+
    '#me-info.show{opacity:1;}#me-info .t{font-size:20px;margin-bottom:.4em;}#me-info .d{opacity:.7;}'+
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
      '<button id="me-stop" class="icon" aria-label="Stop music">'+
        '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" stroke="none">'+
          '<rect x="5.4" y="5.4" width="9.2" height="9.2" rx="1.4"/>'+
        '</svg>'+
      '</button>'+
      '<button id="me-radio" class="icon" aria-pressed="false" aria-label="Radio — toggle radio view">'+
        '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+
          '<rect x="2.5" y="8" width="15" height="8.5" rx="1.5"/>'+
          '<line x1="5.5" y1="8" x2="13.5" y2="2.5"/>'+
          '<circle cx="6.6" cy="12.2" r="1.9"/>'+
          '<line class="wave" x1="11" y1="10.8" x2="15" y2="10.8"/>'+
          '<line class="wave" x1="11" y1="13.6" x2="15" y2="13.6"/>'+
        '</svg>'+
      '</button>'+
      '<button id="me-btnview" class="icon" aria-label="Toggle view">'+
        '<svg class="ic-list" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">'+
          '<rect x="3" y="4.5" width="14" height="11" rx="1.5"/>'+
          '<line x1="6.4" y1="4.5" x2="6.4" y2="15.5"/>'+
          '<line x1="13.6" y1="4.5" x2="13.6" y2="15.5"/>'+
          '<line x1="3" y1="8.2" x2="6.4" y2="8.2"/>'+
          '<line x1="3" y1="11.8" x2="6.4" y2="11.8"/>'+
          '<line x1="13.6" y1="8.2" x2="17" y2="8.2"/>'+
          '<line x1="13.6" y1="11.8" x2="17" y2="11.8"/>'+
        '</svg>'+
        '<svg class="ic-dial" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">'+
          '<circle cx="10" cy="10" r="7.4"/>'+
          '<line x1="10" y1="10" x2="10" y2="5.6"/>'+
          '<line x1="10" y1="10" x2="13.2" y2="11.6"/>'+
        '</svg>'+
      '</button>'+
    '</div>'+
    '<div id="me-tc" aria-hidden="true"></div>'+
    '<div id="me-music" aria-hidden="true"></div>';
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
  var ABOUT_ENTRY={year:1997,no:'000',client:'Michel Elsasser',title:'About',cat:'Contact',isAbout:true};
  var FILM_DIALS=[],SONG_DIALS=[];
  var fieldMode='dial'; /* 'dial' = About+films+songs mixed | 'radio' = songs only */
  function fieldEntries(){
    return fieldMode==='radio'?SONG_DIALS.slice():[ABOUT_ENTRY].concat(FILM_DIALS).concat(SONG_DIALS);
  }

  /* one color theme per load */
  var THEMES=[
    {key:'#5FDBD3',glow:'#5FDBD3'},   /* cyan   */
    {key:'#D9E04E',glow:'#D9E04E'},   /* yellow */
    {key:'#D355DE',glow:'#D355DE'},   /* magenta*/
    {key:'#4A64D8',glow:'#6A82E8'},   /* blue   */
    {key:'#63BE58',glow:'#7BD46F'},   /* green  */
    {key:'#D8503E',glow:'#E07361'},   /* red    */
    {key:'#DE9A3E',glow:'#E8B266'}    /* orange */
  ];
  var theme=THEMES[Math.floor(Math.random()*THEMES.length)];

  var cvs=app.querySelector('#me-field'),ctx=cvs.getContext('2d');
  var W=0,H=0,DPR=Math.min(devicePixelRatio||1,2),nodes=[],hover=-1;

  function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  function shade(hex,amt){var n=parseInt(hex.slice(1),16);
    var R=(n>>16)+amt,G=((n>>8)&255)+amt,B=(n&255)+amt;
    R=Math.max(0,Math.min(255,R));G=Math.max(0,Math.min(255,G));B=Math.max(0,Math.min(255,B));
    return '#'+((R<<16)|(G<<8)|B).toString(16).padStart(6,'0');}
  function shuffled(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}return b;}

  function makeSizes(base,n){
    /* mixed sizes: a couple big, rest small-medium */
    var s=[];
    for(var i=0;i<n;i++){
      var big=i<2;
      s.push(base*(big?0.07+Math.random()*0.035:0.03+Math.random()*0.028));
    }
    return shuffled(s);
  }

  function chaoticClump(fs,base,spreadK,sepK){
    var cx=W/2,cy=H/2,spread=base*spreadK;
    function gauss(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5;}
    var nBig=1+(Math.random()<0.4?1:0);            /* only 1-2 big ones — keeps it calm */
    var out=[];
    fs.forEach(function(f,i){
      var big=i<nBig;
      var R=base*(big?0.055+Math.random()*0.03:0.026+Math.random()*0.026);
      var x,y,tries=0;
      do{
        x=cx+gauss()*spread*1.6;
        y=cy+gauss()*spread*1.05;
        tries++;
      }while(tries<300&&out.some(function(n){return Math.hypot(n.x-x,n.y-y)<(n.R+R)*sepK;}));
      out.push({f:f,x:x,y:y,R:R});
    });
    return out;
  }

  var LAYOUTS={
    lineH:function(fs,base){
      var R=makeSizes(base,fs.length);
      var total=R.reduce(function(a,r){return a+2*r;},0);
      var x=(W-total)/2;
      return fs.map(function(f,i){var r=R[i];var n={f:f,x:x+r,y:H/2,R:r};x+=2*r;return n;});
    },
    lineV:function(fs,base){
      var R=makeSizes(base,fs.length);
      var total=R.reduce(function(a,r){return a+2*r;},0);
      var y=(H-total)/2;
      return fs.map(function(f,i){var r=R[i];var n={f:f,x:W/2,y:y+r,R:r};y+=2*r;return n;});
    },
    cross:function(fs,base){ /* shared center, rest split over four arms */
      var Rs=makeSizes(base,fs.length);
      var cR=Math.max.apply(null,Rs);
      var rest=Rs.slice();rest.splice(rest.indexOf(cR),1);
      var nodes=[{f:fs[0],x:W/2,y:H/2,R:cR}];
      var gap=cR*0.08;
      var arms=[[],[],[],[]];
      rest.forEach(function(r,i){arms[i%4].push(r);});
      var dirs=[[0,-1],[0,1],[-1,0],[1,0]];
      var fi=1;
      arms.forEach(function(arm,a){
        var dx=dirs[a][0],dy=dirs[a][1];
        var d=cR+gap;
        arm.forEach(function(r){
          nodes.push({f:fs[fi++],x:W/2+dx*(d+r),y:H/2+dy*(d+r),R:r});
          d+=2*r+gap;
        });
      });
      return nodes;
    },
    xshape:function(fs,base){ /* like cross, arms on the diagonals */
      var Rs=makeSizes(base,fs.length);
      var cR=Math.max.apply(null,Rs);
      var rest=Rs.slice();rest.splice(rest.indexOf(cR),1);
      var nodes=[{f:fs[0],x:W/2,y:H/2,R:cR}];
      var gap=cR*0.08;
      var arms=[[],[],[],[]];
      rest.forEach(function(r,i){arms[i%4].push(r);});
      var q=Math.SQRT1_2;
      var dirs=[[-q,-q],[q,-q],[-q,q],[q,q]];
      var fi=1;
      arms.forEach(function(arm,a){
        var dx=dirs[a][0],dy=dirs[a][1];
        var d=cR+gap;
        arm.forEach(function(r){
          nodes.push({f:fs[fi++],x:W/2+dx*(d+r),y:H/2+dy*(d+r),R:r});
          d+=2*r+gap;
        });
      });
      return nodes;
    },
    ring:function(fs,base){
      var cx=W/2,cy=H/2,rad=Math.min(W,H)*0.33;
      return fs.map(function(f,i){
        var a=i/fs.length*Math.PI*2-Math.PI/2;
        return {f:f,x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,R:base*(0.032+Math.random()*0.05)};
      });
    },
    grid:function(fs,base){
      var cols=4,rows=Math.ceil(fs.length/cols);
      var gw=Math.min(W*0.7,base*1.3),gh=base*0.28*(rows-1);
      var oy=(H-gh)/2;
      var nodes=[];
      for(var r=0;r<rows;r++){
        var inRow=Math.min(cols,fs.length-r*cols);
        var rowW=gw*(inRow-1)/(cols-1||1);
        var ox=(W-rowW)/2;
        for(var c=0;c<inRow;c++){
          nodes.push({f:fs[r*cols+c],x:ox+(inRow>1?rowW*(c/(inRow-1)):0),y:oy+(rows>1?gh*(r/(rows-1)):0),R:base*(0.03+Math.random()*0.045)});
        }
      }
      return nodes;
    },
    tshape:function(fs,base){
      var nTop=Math.ceil(fs.length/2),nCol=fs.length-nTop;
      var Rh=makeSizes(base,nTop),Rv=makeSizes(base,nCol),nodes=[];
      var tot=Rh.reduce(function(a,r){return a+2*r;},0),x=(W-tot)/2;
      var topY=H*0.28;
      for(var i=0;i<nTop;i++){nodes.push({f:fs[i],x:x+Rh[i],y:topY,R:Rh[i]});x+=2*Rh[i];}
      var y=topY+Math.max.apply(null,Rh);
      for(var k=0;k<nCol;k++){y+=Rv[k];nodes.push({f:fs[nTop+k],x:W/2,y:y,R:Rv[k]});y+=2*Rv[k];}
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
      var jA=0.12,jR=0.06;                       /* slight jitter keeps it alive */
      var nodes=[{f:fs[0],x:cx,y:cy,R:base*(0.045+Math.random()*0.04)}];
      for(var i=0;i<innerN;i++){
        var a=i/innerN*Math.PI*2-Math.PI/2+(Math.random()-0.5)*jA;
        var rad=rIn*(1+(Math.random()-0.5)*jR);
        nodes.push({f:fs[1+i],x:cx+Math.cos(a)*rad,y:cy+Math.sin(a)*rad,R:base*(0.026+Math.random()*0.028)});
      }
      for(var o=0;o<outerN;o++){
        var a2=o/outerN*Math.PI*2-Math.PI/2+(Math.random()-0.5)*jA;
        var rad2=rOut*(1+(Math.random()-0.5)*jR);
        nodes.push({f:fs[1+innerN+o],x:cx+Math.cos(a2)*rad2,y:cy+Math.sin(a2)*rad2,R:base*(0.03+Math.random()*0.04)});
      }
      return nodes;
    },
    columns:function(fs,base){
      var nA=Math.ceil(fs.length/2),counts=[nA,fs.length-nA],xs=[W*0.36,W*0.64],nodes=[];
      var fi=0;
      for(var c=0;c<2;c++){
        var R=makeSizes(base,counts[c]);
        var tot=R.reduce(function(a,r){return a+2*r;},0),y=(H-tot)/2;
        for(var i=0;i<counts[c];i++){nodes.push({f:fs[fi++],x:xs[c],y:y+R[i],R:R[i]});y+=2*R[i];}
      }
      return nodes;
    }
  };

  function layoutField(){
    var pool=fieldEntries();
    if(!pool.length||!W||!H){nodes=[];return;}
    var base=Math.min(W,H);
    var names=Object.keys(LAYOUTS);
    var pick=names[Math.floor(Math.random()*names.length)];
    var fs=shuffled(pool);
    nodes=LAYOUTS[pick](fs,base);

    /* normalize: scale + center the whole arrangement into the safe area,
       so no viewport (previews included) ever cuts dials off */
    var minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
    nodes.forEach(function(n){
      minX=Math.min(minX,n.x-n.R);maxX=Math.max(maxX,n.x+n.R);
      minY=Math.min(minY,n.y-n.R);maxY=Math.max(maxY,n.y+n.R);
    });
    var bw=maxX-minX,bh=maxY-minY;
    var mX=W*0.08,mTop=H*0.12;
    var mBot=fieldMode==='radio'?Math.max(H*0.14,150):H*0.14; /* keep the tuning band clear */
    var sc=Math.min((W-2*mX)/bw,(H-mTop-mBot)/bh,1);
    var bcx=(minX+maxX)/2,bcy=(minY+maxY)/2;
    var tx=W/2,ty=mTop+(H-mTop-mBot)/2;
    nodes.forEach(function(n){
      n.x=tx+(n.x-bcx)*sc;
      n.y=ty+(n.y-bcy)*sc;
      n.R*=sc;
    });

    /* the most top-left dial is always About — the rest stays random */
    var tlI=0,abI=-1,best=Infinity;
    nodes.forEach(function(n,i){
      var s=(n.x-n.R)+(n.y-n.R);
      if(s<best){best=s;tlI=i;}
      if(n.f.isAbout)abI=i;
    });
    if(abI>=0&&abI!==tlI){var tf=nodes[tlI].f;nodes[tlI].f=nodes[abI].f;nodes[abI].f=tf;}

    /* per load: either a keyed composition (theme-heavy) or a rare monochrome one */
    var monoMode=Math.random()<0.18;
    var accentBudget=monoMode?1+Math.floor(Math.random()*2):5+Math.floor(Math.random()*3);
    var order=shuffled(nodes.map(function(_,i){return i;}));
    nodes.forEach(function(n,i){
      var r=rng(n.f.year*1000+parseInt(n.f.no,10));
      var model=Math.floor(r()*15);
      var shapeRoll=r();
      var toneRoll=r();
      n.style={
        model:model,
        shape:shapeRoll<0.62?'circle':(shapeRoll<0.84?'square':(shapeRoll<0.9?'pill':'poly')),
        tone:toneRoll<0.22?'black':(toneRoll<0.62?'dark':(toneRoll<0.85?'mid':'light')),
        dialDark:toneRoll>=0.85?true:r()<0.15,   /* light rings always get a dark cone — contrast */
        texture:r()<0.18?(r()<0.5?'grille':'ribbed'):null,
        bez:0.08+r()*0.14,
        slim:model===7||r()<0.4,
        accentMode:['ring','dial','hairline'][Math.floor(r()*3)],
        hairForeign:r()<0.5?['#E8C23A','#4a7fe8','#3fae9e','#e8963a'][Math.floor(r()*4)]:null,
        tinted:r()<0.4,
        off:Math.floor(r()*43200000)
      };
      n.accent=order.indexOf(i)<accentBudget;
      /* grey cones can still wear a small foreign hairline */
      n.foreignHair=!n.accent&&!monoMode&&r()<0.28;
      /* soundbox leftovers from the reference — corner screws + dust-cap dome — show rarely */
      n.style.cornerDots=r()<0.1;
      n.style.dome=r()<0.1;
    });
  }

  /* watch renderer — real time */
  function drawWatch(n,hot){
    var R=n.R,cx=n.x,cy=n.y;
    var key=theme.key,st=n.style;
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
      }else if(st.shape==='poly'){
        var N=10;
        ctx.beginPath();
        for(var t=0;t<N;t++){
          var a=t/N*Math.PI*2-Math.PI/2;
          var rr2=R*scale*(t%2?0.97:1.0);
          var x=cx+Math.cos(a)*rr2,y=cy+Math.sin(a)*rr2;
          if(t)ctx.lineTo(x,y);else ctx.moveTo(x,y);
        }
        ctx.closePath();
      }else{
        ctx.beginPath();ctx.arc(cx,cy,R*scale,0,7);
      }
    }

    /* ring / frame */
    var ringTones={black:'#101214',dark:'#2e3236',mid:'#6f7377',light:'#c9c9c5'};
    ctx.save();
    if(hot){ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=R*0.7;}
    else if(aRing){ctx.shadowColor=theme.glow;ctx.shadowBlur=R*0.3;}
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
    var Rd=R*(1-st.bez)*(st.shape==='pill'?0.8:1);
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
      ctx.strokeStyle=aHair?key:(st.hairForeign||key);
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
      /* 7,8,9,12: clean-ish faces, dust-cap dome below carries them */
    }

    /* dust-cap dome — the bright center of the reference cones — rare */
    if((st.model===7||st.model===8||st.model===9||st.model===12||st.tone==='light')&&st.dome){
      var Rc=Rd*0.22;
      var dome=ctx.createRadialGradient(cx-Rc*0.35,cy-Rc*0.4,Rc*0.05,cx,cy,Rc);
      if(light){dome.addColorStop(0,'#ffffff');dome.addColorStop(1,'#8f8f8a');}
      else{dome.addColorStop(0,'#b9bdc1');dome.addColorStop(1,'#26292c');}
      ctx.fillStyle=dome;
      ctx.beginPath();ctx.arc(cx,cy,Rc,0,7);ctx.fill();
    }

    /* live time, shifted per film — all different, all moving in real time */
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

  function renderField(){
    ctx.clearRect(0,0,W,H);
    nodes.forEach(function(n,i){if(i!==hover)drawWatch(n,false);});
    if(hover>=0)drawWatch(nodes[hover],true);
  }
  (function loop(){
    if(nodes.length && !app.classList.contains('browse') && !pl.classList.contains('show')) renderField();
    requestAnimationFrame(loop);
  })();

  function sizeField(){
    W=innerWidth;H=innerHeight;
    cvs.width=W*DPR;cvs.height=H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    layoutField();
  }
  function rearrange(){ /* same as a fresh page load: new theme + new arrangement */
    theme=THEMES[Math.floor(Math.random()*THEMES.length)];
    layoutField();
  }
  addEventListener('resize',sizeField);
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
    if(f.isAbout){ openAboutScreen(); return; }
    if(f.kind==='song'){ playSong(f.idx); return; }
    if(f.p && f.p.film) openPlayer(f.p);
  });

  // ── view toggle + radio ─────────────────────────────────────────
  app.querySelector('#me-btnview').addEventListener('click', function(){
    if(app.classList.contains('browse')){
      app.classList.remove('browse');
    }else{
      app.classList.add('browse');
      tcEl.textContent='';
      hover=-1;
    }
    updateModeClass();
    updateBrand();
  });

  /* radio — plays a YouTube playlist; current track title bottom-left */
  var radioBtn=app.querySelector('#me-radio');
  var musicEl=app.querySelector('#me-music');
  var brandEl=app.querySelector('#me-brand');
  function updateBrand(){
    /* label follows the view — dial film on the index, dial radio on the radio field */
    brandEl.textContent=app.classList.contains('browse')?'dial film':(fieldMode==='radio'?'dial radio':'dial');
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
    /* the band subscribes to track changes here — needle glides on natural advance too */
    try{var gi=ytPlayer.getPlaylistIndex();if(gi>=0&&gi!==bandIdx&&bandTicks[gi])moveNeedle(gi,true);}catch(e){}
  }
  function startPlayback(){
    /* first start per load: begin at a random track, never the same one twice in a row.
       loadPlaylist(index) — playVideoAt on a merely cued player falls back to track 0 */
    try{
      var list=ytPlayer.getPlaylist();
      if(!ytJumped && list && list.length>1){
        ytJumped=true;
        var last=-1;try{last=parseInt(localStorage.getItem('me-radio-last'),10);}catch(e){}
        var i=Math.floor(Math.random()*list.length);
        if(i===last)i=(i+1)%list.length;
        try{localStorage.setItem('me-radio-last',String(i));}catch(e){}
        ytPlayer.loadPlaylist({list:MUSIC_PLAYLIST,listType:'playlist',index:i});
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
          onStateChange:function(){buildSongs();if(!ytJumped&&radioPlaying)startPlayback();updateTitle();}
        }
      });
    };
    var s=document.createElement('script');s.id='me-yt-api';s.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  ensureYT(); /* preload cued player so the radio click starts playback inside the gesture */
  function buildSongs(){
    /* one clock per playlist track, once the playlist is known */
    try{
      var l=ytPlayer&&ytPlayer.getPlaylist?ytPlayer.getPlaylist():null;
      if(l&&l.length&&!SONG_DIALS.length){
        for(var i=0;i<l.length;i++){
          SONG_DIALS.push({kind:'song',idx:i,code:'R-'+String(i+1).padStart(2,'0'),year:9090,no:String(i+1).padStart(3,'0')});
        }
        layoutField();
        buildBand();
      }
    }catch(e){}
  }

  /* ── radio tuning band — every song a tick on the scale ────────── */
  var bandEl=document.createElement('div');bandEl.id='me-band';
  bandEl.innerHTML='<div id="me-band-in"></div>';
  app.appendChild(bandEl);
  var bandIn=bandEl.querySelector('#me-band-in');
  var RADIO_META={},bandTicks=[],bandIdx=-1,needleEl=null,needleTitle=null;
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
  function noteFor(id){var m=RADIO_META[id];return (m&&m.note)?String(m.note).toLowerCase().slice(0,18):'';}
  function fmtHz(hz){
    return hz>999?(Math.round(hz/100)/10).toFixed(1)+' khz':hz+' hz';
  }
  function bandAccent(){return theme.key;}
  function clampLabel(el,x,iw){
    /* keep centered labels inside the band near the edges */
    var half=el.offsetWidth/2,shift=0;
    if(x-half<6)shift=half-x+6;
    else if(x+half>iw-6)shift=-(x+half-(iw-6));
    el.style.marginLeft=shift?shift+'px':'';
  }
  function buildBand(){
    var ids;try{ids=ytPlayer&&ytPlayer.getPlaylist?ytPlayer.getPlaylist():null;}catch(e){return;}
    if(!ids||!ids.length)return;
    var iw=Math.max(bandEl.clientWidth||innerWidth,640);
    bandIn.style.width=iw+'px';
    var x0=40,x1=iw-100;
    var t=ids.map(function(id,i){return {i:i,id:id,hz:hzFor(id),note:noteFor(id)};});
    t.sort(function(a,b){return a.hz-b.hz;});
    var lo=t[0].hz,hi=t[t.length-1].hz,span=Math.max(hi-lo,1);
    t.forEach(function(e){e.x=x0+(e.hz-lo)/span*(x1-x0);});
    for(var k=1;k<t.length;k++){if(t[k].x-t[k-1].x<60)t[k].x=t[k-1].x+60;}      /* min gap, keep order */
    for(var k2=t.length-1;k2>=0;k2--){
      if(t[k2].x>x1)t[k2].x=x1;
      if(k2<t.length-1&&t[k2+1].x-t[k2].x<60)t[k2].x=t[k2+1].x-60;
    }
    bandIn.innerHTML='';
    var rule=document.createElement('div');rule.className='rule';
    rule.style.left=x0+'px';rule.style.width=(x1-x0)+'px';
    bandIn.appendChild(rule);
    bandTicks=[];
    t.forEach(function(e){
      var c=document.createElement('div');c.className='tick-col';
      c.style.left=e.x+'px';
      c.style.width=Math.max(32,e.note.length*8+12)+'px';
      c.innerHTML='<div class="t-note">'+esc(e.note)+'</div><div class="t-line"></div>'+
        '<div class="t-freq">'+fmtHz(e.hz)+'</div>';
      c.addEventListener('click',function(){ if(e.i!==bandIdx){ playSong(e.i); moveNeedle(e.i,true); } });
      bandIn.appendChild(c);
      clampLabel(c.querySelector('.t-note'),e.x,iw);
      bandTicks[e.i]={x:e.x,el:c};
    });
    needleEl=document.createElement('div');needleEl.className='needle';
    needleTitle=document.createElement('div');needleTitle.className='n-title';
    needleEl.addEventListener('transitionend',applyBandActive);
    bandIn.appendChild(needleEl);bandIn.appendChild(needleTitle);
    var idx=0;try{var gi=ytPlayer.getPlaylistIndex();if(gi>=0)idx=gi;}catch(e){}
    moveNeedle(idx,false);
  }
  function applyBandActive(){
    /* active colors switch when the needle arrives, not when the audio switches */
    if(!needleEl)return;
    bandTicks.forEach(function(bt,i){
      if(!bt)return;
      var on=i===bandIdx;
      bt.el.querySelector('.t-note').style.color=on?bandAccent():'';
      bt.el.querySelector('.t-freq').style.color=on?bandAccent():'';
    });
    needleEl.style.background=bandAccent();
    needleTitle.style.color=bandAccent();
    var tt='';
    try{if(ytPlayer.getPlaylistIndex()===bandIdx){var d=ytPlayer.getVideoData();tt=(d&&d.title)||'';}}catch(e){}
    needleTitle.textContent=cleanTitle(tt);
    if(bandTicks[bandIdx])clampLabel(needleTitle,bandTicks[bandIdx].x,parseFloat(bandIn.style.width)||innerWidth);
  }
  function moveNeedle(idx,animate){
    if(!needleEl||!bandTicks[idx])return;
    var x=bandTicks[idx].x;
    bandIdx=idx;
    if(!animate){
      needleEl.style.transition='none';needleTitle.style.transition='none';
      needleEl.style.left=x+'px';needleTitle.style.left=x+'px';
      needleEl.getBoundingClientRect();
      needleEl.style.transition='';needleTitle.style.transition='';
      applyBandActive();
    }else{
      needleEl.style.left=x+'px';needleTitle.style.left=x+'px';
    }
    if(bandEl.scrollWidth>bandEl.clientWidth+1){
      try{bandEl.scrollTo({left:Math.max(0,x-bandEl.clientWidth/2),behavior:animate?'smooth':'auto'});}catch(e){}
    }
  }
  addEventListener('resize',function(){ if(bandTicks.length)buildBand(); });
  function reclampBand(){
    /* labels measure 0 while the band is display:none — re-clamp once visible */
    if(getComputedStyle(bandEl).display==='none')return;
    var iw=parseFloat(bandIn.style.width)||innerWidth;
    bandTicks.forEach(function(bt){if(bt)clampLabel(bt.el.querySelector('.t-note'),bt.x,iw);});
    if(needleTitle&&bandTicks[bandIdx])clampLabel(needleTitle,bandTicks[bandIdx].x,iw);
  }
  function updateModeClass(){
    app.classList.toggle('radio-mode', fieldMode==='radio' && !app.classList.contains('browse'));
    reclampBand();
  }
  function stopRadio(){
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
  function playSong(i){
    if(!ytReady) return;
    try{localStorage.setItem('me-radio-last',String(i));}catch(e){}
    armRadio();
    try{
      if(!ytJumped){ytJumped=true;ytPlayer.loadPlaylist({list:MUSIC_PLAYLIST,listType:'playlist',index:i});}
      else ytPlayer.playVideoAt(i);
    }catch(e){}
  }
  radioBtn.addEventListener('click', function(){
    if(fieldMode==='radio'){
      fieldMode='dial';   /* leave the radio view — the song keeps playing */
      rearrange();
    }else{
      fieldMode='radio';
      app.classList.remove('browse'); /* the radio view lives on the dial field */
      rearrange();
      armRadio();
      if(ytReady)startPlayback();
    }
    radioBtn.setAttribute('aria-pressed',fieldMode==='radio');
    updateModeClass();
    if(needleEl)applyBandActive(); /* theme re-rolled — refresh the band accent */
    updateBrand();
  });
  app.querySelector('#me-stop').addEventListener('click', stopRadio);
  brandEl.addEventListener('click', function(){ openAboutScreen(); });

  // ── data + render list ──────────────────────────────────────────
  fetch(DATA_URL,{cache:"no-cache"}).then(function(r){return r.json();}).then(function(d){
    PROJECTS=(d.projects||[]).filter(function(p){return p.published!==false;});
    var html='<div class="me-row head"><span>Year</span><span>№</span><span>Client</span><span>Title</span><span>Category</span></div>'+
      '<div class="me-row about" data-about="1"><span>1997</span><span>000</span><span>Michel Elsasser</span><span>About</span><span data-contact="1">Contact</span></div>';
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
    rows().forEach(function(r){
      var dim = field ? !rowMatchesField(r,field,value) : (hoveredRow ? r!==hoveredRow : false);
      if(dim) r.setAttribute('data-dim',''); else r.removeAttribute('data-dim');
    });
  }
  applyDim(null);

  // desktop: hover a Year/Client/Category cell -> highlight every row sharing that value.
  // hover anywhere else on a row -> dim the rest.
  listEl.addEventListener('mouseover', function(e){
    if(isMobile()) return;
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')){ applyDim(null); return; }
    var cell=e.target.closest('[data-field]');
    if(cell){ applyDim(null,cell.dataset.field,cell.dataset.value); }
    else { applyDim(row); }
  });
  listEl.addEventListener('mouseleave', function(){ applyDim(null); });

  // click -> opens the film; About row opens the about page (Contact cell opens mail)
  listEl.addEventListener('click', function(e){
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')) return;
    if(row.dataset.about){
      if(e.target.closest('[data-contact]')){ window.location.href='mailto:'+ABOUT_EMAIL; return; }
      openAboutScreen(); return;
    }
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
    var opt={controls:false,title:false,byline:false,portrait:false};
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
