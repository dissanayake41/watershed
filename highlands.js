(() => {
'use strict';
const d=document.createElement('dialog');d.id='highlands-dialog';d.setAttribute('aria-labelledby','hl-title');document.body.append(d);
let trigger;
const sources=[
 ['UNESCO · Central Highlands of Sri Lanka','https://whc.unesco.org/en/list/1203/','Highland landscapes, endemic biodiversity and conservation pressures.'],
 ['IWMI · Upper Watershed Ecological Restoration','https://www.iwmi.org/projects/hydrological-study-for-the-sri-lanka-upper-watershed-ecological-restoration-program/','Water services, erosion, sedimentation, hydropower and restoration planning.'],
 ['Government of Sri Lanka / World Bank · IWWRMP (2019)','https://documents1.worldbank.org/curated/en/732431568127131498/pdf/Sri-Lanka-Integrated-Watershed-and-Water-Resources-Management-Project-Environmental-and-Social-Management-Framework-and-Resettlement-Policy-Framework-Executive-Summary.pdf','Pages 1–4: upstream–downstream connections, livelihoods, land-use pressures and watershed protection.'],
 ['Green Climate Fund · Knuckles FP124','https://www.greenclimate.fund/portfolio/projects/fp124','Farming and plantation communities, downstream irrigation and climate resilience.']
];
const connections=[
 ['People & livelihoods','Drinking water for communities; water for businesses and jobs.','assets/kn-field.jpg','people'],
 ['Food & farming','Irrigation, food crops and plantations depend on reliable water.','assets/uma-oya.jpg','food'],
 ['Electricity','Rivers and reservoirs supply water for hydropower generation.','assets/um-hero.jpg','power'],
 ['Nature','Mountain forests and grasslands shelter rare and endemic species.','assets/kn-hero.jpg','nature']
];
const responses=[
 ['Soil loss & sediment','Keep slopes covered and target erosion hotspots.'],
 ['Water pollution','Protect stream margins; manage waste and wastewater.'],
 ['Habitat loss','Conserve native forests, grasslands and biodiversity.'],
 ['Drought & floods','Plan for climate risks; monitor water and prepare.']
];
function draw(){d.innerHTML=`<div class="hl-shell">
 <header class="hl-brand"><img src="assets/iwmi.svg" alt="International Water Management Institute"><img src="assets/cgiar.svg" alt="CGIAR"><button id="hl-close">← Back</button></header>
 <section class="hl-hero"><img src="assets/kn-hero.jpg" alt="Knuckles mountain ridges"><div class="hl-hero-shade"></div><div class="hl-hero-copy"><span class="hl-kicker">A NATIONAL LIFELINE</span><h1 id="hl-title">Sri Lanka’s highlands</h1><p>Where the land rises,<br>the nation’s water story begins.</p></div></section>
 <main class="hl-main">
  <p class="hl-intro">Our central mountains and upper catchments feed rivers that connect hill communities with farms, towns and reservoirs downstream.</p>
  <section class="hl-connections" aria-labelledby="hl-importance"><div class="hl-map"><span class="hl-kicker">FROM HILLS TO LOWLANDS</span><img src="assets/highlands-terrain.png" alt="Sri Lanka terrain map showing the central highlands in deeper teal and gold"><span class="hl-map-caption">Sri Lanka · elevation relief</span></div>
   <div class="hl-dependencies"><h2 id="hl-importance">Why they matter</h2><div class="hl-connection-list">${connections.map(c=>`<article class="hl-connection hl-${c[3]}"><div class="hl-round-photo"><img src="${c[2]}" alt=""></div><div><h3>${c[0]}</h3><p>${c[1]}</p></div></article>`).join('')}</div></div>
  </section>
  <section class="hl-protection" aria-labelledby="hl-protect-title"><div class="hl-section-title"><span class="hl-kicker">PROTECT THE SOURCE</span><h2 id="hl-protect-title">Healthy hills. A stronger nation.</h2></div><div class="hl-column-heads"><span>WHAT THREATENS THEM</span><span>HOW WE PROTECT THEM</span></div><div class="hl-response-list">${responses.map((r,i)=>`<div class="hl-response hl-response-${i}"><h3>${r[0]}</h3><span aria-hidden="true">→</span><p>${r[1]}</p></div>`).join('')}</div></section>
 </main>
 <footer class="hl-footer"><div><strong>Water. Food. Energy. Livelihoods.</strong><span>Protecting the highlands benefits us all.</span></div><button id="hl-sources">Sources ↗</button></footer>
</div>`;d.querySelector('#hl-close').onclick=()=>d.close();d.querySelector('#hl-sources').onclick=e=>showSources(e.currentTarget);}
function showSources(back){const s=document.createElement('dialog');s.className='hl-source-dialog';s.setAttribute('aria-label','Sources and map notes');s.innerHTML=`<header><h2>Sources & map notes</h2><button>Close ×</button></header><p>This one-page summary draws on the published sources below and the revised Knuckles inception report (April 2026, pp. 6–7).</p><ol>${sources.map(x=>`<li><a href="${x[1]}" target="_blank" rel="noopener noreferrer">${x[0]} ↗</a><p>${x[2]}</p></li>`).join('')}</ol><h3>About the map & photographs</h3><p>The map uses the exhibition’s SRTM-derived terrain and original, smoothed elevation values. Colours indicate elevation, not vegetation or official highland boundaries. Photographs are retained from the project exhibition assets.</p><p>Protection actions are general priorities to adapt to local conditions. They are not claims that IWMI has implemented these measures.</p>`;document.body.append(s);s.showModal();s.querySelector('button').onclick=()=>s.close();s.onclose=()=>{s.remove();back?.focus({preventScroll:true});};}
window.openHighlands=t=>{trigger=t||document.querySelector('[data-project="highlands"]');draw();if(!d.open)d.showModal();document.body.classList.add('detail-open');window.dispatchEvent(new Event('exhibit-detail-change'));d.querySelector('#hl-close').focus();};
d.onclose=()=>{if(!document.querySelector('dialog[open]')){document.body.classList.remove('detail-open');trigger?.focus({preventScroll:true});}window.dispatchEvent(new Event('exhibit-detail-change'));};
window.addEventListener('message',e=>{if(e.source===parent&&e.data==='iwmi-open-highlands')window.openHighlands();});
})();

