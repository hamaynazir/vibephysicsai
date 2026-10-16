import {evaluate,vectorField,gradient,potential,spherical,cylindrical,add,scale,norm} from './math.js';
export const moving=new Set(['addition','components','direction','position','gradient','divergence','curl','gradient-theorem','gauss','stokes','spherical','cylindrical','classification']);
const fmt=n=>Number(n.toPrecision(4)).toString();
export function draw(canvas,id,s,t){
 const W=760,H=440,pixel=Math.min(devicePixelRatio||1,2),g=canvas.getContext('2d');canvas.width=W*pixel;canvas.height=H*pixel;g.scale(pixel,pixel);const dark=document.documentElement.dataset.theme==='dark',bg=dark?'#1e2833':'#f7f9fa',ink=dark?'#e3edf3':'#253a45',muted=dark?'#a9bdca':'#73838f',teal=dark?'#67dbd3':'#07888e',purple=dark?'#c0a1ef':'#8961bd',gold=dark?'#f1cc78':'#b78425',red=dark?'#ef9d9c':'#c95c68';g.fillStyle=bg;g.fillRect(0,0,W,H);
 const text=(v,x,y,size=16,c=ink)=>{g.fillStyle=c;g.font=`${size}px system-ui`;g.fillText(v,x,y);};
 const line=(x,y,u,v,c=muted,w=2)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(u,v);g.stroke();};
 const dot=(x,y,c=purple,r=5)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,2*Math.PI);g.fill();};
 const arrow=(x,y,u,v,c=teal,label='')=>{line(x,y,u,v,c,2);const a=Math.atan2(v-y,u-x),len=Math.hypot(v-y,u-x);if(len>3){line(u,v,u-8*Math.cos(a-.4),v-8*Math.sin(a-.4),c,2);line(u,v,u-8*Math.cos(a+.4),v-8*Math.sin(a+.4),c,2);}if(label)text(label,u+7,v-6,16,c);};
 text('MATHEMATICAL TEACHING MODEL · i, j, k = CARTESIAN BASIS',24,28,12,muted);
 const r=evaluate(id,s),yaw=(s.viewYaw??-30)*Math.PI/180,pitch=(s.viewPitch??30)*Math.PI/180;
 let max=3;if(r.A)max=Math.max(max,norm(r.A),norm(r.B||[]),norm(r.sum||[]),id==='cross'?norm(r.cross||[]):0,id==='addition'?norm(r.scaled||[]):0);if(r.point)max=Math.max(max,norm(r.point)+1.2);if(r.P)max=Math.max(max,norm(r.P),norm(r.Q),Math.abs(s.origin));const k=200/max;
 const project=p=>[370+k*(Math.cos(yaw)*p[0]+Math.sin(yaw)*p[1]),245-k*(-Math.sin(yaw)*Math.sin(pitch)*p[0]+Math.cos(yaw)*Math.sin(pitch)*p[1]+Math.cos(pitch)*p[2])];
 const arr3=(p,q,c,label)=>{if(Math.hypot(...p.map((v,i)=>v-q[i]))<1e-10)return;const a=project(p),b=project(q);arrow(...a,...b,c,label);};
 const axes=(labels=['i / x','j / y','k / z'])=>{for(const [i,[v,c]] of [[[2.5,0,0],red],[[0,2.5,0],teal],[[0,0,2.5],gold]].entries())arr3([0,0,0],v,c,labels[i]);};
 const path=(points,fraction,c=purple)=>{const q=Math.max(0,Math.min(.999999,fraction))*(points.length-1),i=Math.floor(q),p=points[i].map((v,j)=>v+(points[i+1][j]-v)*(q-i));dot(...project(p),c,6);};
 const fieldAxes=()=>{line(85,245,675,245,muted,1);line(380,390,380,90,muted,1);text('x',686,249);text('y',385,80);};
 const xy=(x,y)=>[380+x*70,245-y*48];
 const field=(func)=>{fieldAxes();for(let x=-3;x<=3;x+=.75)for(let y=-2.25;y<=2.25;y+=.75){const v=func(x,y),length=Math.hypot(v[0],v[1]);if(length<1e-8){dot(...xy(x,y),muted,1);continue;}const d=.38*Math.tanh(length/2),e=xy(x+d*v[0]/length,y+d*v[1]/length);arrow(...xy(x,y),...e,teal);}};
 switch(id){
 case 'overview':case 'vectors':case 'components':case 'addition':case 'dot':case 'cross':case 'cube':{
  axes();const A=r.A,B=r.B;arr3([0,0,0],A,teal,'A');
  if(['addition','dot','cross','cube'].includes(id))arr3([0,0,0],B,purple,'B');
  if(id==='addition'){arr3(A,add(A,B),purple,'translated B');arr3([0,0,0],r.sum,gold,'A+B');arr3([0,0,0],r.scaled,red,'αA');path([[0,0,0],A,add(A,B)],t*.2%1);}
  if(['vectors','components','overview'].includes(id)){const legs=[[0,0,0],[A[0],0,0],[A[0],A[1],0],A];for(let i=0;i<3;i++){const color=[red,teal,gold][i];arr3(legs[i],legs[i+1],color,'');if(Math.abs(A[i])>1e-10){const midpoint=project(legs[i].map((v,j)=>(v+legs[i+1][j])/2));text(['Aₓ i','Aᵧ j','A𝓏 k'][i],midpoint[0]+10,midpoint[1]-8,15,color);}}if(id==='components')path(legs,t*.2%1);}
  if(id==='cross'){arr3([0,0,0],r.cross,gold,'A×B');const points=[[0,0,0],A,add(A,B),B].map(project);g.fillStyle=dark?'#34606655':'#bde0da66';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();text('Zero normal when inputs are parallel or zero.',90,400,15,muted);}
  else if(id==='dot'||id==='cube')text(r.angle===null?'Angle undefined for a zero vector':`True 3D angle = ${fmt(r.angle)}°`,80,385,21,gold);
  else text('Component legs share the resultant endpoint.',70,390,18,muted);break;
 }
 case 'direction':case 'position':{
  axes();arr3(r.origin,r.P,teal,'rP');arr3(r.origin,r.Q,purple,'rQ');arr3(r.P,r.Q,gold,'Δr');dot(...project(r.origin),red,6);text('O',...project(r.origin).map((v,i)=>v+(i?20:5)),15,red);path([r.P,r.Q],t*.2%1);text('Points P and Q fixed · origin changes position, not displacement.',65,408,17,muted);break;
 }
 case 'elements':case 'spherical-elements':case 'cylindrical-elements':{
  axes(id==='spherical-elements'?['er','eθ','eφ']:id==='cylindrical-elements'?['eρ','eφ','ez']:undefined);const lengths=r.lengths||r.displacement,v=lengths.map(x=>x*7),points=[[0,0,0],[v[0],0,0],[v[0],v[1],0],[0,v[1],0],[0,0,v[2]],[v[0],0,v[2]],[v[0],v[1],v[2]],[0,v[1],v[2]]];for(const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]){line(...project(points[a]),...project(points[b]),teal,2);}text('Local differential element · edges visually enlarged ×7',70,80,18);text('Three different face areas—not one sum of unrelated normals.',55,405,17,muted);if(id!=='elements')text('Local unwrapped scale-factor view · not a finite curved wedge',65,430,14,muted);break;
 }
 case 'gradient':{
  // A scalar heatmap and arrows show a z=constant slice of T, not a 3D surface.
  for(let i=0;i<34;i++)for(let j=0;j<22;j++){const x=(i-17)/6,y=(j-11)/5,val=potential(x,y,s.z,s.a,s.b,s.c),a=.05+.18*(Math.tanh(val/4)+1)/2;g.fillStyle=`rgba(8,142,146,${a})`;g.fillRect(130+i*15,100+j*13,15,13);}field((x,y)=>gradient(x,y,s.z,s.a,s.b,s.c));const p=xy(s.x,s.y),gr=r.gradient,heading=s.heading*Math.PI/180;dot(...p,purple,6);arrow(...p,...xy(s.x+.7*Math.cos(heading),s.y+.7*Math.sin(heading)),gold,'u');text('Slice z fixed · arrows are xy components of ∇T',65,60,17);text('Full 3D gradient and directional derivative are calculated below.',55,426,16,muted);break;
 }
 case 'divergence':case 'curl':case 'classification':{
  field((x,y)=>vectorField(x,y,0,s.a,s.b,s.c));text('xy slice at z=0 · cz still contributes to 3D divergence',65,64,17);for(let i=0;i<5;i++){const u=(t*.1+i*.2)%1,rad=(.6+i*.25)*Math.exp(s.a*u*.3),phase=s.b*t*.5+i*1.256;dot(...xy(rad*Math.cos(phase),rad*Math.sin(phase)),purple,4);}text(`div F = ${fmt(r.divergence)} · curl F = ${fmt(r.curl[2])} k`,150,420,21,gold);break;
 }
 case 'identities':{
  text('V = (x²y, xy², z²)',90,98,25,teal);const values=[['grad(div V)',r.gradDiv],['vector Laplacian',r.lapV],['curl(curl V)',r.curlCurl]];values.forEach(([label,v],i)=>{text(label,70,175+i*65,20);text('('+v.map(fmt).join(', ')+')',390,175+i*65,24,[teal,purple,gold][i]);});text('Subtract the second row from the first to get the third.',65,402,18,muted);break;
 }
 case 'gradient-theorem':{
  field((x,y)=>gradient(x,y,0,s.a,s.b,0));const start=r.start,end=r.end,bend=[end[0],start[1],0];line(...xy(start[0],start[1]),...xy(end[0],end[1]),gold,3);line(...xy(start[0],start[1]),...xy(bend[0],bend[1]),purple,2);line(...xy(bend[0],bend[1]),...xy(end[0],end[1]),purple,2);const u=t*.15%1,direct=start.map((v,i)=>v+(end[i]-v)*u);dot(...xy(direct[0],direct[1]),gold,6);const seg=u<.5?[start,bend,u*2]:[bend,end,(u-.5)*2],p=seg[0].map((v,i)=>v+(seg[1][i]-v)*seg[2]);dot(...xy(p[0],p[1]),purple,5);text(`Both analytic integrals = ${fmt(r.delta)}`,145,421,22,gold);break;
 }
 case 'gauss':{
  const rr=s.radius*45,cx=380,cy=235;g.strokeStyle=teal;g.lineWidth=3;g.beginPath();g.arc(cx,cy,rr,0,2*Math.PI);g.stroke();for(let i=0;i<16;i++){const a=i*Math.PI/8,x=cx+rr*Math.cos(a),y=cy+rr*Math.sin(a);arrow(x,y,x+20*Math.cos(a),y+20*Math.sin(a),purple);}const a=t*.7;dot(cx+rr*Math.cos(a),cy+rr*Math.sin(a),gold,6);text('Sphere cross-section · violet arrows = outward normals',60,76,18);text(`∮ F·dS = ∫ div F dV = ${fmt(r.flux)}`,100,415,23,gold);break;
 }
 case 'stokes':{
  const rr=s.radius*45,cx=380,cy=235;g.strokeStyle=teal;g.lineWidth=3;g.beginPath();g.arc(cx,cy,rr,0,2*Math.PI);g.stroke();const phase=s.orientation*t*.7;dot(cx+rr*Math.cos(phase),cy-rr*Math.sin(phase),gold,7);text(s.orientation===1?'Normal +k · CCW viewed from +z':'Normal −k · CW viewed from +z',95,72,20);text(s.orientation===1?'⊙':'⊗',cx-13,cy+12,40,purple);text(`Circulation = curl flux = ${fmt(r.flux)}`,120,418,23,gold);break;
 }
 case 'coordinates':{
  axes();const p=[s.x,s.y,s.z];arr3([0,0,0],p,gold,'P');arr3([0,0,0],[s.x,s.y,0],purple,'xy projection');text('r = distance from origin · ρ = distance from z-axis',70,83,18);text(`φ = ${r.phi===null?'undefined':fmt(r.phi)+'°'} · θ = ${r.theta===null?'undefined':fmt(r.theta)+'°'}`,140,411,22,teal);break;
 }
 case 'spherical':case 'cylindrical':{
  axes();arr3([0,0,0],r.point,gold,'Position');const labels=id==='spherical'?['er','eθ','eφ']:['eρ','eφ','ez'];r.basis.forEach((e,i)=>arr3(r.point,add(r.point,scale(e,1.1)),[teal,purple,red][i],labels[i]));dot(...project(r.point),gold,6);const u=t*.15%1,edge=add(r.point,scale(r.basis[0],u));dot(...project(edge),teal,4);text('Local basis shown at P · arrow directions use full 3D formulas',50,400,17);text('Drag to rotate the view; calculated components do not change.',60,428,15,muted);break;
 }
 case 'summary':{
  const labels=['Components & vector algebra','Local derivatives','Integral theorems','Coordinate systems'];labels.forEach((label,i)=>{text(String(i+1).padStart(2,'0'),75,110+i*80,28,teal);text(label,155,110+i*80,25);});break;
 }
 }
 canvas.dataset.model=id;canvas.dataset.time=t.toFixed(4);
}
