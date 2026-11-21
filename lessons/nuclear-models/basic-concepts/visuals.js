import {bindingEnergy, bindingNuclides, chartNuclides, nuclide, COHORT_SIZE, DECAY_LIMIT, fermi, FERMI_RANGE, NEUTRON_LIFETIME, nuclearRadius, AVOGADRO, U_KG, massSamples, massEnergy, coulombState, densityState, shellDensity, baryonIdentity} from './math.js?v=refine-1';

export const fmt = (value, digits = 4) => Number(value.toPrecision(digits)).toString();
const W = 760, H = 440;
const sequence = position => Math.min(2, Math.floor(position + .00001));
const statusByNuclide = Object.fromEntries(chartNuclides.map(([Z,N,stable])=>[`${nuclide(Z,N).symbol}-${Z+N}`,stable?'stable':'radioactive']));
const bindingPlot = Object.keys(bindingNuclides).map(key=>({key,...bindingEnergy(key)}));
let pathKey, pathPoints;
export const bindingSteps = ['Separated constituents', 'Compare with the bound atom', 'Compare energy per nucleon'];
export const isomerSteps = ['Ground state', 'Same Z and N in the excited state', 'Reveal the energy gap'];

export function draw(canvas, id, s, r, position) {
  const targets=[];
  const resolution = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== W * resolution || canvas.height !== H * resolution) {
    canvas.width = W * resolution;
    canvas.height = H * resolution;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  const dark = document.documentElement.dataset.theme === 'dark';
  const bg = dark ? '#1b2732' : '#f7fafa';
  const ink = dark ? '#ecf3f7' : '#22343d';
  const muted = dark ? '#b8c9d3' : '#4b626d';
  const grid = dark ? '#394b58' : '#ccdde0';
  const teal = dark ? '#69d9d1' : '#00787a';
  const purple = dark ? '#d0b4ff' : '#7541a6';
  const red = dark ? '#ffaeac' : '#a7474c';
  const fill = dark ? '#303b50' : '#e6deef';
  const paper = {left: 82, right: 700, top: 122, bottom: 352};
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  function text(value, x, y, {size=23, color=ink, align='left', bold=false}={}) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? '600 ' : ''}${size}px system-ui`;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  }
  function line(x1, y1, x2, y2, color=grid, width=2, dashed=false) {
    ctx.setLineDash(dashed ? [7, 6] : []);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function dot(x, y, radius, color, open=false) {
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2);
    if (open) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  function rect(x,y,w,h,color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
  }
  function arrow(x1,y1,x2,y2,color) {
    if (Math.hypot(x2-x1,y2-y1) < 7) return;
    line(x1,y1,x2,y2,color,3);
    const angle = Math.atan2(y2-y1,x2-x1);
    for (const offset of [-.53,.53]) line(x2,y2,x2-12*Math.cos(angle+offset),y2-12*Math.sin(angle+offset),color,3);
  }
  function poly(points, color, dashed=false) {
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash(dashed ? [8, 6] : []);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function axes(xMax, yMax, xLabel, yLabel, bounds=paper, ticks=4) {
    const {left,right,top,bottom} = bounds;
    const x = value => left + value / xMax * (right-left);
    const y = value => bottom - value / yMax * (bottom-top);
    for (let i=0; i<=ticks; i++) {
      const f = i/ticks, px = x(f*xMax), py = y(f*yMax);
      line(left,py,right,py,grid,1);
      line(px,bottom,px,bottom+6,muted,1);
      text(fmt(f*xMax,3),px,bottom+27,{size:18,color:muted,align:'center'});
      text(fmt(f*yMax,3),left-10,py+5,{size:17,color:muted,align:'right'});
    }
    line(left,top,left,bottom,muted);
    line(left,bottom,right,bottom,muted);
    text(yLabel,left,top-17,{size:21});
    text(xLabel,(left+right)/2,bottom+56,{size:22,align:'center'});
    return {x,y};
  }
  function curve(g, xmin, xmax, formula, color, dashed=false) {
    const points = Array.from({length:100},(_,i)=>{
      const x = xmin+(xmax-xmin)*i/99;
      return [g.x(x),g.y(formula(x))];
    });
    poly(points,color,dashed);
  }
  function radialSlice(R,a,probe) {
    for(let i=45;i>=1;i--){
      ctx.globalAlpha=fermi((i-.5)/3,R,a,1)*.67;
      ctx.beginPath();
      ctx.arc(123,230,(i-.5)*2.1,0,2*Math.PI);
      ctx.strokeStyle=teal;
      ctx.lineWidth=2.15;
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    dot(123,230,R*6.3,muted,true);
    line(123,230,123+probe*6.3,230,purple,2);
    dot(123+probe*6.3,230,5,purple);
    text('Central slice',123,351,{size:20,align:'center'});
  }

  switch(id) {
    case 'overview':
    case 'nuclides': {
      if(id==='nuclides'&&s.view!=='main'){
        const step=sequence(position), proton=s.view==='proton';
        const caption=step===0?'Start with the selected nucleus':step===1?
          `Add one ${s.view} to the count`:proton?'Z rises by one · the element changes':'N rises by one · the element stays the same';
        text(caption,62,58,{size:24,color:proton?red:teal,bold:true});
      }
      text(r.symbol,534,245,{size:116,bold:true});
      const addition=id==='nuclides'&&s.view!=='main'&&position>=2;
      text(r.A,511,161,{size:41,color:addition?teal:purple,align:'right',bold:true});
      text(r.Z,511,248,{size:41,color:addition&&s.view==='proton'?purple:red,align:'right',bold:true});
      line(470,151,409,151,purple,2);
      line(470,236,409,236,red,2);
      text(`Z = ${r.Z} proton${r.Z===1?'':'s'}`,113,339,{color:red,bold:true});
      text(`N = ${r.N} neutron${r.N===1?'':'s'}`,363,339,{color:teal,bold:true});
      text(`${r.Z} + ${r.N} = ${r.A} nucleons`,380,391,{size:30,align:'center'});
      const addedProton=addition&&s.view==='proton';
      for (let i=0; i<r.A; i++) {
        const angle=i*2.39996323, radius=14*Math.sqrt(i);
        const x=228+radius*Math.cos(angle), y=189+radius*Math.sin(angle);
        const proton=i<r.Z-Number(addedProton)||(addedProton&&i===r.A-1);
        dot(x,y,6.5,proton?red:teal,!proton);
        if(addition&&i===r.A-1)dot(x,y,10,purple,true);
      }
      if(id==='overview')text(`Nuclear charge = +${r.Z}e`,380,425,{size:19,align:'center',color:red});
      break;
    }
    case 'relations': {
      const step=sequence(position);
      const minN=Math.max(0,Math.min(s.N,s.N2,14)-2), maxN=Math.max(38,s.N+2,s.N2+2);
      const minZ=Math.max(0,Math.min(s.Z,s.Z2,12)-2), maxZ=Math.max(31,s.Z+2,s.Z2+2);
      const x=n=>92+(n-minN)/(maxN-minN)*580, y=z=>352-(z-minZ)/(maxZ-minZ)*238;
      for(let n=minN; n<=maxN; n++) {
        line(x(n),114,x(n),352,grid,1);
        if ((n-minN)%Math.ceil((maxN-minN)/8)===0) text(n,x(n),376,{size:17,align:'center',color:muted});
      }
      for(let z=minZ; z<=maxZ; z++) {
        line(92,y(z),672,y(z),grid,1);
        if ((z-minZ)%Math.ceil((maxZ-minZ)/6)===0) text(z,80,y(z)+6,{size:17,align:'right',color:muted});
      }
      text('Protons Z',92,90);
      text('Neutrons N',382,410,{align:'center'});
      if(step===2){
        if(s.chart!=='manual'){
          line(x(minN),y(s.Z),x(maxN),y(s.Z),teal,2,true);
          line(x(s.N),y(minZ),x(s.N),y(maxZ),purple,2,true);
          const lo=Math.max(minN,r.A-maxZ), hi=Math.min(maxN,r.A-minZ);
          line(x(lo),y(r.A-lo),x(hi),y(r.A-hi),red,2,true);
          text('Same Z · Same N · Same A',672,90,{size:17,align:'right',color:muted});
        }
        for(const [Z,N,stable] of chartNuclides){
          const px=x(N), py=y(Z);
          dot(px,py,5,muted,!stable);
        }
        const nearest=(a,b)=>chartNuclides.reduce((best,[Z,N])=>{
          const distance=Math.hypot(a-x(N),b-y(Z));
          return distance<best.distance?{Z,N,distance}:best;
        },{distance:Infinity});
        targets.push({hit:(a,b)=>nearest(a,b).distance<=19,apply:(a,b)=>{
          const {Z,N}=nearest(a,b);
          return ['chart',`${Z},${N}`];
        }});
      }
      const active = r.relations.isotope || r.relations.isotone || r.relations.isobar;
      if(active && step===2) {
        if(r.relations.isotope) line(x(minN),y(s.Z),x(maxN),y(s.Z),purple,3,true);
        if(r.relations.isotone) line(x(s.N),y(minZ),x(s.N),y(maxZ),purple,3,true);
        if(r.relations.isobar) {
          const low=Math.max(minN,r.A-maxZ), high=Math.min(maxN,r.A-minZ);
          line(x(low),y(r.A-low),x(high),y(r.A-high),purple,3,true);
        }
      }
      dot(x(s.N),y(s.Z),11,teal);
      if(step>=1) dot(x(s.N2),y(s.Z2),r.relations.same?16:10,purple,true);
      const first=`${r.symbol}-${r.A}`, second=`${r.other.symbol}-${r.other.A}`;
      text(`● ${first}`,92,43,{color:teal,bold:true});
      text(statusByNuclide[first]||'Status not shown',92,66,{size:17,color:muted});
      if(step>=1) {
        text(`○ ${second}`,672,43,{color:purple,bold:true,align:'right'});
        text(statusByNuclide[second]||'Status not shown',672,66,{size:17,color:muted,align:'right'});
      }
      break;
    }
    case 'isomers': {
      const step = sequence(position), ground=316, upper=ground-31-s.excitation*.36;
      text(s.preset==='tc'?'Technetium-99 · Z = 43, N = 56':'One nuclide · two nuclear states',74,61,{size:28,bold:true});
      line(130,ground,625,ground,teal,4);
      text('Ground state · same Z and N',132,ground+42,{color:teal});
      if (step>=1) {
        line(130,upper,625,upper,purple,4);
        text('Excited state · same Z and N',132,upper-19,{color:purple});
      }
      if(step===2) {
        arrow(387,upper+5,387,ground-5,purple);
        text(`${fmt(s.excitation)} keV`,407,(ground+upper)/2+7,{color:purple,bold:true});
        text(`Rest-mass increase: ${fmt(r.massIncrement)} u`,132,397,{size:20,color:muted});
      }
      break;
    }
    case 'mass': {
      if(s.view==='standard') {
        const stages=[
          'Neutral carbon-12 in its ground state',
          `Molar mass ≈ 0.012 kg/mol · Nₐ = ${fmt(AVOGADRO,9)} mol⁻¹`,
          `Molar mass ÷ Nₐ ≈ ${fmt(12*U_KG,6)} kg per atom`,
          'Definition: divide the mass of one carbon-12 atom by 12',
          `1 u ≈ ${fmt(U_KG,7)} kg`
        ];
        const step=Math.min(4,Math.floor(position+.00001));
        text('The carbon-12 mass standard',65,61,{size:32,bold:true});
        dot(650,53,31,muted,true);
        text('¹²C',650,59,{size:22,align:'center',color:teal,bold:true});
        stages.slice(0,step+1).forEach((label,i)=>{
          const y=124+i*64;
          dot(77,y-7,7,i===step?purple:grid);
          text(label,103,y,{size:21,color:i===step?purple:ink,bold:i===step});
        });
        break;
      }
      if(s.view==='particles') {
        const unit=s.units==='kg'?'kg':s.units==='MeV'?'MeV/c²':'u';
        const values=['electron','proton','neutron'].map(key=>massSamples[key]);
        const minLog=Math.log10(values[0].mass)-.2, x=m=>200+(Math.log10(m)-minLog)*117;
        text('Particle mass · logarithmic scale',60,61,{size:31,bold:true});
        values.forEach(({name,mass},i)=>{
          const y=142+i*92, value=s.units==='u'?mass:massEnergy(mass)[s.units];
          text(name,55,y,{size:24});
          line(200,y-7,643,y-7,grid,2);
          for(const decade of [-3,-2,-1,0]){
            const mark=x(10**decade);
            line(mark,y-13,mark,y,muted,1);
          }
          dot(x(mass),y-7,8,i===0?purple:teal,i===2);
          text(`${fmt(value,9)} ${unit}`,698,y+30,{size:20,align:'right'});
        });
        break;
      }
      if(s.view==='atomic') {
        const sample=massSamples[s.preset]?.A ? massSamples[s.preset] : massSamples.c12;
        const diff=sample.mass-sample.A, center=365, end=center+diff/.02*285;
        text(sample.name,65,65,{size:32,bold:true});
        text(`Z = ${sample.Z}   N = ${sample.A-sample.Z}   A = ${sample.A}`,65,122,{size:28});
        text(`Neutral-atom mass = ${sample.mass.toFixed(9)} u`,65,180,{size:27});
        line(80,260,650,260,muted,2);
        line(center,241,center,278,muted,2);
        line(center,260,end,260,purple,6);
        dot(end,260,9,purple,true);
        text('−0.02 u',80,297,{size:20,align:'center'});
        text('0',center,297,{size:20,align:'center'});
        text('+0.02 u',650,297,{size:20,align:'center'});
        text(`Magnified difference: M − A u = ${fmt(diff,6)} u`,65,354,{size:25,color:purple});
        text('A counts nucleons. The ruler shows the neutral-atom mass difference.',65,398,{size:17,color:muted});
        break;
      }
      const step=sequence(position);
      text(`${fmt(s.mass)} u`,76,162,{size:54,color:teal,bold:true});
      if(step>=1)text(`${fmt(r.kg)} kg`,76,241,{size:33,color:teal});
      if(step===2){
      arrow(352,183,419,183,muted);
      text('Rest energy',460,128,{color:muted});
      text(`${fmt(r.MeV,5)} MeV`,460,187,{size:38,color:purple,bold:true});
      text(`${fmt(r.joule,4)} J`,460,251,{size:28,color:purple});
      text('Multiply by c²',460,309,{color:muted});
      }
      if(step>=1)text('Same mass',77,309,{color:muted});
      break;
    }
    case 'binding': {
      const step=sequence(position), chosen=s.isotope;
      if(s.view==='excess') {
        text('Same atom · two mass references',65,72,{size:29,bold:true});
        text(`Measured atomic mass: ${r.mass.toFixed(6)} u`,65,107,{size:19,color:muted});
        text('Separated hydrogen atoms and neutrons',65,143,{color:teal});
        text(`Binding difference: ${fmt(r.defect,6)} u → ${fmt(r.energy)} MeV`,65,191,{color:teal,bold:true});
        text(`Reference for mass excess: ${r.A} u`,65,277,{color:purple});
        text(`Atomic mass excess: ${fmt(r.excess)} MeV`,65,325,{color:purple,bold:true});
        break;
      }
      text(s.view==='alpha'?'2 protons + 2 neutrons':`${r.Z} H atom${r.Z===1?'':'s'} + ${r.N} neutron${r.N===1?'':'s'}`,61,52,{color:teal,bold:true});
      line(62,72,700,72,teal,4);
      if (step>=1) {
        arrow(341,79,341,153,purple);
        text(`B ≈ ${fmt(r.energy,5)} MeV`,365,125,{color:purple,bold:true});
        line(62,160,700,160,purple,4);
        const element = chosen.split('-')[0];
        text(s.view==='alpha'?'Bound helium-4 nucleus':`Bound ${element[0].toUpperCase()+element.slice(1)}-${r.A} neutral atom`,62,194,{color:purple});
      }
      if (step===2) {
        if(s.view==='alpha'){
          text(`Δm = ${fmt(r.defect,6)} u  ·  B/A = ${fmt(r.perNucleon)} MeV`,62,276,{color:purple});
          arrow(74,349,74,309,purple);
          text('Supply B to separate the nucleus again.',95,340,{color:muted});
          break;
        }
        const g=axes(240,9,'Mass number A','B/A (MeV)',{left:76,right:694,top:248,bottom:368});
        const points=bindingPlot.map(data=>[g.x(data.A),g.y(data.perNucleon)]);
        poly(points,grid);
        bindingPlot.forEach((data,i)=>{
          const {key}=data, [x,y]=points[i];
          dot(x,y,key===chosen?8:5,key===chosen?purple:teal,key!==chosen);
          if(key===chosen) text(key.toUpperCase(),Math.min(654,Math.max(110,x)),y+(y<271?22:-10),{size:17,align:'center',color:purple});
        });
        targets.push({hit:(x,y)=>points.some(([a,b])=>Math.hypot(a-x,b-y)<=19),apply:(x,y)=>{
          const index=points.reduce((best,[a,b],i)=>Math.hypot(a-x,b-y)<Math.hypot(points[best][0]-x,points[best][1]-y)?i:best,0);
          return ['isotope',bindingPlot[index].key];
        }});
        text('AME2020 · selected upper trend',696,230,{size:17,align:'right',color:muted});
      }
      break;
    }
    case 'beta': {
      if(s.view!=='main'){
        const step=sequence(position), thorium=s.view==='thorium';
        text(thorium?'Thorium-234 beta-minus decay':'One free-neutron beta event',60,57,{size:30,bold:true});
        text(thorium?'²³⁴Th · 90 protons, 144 neutrons':'n · charge 0 · baryon number 1',60,133,{size:27,color:teal});
        if(step>=1){
          arrow(130,155,130,206,muted);
          text(thorium?'²³⁴Pa* · 91 protons, 143 neutrons':'p⁺  +  e⁻  +  ν̄ₑ',60,255,{size:30,color:purple});
          if(thorium)text('+ emitted electron and electron antineutrino',60,291,{size:23,color:purple});
        }
        if(step===2){
          text(thorium?'Charge: 90 = 91 − 1 · mass number stays 234':'Charge: 0 = +1 − 1 · lepton number: 0 = +1 − 1',60,350,{size:23});
          text(thorium?'ENSDF lists a 73.92 keV level in the daughter scheme.':'Schematic event · energy and momentum sharing are not sampled.',60,393,{size:20,color:muted});
        }
        break;
      }
      text('Free-neutron survival',68,52,{size:28,bold:true});
      text(`β⁻ bookkeeping: (${s.Z}, ${s.N}) → (${r.daughterZ}, ${r.daughterN}) + e⁻ + ν̄ₑ`,68,83,{size:19,color:muted});
      const g=axes(DECAY_LIMIT,1,'Elapsed time (s)','Surviving fraction',{left:73,right:478,top:128,bottom:341});
      curve(g,0,DECAY_LIMIT,t=>Math.exp(-t/NEUTRON_LIFETIME),teal);
      line(g.x(r.seconds),g.y(0),g.x(r.seconds),g.y(1),muted,1,true);
      dot(g.x(r.seconds),g.y(r.survival),7,teal);
      dot(g.x(r.seconds),g.y(r.remaining/COHORT_SIZE),8,purple,true);
      text('Sample of 48',517,110,{size:22,bold:true});
      r.live.forEach((alive,i)=>dot(527+(i%6)*32,141+Math.floor(i/6)*21,5.5,alive?purple:grid,!alive));
      text(`${r.remaining} remain`,517,321,{color:purple,bold:true});
      text('● Expected',518,355,{size:18,color:teal});
      text('○ Sample',518,380,{size:18,color:purple});
      line(g.x(r.halfLife),g.y(0),g.x(r.halfLife),g.y(.5),muted,1,true);
      text('Half-life',g.x(r.halfLife)+6,g.y(.5)-9,{size:15,color:muted});
      break;
    }
    case 'scattering':
    case 'recoil': {
      if(s.view==='apparatus') {
        const step=sequence(position);
        text('Geiger–Marsden apparatus · schematic',55,52,{size:28,bold:true});
        const x=455,y=213,radius=127, theta=r.angle*Math.PI/180;
        const detector=[x+radius*Math.cos(theta), y-radius*Math.sin(theta)];
        rect(61,183,95,61,fill);
        text('α source',70,221,{size:20});
        rect(189,172,12,31,muted);
        rect(189,224,12,32,muted);
        arrow(155,y,x-19,y,purple);
        text('Collimated beam',96,287,{size:20});
        if(step>=1){
          rect(x-3,178,7,70,purple);
          arrow(x,y,...detector,teal);
          text('Thin gold foil',x,370,{size:20,align:'center'});
        }
        if(step===2){
          dot(x,y,radius,muted,true);
          dot(...detector,8,purple,true);
          text(`Predicted hit · ${fmt(r.angle)}°`,699,410,{size:22,color:purple,align:'right'});
        }
        break;
      }
      if(id==='scattering'){
        const guideX=87;
        const impactY=174+s.impact*.65;
        line(guideX,174,guideX+91,174,grid,1,true);
        line(guideX,impactY,guideX+91,impactY,purple,2);
        dot(guideX+46,impactY,7,purple,true);
        text('Drag beam offset',guideX,263,{size:17,color:muted});
        targets.push({hit:(x,y)=>x>=65&&x<=194&&y>=156&&y<=254,drag:true,
          apply:(_x,y)=>['impact',Math.max(0,Math.min(100,(y-174)/.65))]});
      }
      if(s.impact>0 || s.recoil===1) {
        const key=[s.z1,s.z2,s.energy,s.m1,s.m2,s.recoil,s.impact].join('|');
        if(key!==pathKey){
          pathKey=key;
          pathPoints=Array.from({length:81},(_,i)=>coulombState(s,i/80));
        }
        const lab=s.view==='lab', cx=345, cy=175, scale=(lab?76:109)/r.maxSeparation;
        const [ix,iy]=r.incoming;
        const rotate=([x,y])=>[x*ix+y*iy,x*iy-y*ix];
        const project=(sample,weight)=>{
          const [x,y]=rotate(sample.position.map((value,i)=>weight*value+(lab?sample.drift[i]:0)));
          return [cx+x*scale,cy+y*scale];
        };
        const a=1-r.targetFraction, b=-r.targetFraction;
        text(s.recoil===1?(lab?'Laboratory frame':'Center-of-mass frame'):'Fixed target · repulsive Coulomb path',65,48,{size:28,bold:true});
        text(`θ = ${fmt(r.angle)}°`,697,48,{align:'right',color:purple,bold:true});
        if(s.recoil===1){
          const [x,y]=project(r,0);
          dot(x,y,3,muted);
          text('COM',x-7,y+23,{size:16,align:'right',color:muted});
        }
        poly(pathPoints.map(point=>project(point,a)),purple,true);
        if(b)poly(pathPoints.map(point=>project(point,b)),teal,true);
        const [px,py]=project(r,a), [tx,ty]=project(r,b);
        line(px,py,tx,ty,muted,1);
        dot(tx,ty,7,teal);
        dot(px,py,8,purple,true);
        const velocity=rotate(r.vector), norm=Math.hypot(...velocity), length=31*Math.sqrt(r.kinetic/r.ecm);
        if(!lab && norm>0)arrow(px,py,px+velocity[0]/norm*length,py+velocity[1]/norm*length,purple);
        const relative=rotate(r.position);
        if(!lab&&s.impact>0)arrow(px,py,px+relative[0]/r.separation*20,py+relative[1]/r.separation*20,red);
        if(!lab&&s.impact>0)text('Red arrow: repulsion direction',699,105,{size:16,align:'right',color:red});
        if(s.impact>0 && !lab) {
          const out=rotate(r.outgoing);
          arrow(521,165,577,165,muted);
          arrow(521,165,521+56*out[0],165+56*out[1],purple);
          text('Incoming and outgoing',604,236,{size:16,align:'center',color:muted});
          text('asymptotic directions',604,255,{size:16,align:'center',color:muted});
        }
        text('○ Projectile   ● Target',697,285,{size:18,color:muted,align:'right'});
        text(`Closest separation ${fmt(r.distance)} fm`,65,293,{size:23});
        const bar=610*r.kinetic/r.ecm;
        rect(65,320,bar,22,teal);
        rect(65+bar,320,610-bar,22,purple);
        text(`Kinetic ${fmt(r.kinetic)} MeV`,65,375,{color:teal,size:20});
        text(`Potential ${fmt(r.potential)} MeV`,675,375,{color:purple,size:20,align:'right'});
        text(`Total relative energy ${fmt(r.ecm)} MeV`,365,413,{align:'center',size:21});
        break;
      }
      const left=210,right=690,base=114,span=right-left;
      const projectile=left+r.separation/r.maxSeparation*span;
      const turning=left+r.distance/r.maxSeparation*span;
      text('Head-on relative separation',left,49,{size:27,bold:true});
      text(`r = ${fmt(r.separation)} fm`,right,49,{size:22,align:'right',color:purple});
      line(left,base,right,base,muted,2);
      line(turning,base-20,turning,base+21,muted,2,true);
      dot(left,base,13,teal);
      dot(projectile,base,12,purple,true);
      if(Math.abs(r.velocity)>1e-7) arrow(projectile,base-29,Math.max(left,Math.min(right,projectile+Math.sign(r.velocity)*49)),base-29,purple);
      text('Target',left,147,{size:18,color:teal,align:'center'});
      text(`D = ${fmt(r.distance)} fm`,turning+14,147,{size:19});
      const g=axes(r.maxSeparation,r.ecm,'Relative separation (fm)','Energy (MeV)',{left,right,top:208,bottom:347});
      const U = radius => r.ecm*r.distance/radius;
      curve(g,r.distance,r.maxSeparation,U,purple);
      curve(g,r.distance,r.maxSeparation,radius=>r.ecm-U(radius),teal,true);
      line(g.x(r.separation),g.y(0),g.x(r.separation),g.y(r.ecm),muted,1,true);
      dot(g.x(r.separation),g.y(r.potential),7,purple);
      dot(g.x(r.separation),g.y(r.kinetic),7,teal,true);
      text('– – Kinetic',430,192,{size:18,color:teal});
      text('― Potential',right,192,{size:18,color:purple,align:'right'});
      break;
    }
    case 'radius': {
      const step=sequence(position);
      text('One scale for both radii',70,57,{size:25,bold:true});
      const referenceA=s.referenceA??27, reference=nuclearRadius(referenceA,s.r0), scale=14;
      const spheres=[[205,reference,purple,`Reference · A = ${referenceA}`],[552,r.radius,teal,`Selected · A = ${s.A}`]];
      for (const [x,radius,color,label] of spheres.slice(0,step?2:1)) {
        dot(x,209,radius*scale,color,true);
        line(x,209,x+radius*scale,209,color,3);
        dot(x,209,4,color);
        text(label,x,365,{color,align:'center',bold:true});
        text(`${fmt(radius)} fm`,x,395,{color,align:'center'});
      }
      if(step===2){
        text(`A and volume ×${fmt(s.A/referenceA)}  →  radius ×${fmt(Math.cbrt(s.A/referenceA))}`,380,88,{size:23,align:'center',bold:true});
        text(`V = ${fmt(r.volume)} fm³  ·  A/V = ${fmt(r.number)} fm⁻³`,380,424,{size:20,align:'center',color:muted});
      }
      break;
    }
    case 'charge': {
      if(s.view==='radial') {
        const R=nuclearRadius(2*s.Z), a=.55;
        const g=axes(15,1,'Radius r (fm)','Relative charge density',{left:277,right:699,top:133,bottom:348});
        curve(g,0,15,x=>fermi(x,R,a,1),teal);
        const value=fermi(s.probe,R,a,1);
        line(g.x(s.probe),g.y(0),g.x(s.probe),g.y(value),muted,2,true);
        dot(g.x(s.probe),g.y(value),8,purple,true);
        text('Illustrative positive charge profile',84,56,{size:27,bold:true});
        text(`At ${fmt(s.probe)} fm: ${fmt(value*100)}% of reference density · model A ≈ 2Z`,84,87,{size:18,color:purple});
        radialSlice(R,a,s.probe);
        break;
      }
      const charge=s.Z-s.electrons;
      text('Nucleus',135,113,{size:29,align:'center',bold:true});
      text('Electrons',385,113,{size:29,align:'center',bold:true});
      text('Atom / ion',630,113,{size:29,align:'center',bold:true});
      text(`+${s.Z}e`,135,239,{size:49,color:red,align:'center'});
      text(s.electrons?`−${s.electrons}e`:'0',385,239,{size:49,color:teal,align:'center'});
      text(charge?`${charge>0?'+':'−'}${Math.abs(charge)}e`:'0',630,239,{size:49,color:purple,align:'center'});
      text('+',260,234,{size:36,align:'center',color:muted});
      text('=',510,234,{size:36,align:'center',color:muted});
      text(charge===0?'Neutral atom':charge>0?'Positive ion':'Negative ion',630,302,{color:purple,align:'center'});
      text('Changing the electrons changes the ion charge. Nuclear charge stays fixed at the selected Z.',380,385,{size:15,align:'center',color:muted});
      break;
    }
    case 'fermi': {
      const isShell=s.view==='shell';
      const other=s.compare==='none'?null:densityState({...s,A:Number(s.compare)});
      const value=(x,p)=>isShell?shellDensity(x,fermi(x,p.R,s.diffuseness,p.rho)):fermi(x,p.R,s.diffuseness,p.rho);
      const scan=p=>Math.max(...Array.from({length:61},(_,i)=>value(i/4,p)));
      const ymax=isShell?Math.ceil(Math.max(scan(r),other?scan(other):0)/10)*10:Math.ceil(Math.max(r.rho,other?.rho||0)*20)/20;
      const g=axes(FERMI_RANGE,ymax,'Radius r (fm)',isShell?'Nucleons per fm':'Nucleon density (fm⁻³)',{left:277,right:699,top:135,bottom:352});
      const low=Math.max(0,r.r90), high=r.r10;
      rect(g.x(low),g.y(ymax),g.x(high)-g.x(low),g.y(0)-g.y(ymax),fill);
      if(other)curve(g,0,FERMI_RANGE,x=>value(x,other),muted,true);
      curve(g,0,FERMI_RANGE,x=>value(x,r),teal);
      line(g.x(r.R),g.y(0),g.x(r.R),g.y(value(r.R,r)),muted,1,true);
      dot(g.x(r.R),g.y(value(r.R,r)),6,teal);
      if(r.r90>=0)dot(g.x(low),g.y(value(low,r)),5,teal,true);
      dot(g.x(high),g.y(value(high,r)),5,teal,true);
      dot(g.x(r.probe),g.y(value(r.probe,r)),8,purple,true);
      radialSlice(r.R,s.diffuseness,r.probe);
      text(r.r90<0?'90% point below r = 0':'90–10% surface band',699,51,{size:21,color:purple,align:'right'});
      text(`${isShell?`${fmt(r.shell)} nucleons/fm`:`${fmt(r.density)} fm⁻³`} at ${fmt(r.probe)} fm`,50,51,{size:22,color:purple});
      const clamp=r=>Math.max(0,Math.min(FERMI_RANGE,r));
      targets.push({hit:(x,y)=>x>=277&&x<=699&&y>=135&&y<=352,drag:true,apply:x=>['probe',clamp((x-277)/422*FERMI_RANGE)]},
        {hit:(x,y)=>Math.hypot(x-123,y-230)<=95,drag:true,apply:(x,y)=>['probe',clamp(Math.hypot(x-123,y-230)/6.3)]});
      if(other)text(`Dashed: A = ${s.compare} model`,699,82,{size:18,align:'right',color:muted});
      break;
    }
    case 'particles': {
      if(s.view==='valence'){
        const current=baryonIdentity(s.up);
        text('Valence composition · schematic',57,59,{size:29,bold:true});
        dot(211,218,105,muted,true);
        [...current.quarks].forEach((q,i)=>{
          const px=211+[-45,45,0][i], py=218+[-27,-27,42][i];
          dot(px,py,28,q==='u'?teal:purple,true);
          text(q==='u'?'u +⅔':'d −⅓',px,py+5,{size:15,align:'center',color:q==='u'?teal:purple,bold:true});
          targets.push({hit:(x,y)=>Math.hypot(x-px,y-py)<30,apply:()=>['up',s.up+(q==='u'?-1:1)]});
        });
        text(current.name,356,163,{size:27,bold:true});
        text(`${current.quarks} · total ${current.charge>0?'+':''}${current.charge}e`,356,218,{size:27,color:purple});
        text('Proton uud = +e · neutron udd = 0',356,276,{size:21});
        text('Tap a quark or change the up-quark count.',380,353,{size:21,align:'center',color:muted});
        text('Real nucleons also contain gluons and sea quarks.',380,413,{size:20,color:muted,align:'center'});
        break;
      }
      if(s.view==='scale'){
        const step=Math.min(3,Math.floor(position+.00001));
        text('Approximate length scales',65,58,{size:29,bold:true});
        const x=exponent=>95+(exponent+19)*64;
        line(x(-19),230,x(-10),230,muted,2);
        for(let n=-19;n<=-10;n++)line(x(n),222,x(n),238,muted,1);
        const levels=[[-10,'Atom',174],[-14,'Heavy nucleus',287],[-15,'Nucleon',174],[-18,'Subnuclear probe',287]];
        for(const [scale,label,y] of levels.slice(0,step+1)){
          dot(x(scale),230,scale===levels[step][0]?9:6,scale===levels[step][0]?purple:teal);
          line(x(scale),230,x(scale),y+5,muted,1,true);
          text(label,x(scale),y,{size:19,align:'center'});
          text(`10${String(scale).replace(/./g,c=>({'-':'⁻','0':'⁰','1':'¹','4':'⁴','5':'⁵','8':'⁸'})[c])} m`,x(scale),y+32,{size:18,align:'center',color:muted});
        }
        if(step===3){
          for(const [i,q] of ['u','u','d'].entries()){
            const cx=119+i*37;
            dot(cx,349,14,q==='u'?teal:purple,true);
            text(q,cx,355,{size:16,align:'center'});
          }
          text('Valence-quark schematic',226,355,{size:20,color:muted});
        }
        text(step===3?'Probe scale only · valence quarks have no assigned size here.':'One tick equals a factor of ten in length.',380,407,{size:21,align:'center'});
        break;
      }
      if(s.view==='roles'){
        text('Pion · meson',70,93,{size:32,color:purple,bold:true});
        text('Helps model the longer-range nuclear interaction.',70,147);
        text('Virtual exchange is an effective description, with no tracked particle path.',70,181,{size:17,color:muted});
        line(70,220,685,220,grid,2);
        text('Muon · charged lepton',70,277,{size:32,color:teal,bold:true});
        text('Cosmic-ray showers can produce real muons.',70,332);
        text('Charged pions can decay into muons and neutrinos.',70,371,{size:20,color:muted});
        break;
      }
      const items=[['Electron · lepton',r.electronEnergy,teal],['Muon · lepton',r.muonMass,teal],['Charged pion · meson',r.pionMass,purple],['Proton · baryon',r.protonMass,red]];
      text('Rest energy (MeV) · linear scale',42,53,{size:25,bold:true});
      text('Equal horizontal distances represent equal energy differences.',42,406,{size:18,color:muted});
      line(328,87,328,367,grid);
      items.forEach(([label,value,color],i)=>{
        const y=118+i*72, x=328+value/1000*278;
        text(label,42,y+6,{size:23});
        line(328,y,x,y,color,9);
        line(x,y-6,x,y+6,color,2);
        text(fmt(value,5),709,y+6,{size:21,color,align:'right'});
      });
      break;
    }
    case 'surface': {
      const step=sequence(position);
      const g=axes(9,.2,'Radius r (fm)','Nucleon density (fm⁻³)');
      if(step>=1)rect(g.x(r.lo),g.y(.2),g.x(r.hi)-g.x(r.lo),g.y(0)-g.y(.2),fill);
      poly([[0,.17],[r.lo,.17],[r.hi,0],[9,0]].map(([x,y])=>[g.x(x),g.y(y)]),teal);
      if(step>=1)dot(g.x(r.c),g.y(.085),7,purple);
      const heading=['Uniform core','Declining surface density',`${fmt(r.fraction*100,3)}% of nucleons in surface`][step];
      text(heading,82,48,{size:25,color:purple,bold:true});
      if(step===1){
        const x=r.lo+(r.hi-r.lo)*(position-1);
        line(g.x(x),g.y(0),g.x(x),g.y(.17*(r.hi-x)/s.width),purple,2,true);
        const center=638, y=196, scale=5;
        dot(center,y,r.hi*scale,muted,true);
        dot(center,y,r.lo*scale,teal,true);
        dot(center,y,x*scale,purple,true);
        text('Shell section',center,253,{size:16,align:'center',color:muted});
      }
      if(step===2){
        text(`4πr² weights every shell: ${fmt(r.total*r.fraction)} surface / ${fmt(r.total)} total`,82,83,{size:20});
        const density=x=>x<r.lo?.17:x<r.hi?.17*(r.hi-x)/s.width:0;
        const max=shellDensity(r.hi,.17);
        curve(g,0,9,x=>.2*shellDensity(x,density(x))/max,purple,true);
        text('Dashed: rescaled 4πr²ρ · use the count ratio above',691,108,{size:16,align:'right',color:purple});
      }
      break;
    }
  }
  canvas.dataset.model=id;
  canvas.dataset.time=position.toFixed(4);
  return targets;
}
