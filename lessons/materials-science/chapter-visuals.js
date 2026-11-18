import {formatValue} from './chapter-models.js';

const W=640, H=342;
const esc=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const n=value=>Math.round(100*value)/100;
const palette=['var(--mat-teal)','var(--mat-violet)','var(--mat-orange)'];
const text=(x,y,value,css='caption',align='start')=>'<text x="'+n(x)+'" y="'+n(y)+'" class="'+css+'" text-anchor="'+align+'">'+esc(value)+'</text>';
const line=(a,b,css='bond',extra='')=>'<line x1="'+n(a[0])+'" y1="'+n(a[1])+'" x2="'+n(b[0])+'" y2="'+n(b[1])+'" class="'+css+'" '+extra+'/>';
const circle=(x,y,r,css='host')=>'<circle cx="'+n(x)+'" cy="'+n(y)+'" r="'+n(r)+'" class="'+css+'"/>';
const points=arr=>arr.map(point=>point.map(n).join(',')).join(' ');
const polygon=(arr,css)=>'<polygon points="'+points(arr)+'" class="'+css+'"/>';
const rectangle=(x,y,w,h,css)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" class="'+css+'"/>';

function chart(d) {
  const [xm,ym]=d.domain, left=79, top=58, right=609, bottom=278;
  const X=v=>left+(right-left)*v/xm, Y=v=>bottom-(bottom-top)*v/ym;
  let svg='';
  for(let i=0;i<=5;i++){
    const x=xm*i/5, y=ym*i/5;
    svg+=line([X(x),top],[X(x),bottom],'grid')+line([left,Y(y)],[right,Y(y)],'grid');
    svg+=text(X(x),bottom+20,formatValue(x,3),'tick','middle')+text(left-9,Y(y)+4,formatValue(y,1),'tick','end');
  }
  svg+=line([left,top],[left,bottom],'axis')+line([left,bottom],[right,bottom],'axis');
  svg+=text((left+right)/2,326,d.xLabel,'caption','middle');
  svg+='<g transform="translate(22 169) rotate(-90)">'+text(0,0,d.yLabel,'caption','middle')+'</g>';
  const path=coordinates=>coordinates.map(([x,y])=>[X(x),Y(y)]);
  const first=d.series[0].points;
  const shaded=d.shade?polygon(path([[first[0][0],0],...first,[first.at(-1)[0],0]]),'area'):'';
  const curves=d.series.map(({points: coordinates,color,dashed})=>'<polyline points="'+points(path(coordinates))+'" fill="none" stroke="'+palette[color]+'" stroke-width="3.5" stroke-linejoin="round" '+(dashed?'stroke-dasharray="7 6"':'')+'/>').join('');
  const mark=d.marker?circle(X(d.marker[0]),Y(d.marker[1]),6,'point'):'';
  return svg+'<defs><clipPath id="chapter-chart-clip"><rect x="'+left+'" y="'+top+'" width="'+(right-left)+'" height="'+(bottom-top)+'"/></clipPath></defs><g clip-path="url(#chapter-chart-clip)">'+shaded+curves+mark+'</g>';
}

function bars(d){
  return d.bars.map(([name,value],i)=>{
    const y=100+i*92, width=490*value/d.maximum;
    return text(62,y-12,name,'caption')+text(560,y-12,formatValue(value,2)+d.suffix,'reading','end')+
      rectangle(62,y,498,25,'track')+'<rect x="62" y="'+y+'" width="'+width+'" height="25" rx="6" fill="'+palette[i]+'"/>';
  }).join('');
}

function flow(d){
  let svg='';
  d.nodes.forEach(([role,value],i)=>{
    const x=45+i*202,y=104;
    svg+=rectangle(x,y,148,111,'card')+text(x+74,y+30,role,'reading','middle');
    const words=value.split(' ');
    const rows=[];
    let row='';
    for(const word of words){
      if(row&&(row+' '+word).length>17){rows.push(row);row=word;}
      else row+=(row?' ':'')+word;
    }
    rows.push(row);
    rows.forEach((phrase,j)=>{svg+=text(x+74,y+60+j*18,phrase,'caption','middle');});
    if(i<d.nodes.length-1)svg+=arrow([x+158,y+56],[x+193,y+56]);
  });
  return svg;
}

function lattice(d){
  let svg='';
  const replacements=Array.from({length:d.count},(_,i)=>(i*17+5)%48);
  for(let i=0;i<48;i++){
    const col=i%8,row=Math.floor(i/8),x=115+col*58,y=74+row*38;
    if(col<7)svg+=line([x,y],[x+58,y],'grid');
    if(row<5)svg+=line([x,y],[x,y+38],'grid');
    const isSolute=d.type==='Ordered'?col%2===0&&row%2===0:d.type!=='Interstitial'&&replacements.includes(i);
    svg+=circle(x,y,12,isSolute?'solute':'host');
  }
  if(d.type==='Interstitial')for(let i=0;i<d.count;i++){
    const cell=(i*13+4)%35;
    svg+=circle(144+(cell%7)*58,93+Math.floor(cell/7)*38,7,'solute');
  }
  return svg+text(120,313,'Teal: host sites','caption')+text(375,313,'Violet: second species','caption');
}

function charges(d){
  let svg='';
  for(const [count,sign,charge,x,css] of [[d.cations,'+',d.plus,180,'solute'],[d.anions,'−',d.minus,460,'host']]){
    for(let i=0;i<count;i++){
      const y=170+(i-(count-1)/2)*57;
      svg+=circle(x,y,23,css)+text(x,y+5,sign+charge,'atom-label','middle');
    }
  }
  return svg+text(180,310,'Cations','caption','middle')+text(460,310,'Anions','caption','middle');
}

const axial=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const tetra=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]];
const cube=tetra.concat(tetra.map(p=>p.map(x=>-x)));
const cubocta=[...cube.slice(0,4).flatMap(([x,y,z])=>[[x,y,0],[0,y,z],[x,0,z]])];
function view(p) {
  const scale=96/Math.hypot(...p);
  const [x,y,z]=p.map(value=>value*scale);
  return [320+.91*x-.41*y,174+.20*x+.42*y-.88*z];
}
function ions(d){
  const coords={
    2:[[1,0,0],[-1,0,0]],3:[[1,0,0],[-.5,.866,0],[-.5,-.866,0]],
    4:tetra,6:axial,8:cube,12:cubocta
  }[d.count];
  const neighbors=coords.map(view);
  return neighbors.map(p=>line([320,174],p)).join('')+
    neighbors.map(p=>circle(p[0],p[1],22,'host')).join('')+circle(320,174,Math.min(29,7+d.ratio*21),'solute')+
    text(320,309,'Violet cation · '+d.count+' teal neighbors','caption','middle');
}

function carbon(d){
  if(d.form==='Diamond'){
    return tetra.map(v=>line([320,170],view(v))).join('')+tetra.map(view).map(p=>circle(...p,18)).join('')+
      circle(320,170,18,'solute')+text(320,291,'Four nearest neighbors in three dimensions','caption','middle');
  }
  if(d.form==='Fullerene'||d.form==='Nanotube'){
    const tube=d.form==='Nanotube';
    let svg='';
    for(let i=0;i<7;i++){
      const rx=tube?53:Math.sqrt(1-((i-3)/3.3)**2)*96;
      svg+='<ellipse cx="320" cy="'+(90+i*27)+'" rx="'+rx+'" ry="15" class="wire"/>';
    }
    return svg+text(320,309,tube?'Rolled sheet outline':'Closed cage outline','caption','middle');
  }
  if(d.form==='Piezoelectric ceramic')return rectangle(215,110,210,108,'specimen')+
    arrow([320,65],[320,100])+arrow([320,263],[320,225])+text(320,169,'Mechanical load','caption','middle')+
    text(320,302,'Polarization can change','reading','middle');
  const layer=(cx,cy)=>Array.from({length:6},(_,j)=>{
    const a=j*Math.PI/3;
    return [cx+32*Math.cos(a),cy+32*Math.sin(a)];
  });
  let svg='';
  for(const lift of d.form==='Graphite'?[60,30,0]:[0]){
    for(const [cx,cy] of [[220,138],[268,166],[316,138],[364,166],[412,138]]){
      const poly=layer(cx,cy+lift);
      svg+=polygon(poly,'wire')+poly.map(([x,y])=>circle(x,y,3,'host')).join('');
    }
  }
  return svg+text(320,310,d.form==='Graphite'?'Stacked carbon sheets':'One carbon sheet','caption','middle');
}

function chains(d){
  const f=d.form, amount=d.fraction??.45;
  const sides=[1,-1,-1,1,1,-1,1,1,-1,1];
  const sequence=[0,1,1,0,1,0,0,1,1,0,1,0];
  if(f==='Motion'||f==='Semicrystalline'){
    let svg='';
    for(let i=0;i<10;i++){
      const col=i%5,row=Math.floor(i/5),x=64+col*111,y=83+row*105;
      const ordered=f==='Semicrystalline'&&i<Math.round(amount*10);
      svg+=rectangle(x,y,78,76,ordered?'area':'card');
      for(let j=0;j<4;j++){
        const path=Array.from({length:12},(_,k)=>[x+8+k*5.4,y+13+j*16+
          (ordered?0:amount*4*Math.sin(.7*k+j+i+(d.time??0)*2))]);
        svg+='<polyline points="'+points(path)+'" class="wire"/>';
      }
    }
    return svg+text(320,310,f==='Motion'?'Schematic segment motion':'Parallel tracks indicate ordered regions','caption','middle');
  }
  if(f==='Isotactic'||f==='Syndiotactic'||f==='Atactic'){
    let svg=line([85,174],[555,174],'axis');
    for(let i=0;i<10;i++){
      const x=94+i*50, sign=f==='Isotactic'?1:f==='Syndiotactic'?(-1)**i:sides[i];
      svg+=line([x,174],[x,174+sign*44])+circle(x,174+sign*44,11,'solute')+circle(x,174,6);
    }
    return svg;
  }
  if(['Homopolymer','Alternating','Statistical','Block','Graft'].includes(f)){
    let svg=line([52,174],[588,174],'axis');
    for(let i=0;i<12;i++){
      const x=61+47*i;
      const type=f==='Alternating'?i%2:f==='Statistical'?sequence[i]:f==='Block'?Number(i>5):0;
      svg+=circle(x,174,15,type?'solute':'host')+text(x,179,type?'B':'A','atom-label','middle');
      if(f==='Graft'&&[2,6,9].includes(i)){
        svg+=line([x,190],[x,237])+circle(x,237,14,'solute')+text(x,242,'B','atom-label','middle');
      }
    }
    return svg;
  }
  let svg='';
  const chainCount=f==='Active'||f==='Growth'?4:3;
  for(let i=0;i<chainCount;i++){
    const y=103+i*48, bins=f==='Growth'?Math.min(14,Math.max(2,Math.round(2+10*amount-i))):f==='Active'?[2,3,12,3][i]:13;
    const waviness=d.heated?4+(f==='Network'?3:12)*amount:6;
    const linePoints=Array.from({length:bins},(_,j)=>[82+j*40,y+waviness*Math.sin(1.4*j+i)]);
    svg+='<polyline points="'+points(linePoints)+'" class="wire"/>'+
      linePoints.map(([x,y],j)=>circle(x,y,6,f==='Active'&&i===2&&j===bins-1?'solute':'host')).join('');
    if(f==='Branched'){
      svg+=line(linePoints[5],[linePoints[5][0]+23,y-29])+
        circle(linePoints[5][0]+23,y-29,7,'solute');
    }
    if(i>0&&(f==='Cross-linked'||f==='Network')){
      for(const x of f==='Network'?[183,284,411,526]:[217,440])svg+=line([x,y-48],[x,y],'crosslink');
    }
  }
  return svg;
}

function arrow(a,b){
  const theta=Math.atan2(b[1]-a[1],b[0]-a[0]),s=13;
  const wing=[.45,-.45].map(d=>[b[0]-s*Math.cos(theta+d),b[1]-s*Math.sin(theta+d)]);
  return line(a,b,'load')+polygon([b,...wing],'load-head');
}
function specimen(d){
  if(d.form==='Shear'){
    const q=65*d.amount;
    return polygon([[180+q,104],[430+q,104],[430,229],[180,229]],'specimen')+
      line([180,104],[180,229],'grid')+arrow([241+q,80],[365+q,80])+arrow([354,251],[230,251])+
      text(320,307,'Forces parallel to the faces','caption','middle');
  }
  if(d.form==='Torsion'){
    let svg=rectangle(152,118,336,102,'specimen');
    for(let i=0;i<5;i++)svg+=line([185+62*i,119],[185+62*i+35*d.amount,219],'bond');
    return svg+'<path d="M173 86a36 36 0 1 0 2 158 M468 251a36 36 0 1 0 -2 -163" class="wire"/>'+
      arrow([168,88],[186,90])+arrow([470,246],[451,250])+text(320,306,'Opposite torques twist the shaft','caption','middle');
  }
  const compress=d.form==='Compression', neck=d.form==='Neck';
  const half=138+(compress?-1:1)*65*d.amount;
  const thickness=42*(compress?1+.2*d.amount:1-.27*d.amount*(d.transverse??.5));
  const center=neck?thickness*(d.transverse??.55):thickness;
  const left=320-half,right=320+half;
  const profile=polygon([[left,160-thickness],[320-half*.56,160-thickness],[320,160-center],[320+half*.56,160-thickness],[right,160-thickness],
    [right,160+thickness],[320+half*.56,160+thickness],[320,160+center],[320-half*.56,160+thickness],[left,160+thickness]],'specimen');
  return profile+(neck?line([320,160-center],[320,160+center],'crosslink'):
    arrow(compress?[left-60,160]:[left-4,160],compress?[left-5,160]:[left-61,160])+
    arrow(compress?[right+60,160]:[right+4,160],compress?[right+5,160]:[right+61,160]))+
    line([left,243],[right,243],'axis')+text(320,271,'Gauge length','caption','middle');
}

function indent(d){
  const size=40+49*d.amount;
  if(d.method==='Rockwell'){
    const depth=45*d.amount;
    return rectangle(150,164,340,93,'specimen')+polygon([[276,78],[364,78],[320,164+depth]],'solute')+
      line([380,164],[474,164],'grid')+line([320,164+depth],[446,164+depth],'grid')+
      arrow([446,165],[446,164+depth])+text(455,186,'Depth','caption');
  }
  const width=d.method==='Knoop'?size*1.6:size, height=d.method==='Knoop'?size*.27:size;
  return rectangle(115,70,410,203,'specimen')+
    (d.method==='Brinell'?circle(320,170,size*.86,'solute'):polygon([[320-width,170],[320,170-height],[320+width,170],[320,170+height]],'solute'))+
    line([320-(d.method==='Brinell'?size*.86:width),170],[320+(d.method==='Brinell'?size*.86:width),170],'measurement')+
    text(320,316,d.method==='Brinell'?'Indent diameter':d.method==='Knoop'?'Long diagonal':'Mean of the two diagonals','caption','middle');
}

const views={graph:chart,bars,flow,lattice,charges,ion:ions,carbon,chains,specimen,indent};
export function renderDiagram(svg,result){
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('aria-label',result.title);
  svg.innerHTML=text(24,30,result.title,'title')+views[result.kind](result);
}
