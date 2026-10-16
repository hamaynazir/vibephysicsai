import {evaluate,fermi,nuclearRadius,elementNames} from './math.js';
const fmt=n=>Number(n.toPrecision(4)).toString();
export const moving=new Set(['isomers','beta','scattering','recoil','fermi']);
export function draw(canvas,id,s,t){
 const W=760,H=440,pixel=Math.min(devicePixelRatio||1,2),ctx=canvas.getContext('2d');canvas.width=W*pixel;canvas.height=H*pixel;ctx.scale(pixel,pixel);const dark=document.documentElement.dataset.theme==='dark',ink=dark?'#e4ecf2':'#243744',muted=dark?'#adbec9':'#687d89',bg=dark?'#1e2833':'#f7f9fa',teal=dark?'#60d5cf':'#07888c',purple=dark?'#bb9ced':'#8862bd',red=dark?'#ef9f9b':'#c96367';ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);const r=evaluate(id,s);
 const text=(v,x,y,size=17,color=ink)=>{ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.fillText(v,x,y);};
 const line=(a,b,c,d,color=muted,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();};
 const dot=(x,y,color=teal,radius=7)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();};
 const circle=(x,y,radius,color=teal)=>{ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.stroke();};
 text('ILLUSTRATIVE MODEL · NOT A MEASURED NUCLEUS',24,29,12,muted);
 const plot=(points,xLabel,yLabel,marker=null,fillFrom=null)=>{
  const x0=82,y0=353,w=600,h=215,xmin=Math.min(...points.map(p=>p[0])),xmax=Math.max(...points.map(p=>p[0])),ymax=Math.max(...points.map(p=>p[1]),1e-10),px=x=>x0+(x-xmin)/(xmax-xmin)*w,py=y=>y0-y/ymax*h;
  line(x0,y0,x0+w,y0,muted,1);line(x0,y0,x0,y0-h,muted,1);text(yLabel,x0,110,15);text(xLabel,x0+170,y0+55,15);text(fmt(xmin),x0,y0+23,13,muted);text(fmt(xmax),x0+w-45,y0+23,13,muted);text(fmt(ymax),15,y0-h+4,13,muted);
  if(fillFrom!==null){ctx.fillStyle=dark?'#503d69':'#e7ddf3';ctx.beginPath();ctx.moveTo(px(fillFrom),y0);points.filter(p=>p[0]>=fillFrom).forEach(p=>ctx.lineTo(px(p[0]),py(p[1])));ctx.lineTo(px(xmax),y0);ctx.closePath();ctx.fill();}
  ctx.strokeStyle=teal;ctx.lineWidth=2;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(px(x),py(y)):ctx.moveTo(px(x),py(y)));ctx.stroke();if(marker)dot(px(marker[0]),py(marker[1]),purple,6);return {px,py,y0};
 };
 const sample=(lo,hi,f,n=200)=>Array.from({length:n},(_,i)=>{const x=lo+(hi-lo)*i/(n-1);return [x,f(x)]});
 switch(id){
 case 'overview':case 'nuclides':{
  const z=id==='overview'?6:s.Z,n=id==='overview'?6:s.N,A=z+n;for(let i=0;i<A;i++){const angle=i*2.39996323,rad=105*Math.sqrt((i+.5)/A);dot(250+rad*Math.cos(angle),220+rad*Math.sin(angle),i<z?red:teal,12);}text(elementNames[z]||'X',483,163,56);text(String(A),440,131,25);text(String(z),440,172,25);text(`Z = ${z} protons`,440,217,20,red);text(`N = ${n} neutrons`,440,252,20,teal);text(`A = ${A} nucleons`,440,287,20);text('Dots illustrate counts, not fixed nucleon positions or sizes.',70,387,15,muted);break;
 }
 case 'relations':{
  const x0=120,y0=350,cell=22;for(let z=0;z<=10;z++)for(let n=0;n<=20;n++){const x=x0+n*cell,y=y0-z*cell;ctx.strokeStyle=dark?'#394754':'#dce4e8';ctx.strokeRect(x,y-cell,cell,cell);}line(x0,y0,x0+460,y0);line(x0,y0,x0,y0-250);text('Neutron count N →',270,405,18);text('Proton Z ↑',35,80,18);const n0=Math.max(0,Math.min(s.N,s.N2)-5),z0=Math.max(0,Math.min(s.Z,s.Z2)-2);text(`Local chart: N starts at ${n0}; Z starts at ${z0}`,120,77,14,muted);for(const [z,n,color,label] of [[s.Z,s.N,teal,'1'],[s.Z2,s.N2,purple,'2']]){const dx=n-n0,dz=z-z0;if(dx<=20&&dz<=10){dot(x0+dx*cell+11,y0-dz*cell-11,color,10);text(label,x0+dx*cell+6,y0-dz*cell-6,13,'#fff');}else text('Second point outside local chart',130,115,14,purple);}text(`1: Z=${s.Z}, N=${s.N} · 2: Z=${s.Z2}, N=${s.N2}`,120,98,14);break;
 }
 case 'isomers':{
  const base=325,excited=base-s.excitation*.4;line(170,base,590,base,teal,3);line(170,excited,590,excited,purple,3);text('Ground state · same A and Z',185,base+35,20,teal);text(`Excited state · E* = ${s.excitation} keV`,185,excited-22,20,purple);line(380,base,380,excited,muted,1);dot(380,base+(excited-base)*(1-Math.cos(t))/2,purple,9);text('Moving marker compares levels; no decay lifetime is simulated.',80,400,15,muted);break;
 }
 case 'mass':{
  text(`${s.mass} u`,65,140,42,teal);text(`× ${'931.49410372'} MeV/u`,65,200,24);text('→',400,175,42,muted);text(`${fmt(r.MeV)} MeV`,470,160,29,purple);text('Rest energy mc²',470,200,20,muted);text(`${fmt(r.kg)} kg`,65,280,27);text('The same mass, expressed in different units.',65,355,20,muted);break;
 }
 case 'binding':{
  const y=145;line(90,y,670,y,muted,3);line(90,315,670,315,teal,3);text('Two H atoms + two neutrons, separated',105,y-25,22);text('He-4 atom (electron rest masses cancel approximately)',95,350,19,teal);line(380,y+10,380,305,purple,3);text(`B ≈ ${fmt(r.energy)} MeV`,405,230,24,purple);text(`Binding defect = ${fmt(r.defect)} u`,95,395,17);break;
 }
 case 'beta':{
  text(`Parent: Z=${s.Z}, N=${s.N} → Daughter: Z=${s.Z+1}, N=${s.N-1} + e⁻ + ν̄e`,45,75,20);const points=sample(0,3000,x=>Math.exp(-x/878.4));plot(points,'Free-neutron time (s)','Expected free-neutron survival fraction',[s.seconds,r.survival]);const frac=(t*.1)%1;dot(83+600*frac,353-Math.exp(-3000*frac/878.4)*215,purple,5);text('Purple guide scans a free-neutron curve; no bound-nucleus lifetime inferred.',65,431,13,muted);break;
 }
 case 'scattering':case 'recoil':{
  text(`Turning distance D = ${fmt(r.distance)} fm · Ecm = ${fmt(r.ecm)} MeV`,65,73,21,teal);const d=r.distance,points=sample(d,Math.max(d*4,d+20),x=>1.43996455*s.z1*s.z2/x);const g=plot(points,'Relative separation r (fm)','Coulomb potential energy (MeV)',[d,r.ecm]);const x=d+(points.at(-1)[0]-d)*(1+Math.cos(t))/2;dot(g.px(x),g.py(1.43996455*s.z1*s.z2/x),purple,8);text('Head-on relative separation · moving marker is schematic, not a timed trajectory.',45,432,13,muted);break;
 }
 case 'radius':{
  const rr=r.radius*9;circle(220,225,rr,teal);line(220,225,220+rr,225,purple,2);dot(220,225,purple,4);text(`R = ${fmt(r.radius)} fm`,395,190,28,teal);text(`A = ${s.A}`,395,235,24);text(`n = ${fmt(r.number)} fm⁻³`,395,280,23);text('Equivalent sharp sphere · fixed spatial display scale',90,382,17,muted);break;
 }
 case 'charge':{
  circle(250,210,80,red);text(`+${s.Z}e`,190,225,42,red);text('NUCLEUS',185,320,20,muted);text(`${s.electrons} atomic electrons`,405,170,25,teal);text(`Net atom/ion: ${s.Z-s.electrons}e`,405,230,25,purple);text('Electron count does not change nuclear Z.',100,390,19,muted);break;
 }
 case 'fermi':{
  text(`R = ${fmt(r.R)} fm · 90–10% skin = ${fmt(r.skin)} fm`,80,74,22,teal);const end=r.R+6*s.diffuseness,g=plot(sample(0,end,x=>fermi(x,r.R,s.diffuseness,s.rho)),'Radius r (fm)','Nucleon density (fm⁻³)',[r.R,s.rho/2]);const rr=end*(t*.1%1);dot(g.px(rr),g.py(fermi(rr,r.R,s.diffuseness,s.rho)),purple,5);break;
 }
 case 'particles':{
  const items=[['Electron · lepton',.510999,teal],['Muon · lepton',105.658,purple],['Charged pion · meson',139.570,red],['Proton · baryon',938.272,teal]];items.forEach(([label,value,color],i)=>{const y=112+i*72;text(label,30,y,19);line(300,y-7,300+value/938.272*310,y-7,color,10);text(`${value} MeV`,620,y,15,muted);});text('Linear rest-energy comparison · bar length is NOT particle size.',80,423,15,muted);break;
 }
 case 'surface':{
  text(`Core ends at ${fmt(r.lo)} fm · surface ends at ${fmt(r.hi)} fm`,70,74,21,teal);plot(sample(0,r.hi,x=>x<=r.lo?.17:.17*(r.hi-x)/s.width),'Radius r (fm)','Piecewise nucleon density (fm⁻³)',[r.c,.085],r.lo);text('Violet = declining surface region; counting also requires 4πr² weighting.',55,430,14,purple);break;
 }
 }
 canvas.dataset.model=id;canvas.dataset.time=t.toFixed(4);
}
