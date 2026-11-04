/* One integrated image-to-video landscape. No synthetic weather overlays. */
(() => {
  const video=document.getElementById('landscape-film');
  const button=document.getElementById('motion');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused=reduced.matches;
  video.muted=true;
  // The bright landscape is prepared as a slow seamless loop at 30 fps.
  video.defaultPlaybackRate=1;
  video.playbackRate=1;
  function updateButton(){
    document.body.classList.toggle('motion-paused',userPaused);
    button.setAttribute('aria-pressed',String(userPaused));
    button.setAttribute('aria-label',userPaused?'Play landscape animation':'Pause landscape animation');
    button.querySelector('span').textContent=userPaused?'Play animation':'Pause animation';
    button.querySelector('path').setAttribute('d',userPaused?'M8 5l11 7-11 7Z':'M9 5v14m6-14v14');
  }
  function syncPlayback(){
    document.body.classList.toggle('page-hidden',document.hidden);
    if(userPaused||document.hidden||document.body.classList.contains('detail-open')){video.pause();return;}
    const attempt=video.play();
    if(attempt)attempt.catch(error=>{
      if(error.name==='AbortError')return;
      userPaused=true;updateButton();
      document.getElementById('status').textContent='Touch Play animation to start the landscape.';
    });
  }
  video.addEventListener('loadeddata',()=>{video.classList.add('is-ready');syncPlayback();});
  video.addEventListener('error',()=>{
    video.classList.remove('is-ready');userPaused=true;updateButton();
    document.getElementById('status').textContent='The landscape video could not load. The still image remains available.';
  });
  button.addEventListener('click',()=>{userPaused=!userPaused;updateButton();syncPlayback();});
  reduced.addEventListener('change',()=>{userPaused=reduced.matches;updateButton();syncPlayback();});
  document.addEventListener('visibilitychange',syncPlayback);
  window.addEventListener('exhibit-detail-change',syncPlayback);
  updateButton();if(video.readyState>=2)video.classList.add('is-ready');syncPlayback();
})();
