// site.js — michelelsasser.com  (hosted in tastatursoldat/site-data, loaded by Cargo)
// Loads the Vimeo Player SDK, then runs the full overlay app.
(function(){
  if(!window.Vimeo){
    var s=document.createElement('script');
    s.src='https://player.vimeo.com/api/player.js';
    s.onload=boot; document.head.appendChild(s);
  } else { boot(); }
  function boot(){
(function(){
  var DATA_URL     = "https://cdn.jsdelivr.net/gh/tastatursoldat/site-data@main/website-projects.json";
  var COMBINED_URL = "https://cdn.jsdelivr.net/gh/tastatursoldat/site-data@main/previews/_all.mp4";
  var ABOUT_EMAIL  = "m@michelelsasser.com";
  var ABOUT_TEXT =
    "Hi, I\u2019m Michel. I\u2019m a Swiss director based in Zurich. Born near Baden, I grew up in a small "+
    "room shared with my brother, where tight space and visual noise shaped my eye for order. "+
    "Self-taught, I developed a monochrome, minimal discipline \u2013 structure, muted palettes, and open space.\n\n"+
    "I started in fashion, writing and directing campaigns before moving into film. I work across "+
    "commercials, music videos, and films.\nUncluttered frames. Documentary or scripted.\n\n"+
    "Michel Elsasser\n"+ABOUT_EMAIL;
  var FONT='"Helvetica Neue",Helvetica,Arial,sans-serif';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var st=document.createElement('style');
  st.textContent =
    '#me-app{position:fixed;inset:0;background:#fff;z-index:2147483000;overflow:hidden;font-family:'+FONT+';color:#111;'+
      '-webkit-font-smoothing:antialiased;}'+
    // landing
    '#me-landing{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;}'+
    '#me-app.browse #me-landing{display:none;}'+
    '#me-landing video{max-width:min(60vw,900px);max-height:80vh;object-fit:contain;display:block;}'+
    // browse
    '#me-browse{position:absolute;inset:0;display:none;}'+
    '#me-app.browse #me-browse{display:block;}'+
    '#me-list{position:absolute;left:clamp(20px,4vw,64px);top:50%;transform:translateY(-50%);font-size:15px;line-height:1.5;}'+
    '.me-row{display:grid;grid-template-columns:3.2em 4em 13em 1fr;gap:1em;cursor:pointer;}'+
    '.me-row.head{cursor:default;margin-bottom:.2em;}'+
    '.me-row.about span{color:#b3b3b3;}'+
    '.me-row span{transition:opacity .15s ease;white-space:nowrap;}'+
    '#me-list:hover .me-row:not(.head) span{opacity:.35;}'+
    '#me-list .me-row:hover span{opacity:1;}'+
    '#me-stage{position:absolute;right:clamp(20px,4vw,64px);top:50%;transform:translateY(-50%);'+
      'width:min(46vw,720px);height:80vh;display:flex;align-items:center;justify-content:center;'+
      'opacity:0;transition:opacity .18s ease;pointer-events:none;}'+
    '#me-stage.show{opacity:1;}'+
    '#me-stage video{max-width:100%;max-height:100%;object-fit:contain;display:block;}'+
    '#me-stage .about{max-width:520px;white-space:pre-line;font:400 16px/1.5 '+FONT+';color:#111;}'+
    // player
    '#me-player{position:fixed;inset:0;background:#000;z-index:2147483600;display:none;}'+
    '#me-player.show{display:block;}'+
    '#me-embed{position:absolute;inset:0;}'+
    '#me-player iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}'+
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
    '#me-info.show{opacity:1;}#me-info .t{font-size:20px;margin-bottom:.4em;}#me-info .d{opacity:.7;}';
  document.head.appendChild(st);

  // ── build shell ─────────────────────────────────────────────────
  var app=document.createElement('div'); app.id='me-app';
  app.innerHTML='<div id="me-landing"></div>'+
    '<div id="me-browse"><div id="me-list"></div><div id="me-stage"></div></div>';
  document.body.appendChild(app);

  var landing=app.querySelector('#me-landing');
  var listEl=app.querySelector('#me-list');
  var stage=app.querySelector('#me-stage');

  var combined=document.createElement('video');
  combined.src=COMBINED_URL; combined.muted=true; combined.loop=true; combined.preload='auto';
  combined.setAttribute('playsinline',''); combined.setAttribute('muted','');
  landing.appendChild(combined);
  combined.play().catch(function(){});

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

  // ── landing → browse ────────────────────────────────────────────
  landing.addEventListener('click', function(){ combined.pause(); app.classList.add('browse'); });

  // ── data + render list ──────────────────────────────────────────
  fetch(DATA_URL,{cache:"no-cache"}).then(function(r){return r.json();}).then(function(d){
    PROJECTS=(d.projects||[]).filter(function(p){return p.published!==false;});
    var html='<div class="me-row head"><span>\u2116</span><span>Year</span><span>Client</span><span>Title</span></div>'+
      '<div class="me-row about" data-about="1"><span>000</span><span>1997</span><span>Michel Elsasser</span><span>About</span></div>';
    PROJECTS.forEach(function(p,i){
      var no=String(i+1).padStart(3,'0');
      html+='<div class="me-row" data-i="'+i+'"><span>'+no+'</span><span>'+esc(p.year)+'</span>'+
        '<span>'+esc(p.client)+'</span><span>'+esc(p.title)+'</span></div>';
      if(p.preview){
        var v=document.createElement('video');
        v.src=p.preview; v.muted=true; v.loop=true; v.preload='auto';
        v.setAttribute('playsinline',''); v.setAttribute('muted','');
        p._video=v; v.load();
      }
    });
    listEl.innerHTML=html;
  }).catch(function(e){ console.error('[site-data]',e); listEl.textContent='Could not load projects.'; });

  // ── stage helpers ───────────────────────────────────────────────
  function setStage(node){ if(stage.firstChild!==node){ stage.innerHTML=''; stage.appendChild(node); } }
  function clearStage(){ stage.classList.remove('show'); }
  function showProject(p){ if(!p||!p._video) return; setStage(p._video); try{p._video.currentTime=0;}catch(e){} p._video.play().catch(function(){}); stage.classList.add('show'); }
  function showAbout(){ var a=document.createElement('div'); a.className='about'; a.textContent=ABOUT_TEXT; setStage(a); stage.classList.add('show'); }

  // ── list interactions ───────────────────────────────────────────
  listEl.addEventListener('mouseover', function(e){
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')){ clearStage(); return; }
    if(row.dataset.about){ showAbout(); }
    else { showProject(PROJECTS[+row.dataset.i]); }
  });
  listEl.addEventListener('mouseleave', clearStage);
  listEl.addEventListener('click', function(e){
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')) return;
    if(row.dataset.about){ window.location.href='mailto:'+ABOUT_EMAIL; return; }
    var p=PROJECTS[+row.dataset.i];
    if(p && p.film) openPlayer(p);
  });

  // ── player ──────────────────────────────────────────────────────
  function openPlayer(p){
    clearStage();
    pl.classList.add('show'); infoEl.classList.remove('show');
    infoEl.innerHTML='<div class="t">'+esc(p.title)+'</div><div>'+esc(p.client)+'</div>'+
      '<div class="d">'+[p.type,p.location,p.year].filter(Boolean).map(esc).join('<br>')+'</div>';
    if(player) player.destroy();
    var opt={controls:false,title:false,byline:false,portrait:false,responsive:true};
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
})();
  }
})();
