/* Riverkeeper film and learning content, based on the supplied film and game documentation. */
(() => {
 'use strict';
 const chapters=[{time:0,title:'Our shared river'},{time:103.5,title:'Meet Riverkeeper'},{time:131.5,title:'How to play'}];
 const themes=[
  {label:'Share water',title:'Keep the river connected.',image:'assets/riverkeeper-water.jpg',text:'Consider the needs of communities, farms, industry and river ecosystems. Water decisions upstream shape what remains available downstream.'},
  {label:'Plan development',title:'Build a balanced basin.',image:'assets/riverkeeper-development.jpg',text:'Compare development choices, their costs and their effects on water, food, energy and nature. Location and resource limits matter.'},
  {label:'Learn & adapt',title:'Read the results. Refine your choices.',image:'assets/riverkeeper-results.jpg',text:'Review each month’s benefits, pressures and resource changes. Use what you learn to adapt your next decision across a 24-month campaign.'}
 ];
 const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>';
 const pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
 const dialog=document.createElement('dialog');dialog.id='riverkeeper-dialog';dialog.setAttribute('aria-labelledby','rk-title');
 dialog.innerHTML=`<div class="rk-shell">
 <header class="rk-brand"><img src="assets/iwmi.svg" alt="IWMI — International Water Management Institute"><img src="assets/cgiar.svg" alt="CGIAR"><span>Riverkeeper</span><button class="rk-close" id="rk-close" type="button" aria-label="Close Riverkeeper">×</button></header>
 <div class="rk-body">
  <header class="rk-intro"><span class="rk-eyebrow">LEARN THROUGH PLAY</span><h1 id="rk-title">Riverkeeper</h1><p>One river. Many lives. Your decisions.<br>Practise managing the Mahaweli River Basin.</p></header>
  <section class="rk-player" aria-label="Riverkeeper film player">
   <div class="rk-film-stage" id="rk-film-stage"><video id="rk-film" playsinline preload="none" poster="assets/riverkeeper-poster.jpg" aria-label="Riverkeeper — Managing Mahaweli River Basin"><track kind="captions" srclang="en" label="English" default></video><button type="button" class="rk-film-overlay" id="rk-overlay" aria-label="Play Riverkeeper film">${playIcon}<span>Watch the film · 4:49</span></button></div>
   <div class="rk-video-controls"><button id="rk-play" type="button" aria-label="Play film">${playIcon}<span>Play film</span></button><time id="rk-time">0:00 / 4:49</time><button id="rk-mute" type="button" aria-label="Mute film" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4ZM15 8q6 4 0 8m3-11q9 7 0 14"/></svg><span>Sound</span></button><button id="rk-captions" class="rk-cc" type="button" aria-label="Hide English captions" aria-pressed="true">CC</button><button id="rk-fullscreen" type="button" aria-label="View film full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6"/></svg></button></div>
   <label class="rk-seek-label"><span>Seek</span><input id="rk-seek" type="range" min="0" max="289.03" value="0" step="0.1" aria-label="Film position" aria-valuetext="0 minutes 0 seconds"></label><p class="rk-video-notice" id="rk-notice" role="status"></p>
  </section>
  <nav class="rk-chapters" aria-label="Jump to a film chapter">${chapters.map((c,i)=>`<button type="button" data-rk-chapter="${i}" aria-pressed="${i===0}"><time>${Math.floor(c.time/60)}:${String(Math.floor(c.time%60)).padStart(2,'0')}</time><strong>${c.title}</strong></button>`).join('')}</nav>
  <section class="rk-learn" aria-labelledby="rk-learn-title"><h2 id="rk-learn-title">Every choice travels downstream.</h2><div class="rk-themes" role="tablist" aria-label="Explore Riverkeeper decisions">${themes.map((t,i)=>`<button type="button" id="rk-theme-${i}" role="tab" data-rk-theme="${i}" aria-selected="${i===0}" aria-controls="rk-theme-panel" tabindex="${i===0?0:-1}">${t.label}</button>`).join('')}</div><div class="rk-theme-panel" id="rk-theme-panel" role="tabpanel" aria-labelledby="rk-theme-0"></div></section>
  <p class="rk-context">An educational simulation for exploring choices and consequences; game outcomes are not forecasts for the Mahaweli.</p>
 </div><footer class="rk-footer"><p>Put your ideas into practice.<small>The game opens in a new tab.</small></p><a id="rk-game-link" class="rk-play-link" href="https://dissanayake41.github.io/riverkeeper-play/" target="_blank" rel="noopener">Play Riverkeeper <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a></footer></div>`;
 document.body.append(dialog);
 const video=dialog.querySelector('#rk-film'),track=video.querySelector('track'),overlay=dialog.querySelector('#rk-overlay'),play=dialog.querySelector('#rk-play'),seek=dialog.querySelector('#rk-seek'),notice=dialog.querySelector('#rk-notice');
 let trigger=null,loaded=false,captions=true,pendingSeek=null,wantsPlay=false,playerReady=null,resolveReady=null;
 const fmt=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
 function attachMedia(){
  if(loaded)return;
  loaded=true;playerReady=new Promise(resolve=>resolveReady=resolve);
  video.src='assets/riverkeeper-film.mp4';track.src='assets/riverkeeper-en.vtt';video.preload='metadata';video.load();
 }
 async function start(time){
  attachMedia();if(typeof time==='number')pendingSeek=time;wantsPlay=true;notice.textContent='';
  if(video.readyState===0)notice.textContent='Loading the film…';
  try{
   if(video.readyState===0)await playerReady;
   if(!dialog.open||!wantsPlay)return;
   if(pendingSeek!==null){video.currentTime=Math.min(pendingSeek,video.duration||289.03);pendingSeek=null;}
   await video.play();notice.textContent='';
  }catch(e){if(e.name!=='AbortError')notice.textContent='Touch Play film to continue. If the connection is slow, allow a moment for the video to load.';}
 }
 function sync(){
  const playing=!video.paused&&!video.ended;
  play.innerHTML=(playing?pauseIcon:playIcon)+`<span>${playing?'Pause':'Play film'}</span>`;
  play.setAttribute('aria-label',playing?'Pause film':'Play film');overlay.hidden=playing;
  const at=video.currentTime||0,dur=Number.isFinite(video.duration)?video.duration:289.03;
  seek.max=dur;seek.value=at;seek.setAttribute('aria-valuetext',`${Math.floor(at/60)} minutes ${Math.floor(at%60)} seconds`);
  dialog.querySelector('#rk-time').textContent=fmt(at)+' / '+fmt(dur);
  const current=at>=chapters[2].time?2:at>=chapters[1].time?1:0;
  dialog.querySelectorAll('[data-rk-chapter]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
 }
 function setTheme(index,focus=false){
  dialog.querySelectorAll('[data-rk-theme]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
  const t=themes[index],p=dialog.querySelector('#rk-theme-panel');p.setAttribute('aria-labelledby','rk-theme-'+index);p.innerHTML=`<img src="${t.image}" alt="Riverkeeper gameplay: ${t.label}"><div><h3>${t.title}</h3><p>${t.text}</p></div>`;
  if(focus)dialog.querySelector('#rk-theme-'+index).focus();
 }
 video.addEventListener('loadedmetadata',()=>{if(resolveReady){resolveReady();resolveReady=null;}video.textTracks[0].mode=captions?'showing':'hidden';sync();});
 video.addEventListener('error',()=>{notice.textContent='The film could not load. Check the connection and reopen Riverkeeper to try again.';if(resolveReady){resolveReady();resolveReady=null;}wantsPlay=false;});
 ['play','pause','timeupdate','ended','durationchange'].forEach(event=>video.addEventListener(event,sync));
 video.addEventListener('playing',()=>notice.textContent='');
 overlay.addEventListener('click',()=>start());
 play.addEventListener('click',()=>{if(video.paused)start();else{wantsPlay=false;video.pause();}});
 seek.addEventListener('input',()=>{attachMedia();if(video.readyState)video.currentTime=Number(seek.value);else pendingSeek=Number(seek.value);});
 seek.addEventListener('change',()=>{if(pendingSeek!==null)start(pendingSeek);});
 dialog.querySelectorAll('[data-rk-chapter]').forEach((b,i)=>b.addEventListener('click',()=>start(chapters[i].time)));
 dialog.querySelector('#rk-mute').addEventListener('click',e=>{video.muted=!video.muted;e.currentTarget.setAttribute('aria-pressed',String(video.muted));e.currentTarget.setAttribute('aria-label',video.muted?'Unmute film':'Mute film');e.currentTarget.querySelector('span').textContent=video.muted?'Muted':'Sound';});
 dialog.querySelector('#rk-captions').addEventListener('click',e=>{captions=!captions;if(video.textTracks[0])video.textTracks[0].mode=captions?'showing':'hidden';e.currentTarget.setAttribute('aria-pressed',String(captions));e.currentTarget.setAttribute('aria-label',captions?'Hide English captions':'Show English captions');});
 dialog.querySelector('#rk-fullscreen').addEventListener('click',async()=>{try{attachMedia();if(video.requestFullscreen)await video.requestFullscreen();else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();else notice.textContent='Use the browser’s full-screen option for a larger view.';}catch(e){notice.textContent='Full screen is unavailable in this browser.';}});
 dialog.querySelectorAll('[data-rk-theme]').forEach((b,i)=>{b.addEventListener('click',()=>setTheme(i));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%themes.length;if(e.key==='ArrowLeft')n=(i+themes.length-1)%themes.length;if(e.key==='Home')n=0;if(e.key==='End')n=themes.length-1;if(n!==undefined){e.preventDefault();setTheme(n,true);}});});
 function close(){dialog.close();}
 dialog.querySelector('#rk-close').addEventListener('click',close);
 dialog.querySelector('#rk-game-link').addEventListener('click',()=>{wantsPlay=false;video.pause();});
 dialog.addEventListener('close',()=>{wantsPlay=false;video.pause();document.body.classList.remove('detail-open');window.dispatchEvent(new Event('exhibit-detail-change'));if(trigger)trigger.focus({preventScroll:true});});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){wantsPlay=false;video.pause();}});
 window.openRiverkeeper=source=>{
  trigger=source||document.getElementById('menu-toggle');setTheme(0);notice.textContent='';
  if(video.error){loaded=false;video.removeAttribute('src');video.load();}
  document.body.classList.add('detail-open');if(!dialog.open)dialog.showModal();dialog.querySelector('.rk-body').scrollTop=0;
  window.dispatchEvent(new Event('exhibit-detail-change'));dialog.querySelector('#rk-close').focus({preventScroll:true});sync();
 };
 window.addEventListener('message',e=>{if(e.source===parent&&e.data==='iwmi-open-riverkeeper')window.openRiverkeeper();});
 if(location.hash==='#riverkeeper')window.openRiverkeeper();
})();
