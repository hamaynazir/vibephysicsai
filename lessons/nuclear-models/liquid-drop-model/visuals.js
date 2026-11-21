
const W=520,H=285, left=58,right=497,top=35,bottom=230;
export const num=(value,digits=2)=>Number.isFinite(value)?value.toFixed(digits).replace(/^-0(\.0+)?$/, '0$1'):'Unavailable';
const signed=(value,digits=2)=>value>0?'+'+num(value,digits):num(value,digits);
const line=(x,y,u,v,css='rule',attributes='')=>`<line x1="${x}" y1="${y}" x2="${u}" y2="${v}" class="${css}" ${attributes}/>`;
const text=(x,y,label,css='',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${css}">${label}</text>`;
const dot=(x,y,r,css='point',data='')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${css}" ${data}/>`;
const titledDot=(x,y,r,css,attributes,title)=>`<circle cx="${x}" cy="${y}" r="${r}" class="${css}" ${attributes}><title>${title}</title></circle>`;
const box=(x,y,w,h,css)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${css}"/>`;
const path=(d,css)=>`<path d="${d}" class="${css}"/>`;
const svg=(description,body,plot=false)=>`<svg viewBox="0 0 ${W} ${H}" role="${plot?'group':'img'}" aria-label="${description}" ${plot?'tabindex="0" class="selectable-chart"':''}>${body}</svg>`;
const key=row=>`data-nuclide="${row.A},${row.Z}"`;
const label=row=>row.symbol==='n'?'Neutron':`${row.symbol}–${row.A}`;
const ticks=(lo,hi,n)=>Array.from({length:n+1},(_,i)=>lo+(hi-lo)*i/n);
const motion=(id,from,delay=0,duration=550)=>`data-motion="${id}" data-from="${Object.entries(from).map(([key,value])=>key+':'+value).join(';')}" data-delay="${delay}" data-duration="${duration}"`;
const reveal=(id,content,delay=180)=>`<g opacity="1" ${motion(id,{opacity:0},delay,380)}>${content}</g>`;
const movingMarker=(id,x,y,r,css='selection-ring',attributes='')=>dot(x,y,r,css,`${motion(id,{r:0,cx:x,cy:y},0,420)} ${attributes}`);

function chart(xmin,xmax,ymin,ymax,xTitle,yTitle,xticks,yticks) {
  const x=n=>left+(n-xmin)*(right-left)/(xmax-xmin);
  const y=n=>bottom-(n-ymin)*(bottom-top)/(ymax-ymin);
  const grid=yticks.map(n=>line(left,y(n),right,y(n),'grid')+text(left-8,y(n)+5,num(n,Number.isInteger(n)?0:1),'small','end')).join('');
  const axis=line(left,top,left,bottom)+line(left,bottom,right,bottom)+grid+
    xticks.map(n=>line(x(n),bottom,x(n),bottom+5)+text(x(n),bottom+20,num(n,0),'small')).join('')+
    text(left,19,yTitle,'muted','start')+text((left+right)/2,273,xTitle,'muted');
  return {x,y,axis};
}
function arrow(x,y1,y2,css='strong',id='',delay=110,duration=620) {
  const stroke=id?motion(id+'-stem',{x1:x,x2:x,y1,y2:y1},delay,duration):'';
  const cap=id?motion(id+'-cap',{x1:x-5,x2:x+5,y1,y2:y1},delay,duration):'';
  return line(x,y1,x,y2,css,stroke)+line(x-5,y1,x+5,y1,css)+line(x-5,y2,x+5,y2,css,cap);
}
function composition(cx,cy,Z,N,max=24,id='',spacing=10) {
  const count=Math.min(max,Z+N), p=Math.round(Z/(Z+N)*count);
  return Array.from({length:count},(_,i)=>{
    const angle=i*2.399963, r=spacing*Math.sqrt(i);
    const proton=Math.floor((i+1)*p/count)>Math.floor(i*p/count);
    const x=cx+r*Math.cos(angle),y=cy+r*Math.sin(angle);
    const attributes=id?motion(id+'-'+i+'-'+Number(proton),{cx:cx+1.65*(x-cx),cy:cy+.48*(y-cy),r:0},i*17,480):'';
    return dot(x,y,6,proton?'proton':'neutron',attributes);
  }).join('');
}
let curveBackground;
export function ledger(selected,nitrogen,oxygen,state,records) {
  if(state.mode==='curve'){
    const axes=chart(0,300,-1,10,'Mass number A','Binding energy / nucleon (MeV)',[0,50,100,150,200,250,300],[-1,0,2,4,6,8,10]);
    const {x,y}=axes;
    if(!curveBackground) {
      curveBackground=records.filter(r=>!r.extrapolated&&r.A>1&&r.per>=-1&&r.per<=10)
        .map(r=>titledDot(num(x(r.A),2),num(y(r.per),2),1.65,'cloud hit',key(r),`${label(r)} · ${num(r.per,3)} MeV/nucleon · AME2020`)).join('');
    }
    const zones=state.focus==='regions'?
      [[5,25,'Light'],[48,73,'Iron–nickel'],[175,240,'Heavy']].map(([a,b,name])=>box(x(a),top,x(b)-x(a),bottom-top,'band')+text((x(a)+x(b))/2,top+24,name,'small')).join(''):'';
    const active=selected&&selected.per>=-1&&selected.A<=300
      ?movingMarker('curve-selection',x(selected.A),y(selected.per),6,'selected hit',key(selected)): '';
    return svg('AME2020 binding curve. Drag or use arrow keys to select a measured-mass nuclide.',(zones?reveal('binding-regions',zones):'')+axes.axis+curveBackground+active,true);
  }
  const samples=state.mode==='mirror'?[nitrogen,oxygen]:[selected];
  return svg('Energy ledger showing separated constituents above the bound state',samples.map((s,index)=>{
    if(!s)return text(260,145,'Mass record unavailable','muted');
    const x=samples.length===1?260:135+250*index, width=samples.length===1?300:207;
    const y1=128;
    const span=samples.length===1?86*Math.abs(s.B)/(Math.abs(s.B)+60):
      65*Math.abs(s.B)/Math.max(...samples.filter(Boolean).map(record=>Math.abs(record.B)),1);
    const y2=y1+span*Math.sign(s.B);
    const Z=s.Z,N=s.A-Z, bracket=x+width/2-14;
    const id='ledger-'+index;
    const status=s.B<0?'Selected atomic state':'Bound neutral atom';
    const marks=state.focus==='average'?Array.from({length:Math.min(s.A-1,20)},(_,i)=>{
      const y=y1+(y2-y1)*(i+1)/Math.min(s.A,21);
      return line(bracket-4,y,bracket+4,y,'accent');
    }).join(''):'';
    return text(x,29,`${label(s)} · ${Z} p, ${N} n`,'heading')+
      composition(x,71,Z,N,18,id)+
      line(x-width/2,y1,bracket-12,y1,'strong')+
      line(x-width/2,y2,bracket-12,y2,'accent',motion(id+'-level',{y1,y2:y1},90,640))+
      text(x-width/2+6,y1-8,state.focus==='electron'?'Hydrogen atoms + neutrons':'Separated constituents','small','start')+
      reveal(id+'-bound',text(x-width/2+6,y2+19,status,'small','start'),450)+
      arrow(bracket,y1,y2,state.focus==='gap'?'accent':'strong',id+'-gap')+
      (marks?reveal(id+'-shares',marks,250):'')+
      reveal(id+'-value',text(bracket-12,(y1+y2)/2+5,`B = ${num(s.B)} MeV`,'energy','end'),420)+
      reveal(id+'-average',text(x,249,`B/A = ${num(s.per,3)} MeV/nucleon`,state.focus==='average'?'energy emphasis':'energy'),470);
  }).join(''));
}

export function removal(state,result,chain,particleLabel) {
  if(state.mode==='chain'){
    const usable=chain.filter(item=>item.result.available);
    if(!usable.length)return svg('No thresholds in this chain',text(260,142,'No thresholds in this chain','muted'));
    const domain=item=>state.kind==='p'?item.Z:item.A-item.Z;
    const min=Math.min(...usable.map(domain)), max=Math.max(...usable.map(domain));
    const ymin=Math.floor(Math.min(0,...usable.map(item=>item.result.Q))/5)*5;
    const ymax=Math.ceil(Math.max(1,...usable.map(item=>item.result.Q))/5)*5;
    const {x,y,axis}=chart(min-1,max+1,ymin,ymax,state.kind==='p'?'Proton number Z':'Neutron number N','Separation energy (MeV)',
      [...new Set([min,Math.round((min+max)/2),max])],ticks(ymin,ymax,4));
    const active=usable.find(item=>item.A===state.A&&item.Z===state.Z);
    return svg('Separation thresholds along the selected chain. Use arrow keys to change nuclide.',axis+line(left,y(0),right,y(0),'zero')+
      usable.map(item=>{
        const X=x(domain(item)), Y=y(item.result.Q), css=domain(item)%2?'odd':'even';
        return line(X,y(0),X,Y,'grid')+titledDot(X,Y,item.A===state.A&&item.Z===state.Z?7:4,
          (item.A===state.A&&item.Z===state.Z?'selected':css)+' hit',key(item),
          `${item.symbol?label(item):'A = '+item.A+', Z = '+item.Z} · ${signed(item.result.Q,3)} MeV · ${css} ${state.kind==='p'?'Z':'N'}${item.result.extrapolated?' · extrapolated':''}`);
      }).join('')+(active?movingMarker('chain-selection',x(domain(active)),y(active.result.Q),9):''),true);
  }
  const [daughterA,daughterZ]=result.daughter;
  const q=result.available?result.Q:0;
  const magnitude=Math.abs(q);
  const range=magnitude>0&&magnitude<1?1:Math.max(20,Math.ceil(magnitude/10)*10);
  const y0=209,y1=y0-37*q/range;
  const parent=composition(112,95,state.Z,state.A-state.Z);
  const daughter=result.available&&state.removed?composition(395,95,daughterZ,daughterA-daughterZ):'';
  return svg('Parent, outgoing particle, daughter and signed separation threshold',text(112,30,'Parent','heading')+
    text(395,30,'Final state','heading')+
    box(36,44,152,94,'outline')+box(320,44,154,94,state.removed?'band':'outline')+
    parent+(daughter?reveal('daughter',daughter,390):'')+line(191,91,324,91,'grid')+
    `<g data-token="true" class="drag-token" aria-hidden="true" transform="translate(${state.removed?128:0} 0)" ${motion('outgoing-token',{translate:0},0,570)}>${dot(213,91,16,'selected')}${text(213,96,state.kind==='alpha'?'α':state.kind,'on-accent')}</g>`+
    text(112,155,`A = ${state.A}, Z = ${state.Z}`,'small')+
    text(395,155,result.available?`Daughter A = ${daughterA}, Z = ${daughterZ}`:'Unavailable','small')+
    line(72,y0,196,y0,'strong')+text(72,y0+19,'Initial energy','small','start')+(state.removed&&result.available?
    line(315,y1,468,y1,'accent',motion('daughter-energy',{y1:y0,y2:y0},330,580))+
    reveal('daughter-energy-label',text(468,y1+17,'Final energy','small','end'),650)+
    line(64,172,64,246,'rule')+line(60,172,68,172)+line(60,209,68,209)+line(60,246,68,246)+
    text(55,176,'+'+range,'tiny','end')+text(55,213,'0','tiny','end')+text(55,250,'−'+range,'tiny','end')+
    text(55,161,'MeV','tiny','end')+line(196,y0,258,y0,'grid')+
    line(258,y1,315,y1,'grid',motion('final-guide',{y1:y0,y2:y0},330,580))+arrow(258,y0,y1,'strong','removal-gap',330,580)+
    reveal('threshold-value',text(261,269,`S = ${signed(result.Q)} MeV · ${particleLabel}`,'energy'),620):
    text(260,254,'Reveal the final-state energy','muted')));
}
const termClass=['accent','surface','coulomb','asymmetry','pairing'];
const names=['Volume','Surface','Coulomb','Asymmetry','Pairing'];
const shells=[2,8,20,28,50,82,126];

function waterfall(model,state) {
  const entries=Object.entries(model.terms), lo=Math.min(0,model.B-model.terms.pairing,model.B), hi=model.terms.volume;
  const x=value=>252+(value-lo)/(hi-lo)*243;
  let sum=0;
  return line(x(0),52,x(0),234,'grid')+text(252,32,'Binding-energy contributions','heading','start')+
    entries.map(([key,value],i)=>{
      const start=sum,end=start+value;sum=end;
      const y=65+34*i, focus=state.focus===key;
      return line(x(start),y+4,x(end),y+4,`term-bar ${termClass[i]} ${focus?'focus-term':''}`,
        motion('term-'+key,{x1:x(start),x2:x(start)},i*95,470))+
        (i<4?reveal('term-link-'+key,line(x(end),y+5,x(end),y+38,'grid'),i*95+290):'')+
        text(242,y+10,names[i],'small','end');
    }).join('')+reveal('term-sum',text(252,251,`Sum ${num(model.B,1)} MeV`,'energy','start'),570)+
    (state.omit?text(252,273,`Without ${state.omit}: ${num(model.B-model.terms[state.omit],1)} MeV`,'small','start'):'');
}
export function dropScene(model,state,data) {
  const {A,Z,N,R}=model;
  if(state.mode==='chart'||state.mode==='residual'){
    const residual=state.mode==='residual';
    const {x,y,axis}=chart(0,180,0,120,'Neutron number N','Proton number Z',[0,30,60,90,120,150,180],[0,30,60,90,120]);
    const points=residual?data.records.filter(r=>!r.extrapolated&&r.A>=5&&r.A<=250):
      data.records.filter(r=>r.property==='stable'&&(state.parity==='all'||(r.Z%2)+','+((r.A-r.Z)%2)===state.parity));
    const guides=residual?shells.filter(n=>n<=180).map(n=>line(x(n),top,x(n),bottom,'shell')+text(x(n),top-5,n,'tiny')).join('')+
      shells.filter(n=>n<=120).map(n=>line(left,y(n),right,y(n),'shell')).join(''):
      line(x(0),y(0),x(120),y(120),'accent')+text(x(108),y(108)+15,'N = Z','small','end');
    const cloud=points.map(r=>{
      const delta=residual?r.B-data.baseline.get(r.key):0;
      const css=residual?(delta>=0?'even':'odd'):'even';
      return titledDot(num(x(r.A-r.Z),2),num(y(r.Z),2),residual?Math.min(3.6,1+Math.abs(delta)*.17):3.1,css+' hit',key(r),
        `${label(r)} · N = ${r.A-r.Z}, Z = ${r.Z} · ${residual?signed(delta,3)+' MeV residual':'NUBASE2020 stable'}`);
    }).join('');
    const active=N<=180&&Z<=120?movingMarker('nuclide-selection',x(N),y(Z),6):'';
    return svg(residual?'Evaluated-minus-model binding residuals, with shell-number guides':'NUBASE stable ground states against the N equals Z diagonal',axis+guides+cloud+active,true);
  }
  if(state.mode==='charge'){
    const steps=state.shells??3, fraction=steps/5;
    const radius=i=>87*i/5;
    const rings=Array.from({length:steps},(_,i)=>steps-i).map(i=>
      dot(153,135,radius(i),i===steps?'ring active':'ring',motion('charge-shell-'+i,{r:radius(i-1)},(i-1)*135,340))).join('');
    const U=3/5*1.43996455*Z*Z/R;
    return svg('Uniform sphere assembled in concentric charged shells',text(153,27,'Uniform charge assembly','heading')+rings+
      line(153,135,153+radius(steps),135,'strong',motion('charge-radius',{x2:153},120,600))+
      reveal('charge-label',text(153,258,`Filled radius ${Math.round(fraction*100)}% of R`,'small'),360)+
      text(300,90,`Continuum Z²/R`,'heading','start')+text(300,117,`${num(U*fraction**5)} MeV assembled`,'energy','start')+
      text(300,169,'Distinct proton pairs','heading','start')+text(300,195,`${num(-model.terms.coulomb)} MeV penalty`,'energy','start'));
  }
  if(state.mode==='filling'){
    const levels=7, first=Math.max(0,Math.ceil(Math.max(Z,N)/2)-levels);
    const fill=(x,count,css)=>{
      return Array.from({length:levels},(_,i)=>{
        const y=201-21*i;
        return line(x-60,y,x+60,y,'grid')+
          [0,1].map(slot=>{
            const n=2*(first+i)+slot, cx=x+(slot?21:-21);
            return count>n?dot(cx,y-5,5,css,motion('level-'+css+'-'+n,{r:0,cy:y+7},i*50,420)):'';
          }).join('');
      }).join('');
    };
    const highest=N>0?Math.ceil(N/2)-1-first:-1;
    const shell=state.focus==='asymmetry'&&highest>=0?movingMarker('highest-neutron',N%2?361:403,196-21*highest,9):'';
    return svg('Proton and neutron occupation ladders with schematic level spacing',text(138,27,`Protons · ${Z}`,'heading')+text(382,27,`Neutrons · ${N}`,'heading')+
      (state.well?path('M57 60 L80 104 L80 217 L196 217 L196 101 L219 60 M301 70 L322 99 L322 237 L442 237 L442 99 L462 70','well'):'')+
      fill(138,Z,'proton')+fill(382,N,'neutron')+shell+
      (first?text(260,245,`${first} lower levels per species fall below the display`,'small'):'')+
      text(260,262,`Asymmetry contribution ${signed(model.terms.asymmetry)} MeV`,'energy'));
  }
  const extent=13*Math.cbrt(A);
  const boundary=state.focus==='surface'?'ring active':'ring';
  const feature=state.focus==='volume'?line(95,135,116,123,'accent')+line(95,135,112,153,'accent')+line(95,135,79,148,'accent'):
    state.focus==='coulomb'?line(61,134,141,135,'odd'):'';
  const pairing=state.focus==='pairing'?text(104,216,state.Z%2&&N%2?'Two unpaired':A%2?'One unpaired':'Like-particle pairs','small'):'';
  return svg('Drop cross-section and five signed binding contributions',text(103,30,`A = ${A} · Z = ${Z} · N = ${N}`,'heading')+
    dot(103,131,extent,boundary,motion('outline',{r:0},0,660))+
    composition(103,131,Z,N,30,'drop',Math.min(10,extent*.78/Math.sqrt(Math.min(30,A))))+
    (feature?reveal('focus-'+state.focus,feature,350):'')+(pairing?reveal('pairing',pairing,370):'')+
    text(103,247,`R = ${num(R)} fm`,'energy')+waterfall(model,state));
}

export function parabolaScene(state,poly,view,modelPoints,evalPoints,active,transitionPoint) {
  const {lo,hi,ymin,ymax}=view;
  const {x,y,axis}=chart(lo,hi,ymin,ymax,'Proton number Z at fixed A','Relative mass energy (MeV)',[lo,Math.round((lo+hi)/2),hi],ticks(ymin,ymax,4));
  const curve=ticks(lo,hi,100).map((z,i)=>`${i?'L':'M'}${num(x(z),2)},${num(y(poly.smooth(z)-poly.minimum),2)}`).join('');
  const vx=x(poly.vertex), vertex=poly.vertex>=lo&&poly.vertex<=hi?line(vx,top,vx,bottom,'shell')+
    text(vx+5,top+16,'Smooth vertex','small','start')+(state.focus==='vertex'&&y(0)>top&&y(0)<bottom?line(Math.max(left,vx-39),y(0),Math.min(right,vx+39),y(0),'accent'):''):'';
  const marker=(r,value,css)=>titledDot(x(r.Z),y(value),4,css+' hit',key(r),
    `${r.symbol?label(r):'Z = '+r.Z} · ${num(value,3)} MeV relative · ${r.symbol?(r.extrapolated?'AME2020 extrapolated':'AME2020 evaluated'):'SEMF'}`);
  const highlight=active?movingMarker('isobar-selection',x(active.Z),y(active.e),8):'';
  const adjacent=state.focus==='adjacent'&&active&&active.Z<hi
    ?line(x(active.Z),82,x(active.Z+1),82,'accent',motion('adjacent-guide',{x2:x(active.Z)},320,530))+
      reveal('adjacent-label',text((x(active.Z)+x(active.Z+1))/2,73,'ΔZ = +1','small'),610):'';
  let bracket='';
  if(state.mode==='transitions'&&active&&transitionPoint){
    const a=x(active.Z), b=x(transitionPoint.Z), start=y(active.e), end=y(transitionPoint.e);
    if(state.channel==='double'){
      const arc=`M${a} ${start} Q${(a+b)/2} ${Math.min(start,end)-22} ${b} ${end}`;
      bracket=`<path d="${arc}" class="double-arrow" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" ${motion('double-ec-arc',{ 'stroke-dashoffset':1},80,630)}/>`+
        reveal('double-ec-tip',path(`M${b+8} ${end-3} L${b} ${end} L${b+4} ${end-8}`,'double-arrow'),570);
    } else {
      bracket=line(a,start,b,start,'shell',motion('ruler-guide',{x1:a,x2:a,y1:start,y2:start},100,400))+
        arrow(b+6,start,end,'accent','q-ruler',120,590);
      if(state.channel==='plus'){
        const limit=y(transitionPoint.e+view.positronThreshold);
        bracket+=reveal('positron-threshold',line(b-8,limit,b+34,limit,'double-arrow')+text(b+38,limit+18,'+1.022 MeV','tiny','start'),500);
      }
    }
  }
  const branches=state.mode==='branches'&&state.A%2===0&&state.source!=='eval'?
    [-1,1].map(sign=>path(ticks(lo,hi,100).map((z,i)=>`${i?'L':'M'}${num(x(z),2)},${num(y(poly.smooth(z)-poly.minimum+sign*12/Math.sqrt(state.A)),2)}`).join(''),sign>0?'odd curve':'even curve')).join(''):'';
  const modelCurves=state.source!=='eval'?`<clipPath id="isobar-curve-reveal"><rect x="${left-7}" y="${top-8}" width="${right-left+14}" height="${bottom-top+16}" ${motion('curve-reveal',{width:0},0,850)}/></clipPath>
    <g clip-path="url(#isobar-curve-reveal)" pointer-events="none">${path(curve,'guide-curve')+branches}</g>`:'';
  return svg('Fixed-A mass energy, with the model vertex and selectable integer-Z points. Drag or use arrow keys to move between points.',axis+
    `<clipPath id="drop-plot-clip"><rect x="${left-7}" y="${top-8}" width="${right-left+14}" height="${bottom-top+16}"/></clipPath><g clip-path="url(#drop-plot-clip)">`+
    modelCurves+vertex+adjacent+
    modelPoints.map(r=>marker(r,r.e,'model-dot')).join('')+evalPoints.map(r=>marker(r,r.e,r.extrapolated?'odd':'even')).join('')+
    bracket+highlight+'</g>',true);
}
