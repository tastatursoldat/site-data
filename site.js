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
  var MUSIC_PLAYLIST = "UUSJ4gkVC6NrvII8umztf0Ow"; // YouTube playlist id for the radio
  var ABOUT_EMAIL  = "m@michelelsasser.com";
  var FORMSPREE_ID = "xkolzzba"; // Formspree form id
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
    '#me-brand{position:fixed;top:1.15rem;left:1.2rem;z-index:10;font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '#me-ctrl{position:fixed;top:1.15rem;right:1.2rem;z-index:10;display:flex;gap:1.1rem;align-items:center;}'+
    '#me-ctrl button{font:inherit;border:0;background:none;cursor:pointer;padding:0;}'+
    '#me-ctrl .icon{color:#0a0a0a;display:flex;align-items:center;}'+
    '#me-ctrl .icon svg{width:15px;height:15px;}'+
    '#me-radio .wave{opacity:.25;}'+
    '#me-radio.playing .wave{opacity:1;}'+
    '#me-btnview .ic-dial{display:none;}'+
    '#me-app.browse #me-btnview .ic-list{display:none;}'+
    '#me-app.browse #me-btnview .ic-dial{display:block;}'+
    '#me-tc{position:fixed;right:1.2rem;bottom:1.05rem;z-index:10;font:700 15px/1.55 '+FONT+';'+
      'font-variant-numeric:tabular-nums;color:#0a0a0a;pointer-events:none;min-height:1em;}'+
    '#me-music{position:fixed;left:1.2rem;bottom:1.05rem;z-index:10;font:700 15px/1.55 '+FONT+';color:#0a0a0a;'+
      'pointer-events:none;min-height:1em;max-width:44vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
    '#me-app.browse #me-tc{display:none;}'+
    // browse
    '#me-browse{position:absolute;inset:0;display:none;}'+
    '#me-app.browse #me-browse{display:block;}'+
    '#me-list{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(70%,900px);'+
      'font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '.me-row{display:grid;grid-template-columns:1fr 1fr 2fr 3fr 2fr;gap:1em;cursor:pointer;}'+
    '.me-row.head{cursor:default;margin-bottom:.2em;}'+
    '.me-row.about span{color:#b3b3b3;}'+
    '.me-row span{transition:opacity .15s ease;white-space:nowrap;}'+
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
    // time-capsule
    '#me-cap-mobile{display:none;}'+
    '#me-clock-mobile{display:none;}'+
    '#me-cap{position:fixed;inset:0;background:rgba(0,0,0,.32);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);'+
      'z-index:2147483750;display:none;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:'+FONT+';}'+
    '#me-cap.show{display:flex;}'+
    '#me-cap-card{position:relative;width:100%;max-width:520px;background:#fff;border-radius:22px;'+
      'padding:44px 44px 36px;box-sizing:border-box;color:#111;box-shadow:0 24px 70px rgba(0,0,0,.28);}'+
    '#me-cap h2{font:600 24px/1.3 '+FONT+';margin:0 0 24px;padding-right:36px;letter-spacing:-.02em;}'+
    '#me-cap-close{position:absolute;top:22px;right:22px;width:30px;height:30px;display:flex;align-items:center;'+
      'justify-content:center;background:#f1f1ef;border:0;border-radius:50%;cursor:pointer;color:#555;'+
      'font:400 16px/1 '+FONT+';transition:background .15s,color .15s;}'+
    '#me-cap-close:hover{background:#e5e5e2;color:#111;}'+
    '#me-cap textarea{width:100%;box-sizing:border-box;min-height:140px;resize:none;'+
      'border:1px solid #e4e4e1;border-radius:14px;padding:16px 18px;font:400 16px/1.55 '+FONT+';color:#111;'+
      'background:#fafafa;transition:border-color .15s,background .15s;}'+
    '#me-cap textarea::placeholder{color:#aaa;}'+
    '#me-cap textarea:focus{outline:none;border-color:#111;background:#fff;}'+
    '#me-cap .row{display:flex;gap:14px;align-items:center;margin-top:24px;}'+
    '#me-send{background:#111;color:#fff;border:0;border-radius:980px;padding:13px 30px;'+
      'font:500 15px/1 '+FONT+';cursor:pointer;transition:opacity .15s;}'+
    '#me-send:hover{opacity:.85;}'+
    '#me-send:disabled{opacity:.4;cursor:default;}'+
    '#me-cap .status{font:400 14px/1.5 '+FONT+';color:#888;}'+
    '@media (max-width:700px){'+
      '#me-app.browse #me-browse{overflow:hidden;height:100vh;display:flex;align-items:center;}'+
      '@supports (height:100dvh){#me-app.browse #me-browse{height:100dvh;}}'+
      '#me-list{position:relative;left:auto;top:auto;transform:none;width:100%;'+
        'padding:0 18px;box-sizing:border-box;font-size:14px;}'+
      '.me-row{grid-template-columns:3em 2.4em 1fr;gap:.6em;padding:7px 0;}'+
      '.me-row span{font-size:14px;}'+
      '.me-row span:nth-child(3),.me-row span:nth-child(5){display:none;}'+
      '#me-cap-mobile{display:block;margin-top:64px;width:100%;font:700 28px/1.05 '+FONT+';color:#111;letter-spacing:.01em;white-space:nowrap;text-align:center;cursor:pointer;box-sizing:border-box;}'+
      '#me-clock-mobile{display:block;margin-top:10px;width:100%;font:700 13vw/1 '+FONT+';color:#111;letter-spacing:.01em;white-space:nowrap;text-align:center;box-sizing:border-box;}'+
      '#me-bar [data-a="full"]{display:none;}'+
    '}'+
    '@media (max-height:500px) and (orientation:landscape){'+
      '#me-clock-mobile{display:none !important;}'+
      '#me-cap-mobile{display:none !important;}'+
    '}';
  document.head.appendChild(st);

  // ── build shell ─────────────────────────────────────────────────
  var app=document.createElement('div'); app.id='me-app';
  app.innerHTML=
    '<div id="me-dial"><canvas id="me-field" aria-label="Films as dials — click one to open the film"></canvas></div>'+
    '<div id="me-browse"><div id="me-list"></div></div>'+
    '<div id="me-brand">DIAL</div>'+
    '<div id="me-ctrl">'+
      '<button id="me-radio" class="icon" aria-pressed="false" aria-label="Radio — toggle sound">'+
        '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+
          '<path d="M3.5 8 H6.5 L10.5 4.5 V15.5 L6.5 12 H3.5 Z" fill="currentColor" stroke="none"/>'+
          '<path class="wave" d="M13.5 7.5 Q15.5 10 13.5 12.5"/>'+
          '<path class="wave" d="M15.5 5.5 Q18.8 10 15.5 14.5"/>'+
        '</svg>'+
      '</button>'+
      '<button id="me-btnview" class="icon" aria-label="Toggle view">'+
        '<svg class="ic-list" viewBox="0 0 20 20" width="20" height="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">'+
          '<line x1="3" y1="5.5" x2="17" y2="5.5"/>'+
          '<line x1="3" y1="10" x2="17" y2="10"/>'+
          '<line x1="3" y1="14.5" x2="17" y2="14.5"/>'+
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

  var CAP_QUESTIONS=[
    'Which clock in your flat is wrong?',
    'Do you own a watch that stopped and stayed stopped?',
    'Whose alarm is still set in your phone?',
    'Does anything in your flat still blink at midnight?',
    'Is anything in your flat still celebrating a past holiday?',
    'Which timer are you still hearing in your head?',
    'Does your oven know what year it is?',
    'Is the sun aware of your schedule?',
    'Is the earth turning at your pace?',
    'Does the moon expect anything from you?',
    'Has the ocean been consulted?',
    'Do the stars run late?',
    'Is the horizon waiting on you?',
    'Has the mountain been informed?',
    'Has the wind confirmed for Thursday?',
    'Does the tree know it’s Monday?',
    'Does your fridge hum without you?',
    'Is your desk indifferent to your work?',
    'Do the birds know it’s the weekend?',
    'Does the pavement care who walks on it?',
    'Is the rain aware it’s inconvenient?',
    'What should outlast today?',
    'Who will throw away your cables?',
    'How much of today will survive the year?'
  ];
  var CAP_LABEL=CAP_QUESTIONS[Math.floor(Math.random()*CAP_QUESTIONS.length)];

  function fmtClock(){
    var d=new Date();
    function p(n,len){return String(n).padStart(len||2,'0');}
    return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())+':'+p(Math.floor(d.getMilliseconds()/10));
  }

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
  var refitCap=function(){}; // set once the mobile capsule row exists

  // ── dial field — every film is a clock ──────────────────────────
  var DIALS=[];

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
    if(!DIALS.length||!W||!H){nodes=[];return;}
    var base=Math.min(W,H);
    var names=Object.keys(LAYOUTS);
    var pick=names[Math.floor(Math.random()*names.length)];
    var fs=shuffled(DIALS);
    nodes=LAYOUTS[pick](fs,base);

    /* normalize: scale + center the whole arrangement into the safe area,
       so no viewport (previews included) ever cuts dials off */
    var minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
    nodes.forEach(function(n){
      minX=Math.min(minX,n.x-n.R);maxX=Math.max(maxX,n.x+n.R);
      minY=Math.min(minY,n.y-n.R);maxY=Math.max(maxY,n.y+n.R);
    });
    var bw=maxX-minX,bh=maxY-minY;
    var mX=W*0.08,mTop=H*0.12,mBot=H*0.14;
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

    /* square plates carry corner dots */
    if(st.shape==='square'){
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

    /* dust-cap dome — the bright center of the reference cones */
    if(st.model===7||st.model===8||st.model===9||st.model===12||st.tone==='light'){
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
  function refCode(f){return f.year+'-'+String(parseInt(f.no,10)).padStart(2,'0');}
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
    if(nodes[i].f.isAbout){ openAboutScreen(); return; }
    var p=nodes[i].f.p;
    if(p && p.film) openPlayer(p);
  });

  // ── view toggle + radio ─────────────────────────────────────────
  app.querySelector('#me-btnview').addEventListener('click', function(){
    if(app.classList.contains('browse')){
      app.classList.remove('browse');
    }else{
      app.classList.add('browse');
      tcEl.textContent='';
      hover=-1;
      refitCap();
    }
  });

  /* radio — plays a YouTube playlist; current track title bottom-left */
  var radioBtn=app.querySelector('#me-radio');
  var musicEl=app.querySelector('#me-music');
  var ytPlayer=null,ytReady=false,radioPlaying=false,titleTimer=null;
  function updateTitle(){
    if(!radioPlaying||!ytPlayer||!ytPlayer.getVideoData){musicEl.textContent='';return;}
    try{var d=ytPlayer.getVideoData();musicEl.textContent=(d&&d.title)?d.title:'';}catch(e){}
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
          onReady:function(){ytReady=true;if(radioPlaying){try{ytPlayer.playVideo();}catch(e){}}},
          onStateChange:updateTitle
        }
      });
    };
    var s=document.createElement('script');s.id='me-yt-api';s.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  radioBtn.addEventListener('click', function(){
    radioPlaying=!radioPlaying;
    radioBtn.classList.toggle('playing',radioPlaying);
    radioBtn.setAttribute('aria-pressed',radioPlaying);
    if(radioPlaying){
      ensureYT();
      if(ytReady){try{ytPlayer.playVideo();}catch(e){}}
      clearInterval(titleTimer);titleTimer=setInterval(updateTitle,800);
    }else{
      if(ytReady){try{ytPlayer.pauseVideo();}catch(e){}}
      clearInterval(titleTimer);musicEl.textContent='';
    }
  });

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

    /* dial field entries — one clock per film, plus the About dial (1997-00) */
    DIALS=[{year:1997,no:'000',client:'Michel Elsasser',title:'About',cat:'Contact',isAbout:true}]
      .concat(PROJECTS.map(function(p,i){
        return {year:+p.year||0,no:p.num||String(i+1).padStart(3,'0'),client:p.client,title:p.title,cat:p.type||'',p:p};
      }));
    sizeField();

    var clockMobile=document.createElement('div');
    clockMobile.id='me-clock-mobile';
    clockMobile.textContent=fmtClock();
    var capRow=document.createElement('div');
    capRow.id='me-cap-mobile';
    capRow.textContent=CAP_LABEL;
    capRow.addEventListener('click', function(){ openCapsule(); });
    listEl.appendChild(capRow);
    listEl.appendChild(clockMobile);
    setInterval(function(){ clockMobile.textContent=fmtClock(); },30);
    function fitCapToClock(){
      if(!isMobile()) return;
      if(!clockMobile.isConnected||!capRow.isConnected) return;
      if(!capRow.offsetParent) return; // list hidden (dial view) — measure when shown
      var meas=document.createElement('span');
      meas.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font:'+getComputedStyle(clockMobile).font;
      meas.textContent=clockMobile.textContent;
      document.body.appendChild(meas);
      var clockTextW=meas.getBoundingClientRect().width;
      document.body.removeChild(meas);
      capRow.style.fontSize='100px';
      var capW=capRow.scrollWidth;
      if(capW>0 && clockTextW>0) capRow.style.fontSize=(100*(clockTextW/capW)*0.99)+'px';
    }
    refitCap=fitCapToClock;
    fitCapToClock();
    setTimeout(fitCapToClock,60);
    setTimeout(fitCapToClock,300);
    window.addEventListener('resize', fitCapToClock);
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
    ov.innerHTML='<button id="me-about-close">close</button><div class="txt">'+buildAboutHTML()+'</div>';
    document.body.appendChild(ov);
    ov.querySelector('#me-about-close').addEventListener('click', function(){ ov.remove(); });
  }

  // ── player ──────────────────────────────────────────────────────
  function openPlayer(p){
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

  // ── time capsule ────────────────────────────────────────────────
  var cap=document.createElement('div'); cap.id='me-cap';
  cap.innerHTML=
    '<div id="me-cap-card">'+
      '<button id="me-cap-close" aria-label="close">×</button>'+
      '<h2>'+esc(CAP_LABEL)+'</h2>'+
      '<textarea id="me-msg" placeholder="Write something…"></textarea>'+
      '<div class="row"><button id="me-send">Send</button><span class="status"></span></div>'+
    '</div>';
  document.body.appendChild(cap);

  var capClose=cap.querySelector('#me-cap-close');
  var msg=cap.querySelector('#me-msg');
  var sendBtn=cap.querySelector('#me-send');
  var statusEl=cap.querySelector('.status');

  function openCapsule(){ cap.classList.add('show'); }
  function closeCapsule(){ cap.classList.remove('show'); }
  capClose.addEventListener('click', closeCapsule);
  cap.addEventListener('click', function(e){ if(e.target===cap) closeCapsule(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && cap.classList.contains('show')) closeCapsule(); });

  sendBtn.addEventListener('click', function(){
    if(!msg.value.trim()){ statusEl.textContent='Write something first.'; return; }
    if(FORMSPREE_ID==='YOUR_FORM_ID'){ statusEl.textContent='Not configured yet.'; return; }
    sendBtn.disabled=true; statusEl.textContent='Sending…';
    var fd=new FormData();
    fd.append('message', msg.value);
    fd.append('_subject', CAP_LABEL);
    fetch('https://formspree.io/f/'+FORMSPREE_ID, { method:'POST', body:fd, headers:{'Accept':'application/json'} })
      .then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; }); })
      .then(function(res){
        if(res.ok){ statusEl.textContent='Sent. Thank you.'; msg.value='';
          setTimeout(closeCapsule,1200); }
        else { statusEl.textContent=(res.j && res.j.error) ? res.j.error : 'Something went wrong.'; }
        sendBtn.disabled=false;
      })
      .catch(function(){ statusEl.textContent='Network error. Try again.'; sendBtn.disabled=false; });
  });

  sizeField();
})();
  }
})();
