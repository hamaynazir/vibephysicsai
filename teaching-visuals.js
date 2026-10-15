import {add,sub,mul,norm,unit,dot,cross,fractional,reciprocal} from './crystal-math.js';
import {actualPlanePolygon} from './teaching-math.js';

const f=x=>Math.abs(x)<1e-7?'0':Number(x.toFixed(3)).toString();
export function drawTeaching(model,ctx,colors){
 const {s,basis,world,cartesian,scale}=ctx,t=s.teaching;if(!t)return;
 const zero=world([0,0,0]),gray=document.documentElement.dataset.theme==='light'?'#82786c':'#9aa9bf';
 const cartAxes=(origin=zero)=>{
  [[1,0,0],[0,1,0],[0,0,1]].forEach((axis,i)=>{const end=add(origin,mul(axis,.48));model.arrow(origin,end,colors[i]);model.label(['x · î','y · ĵ','z · k̂'][i],add(end,mul(axis,.09)),colors[i]);});
 };
 if(t.topic==='vectors'){
  const v=fractional(t.vector,basis),end=cartesian(v);cartAxes();
  const path=[[0,0,0],[v[0],0,0],[v[0],v[1],0],v];
  for(let i=0;i<3;i++)if(norm(sub(path[i+1],path[i]))>1e-7){const a=cartesian(path[i]),b=cartesian(path[i+1]);model.arrow(a,b,colors[i]);const labelPos=add(mul(add(a,b),.5),[0,0,.08]);model.label(`${f(v[i])}${['î','ĵ','k̂'][i]}`,labelPos,colors[i]);}
  model.arrow(zero,end,colors[2],{kind:'vector',label:t.vectorName,components:t.originalComponents||v});model.atom(zero,.025,gray);model.label('O',add(zero,[-.09,0,-.07]),gray);model.atom(end,.035,colors[2]);model.label(t.vectorName,add(end,[.05,0,.14]),colors[2]);
 }
 else if(t.topic==='angles'){
  const vectors=t.angleVectors,[i,j]=t.anglePair,u=unit(vectors[i]),v=unit(vectors[j]),theta=Math.acos(Math.min(1,Math.max(-1,dot(u,v))));
  vectors.forEach((b,k)=>{model.arrow(zero,cartesian(b),k===i||k===j?colors[k]:gray);model.label(t.angleNames[k],add(cartesian(mul(b,.72)),[0,0,.08]),colors[k]);});
  let n=unit(sub(v,mul(u,dot(u,v))));const radius=.34*Math.min(...vectors.map(norm))*scale,points=[];
  for(let k=0;k<=36;k++){const angle=theta*k/36;points.push(add(zero,mul(add(mul(u,Math.cos(angle)),mul(n,Math.sin(angle))),radius)));}
  for(let k=1;k<points.length;k++)model.line(points[k-1],points[k],colors[3],1,{kind:'angle',label:({alpha:'α',beta:'β',gamma:'γ'}[t.angle])+' = '+f(theta*180/Math.PI)+'°',text:`The angle is between ${t.angleNames[i]} and ${t.angleNames[j]}. Its cosine is their dot product divided by the product of their lengths.`});
  const mid=add(zero,mul(add(mul(u,Math.cos(theta/2)),mul(n,Math.sin(theta/2))),radius*1.45));model.label(`${{alpha:'α',beta:'β',gamma:'γ'}[t.angle]} ${f(theta*180/Math.PI)}°`,mid,colors[3]);model.label('O',add(zero,[-.08,0,-.08]),gray);
 }
 else if(t.topic==='origin'){
  const O=world(t.origin),A=world(t.A),B=world(t.B);cartAxes(O);model.atom(zero,.035,gray);model.label('O',add(zero,[-.09,0,-.08]),gray);model.atom(O,.045,colors[3]);model.label('O′',add(O,[.08,0,.12]),colors[3]);
  model.atom(A,.05,colors[0]);model.atom(B,.05,colors[1]);model.label('A',add(A,[0,0,.12]),colors[0]);model.label('B',add(B,[0,0,.12]),colors[1]);model.arrow(O,A,colors[0]);model.arrow(O,B,colors[1]);model.arrow(A,B,colors[2]);
 }
 else if(t.topic==='primitive'){
  cartAxes();model.atom(zero,.04,colors[2]);model.label('O',add(zero,[-.1,0,-.08]),gray);
  if(t.step>=1)t.primitiveVectors.forEach((p,i)=>{model.arrow(zero,world(p),colors[2]);model.label('a'+['₁','₂','₃'][i],add(world(p),[0,0,.1]),colors[2]);});
  if(t.step>=2){const corners=Array.from({length:8},(_,i)=>world(fractional([i&1,(i>>1)&1,(i>>2)&1],t.primitiveVectors)));for(let i=0;i<8;i++)for(let j=0;j<3;j++){const k=i^(1<<j);if(k>i)model.line(corners[i],corners[k],colors[2],.9);}}
 }
 else if(t.topic==='planes'){
  const indices=t.indices;if(!indices.some(Boolean))return;
  basis.forEach((b,i)=>{const a=[0,0,0];a[i]=1.2;const neg=[0,0,0];neg[i]=indices[i]<0?-1.2:0;model.line(world(neg),world(a),colors[i],.75);model.label(['a','b','c'][i],world(a),colors[i]);});
  indices.forEach((h,i)=>{if(!h)return;const p=[0,0,0];p[i]=1/h;model.atom(world(p),.04,colors[i]);model.label(`${f(1/h)}${['a','b','c'][i]}`,add(world(p),[0,0,.13]),colors[i]);});
  model.atom(zero,.025,gray);model.label('O',add(zero,[-.09,0,-.07]),gray);
  if(t.step===3){const polygon=actualPlanePolygon(indices);model.polygon(polygon.map(world),colors[1],.24,{kind:'plane',indices:[...indices]});const center=mul(polygon.map(world).reduce(add,[0,0,0]),1/(polygon.length||1)),normal=unit(fractional(indices,reciprocal(basis)));model.arrow(center,add(center,mul(normal,.5)),colors[2]);model.label('normal',add(center,mul(normal,.64)),colors[2]);}
 }
 else if(t.topic==='placement'){
  model.atom(world(t.point),.09*scale,colors[2]);model.label('Your atom',add(world(t.point),[0,0,.16]),colors[2]);
 }
}
