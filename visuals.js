import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {systems,basisVectors,fractional,unitSites,cubicInfo,cellEdges,cubeCorners,add,sub,mul,norm,unit,dot,planePolygon,reciprocal,wignerSeitz,madelungShells,potential,radialForce,atomDisplayGroup} from './crystal-math.js';
import {drawTeaching} from './teaching-visuals.js';

const COLORS=['#76e0ce','#ba9dff','#f4bd77','#f18da7'];
const v3=p=>new THREE.Vector3(p[0],p[2],-p[1]);
const css=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export class Visualizer{
 constructor(canvas){
  this.canvas=canvas;this.stage=canvas.parentElement;this.mode='order';this.state={};this.spin=false;this.time=0;this.dirty=true;
  this.plot=document.createElement('canvas');this.plot.id='plot';this.plot.setAttribute('aria-label','Interactive scientific illustration');Object.assign(this.plot.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});this.stage.insertBefore(this.plot,canvas.nextSibling);this.ctx=this.plot.getContext('2d');
  this.scene=new THREE.Scene();this.scene.add(new THREE.AmbientLight(0xffffff,2));let light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,5,4);this.scene.add(light);let rim=new THREE.DirectionalLight(0xbbaaff,2);rim.position.set(-3,-1,-2);this.scene.add(rim);
  this.camera=new THREE.PerspectiveCamera(35,1,.01,100);this.camera.position.set(2.7,2.05,3.5);
  try{this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.orbit=new OrbitControls(this.camera,canvas);this.orbit.enableDamping=true;this.orbit.enablePan=false;this.orbit.minDistance=1.2;this.orbit.maxDistance=12;this.orbit.addEventListener('change',()=>this.dirty=true);}catch(e){this.fallback=document.createElement('div');this.fallback.className='model-fallback';this.fallback.textContent='3D needs WebGL in your browser. Enable hardware acceleration, or use Key ideas and the calculators. The original lecture remains available.';this.stage.append(this.fallback);}
  this.group=new THREE.Group();this.scene.add(this.group);this.sphereGeometry=new THREE.SphereGeometry(1,24,16);
  this.pickable=[];this.inspectable=[];this.raycaster=new THREE.Raycaster();this.raycaster.params.Line.threshold=.075;
  this.readout=document.createElement('div');this.readout.className='teaching-readout';this.readout.hidden=true;this.stage.append(this.readout);
  canvas.addEventListener('pointerdown',e=>{this.pointerStart=[e.clientX,e.clientY]});
  canvas.addEventListener('pointerup',e=>{
   if(!this.pointerStart||Math.hypot(e.clientX-this.pointerStart[0],e.clientY-this.pointerStart[1])>6||(!this.pickable.length&&!this.inspectable.length))return;
   const r=canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);
   const hit=this.raycaster.intersectObjects([...this.pickable,...this.inspectable],true)[0];if(!hit)return;
   let object=hit.object;while(object&&!object.userData.inspect&&!object.userData.fractional)object=object.parent;
   if(object?.userData.fractional)this.onAtomSelected?.(object.userData.fractional);else if(object?.userData.inspect)this.onInspect?.(object.userData.inspect);
  });
  this.plot.addEventListener('click',e=>{
   const r=this.plot.getBoundingClientRect();
   if(this.mode==='forces'){const x=e.clientX-r.left,rr=.65+(x-43)/(r.width-68)*1.95;this.onInspect?.({kind:'energy',r:rr,energy:potential(rr,this.state.m,this.state.n),force:radialForce(rr,this.state.m,this.state.n)});}
   else if(['order','translation'].includes(this.mode))this.onInspect?.({kind:'concept',label:'A repeating lattice',text:'Each point represents a lattice site. Integer translations along the lattice vectors reproduce the pattern. The atoms placed at every site form its atomic basis.'});
   else if(this.mode==='bonding')this.onInspect?.({kind:'concept',label:this.state.bond+' bonding',text:'This is a conceptual illustration of electron behavior, not a quantum trajectory. Change the bond type to compare electron transfer, sharing, delocalization and secondary interactions.'});
  });
  new ResizeObserver(()=>this.resize()).observe(this.stage);this.resize();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
 }
 resize(){const w=this.stage.clientWidth,h=this.stage.clientHeight;if(!w||!h)return;this.width=w;this.height=h;const dpr=Math.min(devicePixelRatio,2);this.plot.width=w*dpr;this.plot.height=h*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);this.renderer?.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.dirty=true;}
 clear(){this.pickable=[];this.inspectable=[];while(this.group.children.length){const o=this.group.children.pop();o.traverse(obj=>{if(obj.geometry&&obj.geometry!==this.sphereGeometry)obj.geometry.dispose();if(obj.material){const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>{m.map?.dispose();m.dispose();});}});}this.group.rotation.set(0,0,0);this.group.quaternion.identity();}
 atom(p,r=.065,color=COLORS[0],opacity=1){const material=new THREE.MeshStandardMaterial({color,roughness:.3,metalness:.12,transparent:opacity<1,opacity});const atom=new THREE.Mesh(this.sphereGeometry,material);atom.scale.setScalar(r);atom.position.copy(v3(p));this.group.add(atom);return atom;}
 line(a,b,color=COLORS[0],opacity=.45,detail=null){const geo=new THREE.BufferGeometry().setFromPoints([v3(a),v3(b)]),m=new THREE.LineBasicMaterial({color,transparent:true,opacity}),line=new THREE.Line(geo,m);this.group.add(line);if(detail){line.userData.inspect=detail;this.inspectable.push(line);}return line;}
 polygon(points,color=COLORS[1],opacity=.2,detail=null){if(points.length<3)return;const positions=[];for(let i=1;i<points.length-1;i++)for(const p of [points[0],points[i],points[i+1]])positions.push(...v3(p).toArray());const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false,roughness:.65}));this.group.add(mesh);if(detail){mesh.userData.inspect=detail;this.inspectable.push(mesh);}points.forEach((p,i)=>this.line(p,points[(i+1)%points.length],color,.7));}
 label(text,p,color=COLORS[0]){const c=document.createElement('canvas');c.width=320;c.height=96;const ctx=c.getContext('2d');ctx.font='500 40px system-ui';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,160,61);const texture=new THREE.CanvasTexture(c),m=new THREE.SpriteMaterial({map:texture,depthTest:false});const s=new THREE.Sprite(m);s.position.copy(v3(p));s.userData.anchor=s.position.clone();s.scale.set(.95,.285,1);this.group.add(s);}
 arrow(a,b,color=COLORS[0],detail=null){const d=sub(b,a),len=norm(d);if(len<1e-8)return;const arrow=new THREE.ArrowHelper(v3(unit(d)),v3(a),len,color,.07,.035);this.group.add(arrow);if(detail){arrow.userData.inspect=detail;this.inspectable.push(arrow);}return arrow;}
 set(mode,state){this.mode=mode;this.state={...state};this.readout.hidden=!state.teaching;this.readout.textContent=state.teaching?.readout||'';this.stage.classList.toggle('is-teaching',!!state.teaching);const is2D=['order','translation','forces','bonding'].includes(mode);this.canvas.hidden=is2D;this.plot.hidden=!is2D;if(this.fallback)this.fallback.hidden=is2D;document.getElementById('spin').disabled=is2D||!this.renderer;document.getElementById('scene-hint').textContent=is2D?({order:'Move the slider to explore periodicity',translation:'Whole lattice shifts preserve the pattern',forces:'Move the distance slider to stretch the bond',bonding:'Conceptual electron illustration · not to scale'}[mode]):'Drag to rotate · Scroll to zoom';if(!is2D)this.build3D();this.dirty=true;}
 reset(){this.camera.position.set(2.7,2.05,3.5);this.orbit?.target.set(0,0,0);this.orbit?.update();this.group.quaternion.identity();this.dirty=true;}
 build3D(){
  this.clear();const s=this.state,mode=this.mode;this.group.position.y=(s.teaching?.topic==='angles'||s.teaching?.topic==='vectors') ? .16 : 0;
  if(mode==='wigner'){const type=s.structure||'BCC',faces=wignerSeitz(type),step=s.teaching?.topic==='construction'?s.teaching.step:3;if(step>=2)faces.forEach(f=>this.polygon(f,COLORS[0],step===2?.07:.19));this.atom([0,0,0],.07,COLORS[2]);if(s.neighbors||step<3){const seen=new Set();faces.forEach(f=>{let center=mul(f.reduce(add,[0,0,0]),1/f.length);const n=mul(center,2),key=n.map(x=>x.toFixed(5)).join();if(!seen.has(key)){seen.add(key);this.atom(n,.045,COLORS[1],.8);if(step>=1)this.line([0,0,0],n,COLORS[1],.4);}});}this.label('origin',[0,0,-.14],COLORS[2]);return;}
  if(mode==='madelung'){const dim=+s.dimension||3,shells=madelungShells(dim,+s.shells||4),all=shells.flatMap(x=>x.points.map(p=>({p,sign:x.sign,r2:x.r2}))),scale=1.5/(Math.sqrt(shells.at(-1).r2)||1);this.atom([0,0,0],.105,COLORS[2]);this.label('+',[0,0,.18],COLORS[2]);all.forEach(({p,sign})=>{const q=mul(p,scale);this.atom(q,.065,sign===1?COLORS[1]:COLORS[0]);if(s.connections)this.line([0,0,0],q,sign===1?COLORS[1]:COLORS[0],.12);});return;}
  const type=s.structure||'SC';let params=s.params||[1,1,1,90,90,90],centering=null;
  if(mode==='systems'||mode==='bravais'){params=systems[s.system||'Cubic'].params;centering=mode==='bravais'?(s.centering||'P'):'P';}
  if(type==='HCP'&&mode==='structures')params=[1,1,+s.ca||Math.sqrt(8/3),90,90,120];
  const basis=basisVectors(params),repeats=s.repeat&&s.teaching?.topic!=='counting'?2:1,center=mul(fractional([repeats/2,repeats/2,repeats/2],basis),-1),scale=1.5/Math.max(...params.slice(0,3),1)/repeats;
  const world=p=>mul(add(fractional(p,basis),center),scale);
  const cartesian=p=>mul(add(p,center),scale);
  if(mode==='symmetry'){const corners=cubeCorners().map(p=>sub(p,[.5,.5,.5]));cellEdges(corners).forEach(([a,b])=>this.line(a,b,COLORS[0],.8));corners.forEach(p=>this.atom(p,.06));const operation=s.operation||'4-fold';
   if(operation==='Mirror'){const diagonal=s.mirror==='Diagonal';this.polygon(diagonal?[[-.65,-.65,-.65],[.65,.65,-.65],[.65,.65,.65],[-.65,-.65,.65]]:[[0,-.7,-.7],[0,.7,-.7],[0,.7,.7],[0,-.7,.7]],COLORS[1],.22);this.atom([.35,.25,.25],.09,COLORS[2]);this.atom(diagonal?[.25,.35,.25]:[-.35,.25,.25],.09,COLORS[2]);}
   else if(operation==='Inversion'){this.atom([0,0,0],.045,COLORS[2]);this.line([-.5,-.5,-.5],[.5,.5,.5],COLORS[2],.9);this.atom([.3,.2,.35],.08,COLORS[1]);this.atom([-.3,-.2,-.35],.08,COLORS[1]);}
   else {const axis=unit(operation==='3-fold'?[1,1,1]:operation==='2-fold'?[1,1,0]:[0,0,1]);this.line(mul(axis,-1),mul(axis,1),COLORS[2],.9);this.label(operation,mul(axis,1.1),COLORS[2]);if(s.angle)this.group.quaternion.setFromAxisAngle(v3(axis),s.angle*Math.PI/180);}
   return;
  }
  const corners=cubeCorners().map(p=>world(mul(p,repeats)));cellEdges(corners).forEach(([a,b])=>this.line(a,b,'#7d91b1',.55));
  if(mode==='indices'||mode==='spacing'){
   const indices=s.indices||[1,1,1];const nodes=cubeCorners();nodes.forEach(p=>this.atom(world(p),.033,COLORS[0],.8));
   if(s.indexMode==='direction'&&mode==='indices'){
    const max=Math.max(...indices.map(Math.abs),1),start=indices.map(x=>x<0?1:0),end=add(start,mul(indices,1/max));if(!s.teaching){this.arrow(world(start),world(end),COLORS[2]);this.label(`[${indices.join(' ')}]`,add(world(end),[0,0,.1]),COLORS[2]);}
   }else if(indices.some(Boolean)){
    const values=cubeCorners().map(p=>dot(p,indices)),low=Math.min(...values),high=Math.max(...values);let t=low<1&&high>=1?1:(low<=-1&&high> -1?-1:(low+high)/2);
    const offsets=s.family?Array.from({length:Math.min(12,Math.ceil(high-low)+1)},(_,i)=>Math.ceil(low)+i).filter(v=>v<=high):[t];
    if(s.teaching?.topic!=='planes')offsets.forEach(n=>this.polygon(planePolygon(indices,n).map(world),COLORS[1],s.family?.15:.3,{kind:'plane',indices:[...indices]}));
    const normal=unit(fractional(indices,reciprocal(basis))),c=world([.5,.5,.5]);if(s.teaching?.topic!=='planes'){this.arrow(c,add(c,mul(normal,.65)),COLORS[2]);this.label('normal',add(c,mul(normal,.8)),COLORS[2]);}
   }
  }else{
   const sites=unitSites(type,repeats,centering),info=cubicInfo[type],baseRadius=(mode==='packing'?(info?.radius||.25):.09)*(+s.atomScale||.6),radius=baseRadius*scale;
   for(const {p,s:species}of sites){
    const t=s.teaching,selected=t?.topic==='neighbors'&&norm(sub(p,t.selected))<1e-6,near=t?.topic==='neighbors'&&t.neighbors.sites.some(n=>norm(sub(p,n.p))<1e-6);
    const boundaries=p.filter(x=>Math.abs(x)<1e-6||Math.abs(x-repeats)<1e-6).length;
    const color=t?.topic==='counting'?[COLORS[0],COLORS[1],COLORS[3],COLORS[2]][boundaries]:selected?COLORS[2]:near?COLORS[1]:COLORS[centering?0:atomDisplayGroup(type,p,species)];
    const opacity=t?.topic==='neighbors'&&!selected&&!near ? .23 : 1;
    const mesh=this.atom(world(p),selected?Math.max(radius,.06):radius,color,opacity);mesh.userData.fractional=p;if(['structures','lattice','packing'].includes(mode))this.pickable.push(mesh);
   }
   if(s.teaching?.topic==='neighbors'){
    const t=s.teaching;
    for(const n of t.neighbors.sites){const outside=!sites.some(a=>norm(sub(a.p,n.p))<1e-6);if(outside)this.atom(world(n.p),Math.max(.035*scale,radius*.8),COLORS[1],.6);this.line(world(t.selected),world(n.p),COLORS[2],.9);}
    this.label('selected',add(world(t.selected),[0,0,.15]),COLORS[2]);
   }
   if(s.bonds){const tolerance=type==='HCP'?1.02:(type==='CsCl'?Math.sqrt(3)/2:type==='NaCl'?.5:type==='ZnS'?Math.sqrt(3)/4:info?.nearest||1)*1.02;for(let i=0;i<sites.length;i++)for(let j=i+1;j<sites.length;j++){const a=sites[i],b=sites[j],distance=norm(fractional(sub(a.p,b.p),basis));if(distance>1e-6&&distance<=tolerance)this.line(world(a.p),world(b.p),'#8398b7',.4);}}
   if(s.primitive&&!s.teaching&&(type==='FCC'||type==='BCC')){const prim=type==='FCC'?[[0,.5,.5],[.5,0,.5],[.5,.5,0]]:[[-.5,.5,.5],[.5,-.5,.5],[.5,.5,-.5]];const pc=cubeCorners().map(p=>world(fractional(p,prim)));cellEdges(pc).forEach(([a,b])=>this.line(a,b,COLORS[2],.95));for(const b of prim)this.arrow(world([0,0,0]),world(b),COLORS[2]);}
   if(mode==='packing'){const end=type==='SC'?[1,0,0]:type==='BCC'?[1,1,1]:[1,1,0];this.line(world([0,0,0]),world(end),COLORS[2],.95);}
  }
  if(s.axes!==false&&!s.teaching){const origin=world([0,0,0]);[[1,0,0],[0,1,0],[0,0,1]].forEach((a,i)=>{this.arrow(origin,world(mul(a,repeats*1.15)),COLORS[i],{kind:'vector',label:['a','b','c'][i],components:[...basis[i]]});this.label(['a','b','c'][i],world(mul(a,repeats*1.28)),COLORS[i]);});}
  drawTeaching(this,{s,basis,world,cartesian,scale},COLORS);
 }
 themeChanged(){COLORS.splice(0,4,...(document.documentElement.dataset.theme==='light'?['#158477','#8451c7','#b77a17','#c8446b']:['#76e0ce','#ba9dff','#f4bd77','#f18da7']));if(!this.canvas.hidden)this.build3D();this.dirty=true;}
 keepLabelsInFrame(){
  this.camera.updateMatrixWorld();const tan=Math.tan(this.camera.fov*Math.PI/360);
  for(const label of this.group.children.filter(o=>o.isSprite)){
   label.position.copy(label.userData.anchor);this.group.updateMatrixWorld(true);
   const world=label.getWorldPosition(new THREE.Vector3()),cameraPoint=world.clone().applyMatrix4(this.camera.matrixWorldInverse),depth=-cameraPoint.z;if(depth<=0)continue;
   const projected=world.clone().project(this.camera),hw=Math.min(.45,label.scale.x/(2*depth*tan*this.camera.aspect)),hh=label.scale.y/(2*depth*tan);
   projected.x=THREE.MathUtils.clamp(projected.x,-1+hw+.02,1-hw-.02);
   const top=1-2*42/this.height-hh,bottom=-1+2*(this.state.teaching?76:31)/this.height+hh;
   projected.y=THREE.MathUtils.clamp(projected.y,bottom,top);
   label.position.copy(this.group.worldToLocal(projected.unproject(this.camera)));
  }
 }
 loop(now){requestAnimationFrame(this.loop);if(document.hidden||!this.width)return;this.time=now/1000;const visible=this.stage.getBoundingClientRect();if(visible.width===0||visible.bottom<0||visible.top>innerHeight)return;
  const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!this.plot.hidden&&(this.dirty||(this.mode==='bonding'&&this.state.animate!==false&&motion))){this.draw2D();this.dirty=false;}
  if(!this.canvas.hidden&&this.renderer){if(this.orbit){this.orbit.autoRotate=this.spin&&motion;this.orbit.autoRotateSpeed=.8;this.orbit.update();}if(this.dirty||this.spin){this.keepLabelsInFrame();this.renderer.render(this.scene,this.camera);this.dirty=false;}}
 }
 draw2D(){const ctx=this.ctx,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);ctx.fillStyle=css('--muted');ctx.strokeStyle=css('--border');ctx.lineWidth=1;ctx.font='10px system-ui';if(this.mode==='forces')this.drawEnergy(ctx,w,h);else if(this.mode==='bonding')this.drawBonding(ctx,w,h);else this.drawLattice(ctx,w,h);}
 text(ctx,text,x,y,color=css('--muted'),size=10,align='center'){ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.textAlign=align;ctx.fillText(text,x,y);}
 circle(ctx,x,y,r,color){const grad=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,color+'99');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 drawLattice(ctx,w,h){
  const s=this.state,spacing=Math.min(43,(w-64)/7,(h-105)/4),cx=w/2,cy=h/2+8,jitter=(+s.disorder||0)/100,shift=this.mode==='translation'?+s.shift||0:0;
  const rand=(i,j,k)=>Math.sin(i*127.1+j*311.7+k*78.233)*43758.5453%1;
  ctx.lineWidth=.7;ctx.strokeStyle=css('--border');
  if(!jitter)for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx+i*spacing,cy-2*spacing);ctx.lineTo(cx+i*spacing,cy+2*spacing);ctx.stroke();}
  if(!jitter)for(let j=-2;j<=2;j++){ctx.beginPath();ctx.moveTo(cx-3*spacing,cy+j*spacing);ctx.lineTo(cx+3*spacing,cy+j*spacing);ctx.stroke();}
  if(s.cell&&!jitter){ctx.fillStyle='#b19cff16';ctx.fillRect(cx,cy-spacing,spacing,spacing);ctx.strokeStyle=COLORS[1];ctx.strokeRect(cx,cy-spacing,spacing,spacing);this.text(ctx,'unit cell',cx+spacing/2,cy-spacing-10,COLORS[1],9);}
  for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++){
   const x=cx+(i+shift)*spacing+rand(i,j,1)*spacing*jitter*.44,y=cy+j*spacing+rand(i,j,2)*spacing*jitter*.44;
   if(this.mode==='translation'){ctx.strokeStyle='#75dfca35';ctx.beginPath();ctx.arc(cx+i*spacing,cy+j*spacing,5,0,Math.PI*2);ctx.stroke();}
   if(x>24&&x<w-24)this.circle(ctx,x,y,5.8,COLORS[0]);
   if(s.basis)this.circle(ctx,x+spacing*.3,y-spacing*.25,4.3,COLORS[1]);
  }
  if(this.mode==='translation'){const x=cx-2*spacing,y=cy+2*spacing+24;ctx.strokeStyle=COLORS[2];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+shift*spacing,y);ctx.stroke();if(shift){ctx.beginPath();ctx.moveTo(x+shift*spacing,y);ctx.lineTo(x+shift*spacing-Math.sign(shift)*6,y-4);ctx.lineTo(x+shift*spacing-Math.sign(shift)*6,y+4);ctx.fillStyle=COLORS[2];ctx.fill();}this.text(ctx,`R = ${shift}a`,cx,y+15,COLORS[2],10);}
  else this.text(ctx,jitter>0?'Schematic disorder: no exact translational repetition':'a repeating motif → long-range order',cx,cy+2*spacing+27,css('--muted'),10);
 }
 drawEnergy(ctx,w,h){
  const s=this.state,m=+s.m||1,n=+s.n||9,r=+s.distance||1,B=m/n,E=1-m/n;
  const x0=43,x1=w-25,y0=98,y1=h-49;const X=r=>x0+(r-.65)/(2.6-.65)*(x1-x0),Y=u=>y1-(u+1.25*E)/(3.25*E)*(y1-y0);
  const pairY=62,cx=w/2,dist=Math.min(w*.29,r*w*.12);ctx.strokeStyle=css('--border');ctx.beginPath();ctx.moveTo(cx-dist/2,pairY);ctx.lineTo(cx+dist/2,pairY);ctx.stroke();this.circle(ctx,cx-dist/2,pairY,10,COLORS[0]);this.circle(ctx,cx+dist/2,pairY,10,COLORS[1]);this.text(ctx,`r / r₀ = ${r.toFixed(2)}`,cx,pairY+24,css('--text'),10);
  ctx.strokeStyle=css('--border');ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0,y1);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x0,Y(0));ctx.lineTo(x1,Y(0));ctx.stroke();ctx.setLineDash([]);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,x1-x0,y1-y0);ctx.clip();
  const curve=(fn,color,dash=[])=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=dash.length?1:2;ctx.setLineDash(dash);for(let j=0;j<=240;j++){const rr=.65+j/240*1.95,x=X(rr),y=Y(fn(rr));j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([])};
  if(s.components!==false){curve(x=>-1/x**m,COLORS[1],[4,4]);curve(x=>B/x**n,COLORS[2],[4,4]);}
  curve(x=>potential(x,m,n),COLORS[0]);ctx.setLineDash([3,4]);ctx.strokeStyle='#91a0b870';ctx.beginPath();ctx.moveTo(X(r),y0);ctx.lineTo(X(r),y1);ctx.stroke();ctx.setLineDash([]);const u=potential(r,m,n);this.circle(ctx,X(r),Y(u),4.5,COLORS[0]);ctx.restore();
  [1,1.5,2,2.5].forEach(v=>this.text(ctx,String(v),X(v),y1+16));this.text(ctx,'r / r₀',(x0+x1)/2,h-13,css('--muted'),9);this.text(ctx,'U',18,(y0+y1)/2,COLORS[0],11);this.text(ctx,'0',x0-10,Y(0)+3,css('--muted'),9);this.text(ctx,'−|U₀|',x0-5,Y(-E)+3,css('--muted'),8,'right');this.text(ctx,'r₀',X(1),y0-8,COLORS[0],9);
 }
 drawBonding(ctx,w,h){
  const type=this.state.bond||'Ionic',t=this.state.animate===false?0:this.time,cx=w/2,cy=h/2+7;const atom=(x,y,color,label,r=24)=>{this.circle(ctx,x,y,r,color);this.text(ctx,label,x,y+4,'#0b1727',12)};
  const electron=(x,y)=>{this.circle(ctx,x,y,3.4,COLORS[2]);};
  if(type==='Ionic'){const d=w*.19;atom(cx-d,cy,COLORS[0],'Na⁺');atom(cx+d,cy,COLORS[1],'Cl⁻',31);ctx.strokeStyle=COLORS[2];ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(cx-d+29,cy);ctx.lineTo(cx+d-36,cy);ctx.stroke();ctx.setLineDash([]);electron(cx-d+((Math.sin(t)+1)/2)*2*d,cy-44);this.text(ctx,'electron transfer',cx,cy-67,css('--muted'),11);this.text(ctx,'opposite charges attract',cx,cy+66,css('--text'),12);}
  else if(type==='Covalent'){const d=w*.12;ctx.fillStyle='#b19cff20';ctx.beginPath();ctx.ellipse(cx,cy,d*1.6,28,0,0,Math.PI*2);ctx.fill();atom(cx-d,cy,COLORS[0],'C');atom(cx+d,cy,COLORS[0],'C');electron(cx+Math.sin(t)*9,cy-7);electron(cx-Math.sin(t)*9,cy+7);this.text(ctx,'shared electron pair',cx,cy+66,css('--text'),12);this.text(ctx,'One bond shown; diamond has 4 tetrahedral bonds per atom.',cx,cy-65,css('--muted'),Math.min(10,w/40));}
  else if(type==='Metallic'){ctx.fillStyle='#76e0ce0b';ctx.fillRect(cx-w*.35,cy-65,w*.7,130);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)atom(cx+i*65,cy+j*46,COLORS[0],'+',14);for(let i=0;i<14;i++){const x=cx+Math.sin(i*7.12+t*.35)*w*.3,y=cy+Math.cos(i*4.3+t*.43)*54;electron(x,y);}this.text(ctx,'positive ion cores + delocalized electrons',cx,cy+93,css('--text'),11);}
  else if(type==='Hydrogen'){const water=(x,y)=>{atom(x,y,COLORS[1],'O',20);atom(x+25,y-18,COLORS[0],'H',11);atom(x+25,y+18,COLORS[0],'H',11);};water(cx-72,cy);water(cx+55,cy);ctx.setLineDash([4,5]);ctx.strokeStyle=COLORS[2];ctx.beginPath();ctx.moveTo(cx-36,cy-18);ctx.lineTo(cx+34,cy);ctx.stroke();ctx.setLineDash([]);this.text(ctx,'Oδ− ··· Hδ+ hydrogen interaction',cx,cy+75,css('--text'),11);this.text(ctx,'O—H within each molecule: covalent',cx,cy-65,css('--muted'),10);}
  else{const d=w*.18,offset=Math.sin(t*1.5)*9;atom(cx-d,cy,COLORS[0],'+',18);atom(cx+d,cy,COLORS[1],'+',18);for(const x of [cx-d,cx+d]){ctx.fillStyle='#b19cff35';ctx.beginPath();ctx.ellipse(x+offset,cy,37,28,0,0,Math.PI*2);ctx.fill();electron(x+offset*2,cy-15);}this.text(ctx,'correlated fluctuations → weak attraction',cx,cy+72,css('--text'),11);this.text(ctx,'Schematic dipoles, not electron orbits',cx,cy-65,css('--muted'),10);}
 }
}
