/* Exhibition art direction. Approved scientific content stays in the study modules. */
(() => {
 const media={
  mahaweli:{short:'Upper Mahaweli',label:'Integrated watershed planning',title:'Upper<br>Mahaweli',image:'assets/um-hero.jpg',chapters:['assets/um-hero.jpg','assets/um_100-15.jpg','assets/um_090-42.jpg','assets/um_044-49.jpg','assets/um_044-32.jpg','assets/um_100-50.jpg']},
  knuckles:{short:'Knuckles',label:'Water science & climate resilience',title:'Knuckles<br>Mountain Range',image:'assets/kn-hero.jpg',chapters:['assets/kn-hero.jpg','assets/kn_report-11.jpg','assets/kn-field.jpg','assets/kn-structure.jpg','assets/kn-training-example.jpg','assets/kn-hero.jpg']},
  adb:{short:'Upper Watershed Restoration',label:'Hydrological science for restoration',title:'Upper Watershed<br>Restoration',image:'assets/uma-oya.jpg',chapters:['assets/uma-oya.jpg','assets/adb-final-22.jpg','assets/adb-final-24.jpg','assets/adb-final-6.jpg','assets/adb-final-30.jpg','assets/adb-final-20.jpg']}
 };
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const arrow='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 16h20m-8-8 8 8-8 8"/></svg>';
 let context=null;
 window.ExhibitionDesign={
  header({key,c,chapters,kicker}){
   const m=media[key], photo=(key==='knuckles'&&c===1)||(key==='adb'&&[2,3].includes(c))?m.image:m.chapters[c];return `<header class="ex-chapter-cover"><img src="${photo}" alt="" aria-hidden="true"><div class="ex-cover-shade"></div><div class="ex-chapter-copy"><p class="ex-caption">${escape(m.short)} <span> / </span> Chapter ${String(c+1).padStart(2,'0')}</p><h1>${chapters[c].title}</h1><div class="ex-six-lines" aria-hidden="true">${chapters.map((_,i)=>`<i class="${i<=c?'passed':''}"></i>`).join('')}</div></div><span class="ex-cover-index" aria-hidden="true">${String(c+1).padStart(2,'0')}</span></header>`;
  },
  overview(ctx){
   context=ctx;const {key,config,chapters,navigate}=ctx,m=media[key],body=document.querySelector('#adb-body'),bottom=document.querySelector('#adb-bottom');body.dataset.page='overview';
   body.innerHTML=`<section class="ex-project-cover"><img src="${m.image}" alt="${escape(config.heroAlt||'Project landscape')}"><div class="ex-project-shade"></div><div class="ex-project-label"><span class="ex-dot"></span>${m.label}</div><div class="ex-project-title"><h1>${m.title}</h1><p>${config.subtitle}</p></div><span class="ex-photo-caption">${key==='adb'?'IWMI project image':'IWMI project photograph'}</span></section><div class="ex-facts">${config.metrics.map(([n,l])=>`<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div><section class="ex-project-index"><header><div><span class="ex-eyebrow">EXPLORE THE PROJECT</span><h2>${config.overviewTitle}</h2></div><span class="ex-index-total">06 <small>chapters</small></span></header><p class="ex-index-deck">${config.overviewText}</p><nav class="ex-chapter-grid" aria-label="${escape(config.plainTitle)} chapters">${chapters.map((ch,i)=>`<button type="button" class="ex-chapter-item" data-chapter="${i}"><span class="ex-item-image"><img src="${m.chapters[i]}" alt=""><span>${String(i+1).padStart(2,'0')}</span></span><span class="ex-item-copy"><strong>${ch.title}</strong><small>${ch.topics.length} ${ch.topics.length===1?'topic':'topics'} ${arrow}</small></span></button>`).join('')}</nav></section>`;
   body.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>navigate(+b.dataset.chapter));
   bottom.innerHTML='<span class="ex-footer-note">Your route through the project<br><small>Select a chapter or follow the story.</small></span><button type="button" id="adb-start">Begin the story '+arrow+'</button>';
   document.getElementById('adb-start').onclick=()=>navigate(0);this.update({key,c:-1,t:0,chapters});
  },
  update({key,c,t,chapters}){
   const body=document.getElementById('adb-body');body.dataset.page=c<0?'overview':'topic';document.getElementById('adb-dialog').dataset.design='exhibition';
   document.getElementById('ex-current-project').textContent=media[key].short;
   document.querySelectorAll('[data-switch-study]').forEach(b=>b.setAttribute('aria-current',b.dataset.switchStudy===key));
   window.exhibitView={project:key,chapter:c,topic:t};
   if(c>=0){body.classList.remove('ex-enter');void body.offsetWidth;body.classList.add('ex-enter');}
  }
 };
 // A direct project switch keeps the visitor in the exhibit rather than returning
 // through the welcome animation between every project.
 const brand=document.querySelector('.adb-brand');
 brand.insertAdjacentHTML('beforeend','<button class="ex-switch-toggle" id="ex-project-toggle" type="button" aria-expanded="false" aria-controls="ex-project-switch"><span id="ex-current-project">Projects</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></button>');
 const shell=document.querySelector('.adb-shell');const switcher=document.createElement('nav');switcher.id='ex-project-switch';switcher.className='ex-project-switch';switcher.setAttribute('aria-label','Switch project');switcher.hidden=true;
 switcher.innerHTML='<p class="ex-eyebrow">THREE LANDSCAPES. CONNECTED BY WATER.</p>'+Object.entries(media).map(([key,m])=>`<button type="button" data-switch-study="${key}" aria-current="false"><img src="${m.image}" alt=""><span><b>${m.short}</b><small>${m.label}</small></span>${arrow}</button>`).join('');shell.append(switcher);
 const toggle=document.getElementById('ex-project-toggle');const closeSwitch=()=>{switcher.hidden=true;toggle.setAttribute('aria-expanded','false');};
 toggle.onclick=()=>{switcher.hidden=!switcher.hidden;toggle.setAttribute('aria-expanded',!switcher.hidden);};
 switcher.querySelectorAll('button').forEach(b=>b.onclick=()=>{closeSwitch();window.openStudyExplorer(b.dataset.switchStudy,document.querySelector('[data-project="'+(b.dataset.switchStudy==='adb'?'dashboard':b.dataset.switchStudy)+'"]'));});
 document.getElementById('adb-dialog').addEventListener('click',e=>{if(!switcher.hidden&&!switcher.contains(e.target)&&!toggle.contains(e.target))closeSwitch();});
 document.getElementById('adb-dialog').addEventListener('close',closeSwitch);
 document.getElementById('adb-dialog').addEventListener('keydown',e=>{if(e.key==='Escape'&&!switcher.hidden){e.preventDefault();closeSwitch();toggle.focus();}});
 // Semantic enhancements for the existing evidence: retain all prose, controls,
 // chart values and source notes while adding editorial spacing and identifiers.
 const observer=new MutationObserver(()=>{
  const content=document.querySelector('#adb-content');if(!content)return;
  content.querySelectorAll('.adb-flow>div').forEach((el,i)=>{if(!el.dataset.step)el.dataset.step=String(i+1).padStart(2,'0');});
  content.querySelectorAll('.adb-list').forEach(el=>el.classList.toggle('ex-two-column',el.children.length===4));
  const hasMap=!!content.querySelector('.adb-map'),hasChart=!!content.querySelector('.adb-chart');content.classList.toggle('ex-data-content',hasMap||hasChart);
 });observer.observe(document.querySelector('#adb-body'),{childList:true,subtree:true});
})();
