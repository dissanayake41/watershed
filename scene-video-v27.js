/* Fully buffered, native-speed landscape. No live image filters or weather overlays. */
(() => {
  const video=document.getElementById('landscape-film');
  const button=document.getElementById('motion');
  const status=document.getElementById('status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const source='assets/watershed-motion-v25.mp4';
  let userPaused=reduced.matches, playbackBlocked=false, preparing=null, ready=false, destroyed=false;
  let ownedURL=null;
  video.muted=true;
  video.defaultPlaybackRate=video.playbackRate=1;
  const shouldPlay=()=>!destroyed&&!userPaused&&!playbackBlocked&&!document.hidden&&!document.body.classList.contains('detail-open');
  function updateButton(){
    document.body.classList.toggle('motion-paused',userPaused);
    const paused=userPaused||playbackBlocked;
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'Play landscape animation':'Pause landscape animation');
    button.querySelector('span').textContent=paused?'Play animation':'Pause animation';
    button.querySelector('path').setAttribute('d',paused?'M8 5l11 7-11 7Z':'M9 5v14m6-14v14');
  }
  function syncPlayback(){
    document.body.classList.toggle('page-hidden',document.hidden);
    if(!shouldPlay()){video.pause();return;}
    if(!ready)return;
    const attempt=video.play();
    if(attempt)attempt.catch(error=>{
      if(error.name==='AbortError')return;
      if(error.name==='NotAllowedError'){
        playbackBlocked=true;updateButton();
        status.textContent='Touch Play animation to start the landscape.';
      }
    });
  }
  async function prepare(){
    if(preparing)return preparing;
    preparing=(async()=>{
      status.textContent='Preparing landscape animation.';
      try{
        let url=source;
        // The portable offline edition already supplies a local Blob URL.
        if(!source.startsWith('blob:')){
          const response=await fetch(source,{cache:'force-cache'});
          if(!response.ok)throw new Error('Landscape download failed');
          const bytes=await response.blob();
          if(destroyed)return;
          ownedURL=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));
          url=ownedURL;
        }
        if(destroyed)return;
        video.src=url;ready=true;video.load();syncPlayback();
      }catch{
        playbackBlocked=true;updateButton();
        status.textContent='The landscape image is ready. Touch Play animation to retry the video.';
      }
    })().finally(()=>{preparing=null;});
    return preparing;
  }
  video.addEventListener('loadeddata',()=>{video.classList.add('is-ready');status.textContent='';syncPlayback();});
  video.addEventListener('playing',()=>{status.textContent='';});
  // Recover a browser-initiated pause without overriding a visitor's pause choice.
  video.addEventListener('pause',()=>{if(ready&&shouldPlay()&&!video.error)requestAnimationFrame(syncPlayback);});
  video.addEventListener('ended',()=>{if(shouldPlay()){video.currentTime=0;syncPlayback();}});
  video.addEventListener('error',()=>{
    ready=false;video.classList.remove('is-ready');playbackBlocked=true;updateButton();
    if(ownedURL){URL.revokeObjectURL(ownedURL);ownedURL=null;}
    status.textContent='The landscape image remains available. Touch Play animation to retry.';
  });
  button.addEventListener('click',()=>{
    if(userPaused||playbackBlocked){userPaused=false;playbackBlocked=false;}else userPaused=true;updateButton();
    if(!ready&&!userPaused)prepare();else syncPlayback();
  });
  reduced.addEventListener('change',()=>{userPaused=reduced.matches;updateButton();syncPlayback();});
  document.addEventListener('visibilitychange',syncPlayback);
  window.addEventListener('exhibit-detail-change',syncPlayback);
  window.addEventListener('pageshow',syncPlayback);
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    destroyed=true;video.pause();if(ownedURL)URL.revokeObjectURL(ownedURL);
  });
  updateButton();prepare();
})();
