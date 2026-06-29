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
  var existingVp=document.querySelector('meta[name="viewport"]');
  if(existingVp) existingVp.remove();
  var vp=document.createElement('meta'); vp.name='viewport';
  vp.content='width=device-width, initial-scale=1, viewport-fit=cover';
  document.head.appendChild(vp);
  var DATA_URL     = "https://cdn.jsdelivr.net/gh/tastatursoldat/site-data@main/website-projects.json";
  var COMBINED_URL = "https://cdn.jsdelivr.net/gh/tastatursoldat/site-data@main/previews/_all.mp4";
  var ABOUT_EMAIL  = "m@michelelsasser.com";
  var FORMSPREE_ID = "xkolzzba"; // Formspree form id
  var ABOUT_INSTAGRAM = "@michelelsasser";
  var ABOUT_TEXT =
    "Hi, I\u2019m Michel. I\u2019m a Swiss director based in Zurich. Born near Baden, I grew up in a small "+
    "room shared with my brother, where tight space and visual noise shaped my eye for order. "+
    "Self-taught, I developed a monochrome, minimal discipline \u2013 structure, muted palettes, and open space.\n\n"+
    "I started in fashion, writing and directing campaigns before moving into film. I work across "+
    "commercials, music videos, and films.\nUncluttered frames. Documentary or scripted.\n\n"+
    ABOUT_INSTAGRAM+"\n"+ABOUT_EMAIL;
  var FONT='"Helvetica Neue",Helvetica,Arial,sans-serif';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var st=document.createElement('style');
  st.textContent =
    'html,body{overflow:hidden !important;height:100% !important;}'+
    '#me-app{position:fixed;inset:0;background:#fff;z-index:2147483000;overflow:hidden;font-family:'+FONT+';color:#111;'+
      '-webkit-font-smoothing:antialiased;}'+
    // landing
    '#me-landing{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;}'+
    '#me-app.browse #me-landing{display:none;}'+
    '#me-landing-box{position:relative;max-width:min(34vw,540px);max-height:50vh;}'+
    '#me-landing-box video{width:100%;height:100%;object-fit:contain;display:block;}'+
    '#me-clock{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);'+
      'font:700 1px/1 '+FONT+';color:#fff;mix-blend-mode:difference;pointer-events:none;'+
      'letter-spacing:.02em;text-align:center;white-space:nowrap;}'+
    '#me-clock.rest{color:#111;mix-blend-mode:normal;}'+
    // browse
    '#me-browse{position:absolute;inset:0;display:none;}'+
    '#me-app.browse #me-browse{display:block;}'+
    '#me-list{position:absolute;left:clamp(20px,4vw,64px);top:50%;transform:translateY(-50%);font-size:15px;line-height:1.5;}'+
    '.me-row{display:grid;grid-template-columns:4em 3.2em 11em 1fr 9em;gap:1em;cursor:pointer;}'+
    '.me-row.head{cursor:default;margin-bottom:.2em;}'+
    '.me-row.about span{color:#b3b3b3;}'+
    '.me-row span{transition:opacity .15s ease;white-space:nowrap;}'+
    '.me-row span{opacity:1;}'+
    '.me-row[data-dim] span{opacity:.35;}'+
    '#me-stage{position:absolute;right:clamp(20px,4vw,64px);top:50%;transform:translateY(-50%);'+
      'width:min(46vw,720px);height:80vh;'+
      'opacity:0;transition:opacity .18s ease;pointer-events:none;}'+
    '#me-stage.show{opacity:1;}'+
    '#me-stage-content{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}'+
    '#me-stage video{max-width:100%;max-height:100%;object-fit:contain;display:block;}'+
    '#me-stage .about{max-width:520px;white-space:pre-line;font:400 16px/1.5 '+FONT+';color:#111;}'+
    '#me-stage .about a{color:#111;text-decoration:none;}'+
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
    // mobile: full-bleed landing gif, compact desktop-style list, full-screen About
    '#me-about-screen{position:fixed;inset:0;background:#fff;z-index:2147483700;'+
      'padding:max(24px,env(safe-area-inset-top)) 24px 40px;box-sizing:border-box;overflow-y:auto;}'+
    '#me-about-close{position:absolute;top:max(16px,env(safe-area-inset-top));right:20px;'+
      'background:none;border:0;font:400 16px/1 '+FONT+';cursor:pointer;color:#111;}'+
    '#me-about-screen .txt{margin-top:60px;font:400 16px/1.6 '+FONT+';white-space:pre-line;color:#111;}'+
    '#me-about-screen .txt a{color:#111;text-decoration:none;}'+
    // time-capsule (label replaces the clock text on hover)
    '#me-stage.cap-armed{cursor:pointer;}'+
    '#me-cap{position:fixed;inset:0;background:rgba(255,255,255,.97);z-index:2147483750;display:none;'+
      'flex-direction:column;padding:max(28px,env(safe-area-inset-top)) clamp(20px,5vw,80px) 40px;box-sizing:border-box;'+
      'font-family:'+FONT+';color:#111;overflow-y:auto;}'+
    '#me-cap.show{display:flex;}'+
    '#me-cap h2{font:700 26px/1.2 '+FONT+';margin:48px 0 4px;letter-spacing:-.01em;}'+
    '#me-cap .sub{font:400 15px/1.5 '+FONT+';color:#888;margin-bottom:24px;}'+
    '#me-cap-close{position:absolute;top:max(20px,env(safe-area-inset-top));right:clamp(20px,5vw,80px);'+
      'background:none;border:0;font:400 16px/1 '+FONT+';cursor:pointer;color:#111;}'+
    '#me-drop{border:1px dashed #bbb;border-radius:2px;padding:40px 20px;text-align:center;'+
      'font:400 15px/1.5 '+FONT+';color:#888;cursor:pointer;transition:border-color .15s,background .15s;}'+
    '#me-drop.over{border-color:#111;background:#f4f4f2;color:#111;}'+
    '#me-files{list-style:none;margin:14px 0 0;padding:0;font:400 13px/1.7 '+FONT+';color:#444;}'+
    '#me-files li{display:flex;justify-content:space-between;gap:12px;}'+
    '#me-files button{background:none;border:0;color:#999;cursor:pointer;font:inherit;}'+
    '#me-cap textarea{width:100%;box-sizing:border-box;margin-top:20px;min-height:120px;resize:vertical;'+
      'border:1px solid #ddd;border-radius:2px;padding:12px;font:400 15px/1.5 '+FONT+';color:#111;}'+
    '#me-cap .row{display:flex;gap:12px;align-items:center;margin-top:20px;}'+
    '#me-send{background:#111;color:#fff;border:0;border-radius:2px;padding:12px 22px;'+
      'font:500 15px/1 '+FONT+';cursor:pointer;}'+
    '#me-send:disabled{opacity:.4;cursor:default;}'+
    '#me-cap .status{font:400 14px/1.5 '+FONT+';color:#888;}'+
    '@media (max-width:700px){'+
      '#me-landing-box{position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;max-width:none;max-height:none;}'+
      '@supports (height:100dvh){#me-landing-box{height:100dvh;}}'+
      '#me-landing-box video{object-fit:cover;}'+
      '#me-list{position:relative;left:auto;top:auto;transform:none;width:100%;'+
        'padding:max(24px,env(safe-area-inset-top)) 16px 40px;box-sizing:border-box;font-size:14px;}'+
      '#me-browse{overflow-y:auto;-webkit-overflow-scrolling:touch;}'+
      '.me-row{grid-template-columns:3em 2.4em 1fr;gap:.6em;padding:9px 0;}'+
      '.me-row span{font-size:14px;}'+
      '.me-row span:nth-child(3),.me-row span:nth-child(5){display:none;}'+
      '#me-stage{display:none !important;}'+
      '#me-bar [data-a="full"]{display:none;}'+
    '}';
  document.head.appendChild(st);

  // ── build shell ─────────────────────────────────────────────────
  var app=document.createElement('div'); app.id='me-app';
  app.innerHTML='<div id="me-landing"></div>'+
    '<div id="me-browse"><div id="me-list"></div><div id="me-stage"><div id="me-stage-content"></div></div></div>';
  document.body.appendChild(app);

  var landing=app.querySelector('#me-landing');
  var listEl=app.querySelector('#me-list');
  var stage=app.querySelector('#me-stage');
  var stageContent=app.querySelector('#me-stage-content');

  var landingBox=document.createElement('div'); landingBox.id='me-landing-box';
  landing.appendChild(landingBox);

  var combined=document.createElement('video');
  combined.src=COMBINED_URL; combined.muted=true; combined.loop=true; combined.preload='auto';
  combined.setAttribute('playsinline',''); combined.setAttribute('muted','');
  landingBox.appendChild(combined);
  combined.play().catch(function(){});

  var clockEl=document.createElement('div'); clockEl.id='me-clock';
  landingBox.appendChild(clockEl);
  var stageClock=document.createElement('div'); stageClock.id='me-clock'; stageClock.className='rest';
  stage.appendChild(stageClock);
  var capArmed=false;        // true only at rest in browse view
  var capHovering=false;     // mouse currently over the resting clock
  var CAP_QUESTIONS=[
    'What will today mean in ten years?',
    'Who will you be when you open this?',
    'What does this moment sound like before it\u2019s gone?',
    'Will the future you still remember this?',
    'How much of today will survive the year?',
    'What would you say to yourself a decade from now?',
    'What slips away while you\u2019re not looking?',
    'What do you want to find waiting for you later?',
    'Will you recognise yourself by then?',
    'What\u2019s worth sending forward in time?',
    'What will you have forgotten by next year?',
    'What does now look like from the future?',
    'What do you want time to give back?',
    'How will you remember being here?',
    'What should outlast today?',
    'What are you leaving for the person you become?',
    'Will this still matter when you find it again?',
    'What of today do you want to keep from fading?',
    'What would the future you want to see?'
  ];
  var CAP_LABEL=CAP_QUESTIONS[Math.floor(Math.random()*CAP_QUESTIONS.length)];

  function fmtClock(){
    var d=new Date();
    function p(n,len){return String(n).padStart(len||2,'0');}
    return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())+'.'+p(d.getMilliseconds(),3);
  }
  function sizeClockTo(el,box){
    el.style.fontSize='100px';
    var measured=el.getBoundingClientRect().width;
    var target=box.clientWidth*0.98;
    if(measured>0) el.style.fontSize=(100*(target/measured))+'px';
  }
  function sizeClock(){ sizeClockTo(clockEl,landingBox); sizeClockTo(stageClock,stage); }
  var clockPaused=false;
  clockEl.textContent=fmtClock();
  stageClock.textContent=fmtClock();
  sizeClock();
  setTimeout(sizeClock,50);
  setTimeout(sizeClock,300);
  setInterval(function(){
    var t=fmtClock();
    if(!clockPaused) clockEl.textContent=t;
    if(capArmed && capHovering) stageClock.textContent=CAP_LABEL;
    else stageClock.textContent=t;
  },30);
  window.addEventListener('resize', sizeClock);

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
  landing.addEventListener('click', function(){ combined.pause(); app.classList.add('browse'); clearStage(); });
  document.addEventListener('mousemove', function(e){
    if(app.classList.contains('browse')) return;
    var r=landingBox.getBoundingClientRect();
    var inside = e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
    clockPaused = inside;
    if(inside) combined.pause(); else { combined.play().catch(function(){}); clockEl.textContent=fmtClock(); }
  });

  // ── data + render list ──────────────────────────────────────────
  fetch(DATA_URL,{cache:"no-cache"}).then(function(r){return r.json();}).then(function(d){
    PROJECTS=(d.projects||[]).filter(function(p){return p.published!==false;});
    var html='<div class="me-row head"><span>Year</span><span>\u2116</span><span>Client</span><span>Title</span><span>Category</span></div>'+
      '<div class="me-row about" data-about="1"><span>1997</span><span>000</span><span>Michel Elsasser</span><span>About</span><span data-contact="1">Contact</span></div>';
    PROJECTS.forEach(function(p,i){
      var no=String(i+1).padStart(3,'0');
      html+='<div class="me-row" data-i="'+i+'">'+
        '<span data-field="year" data-value="'+esc(p.year)+'">'+esc(p.year)+'</span>'+
        '<span>'+no+'</span>'+
        '<span data-field="client" data-value="'+esc(p.client)+'">'+esc(p.client)+'</span>'+
        '<span>'+esc(p.title)+'</span>'+
        '<span data-field="type" data-value="'+esc(p.type||'')+'">'+esc(p.type||'')+'</span>'+
      '</div>';
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
  function setStage(node){
    if(stageContent.firstChild===node) return;
    stageContent.innerHTML='';
    if(node) stageContent.appendChild(node);
  }
  function clearStage(){ setStage(null); stageClock.classList.add('rest'); stageClock.style.display=''; capArmed=true; stage.classList.add('cap-armed'); stage.style.pointerEvents='auto'; stage.classList.add('show'); stage.style.opacity='1'; }
  function showProject(p){ if(!p||!p._video) return; setStage(p._video); try{p._video.currentTime=0;}catch(e){} p._video.play().catch(function(){}); stageClock.classList.remove('rest'); stageClock.style.display=''; capArmed=false; capHovering=false; stage.classList.remove('cap-armed'); stage.style.pointerEvents='none'; stage.classList.add('show'); }
  function buildAboutHTML(){
    var igParts=ABOUT_TEXT.split(ABOUT_INSTAGRAM);
    var before=igParts[0], after=igParts[1]||'';
    var emailParts=after.split(ABOUT_EMAIL);
    var middle=emailParts[0], tail=emailParts[1]||'';
    var igUrl='https://instagram.com/'+ABOUT_INSTAGRAM.replace('@','');
    return esc(before).replace(/\n/g,'<br>')+
      '<a href="'+igUrl+'" target="_blank" rel="noopener">'+ABOUT_INSTAGRAM+'</a>'+
      esc(middle).replace(/\n/g,'<br>')+
      '<a href="mailto:'+ABOUT_EMAIL+'">'+ABOUT_EMAIL+'</a>'+
      esc(tail).replace(/\n/g,'<br>');
  }
  function showAbout(){ var a=document.createElement('div'); a.className='about'; a.innerHTML=buildAboutHTML(); setStage(a); stageClock.style.display='none'; capArmed=false; capHovering=false; stage.classList.remove('cap-armed'); stage.classList.add('show'); }

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
  // hover anywhere else on a row -> just preview that one row (dim the rest).
  var pinned=null;
  function revertStage(){ if(pinned==='about') showAbout(); else clearStage(); }
  listEl.addEventListener('mouseover', function(e){
    if(isMobile()) return;
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')){ revertStage(); applyDim(null); return; }
    var cell=e.target.closest('[data-field]');
    if(cell){ applyDim(null,cell.dataset.field,cell.dataset.value); }
    else { applyDim(row); }
    if(row.dataset.about){ showAbout(); }
    else { showProject(PROJECTS[+row.dataset.i]); }
  });
  listEl.addEventListener('mouseleave', function(){ revertStage(); applyDim(null); });

  // click -> always opens the film (or, for About: Contact opens mail, anything else pins the panel open)
  listEl.addEventListener('click', function(e){
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')) return;
    if(row.dataset.about){
      if(isMobile()){ openAboutScreen(); return; }
      if(e.target.closest('[data-contact]')){ window.location.href='mailto:'+ABOUT_EMAIL; return; }
      if(pinned==='about'){ pinned=null; clearStage(); }
      else { pinned='about'; showAbout(); }
      return;
    }
    pinned=null;
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
    clearStage();
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
    pinned=null;
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
    '<button id="me-cap-close">close</button>'+
    '<h2>Time Capsule</h2>'+
    '<div class="sub">Drop images, videos or write a note. Contact Michel to revisit your time capsule.</div>'+
    '<div id="me-drop">Drop files here, or tap to choose'+
      '<input id="me-file-input" type="file" multiple accept="image/*,video/*" style="display:none">'+
    '</div>'+
    '<ul id="me-files"></ul>'+
    '<textarea id="me-msg" placeholder="Write something\u2026"></textarea>'+
    '<div class="row"><button id="me-send">Send</button><span class="status"></span></div>';
  document.body.appendChild(cap);

  var capClose=cap.querySelector('#me-cap-close');
  var drop=cap.querySelector('#me-drop');
  var fileInput=cap.querySelector('#me-file-input');
  var fileList=cap.querySelector('#me-files');
  var msg=cap.querySelector('#me-msg');
  var sendBtn=cap.querySelector('#me-send');
  var statusEl=cap.querySelector('.status');
  var files=[];

  // open only when armed (resting stage) and clicking the clock
  stage.addEventListener('mouseenter', function(){ if(capArmed){ capHovering=true; stageClock.textContent=CAP_LABEL; sizeClock(); } });
  stage.addEventListener('mouseleave', function(){ if(capHovering){ capHovering=false; stageClock.textContent=fmtClock(); sizeClock(); } });
  stage.addEventListener('click', function(){ if(capArmed) openCapsule(); });

  function openCapsule(){ cap.classList.add('show'); }
  function closeCapsule(){ cap.classList.remove('show'); }
  capClose.addEventListener('click', closeCapsule);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && cap.classList.contains('show')) closeCapsule(); });

  function renderFiles(){
    fileList.innerHTML='';
    files.forEach(function(f,i){
      var li=document.createElement('li');
      var kb=(f.size/1024); var size= kb>1024 ? (kb/1024).toFixed(1)+' MB' : Math.round(kb)+' KB';
      li.innerHTML='<span>'+esc(f.name)+' &middot; '+size+'</span>';
      var x=document.createElement('button'); x.textContent='remove';
      x.addEventListener('click', function(){ files.splice(i,1); renderFiles(); });
      li.appendChild(x); fileList.appendChild(li);
    });
  }
  function addFiles(list){ for(var i=0;i<list.length;i++) files.push(list[i]); renderFiles(); }

  drop.addEventListener('click', function(){ fileInput.click(); });
  fileInput.addEventListener('change', function(){ addFiles(fileInput.files); fileInput.value=''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev,function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev,function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if(e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

  sendBtn.addEventListener('click', function(){
    if(!files.length && !msg.value.trim()){ statusEl.textContent='Add a file or a note first.'; return; }
    if(FORMSPREE_ID==='YOUR_FORM_ID'){ statusEl.textContent='Not configured yet.'; return; }
    sendBtn.disabled=true; statusEl.textContent='Sending\u2026';
    var fd=new FormData();
    fd.append('message', msg.value);
    fd.append('_subject', 'New time capsule \u2014 michelelsasser.com');
    files.forEach(function(f){ fd.append('attachment', f, f.name); });
    fetch('https://formspree.io/f/'+FORMSPREE_ID, { method:'POST', body:fd, headers:{'Accept':'application/json'} })
      .then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; }); })
      .then(function(res){
        if(res.ok){ statusEl.textContent='Sent. Thank you.'; files=[]; renderFiles(); msg.value='';
          setTimeout(closeCapsule,1200); }
        else { statusEl.textContent=(res.j && res.j.error) ? res.j.error : 'Something went wrong.'; }
        sendBtn.disabled=false;
      })
      .catch(function(){ statusEl.textContent='Network error. Try again.'; sendBtn.disabled=false; });
  });
})();
  }
})();
