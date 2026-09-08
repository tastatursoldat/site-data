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
  /* the page must never show its own content: a sheet of paper is laid over it the moment this
     file runs, and taken away when the capsule is on screen. it also lifts itself after 3s, so a
     failure can never leave a blank page */
  (function(){try{
    ['me-veil','me-veil2'].forEach(function(id){var e=document.getElementById(id);if(e&&e.parentNode)e.parentNode.removeChild(e);});
    var g=document.createElement('div');g.id='me-ground';
    g.setAttribute('style','position:fixed;inset:0;background:#EFEFEC;z-index:2147483600;');
    (document.body||document.documentElement).appendChild(g);
    setTimeout(function(){var e=document.getElementById('me-ground');if(e&&e.parentNode)e.parentNode.removeChild(e);},3000);
  }catch(e){}})();
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
  /* the note behind the mark: what a capsule is, and why a film is one too */
  var SERIF='"Times New Roman",Times,serif';
  var NOTE_TEXT =
    "I will never meet you.\n\n"+
    "You were born after I stopped.\n"+
    "That is the only thing I know about you.\n"+
    "You might be a person.\n"+
    "You might not even be from here.\n\n"+
    "Once we sent a gold record into the dark:\n"+
    "greetings, a whale, thunder, a kiss, a heartbeat.\n"+
    "Our best behaviour, our best angle.\n\n"+
    "This is the rest of the picture. Not worse. Truer.\n\n"+
    "Rain on concrete, a wet neck, a white curtain,\n"+
    "a fan in an empty room, a hand under a sheet,\n"+
    "a concrete corridor lit green, nobody in it,\n"+
    "and the stars, on a summer night,\n"+
    "the same ones you have.\n\n"+
    "I picked up a camera for one reason:\n"+
    "to see the world, and to get some of us down\n"+
    "before we became something else.\n\n"+
    "So it goes in a steel tube,\n"+
    "planted under plastic trees,\n"+
    "which is where we keep nature now.\n\n"+
    "I am not trying to be remembered.\n"+
    "I am trying to keep going a little longer.\n\n"+
    "Open when found.";
  var FONT='"Helvetica Neue",Helvetica,Arial,sans-serif';
  /* the little screen gets a dot-matrix face of its own — the letters are made of the same round
     pixels the thing would actually have. Everything else on the site stays in helvetica. */
  var FONT_LCD='"Doto","Helvetica Neue",Helvetica,Arial,sans-serif';
  var lcdFont=document.createElement('link');lcdFont.rel='stylesheet';
  lcdFont.href='https://fonts.googleapis.com/css2?family=Doto:ROND,wght@100,800&display=swap';
  /* the roundness axis is pinned at the sheet, not here: a canvas font string is the old css
     shorthand and has no way to say font-variation-settings, so what it is handed has to arrive
     as one fixed instance — round dots, bold. */
  document.head.appendChild(lcdFont);

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var st=document.createElement('style');
  st.textContent =
    'html,body{overflow:hidden !important;height:100% !important;}'+
    '#me-app{position:fixed;inset:0;background:#EFEFEC;z-index:2147483000;overflow:hidden;font-family:'+FONT+';color:#111;'+
      '-webkit-font-smoothing:antialiased;}'+
    // capsule landing — the object stays on the paper under the open index
    '#me-dial{position:absolute;inset:0;}'+
    '#me-field{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:default;outline:none;}'+
    '#me-field{transition:opacity 480ms ease;}#me-app.open #me-field{opacity:0.25;}'+ /* opened, the object steps back so the index reads through it */
    '#me-field.hot{cursor:pointer;}'+
    '#me-field{touch-action:none;}#me-field.turning{cursor:grabbing;}'+
    /* the finder's line, written on the paper under the object */
    '#me-stamp{position:fixed;left:0;top:0;z-index:5;font:700 15px/1.55 '+FONT+';color:#0a0a0a;pointer-events:none;'+
      'font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0;will-change:transform;transition:opacity 100ms ease;}'+
    '#me-app.open #me-stamp,#me-stamp.kept{opacity:1;transition:opacity 180ms cubic-bezier(0.23,1,0.32,1) 200ms;}'+
    /* the radio needs the paper: object and stamp leave it entirely */
    '#me-app.radio-mode #me-dial,#me-app.radio-mode #me-stamp{display:none;}'+
    '#me-app.nogl #me-dial,#me-app.nogl #me-stamp{display:none;}'+
    '#me-brand{position:fixed;top:18px;left:19px;z-index:10;font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;}'+
    '#me-ctrl{position:fixed;top:18px;right:19px;z-index:10;display:flex;gap:18px;align-items:center;}'+
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
    '#me-corner{position:fixed;right:19px;bottom:17px;z-index:10;display:flex;gap:13px;align-items:center;}'+
    '#me-corner #me-stop{display:flex;opacity:0;transform:translateY(6px);pointer-events:none;'+
      'transition:opacity 120ms ease,transform 120ms cubic-bezier(0.23,1,0.32,1);}'+
    '#me-app.radio-on #me-stop{opacity:1;transform:none;pointer-events:auto;'+
      'transition:opacity 180ms cubic-bezier(0.23,1,0.32,1),transform 180ms cubic-bezier(0.23,1,0.32,1);}'+
    '#me-music{font:800 15px/1.55 '+FONT_LCD+';color:var(--me-theme-laid);cursor:pointer;'+
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
    '#me-tc{position:fixed;left:19px;bottom:17px;z-index:10;font:700 15px/1.55 '+FONT+';'+
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
    '#me-band .g-unit{position:absolute;left:19px;font-size:10px;color:#bdbdbd;letter-spacing:1px;}'+
    '#me-band .station{position:absolute;top:88px;height:26px;width:2px;transform:translateX(-50%);}'+
    '#me-band .station i{position:absolute;left:0;top:0;width:2px;height:26px;background:#c2c2be;'+
      'transition:background .25s ease;}'+
    /* the needle never moves — it lives on the glass, not the scale */
    '#me-band .needle{position:absolute;left:50%;top:60px;width:2px;height:96px;background:#0a0a0a;'+
      'pointer-events:none;transform:translateX(-50%);}'+
    /* the station's title and its note are the radio's own words, so they read in the radio's own
       face — the dot matrix from the panel, in the theme's colour. The dial's furniture around
       them stays in helvetica: it is a scale, not a voice. */
    '#me-band .b-note{position:absolute;top:14px;left:50%;transform:translateX(-50%);font:800 16px/1.7 '+FONT_LCD+';'+
      'color:var(--me-theme-laid);text-transform:lowercase;width:84%;max-width:640px;text-align:center;'+
      'opacity:0;transition:opacity .35s ease;}'+
    '#me-band .b-title{position:absolute;top:170px;left:50%;transform:translateX(-50%);font:800 16px/1.7 '+FONT_LCD+';'+
      'color:var(--me-theme-laid);white-space:nowrap;opacity:0;transition:opacity .35s ease;}'+
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
    '#me-about-screen{cursor:pointer;position:fixed;inset:0;background:rgba(239,239,236,0.78);z-index:2147483700;'+
      'padding:max(76px,env(safe-area-inset-top)) 7vw 44px;box-sizing:border-box;overflow-y:auto;display:flex;'+
      'opacity:1;'+
      'transition:opacity 200ms ease,transform 200ms cubic-bezier(0.23,1,0.32,1);}'+
    '@starting-style{#me-about-screen{opacity:0;}}'+
    '#me-about-screen.closing{opacity:0;'+
      'transition:opacity 140ms ease,transform 140ms cubic-bezier(0.23,1,0.32,1);}'+
    /* close sits exactly where the words sit, in exactly their voice */
    '#me-about-close{position:fixed;top:18px;right:19px;'+
      'background:none;border:0;padding:0;font:700 15px/1.55 '+FONT+';cursor:pointer;color:#0a0a0a;}'+
    /* the about page speaks in the note's voice: the same serif, the same weight */
    /* the note and the about page read in the screen's own face and its colour: the dot matrix
       from the panel on the back, at a size the dots can actually resolve at. */
    '#me-about-screen .txt{margin:auto;max-width:32em;font:800 18px/1.85 '+FONT_LCD+';color:var(--me-theme-laid);mix-blend-mode:multiply;'+
      'white-space:pre-line;}'+   /* nothing after this may set colour again: it was doing exactly that */
    '#me-about-screen .txt a{color:var(--me-theme-laid);text-decoration:none;}'+
    '#me-about-screen .ab-brand{position:fixed;top:18px;left:19px;font:700 15px/1.55 '+FONT+';color:#0a0a0a;cursor:pointer;}'+
    /* the note: the mark opens it, a click anywhere puts it away. its own face — a serif,
       set large and narrow, the way a poem is set on paper */
    /* the note lies over the page: everything behind it drops to a quarter, nothing is replaced */
    '#me-note{position:fixed;inset:0;background:rgba(239,239,236,0.78);z-index:2147483700;display:flex;overflow:auto;-webkit-overflow-scrolling:touch;'+
      'padding:6vh 7vw;box-sizing:border-box;cursor:pointer;transition:opacity 240ms ease;}'+
    '#me-app.noting #me-field,#me-app.noting #me-browse,#me-app.noting #me-stamp,'+
      '#me-app.noting #me-ctrl,#me-app.noting #me-corner,#me-app.noting #me-col{opacity:0.35;}'+
    '#me-field,#me-browse,#me-stamp,#me-ctrl,#me-corner,#me-col{transition:opacity 240ms ease;}'+
    '@starting-style{#me-note{opacity:0;}}'+
    '#me-note.closing{opacity:0;transition:opacity 140ms ease;}'+
    /* the exact colour, laid over the page rather than painted on it: multiplied into the paper, so
       what darkens it is the page underneath and not a second colour. The lines multiply once for
       themselves and once inside the block, which is the same colour twice over. */
    '#me-note .n{margin:auto;max-width:32em;font:800 18px/1.85 '+FONT_LCD+';color:var(--me-theme-laid);mix-blend-mode:multiply;}'+
    '#me-note .n p{mix-blend-mode:multiply;}'+
    '#me-note .n p{margin:0 0 1.05em;white-space:pre-line;}'+
    '#me-note .n p:last-child{margin-bottom:0;}'+
    '#me-note .nb{position:fixed;top:18px;left:19px;font:700 15px/1.55 '+FONT+';color:#0a0a0a;}'+
    '@media (max-width:700px){#me-note{padding:76px 24px 44px;}'+
      '#me-note .n,#me-about-screen .txt{font-size:15px;line-height:1.7;}}'+   /* the size of every other word on the page */
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
      '#me-col .shot{position:relative;overflow:visible;margin:0 -18px;}'+
      '#me-col .plate,#me-col #me-browse{position:relative;z-index:1;}'+ /* the words lie over the picture's overhang */
      '#me-col .shot img{position:absolute;left:0;display:block;}'+
      '#me-col .plate{font:700 15px/1.55 '+FONT+';color:#0a0a0a;font-variant-numeric:tabular-nums;margin-top:8px;}'+
      '#me-col .shot{cursor:pointer;}'+
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
  /* the loader's veil hid Cargo's own content until now: the site is mounted, lift it */
  (function(){['me-veil','me-veil2','me-ground'].forEach(function(id){var v=document.getElementById(id);if(v&&v.parentNode)v.parentNode.removeChild(v);});})();

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
  /* the same colour laid over itself. Multiplying it into the page does nothing — the paper is
     within a few per cent of white, and anything times white is itself, which is why the pale
     keys stayed pale. Multiplied by ITSELF it deepens without turning into another colour: pink
     stays pink, it just stops being a wash. Repeated until it is dark enough to read, never more
     than three times, so the keys that are already deep are left where they are. */
  (function(){
    var h=theme.key.replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var c=[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
    for(var i=0;i<3;i++){
      var L=(0.2126*c[0]+0.7152*c[1]+0.0722*c[2])/255;
      if(L<0.34)break;
      c=[c[0]*c[0]/255,c[1]*c[1]/255,c[2]*c[2]/255];
    }
    document.documentElement.style.setProperty('--me-theme-laid',
      'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')');
  })();


  // ── the object: stainless time capsule, room light, etched plate ──
  var Q=new URLSearchParams(location.search); /* ?cam=0 leaves the metal without the watcher */
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
    yaw:21,
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
    /* PCF, not PCFSoft: the soft variant uses a fixed kernel and ignores shadow.radius, which is
       the one dial that makes a shadow look like light coming from a window rather than a laser.
       VSM bled light where two parts overlapped and put a hole in the shadow. */
    renderer.shadowMap.type=THREE.PCFShadowMap;
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
  /* ── the room the metal actually stands in ─────────────────────────
     A real studio, shot as a lat-long panorama with its full range intact (a radiance .hdr
     next to this file). The built room above stays as the fallback and as the surface the
     watcher is pinned to; when the panorama lands it takes over the lighting, because a
     photograph of a lit room is what steers a reflection, not a handful of coloured planes. */
  /* The panorama is clipped at 1.0 — it has no values above white anywhere in it, which means
     nothing was being carried by the radiance format that a picture could not carry. So it is a
     picture: 187 KB the browser decodes itself, instead of 12 MB of RGBE unpacked pixel by pixel
     in JavaScript into a 134 MB float texture, which is where the wait was. Same studio, same
     reflections, there almost as soon as the page is. */
  var HDR=null;
  function renderEnv(){
    if(!GL)return;
    if(!pmrem)pmrem=new THREE.PMREMGenerator(renderer);
    var rt=HDR?pmrem.fromEquirectangular(HDR):pmrem.fromScene(roomScene,0.02);
    if(envRT)envRT.dispose(); /* the target, not just its texture — otherwise every re-light leaks a 6 MB fbo+texture */
    envRT=rt;scene.environment=rt.texture;
  }
  roomScene=buildRoom();renderEnv();
  if(GL&&Q.get('hdr')!=='0'){
    new THREE.TextureLoader().load(new URL('env-metal.jpg',import.meta.url).href,function(t){
      /* a phone screen is small and bright, and the studio's dark walls come back off the metal as
         holes rather than shadow. On a phone the panorama's black point is lifted before it ever
         becomes a reflection — the same room, with less of a cellar in it. */
      if(isMobile()&&t.image&&t.image.width){
        try{
          var c=document.createElement('canvas');c.width=t.image.width;c.height=t.image.height;
          var g=c.getContext('2d');
          g.drawImage(t.image,0,0);
          g.fillStyle='rgba(255,255,255,0.24)';g.fillRect(0,0,c.width,c.height);
          t=new THREE.CanvasTexture(c);
        }catch(err){}
      }
      t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;
      HDR=t;renderEnv();needPaint();
    },undefined,function(){});   /* the built room stays lit as it was */
  }

  /* ── geometry in object units: tube radius 1 ─────────────────────
     a polished stainless tube; at each end a thick flange ring clamped by
     eight small radial socket screws, and beyond it a heavy machined end
     cap. the right cap is the lid: its screws back out of the ring, then
     the cap is pulled off. */
  var R=1,D=2,LTOT=3.6*D;
  var RF=1.28,TR=0.55,CAPL=0.5,CAPR=0.98,GAP=0.006,NB=8,FIL=0.035,SR=0.07,SL=0.16,SOUT=0.34;
  var XL=0, XR=LTOT;
  var TUBE0=XL+CAPL+GAP+TR, TUBE1=XR-CAPL-GAP-TR;    /* the tube between the rings */
  var LID_HOME=XR-CAPL;                              /* the right cap's inner face */
  var TP=CAPL;                                       /* (kept for the placement code) */

  var SEG=320,ARC=6;   /* around the axis, and the segments in each rolled edge */
  function fillet(p,cx,cy,r,a0,a1){ /* a rolled edge: nothing on a turned part comes off sharp */
    for(var i=0;i<=ARC;i++){var a=a0+(a1-a0)*i/ARC;p.push(new THREE.Vector2(cx+Math.cos(a)*r,cy+Math.sin(a)*r));}
  }
  function discGeo(rad,len){ /* a disc with both edges rolled, axis y, from 0 to len */
    var p=[];
    p.push(new THREE.Vector2(0,0));p.push(new THREE.Vector2(rad-FIL,0));
    fillet(p,rad-FIL,FIL,FIL,-Math.PI/2,0);
    fillet(p,rad-FIL,len-FIL,FIL,0,Math.PI/2);
    p.push(new THREE.Vector2(0,len));
    return new THREE.LatheGeometry(p,SEG);
  }
  function ringGeo(len){ /* a flange ring with its bore: the cap's plug sits in it */
    var p=[];
    p.push(new THREE.Vector2(0.9,0));p.push(new THREE.Vector2(RF-FIL,0));
    fillet(p,RF-FIL,FIL,FIL,-Math.PI/2,0);
    fillet(p,RF-FIL,len-FIL,FIL,0,Math.PI/2);
    p.push(new THREE.Vector2(0.9,len));p.push(new THREE.Vector2(0.9,0));
    return new THREE.LatheGeometry(p,SEG);
  }
  function tubeGeo(){
    var p=[new THREE.Vector2(R,0),new THREE.Vector2(R,TUBE1-TUBE0)]; /* an open tube: no end discs, the bore is a hole */
    var g=new THREE.LatheGeometry(p,SEG);
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
  /* the grain of polished stainless. it used to be drawn for a room of coloured panels; against
     a photographed studio the same strokes read as scratches, so they are a third of the weight
     and the smear that stretched them along the tube is off. ?brush= sets the weight. */
  var BR=parseFloat(Q.get('brush')||'0.34');
  function brush(r,w,h,ppx,ppy,seed){ /* lines along the tube: the grain of polished stainless */
    r.fillStyle='#8c8c8c';r.fillRect(0,0,w,h);
    var rnd=(function(){var q=seed;return function(){q=(q*1664525+1013904223)>>>0;return q/4294967296;};})();
    var n=Math.round(110*(w/ppx)*(h/ppy));
    for(var i=0;i<n;i++){
      var x=rnd()*w,len=(0.6+rnd()*5.5)*ppy,y=rnd()*h,a=(0.05+rnd()*0.12)*BR,dark=rnd()<0.5;
      r.strokeStyle=dark?'rgba(40,40,40,'+a+')':'rgba(230,230,230,'+a+')';r.lineWidth=(0.6+rnd()*1.2)*ppx/326;
      r.beginPath();r.moveTo(x,y);r.lineTo(x,y+len);r.stroke();   /* dead straight: a brushed line is */
    }
  }
  var steel=new THREE.MeshPhysicalMaterial({
    color:new THREE.Color(roll.tone,roll.tone,roll.tone*0.99),metalness:1,roughness:roll.rough,
    envMapIntensity:1.0
  });
  steel.anisotropy=parseFloat(Q.get('aniso')||'0.18');steel.anisotropyRotation=Math.PI/2;
  /* every other part is the same metal as the tube: same tone, same roughness, same brushing
     along the axis (the grain scaled to each part's length), same anisotropy */
  function sameMetal(){
    var mt=new THREE.MeshPhysicalMaterial({color:steel.color.clone(),metalness:1,roughness:roll.rough,envMapIntensity:1.0});
    mt.anisotropy=roll.aniso;mt.anisotropyRotation=Math.PI/2;return mt;
  }
  var plateSteel=sameMetal(),capSteel=sameMetal(),boltSteel=sameMetal();
  /* the fittings carry no brushing any more, so there is no grain for an anisotropic highlight
     to lie along — and on a lathe it follows the uv, which put a diagonal weave across every
     rim seen at a glancing angle. they are plain polished metal now. */
  plateSteel.anisotropy=0;boltSteel.anisotropy=0;   /* the caps keep theirs: it is what turns their faces */
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
  /* polish waviness: a real polished tube is never dead flat, and this bends the reflections a
     little. It was set against a room of flat panels, where it barely showed; a photographed
     studio has structure of its own for it to bend, and at the old weight — with the brushing
     that used to cover it now down to a third — it came out as circles rolling down the tube.
     A tenth of it is what a polish actually looks like. ?wave= sets it. */
  var WAVE=parseFloat(Q.get('wave')||'0');
  function wave(u,v){
    var A=WAVE;
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
  /* the rings, caps and screws carry no grain map at all now. It was one canvas stretched to
     each part's own length, so on anything as short as a flange ring it magnified about nine
     times and came out as stripes; scaled properly it was still a pattern laid over metal that
     the room already gives everything it needs. The tube keeps its own map — the engraving
     lives in it. ?grain=1 puts the old one back to compare. */
  if(Q.get('grain')==='1'){
    function brushFor(circ,len){
      var t=new THREE.CanvasTexture(brushOnly);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.RepeatWrapping;
      t.repeat.set(Math.max(1,Math.round(circ/0.62)),Math.max(1,Math.round(len/0.62)));t.anisotropy=8;return t;
    }
    plateSteel.roughnessMap=brushFor(2*Math.PI*RF,TR);
    capSteel.roughnessMap=brushFor(2*Math.PI*CAPR,CAPL);
    boltSteel.roughnessMap=brushFor(2*Math.PI*SR,SL);
  }
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
  var endWallL=new THREE.Mesh(endWallGeo,holeEnd);endWallL.rotation.z=-Math.PI/2;endWallL.position.x=TUBE0-0.02;group.add(endWallL);
  var endWallR=new THREE.Mesh(endWallGeo,holeEnd);endWallR.rotation.z=Math.PI/2;endWallR.position.x=TUBE1+0.02;endWallR.visible=false;group.add(endWallR);
  var boreGeo=new THREE.LatheGeometry([new THREE.Vector2(0.9,0),new THREE.Vector2(0.9,TUBE1-TUBE0)],SEG);
  var boreDark=null;
  (function(){var n=boreGeo.attributes.position.count,col=new Float32Array(n*3),half=n/2;
    for(var i=0;i<n;i++){var v=i<half?0.28:1.0;col[i*3]=v;col[i*3+1]=v;col[i*3+2]=v;}
    boreGeo.setAttribute('color',new THREE.BufferAttribute(col,3));
    boreDark=function(end){                       /* the dark end of the bore is the shut one */
      var a=boreGeo.attributes.color.array,dark=(end==='L')?1.0:0.28,lit=(end==='L')?0.28:1.0;
      for(var k=0;k<n;k++){var w=k<half?dark:lit;a[k*3]=w;a[k*3+1]=w;a[k*3+2]=w;}
      boreGeo.attributes.color.needsUpdate=true;
    };})();
  var boreMat=new THREE.MeshPhysicalMaterial({color:new THREE.Color(roll.tone*0.62,roll.tone*0.62,roll.tone*0.63),metalness:0.45,roughness:0.82,envMapIntensity:0.7,side:THREE.BackSide,vertexColors:true});
  var bore=new THREE.Mesh(boreGeo,boreMat);bore.rotation.z=-Math.PI/2;bore.position.x=TUBE0;group.add(bore);
  /* the inside takes no shadow map. The one light that casts stands overhead for the patch on the
     floor, and its map — small, and blurred wide on purpose — landed inside the bore as a slab
     with a straight edge across it, which is nothing a bore does. What darkens the inside is what
     should: the depth painted into it, and how little of the room reaches down there. */
  /* radial socket screws around each ring, at its mid-length; heads sit in the rim */
  var HH=0.062,SHL=0.235,PITCH=0.068;   /* a pan head, a long shank, a thread you can count */                 /* head, threaded shank, and its pitch */
  var HR=SR*0.78,HD=HH+SHL+0.02;                      /* the bore holds the whole shank */
  var screwGeo=new THREE.CylinderGeometry(SR,SR,HH,48);
  /* a real thread, cut as geometry. Every point on the shank rides a helix: the radius follows
     a trapezoid — crest, flank, root, flank — as the phase (distance along the axis, less the
     angle round it) advances, which is what a single-start thread is. The silhouette carries
     it, so it reads as a thread from the side and not as a cylinder with a picture on it. */
  function threadGeo(rc,amp,len,pitch,seg,rings){
    var pos=[],uvs=[],idx=[],i,j;
    function prof(u){
      if(u<0.26)return 1;                      /* the crest */
      if(u<0.50)return 1-(u-0.26)/0.24;        /* down the flank */
      if(u<0.76)return 0;                      /* the root */
      return (u-0.76)/0.24;                    /* and up the other one */
    }
    for(j=0;j<=rings;j++){
      var y=-len/2+len*j/rings;
      for(i=0;i<=seg;i++){
        var t=i/seg,th=t*Math.PI*2,u=((y/pitch)-t)%1;if(u<0)u+=1;
        var r=rc+amp*prof(u);
        pos.push(Math.cos(th)*r,y,Math.sin(th)*r);uvs.push(t,j/rings);
      }
    }
    for(j=0;j<rings;j++)for(i=0;i<seg;i++){
      var q0=j*(seg+1)+i,q1=q0+1,q2=q0+seg+1,q3=q2+1;idx.push(q0,q2,q1,q1,q2,q3);
    }
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    g.setIndex(idx);g.computeVertexNormals();return g;
  }
  var shankGeo=threadGeo(SR*0.50,0.017,SHL,0.062,40,132);
  var shankEnd=new THREE.CircleGeometry(SR*0.50,40);shankEnd.rotateX(Math.PI/2);
  /* 1.75 turns is seven quarter turns, and a four-pointed star has no way of showing the
     difference: it lands exactly as it started, which looks like a bolt that never turned.
     A number that is not a multiple of a quarter leaves it somewhere else than it began. */
  var TURNS=1.62;
  /* the recess in the head: a four-pointed star, cut in rather than sunk as a hex socket */
  var sockGeo=(function(){
    var sh=new THREE.Shape(),ro=SR*0.68,ri=SR*0.115;
    for(var i=0;i<8;i++){
      var a=i/8*Math.PI*2-Math.PI/2,rad=(i%2===0)?ro:ri;
      var x=Math.cos(a)*rad,y=Math.sin(a)*rad;
      if(i===0)sh.moveTo(x,y);else sh.lineTo(x,y);
    }
    sh.closePath();
    var g=new THREE.ShapeGeometry(sh,1);
    g.rotateX(-Math.PI/2);            /* it lies on the head's face, which looks along +y */
    return g;
  })();
  var rndA=(function(){var q=91;return function(){q=(q*1664525+1013904223)>>>0;return q/4294967296;};})();
  /* the tapped hole each screw came out of: an open bore in the rim with a floor at the
     bottom of it. it is a little narrower than the screw, so while the screw is home the
     hole is inside it and nothing shows; back the screw out and the hole is what is left. */
  var boreWall=new THREE.CylinderGeometry(HR,HR,HD,40,1,true);
  var boreFloor=new THREE.CircleGeometry(HR,40);
  /* the mouth of it, countersunk. a bore straight down into a rim shows nothing at all unless
     you happen to be looking along it — and the ring is edge-on from most of the ways the
     object is turned. the seat is what makes a hole read: a dark ring on the surface, there
     from every angle, and the screw head sits in it when the screw is home. */
  var boreMouth=new THREE.CylinderGeometry(HR*1.28,HR,0.03,40,1,true);   /* a chamfer, not a dish: the black of the bore is the point */
  /* a tapped hole has nothing in it to light: no polish, no room reaching down it. black. */
  var tapMat=new THREE.MeshStandardMaterial({color:0x090a0b,metalness:0,roughness:1,envMapIntensity:0.05,side:THREE.DoubleSide});
  /* both faces, on purpose: a bore drawn from the inside only shows its far wall, and at any
     angle but straight down it that is nothing at all — which is how eight holes managed to
     disappear. drawn from both, the mouth is black from wherever you stand. */
  var tapFloorMat=new THREE.MeshStandardMaterial({color:0x050506,metalness:0,roughness:1,envMapIntensity:0.03});
  var seatMat=new THREE.MeshStandardMaterial({color:new THREE.Color(roll.tone*0.22,roll.tone*0.22,roll.tone*0.23),metalness:0.6,roughness:0.75,envMapIntensity:0.4,side:THREE.DoubleSide});
  function screwRing(parent,x){
    var out=[];
    for(var i=0;i<NB;i++){
      var a=i/NB*Math.PI*2+Math.PI/NB;
      var hole=new THREE.Group();hole.position.x=x;hole.rotation.x=a;   /* the hole belongs to the ring: it never moves */
      var wall=new THREE.Mesh(boreWall,tapMat);wall.position.y=RF+0.012-HD/2;hole.add(wall);
      var floor=new THREE.Mesh(boreFloor,tapFloorMat);floor.position.y=RF+0.012-HD;floor.rotation.x=-Math.PI/2;hole.add(floor);
      parent.add(hole);
      var g=new THREE.Group();g.position.x=x;g.rotation.x=a;            /* local +y points outward along the radius */
      var head=new THREE.Mesh(screwGeo,boltSteel);head.userData.y0=RF+0.012-HH/2;g.add(head);
      var shank=new THREE.Mesh(shankGeo,boltSteel);shank.userData.y0=RF+0.012-HH-SHL/2;g.add(shank);
      var tip=new THREE.Mesh(shankEnd,boltSteel);tip.userData.y0=RF+0.012-HH-SHL-0.0004;g.add(tip);
      var sock=new THREE.Mesh(sockGeo,socketMat);sock.userData.y0=RF+0.0125;sock.rotation.y=rndA()*Math.PI/2;g.add(sock);
      g.children.forEach(function(m){m.position.y=m.userData.y0;});
      g.userData.a0=rndA()*Math.PI/3;
      parent.add(g);out.push(g);
    }
    return out;
  }
  var screwsL=screwRing(group,XL+CAPL+GAP+TR/2);
  var screwsR=screwRing(group,TUBE1+TR/2);
  /* both ends come off. Each is the same thing built twice: a cap, the plug that sits inside the
     ring, and the tapped holes its bolts came out of. Which one opens is whichever end of the
     object you clicked nearer to. */
  var holeGeo=new THREE.CylinderGeometry(SR*0.8,SR*0.8,0.16,40);
  function makeLid(inward){         /* inward: +1 for the left end, -1 for the right */
    var L=new THREE.Group();group.add(L);
    var cap=new THREE.Mesh(discGeo(CAPR,CAPL),capSteel);cap.rotation.z=-Math.PI/2;
    cap.position.x=inward>0?0:0;cap.castShadow=true;L.add(cap);
    var plugX=inward>0?CAPL:-(TR+GAP);
    var plug=new THREE.Mesh(discGeo(0.895,TR+GAP),capSteel);plug.rotation.z=-Math.PI/2;plug.position.x=plugX;L.add(plug);
    for(var hi=0;hi<NB;hi++){
      var ha=hi/NB*Math.PI*2+Math.PI/NB,hg=new THREE.Group();
      hg.position.x=inward>0?(CAPL+(TR+GAP)/2+GAP/2):(-(TR+GAP)/2-GAP/2);hg.rotation.x=ha;
      var hole=new THREE.Mesh(holeGeo,socketMat);hole.position.y=0.895-0.06;hg.add(hole);L.add(hg);
    }
    return L;
  }
  var lidL=makeLid(1);lidL.position.x=XL;
  var lid=makeLid(-1);lid.position.x=LID_HOME;
  var ENDS={L:{lid:lidL,home:XL,dir:-1,screws:screwsL},R:{lid:lid,home:LID_HOME,dir:1,screws:screwsR}};

  /* what is inside it is light. With the cap off, it comes out of the bore: a cone of it standing
     in the air along the object's own axis, brightest at the mouth and gone a few lengths out,
     added to whatever is behind rather than covering it — and a lamp just inside the opening, so
     the ring's rim and the back of the cap are lit by the thing they were holding in. */
  var BEAM_L=3.6;
  var beamGeo=new THREE.CylinderGeometry(1.75,0.86,BEAM_L,64,1,true);
  beamGeo.rotateZ(-Math.PI/2);beamGeo.translate(TUBE1+BEAM_L/2+0.08,0,0);
  /* a cone drawn flat has a hard silhouette, which is a cone and not a shaft of light. Its own
     surface tells it where its edges are: where the metal of it turns away from the eye it fades
     out, brightest where it faces us, so what is left is soft down both sides and dies along its
     length. Added to what is behind it, never covering anything. */
  var beamMat=new THREE.ShaderMaterial({
    uniforms:{uAmt:{value:0},uL:{value:BEAM_L},uX0:{value:TUBE1+0.08}},
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying float vT;varying vec3 vN;varying vec3 vV;uniform float uL;uniform float uX0;\n'+
      'void main(){vT=clamp((position.x-uX0)/uL,0.0,1.0);vN=normalMatrix*normal;\n'+
      'vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vT;varying vec3 vN;varying vec3 vV;uniform float uAmt;\n'+
      'void main(){float face=abs(dot(normalize(vN),normalize(vV)));\n'+
      'float a=pow(1.0-vT,2.6)*pow(face,1.6)*uAmt;\n'+
      'gl_FragColor=vec4(vec3(1.0,0.985,0.95)*a,a);}'
  });
  var beam=new THREE.Mesh(beamGeo,beamMat);beam.renderOrder=3;beam.visible=false;group.add(beam);
  var mouthGeo=new THREE.CircleGeometry(0.9,48);mouthGeo.rotateY(Math.PI/2);mouthGeo.translate(TUBE1+0.02,0,0);
  var mouthMat=new THREE.MeshBasicMaterial({color:0xfff6ea,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  var mouth=new THREE.Mesh(mouthGeo,mouthMat);mouth.renderOrder=4;group.add(mouth);
  var innerLamp=new THREE.PointLight(0xfff4e2,0,7,2);innerLamp.position.set(TUBE1-0.5,0,0);group.add(innerLamp);
  /* ── the radio screen: a small set-in display on the back of the tube, a Pip-Boy of sorts — dark
     glass in a metal bezel that shows only the title playing, in the theme's colour. dark when off ── */
  var screenCanvas=document.createElement('canvas');screenCanvas.width=1024;screenCanvas.height=448;
  var screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;screenTex.anisotropy=8;
  var screenMat=new THREE.MeshPhysicalMaterial({color:0x040405,metalness:0,roughness:0.2,clearcoat:1,clearcoatRoughness:0.06,emissive:new THREE.Color(1,1,1),emissiveMap:screenTex,emissiveIntensity:1.0,envMapIntensity:0.5});
  /* the face has to be in the document before a canvas will draw with it, and the stylesheet that
     brings it is still in flight when the screen is first written — so the screen is written again
     once it lands, and once more on a timer in case the sheet never does. */
  var lastScreen='';
  function lcdReady(){
    if(!document.fonts||!document.fonts.load){setScreen(lastScreen);return;}
    document.fonts.load('800 100px "Doto"').then(function(){setScreen(lastScreen);}).catch(function(){});
  }
  lcdFont.addEventListener('load',lcdReady);
  setTimeout(lcdReady,1400);
  function setScreen(title){
    lastScreen=title||'';
    var g=screenCanvas.getContext('2d'),W2=screenCanvas.width,H2=screenCanvas.height,t=(title||'').replace(/\s+/g,' ').trim();
    g.fillStyle='#000';g.fillRect(0,0,W2,H2);
    if(t){
      var col=theme.key,size=150,lines=[t],pad=140,LF=FONT_LCD;
      for(;;){
        g.font='800 '+size+'px '+LF;
        if(g.measureText(t).width<=W2-pad){lines=[t];break;}
        var words=t.split(' '),best=null;
        for(var i=1;i<words.length;i++){var a=words.slice(0,i).join(' '),b=words.slice(i).join(' '),m=Math.max(g.measureText(a).width,g.measureText(b).width);if(!best||m<best.m)best={a:a,b:b,m:m};}
        if(best&&best.m<=W2-pad&&size*2.3<=H2-40){lines=[best.a,best.b];break;}
        size-=8;if(size<52){lines=best?[best.a,best.b]:[t];break;}
      }
      g.font='800 '+size+'px '+LF;
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
  var frameGeo=new THREE.ExtrudeGeometry(frameShape,{depth:0.06,bevelEnabled:true,bevelThickness:0.012,bevelSize:0.012,bevelSegments:4,curveSegments:24});
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
  /* the object does not sit on the table, it stands off it: the floor is well below, so what is
     under it is a shadow it is not touching. */
  var floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({opacity:roll.shadow*0.55}));
  floor.rotation.x=-Math.PI/2;floor.position.set(0,-4.05,0);   /* clear of the object even stood on end */floor.receiveShadow=true;stage.add(floor);
  /* the key light is what the metal is lit by, and it comes in low from the left — which threw a
     long hard shadow off to one side, stuck to the object like a decal. It lights only now. The
     shadow is thrown by a second light standing almost straight overhead, at no brightness at
     all: it adds nothing to the metal and does nothing but put a soft dark patch underneath. */
  var keyTarget=new THREE.Object3D();keyTarget.position.set(0,0,0);stage.add(keyTarget);
  var keyLight=new THREE.DirectionalLight(0xffffff,roll.key);
  keyLight.position.set(-3,9,6);keyLight.castShadow=false;keyLight.target=keyTarget;stage.add(keyLight);
  var shadowLight=new THREE.DirectionalLight(0xffffff,0);
  shadowLight.position.set(0.7,16,1.4);shadowLight.castShadow=true;shadowLight.target=keyTarget;
  shadowLight.shadow.mapSize.set(512,512);shadowLight.shadow.radius=11;   /* a small map and a wide kernel: the edge has no business being sharp */
  shadowLight.shadow.bias=-0.0004;shadowLight.shadow.normalBias=0.04;
  shadowLight.shadow.camera.left=-8;shadowLight.shadow.camera.right=8;shadowLight.shadow.camera.top=7;shadowLight.shadow.camera.bottom=-7;
  shadowLight.shadow.camera.near=1;shadowLight.shadow.camera.far=44;
  stage.add(shadowLight);
  var fillLight=new THREE.DirectionalLight(0xffffff,0.35);fillLight.position.set(-6,2,8);stage.add(fillLight);
  /* the view: a three-quarter turn at rest, and the visitor may turn it any way by dragging */
  var YAW=THREE.MathUtils.degToRad(roll.yaw);
  var BASE_YAW=-YAW+THREE.MathUtils.degToRad(roll.ry),LIMIT=Math.PI/8;   /* forty-five degrees of travel per axis */
  var AX_X=new THREE.Vector3(1,0,0),AX_Y=new THREE.Vector3(0,1,0),AX_Z=new THREE.Vector3(0,0,1);
  var qTmp=new THREE.Quaternion(),qY=new THREE.Quaternion(),qX=new THREE.Quaternion(),qS=new THREE.Quaternion(),vC=new THREE.Vector3();
  /* the pose a fresh page lands in: turned a little less than three quarters, so the far cap is
     read edge-on rather than face-on, and rolled a touch so the engraving sits above the middle
     of the barrel instead of across it. */
  var rot={yaw:-YAW+THREE.MathUtils.degToRad(roll.ry),pitch:THREE.MathUtils.degToRad(roll.rx),spin:-0.16,vy:0,vx:0,vs:0};
  function applyRot(){
    qY.setFromAxisAngle(AX_Y,rot.yaw);qX.setFromAxisAngle(AX_X,rot.pitch);  /* the drag, as on the live site */
    qS.setFromAxisAngle(AX_X,rot.spin);                                     /* the wheel, about its own length */
    qTmp.copy(qX).multiply(qY).multiply(qS);group.quaternion.copy(qTmp);
  }
  applyRot();

  /* ── the visitor in the steel ──────────────────────────────────────
     The reel did this with the front camera. Asking for one puts a permission sheet in front
     of the object before the visitor has even seen it, so the wall the capsule faces is
     painted instead: a room, and someone standing in it, looking back. It is the same path
     the camera used — the picture is blurred, laid over the metal in screen space, and lights
     the room — only it is there from the first frame and never asks for anything. What moves
     it is the object turning, which was always the only motion the reflection had. */
  function watcher(){
    if(!GL||Q.get('cam')==='0')return;
    var SW=256,SH=192,src=document.createElement('canvas');src.width=SW;src.height=SH;
    var g=src.getContext('2d');
    /* the room: a white wall, its light coming from the left, laid in courses */
    var wall=g.createLinearGradient(0,0,SW,SH);
    wall.addColorStop(0,'#f2f1ed');wall.addColorStop(0.55,'#e8e7e2');wall.addColorStop(1,'#dcdbd6');
    g.fillStyle=wall;g.fillRect(0,0,SW,SH);
    g.strokeStyle='rgba(150,150,145,0.32)';g.lineWidth=1.4;
    for(var y=14;y<SH;y+=26){g.beginPath();g.moveTo(0,y);g.lineTo(SW,y);g.stroke();}
    for(var row=0,yy=14;yy<SH;yy+=26,row++){
      for(var x=(row%2?0:36);x<SW;x+=72){g.beginPath();g.moveTo(x,yy);g.lineTo(x,yy+26);g.stroke();}
    }
    /* the shoulders: the dark mass that gives the metal its weight at the bottom */
    /* the smear runs the length of the tube, so only what is stacked vertically survives it:
       wall, the shade of a cap, a face, and the dark of a shoulder. that is what is drawn. */
    var cx=126;
    g.fillStyle='#232427';
    g.beginPath();
    g.moveTo(cx-116,SH);g.bezierCurveTo(cx-104,SH-44,cx-56,SH-62,cx-27,SH-66);
    g.lineTo(cx+29,SH-66);g.bezierCurveTo(cx+60,SH-60,cx+106,SH-42,cx+116,SH);
    g.closePath();g.fill();
    g.fillStyle='#1f2023';g.fillRect(cx-24,SH-80,48,20);            /* the neck of the shirt */
    g.fillStyle='#cfad92';
    g.beginPath();g.ellipse(cx-1,SH-108,31,38,0,0,Math.PI*2);g.fill();  /* the face */
    g.fillStyle='#b08a72';g.fillRect(cx-15,SH-82,30,18);                /* the throat, in shadow */
    g.fillStyle='#4a3c2c';
    g.beginPath();g.ellipse(cx-1,SH-132,33,25,0,Math.PI,Math.PI*2);g.fill();   /* the cap */
    g.fillStyle='#3d3123';
    g.beginPath();g.ellipse(cx-4,SH-127,40,8,0.04,0,Math.PI*2);g.fill();       /* its brim */
    g.fillStyle='rgba(74,56,40,0.42)';g.fillRect(cx-31,SH-126,62,12);          /* what the brim throws */
    g.fillStyle='#3b3630';
    g.beginPath();g.ellipse(cx-12,SH-112,4.2,3.2,0,0,Math.PI*2);g.fill();      /* and the eyes, which is
    the whole point of it */
    g.beginPath();g.ellipse(cx+11,SH-112,4.2,3.2,0,0,Math.PI*2);g.fill();
    g.fillStyle='rgba(60,50,42,0.30)';
    g.beginPath();g.ellipse(cx-1,SH-90,11,4.5,0,0,Math.PI*2);g.fill();         /* the mouth, barely */

    /* into the square the shader samples, the way a 4:3 picture was stretched into it before */
    var c=document.createElement('canvas');c.width=256;c.height=256;
    var cg=c.getContext('2d',{willReadFrequently:true});
    cg.drawImage(src,0,0,256,256);
    var im=cg.getImageData(0,0,256,256),d=im.data;
    for(var i=0;i<d.length;i+=4){                                   /* the camera's own grade: half
                                                                       monochrome, contrast up, down a stop */
      var lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
      d[i]=((d[i]*0.53+lum*0.47)-128)*1.18+128;
      d[i+1]=((d[i+1]*0.53+lum*0.47)-128)*1.18+128;
      d[i+2]=((d[i+2]*0.53+lum*0.47)-128)*1.18+128;
    }
    softBlur(d,256,256,2);cg.putImageData(im,0,0);
    var tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=false;
    /* the room light gets the tint only: no structure of the picture reaches the env map */
    var c2=document.createElement('canvas');c2.width=32;c2.height=24;
    var g2=c2.getContext('2d',{willReadFrequently:true});
    g2.drawImage(c,0,0,32,24);
    var im2=g2.getImageData(0,0,32,24);softBlur(im2.data,32,24,2);g2.putImageData(im2,0,0);
    var tex2=new THREE.CanvasTexture(c2);tex2.colorSpace=THREE.SRGBColorSpace;
    tex2.minFilter=THREE.LinearFilter;tex2.magFilter=THREE.LinearFilter;tex2.generateMipmaps=false;
    camPlane.material.map=tex2;camPlane.material.needsUpdate=true;camPlane.visible=true;
    mirrorU.uCam.value=tex;mirrorU.uCamAspect.value=4/3;mirrorU.uCamMix.value=roll.mirror;
    renderEnv();needPaint();
  }
  function softBlur(d,w,h,r){ /* separable box blur on rgba bytes, radius r */
    var tmp=new Uint8ClampedArray(d.length),k=2*r+1;
    for(var y=0;y<h;y++)for(var x=0;x<w;x++){var i=(y*w+x)*4,R=0,G=0,B=0;for(var o=-r;o<=r;o++){var xx=Math.min(w-1,Math.max(0,x+o)),j=(y*w+xx)*4;R+=d[j];G+=d[j+1];B+=d[j+2];}tmp[i]=R/k;tmp[i+1]=G/k;tmp[i+2]=B/k;tmp[i+3]=255;}
    for(var y2=0;y2<h;y2++)for(var x2=0;x2<w;x2++){var i2=(y2*w+x2)*4,R2=0,G2=0,B2=0;for(var o2=-r;o2<=r;o2++){var yy=Math.min(h-1,Math.max(0,y2+o2)),j2=(yy*w+x2)*4;R2+=tmp[j2];G2+=tmp[j2+1];B2+=tmp[j2+2];}d[i2]=R2/k;d[i2+1]=G2/k;d[i2+2]=B2/k;d[i2+3]=255;}
  }
  watcher();

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
  var cap={state:'sealed',loosen:0,slide:0,move:0,hot:false,end:'R'};   /* end never changes */
  /* the right cap is the lid, and the only one: the left end stays bolted for good. */
  var MOB_SLIDE=44;
  function restBox(){
    if(isMobile()){var Lm=W-36-MOB_SLIDE;return {L:Lm,left:(W-Lm)/2,top:H*0.36};}   /* centred: it sat left by the width of the lid's travel */
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
    /* the floor used to drop away by however far the tilted object reached below its middle, which
       moved the shadow up and down every time the object turned. The object floats clear of it at
       any angle the pointer can reach, so the floor simply sits still. */
    stage.position.set(centre.x,centre.y,0);stage.scale.setScalar(s);
    lastBox={left:b.left,top:b.top,w:b.L,h:Hpx};lastPx=ppu*s; /* screen px per object unit */
    /* the unbolting: a mechanic's star order, each bolt seven turns out on its thread,
       rising with the pitch; once the last one is free the plate is pulled off and parked */
    /* the slide is eased hard at the end, which spends four fifths of its distance in the first
       fifth of its time: the bolts were unwinding in under two hundred milliseconds, far too fast
       to read as turning. The bolts run off the tween's own clock instead, recovered by undoing
       the easing, so each one turns at the speed it looks like it is turning. */
    var lin=1-Math.pow(1-clamp(cap.slide,0,1),0.2);
    var p1=clamp(lin/0.72,0,1),p2=clamp((lin-0.72)/0.28,0,1);
    var ORDER=[0,4,2,6,1,5,3,7],END=ENDS[cap.end],OTHER=ENDS[cap.end==='L'?'R':'L'];
    OTHER.screws.forEach(function(g){          /* the end that stays shut stays bolted */
      g.rotation.y=g.userData.a0;
      g.children.forEach(function(m){m.position.y=m.userData.y0;});
    });
    OTHER.lid.position.x=OTHER.home;
    END.screws.forEach(function(g,i){
      var j=ORDER.indexOf(i),st=j*0.075,du=0.44;   /* each one takes its time */
      var q=clamp((p1-st)/du,0,1);
      var e=q<0.5?2*q*q:1-Math.pow(-2*q+2,2)/2;           /* torque to break it, then it spins, then it slows */
      g.rotation.y=g.userData.a0+e*Math.PI*2*TURNS;         /* turned exactly as far as it travels */
      g.children.forEach(function(m){m.position.y=m.userData.y0+e*SOUT;}); /* out of the ring along the radius */
    });
    var park=isMobile()?MOB_SLIDE/lastPx:(TP+0.1*LTOT);
    var pe=p2<0.5?2*p2*p2:1-Math.pow(-2*p2+2,2)/2;
    END.lid.position.x=END.home+END.dir*(cap.loosen*4/lastPx+pe*park);
    var lit=p2*p2;                                   /* nothing until the cap actually moves */
    beamMat.uniforms.uAmt.value=1.0*lit;mouthMat.opacity=0.85*lit;innerLamp.intensity=26*lit;
    beam.visible=mouth.visible=lit>0.002;
    placeStamp();
  }
  var stampFixed=null;
  function placeStamp(){
    if(!lastBox||!GL)return;
    var x=Math.round(lastBox.left),y=Math.round(lastBox.top+lastBox.h+24);
    /* opened, the date belongs to the index: it takes the list's left edge once the rows are laid
       out, then stays exactly there — turning the object never moves it (a resize resets it) */
    if(!stampFixed&&app.classList.contains('browse')&&listEl.offsetParent){
      var lr=listEl.getBoundingClientRect(),ar=app.getBoundingClientRect();
      stampFixed={x:Math.round(lr.left-ar.left),y:Math.round(lr.bottom-ar.top+28)};
    }
    if(stampFixed){x=stampFixed.x;y=stampFixed.y;}
    if(!(stampEl.classList.contains('kept')||app.classList.contains('open')||cap.state==='opening'))stampFixed=null;
    stampEl.style.transform='translate('+x+'px,'+y+'px)';
  }
  /* the object is clickable wherever it actually is. The old test was the box it occupies when it
     sits square on, which stops being where the object is the moment it is turned — hence a click
     landing on metal and doing nothing. Its axis is projected to the screen and the point measured
     against that line, inside the caps' own radius: right at any angle, and the segment grows with
     the lid as it slides off. */
  var _hv=new THREE.Vector3();
  function axisOnScreen(x,r){
    _hv.set(x,0,0).applyMatrix4(group.matrixWorld).project(camera);
    return [r.left+(_hv.x*0.5+0.5)*r.width,r.top+(-_hv.y*0.5+0.5)*r.height];
  }
  function hitCapsule(px,py){
    if(!GL||!lastPx)return false;
    var r=cvs.getBoundingClientRect();
    if(!r.width||!r.height)return false;
    group.updateMatrixWorld();
    var park=isMobile()?MOB_SLIDE/lastPx:(TP+0.1*LTOT);
    var a=axisOnScreen(XL,r),b=axisOnScreen(XR+cap.slide*park,r);
    var vx=b[0]-a[0],vy=b[1]-a[1],L2=vx*vx+vy*vy;
    var t=L2?clamp(((px-a[0])*vx+(py-a[1])*vy)/L2,0,1):0;
    var cx=a[0]+vx*t,cy=a[1]+vy*t,d=CAPR*lastPx+(canHover()?10:34);   /* a finger is wider than a pointer */
    return (px-cx)*(px-cx)+(py-cy)*(py-cy)<=d*d;
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
      tween('slide',1,780); /* quick on the phone: the titles must not wait */
      later(function(){
        buildColumn();
        app.classList.add('open');stampEl.classList.add('kept');
        dealRows();
        cap.state='open';
      },800);
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
    var b=lastBox,pad=14,topPad=Math.round(b.h*0.45),botPad=Math.round(b.h*0.75);
    colEl.style.paddingTop=Math.round(Math.max(64,b.top-pad))+'px'; /* the object does not move up: the column starts where it stood */
    shot.style.height=Math.round(b.h+pad*2)+'px'; /* the slot keeps the tube's height so the date stays where it is… */
    var img=document.createElement('img');img.src=url;img.alt='';
    img.style.width=W+'px';img.style.height=H+'px';img.style.top=Math.round(-(b.top-pad))+'px';
    /* …while the picture shows past the slot: rings, screws and the shadow are never cut off */
    img.style.clipPath='inset('+Math.max(0,Math.round(b.top-topPad))+'px 0 '+Math.max(0,Math.round(H-(b.top+b.h+botPad)))+'px 0)';
    shot.appendChild(img);colEl.appendChild(shot);
    shot.setAttribute('role','button');shot.setAttribute('aria-label','time capsule — close');shot.addEventListener('click',function(){sealCapsule();}); /* a tap on the object seals it again */
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
  /* the live site's own handling: drag turns it, with a little momentum, and a click that did not
     move opens it. The wheel is the one thing added — it rolls the object about its own length. */
  var drag=null;
  /* the same drag, only the object is no longer welded to the pointer: the hand sets a pose it is
     heading for and it eases there, a tenth of what is left each frame. What is let go of carries
     on into that same pose and dies out slowly, so a throw glides rather than stops dead. */
  var aim={yaw:rot.yaw,pitch:rot.pitch},spinning=false;
  function spinLoop(){
    if(!drag){
      aim.yaw+=rot.vy;aim.pitch=clamp(aim.pitch+rot.vx,-1.1,1.1);
      rot.vy*=0.945;rot.vx*=0.945;
      if(Math.abs(rot.vy)<0.00012)rot.vy=0;
      if(Math.abs(rot.vx)<0.00012)rot.vx=0;
    }
    rot.spin+=rot.vs;rot.vs*=0.94;if(Math.abs(rot.vs)<0.0004)rot.vs=0;
    var dy=aim.yaw-rot.yaw,dp=aim.pitch-rot.pitch;
    if(!rot.vy&&!rot.vx&&!rot.vs&&Math.abs(dy)<0.0003&&Math.abs(dp)<0.0003){
      rot.yaw=aim.yaw;rot.pitch=aim.pitch;spinning=false;paint();return;
    }
    rot.yaw+=dy*0.105;rot.pitch+=dp*0.105;   /* and it takes its time getting there */
    paint();requestAnimationFrame(spinLoop);
  }
  function kickSpin(){if(!spinning){spinning=true;requestAnimationFrame(spinLoop);}}

  /* ── the phone turns it ────────────────────────────────────────────
     On a phone there is nothing to drag with that is not also the thing you tap, so the object is
     held the way you would hold the object: tilt the phone and it tilts, level it and it comes
     back level. Tilting sets a pose it eases toward, exactly as the drag does on a desktop, so
     the two share every bit of the easing and the momentum. A flick is different from a tilt —
     it is measured as turn per second rather than angle — and that goes into the spin the wheel
     drives, so a sharp one rolls the object on its own length and it coasts to a stop.
     iOS will not report any of it until it has been asked in front of a person, so the ask goes
     on the first touch and the answer is remembered by the browser. */
  var HOME_YAW=rot.yaw,HOME_PITCH=rot.pitch;
  var gyro={on:false,live:false,zero:null};
  function gyroTurn(e){
    if(e.beta==null&&e.gamma==null)return;
    gyro.live=true;                                       /* it is actually reporting: the hand stands down */
    if(!gyro.zero)gyro.zero={b:e.beta||0,g:e.gamma||0};   /* however the phone was held at the start is level */
    var dg=clamp((e.gamma||0)-gyro.zero.g,-50,50),db=clamp((e.beta||0)-gyro.zero.b,-50,50);
    aim.yaw=HOME_YAW+dg*0.013;                            /* about forty degrees at the stops */
    aim.pitch=clamp(HOME_PITCH-db*0.011,-1.1,1.1);
    kickSpin();
  }
  function gyroFlick(e){
    var r=e.rotationRate;if(!r)return;
    var twist=r.alpha||0,flick=r.beta||0;                  /* about the screen, and about its short edge */
    if(Math.abs(flick)>120)rot.vs=clamp(rot.vs+flick*0.00016,-0.10,0.10);
    if(Math.abs(twist)>120)rot.vy=clamp(rot.vy+twist*0.00004,-0.05,0.05);
    if(rot.vs||rot.vy)kickSpin();
  }
  function startGyro(){
    if(gyro.on||!isMobile())return;
    gyro.on=true;
    function listen(){
      window.addEventListener('deviceorientation',gyroTurn);
      window.addEventListener('devicemotion',gyroFlick);
    }
    var D=window.DeviceOrientationEvent,M=window.DeviceMotionEvent;
    if(D&&typeof D.requestPermission==='function'){
      D.requestPermission().then(function(v){
        if(v!=='granted'){gyro.on=false;return;}
        if(M&&typeof M.requestPermission==='function')return M.requestPermission().then(listen,listen);
        listen();
      }).catch(function(){gyro.on=false;});
    }else listen();
  }
  /* only iOS makes you ask, and only while a finger is actually down. Everywhere else it listens
     from the start. The ask used to sit on the canvas, which meant it waited for a touch that
     landed on the object — touch the list, the brand, anywhere else, and nothing was asked. It is
     on the first touch anywhere on the page now, so the question arrives with the first thing the
     visitor does. */
  (function(){
    var D=window.DeviceOrientationEvent;
    if(!isMobile())return;
    if(!D||typeof D.requestPermission!=='function'){startGyro();return;}
    /* it keeps asking on every touch until the phone actually answers. A prompt that is dismissed
       rather than decided leaves nothing behind, and one ask that lands on that is an ask lost. */
    function ask(){if(!gyro.live)startGyro();}
    document.addEventListener('touchstart',ask,{capture:true,passive:true});
    document.addEventListener('pointerdown',ask,true);
  })();
  function dragStart(e,el){
    if(e.button!==undefined&&e.button!==0)return;
    if(!hitCapsule(e.clientX,e.clientY))return;
    drag={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:false,id:e.pointerId,el:el};
    rot.vy=rot.vx=0;aim.yaw=rot.yaw;aim.pitch=rot.pitch;
    try{el.setPointerCapture(e.pointerId);}catch(err){}
  }
  function dragMove(e){
    if(!drag||e.pointerId!==drag.id)return;
    var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>6){drag.moved=true;cvs.classList.add('turning');}
    if(!drag.moved)return;
    if(isMobile()&&gyro.live)return;      /* the phone turns it — unless it will not, and then the hand does */
    rot.vy=dx*0.0032;rot.vx=dy*0.0032;   /* a little over half the turn per pixel it had */
    aim.yaw+=rot.vy;aim.pitch=clamp(aim.pitch+rot.vx,-1.1,1.1);
    kickSpin();
  }
  function dragEnd(e){
    if(!drag||e.pointerId!==drag.id)return;
    var d=drag;drag=null;cvs.classList.remove('turning');
    try{d.el.releasePointerCapture(e.pointerId);}catch(err){}
    if(d.moved){kickSpin();return;}   /* the carry runs on in the same loop */
    if(e.detail>1)return;
    toggleCapsule();
  }
  cvs.addEventListener('pointermove',function(e){if(drag){dragMove(e);return;}if(!canHover())return;setHot(hitCapsule(e.clientX,e.clientY));});
  cvs.addEventListener('pointerleave',function(){if(!drag)setHot(false);});
  cvs.addEventListener('pointerdown',function(e){dragStart(e,cvs);});
  cvs.addEventListener('pointerup',dragEnd);
  cvs.addEventListener('pointercancel',function(){drag=null;cvs.classList.remove('turning');});
  cvs.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCapsule();}});
  /* the wheel rolls it: the object turns about its own length, the way you would turn a tube
     in your hands to read the far side of it. only while the object is what is on screen. */
  cvs.addEventListener('wheel',function(e){
    if(fieldMode==='radio'||pl.classList.contains('show')||document.getElementById('me-about-screen'))return;
    if(document.getElementById('me-note'))return;
    if(isMobile()&&app.classList.contains('open'))return;
    e.preventDefault();
    var d=e.deltaMode===1?e.deltaY*16:(e.deltaMode===2?e.deltaY*400:e.deltaY);
    rot.spin+=d*0.0022;rot.vs=clamp(d*0.0016,-0.09,0.09);
    kickSpin();
  },{passive:false});

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
              if(muteHold&&!pendingSeek){muteHold=false;quietHandover=false;tuneAudio();rampMusic(lawVol,350);}
            /* cued, paused or unstarted while the set is on: a new station never starts itself
               in Safari, so it is told to play here, carrying the visitor's own activation */
            if(radioPlaying&&(ev.data===5||ev.data===2||ev.data===-1)){try{ytPlayer.unMute();ytPlayer.playVideo();}catch(e){}}
            }
            /* a station never plays another station's song: at the end of the
               video the broadcast simply loops */
            /* the song has run out: the set moves along the scale to the next station,
               taking the needle with it, rather than playing the same broadcast again */
            if(ev&&ev.data===0){
              try{
                var cur=currentVid();
                var order=Object.keys(bandTicks).sort(function(a,b){return bandTicks[a].x-bandTicks[b].x;});
                if(order.length>1){
                  var at=order.indexOf(cur), nxt=order[(at+1+order.length)%order.length];
                  if(nxt&&nxt!==cur){
                    /* the needle is about to sit on the new station, and the takeover that
                       normally follows would reload it mid-broadcast: it is told this one is
                       already handled, so the song keeps its own beginning */
                    clearTimeout(tuneLoadTimer); tuneQueuedId=nxt;
                    bandId=nxt; tuneLoad(nxt,true); parkDial(nxt); handover();
                  }
                  else { ytPlayer.seekTo(0,true); ytPlayer.playVideo(); }
                } else { ytPlayer.seekTo(0,true); ytPlayer.playVideo(); }
              }catch(e){}
            }
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
  var quietHandover=false,handTimer=null,unmuteArmed=false;
  function armUnmute(){
    if(unmuteArmed)return;unmuteArmed=true;
    var evs=['pointerdown','keydown','touchstart','wheel'];
    var lift=function(){
      unmuteArmed=false;evs.forEach(function(ev){window.removeEventListener(ev,lift,true);});
      try{ytPlayer.unMute();ytPlayer.playVideo();}catch(e){}
      quietHandover=false;tuneAudio();
    };
    evs.forEach(function(ev){window.addEventListener(ev,lift,true);});
  }
  function handover(){
    /* the visitor asked for none of this, so the browser may refuse to start it. it is asked
       plainly a few times, then started silently and lifted at the next touch — never hiss */
    var tries=0;quietHandover=true;setStatic(0);
    clearInterval(handTimer);
    handTimer=setInterval(function(){
      if(!radioPlaying){clearInterval(handTimer);quietHandover=false;return;}
      var st=-9;try{st=ytPlayer.getPlayerState();}catch(e){}
      if(st===1){clearInterval(handTimer);return;}
      tries++;
      try{ytPlayer.playVideo();}catch(e){}
      if(tries===3){try{ytPlayer.mute();ytPlayer.playVideo();}catch(e){}armUnmute();}
      if(tries>8)clearInterval(handTimer);
    },400);
  }
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
  function tuneLoad(id,fromStart){
    /* single-video load: a station can only ever play its own song. tuning into one lands
       mid-broadcast, the way a real set does; a song handed to you when the last one ended
       starts at its beginning, because nothing was missed */
    pendingSeek=fromStart?null:id;
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
      setStatic(quietHandover?0:(1-(muteHold?0:v)));
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
    try{ if(radioPlaying&&ytPlayer&&ytPlayer.playVideo){ ytPlayer.unMute(); ytPlayer.playVideo(); } }catch(e){}
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
      }else{
        /* the faintest detent: a needle that has all but landed is drawn the last hair in,
           and anywhere else it is left exactly where it stopped */
        var st=nearestStation(dialNx);
        if(st&&st.d<tuneZone()*0.22){bandId=st.id;parkDial(st.id);}
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
    radioPlaying=false;clearInterval(startGuard);
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
  var startGuard=null;
  function guardPlayback(){
    clearInterval(startGuard);
    startGuard=setInterval(function(){
      if(!radioPlaying||fieldMode!=='radio'){clearInterval(startGuard);return;}
      var st=-9;try{st=ytPlayer.getPlayerState();}catch(e){return;}
      /* unstarted, cued or paused while the set is on: nudge it, carrying the visitor's activation */
      if(st===-1||st===5||st===2){try{ytPlayer.unMute();ytPlayer.playVideo();}catch(e){}}
    },900);
  }
  var silentWatch=null;
  function watchForSilence(){
    clearTimeout(silentWatch);
    silentWatch=setTimeout(function(){
      if(!radioPlaying||fieldMode!=='radio')return;
      var cur=currentVid(), vol=0;
      try{ vol=ytPlayer.getVolume(); }catch(e){}
      if(cur&&(vol<5||muteHold)){
        /* the needle never landed, or the hold never lifted: put it on the station that is
           already playing, so a song is heard instead of the hiss between stations */
        muteHold=false;
        if(bandTicks[cur])parkDial(cur);
        try{ ytPlayer.unMute(); ytPlayer.playVideo(); }catch(e){}
        rampMusic(1,350); setStatic(0);
      }
    },2600);
  }
  function goRadio(){
    sealNow(); /* the band needs the paper clear at once — no choreography */
    fieldMode='radio';
    armRadio();
    if(ytReady)startPlayback();
    radioBtn.setAttribute('aria-pressed','true');
    updateModeClass();
    paintDial();tuneAudio();watchForSilence();guardPlayback();
    updateBrand();
  }
  app.querySelector('#me-btnview').addEventListener('click', function(e){
    if(e.detail>1)return; /* a double-click is one gesture */
    if(cap.state==='open'||cap.state==='opening')sealCapsule();else goFilm();
  });
  radioBtn.addEventListener('click', function(){
    /* the click itself wakes the player: Safari only grants sound to playback that a
       visitor started, and every later step is asynchronous and no longer counts */
    try{ if(ytPlayer&&ytPlayer.playVideo){ ytPlayer.unMute(); ytPlayer.playVideo(); } }catch(e){}
    if(currentView()==='radio')goDial();else goRadio();
  });
  /* the title stands where the radio word stood — it answers the same way */
  musicEl.addEventListener('click', function(){
    /* the click itself wakes the player: Safari only grants sound to playback that a
       visitor started, and every later step is asynchronous and no longer counts */
    try{ if(ytPlayer&&ytPlayer.playVideo){ ytPlayer.unMute(); ytPlayer.playVideo(); } }catch(e){}
    if(currentView()==='radio')goDial();else goRadio();
  });
  app.querySelector('#me-btnabout').addEventListener('click', function(){ openAboutScreen(); });
  app.querySelector('#me-stop').addEventListener('click', stopRadio);
  brandEl.addEventListener('click', function(){ /* the mark closes whatever is open, then says why */
    if(fieldMode==='radio'){goDial();return;}
    if(cap.state==='open'||cap.state==='opening')sealCapsule();
    openNote();
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

  /* ── the note ─────────────────────────────────────────────────── */
  function noteText(){
    var n=(typeof PROJECTS!=='undefined'&&PROJECTS&&PROJECTS.length)?PROJECTS.length:0;
    return NOTE_TEXT.replace('{n}',n||'ten'); /* the count is the list itself, so the line stays true */
  }
  function closeNote(){
    var ov=document.getElementById('me-note');if(!ov)return;
    ov.classList.add('closing');app.classList.remove('noting');setTimeout(function(){if(ov.parentNode)ov.remove();},150);
  }
  function openNote(){
    if(document.getElementById('me-note'))return;
    var ov=document.createElement('div');ov.id='me-note';
    ov.innerHTML='<div class="n">'+noteText().split('\n\n').map(function(t){return '<p>'+esc(t)+'</p>';}).join('')+'</div>';
    document.body.appendChild(ov);app.classList.add('noting');
    ov.addEventListener('click',closeNote); /* anywhere: the note is not a page, it is a breath */
  }
  function openAboutScreen(){
    if(document.getElementById('me-about-screen')) return;
    var ov=document.createElement('div'); ov.id='me-about-screen';
    ov.innerHTML='<div class="txt">'+buildAboutHTML()+'</div>';
    document.body.appendChild(ov);app.classList.add('noting');
    /* it lies over the page and a click anywhere puts it away, exactly like the note */
    function closeAbout(){
      ov.classList.add('closing');app.classList.remove('noting');
      setTimeout(function(){if(ov.parentNode)ov.remove();},150);
    }
    ov.addEventListener('click', function(e){ if(e.target.tagName!=='A') closeAbout(); });
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
    if(document.getElementById('me-note')){closeNote();return;}
    if(about){about.classList.add('closing');app.classList.remove('noting');setTimeout(function(){if(about.parentNode)about.remove();},150);return;}
    if(pl.classList.contains('show'))closePlayer();
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
