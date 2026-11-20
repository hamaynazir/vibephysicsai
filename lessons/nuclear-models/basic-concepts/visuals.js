import {bindingEnergy, bindingNuclides, COHORT_SIZE, DECAY_LIMIT, fermi, FERMI_RANGE, NEUTRON_LIFETIME, nuclearRadius} from './math.js?v=pilot-1';

export const fmt = (value, digits = 4) => Number(value.toPrecision(digits)).toString();
const W = 760, H = 440;
const sequence = position => Math.min(2, Math.floor(position + .00001));
export const bindingSteps = ['Separated constituents', 'Compare with the bound atom', 'Compare energy per nucleon'];
export const isomerSteps = ['Ground state', 'Same Z and N in the excited state', 'Reveal the energy gap'];

export function draw(canvas, id, s, r, position) {
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

  switch(id) {
    case 'overview':
    case 'nuclides': {
      text(r.symbol,534,245,{size:116,bold:true});
      text(r.A,511,161,{size:41,color:purple,align:'right',bold:true});
      text(r.Z,511,248,{size:41,color:red,align:'right',bold:true});
      line(470,151,409,151,purple,2);
      line(470,236,409,236,red,2);
      text(`Z = ${r.Z} proton${r.Z===1?'':'s'}`,113,339,{color:red,bold:true});
      text(`N = ${r.N} neutron${r.N===1?'':'s'}`,363,339,{color:teal,bold:true});
      text(`${r.Z} + ${r.N} = ${r.A} nucleons`,380,391,{size:30,align:'center'});
      for (let i=0; i<r.A; i++) {
        const angle=i*2.39996323, radius=14*Math.sqrt(i);
        dot(228+radius*Math.cos(angle),189+radius*Math.sin(angle),6.5,i<r.Z?red:teal,i>=r.Z);
      }
      break;
    }
    case 'relations': {
      const minN=Math.max(0,Math.min(s.N,s.N2)-2), maxN=Math.max(minN+4,Math.max(s.N,s.N2)+2);
      const minZ=Math.max(0,Math.min(s.Z,s.Z2)-2), maxZ=Math.max(minZ+4,Math.max(s.Z,s.Z2)+2);
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
      const active = r.relations.isotope || r.relations.isotone || r.relations.isobar;
      if(active) line(x(s.N),y(s.Z),x(s.N2),y(s.Z2),muted,3,true);
      dot(x(s.N),y(s.Z),11,teal);
      dot(x(s.N2),y(s.Z2),r.relations.same?16:10,purple,true);
      text(`● ${r.symbol}-${r.A}`,92,48,{color:teal,bold:true});
      text(`○ ${r.other.symbol}-${r.other.A}`,672,48,{color:purple,bold:true,align:'right'});
      break;
    }
    case 'isomers': {
      const step = sequence(position), ground=316, upper=ground-31-s.excitation*.36;
      text('One nuclide · two nuclear states',74,61,{size:28,bold:true});
      line(130,ground,625,ground,teal,4);
      text('Ground state · same Z and N',132,ground+42,{color:teal});
      if (step>=1) {
        line(130,upper,625,upper,purple,4);
        text('Excited state · same Z and N',132,upper-19,{color:purple});
      }
      if(step===2) {
        arrow(387,ground-4,387,upper+4,purple);
        text(`${fmt(s.excitation)} keV`,407,(ground+upper)/2+7,{color:purple,bold:true});
      }
      break;
    }
    case 'mass': {
      text(`${fmt(s.mass)} u`,76,162,{size:54,color:teal,bold:true});
      text(`${fmt(r.kg)} kg`,76,241,{size:33,color:teal});
      arrow(352,183,419,183,muted);
      text('Same mass',77,309,{color:muted});
      text('Rest energy',460,128,{color:muted});
      text(`${fmt(r.MeV,5)} MeV`,460,187,{size:38,color:purple,bold:true});
      text(`${fmt(r.joule,4)} J`,460,251,{size:28,color:purple});
      text('Multiply by c²',460,309,{color:muted});
      break;
    }
    case 'binding': {
      const step=sequence(position), chosen=s.isotope;
      text(`${r.Z} H atom${r.Z===1?'':'s'} + ${r.N} neutron${r.N===1?'':'s'}`,61,52,{color:teal,bold:true});
      line(62,72,700,72,teal,4);
      if (step>=1) {
        arrow(341,79,341,153,purple);
        text(`B ≈ ${fmt(r.energy,5)} MeV`,365,125,{color:purple,bold:true});
        line(62,160,700,160,purple,4);
        const element = chosen.split('-')[0];
        text(`Bound ${element[0].toUpperCase()+element.slice(1)}-${r.A} neutral atom`,62,194,{color:purple});
      }
      if (step===2) {
        text('Binding energy per nucleon (MeV)',62,246,{size:22,bold:true});
        Object.keys(bindingNuclides).forEach((key,i)=>{
          const x=132+i*124, value=bindingEnergy(key).perNucleon, height=value/9*104;
          rect(x-34,370-height,68,height,key===chosen?purple:grid);
          text(value.toFixed(3),x,359-height,{size:19,align:'center',color:key===chosen?purple:muted});
          text(key.replace(/^./,c=>c.toUpperCase()),x,398,{size:20,align:'center',bold:key===chosen});
        });
        line(62,370,700,370,muted,1);
      }
      break;
    }
    case 'beta': {
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
      break;
    }
    case 'scattering':
    case 'recoil': {
      const left=90,right=690,base=114,span=right-left;
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
      text('One scale for both radii',70,57,{size:25,bold:true});
      const reference=nuclearRadius(27,s.r0), scale=15;
      for (const [x,radius,color,label] of [[205,reference,purple,'Reference · A = 27'],[552,r.radius,teal,`Selected · A = ${s.A}`]]) {
        dot(x,209,radius*scale,color,true);
        line(x,209,x+radius*scale,209,color,3);
        dot(x,209,4,color);
        text(label,x,352,{color,align:'center',bold:true});
        text(`${fmt(radius)} fm`,x,387,{color,align:'center'});
      }
      break;
    }
    case 'charge': {
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
      break;
    }
    case 'fermi': {
      const g=axes(FERMI_RANGE,.2,'Radius r (fm)','Nucleon density (fm⁻³)');
      const low=r.R-r.skin/2, high=r.R+r.skin/2;
      rect(g.x(low),g.y(.2),g.x(high)-g.x(low),g.y(0)-g.y(.2),fill);
      curve(g,0,FERMI_RANGE,x=>fermi(x,r.R,s.diffuseness,s.rho),teal);
      line(g.x(0),g.y(r.atR),g.x(r.R),g.y(r.atR),muted,1,true);
      line(g.x(r.R),g.y(0),g.x(r.R),g.y(r.atR),muted,1,true);
      dot(g.x(r.R),g.y(r.atR),6,teal);
      dot(g.x(r.probe),g.y(r.density),8,purple,true);
      text('90–10% surface band',694,51,{size:21,color:purple,align:'right'});
      text(`${fmt(r.density)} fm⁻³ at ${fmt(r.probe)} fm`,82,51,{size:21,color:purple});
      break;
    }
    case 'particles': {
      const items=[['Electron · lepton',r.electronEnergy,teal],['Muon · lepton',r.muonMass,teal],['Charged pion · meson',r.pionMass,purple],['Proton · baryon',r.protonMass,red]];
      text('Rest energy (MeV) · linear scale',42,53,{size:25,bold:true});
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
      const g=axes(9,.2,'Radius r (fm)','Nucleon density (fm⁻³)');
      rect(g.x(r.lo),g.y(.2),g.x(r.hi)-g.x(r.lo),g.y(0)-g.y(.2),fill);
      poly([[0,.17],[r.lo,.17],[r.hi,0],[9,0]].map(([x,y])=>[g.x(x),g.y(y)]),teal);
      dot(g.x(r.c),g.y(.085),7,purple);
      text(`${fmt(r.fraction*100,3)}% of nucleons in surface`,82,52,{size:25,color:purple,bold:true});
      break;
    }
  }
  canvas.dataset.model=id;
  canvas.dataset.time=position.toFixed(4);
}
