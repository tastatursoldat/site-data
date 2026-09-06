import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js';
// site-capsule.js — michelelsasser.com  (hosted in tastatursoldat/site-data, loaded by Cargo as a module)
// Loads the Vimeo Player SDK, then runs the full overlay app.
// Landing = TIME CAPSULE: a bolted stainless capsule (three.js) that opens
// into the cinema index. Index + preview + player + radio unchanged.
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
  document.title='time capsule — Michel Elsasser';
  /* data comes from github raw: ~5min cache, CORS-open, and — unlike the
     jsdelivr @main mirror — never stuck behind a throttled purge. heavy media
     (previews, site.js itself) stays on the jsdelivr CDN. */
  var DATA_URL     = "https://raw.githubusercontent.com/tastatursoldat/site-data/main/website-projects.json";
  var MUSIC_PLAYLIST = "PLAMrTQJLnU5E"; // YouTube playlist id for the radio
  var RADIO_URL    = "https://raw.githubusercontent.com/tastatursoldat/site-data/main/radio.json"; // hz + note + title per track
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
    // capsule landing — the object stays on the paper under the open index
    '#me-dial{position:absolute;inset:0;}'+
    '#me-field{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:default;outline:none;}'+
    '#me-field{transition:opacity 480ms ease;}#me-app.open #me-field{opacity:0.55;}'+ /* opened, the object steps back so the index reads through it */
    '#me-field.hot{cursor:pointer;}'+
    '#me-field{touch-action:none;}#me-field.turning{cursor:grabbing;}'+
    /* the finder's line, written on the paper under the object */
    '#me-stamp{position:fixed;left:0;top:0;z-index:5;font:700 15px/1.55 '+FONT+';color:#0a0a0a;pointer-events:none;'+
      'font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;will-change:transform;transition:opacity 100ms ease;}'+
    '#me-app.open #me-stamp,#me-stamp.kept{opacity:1;transition:opacity 180ms cubic-bezier(0.23,1,0.32,1) 200ms;}'+
    /* the radio needs the paper: object and stamp leave it entirely */
    '#me-app.radio-mode #me-dial,#me-app.radio-mode #me-stamp{display:none;}'+
    '#me-app.nogl #me-dial,#me-app.nogl #me-stamp{display:none;}'+
    '#me-brand{position:fixed;top:1.15rem;left:1.2rem;z-index:10;font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;}'+
    '#me-ctrl{position:fixed;top:1.15rem;right:1.2rem;z-index:10;display:flex;gap:1.1rem;align-items:center;}'+
    '#me-ctrl button,#me-corner button{font:inherit;border:0;background:none;cursor:pointer;padding:0;}'+
    '#me-ctrl .txt,#me-corner .txt{font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '#me-ctrl .icon,#me-corner .icon{color:#0a0a0a;display:flex;align-items:center;}'+
    '#me-ctrl .icon svg,#me-corner .icon svg{width:15px;height:15px;}'+
    /* words answer: hover-in is INSTANT (apple: kill every latency), only the
       release back to full eases; press scales; keyboard sees an outline */
    '#me-brand,#me-ctrl .txt,#me-corner .txt,#me-corner .icon,#me-music,#me-about-close,'+
    '#me-bar button,#me-close{'+
      'transition:opacity 100ms ease,transform 160ms cubic-bezier(0.23,1,0.32,1);}'+
    '@media (hover:hover) and (pointer:fine){'+
      '#me-brand:hover,#me-ctrl .txt:hover,#me-corner .txt:hover,#me-corner .icon:hover,'+
      '#me-music:hover,#me-about-close:hover,#me-bar button:hover,#me-close:hover{'+
        'opacity:.55;transition-duration:0ms,160ms;}'+
    '}'+
    '#me-brand:active,#me-ctrl .txt:active,#me-corner .txt:active,#me-corner .icon:active,'+
    '#me-music:active,#me-about-close:active,#me-bar button:active,#me-close:active{'+
      'transform:scale(0.97);}'+
    '#me-ctrl .txt:focus-visible,#me-corner .txt:focus-visible,#me-corner .icon:focus-visible,'+
    '#me-about-close:focus-visible{outline:1.5px solid #0a0a0a;outline-offset:4px;}'+
    '#me-ctrl .txt:focus:not(:focus-visible),#me-corner .txt:focus:not(:focus-visible),'+
    '#me-corner .icon:focus:not(:focus-visible),#me-about-close:focus:not(:focus-visible){outline:none;}'+
    /* the bottom-right corner is the radio's home: the word radio, or —
       while a song plays — the pause glyph and the title in its place.
       nothing pops from nothing: pause+title rise in, the word fades;
       exit runs faster than enter */
    '#me-corner{position:fixed;right:1.2rem;bottom:1.05rem;z-index:10;display:flex;gap:.8rem;align-items:center;}'+
    '#me-corner #me-stop{display:flex;opacity:0;transform:translateY(6px);pointer-events:none;'+
      'transition:opacity 120ms ease,transform 120ms cubic-bezier(0.23,1,0.32,1);}'+
    '#me-app.radio-on #me-stop{opacity:1;transform:none;pointer-events:auto;'+
      'transition:opacity 180ms cubic-bezier(0.23,1,0.32,1),transform 180ms cubic-bezier(0.23,1,0.32,1);}'+
    '#me-music{font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;'+
      'min-height:1em;max-width:44vw;white-space:nowrap;overflow:hidden;'+
      'display:block;opacity:0;transform:translateY(6px);pointer-events:none;'+
      'transition:opacity 120ms ease,transform 120ms cubic-bezier(0.23,1,0.32,1);}'+
    '#me-app.titled #me-music{opacity:1;transform:none;pointer-events:auto;'+
      'transition:opacity 180ms cubic-bezier(0.23,1,0.32,1) 40ms,transform 180ms cubic-bezier(0.23,1,0.32,1) 40ms;}'+
    '#me-corner #me-radio{transition:opacity 120ms ease,transform 160ms cubic-bezier(0.23,1,0.32,1);}'+
    '#me-app.titled #me-corner #me-radio{opacity:0;pointer-events:none;position:absolute;right:0;bottom:0;}'+
    '#me-music .in{display:inline-block;white-space:nowrap;}'+
    '#me-music.scroll .in{animation:me-marq 6s ease-in-out infinite alternate;}'+
    '@keyframes me-marq{from{transform:translateX(0);}to{transform:translateX(var(--me-shift,0px));}}'+
    /* the hover title moved to the free bottom-left corner */
    '#me-tc{position:fixed;left:1.2rem;bottom:1.05rem;z-index:10;font:700 15px/1.55 '+FONT+';'+
      'font-variant-numeric:tabular-nums;color:#0a0a0a;pointer-events:none;min-height:1em;}'+
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
    // browse — the contents. the layer itself lets the pointer through to the
    // parked capsule; only the list and the panel take events
    '#me-browse{position:absolute;inset:0;display:none;pointer-events:none;}'+
    '#me-app.browse #me-browse{display:block;}'+
    '#me-app.open #me-browse{z-index:6;}'+ /* the words lie on top of the metal */
    '#me-list,#me-prev{pointer-events:auto;}'+
    '#me-list{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:84%;'+
      'font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '.me-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr) minmax(0,3fr) minmax(0,2fr);gap:1em;cursor:pointer;}'+
    '.me-row.head{cursor:default;margin-bottom:.2em;}'+
    '.me-row span{transition:opacity .15s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
    /* entering the cinema deals the rows with a speedramp: the cascade pours
       in accelerating — first gaps ~30ms, closing to ~4ms (per-row --d,
       computed at build). 200ms each, 6px rise. backwards fill holds the
       hidden state through the delay (forwards would fight the hover dim) */
    /* direct cells only — the scramble effect inserts inner spans that must
       not restart this animation (backwards fill would hide them) */
    '#me-app.browse.dealt .me-row > span{animation:me-rowin 200ms cubic-bezier(0.23,1,0.32,1) backwards;'+
      'animation-delay:var(--d,0ms);}'+
    '@keyframes me-rowin{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}'+
    /* sealing: the rows go before the plate comes back */
    '#me-app.sealing .me-row > span{opacity:0;transition:opacity 120ms ease;}'+
    '.me-row span{opacity:1;}'+
    '.me-row[data-dim] span{opacity:.35;}'+
    /* the index is black, always — only the scrambled glyphs carry colour */
    '.me-row[data-hot] span{color:#0a0a0a;}'+
    /* wide screens only: the list is one grid with content-sized columns —
       names are never cut — and the hovered film plays on the right, sized to
       whatever room the list leaves (measured in js). rows keep their
       behaviour via display:contents. a film without a preview gets a big
       live clock. below this width the centred list stands alone — the
       side-by-side pair needs the room */
    '#me-prev{display:none;}'+ /* exists only on wide screens — hidden everywhere else */
    '@media (min-width:1050px){'+
      '#me-list{display:grid;grid-template-columns:repeat(5,max-content);column-gap:2em;'+
        'left:clamp(20px,4vw,64px);width:auto;transform:translateY(-50%);}'+
      /* open: the list starts under the stamp, the panel aligns to the list head */
      '#me-app.open #me-list{top:50%;transform:translateY(-50%);}'+ /* the index in the middle of the page, over the object */
      '#me-app.open #me-prev{top:50%;transform:translateY(-50%);}'+ /* the film sits in the middle of the page */
      '.me-row{display:contents;}'+
      /* content-sized columns never need an ellipsis — and a swapped glyph
         must never produce one */
      '.me-row > span{overflow:visible;text-overflow:clip;}'+
      '.me-row span{cursor:pointer;}'+
      '.me-row.head span{margin-bottom:.2em;cursor:default;}'+
      /* no fixed ratio — the panel takes each film's own format (js-sized),
         morphing between formats; a swap crossfades under a light blur.
         no black box EVER: the panel is invisible until the film's first
         frame is actually decoded (.ready), and carries no background */
      '#me-prev{position:fixed;right:clamp(20px,4vw,64px);top:50%;transform:translateY(-50%);'+
        'display:none;background:transparent;opacity:0;'+
        'transition:opacity 140ms ease,width 220ms cubic-bezier(0.23,1,0.32,1),height 220ms cubic-bezier(0.23,1,0.32,1);}'+
      '#me-prev.ready{opacity:1;}'+
      '#me-prev video,#me-prev img{transition:opacity 140ms ease,filter 140ms ease;}'+
      '#me-prev.swapping video,#me-prev.swapping img{opacity:0;filter:blur(2px);}'+
      /* absolute + fill: the box already carries the film's exact format, so
         fill cannot distort — and safari's object-fit/inline-video quirks
         (baked black borders) die here */
      '#me-prev video{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;}'+
      /* hub may stage .gif previews — those render through an img, not video */
      '#me-prev img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:none;}'+
      '#me-prev.gif video{display:none;}'+
      '#me-prev.gif img{display:block;}'+
      '#me-app.browse #me-prev.on{display:block;}'+
    '}'+
    '@media (min-width:701px) and (max-width:1049px){'+
      '#me-app.open #me-list{top:50%;left:clamp(20px,4vw,64px);width:calc(100% - 2*clamp(20px,4vw,64px));transform:translateY(-50%);}'+
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
    '#me-track{position:relative;flex:1;height:16px;cursor:pointer;display:flex;align-items:center;}'+
    '#me-track::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(255,255,255,.85);transform:translateY(-50%);}'+
    '#me-head{position:absolute;top:50%;left:0;width:1px;height:13px;background:#fff;transform:translate(-50%,-50%);}'+
    '#me-close{position:absolute;top:clamp(16px,3vw,40px);right:clamp(16px,3vw,40px);z-index:4;background:none;border:0;'+
      'color:#fff;mix-blend-mode:difference;font:700 15px/1.55 '+FONT+';cursor:pointer;}'+
    '#me-info{position:absolute;top:clamp(16px,3vw,40px);left:clamp(20px,4vw,64px);z-index:4;color:#fff;mix-blend-mode:difference;'+
      'font:700 15px/1.55 '+FONT+';max-width:60vw;opacity:0;pointer-events:none;transition:opacity .2s;}'+
    '#me-info.show{opacity:1;}#me-info .t{margin-bottom:.4em;}#me-info .d{opacity:.7;}'+
    // mobile: compact desktop-style list, full-screen About
    /* the about page breathes in: fade + 0.98 scale, centred (a modal has no
       trigger to grow from). exit runs faster than enter */
    '#me-about-screen{position:fixed;inset:0;background:#EFEFEC;z-index:2147483700;'+
      'padding:max(24px,env(safe-area-inset-top)) 24px 40px;box-sizing:border-box;overflow-y:auto;'+
      'opacity:1;transform:scale(1);'+
      'transition:opacity 200ms ease,transform 200ms cubic-bezier(0.23,1,0.32,1);}'+
    '@starting-style{#me-about-screen{opacity:0;transform:scale(0.98);}}'+
    '#me-about-screen.closing{opacity:0;transform:scale(0.98);'+
      'transition:opacity 140ms ease,transform 140ms cubic-bezier(0.23,1,0.32,1);}'+
    /* close sits exactly where the words sit, in exactly their voice */
    '#me-about-close{position:fixed;top:1.15rem;right:1.2rem;'+
      'background:none;border:0;padding:0;font:700 15px/1.55 '+FONT+';cursor:pointer;color:#0a0a0a;}'+
    '#me-about-screen .txt{margin-top:60px;font:400 16px/1.6 '+FONT+';white-space:pre-line;color:#111;}'+
    '#me-about-screen .txt a{color:#111;text-decoration:none;}'+
    '#me-about-screen .ab-brand{position:fixed;top:1.15rem;left:1.2rem;font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;}'+
    /* phones: the open capsule is a scrolling column — a snapshot of the
       object, the stamp, then the index. the live object and the hover word
       leave while the column is up */
    '#me-col{display:none;}'+
    '@media (max-width:700px){'+
      '#me-dial,#me-stamp{transition:opacity 120ms ease;}'+
      '#me-app.open #me-dial,#me-app.open #me-stamp{opacity:0;pointer-events:none;transition:opacity 120ms ease 140ms;}'+
      '#me-app.browse #me-tc{display:none;}'+
      '#me-col{display:block;position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:64px 18px 60px;box-sizing:border-box;'+
        'opacity:0;pointer-events:none;transition:opacity 120ms ease;}'+
      '#me-app.open #me-col{opacity:1;pointer-events:auto;transition:opacity 200ms ease 140ms;}'+
      '#me-col .shot{position:relative;overflow:hidden;margin:0 -18px;}'+
      '#me-col .shot img{position:absolute;left:0;display:block;}'+
      '#me-col .plate{font:700 15px/1.55 '+FONT+';color:#0a0a0a;font-variant-numeric:tabular-nums;margin-top:8px;}'+
      '#me-app.browse #me-browse{overflow:hidden;height:100vh;display:flex;align-items:center;}'+
      '@supports (height:100dvh){#me-app.browse #me-browse{height:100dvh;}}'+
      '#me-app.open #me-browse{position:static;display:block;height:auto;overflow:visible;}'+
      '#me-list{position:relative;left:auto;top:auto;transform:none;width:100%;'+
        'padding:0 18px;box-sizing:border-box;font-size:14px;}'+
      '#me-app.open #me-list{padding:0;margin-top:40px;}'+
      '.me-row{grid-template-columns:3em 2.4em minmax(0,1fr);gap:.6em;padding:7px 0;}'+
      '.me-row span{font-size:14px;}'+
      '.me-row span:nth-child(3),.me-row span:nth-child(5){display:none;}'+
      '#me-music{max-width:calc(100vw - 2.4rem);}'+
      '#me-bar [data-a="full"]{display:none;}'+
    '}'+
    /* reduced motion: movement dies, fades stay */
    '@media (prefers-reduced-motion:reduce){'+
      '#me-app.browse.dealt .me-row span{animation:none;}'+
      '#me-corner #me-stop,#me-music,#me-app.titled #me-music,#me-app.radio-on #me-stop{transform:none;}'+
      '#me-prev{transition:none;}'+
      '#me-stamp,#me-app.open #me-stamp,#me-stamp.kept{transition:none;}'+
      '#me-about-screen,#me-about-screen.closing{transform:none;}'+
      '#me-band-in.glide{transition:none;}'+
    '}';
  document.head.appendChild(st);

  // ── build shell ─────────────────────────────────────────────────
  var app=document.createElement('div'); app.id='me-app';
  app.innerHTML=
    '<div id="me-dial"><canvas id="me-field" tabindex="0" role="button" aria-label="time capsule — sealed. press enter to open"></canvas></div>'+
    '<div id="me-col"></div>'+
    '<div id="me-browse"><div id="me-list"></div></div>'+
    '<div id="me-stamp"></div>'+
    '<div id="me-brand">time capsule</div>'+
    '<div id="me-ctrl">'+
      /* top right: the views and the about page, in the voice of the mark */
      '<button id="me-btnview" class="txt" aria-label="Cinema — the contents">cinema</button>'+
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
  var fieldMode='dial'; /* 'dial' = the capsule (sealed or open) | 'radio' = the tuning scale alone */

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
  /* the reference sheet runs roughly 7 coloured posters to 5 black-and-white —
     rolled ONCE per load, next to the theme (a b/w deal gets a black gasket) */
  var bwDeal=Math.random()<0.4;
  /* the index hover borrows the deal's colour — even on a b/w deal it stays colourful */
  document.documentElement.style.setProperty('--me-theme',theme.key);

  // ── the object: stainless time capsule, room light, etched plate ──
  var Q=new URLSearchParams(location.search); /* ?cam=0 opts out of the camera reflection */
  function clamp(v,a,b){return Math.min(b,Math.max(a,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function outQuint(t){return 1-Math.pow(1-t,5);}
  function canHover(){return matchMedia('(hover:hover) and (pointer:fine)').matches&&!isMobile();}
  var roll={
    exposure:0.8,
    rough:0.45,    /* brushed aluminium: the room is a soft blur on it */
    aniso:0.7,
    tone:0.82,
    key:1.6,
    shadow:0.2,
    yaw:30,
    fov:32,       /* lens: wider = more perspective in the reflections */
    dist:19,
    wave:0.015,    /* polish waviness: bends the reflections */
    camMix:1.2,   /* the visitor in the room light */
    mirror:0.48,   /* the visitor on the metal, soft */
    cyl:1,
    rx:0,ry:0,     /* a preset turn (unused on the site) */
    warp:0.12,    /* how much the curvature bends the picture */
    lens:0.75,     /* 0.5x feel: the camera frame maps smaller on the metal */
    envGain:0.9,  /* how bright the photographed studio is in the metal */
    cut:3,      /* engraving: wall width (px of blur at 652px/unit) */
    relief:64,    /* engraving: wall slope */
    depth:3.5     /* engraving: normal strength */
  };
  var sealColor=bwDeal?'#141416':theme.key;

  var cvs=app.querySelector('#me-field');
  var browseEl=app.querySelector('#me-browse');
  var stampEl=app.querySelector('#me-stamp'),colEl=app.querySelector('#me-col');
  var W=0,H=0,DPR=Math.min(devicePixelRatio||1,2);

  var renderer=null,gl=null;
  /* probe the context first: three's constructor logs an error before it throws */
  try{
    var glAttr={alpha:true,antialias:true,powerPreference:'high-performance'};
    gl=cvs.getContext('webgl2',glAttr)||cvs.getContext('webgl',glAttr);
    if(gl)renderer=new THREE.WebGLRenderer({canvas:cvs,context:gl,alpha:true,antialias:true,powerPreference:'high-performance'});
  }catch(e){renderer=null;}
  var GL=!!renderer; /* no webgl (lockdown mode, blocked gpu): the index stands alone, the words still work */
  if(GL){
    renderer.setPixelRatio(DPR);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=roll.exposure;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap; /* VSM bled light where two parts overlapped: a hole in the shadow */
  }else app.classList.add('nogl');
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(roll.fov,1,1,400);
  var CAM_DIST=roll.dist,CAM_EL=THREE.MathUtils.degToRad(14);
  camera.position.set(0,CAM_DIST*Math.sin(CAM_EL),CAM_DIST*Math.cos(CAM_EL));
  camera.lookAt(0,0,0);

  /* a photographer's room: big soft top light, a fill from the front-left, a
     rim strip behind, and a darker floor so the underside falls off */
  var roomScene=null,camPlane=null,pmrem=null,envRT=null;
  function buildRoom(){
    var room=new THREE.Scene();
    function panel(w,h,x,y,z,rx,ry,c){
      var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
      m.position.set(x,y,z);m.rotation.set(rx,ry,0);room.add(m);return m;
    }
    /* the walls: a real studio, photographed all round (an equirectangular panorama that ships
       next to this file), sitting inside a sphere; the softboxes below add the crisp highlights */
    var wallMat=new THREE.MeshBasicMaterial({color:new THREE.Color(roll.envGain,roll.envGain,roll.envGain),side:THREE.BackSide});
    var walls=new THREE.Mesh(new THREE.SphereGeometry(14.5,64,32),wallMat);walls.scale.x=-1;room.add(walls);
    try{var envLoader=new THREE.TextureLoader();envLoader.load(new URL('env-studio.jpg',import.meta.url).href,function(t){t.colorSpace=THREE.SRGBColorSpace;wallMat.map=t;wallMat.needsUpdate=true;renderEnv();needPaint();});}catch(err){}
    panel(30,30,0,-10,0,Math.PI/2,0,new THREE.Color(0.8,0.8,0.79));             /* floor: the paper */
    panel(10,6,0,9.9,1,Math.PI/2,0,new THREE.Color(1.5,1.5,1.45));              /* key softbox above */
    panel(12,4,0,3,-14,0,0,new THREE.Color(1.4,1.4,1.45));                      /* rim strip behind */
    function disc(r,x,y,z,ry,rx,c){ /* round lights: their reflections curve around the tube */
      var m=new THREE.Mesh(new THREE.CircleGeometry(r,48),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
      m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);room.add(m);return m;
    }
    disc(3.2,-9,4,8,Math.PI/2.4,0,new THREE.Color(2.6,2.6,2.7));                /* round fill, front-left */
    disc(2.2,9,6,5,-Math.PI/2.2,0,new THREE.Color(1.6,1.6,1.65));               /* round bounce, right */
    disc(1.4,-4,8,-6,0,Math.PI/2,new THREE.Color(3.0,3.0,2.9));                 /* small hard light above-behind */
    disc(2.6,6,-1,10,Math.PI,0,new THREE.Color(1.1,1.1,1.15));                  /* a low round light in front */
    /* the visitor's side of the room: the camera feed, where the camera stands */
    camPlane=new THREE.Mesh(new THREE.PlaneGeometry(15,11.25),new THREE.MeshBasicMaterial({color:new THREE.Color(roll.camMix,roll.camMix,roll.camMix),toneMapped:false}));
    camPlane.position.set(0,0.5,13.6);camPlane.rotation.y=Math.PI;camPlane.visible=false;room.add(camPlane);
    return room;
  }
  function renderEnv(){
    if(!GL)return;
    if(!pmrem)pmrem=new THREE.PMREMGenerator(renderer);
    var rt=pmrem.fromScene(roomScene,0.02);
    if(envRT)envRT.dispose(); /* the target, not just its texture — otherwise every re-light leaks a 6 MB fbo+texture */
    envRT=rt;scene.environment=rt.texture;
  }
  roomScene=buildRoom();renderEnv();

  /* ── geometry in object units: tube radius 1 ─────────────────────
     a polished stainless tube; at each end a thick flange ring clamped by
     eight small radial socket screws, and beyond it a heavy machined end
     cap. the right cap is the lid: its screws back out of the ring, then
     the cap is pulled off. */
  var R=1,D=2,LTOT=3.6*D;
  var RF=1.28,TR=0.55,CAPL=0.5,CAPR=0.98,GAP=0.035,NB=8,FIL=0.035,SR=0.07,SL=0.16,SOUT=0.24;
  var XL=0, XR=LTOT;
  var TUBE0=XL+CAPL+GAP+TR, TUBE1=XR-CAPL-GAP-TR;    /* the tube between the rings */
  var LID_HOME=XR-CAPL;                              /* the right cap's inner face */
  var TP=CAPL;                                       /* (kept for the placement code) */

  function discGeo(rad,len){ /* a chamfered disc, axis y, from 0 to len */
    var p=[];
    p.push(new THREE.Vector2(0,0));p.push(new THREE.Vector2(rad-FIL,0));p.push(new THREE.Vector2(rad,FIL));
    p.push(new THREE.Vector2(rad,len-FIL));p.push(new THREE.Vector2(rad-FIL,len));p.push(new THREE.Vector2(0,len));
    return new THREE.LatheGeometry(p,160);
  }
  function ringGeo(len){ /* a flange ring with its bore: the cap's plug sits in it */
    var p=[];
    p.push(new THREE.Vector2(0.9,0));p.push(new THREE.Vector2(RF-FIL,0));p.push(new THREE.Vector2(RF,FIL));
    p.push(new THREE.Vector2(RF,len-FIL));p.push(new THREE.Vector2(RF-FIL,len));p.push(new THREE.Vector2(0.9,len));p.push(new THREE.Vector2(0.9,0));
    return new THREE.LatheGeometry(p,160);
  }
  function tubeGeo(){
    var p=[new THREE.Vector2(R,0),new THREE.Vector2(R,TUBE1-TUBE0)]; /* an open tube: no end discs, the bore is a hole */
    var g=new THREE.LatheGeometry(p,192);
    var pos=g.attributes.position,uv=g.attributes.uv;
    for(var i=0;i<pos.count;i++)uv.setY(i,clamp(pos.getY(i)/(TUBE1-TUBE0),0,1));
    return g;
  }
  function lengthUV(geo,y0,y1){
    var pos=geo.attributes.position,uv=geo.attributes.uv;
    for(var i=0;i<pos.count;i++){uv.setY(i,clamp((pos.getY(i)-y0)/(y1-y0),0,1));}
    uv.needsUpdate=true;
  }

  /* ── surfaces ─────────────────────────────────────────────────── */
  function brush(r,w,h,ppx,ppy,seed){ /* lines along the tube: the grain of polished stainless */
    r.fillStyle='#8c8c8c';r.fillRect(0,0,w,h);
    var rnd=(function(){var q=seed;return function(){q=(q*1664525+1013904223)>>>0;return q/4294967296;};})();
    var n=Math.round(110*(w/ppx)*(h/ppy));
    for(var i=0;i<n;i++){
      var x=rnd()*w,len=(0.6+rnd()*5.5)*ppy,y=rnd()*h,a=0.05+rnd()*0.12,dark=rnd()<0.5;
      r.strokeStyle=dark?'rgba(40,40,40,'+a+')':'rgba(230,230,230,'+a+')';r.lineWidth=(0.6+rnd()*1.2)*ppx/326;
      r.beginPath();r.moveTo(x,y);r.lineTo(x+(rnd()-0.5)*2,y+len);r.stroke();
    }
  }
  var steel=new THREE.MeshPhysicalMaterial({
    color:new THREE.Color(roll.tone,roll.tone,roll.tone*0.99),metalness:1,roughness:roll.rough,
    envMapIntensity:1.0
  });
  steel.anisotropy=roll.aniso;steel.anisotropyRotation=Math.PI/2;
  /* every other part is the same metal as the tube: same tone, same roughness, same brushing
     along the axis (the grain scaled to each part's length), same anisotropy */
  function sameMetal(){
    var mt=new THREE.MeshPhysicalMaterial({color:steel.color.clone(),metalness:1,roughness:roll.rough,envMapIntensity:1.0});
    mt.anisotropy=roll.aniso;mt.anisotropyRotation=Math.PI/2;return mt;
  }
  var plateSteel=sameMetal(),capSteel=sameMetal(),boltSteel=sameMetal();
  var socketMat=new THREE.MeshStandardMaterial({color:0x111213,metalness:0.6,roughness:0.85});
  /* the visitor in the steel, the way the reel does it: the mirrored camera picture is laid
     over the metal in screen space — where you look, you see yourself — and bent by the
     surface normal so it wraps and compresses around the tube like a curved mirror */
  var mirrorU={uCam:{value:null},uCamMix:{value:0},uRes:{value:new THREE.Vector2(1,1)},uWarp:{value:roll.warp},uCamAspect:{value:1},uZoom:{value:roll.lens},uTexel:{value:new THREE.Vector2(1/256,1/256)},uCyl:{value:roll.cyl}};
  function mirrorSteel(mat){
    mat.onBeforeCompile=function(sh){
      Object.assign(sh.uniforms,mirrorU);
      sh.fragmentShader=sh.fragmentShader
        .replace('#include <common>','#include <common>\nuniform sampler2D uCam;uniform float uCamMix;uniform vec2 uRes;uniform float uWarp;uniform float uCamAspect;uniform float uZoom;uniform vec2 uTexel;uniform float uCyl;')
        .replace('#include <opaque_fragment>',
          '#include <opaque_fragment>\n'+
          'if(uCamMix>0.0){\n'+
          '  vec2 suv=gl_FragCoord.xy/uRes;\n'+
          '  float sa=uRes.x/uRes.y;\n'+
          '  vec3 rf=reflect(-normalize(vViewPosition),nonPerturbedNormal);\n'+ /* the smooth surface normal: the 8-bit normal map would terrace the picture */ /* where this point of the metal looks: the curve squeezes the picture toward the edges */
          '  vec2 cuv=vec2(0.5+(suv.x-0.5)*(sa/uCamAspect)*uZoom+rf.x*uCyl*0.2,0.5+mix((suv.y-0.5)*uZoom*1.15,rf.y*uZoom/3.0,uCyl));\n'+
          '  cuv+=(normal.xy-nonPerturbedNormal.xy)*uWarp;\n'+ /* only the cut of the letters bends it */
          '  vec3 camc=vec3(0.0);\n'+
          '  for(int i=-5;i<=5;i++)for(int j=-2;j<=2;j++){camc+=texture2D(uCam,clamp(cuv+vec2(float(i)*uTexel.x*1.6,float(j)*uTexel.y*0.5),0.0,1.0)).rgb;}\n'+ /* long along the brushing, short across it */
          '  camc/=55.0;\n'+
          '  float lum=dot(camc,vec3(0.299,0.587,0.114));camc=mix(vec3(lum),camc,0.45);camc=(camc-0.5)*1.45+0.5;camc*=0.86;\n'+
          '  float edge=smoothstep(-0.05,0.05,cuv.x)*smoothstep(1.05,0.95,cuv.x)*smoothstep(-0.05,0.05,cuv.y)*smoothstep(1.05,0.95,cuv.y)*mix(1.0,smoothstep(0.0,0.3,rf.z),uCyl);\n'+
          '  float fres=pow(1.0-max(normal.z,0.0),1.5);\n'+
          '  vec3 refl=gl_FragColor.rgb*0.45+camc*0.9;\n'+
          '  gl_FragColor.rgb=mix(gl_FragColor.rgb,refl,uCamMix*edge*(1.0-0.5*fres));\n'+
          '}');
    };
    mat.customProgramCacheKey=function(){return 'mirror';};
  }
  mirrorSteel(steel);mirrorSteel(plateSteel);mirrorSteel(capSteel);mirrorSteel(boltSteel);

  /* ── the engraving lives in the tube's own surface: a normal map (the cut), a roughness map
     (brushing, matte floor) and an albedo map (the floor of a deep cut sits in shadow) ── */
  var TEX=(matchMedia('(pointer:coarse)').matches?2048:4096);
  var TW=TEX,TH=TEX,PPX=TW/(2*Math.PI*R),PPY=TH/(TUBE1-TUBE0); /* px per unit: around, along */
  var tubeRough=document.createElement('canvas');tubeRough.width=TW;tubeRough.height=TH;
  var tubeBump=document.createElement('canvas');tubeBump.width=TW;tubeBump.height=TH;
  var tubeNormal=document.createElement('canvas');tubeNormal.width=TW;tubeNormal.height=TH;
  var plateLines=['sealed in zürich by michel elsasser','…','open when found'];
  function plateText(g,fillLight,blur,scale,stroke,lw){
    scale=scale||1;
    var fontPx=Math.round(0.19*PPX*scale),lineH=fontPx*1.55;
    g.save();g.translate(TW/2*scale,(TH-0.42*PPY)*scale);
    g.rotate(-Math.PI/2);g.scale(PPY/PPX,1);
    if(blur)g.filter='blur('+blur+'px)';
    g.font='400 '+fontPx+'px '+FONT;g.textBaseline='middle';g.textAlign='left';g.fillStyle=fillLight;
    if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.lineJoin='round';plateLines.forEach(function(t,i){g.strokeText(t,0,-lineH+i*lineH);});}
    plateLines.forEach(function(t,i){g.fillText(t,0,-lineH+i*lineH);});
    g.restore();
  }
  function wave(u,v){ /* polish waviness, shared by both engraved faces */
    var A=roll.wave;
    var nx=A*(Math.sin(6.283*(2.3*v+0.7*u))+0.6*Math.sin(6.283*(5.1*v-1.3*u+0.3))+0.35*Math.sin(6.283*(9.7*v+2.1*u+0.8))+0.5*Math.sin(6.283*(1.37*v-0.41*u+0.61)+2.1*Math.sin(6.283*0.9*v)));
    var ny=A*(0.8*Math.sin(6.283*(1.7*u+3.2*v+1.1))+0.5*Math.sin(6.283*(4.3*u-2.2*v))+0.4*Math.sin(6.283*(0.8*u+1.9*v+0.2)+1.7*Math.sin(6.283*1.3*u)));
    return [nx,ny];
  }
  function sobelBox(h,n,bx0,by0,bw,bh){ /* height field → normals inside one box, the waviness under it */
  var hd=h.getImageData(bx0,by0,bw,bh).data,nd=n.createImageData(bw,bh),N=nd.data,S=roll.relief;
  function H(x,y){x=clamp(x,0,bw-1);y=clamp(y,0,bh-1);return hd[(y*bw+x)*4]/255;}
  for(var y=0;y<bh;y++)for(var x=0;x<bw;x++){
    var dx=(H(x+1,y-1)+2*H(x+1,y)+H(x+1,y+1))-(H(x-1,y-1)+2*H(x-1,y)+H(x-1,y+1));
    var dy=(H(x-1,y+1)+2*H(x,y+1)+H(x+1,y+1))-(H(x-1,y-1)+2*H(x,y-1)+H(x+1,y-1));
    var wv=wave((bx0+x)/TW,1-(by0+y)/TH);
    var nx=dx*S+wv[0],ny=-dy*S+wv[1],nz=1,len=Math.hypot(nx,ny,nz);
    var i=(y*bw+x)*4;N[i]=Math.round((nx/len*0.5+0.5)*255);N[i+1]=Math.round((ny/len*0.5+0.5)*255);N[i+2]=Math.round((nz/len*0.5+0.5)*255);N[i+3]=255;
  }
  n.putImageData(nd,bx0,by0);
  }
  function drawTube(){
    var r=tubeRough.getContext('2d');brush(r,TW,TH,PPX,PPY,17);plateText(r,'#7a7a7a',0);   /* the cut floor: the same metal, a touch smoother, nothing more */
    var h=tubeBump.getContext('2d');h.fillStyle='#808080';h.fillRect(0,0,TW,TH);plateText(h,'#ffffff',0,1); /* a clean cut: no rim, the letters keep their width */
    var n=tubeNormal.getContext('2d');n.fillStyle='rgb(128,128,255)';n.fillRect(0,0,TW,TH);
    var WS=512,wc=document.createElement('canvas');wc.width=WS;wc.height=WS;var wg=wc.getContext('2d');
    var wd=wg.createImageData(WS,WS),W8=wd.data;
    for(var wy=0;wy<WS;wy++)for(var wx=0;wx<WS;wx++){
      var t=wave(wx/WS,1-wy/WS),wl=Math.hypot(t[0],t[1],1),wi=(wy*WS+wx)*4;
      W8[wi]=Math.round((t[0]/wl*0.5+0.5)*255);W8[wi+1]=Math.round((t[1]/wl*0.5+0.5)*255);W8[wi+2]=Math.round((1/wl*0.5+0.5)*255);W8[wi+3]=255;
    }
    wg.putImageData(wd,0,0);n.imageSmoothingEnabled=true;n.drawImage(wc,0,0,TW,TH);
    var fontPx=Math.round(0.19*PPX),lineH=fontPx*1.55;
    var bx0=Math.max(0,Math.floor(TW/2-lineH*1.8)),bx1=Math.min(TW,Math.ceil(TW/2+lineH*1.8));
    var by1=Math.ceil(TH-0.42*PPY+8),by0=Math.max(0,Math.floor(by1-4.2*PPY));
    var bw=bx1-bx0,bh=by1-by0;
    var hb=h.getImageData(bx0,by0,bw,bh);softBlur(hb.data,bw,bh,Math.max(1,Math.round(roll.cut*PPX/652)));h.putImageData(hb,bx0,by0); /* the wall of the cut, blurred by hand: the same in every browser */
    sobelBox(h,n,bx0,by0,bw,bh);
  }
  drawTube();
  var brushOnly=document.createElement('canvas');brushOnly.width=1024;brushOnly.height=1024;brush(brushOnly.getContext('2d'),1024,1024,PPX/4,PPY/4,29);
  function brushFor(len){var t=new THREE.CanvasTexture(brushOnly);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,Math.max(0.02,len/(TUBE1-TUBE0)));t.anisotropy=8;return t;}
  plateSteel.roughnessMap=brushFor(TR);capSteel.roughnessMap=brushFor(CAPL);boltSteel.roughnessMap=brushFor(SL);
  var tubeRoughTex=new THREE.CanvasTexture(tubeRough),tubeNormalTex=new THREE.CanvasTexture(tubeNormal);
  [tubeRoughTex,tubeNormalTex].forEach(function(t){t.wrapS=THREE.RepeatWrapping;t.offset.x=0.5;t.anisotropy=8;});
  steel.roughnessMap=tubeRoughTex;steel.normalMap=tubeNormalTex;steel.normalScale=new THREE.Vector2(roll.depth,roll.depth);steel.needsUpdate=true;

  /* ── assembly ─────────────────────────────────────────────────── */
  var group=new THREE.Group();scene.add(group);
  var tube=new THREE.Mesh(tubeGeo(),steel);tube.rotation.z=-Math.PI/2;tube.position.x=TUBE0;tube.castShadow=true;group.add(tube);
  var ringL=new THREE.Mesh(ringGeo(TR),plateSteel);ringL.rotation.z=-Math.PI/2;ringL.position.x=XL+CAPL+GAP;ringL.castShadow=true;group.add(ringL);
  var ringR=new THREE.Mesh(ringGeo(TR),plateSteel);ringR.rotation.z=-Math.PI/2;ringR.position.x=TUBE1;ringR.castShadow=true;group.add(ringR);
  /* the tube's end walls close the bores: with the cap off you look at steel, not into a hole */
  var endWallGeo=discGeo(0.9,0.1); /* a lathe like every part: a cylinder's uv would leave it flat */
  /* the tube is a hole: a bore runs its whole length, darkening with depth, and the far end sits in the dark */
  /* the inside is machined, not polished: rough, half-diffuse metal that the key light rakes across through the opening,
     so twisting the object moves the light inside it */
  var holeEnd=new THREE.MeshPhysicalMaterial({color:new THREE.Color(roll.tone*0.5,roll.tone*0.5,roll.tone*0.51),metalness:0.45,roughness:0.78,envMapIntensity:0.8});
  var endWallL=new THREE.Mesh(endWallGeo,holeEnd);endWallL.rotation.z=-Math.PI/2;endWallL.position.x=TUBE0-0.02;endWallL.receiveShadow=true;group.add(endWallL);
  var boreGeo=new THREE.LatheGeometry([new THREE.Vector2(0.9,0),new THREE.Vector2(0.9,TUBE1-TUBE0)],96);
  (function(){var n=boreGeo.attributes.position.count,col=new Float32Array(n*3),half=n/2;
    for(var i=0;i<n;i++){var v=i<half?0.28:1.0;col[i*3]=v;col[i*3+1]=v;col[i*3+2]=v;}
    boreGeo.setAttribute('color',new THREE.BufferAttribute(col,3));})();
  var boreMat=new THREE.MeshPhysicalMaterial({color:new THREE.Color(roll.tone*0.62,roll.tone*0.62,roll.tone*0.63),metalness:0.45,roughness:0.82,envMapIntensity:0.7,side:THREE.BackSide,vertexColors:true});
  var bore=new THREE.Mesh(boreGeo,boreMat);bore.rotation.z=-Math.PI/2;bore.position.x=TUBE0;bore.receiveShadow=true;group.add(bore); /* the key light reaches in through the opening: the lit patch inside moves as the object turns */
  /* radial socket screws around each ring, at its mid-length; heads sit in the rim */
  var screwGeo=new THREE.CylinderGeometry(SR,SR,SL,24);
  var sockGeo=new THREE.CylinderGeometry(SR*0.55,SR*0.55,0.02,6);
  var rndA=(function(){var q=91;return function(){q=(q*1664525+1013904223)>>>0;return q/4294967296;};})();
  function screwRing(parent,x){
    var out=[];
    for(var i=0;i<NB;i++){
      var a=i/NB*Math.PI*2+Math.PI/NB;
      var g=new THREE.Group();g.position.x=x;g.rotation.x=a;            /* local +y points outward along the radius */
      var head=new THREE.Mesh(screwGeo,boltSteel);head.position.y=RF-SL/2+0.012;g.add(head);
      var sock=new THREE.Mesh(sockGeo,socketMat);sock.position.y=RF+0.012;sock.rotation.y=rndA()*Math.PI/3;g.add(sock);
      g.userData.a0=rndA()*Math.PI/3;
      parent.add(g);out.push(g);
    }
    return out;
  }
  screwRing(group,XL+CAPL+GAP+TR/2);
  var lidScrews=screwRing(group,TUBE1+TR/2);
  /* end caps: the left one for good, the right one is the lid */
  var capL=new THREE.Mesh(discGeo(CAPR,CAPL),capSteel);capL.rotation.z=-Math.PI/2;capL.position.x=XL;capL.castShadow=true;group.add(capL);
  var lid=new THREE.Group();group.add(lid);
  var capR=new THREE.Mesh(discGeo(CAPR,CAPL),capSteel);capR.rotation.z=-Math.PI/2;capR.castShadow=true;lid.add(capR);
  var plug=new THREE.Mesh(discGeo(0.895,TR+GAP),capSteel);plug.rotation.z=-Math.PI/2;plug.position.x=-(TR+GAP);lid.add(plug); /* the part inside the ring */
  /* the threaded holes the screws sat in, around the plug */
  var holeGeo=new THREE.CylinderGeometry(SR*0.8,SR*0.8,0.16,20);
  for(var hi=0;hi<NB;hi++){
    var ha=hi/NB*Math.PI*2+Math.PI/NB,hg=new THREE.Group();hg.position.x=-(TR+GAP)/2-GAP/2;hg.rotation.x=ha;
    var hole=new THREE.Mesh(holeGeo,socketMat);hole.position.y=0.895-0.06;hg.add(hole);lid.add(hg);
  }
  lid.position.x=LID_HOME;
  /* ── the radio screen: a small set-in display on the back of the tube, a Pip-Boy of sorts — dark
     glass in a metal bezel that shows only the title playing, in the theme's colour. dark when off ── */
  var screenCanvas=document.createElement('canvas');screenCanvas.width=1024;screenCanvas.height=448;
  var screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;screenTex.anisotropy=8;
  var screenMat=new THREE.MeshPhysicalMaterial({color:0x040405,metalness:0,roughness:0.2,clearcoat:1,clearcoatRoughness:0.06,emissive:new THREE.Color(1,1,1),emissiveMap:screenTex,emissiveIntensity:1.0,envMapIntensity:0.5});
  function setScreen(title){
    var g=screenCanvas.getContext('2d'),W2=screenCanvas.width,H2=screenCanvas.height,t=(title||'').replace(/\s+/g,' ').trim();
    g.fillStyle='#000';g.fillRect(0,0,W2,H2);
    if(t){
      var col=theme.key,size=150,lines=[t],pad=140;
      for(;;){
        g.font='400 '+size+'px '+FONT;
        if(g.measureText(t).width<=W2-pad){lines=[t];break;}
        var words=t.split(' '),best=null;
        for(var i=1;i<words.length;i++){var a=words.slice(0,i).join(' '),b=words.slice(i).join(' '),m=Math.max(g.measureText(a).width,g.measureText(b).width);if(!best||m<best.m)best={a:a,b:b,m:m};}
        if(best&&best.m<=W2-pad&&size*2.3<=H2-40){lines=[best.a,best.b];break;}
        size-=8;if(size<52){lines=best?[best.a,best.b]:[t];break;}
      }
      g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;g.shadowColor=col;g.shadowBlur=30;
      var lh=size*1.15,y0=H2/2-(lines.length-1)*lh/2;
      lines.forEach(function(l,i){g.fillText(l,W2/2,y0+i*lh);g.fillText(l,W2/2,y0+i*lh);});
      g.shadowBlur=0;g.fillStyle='rgba(0,0,0,0.2)';for(var y=0;y<H2;y+=4)g.fillRect(0,y,W2,2); /* the faint lines of a small screen */
    }
    screenTex.needsUpdate=true;needPaint();
  }
  var PW=1.0,PH=0.5,PR=0.06,PI=0.07; /* the bezel: outer size, corner radius, frame width */
  function roundRect(sh,x,y,w,h,r){sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);}
  var frameShape=new THREE.Shape();roundRect(frameShape,-PW/2,-PH/2,PW,PH,PR);
  var holePath=new THREE.Path();roundRect(holePath,-PW/2+PI,-PH/2+PI,PW-2*PI,PH-2*PI,PR*0.5);frameShape.holes.push(holePath);
  var frameGeo=new THREE.ExtrudeGeometry(frameShape,{depth:0.06,bevelEnabled:true,bevelThickness:0.012,bevelSize:0.012,bevelSegments:3,curveSegments:12});
  var bezelMat=sameMetal();mirrorSteel(bezelMat);
  var panel=new THREE.Group();
  var bezel=new THREE.Mesh(frameGeo,bezelMat);bezel.castShadow=true;panel.add(bezel);
  var screen=new THREE.Mesh(new THREE.PlaneGeometry(PW-2*PI+0.02,PH-2*PI+0.02),screenMat);screen.position.z=0.04;panel.add(screen);
  panel.position.set((TUBE0+TUBE1)/2,0,-(R-0.02));panel.rotation.y=Math.PI; /* on the back, its face outward, the glass just above the skin */
  group.add(panel);
  setScreen('');
  /* the table the object rests on — only its shadow is visible. floor, contact shadow and
     lights live on a stage that never turns, so turning the capsule moves the light on it */
  var stage=new THREE.Group();scene.add(stage);
  var floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({opacity:roll.shadow}));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,-RF-0.3,0);floor.receiveShadow=true;stage.add(floor);
  /* one shadow only: the key light's. no painted contact blob under the object */
  /* keyLight light travels with the object so its shadow always fits */
  var keyLight=new THREE.DirectionalLight(0xffffff,roll.key);
  keyLight.position.set(-3,9,6);keyLight.castShadow=true;
  keyLight.shadow.mapSize.set(1536,1536);keyLight.shadow.radius=4;keyLight.shadow.bias=-0.00015;keyLight.shadow.normalBias=0.02;
  keyLight.shadow.camera.left=-7;keyLight.shadow.camera.right=7;keyLight.shadow.camera.top=6;keyLight.shadow.camera.bottom=-6;keyLight.shadow.camera.near=1;keyLight.shadow.camera.far=40;
  var keyTarget=new THREE.Object3D();keyTarget.position.set(0,0,0);stage.add(keyTarget);keyLight.target=keyTarget;stage.add(keyLight);
  var fillLight=new THREE.DirectionalLight(0xffffff,0.35);fillLight.position.set(-6,2,8);stage.add(fillLight);
  /* the view: a three-quarter turn at rest, and the visitor may turn it any way by dragging */
  var YAW=THREE.MathUtils.degToRad(roll.yaw);
  var rot={yaw:-YAW+THREE.MathUtils.degToRad(roll.ry),pitch:THREE.MathUtils.degToRad(roll.rx),vy:0,vx:0};
  var qTmp=new THREE.Quaternion(),qY=new THREE.Quaternion(),qX=new THREE.Quaternion(),vC=new THREE.Vector3();
  function applyRot(){
    qY.setFromAxisAngle(new THREE.Vector3(0,1,0),rot.yaw);qX.setFromAxisAngle(new THREE.Vector3(1,0,0),rot.pitch);
    qTmp.copy(qX).multiply(qY);group.quaternion.copy(qTmp);
  }
  applyRot();

  /* ── the visitor in the steel ──────────────────────────────────────
     the front camera becomes the wall the capsule faces: mirrored, contrast
     up, brightness down, half monochrome, small; the environment is re-lit
     only when the picture actually changes, at most 12 times a second. */
  var cam={on:false,video:null,c:null,g:null,prev:null,tex:null,last:0};
  function startCamera(){
    if(!GL||cam.on||Q.get('cam')==='0'||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return;
    navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false}).then(function(stream){
      var v=document.createElement('video');v.srcObject=stream;v.muted=true;v.playsInline=true;
      v.play().catch(function(){});
      cam.video=v;cam.c=document.createElement('canvas');cam.c.width=256;cam.c.height=256;cam.g=cam.c.getContext('2d',{willReadFrequently:true});
      cam.c2=document.createElement('canvas');cam.c2.width=32;cam.c2.height=24;cam.g2=cam.c2.getContext('2d',{willReadFrequently:true});
      cam.tex2=new THREE.CanvasTexture(cam.c2);cam.tex2.colorSpace=THREE.SRGBColorSpace;cam.tex2.minFilter=THREE.LinearFilter;cam.tex2.magFilter=THREE.LinearFilter;cam.tex2.generateMipmaps=false;
      cam.tex=new THREE.CanvasTexture(cam.c);cam.tex.colorSpace=THREE.SRGBColorSpace;cam.tex.minFilter=THREE.LinearFilter;cam.tex.magFilter=THREE.LinearFilter;cam.tex.generateMipmaps=false;
      camPlane.material.map=cam.tex2;camPlane.material.needsUpdate=true;camPlane.visible=true; /* the room light only gets the tint: no structure can reach the env map */
      mirrorU.uCam.value=cam.tex;mirrorU.uCamAspect.value=4/3;mirrorU.uCamMix.value=roll.mirror;
      cam.on=true;requestAnimationFrame(camLoop);
      document.addEventListener('visibilitychange',function(){if(document.hidden)stream.getTracks().forEach(function(t){t.enabled=false;});else stream.getTracks().forEach(function(t){t.enabled=true;});});
    }).catch(function(){ /* no camera, or not allowed: the room stays as it is */ });
  }
  function softBlur(d,w,h,r){ /* separable box blur on rgba bytes, radius r */
    var tmp=new Uint8ClampedArray(d.length),k=2*r+1;
    for(var y=0;y<h;y++)for(var x=0;x<w;x++){var i=(y*w+x)*4,R=0,G=0,B=0;for(var o=-r;o<=r;o++){var xx=Math.min(w-1,Math.max(0,x+o)),j=(y*w+xx)*4;R+=d[j];G+=d[j+1];B+=d[j+2];}tmp[i]=R/k;tmp[i+1]=G/k;tmp[i+2]=B/k;tmp[i+3]=255;}
    for(var y2=0;y2<h;y2++)for(var x2=0;x2<w;x2++){var i2=(y2*w+x2)*4,R2=0,G2=0,B2=0;for(var o2=-r;o2<=r;o2++){var yy=Math.min(h-1,Math.max(0,y2+o2)),j2=(yy*w+x2)*4;R2+=tmp[j2];G2+=tmp[j2+1];B2+=tmp[j2+2];}d[i2]=R2/k;d[i2+1]=G2/k;d[i2+2]=B2/k;d[i2+3]=255;}
  }
  function camLoop(now){
    if(!cam.on)return;
    requestAnimationFrame(camLoop);
    /* nothing to see: the radio, the player, the about page or the phone column covers the steel */
    if(document.hidden||fieldMode==='radio'||pl.classList.contains('show')||document.getElementById('me-about-screen')||(isMobile()&&app.classList.contains('open')))return;
    if(now-cam.last<83||cam.video.readyState<2)return;
    cam.last=now;
    var g=cam.g,w=cam.c.width,h=cam.c.height;
    if(cam.video.videoWidth&&cam.video.videoHeight)mirrorU.uCamAspect.value=cam.video.videoWidth/cam.video.videoHeight;
    g.save();g.translate(w,0);g.scale(-1,1);g.drawImage(cam.video,0,0,w,h);g.restore();
    var im=g.getImageData(0,0,w,h),d=im.data;
    softBlur(d,w,h,2);g.putImageData(im,0,0);
    cam.g2.drawImage(cam.c,0,0,32,24);var im2=cam.g2.getImageData(0,0,32,24);softBlur(im2.data,32,24,2);cam.g2.putImageData(im2,0,0);cam.tex2.needsUpdate=true; /* two box passes ≈ a gaussian, no canvas filter needed */
    var diff=0,n=0;
    if(cam.prev){for(var i=0;i<d.length;i+=16){diff+=Math.abs(d[i]-cam.prev[i]);n++;}diff/=n;}else diff=999;
    cam.prev=d;
    cam.tex.needsUpdate=true;
    if(diff>=1.5)renderEnv();            /* the room is re-lit only when something moved */
    paint();
  }
  setTimeout(startCamera,900);

  /* ── placement: a screen box → world position and scale ─────────── */
  function screenToWorld(sx,sy){
    var v=new THREE.Vector3((sx/W)*2-1,-(sy/H)*2+1,0.5).unproject(camera);
    var dir=v.sub(camera.position).normalize();
    var t=-camera.position.z/dir.z;
    return camera.position.clone().add(dir.multiplyScalar(t));
  }
  function pxPerUnitAt(p){
    var a=p.clone().project(camera),b=p.clone().add(new THREE.Vector3(1,0,0)).project(camera);
    return Math.abs(b.x-a.x)*W/2;
  }
  var cap={state:'sealed',loosen:0,slide:0,move:0,hot:false};
  var MOB_SLIDE=44;
  function restBox(){
    if(isMobile()){var Lm=W-36-MOB_SLIDE;return {L:Lm,left:18,top:H*0.36};}
    var L=clamp(W*0.52,460,800);
    return {L:L,left:W/2-L/2,top:H*0.47-(L/LTOT*2*RF)/2};
  }
  function openBox(){
    var r=restBox(),top=Math.max(72,H*0.08),L=r.L;
    /* the column under the object must end above the bottom edge: a short screen
       (or a long catalogue) gets a smaller open object rather than a clipped index */
    var rowsH=(PROJECTS.length+1)*15*1.55+4;
    var over=top+L/LTOT*2*RF+24+15*1.55+40+rowsH+48-H;
    if(over>0)L=Math.max(320,L-over*LTOT/(2*RF));
    return {L:L,left:clamp(W*0.04,20,64),top:top};
  }
  function box(){
    var a=restBox(),b=openBox(),t=cap.move;
    return {L:lerp(a.L,b.L,t),left:lerp(a.left,b.left,t),top:lerp(a.top,b.top,t)};
  }
  var lastBox=null,lastPx=1;
  function place(){
    var b=box();
    var Hpx=b.L/LTOT*2*RF;
    var centre=screenToWorld(b.left+b.L/2,b.top+Hpx/2);
    var ppu=pxPerUnitAt(centre);
    var s=b.L/(LTOT*ppu);
    group.scale.setScalar(s);
    /* the object turns about its own centre: place the centre, then back off the rotated half-length */
    applyRot();
    vC.set((LTOT/2)*s,0,0).applyQuaternion(group.quaternion);
    group.position.set(centre.x-vC.x,centre.y-vC.y,-vC.z);
    /* tilted, the object stands on its lower end: the floor drops away so nothing sinks through it,
       */
    vC.set(1,0,0).applyQuaternion(group.quaternion);
    var ay=Math.abs(vC.y),ac=Math.sqrt(Math.max(0,1-ay*ay));
    var low=Math.max((LTOT/2-CAPL-GAP)*ay+RF*ac,(LTOT/2)*ay+CAPR*ac),drop=Math.max(0,low-RF);
    stage.position.set(centre.x,centre.y-drop*s,0);stage.scale.setScalar(s);
    lastBox={left:b.left,top:b.top,w:b.L,h:Hpx};lastPx=ppu*s; /* screen px per object unit */
    /* the unbolting: a mechanic's star order, each bolt seven turns out on its thread,
       rising with the pitch; once the last one is free the plate is pulled off and parked */
    var p1=clamp(cap.slide/0.72,0,1),p2=clamp((cap.slide-0.72)/0.28,0,1);
    var ORDER=[0,4,2,6,1,5,3,7];
    lidScrews.forEach(function(g,i){
      var j=ORDER.indexOf(i),st=j*0.105,du=0.26;
      var q=clamp((p1-st)/du,0,1);
      var e=q<0.5?2*q*q:1-Math.pow(-2*q+2,2)/2;           /* torque to break it, then it spins, then it slows */
      g.rotation.y=g.userData.a0+e*Math.PI*2*6;             /* six turns about its own axis */
      g.children.forEach(function(m,k){m.position.y=(k===0?RF-SL/2+0.012:RF+0.012)+e*SOUT;}); /* out of the ring along the radius */
    });
    var park=isMobile()?MOB_SLIDE/lastPx:(TP+0.1*LTOT);
    var pe=p2<0.5?2*p2*p2:1-Math.pow(-2*p2+2,2)/2;
    lid.position.x=LID_HOME+cap.loosen*4/lastPx+pe*park;
    placeStamp();
  }
  var stampFixed=null;
  function placeStamp(){
    if(!lastBox||!GL)return;
    var x=Math.round(lastBox.left),y=Math.round(lastBox.top+lastBox.h+24);
    /* opened, the date sits under the index and then stays put — turning the object never moves it (a resize resets it) */
    if(app.classList.contains('browse')&&listEl.offsetParent&&!stampFixed){var lr=listEl.getBoundingClientRect();stampFixed={x:Math.round(lr.left),y:Math.round(lr.bottom+24)};}
    if(stampFixed){x=stampFixed.x;y=stampFixed.y;}
    if(!(stampEl.classList.contains('kept')||app.classList.contains('open')||cap.state==='opening'))stampFixed=null;
    stampEl.style.transform='translate('+x+'px,'+y+'px)';
  }
  function hitCapsule(x,y){
    if(!lastBox||!GL)return false;
    var slop=canHover()?8:18;
    var extra=cap.slide*(isMobile()?MOB_SLIDE:(TP+0.1*LTOT)*lastPx);
    return x>=lastBox.left-slop&&x<=lastBox.left+lastBox.w+slop+extra&&y>=lastBox.top-slop&&y<=lastBox.top+lastBox.h+slop;
  }

  /* ── render on demand: nothing paints at rest ──────────────────── */
  var tweens={},painting=false;
  var VT=null; /* capture mode: window.__step(ms) advances this clock instead of the browser's */
  function nowMs(){return VT!=null?VT:performance.now();}
  function tween(key,to,ms,done){
    var from=cap[key],dist=Math.abs(to-from);
    if(dist<0.0005){cap[key]=to;if(done)done();return;}
    tweens[key]={to:to,from:from,t0:nowMs(),dur:Math.max(120,ms*dist),done:done};
    needPaint();
  }
  var vTimers=[];
  window.__capture=function(){VT=0;};
  window.__step=function(ms){
    VT+=ms;
    vTimers.slice().forEach(function(t){if(t.at<=VT){vTimers.splice(vTimers.indexOf(t),1);t.fn();}});
    stepTweens(VT);paint();
  };
  function stepTweens(now){
    var live=false;
    Object.keys(tweens).forEach(function(k){
      var tw=tweens[k];if(!tw)return;
      var p=Math.min(1,(now-tw.t0)/tw.dur);
      cap[k]=lerp(tw.from,tw.to,outQuint(p));
      if(p>=1){delete tweens[k];if(tw.done)tw.done();}else live=true;
    });
    return live;
  }
  function needPaint(){if(VT!=null)return;if(!painting){painting=true;requestAnimationFrame(frame);}}
  function frame(now){
    painting=false;
    var live=stepTweens(now);
    paint();
    if(live)needPaint();
  }
  function paint(){place();if(GL)renderer.render(scene,camera);}

  /* ── words ────────────────────────────────────────────────────── */
  var MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
  function stampText(d){return 'opened '+d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();}
  function buildPlate(){
    var years=PROJECTS.map(function(p){return +p.year;}).filter(Boolean);
    var y0=Math.min.apply(null,years),y1=Math.max.apply(null,years),n=PROJECTS.length;
    plateLines[1]=n+' film'+(n===1?'':'s')+', '+y0+'–'+y1;
    drawTube();tubeRoughTex.needsUpdate=true;tubeNormalTex.needsUpdate=true;needPaint();
  }

  /* ── open / seal ──────────────────────────────────────────────── */
  var timers=[],openedOnce=false;
  function later(fn,ms){if(VT!=null){vTimers.push({at:VT+ms,fn:fn});return;}timers.push(setTimeout(fn,ms));}
  function clearTimers(){timers.forEach(clearTimeout);timers=[];vTimers=[];}
  function dealRows(){app.classList.add('browse');app.classList.remove('dealt');void listEl.offsetWidth;app.classList.add('dealt');}
  function openCapsule(instant){ /* instant: no choreography (no webgl, or a layout change while open) */
    if(cap.state==='open'||cap.state==='opening')return;
    cap.state='opening';clearTimers();
    /* a seal interrupted inside its first 120ms must not leave the rows hidden: finish its cleanup now */
    app.classList.remove('open','browse','dealt','sealing');
    cvs.setAttribute('aria-label','time capsule — open');
    setTc('');
    cap.hot=false;cvs.classList.remove('hot'); /* the object moves out from under the pointer — the next move re-reads it */
    /* the finder's line: written once per visit, then kept */
    if(!stampEl.textContent)stampEl.textContent=stampText(new Date());
    if(!GL||instant){ /* nothing to unbolt: the index simply stands */
      cap.slide=1;cap.move=0;cap.loosen=0;
      if(isMobile())buildColumn();
      app.classList.add('open');stampEl.classList.add('kept');dealRows();cap.state='open';
      paint();
      try{probeRatios();sizePreview();setPreview(null);}catch(e){}
      return;
    }
    if(isMobile()){
      tween('loosen',0,120);
      tween('slide',1,1700);
      later(function(){
        buildColumn();
        app.classList.add('open');stampEl.classList.add('kept');
        dealRows();
        cap.state='open';
      },1700);
      return;
    }
    var k=openedOnce?0.45:1;
    tween('loosen',0,120);
    tween('slide',1,1700*k);                                  /* eight bolts out, then the plate off */
    /* the open object stays where it is: the index lays over it */
    later(function(){app.classList.add('open');stampEl.classList.add('kept');},1640*k);
    later(function(){
      dealRows();
      try{probeRatios();sizePreview();setPreview(null);}catch(e){}
    },1700*k);
    /* only a completed first open unlocks the quick re-open; a pointer already parked on
       the object's destination gets its word now */
    later(function(){cap.state='open';openedOnce=true;if(cap.hot)setTc('close');paint();},2200*k);
  }
  function sealCapsule(){
    if(cap.state==='sealed'||cap.state==='sealing')return;
    cap.state='sealing';clearTimers();
    cvs.setAttribute('aria-label','time capsule — sealed. press enter to open');
    setTc('');
    cap.hot=false;cvs.classList.remove('hot');
    scrambleStop();
    if(!GL){
      app.classList.remove('open','browse','dealt');
      if(browseEl.parentNode!==app){app.insertBefore(browseEl,stampEl);colEl.innerHTML='';}
      cap.slide=0;cap.move=0;cap.state='sealed';setPreview(null);return;
    }
    if(isMobile()){
      app.classList.remove('open');
      later(function(){
        app.classList.remove('browse','dealt');
        app.insertBefore(browseEl,stampEl);
        colEl.innerHTML='';
        tween('slide',0,260);
        cap.state='sealed';
      },120);
      return;
    }
    app.classList.add('sealing');
    setPreview(null);
    /* the rows fade where they stand (open stays until they are gone), then the layer goes;
       a layout change may have left the index in the phone column — bring it home */
    later(function(){
      app.classList.remove('open','browse','dealt','sealing');
      if(browseEl.parentNode!==app){app.insertBefore(browseEl,stampEl);colEl.innerHTML='';}
    },120);
    tween('move',0,320);
    later(function(){tween('slide',0,700);},60);
    later(function(){cap.state='sealed';if(cap.hot){cap.loosen=1;setTc('open');}paint();},800);
  }
  function sealNow(){
    /* the radio needs the paper clear at once: no choreography, just closed */
    clearTimers();tweens={};
    cap.slide=0;cap.move=0;cap.loosen=0;cap.state='sealed';
    setHot(false);setTc('');
    scrambleStop();
    app.classList.remove('open','browse','dealt','sealing');
    if(browseEl.parentNode!==app){app.insertBefore(browseEl,stampEl);colEl.innerHTML='';}
    cvs.setAttribute('aria-label','time capsule — sealed. press enter to open');
    setPreview(null);
    paint();
  }
  function toggleCapsule(){if(cap.state==='open'||cap.state==='opening')sealCapsule();else openCapsule();}

  /* mobile column: a snapshot of the opened object scrolls with the list */
  function buildColumn(){
    colEl.innerHTML='';
    if(GL){
    place();renderer.render(scene,camera);
    var url=renderer.domElement.toDataURL('image/png');
    var shot=document.createElement('div');shot.className='shot';
    var b=lastBox,pad=14;
    shot.style.height=Math.round(b.h+pad*2)+'px';
    var img=document.createElement('img');img.src=url;img.alt='';
    img.style.width=W+'px';img.style.height=H+'px';img.style.top=Math.round(-(b.top-pad))+'px';
    shot.appendChild(img);colEl.appendChild(shot);
    }
    var p=document.createElement('div');p.className='plate';p.textContent=stampEl.textContent;
    colEl.appendChild(p);
    colEl.appendChild(browseEl);
  }

  /* ── input ────────────────────────────────────────────────────── */
  function setTc(t){tcEl.textContent=t;}
  function setHot(h){
    if(cap.hot===h)return;cap.hot=h;cvs.classList.toggle('hot',h);
    if(cap.state==='sealed'){
      if(h){cap.loosen=1;setTc('open');}else{tween('loosen',0,160);setTc('');}
    }else if(cap.state==='open'){setTc(h?'close':'');}
    needPaint();
  }
  /* drag turns the capsule (with a little momentum); a click that did not move opens or seals it */
  var drag=null;
  function spinLoop(){
    if(drag||(Math.abs(rot.vy)<0.0004&&Math.abs(rot.vx)<0.0004)){rot.vy=rot.vx=0;return;}
    rot.yaw+=rot.vy;rot.pitch=clamp(rot.pitch+rot.vx,-1.1,1.1);rot.vy*=0.93;rot.vx*=0.93;
    paint();requestAnimationFrame(spinLoop);
  }
  function dragStart(e,el){
    if(e.button!==undefined&&e.button!==0)return;
    if(!hitCapsule(e.clientX,e.clientY))return;
    drag={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:false,id:e.pointerId,el:el};
    rot.vy=rot.vx=0;
    try{el.setPointerCapture(e.pointerId);}catch(err){}
  }
  function dragMove(e){
    if(!drag||e.pointerId!==drag.id)return;
    var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>6){drag.moved=true;cvs.classList.add('turning');}
    if(!drag.moved)return;
    rot.vy=dx*0.006;rot.vx=dy*0.006;
    rot.yaw+=rot.vy;rot.pitch=clamp(rot.pitch+rot.vx,-1.1,1.1);
    paint();
  }
  function dragEnd(e){
    if(!drag||e.pointerId!==drag.id)return;
    var d=drag;drag=null;cvs.classList.remove('turning');
    try{d.el.releasePointerCapture(e.pointerId);}catch(err){}
    if(d.moved){requestAnimationFrame(spinLoop);return;}
    if(e.detail>1)return;
    toggleCapsule();
  }
  cvs.addEventListener('pointermove',function(e){if(drag){dragMove(e);return;}if(!canHover())return;setHot(hitCapsule(e.clientX,e.clientY));});
  cvs.addEventListener('pointerleave',function(){if(!drag)setHot(false);});
  cvs.addEventListener('pointerdown',function(e){dragStart(e,cvs);});
  cvs.addEventListener('pointerup',dragEnd);
  cvs.addEventListener('pointercancel',function(){drag=null;cvs.classList.remove('turning');});
  cvs.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCapsule();}});

  /* ── size ─────────────────────────────────────────────────────── */
  var mobileNow=isMobile();
  function sizeField(){
    W=innerWidth;H=innerHeight;
    if(GL)renderer.setSize(W,H,false);
    mirrorU.uRes.value.set(W*DPR,H*DPR);
    camera.aspect=W/H;camera.updateProjectionMatrix();
    /* crossing the phone breakpoint while open (a rotation): the two layouts keep the
       index in different places — close at once and stand it up again in the new one */
    var m=isMobile();
    if(m!==mobileNow){
      mobileNow=m;
      if(cap.state!=='sealed'){var reopen=cap.state==='open'||cap.state==='opening';sealNow();if(reopen)openCapsule(true);}
    }
    paint();
    if(app.classList.contains('browse'))sizePreview();
  }
  addEventListener('resize',function(){stampFixed=null;sizeField();});
  /* preview iframes settle late — re-measure once after load */
  setTimeout(function(){if(innerWidth!==W||innerHeight!==H)sizeField();},400);

  // ── view toggle + radio ─────────────────────────────────────────
  /* view navigation lives in the radio section (needs the player helpers) */

  /* radio — plays a YouTube playlist; current track title bottom-left */
  var radioBtn=app.querySelector('#me-radio');
  var musicEl=app.querySelector('#me-music');
  var brandEl=app.querySelector('#me-brand');
  function updateBrand(){
    /* the mark always reads time capsule — cinema and radio sit top right on every view */
    brandEl.textContent='time capsule';
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
    try{setScreen(radioPlaying?t:'');}catch(e){} /* the screen on the back follows the dial */
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
    try{var d=ytPlayer.getVideoData();setTitle(titleFor(currentVid())||cleanTitle((d&&d.title)?d.title:''));}catch(e){}
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
    .then(function(j){RADIO_META=(j&&j.tracks)||{};
      /* radio.json IS the station list — the playlist only stands in when it
         is empty or unreachable. tuning is a single-video load either way */
      var rids=Object.keys(RADIO_META);if(rids.length)SONG_IDS=rids;
      buildBand();})
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
  function titleFor(id){var m=RADIO_META[id];return (m&&typeof m.title==='string'&&m.title)?m.title:'';} /* a set title wins over youtube's, verbatim */
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
      bTitle.textContent=titleFor(st.id)||cleanTitle(tt);
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
    try{setScreen('');}catch(e){} /* the screen goes dark */
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
  /* three views, two buttons: cinema opens the capsule (open ≙ browse), radio
     opens its view; clicking the view you are already on returns to the
     sealed capsule. music is untouched by navigation — only stop or opening
     a film ends it. */
  function currentView(){
    return (app.classList.contains('browse')||cap.state==='open'||cap.state==='opening')?'film'
      :(fieldMode==='radio'?'radio':'dial');
  }
  function goDial(){
    /* leaving the radio: the sealed capsule is already on the paper */
    exitBandAudio();
    scrambleStop();
    app.classList.remove('browse');
    fieldMode='dial';
    tcEl.textContent='';
    radioBtn.setAttribute('aria-pressed','false');
    updateModeClass();updateBrand();
    needPaint();
  }
  function goFilm(){
    /* cinema: leave the radio if it is up, then open the capsule */
    exitBandAudio();
    fieldMode='dial';
    radioBtn.setAttribute('aria-pressed','false');
    updateModeClass();updateBrand();
    openCapsule();
  }
  function goRadio(){
    sealNow(); /* the band needs the paper clear at once — no choreography */
    fieldMode='radio';
    armRadio();
    if(ytReady)startPlayback();
    radioBtn.setAttribute('aria-pressed','true');
    updateModeClass();
    paintDial();tuneAudio();
    updateBrand();
  }
  app.querySelector('#me-btnview').addEventListener('click', function(e){
    if(e.detail>1)return; /* a double-click is one gesture */
    if(cap.state==='open'||cap.state==='opening')sealCapsule();else goFilm();
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
  brandEl.addEventListener('click', function(){ /* the mark always leads home */
    if(fieldMode==='radio')goDial();
    else if(cap.state!=='sealed')sealCapsule();
  });

  // ── data + render list ──────────────────────────────────────────
  fetch(DATA_URL,{cache:"no-cache"}).then(function(r){return r.json();}).then(function(d){
    PROJECTS=(d.projects||[]).filter(function(p){return p.published!==false;});
    /* speedramp delays: d(i)=150(1-0.8^i) — accelerating pour, caps ~150ms */
    function rampD(i){return Math.round(150*(1-Math.pow(0.8,i)))+'ms';}
    var html='<div class="me-row head" style="--d:0ms"><span>Year</span><span>№</span><span>Client</span><span>Title</span><span>Category</span></div>';
    PROJECTS.forEach(function(p,i){
      var no=p.num||String(i+1).padStart(3,'0');
      html+='<div class="me-row" data-i="'+i+'" style="--d:'+rampD(i+1)+'">'+
        '<span data-field="year" data-value="'+esc(p.year)+'">'+esc(p.year)+'</span>'+
        '<span>'+no+'</span>'+
        '<span data-field="client" data-value="'+esc(p.client)+'">'+esc(p.client)+'</span>'+
        '<span>'+esc(p.title)+'</span>'+
        '<span data-field="type" data-value="'+esc(p.type||'')+'">'+esc(p.type||'')+'</span>'+
      '</div>';
    });
    listEl.innerHTML=html;

    /* the plate now knows what it holds (formats are probed on entering the cinema, as on the live site) */
    buildPlate();
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
     nothing hovered: nothing there */
  var prevEl=document.createElement('div');prevEl.id='me-prev';
  var prevVid=document.createElement('video');
  prevVid.muted=true;prevVid.loop=true;prevVid.playsInline=true;prevVid.autoplay=true;
  var prevImg=document.createElement('img'); /* .gif previews (hub-staged) */
  prevImg.alt='';
  prevEl.appendChild(prevVid);prevEl.appendChild(prevImg);
  browseEl.appendChild(prevEl);
  /* the side-by-side list+panel pair only exists on wide screens */
  function canPreview(){return matchMedia('(min-width:1050px)').matches;}
  var vidRatio=0; /* height/width of the loaded preview; 0 until metadata lands */
  function sizePreview(){
    /* the panel takes whatever room the content-sized list leaves, in the
       film's own format — never cropped to 16:9 */
    if(!canPreview()||!app.classList.contains('browse'))return;
    var margin=Math.min(Math.max(innerWidth*0.04,20),64);
    var lr=listEl.getBoundingClientRect().right;
    var w=Math.max(220,Math.min(innerWidth-lr-margin*2,innerWidth*0.42));
    var r=vidRatio||9/16;
    var h=w*r,maxH=innerHeight*0.72;
    /* under the open capsule the panel starts at the list head and must
       end above the bottom edge — the same cap the list works under */
    if(h>maxH){h=maxH;w=h/r;}
    prevEl.style.width=w+'px';prevEl.style.height=h+'px';
  }
  function hidePreview(){
    prevEl.classList.remove('on');
    try{prevVid.pause();}catch(e){}
  }
  /* a dead preview url needs no handler: the panel is invisible until a first
     frame is decoded (.ready), so a failing film simply never appears */
  var swapTimer=null;
  prevVid.addEventListener('loadeddata',function(){
    /* first frame decoded: panel may appear, crossfade veil lifts */
    clearTimeout(swapTimer);
    prevEl.classList.add('ready');
    prevEl.classList.remove('swapping');
  });
  prevImg.addEventListener('load',function(){
    clearTimeout(swapTimer);
    prevEl.classList.add('ready');
    prevEl.classList.remove('swapping');
    if(prevImg.naturalWidth){
      vidRatio=prevImg.naturalHeight/prevImg.naturalWidth;
      if(prevEl.dataset.cur)RATIOS[prevEl.dataset.cur]=vidRatio;
      sizePreview();
    }
  });
  prevVid.addEventListener('loadedmetadata',function(){
    /* each film reshapes the panel to its own format */
    if(prevVid.videoWidth){
      vidRatio=prevVid.videoHeight/prevVid.videoWidth;
      if(prevEl.dataset.cur)RATIOS[prevEl.dataset.cur]=vidRatio;
    }
    sizePreview();
  });
  /* formats are probed once (metadata only) so the panel takes the right
     shape immediately instead of flashing the previous film's */
  var RATIOS={};
  function probeRatios(){
    if(probeRatios.done||!PROJECTS.length)return;
    probeRatios.done=true;
    PROJECTS.forEach(function(p){
      if(!p.preview)return;
      if(/\.gif(\?|$)/i.test(p.preview)){
        var im=new Image();
        im.onload=function(){if(im.naturalWidth)RATIOS[p.preview]=im.naturalHeight/im.naturalWidth;};
        im.src=p.preview;
        return;
      }
      var v=document.createElement('video');
      v.preload='metadata';v.muted=true;
      v.onloadedmetadata=function(){
        if(v.videoWidth)RATIOS[p.preview]=v.videoHeight/v.videoWidth;
        v.removeAttribute('src');
      };
      v.src=p.preview;
    });
  }
  function setPreview(row){
    if(!canPreview()){
      prevEl.classList.remove('on');
      try{prevVid.pause();}catch(e){}
      return;
    }
    var url=null;
    if(row){var p=PROJECTS[+row.dataset.i];url=(p&&p.preview)||null;}
    if(!url){
      /* no film under the cursor (or none hovered at all): nothing there */
      hidePreview();
      return;
    }
    vidRatio=RATIOS[url]||vidRatio; /* known format applies instantly */
    sizePreview();
    var gif=/\.gif(\?|$)/i.test(url);
    prevEl.classList.toggle('gif',gif);
    if(prevEl.dataset.cur!==url){
      /* film swap crossfades under a light blur; the panel hides entirely
         until the incoming film's first frame is decoded — never a black box */
      prevEl.dataset.cur=url;
      prevEl.classList.add('swapping');
      prevEl.classList.remove('ready');
      if(gif){prevImg.src=url;try{prevVid.pause();}catch(e){}}
      else prevVid.src=url;
      clearTimeout(swapTimer);
      swapTimer=setTimeout(function(){prevEl.classList.remove('swapping');},600);
    }
    prevEl.classList.add('on');
    if(!gif){try{var pr=prevVid.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){}}
  }
  /* ── scramble hover: a quarter of the hovered row's letters flicker
     through random glyphs in the six clock colours. desktop pointers only —
     and only some letters, so the words stay readable ── */
  var SCRAM_KEYS=THEMES.map(function(t){return t.key;});
  var SCRAM_CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>[]{}()#@$%&*+=?!/\\^~;:_';
  var scramRow=null;
  function canScramble(){return matchMedia('(hover: hover) and (pointer: fine)').matches&&!isMobile();}
  function lockColumns(){
    /* pin the grid tracks at their resolved pixel widths for the duration —
       the max-content grid can then never re-measure and shift a column */
    if(!listEl.dataset.lock){
      listEl.dataset.lock='1';
      var t=getComputedStyle(listEl).gridTemplateColumns;
      if(t&&t!=='none')listEl.style.gridTemplateColumns=t;
    }
  }
  function unlockColumns(){
    if(listEl.dataset.lock){
      delete listEl.dataset.lock;
      listEl.style.removeProperty('grid-template-columns');
    }
  }
  function scrambleStop(){
    if(scramRow){
      scramRow.querySelectorAll(':scope > span').forEach(function(s){
        if(s.dataset.orig!==undefined){
          s.textContent=s.dataset.orig;delete s.dataset.orig;
          s.style.removeProperty('overflow');s.style.removeProperty('text-overflow');
        }
      });
      scramRow=null;
    }
    unlockColumns();
  }
  function scrambleStart(row){
    /* ONE swap per entry, no loop: the picked letters flip to a random glyph
       in a random clock colour and simply hold; the line restores on leave.
       every entry rolls fresh letters, glyphs and colours */
    if(!canScramble()||row===scramRow)return;
    scrambleStop();
    scramRow=row;
    lockColumns();
    /* the hovered row already wears the deal colour — a glyph in that same
       colour would vanish into the line, so it never gets picked */
    var pool=SCRAM_KEYS.filter(function(k){return k!==theme.key;});
    row.querySelectorAll(':scope > span').forEach(function(s){
      var txt=s.textContent;
      s.dataset.orig=txt;
      /* a wider glyph may overflow the pinned cell — never an ellipsis, it
         just spills into the column gap for the hover */
      s.style.overflow='visible';s.style.textOverflow='clip';
      /* every word gets 1 or 2 changed letters — never none, never a flood */
      var marks={},re=/\S+/g,m;
      while((m=re.exec(txt))){
        var w=m[0],n=Math.min(w.length,1+((w.length>=4&&Math.random()<0.5)?1:0)),seen={};
        while(n>0){var p=Math.floor(Math.random()*w.length);if(seen[p])continue;seen[p]=1;marks[m.index+p]=1;n--;}
      }
      var html='',any=false;
      for(var i=0;i<txt.length;i++){
        var ch=txt.charAt(i);
        if(marks[i]){
          any=true;
          var g=SCRAM_CHARS.charAt(Math.floor(Math.random()*SCRAM_CHARS.length));
          var col=pool[Math.floor(Math.random()*pool.length)];
          /* plain inline span — anything block-ish rides off the baseline.
             font:inherit inline, so no host stylesheet (cargo has global
             span rules) can hand the glyph a foreign face */
          html+='<span style="color:'+col+';font:inherit">'+esc(g)+'</span>';
        }else html+=esc(ch);
      }
      if(any)s.innerHTML=html;
    });
  }
  // desktop: hover a Year/Client/Category cell -> highlight every row sharing that value.
  // hover anywhere else on a row -> dim the rest.
  /* driven by mousemove, not mouseover: mouseover fires once at the edge —
     inside the seam dead-zone — and then never again while the cursor moves
     within the same cell, which froze the hover on one row */
  var hotRow=null,hotCell;
  listEl.addEventListener('mousemove', function(e){
    if(isMobile()) return;
    var row=e.target.closest('.me-row');
    if(!row||row.classList.contains('head')){
      if(hotRow){ applyDim(null); setPreview(null); scrambleStop(); hotRow=null; hotCell=undefined; }
      return;
    }
    var cell=e.target.closest('[data-field]');
    if(row!==hotRow){
      /* no blinking on the seam: leaving one row for another needs the
         cursor clearly inside the new one (4px past its edge) */
      if(hotRow){
        var rb=row.querySelector('span').getBoundingClientRect();
        if(e.clientY<rb.top+4||e.clientY>rb.bottom-4)return;
      }
      hotRow=row;hotCell=undefined;
    }
    if(cell===hotCell)return; /* nothing changed — mousemove is chatty */
    hotCell=cell;
    if(cell){ applyDim(null,cell.dataset.field,cell.dataset.value); }
    else { applyDim(row); }
    setPreview(row);
    scrambleStart(row);
  });
  listEl.addEventListener('mouseleave', function(){ applyDim(null); setPreview(null); scrambleStop(); hotRow=null; hotCell=undefined; });

  // click -> opens the film
  listEl.addEventListener('click', function(e){
    var row=e.target.closest('.me-row'); if(!row||row.classList.contains('head')) return;
    scrambleStop(); /* the row must read clean behind the player */
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
    /* exit faster than enter: 140ms out via .closing, then gone */
    function closeAbout(){
      ov.classList.add('closing');
      setTimeout(function(){ov.remove();},150);
    }
    ov.querySelector('#me-about-close').addEventListener('click', closeAbout);
    ov.querySelector('.ab-brand').addEventListener('click', closeAbout);
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
  document.addEventListener('keydown', function(e){
    if(e.key!=='Escape')return;
    /* the nearest layer answers: the player closes (as on the live site); the about page
       swallows it (escape never closed about there, and it must not seal the capsule underneath);
       the radio ignores it; otherwise the capsule seals — even mid-unbolting */
    var about=document.getElementById('me-about-screen');
    if(pl.classList.contains('show'))closePlayer();
    else if(about)return;
    else if(fieldMode==='radio')return;
    else if(cap.state==='open'||cap.state==='opening')sealCapsule();
  });

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
