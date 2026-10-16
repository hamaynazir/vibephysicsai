import {evaluate,semiconductor,bragg,families,RYDBERG,C} from './math.js';
const fmt=v=>typeof v==='number'?Number(v.toPrecision(4)).toString():String(v);
export function draw(canvas,exp,s,time,records,step){
 const ctx=canvas.getContext('2d'),W=760,H=420,dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);const dark=document.documentElement.dataset.theme==='dark',ink=dark?'#dce6ed':'#263f49',muted=dark?'#a9bdc9':'#718690',teal=dark?'#62d5cd':'#008e91',purple=dark?'#b9a2fb':'#8a65bc',bg=dark?'#1e2833':'#f7f9fa';ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const line=(x1,y1,x2,y2,color=muted,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
 const text=(str,x,y,size=14,color=ink)=>{ctx.fillStyle=color;ctx.font=`${size}px system-ui`;ctx.fillText(str,x,y);};
 const dot=(x,y,color=teal,r=5)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const box=(str,x,y,w=130,active=false)=>{ctx.fillStyle=bg;ctx.strokeStyle=active?teal:muted;ctx.lineWidth=active?3:1;ctx.beginPath();ctx.roundRect(x,y,w,44,7);ctx.fill();ctx.stroke();text(str,x+10,y+27,13);};
 const packet=(x1,y1,x2,y2,phase=0,color=teal)=>{const f=(time*.28+phase)%1;dot(x1+(x2-x1)*f,y1+(y2-y1)*f,color,5);};
 const result=evaluate(exp.id,s);canvas.dataset.experiment=exp.id;canvas.dataset.time=time.toFixed(4);
 text('SIMULATED TEACHING MODEL · NOT MEASURED DATA',25,27,11,muted);
 const graph=(points,xlabel,ylabel,marker=null)=>{
  const x0=78,y0=352,w=600,h=125,xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(0,...ys),ymax=Math.max(...ys);if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;
  const px=x=>x0+(x-xmin)/(xmax-xmin)*w,py=y=>y0-(y-ymin)/(ymax-ymin)*h;
  line(x0,y0,x0+w,y0,muted,1);line(x0,y0,x0,y0-h,muted,1);text(ylabel,x0,y0-h-15,12);text(xlabel,x0+170,y0+47,12);text(fmt(xmin),x0,y0+18,11,muted);text(fmt(xmax),x0+w-40,y0+18,11,muted);text(fmt(ymax),x0-45,y0-h+5,11,muted);
  ctx.strokeStyle=teal;ctx.lineWidth=2;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(px(x),py(y)):ctx.moveTo(px(x),py(y)));ctx.stroke();
  const p=marker||points[Math.floor((time*.15%1)*(points.length-1))];if(p)dot(px(p[0]),py(p[1]),purple,6);
 };
 const sample=(a,b,f,n=120)=>Array.from({length:n},(_,i)=>{const x=a+(b-a)*i/(n-1);return [x,f(x)]});
 switch(exp.id){
 case 'statistics':{
  box('Source',35,65,130,step===0);box('Detector + gate',270,65,160,step===1);box('Scaler',550,65,150,step===2);line(165,87,270,87);line(430,87,550,87);packet(165,87,270,87);packet(430,87,550,87,.5);text(`Expected μ = ${fmt(result.mu)} per gate`,35,150);text(`${records.length} simulated trials recorded`,400,150);
  const mu=result.mu,span=Math.max(6,Math.ceil(4*Math.sqrt(mu))),lo=Math.max(0,Math.floor(mu-span)),hi=Math.ceil(mu+span),bins=Array.from({length:hi-lo+1},(_,i)=>[lo+i,records.filter(r=>r.count===lo+i).length]);
  // Expected Poisson frequency for n recorded gates, evaluated recursively in log space.
  const n=records.length||100,expected=bins.map(([k])=>{let lf=0;for(let j=2;j<=k;j++)lf+=Math.log(j);return [k,n*Math.exp(-mu+k*Math.log(mu)-lf)]});graph(expected,'Counts per gate N',records.length?'Expected frequency in recorded sample':'Expected frequency for 100 gates');
  if(records.length){const max=Math.max(...expected.map(p=>p[1]),1);bins.forEach(([k,v])=>{const x=78+(k-lo)/(hi-lo)*600;line(x,352,x,352-v/max*125,purple,Math.max(1,520/bins.length));});}break;
 }
 case 'voltage':{
  const labels=['γ → NaI(Tl)','Photocathode','Dynodes','Threshold'];labels.forEach((v,i)=>{box(v,28+i*183,65,150,step===i);if(i<3){line(178+i*183,87,211+i*183,87);packet(178+i*183,87,211+i*183,87,i*.15);}});text(`Gain ×${fmt(result.gain)} · threshold ${fmt(s.threshold)}`,35,155);graph(sample(.8,1,V=>evaluate('voltage',{...s,voltage:V}).source),'High voltage (kV)','Illustrative net rate (s⁻¹)',[s.voltage,result.source]);break;
 }
 case 'calibration':{
  text(`Co-60: 1173 keV at C₁=${s.channel1} · 1332 keV at C₂=${s.channel2}`,35,78);text(`E = ${fmt(result.a)} C + ${fmt(result.b)} keV`,35,113,19,teal);text('Purple marker scans the spectrum; peak locations stay fixed.',35,155,13,muted);
  graph(sample(0,1000,x=>Math.exp(-.5*((x-s.channel1)/s.width)**2)+.8*Math.exp(-.5*((x-s.channel2)/s.width)**2),1000),'Pulse-height channel (arbitrary units)','Relative synthetic counts');break;
 }
 case 'electronics':{
  ['Detector','Preamp','Amplifier','SCA'].forEach((v,i)=>{box(v,30+i*181,60,140,step===i);if(i<3){line(170+i*181,82,211+i*181,82);packet(170+i*181,82,211+i*181,82,i*.2);}});text(`Amplified pulse ${fmt(result.amplitude)} V`,35,146);text(result.accepted?'Accepted → standardized logic pulse':'Rejected → no logic pulse',350,146,15,result.accepted?teal:purple);
  graph(sample(0,12,x=>{const t=(x-time%3+12)%12;if(t<2)return s.amplitude*Math.exp(-t*2);if(t>4&&t<8)return result.amplitude*Math.exp(-.5*((t-6)/.45)**2);if(t>9&&t<10&&result.accepted)return 1;return 0;}),'Illustrative time (not a calibrated scope)','Preamp · shaped analog · unit logic');break;
 }
 case 'dead-time':{
  text(`True combined rate ${s.source1+s.source2} s⁻¹`,35,72);text(`Observed ${fmt(result.both)} s⁻¹`,400,72,18,teal);
  text('Illustrative event timeline · teal accepted, violet missed',35,120,13,muted);
  const arrivals=[.15,.20,.38,.43,.64,.69,.88],window=s.dead/1600;let ready=-1;line(75,170,690,170);arrivals.forEach(a=>{const accepted=a>=ready;if(accepted){ready=a+window;ctx.fillStyle=dark?'#214a4c':'#d7efec';ctx.fillRect(75+a*600,145,window*600,44);}dot(75+a*600,170,accepted?teal:purple,6);});packet(75,137,690,137,0,purple);
  graph(sample(0,2500,n=>n/(1+n*result.tau)),'True rate n (s⁻¹)','Observed rate m (s⁻¹)',[s.source1+s.source2,result.both]);break;
 }
 case 'efficiency':{
  const x=180+s.distance*30;dot(90,100,purple,10);line(x,55,x,145,teal,7);line(90,100,x,55);line(90,100,x,145);packet(90,100,x,75);packet(90,100,x,125,.4);text('Point source',40,157);text('Window · schematic scale',x-90,180);text(`g = ${fmt(result.g*100)}%`,440,72,19,teal);text('Not every incident quantum is counted.',350,118,13,muted);
  graph(sample(1,10,d=>evaluate('efficiency',{...s,distance:d}).recorded),'Source distance (cm)','Expected detected rate (s⁻¹)',[s.distance,result.recorded]);break;
 }
 case 'resistance':{
  box('Current source',30,64,150,step===0);box('Germanium + heater',285,64,190,step===1);box('Voltmeter',570,64,145,step===2);line(180,86,285,86);line(475,86,570,86);packet(180,86,285,86);packet(475,86,570,86,.5);text(`${s.temperature} °C = ${fmt(s.temperature+273.15)} K`,35,156);text(`V = ${fmt(result.V)} V`,425,156,19,teal);
  graph(sample(40,140,t=>semiconductor(t,s.gap,s.current).R),'Temperature (°C)','Resistance (Ω)',[s.temperature,result.R]);break;
 }
 case 'lif':{
  const th=s.theta*Math.PI/180,cx=380,cy=135;line(cx-75*Math.cos(th),cy+75*Math.sin(th),cx+75*Math.cos(th),cy-75*Math.sin(th),purple,4);line(65,cy,cx,cy,teal);const tx=cx+90*Math.cos(2*th),ty=cy-90*Math.sin(2*th);line(cx,cy,tx,ty,teal);packet(65,cy,cx,cy);packet(cx,cy,tx,ty,.5);dot(tx,ty,purple,8);text(`θ = ${fmt(s.theta)}°`,195,65);text(`2θ = ${fmt(result.detector)}°`,490,65);text('Crystal',315,220);text('Detector',tx+8,Math.max(42,ty),13);
  graph(sample(10,60,t=>evaluate('lif',{...s,theta:t}).intensity),'Glancing angle θ (degrees)','Illustrative relative response',[s.theta,result.intensity]);break;
 }
 case 'moseley':{
  box(`Target Z = ${s.atomic}`,65,65,190,step===0);box('Analyzer crystal',315,65,160,step===1);box('Detector',565,65,140,step===2);line(255,87,315,87);line(475,87,565,87);packet(255,87,315,87);packet(475,87,565,87,.5);text(`Approximate Kα energy = ${fmt(result.energy)} keV`,35,162,18,teal);
  graph(sample(19,30,Z=>Math.sqrt(3*C*RYDBERG/4)*(Z-s.screen)),'Atomic number Z','√f (Hz½)',[s.atomic,result.root]);break;
 }
 case 'powder':{
  const cx=210,cy=115;line(30,cy,cx,cy,teal);dot(cx,cy,purple,8);const ang=result.theta*Math.PI/180*2,tx=cx+180*Math.cos(ang),dy=110*Math.sin(ang);line(cx,cy,tx,cy-dy,teal);line(cx,cy,tx,cy+dy,teal);packet(30,cy,cx,cy);packet(cx,cy,tx,cy-dy,.5);text(`(${result.hkl.join(' ')}) · 2θ = ${fmt(result.two)}°`,430,65,18,teal);text('Cone cross-section · not a flat-screen ring',360,176,12,muted);
  const peaks=families.map((h,i)=>({angle:2*bragg(s.wavelength,s.lattice/Math.hypot(...h)),height:1-i*.1}));graph(sample(10,100,x=>peaks.reduce((sum,p)=>sum+p.height*Math.exp(-.5*((x-p.angle)/.5)**2),0),900),'Detector scattering angle 2θ (degrees)','Arbitrary synthetic peak heights');break;
 }
 case 'electron':{
  const cx=410,cy=118,scale=4;for(const [r,color] of [[result.inner,teal],[result.outer,purple]]){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r*scale,0,Math.PI*2);ctx.stroke();const a=time*.8;dot(cx+r*scale*Math.cos(a),cy+r*scale*Math.sin(a),color,4);}text('Screen view',35,62);text('Inner: d = 213 pm',35,103,14,teal);text('Outer: d = 123 pm',35,132,14,purple);text('Moving dots are guides, not trajectories.',35,185,12,muted);
  graph(sample(4,6.5,U=>evaluate('electron',{...s,voltage:U}).inner),'Accelerating voltage (kV)','Inner-ring radius (mm)',[s.voltage,result.inner]);break;
 }
 case 'thermoelectric':{
  box('Hot junctions',45,65,165,step===0);box('142 series couples',290,65,190,step===1);box('Load',580,65,130,step===2);line(210,87,290,87,purple);line(480,87,580,87,teal);if(s.delta>0){packet(210,87,290,87,0,purple);packet(480,87,580,87,.5);}text(`ΔT = ${s.delta} K`,35,162);text(`Voc = ${fmt(result.voc)} V · Vload = ${fmt(result.V)} V`,270,162,17,teal);
  graph(sample(.5,20,R=>evaluate('thermoelectric',{...s,load:R}).power),'Load resistance RL (Ω)','Electrical load power (W)',[s.load,result.power]);break;
 }
 }
}
