/* Offline, touch-first navigation. Project copy follows the approved banners. */
(() => {
  'use strict';
  const projects = {
    mahaweli: {
      title:'Upper Mahaweli', kicker:'Integrated watershed planning', accent:'#237457',
      image:'assets/mahaweli.jpg', alt:'Illustrative reservoir surrounded by forested highland ridges', caption:'Land, water and people',
      summary:'Connecting land, water and people through evidence-informed watershed planning.',
      note:'Geospatial assessment · Field investigations · Stakeholder engagement',
      topics:[
        ['Land','Conserving the watershed','Soil and water conservation, forest and vegetation management, and agricultural land improvement inform watershed plans.'],
        ['Water','Protecting water resources','Stream and riparian protection connect upstream land management with downstream water needs.'],
        ['People','Planning with communities','Stakeholder engagement brings local knowledge into watershed planning and livelihood strengthening.']
      ]
    },
    knuckles: {
      title:'Knuckles Mountain Range', kicker:'Water science for climate resilience', accent:'#087c91',
      image:'assets/knuckles.jpg', alt:'Forested ridges of the Knuckles Mountain Range', caption:'IWMI’s hydrological contribution',
      summary:'Understanding water and climate to inform planning and strengthen practical skills.',
      note:'Scientific evidence for resilient farming and plantation communities.',
      topics:[
        ['Evidence','Understand water and climate','Assess water resources and demand, and examine future flood and drought risks.'],
        ['Planning','Inform watershed planning','Map water and sediment connections and provide scientific evidence for planning.'],
        ['Capacity','Strengthen skills and learning','Build practical skills, share tools, and support monitoring and adaptive management.']
      ]
    },
    restoration: {
      title:'Upper Watershed Restoration', kicker:'Hydrological science for restoration planning', accent:'#a65c13',
      image:'assets/uma-oya.jpg', alt:'Cultivated highland slopes and a stream in the Uma Oya study landscape', caption:'Uma Oya study',
      summary:'Assessing watershed pressures and comparing options to inform restoration for water security.',
      note:'Sri Lanka Upper Watershed Ecological Restoration · IWMI hydrological study',
      topics:[
        ['Sediment','Erosion and sediment','Map soil loss and sediment sources to understand pressures on the watershed.'],
        ['Water','Water flows and quality','Assess seasonal flows and water quality to understand how the watershed functions.'],
        ['Climate','Future climate','Model changes in flows and erosion under future climate conditions.'],
        ['Options','Restoration options','Compare conservation measures to provide evidence for restoration planning.']
      ]
    },
    model: {
      title:'Sri Lanka in 3D', kicker:'Highlands · Rivers · Reservoirs', accent:'#286c96',
      image:'assets/terrain-model.jpg', alt:'Concept preview of the Sri Lanka terrain display on a transparent acrylic board, with blue rivers and water bodies', caption:'Display concept — illustrative preview',
      summary:'See how the island’s terrain connects highland catchments, rivers and major water bodies.',
      note:'Preview illustration; final fabrication and colour may vary.',
      topics:[
        ['Terrain','Read the landscape','Raised terrain reveals the central highlands and the lower plains. Heights are exaggerated to make the relief visible.'],
        ['Rivers','Follow the river network','Fine headwater branches join larger channels as the rivers drain towards the sea.'],
        ['Water bodies','Recognise tanks and reservoirs','Selected visible tanks and reservoirs are shown as flat water surfaces connected to the river network.']
      ]
    }
  };
  const toggle=document.getElementById('menu-toggle');
  const nav=document.getElementById('orbit-navigation');
  const dismiss=document.getElementById('menu-dismiss');
  const choices=[...nav.querySelectorAll('[data-project]')];
  const dialog=document.getElementById('detail-dialog');
  const tabs=document.getElementById('detail-tabs');
  let menuOpen=false, activeProject=null, lastChoice=null;
  function setMenu(open,returnFocus=true){
    menuOpen=open;
    document.body.classList.toggle('exploration-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close exploration menu':'Open exploration menu');
    nav.setAttribute('aria-hidden',String(!open));nav.inert=!open;
    dismiss.hidden=!open;nav.classList.toggle('is-open',open);
    if(!open&&returnFocus)toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click',()=>setMenu(!menuOpen));
  dismiss.addEventListener('click',()=>setMenu(false));
  document.addEventListener('pointerdown',event=>{
    if(menuOpen&&!dialog.open&&!document.getElementById('map-dialog').open&&!document.getElementById('adb-dialog').open&&!document.getElementById('riverkeeper-dialog')?.open&&!document.getElementById('adb-dashboard')?.open&&!document.getElementById('project-briefing')?.open&&!nav.contains(event.target)&&!toggle.contains(event.target)&&!event.target.closest('.exhibit-footer'))setMenu(false,false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menuOpen&&!dialog.open&&!document.getElementById('map-dialog').open&&!document.getElementById('adb-dialog').open&&!document.getElementById('riverkeeper-dialog')?.open&&!document.getElementById('adb-dashboard')?.open&&!document.getElementById('project-briefing')?.open){event.preventDefault();setMenu(false);}
  });
  toggle.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();setMenu(true);choices[0].focus({preventScroll:true});}
  });
  choices.forEach((choice,index)=>{
    choice.addEventListener('keydown',event=>{
      let next=null;
      if(event.key==='ArrowDown')next=(index+1)%choices.length;
      if(event.key==='ArrowUp')next=(index-1+choices.length)%choices.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=choices.length-1;
      if(next!==null){event.preventDefault();choices[next].focus({preventScroll:true});}
    });
    choice.addEventListener('click',()=>openProject(choice.dataset.project,choice));
  });
  const text=(id,value)=>{document.getElementById(id).textContent=value;};
  function selectTopic(index,focus=false){
    const topic=projects[activeProject].topics[index];
    [...tabs.children].forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
    text('detail-topic',topic[1]);text('detail-text',topic[2]);
    document.getElementById('detail-panel').setAttribute('aria-labelledby','detail-tab-'+index);
    if(focus)tabs.children[index].focus({preventScroll:true});
  }
  function openProject(key,trigger){
    if(['mahaweli','knuckles','riverkeeper'].includes(key)){window.openProjectBriefing(key,trigger);return;}
    if((key==='mahaweli'||key==='knuckles')&&window.openStudyExplorer){window.openStudyExplorer(key,trigger);return;}
    if(key==='dashboard'){window.openADBDashboard(trigger);return;}
    if(key==='restoration'){window.openADBExplorer(trigger);return;}
    if(key==='model'){window.openTerrainExplorer(trigger);return;}
    if(key==='riverkeeper'){window.openRiverkeeper(trigger);return;}
    const p=projects[key];if(!p)return;
    activeProject=key;lastChoice=trigger;dialog.dataset.project=key;
    dialog.style.setProperty('--detail-accent',p.accent);
    text('detail-title',p.title);text('detail-kicker',p.kicker);text('detail-summary',p.summary);text('detail-note',p.note);text('detail-caption',p.caption);
    const img=document.getElementById('detail-image');img.src=p.image;img.alt=p.alt;
    tabs.replaceChildren();
    p.topics.forEach((topic,index)=>{
      const tab=document.createElement('button');tab.type='button';tab.id='detail-tab-'+index;tab.textContent=topic[0];tab.setAttribute('role','tab');tab.setAttribute('aria-controls','detail-panel');
      tab.addEventListener('click',()=>selectTopic(index));
      tab.addEventListener('keydown',event=>{
        let next=null;if(event.key==='ArrowRight')next=(index+1)%p.topics.length;if(event.key==='ArrowLeft')next=(index-1+p.topics.length)%p.topics.length;
        if(event.key==='Home')next=0;if(event.key==='End')next=p.topics.length-1;
        if(next!==null){event.preventDefault();selectTopic(next,true);}
      });tabs.append(tab);
    });
    selectTopic(0);document.body.classList.add('detail-open');
    dialog.showModal();dialog.scrollTop=0;
    window.dispatchEvent(new Event('exhibit-detail-change'));
    document.getElementById('close-detail').focus({preventScroll:true});
  }
  document.getElementById('close-detail').addEventListener('click',()=>dialog.close());
  document.getElementById('back-menu').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('detail-open');window.dispatchEvent(new Event('exhibit-detail-change'));if(lastChoice)lastChoice.focus({preventScroll:true});});
})();
