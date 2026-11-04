/* Local, on-demand 3D view of the V17 print model. No network dependencies. */
(() => {
  'use strict';
  const dialog=document.getElementById('map-dialog'),canvas=document.getElementById('terrain-canvas'),stage=document.getElementById('map-stage'),loading=document.getElementById('map-loading');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let initialized,renderer,scene,camera,controls,THREE,water,terrain,highlands,sea,cutawayFloor,landUniforms,waterUniforms,frame=0,opener,active=false,loaded=false;
  const state={ready:false,triangles:0,waterVisible:true,source:'Final V17 print geometry',verticalExaggeration:10,focus:'highlight',elevationSource:'Original unexaggerated DEM',sea:true};
  window.terrainExplorerState=state;
  const buttons=[...document.querySelectorAll('[data-map-view]')];
  const setViewActive=name=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapView===name)));
  const requestRender=()=>{if(active&&!frame&&loaded)frame=requestAnimationFrame(render);};
  function render(){frame=0;if(!active||!renderer)return;const changed=controls.update();renderer.render(scene,camera);state.camera=camera.position.toArray();state.target=controls.target.toArray();state.zoom=camera.zoom;
    const north=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion.clone().invert());
    document.getElementById('map-north').style.transform=`rotate(${Math.atan2(north.x,north.y)*180/Math.PI}deg)`;
    if(changed)requestRender();
  }
  function fit(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);const half=7.35;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();requestRender();}
  async function unpack(url){
    const response=await fetch(url);if(!response.ok)throw Error('Model data could not be loaded.');
    return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  async function loadMesh(url,elevationURL,material){
    const [raw,dem]=await Promise.all([unpack(url),unpack(elevationURL)]);
    const head=new DataView(raw);if(head.getUint32(0,true)!==0x44335749)throw Error('Invalid terrain file');
    const nv=head.getUint32(8,true),nf=head.getUint32(12,true),p=new Float32Array(raw,16,nv*3),indices=new Uint32Array(raw,16+nv*12,nf*3),elevations=new Float32Array(dem);
    if(elevations.length!==nv)throw Error('DEM attributes do not match the mesh');
    const geometry=new THREE.BufferGeometry(),points=new Float32Array(p.length),colors=material.vertexColors?new Float32Array(p.length):null;
    const stops=[[0,'#84995a'],[100,'#7e924f'],[300,'#5d854c'],[800,'#3d7047'],[1500,'#456747'],[2200,'#80805b'],[2700,'#a39b78']].map(([h,c])=>[h,new THREE.Color(c)]);
    for(let i=0;i<nv;i++){const k=i*3;points[k]=p[k]/100;points[k+1]=p[k+2]/100;points[k+2]=-p[k+1]/100;
      if(colors){const e=elevations[i];let band=0;while(band<stops.length-2&&e>stops[band+1][0])band++;
        const t=THREE.MathUtils.clamp((e-stops[band][0])/(stops[band+1][0]-stops[band][0]),0,1),c=stops[band][1].clone().lerp(stops[band+1][1],t);
        colors[k]=c.r;colors[k+1]=c.g;colors[k+2]=c.b;}}
    geometry.setAttribute('position',new THREE.BufferAttribute(points,3));geometry.setAttribute('realElevation',new THREE.BufferAttribute(elevations,1));geometry.setIndex(new THREE.BufferAttribute(indices,1));
    if(colors)geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingSphere();
    state.triangles+=nf;const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;mesh.castShadow=!!colors;return mesh;
  }
  const noiseGLSL=`
    float landscapeHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float landscapeNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(landscapeHash(i),landscapeHash(i+vec2(1,0)),f.x),mix(landscapeHash(i+vec2(0,1)),landscapeHash(i+vec2(1,1)),f.x),f.y);}
  `;
  function terrainShader(material,isWater=false){
    const uniforms={uFocus:{value:1},uGold:{value:new THREE.Color('#edc56c')}};
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,uniforms);
      shader.vertexShader='attribute float realElevation; varying float vActualElevation; varying vec3 vLandscapePosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvActualElevation=realElevation;vLandscapePosition=position;');
      shader.fragmentShader='varying float vActualElevation; varying vec3 vLandscapePosition; uniform float uFocus; uniform vec3 uGold;\n'+noiseGLSL+shader.fragmentShader;
      const effect=isWater?`
        if(uFocus>1.5 && vActualElevation<=300.0) discard;
      `:`
        if(uFocus>1.5 && vActualElevation<=300.0) discard;
        float grain=0.88+0.12*landscapeNoise(vLandscapePosition.xz*45.0)+0.06*landscapeNoise(vLandscapePosition.xz*150.0);
        diffuseColor.rgb*=grain;
        if(uFocus>0.5 && uFocus<1.5){
          float high=step(300.001,vActualElevation);
          float grey=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
          vec3 subdued=mix(diffuseColor.rgb,vec3(grey),.65)*.83+vec3(.045,.06,.035);
          diffuseColor.rgb=mix(subdued,diffuseColor.rgb,high);
          float contour=1.0-smoothstep(3.0,10.0,abs(vActualElevation-300.0));
          diffuseColor.rgb=mix(diffuseColor.rgb,uGold,contour*.92);
        }
      `;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+effect);
    };
    material.customProgramCacheKey=()=>isWater?'water-focus-v19':'natural-terrain-focus-v19';return uniforms;
  }
  async function addSea(){
    const coast=await new THREE.TextureLoader().loadAsync('assets/coastal-shading.png');coast.minFilter=THREE.LinearFilter;coast.magFilter=THREE.LinearFilter;
    const n=256,bump=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const t=x/n*Math.PI*2,u=y/n*Math.PI*2,k=(y*n+x)*4;
      const v=128+30*Math.sin(9*t+3*u+Math.sin(u))+17*Math.sin(5*t-11*u)+9*Math.sin(23*t+17*u);bump[k]=bump[k+1]=bump[k+2]=v;bump[k+3]=255;}
    const ripple=new THREE.DataTexture(bump,n,n);ripple.wrapS=ripple.wrapT=THREE.RepeatWrapping;ripple.repeat.set(95,95);ripple.magFilter=THREE.LinearFilter;ripple.minFilter=THREE.LinearFilter;ripple.needsUpdate=true;
    const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.38,metalness:.12,bumpMap:ripple,bumpScale:.014});
    mat.onBeforeCompile=shader=>{
      shader.uniforms.uCoast={value:coast};shader.uniforms.uDeep={value:new THREE.Color('#164d69')};shader.uniforms.uShallow={value:new THREE.Color('#418f9a')};
      shader.vertexShader='varying vec3 vSeaWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSeaWorld=(modelMatrix*vec4(position,1.0)).xyz;');
      shader.fragmentShader='varying vec3 vSeaWorld;uniform sampler2D uCoast;uniform vec3 uDeep;uniform vec3 uShallow;\n'+noiseGLSL+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec2 coastUV=vec2((vSeaWorld.x+9.0)/18.0,1.0-(vSeaWorld.z+10.0)/20.0);
        float coast=texture2D(uCoast,clamp(coastUV,0.0,1.0)).r;
        diffuseColor.rgb=mix(uDeep,uShallow,pow(clamp(coast*2.0,0.0,1.0),.65));
        diffuseColor.rgb*=.90+.16*landscapeNoise(vSeaWorld.xz*.7)+.04*landscapeNoise(vSeaWorld.xz*5.0);
        float wave=pow(.5+.5*sin(vSeaWorld.x*125.0+vSeaWorld.z*87.0+landscapeNoise(vSeaWorld.xz*8.0)*9.0),12.0);
        diffuseColor.rgb+=vec3(.002,.003,.0035)*wave;`);
    };
    sea=new THREE.Mesh(new THREE.PlaneGeometry(180,180),mat);sea.rotation.x=-Math.PI/2;sea.position.y=.046;sea.receiveShadow=true;sea.name='Illustrative Indian Ocean';scene.add(sea);
    cutawayFloor=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0xe8eee1,roughness:1}));cutawayFloor.rotation.x=-Math.PI/2;cutawayFloor.position.y=.14465;cutawayFloor.receiveShadow=true;cutawayFloor.visible=false;scene.add(cutawayFloor);
  }
  function focus(mode){if(!loaded)return;state.focus=mode;const value=mode==='natural'?0:mode==='highlight'?1:2;
    landUniforms.uFocus.value=value;waterUniforms.uFocus.value=value;terrain.visible=mode!=='isolate';highlands.visible=mode==='isolate';sea.visible=mode!=='isolate';cutawayFloor.visible=mode==='isolate';state.sea=sea.visible;scene.background.set(mode==='isolate'?'#e8eee1':'#164d69');
    state.visibleTriangles=mode==='isolate'?560000:800000;
    document.querySelectorAll('[data-terrain-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.terrainMode===mode)));
    document.getElementById('map-focus-label').textContent=mode==='natural'?'NATURAL LANDSCAPE':mode==='highlight'?'HIGHLIGHTING LAND ABOVE 300 m':'ONLY LAND ABOVE 300 m';
    document.getElementById('legend-selection').hidden=mode==='natural';
    document.getElementById('map-dialog').dataset.focus=mode;
    if(mode==='isolate')view('highlands');requestRender();
  }
  async function initialize(){
    const library=await (await fetch('assets/three.module.js')).text();
    const threeURL=URL.createObjectURL(new Blob([library],{type:'text/javascript'}));
    THREE=await import(threeURL);
    const controlsText=(await (await fetch('assets/OrbitControls.js')).text()).replace("from 'three'",`from '${threeURL}'`);
    const controlsURL=URL.createObjectURL(new Blob([controlsText],{type:'text/javascript'}));
    const {OrbitControls}=await import(controlsURL);
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    scene=new THREE.Scene();scene.background=new THREE.Color('#164d69');scene.fog=new THREE.Fog('#4a8d9e',42,95);camera=new THREE.OrthographicCamera(-5,5,7.35,-7.35,.05,200);
    controls=new OrbitControls(camera,canvas);controls.enableDamping=!reduced.matches;controls.dampingFactor=.09;controls.rotateSpeed=.45;controls.zoomSpeed=.8;controls.panSpeed=.7;
    controls.minZoom=.7;controls.maxZoom=8;controls.maxPolarAngle=Math.PI*.47;controls.minPolarAngle=.001;controls.screenSpacePanning=true;
    controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
    controls.addEventListener('change',requestRender);controls.addEventListener('start',()=>setViewActive(''));
    scene.add(new THREE.HemisphereLight(0xdcecf0,0x6c7555,1.5));
    const sun=new THREE.DirectionalLight(0xfff4df,2.6);sun.position.set(-10,18,-7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:45});sun.shadow.bias=-.0001;sun.shadow.normalBias=.006;scene.add(sun);
    const fill=new THREE.DirectionalLight(0xcceeff,.7);fill.position.set(8,6,5);scene.add(fill);
    const landMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:0});landUniforms=terrainShader(landMaterial);
    const waterMaterial=new THREE.MeshStandardMaterial({color:0x378caa,roughness:.42,metalness:.06,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});waterUniforms=terrainShader(waterMaterial,true);
    const [terrainMesh,waterMesh,highlandMesh]=await Promise.all([
      loadMesh('assets/terrain.mesh.gz','assets/terrain.elevation.gz',landMaterial),
      loadMesh('assets/water.mesh.gz','assets/water.elevation.gz',waterMaterial),
      loadMesh('assets/highlands.mesh.gz','assets/highlands.elevation.gz',landMaterial),addSea()
    ]);
    terrain=terrainMesh;water=waterMesh;highlands=highlandMesh;highlands.visible=false;
    terrain.name='Sri Lanka terrain';water.name='Rivers and 136 major water bodies';highlands.name='Original above-300m print part';scene.add(terrain,water,highlands);
    const extent=terrain.geometry.boundingSphere;state.terrainBounds={radius:extent.radius};
    loaded=true;state.ready=true;loading.hidden=true;fit();view('island');focus('highlight');
    new ResizeObserver(fit).observe(stage);URL.revokeObjectURL(controlsURL);URL.revokeObjectURL(threeURL);
    canvas.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key))return;
      event.preventDefault();if(event.key==='Home'){view('island');return;}
      if(['+','=','-'].includes(event.key)){zoom(event.key==='-'?.8:1.25);return;}
      const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);
      if(event.key==='ArrowLeft')s.theta-=.12;if(event.key==='ArrowRight')s.theta+=.12;if(event.key==='ArrowUp')s.phi=Math.max(.02,s.phi-.08);if(event.key==='ArrowDown')s.phi=Math.min(Math.PI*.47,s.phi+.08);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));setViewActive('');controls.update();requestRender();
    });
  }
  function view(name){if(!loaded)return;controls.target.set(0,.08,0);camera.zoom=1;
    if(name==='top')camera.position.set(0,20,.02);
    else if(name==='highlands'){controls.target.set(.25,.22,3.2);camera.position.set(.25,17.22,10.2);camera.zoom=2.25;}
    else camera.position.set(0,18,7);
    camera.updateProjectionMatrix();controls.update();setViewActive(name);requestRender();
  }
  function zoom(factor){if(!loaded)return;camera.zoom=Math.min(8,Math.max(.7,camera.zoom*factor));camera.updateProjectionMatrix();controls.update();requestRender();}
  window.openTerrainExplorer=trigger=>{
    opener=trigger;active=true;document.body.classList.add('detail-open');dialog.showModal();window.dispatchEvent(new Event('exhibit-detail-change'));
    document.getElementById('close-map').focus({preventScroll:true});
    if(!initialized)initialized=initialize().catch(error=>{state.error=error.message;loading.hidden=false;loading.classList.add('error');loading.querySelector('p').textContent='The 3D view could not start. Open this file in an up-to-date browser with hardware acceleration enabled. You can return to the welcome screen above.';console.error(error);});
    else{fit();requestRender();}
  };
  document.getElementById('close-map').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{active=false;cancelAnimationFrame(frame);frame=0;document.body.classList.remove('detail-open');window.dispatchEvent(new Event('exhibit-detail-change'));if(opener)opener.focus({preventScroll:true});});
  document.querySelectorAll('[data-terrain-mode]').forEach(b=>b.addEventListener('click',()=>focus(b.dataset.terrainMode)));
  buttons.forEach(b=>b.addEventListener('click',()=>view(b.dataset.mapView)));
  document.getElementById('zoom-in').addEventListener('click',()=>zoom(1.3));document.getElementById('zoom-out').addEventListener('click',()=>zoom(1/1.3));
  document.getElementById('map-water').addEventListener('click',event=>{if(!water)return;water.visible=!water.visible;state.waterVisible=water.visible;event.currentTarget.setAttribute('aria-pressed',String(water.visible));requestRender();});
  document.getElementById('map-info').addEventListener('click',event=>{const box=document.getElementById('map-about');box.hidden=!box.hidden;event.currentTarget.setAttribute('aria-expanded',String(!box.hidden));});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();state.ready=false;loading.hidden=false;loading.classList.add('error');loading.querySelector('p').textContent='The graphics view was interrupted. Reload the page to restore the map.';});
  window.addEventListener('message',event=>{if(event.source===window.parent&&event.data==='iwmi-open-terrain'){if(document.getElementById('menu-toggle').getAttribute('aria-expanded')!=='true')document.getElementById('menu-toggle').click();document.querySelector('.orbit-option[data-project=model]').click();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestRender();});
})();
