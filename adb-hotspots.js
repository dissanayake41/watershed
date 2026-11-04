/* Pixel-accurate shared-hotspot display from the final 30 m classified raster. */
(() => {
 'use strict';
 const d=ADB_HOTSPOT, raster='assets/adb-shared-hotspots-v27.png';
 const s=Math.min(700/d.width,720/d.height),ox=(800-d.width*s)/2,oy=(800-d.height*s)/2;
 const image=new Image(),mask=document.createElement('canvas');mask.width=d.width;mask.height=d.height;
 const ctx=mask.getContext('2d',{willReadFrequently:true});let ready=false;
 image.onload=()=>{ctx.drawImage(image,0,0);ready=true;};image.src=raster;
 function markup(expanded=false){return `<div class="dash-hotspot-figure" data-expanded="${expanded}"><div class="hotspot-stage"><svg viewBox="0 0 800 800" role="img" aria-label="Actual shared soil-loss and sediment-delivery hotspots in Uma Oya. Orange shows 30 metre cells in both hotspot groups; pale green shows other analysed land. Tap the map for a location's category."><g class="hotspot-view"><g transform="translate(${ox} ${oy}) scale(${s})"><path class="hotspot-boundary" d="${d.boundary}" fill="#c8d3d8" fill-rule="evenodd"/><image href="${raster}" width="${d.width}" height="${d.height}"/><path d="${d.boundary}" fill="none" stroke="#28537d" stroke-width="3" vector-effect="non-scaling-stroke"/></g><circle class="hotspot-marker" r="9" fill="none" stroke="#28537d" stroke-width="3" visibility="hidden"/></g><g class="hotspot-north"><text x="750" y="45" text-anchor="middle">N</text><text x="750" y="82" text-anchor="middle">↑</text></g></svg><div class="hotspot-scale"><span class="hotspot-scale-line" style="width:${5000/30*s/8}%"></span><small>5 km</small></div></div><div class="hotspot-key"><span><i style="background:#e86933"></i>Shared hotspots</span><span><i style="background:#ddede3"></i>Other analysed land</span><span><i style="background:#c8d3d8"></i>Excluded areas</span></div>${expanded?'<div class="hotspot-tools"><button type="button" data-hotspot-zoom="1" aria-label="Zoom hotspot map in">+</button><button type="button" data-hotspot-zoom="-1" aria-label="Zoom hotspot map out">−</button><button type="button" data-hotspot-zoom="0">Reset</button><span>Drag to move · Pinch to zoom</span></div>':'<div class="dash-touch-hint"><span>Actual 30 m locations</span><button type="button" data-hotspot-enlarge>Explore hotspot map ↗</button></div>'}<p class="hotspot-readout" aria-live="polite">${expanded?'Tap a location to identify its category.':'Touch the map to identify a location.'}</p></div>`;}
 function bind(root,onEnlarge){root.querySelectorAll('.dash-hotspot-figure').forEach(fig=>{
  const svg=fig.querySelector('svg'),g=fig.querySelector('.hotspot-view'),boundary=fig.querySelector('.hotspot-boundary'),marker=fig.querySelector('.hotspot-marker'),readout=fig.querySelector('.hotspot-readout');
  const expanded=fig.dataset.expanded==='true';let z=1,x=0,y=0,gesture=null,moved=false;const pointers=new Map();
  const point=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
  const draw=()=>{g.setAttribute('transform',`translate(${400+x} ${400+y}) scale(${z}) translate(-400 -400)`);fig.querySelector('.hotspot-scale').hidden=z!==1;};
  function identify(e){if(!ready){readout.textContent='Map loading. Please tap again.';return;}const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const map=p.matrixTransform(g.getScreenCTM().inverse()),rx=(map.x-ox)/s,ry=(map.y-oy)/s;
   if(rx<0||ry<0||rx>=d.width||ry>=d.height){readout.textContent='Outside the mapped study area.';marker.setAttribute('visibility','hidden');return;}
   const rgba=ctx.getImageData(Math.floor(rx),Math.floor(ry),1,1).data;
   if(rgba[3]&&rgba[0]===232){readout.textContent='Shared hotspot · high soil loss and high sediment delivery coincide.';}
   else if(rgba[3])readout.textContent='Other analysed land · outside the shared hotspot group.';
   else{const local=svg.createSVGPoint();local.x=rx;local.y=ry;readout.textContent=boundary.isPointInFill(local)?'Excluded area · no matched model result.':'Outside the mapped study area.';}
   marker.setAttribute('cx',map.x);marker.setAttribute('cy',map.y);marker.setAttribute('visibility','visible');
  }
  function begin(){const a=[...pointers.values()];if(a.length>=2)gesture={distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z};else if(a.length===1)gesture={point:a[0],x,y};else gesture=null;}
  svg.onpointerdown=e=>{pointers.set(e.pointerId,point(e));moved=false;svg.setPointerCapture(e.pointerId);begin();};
  svg.onpointermove=e=>{if(!pointers.has(e.pointerId))return;const p=point(e);pointers.set(e.pointerId,p);const a=[...pointers.values()];if(expanded&&a.length>=2&&gesture?.distance){moved=true;z=Math.max(1,Math.min(6,gesture.z*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/gesture.distance));draw();}else if(gesture?.point){const dx=p.x-gesture.point.x,dy=p.y-gesture.point.y;if(Math.abs(dx)+Math.abs(dy)>7)moved=true;if(moved&&expanded&&z>1){x=gesture.x+dx;y=gesture.y+dy;draw();}}};
  svg.onpointerup=e=>{if(!moved&&pointers.size===1)identify(e);pointers.delete(e.pointerId);begin();};svg.onpointercancel=e=>{pointers.delete(e.pointerId);begin();};
  fig.querySelectorAll('[data-hotspot-zoom]').forEach(b=>b.onclick=()=>{const n=+b.dataset.hotspotZoom;if(!n){z=1;x=y=0;}else z=Math.max(1,Math.min(6,z*(n>0?1.5:1/1.5)));draw();});
  const button=fig.querySelector('[data-hotspot-enlarge]');if(button)button.onclick=()=>onEnlarge(button);
 });}
 window.ADBHotspots={markup,bind};
})();
