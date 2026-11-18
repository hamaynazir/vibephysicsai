import {heliumBinding} from './lessons/nuclear-models/basic-concepts/math.js';

// Each experiment isolates a relationship within the main section model.
const axisNames = ['i', 'j', 'k'];
const axisOffsets = [[60, 20], [-50, 26], [0, -48]];
const ns = 'http://www.w3.org/2000/svg';

function draw(svg, tag, attributes, label) {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (label !== undefined) node.textContent = label;
  svg.append(node);
  return node;
}
function line(svg, x1, y1, x2, y2, accent = false) {
  draw(svg, 'line', { x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': accent ? 3 : 1, opacity: accent ? 1 : .45 });
}
function label(svg, x, y, value) {
  draw(svg, 'text', { x, y, fill: 'currentColor', 'font-size': 11 }, value);
}
function dot(svg, cx, cy, r = 3, opacity = 1) {
  draw(svg, 'circle', { cx, cy, r, fill: 'currentColor', opacity });
}
function range(title, min, max, value, step = 1) { return {title, min, max, value, step}; }

const models = {
  'crystal-structures/definitions': {
    title: 'Draw a different cell on the same lattice',
    instruction: 'Shear the top edge, then double the base. Which change makes the cell nonprimitive?',
    fields: [range('Base (lattice spacings)', 1, 3, 1), range('Shear (lattice spacings)', -2, 2, 0)],
    render(svg, [m, s]) {
      const x = 120, y = 88, a = 27;
      draw(svg, 'polygon', {points: [[0,0],[m,0],[m+s,1],[s,1]].map(([i,j]) => [x+i*a,y-j*a].join(',')).join(' '), fill:'currentColor','fill-opacity':.16,stroke:'currentColor','stroke-width':2});
      for (let i=-4;i<=6;i++) for(let j=-1;j<=2;j++) dot(svg,x+i*a,y-j*a,2.7);
      label(svg, 12, 18, 'Square lattice · one site per small square');
      return 'Area = '+m+' square lattice unit'+(m===1?'':'s')+'. Counting shared boundaries gives '+m+' lattice site'+(m===1?'':'s')+' per cell. This cell is '+(m===1?'primitive.':'nonprimitive.');
    }
  },
  'crystal-structures/systems': {
    title:'Look straight down the hexagonal c-axis',
    instruction:'Trace the six nearest sites. Switch basal axes and compare the shaded primitive cell with the six-sided outline.',
    fields:[{title:'Basal axes',options:['Conventional axes · 120°','Alternative lattice vectors · 60°']}],
    render(svg,[alternative]) {
      const x=145,y=66,r=43;
      const near=Array.from({length:6},(_,i)=>[x+r*Math.cos(i*Math.PI/3),y-r*Math.sin(i*Math.PI/3)]);
      draw(svg,'polygon',{points:near.map(p=>p.join(',')).join(' '),fill:'none',stroke:'currentColor','stroke-dasharray':'3 3'});
      const [ax,ay]=near[0], [bx,by]=near[alternative?1:2];
      draw(svg,'polygon',{points:[[x,y],[ax,ay],[ax+bx-x,ay+by-y],[bx,by]].map(p=>p.join(',')).join(' '),fill:'currentColor','fill-opacity':.17,stroke:'currentColor'});
      for(const [cx,cy] of near) dot(svg,cx,cy);
      dot(svg,x,y);line(svg,x,y,ax,ay,true);line(svg,x,y,bx,by,true);
      const arcEndX=x+(bx-x)*.34,arcEndY=y+(by-y)*.34;
      draw(svg,'path',{d:'M '+(x+r*.34)+' '+y+' A '+(r*.34)+' '+(r*.34)+' 0 0 0 '+arcEndX+' '+arcEndY,fill:'none',stroke:'currentColor'});
      label(svg,x+12,y-12,alternative?'60°':'120°');
      label(svg,ax+5,ay+4,'a');label(svg,bx-3,by-5,'b');
      label(svg,7,122,'Top view · c points out of the page');
      return 'Angle between the selected basal vectors = '+(alternative?'60':'120')+'°. Both cells contain one lattice site after sharing. The six neighbors and the lattice are unchanged.';
    }
  },
  'materials-and-bonding/properties': {
    title: 'Pull an ideal brittle specimen',
    instruction: 'Keep fracture strength fixed and change the modulus. Compare the slope, the breaking stress and the strain at fracture.',
    fields:[range('Young’s modulus (GPa)',50,200,100,10),range('Fracture strength (MPa)',200,600,400,25),range('Applied stress (MPa)',0,600,200,25)],
    render(svg,[e,strength,stress]) {
      const endStrain = strength / (10*e), strain = Math.min(stress,strength)/(10*e);
      const x = p => 39+p/1.2*232, y = p => 103-p/600*75;
      line(svg,39,103,280,103); line(svg,39,103,39,25);
      line(svg,39,103,x(endStrain),y(strength),true); dot(svg,x(strain),y(Math.min(strength,stress)),5);
      label(svg,6,17,'Stress (MPa)'); label(svg,10,32,'600'); label(svg,35,118,'0'); label(svg,205,122,'Strain (%)   1.2');
      return (stress>=strength?'Fracture reached. The dot marks the last intact state.':'Intact specimen. Strain = '+strain.toFixed(3)+'%.')+' Strain at fracture = '+endStrain.toFixed(3)+'%. The model assumes linear elasticity up to sudden fracture.';
    }
  },
  'laser-radiation/interactions': {
    title:'Excite an atom with a photon or a collision',
    instruction:'Try 2.0 eV, then 2.5 eV. Can a two-level atom absorb the extra half electron volt?',
    fields:[{title:'Energy source',options:['Single photon','Particle collision']},range('Incoming energy (eV)',0.5,3.5,2,.1)],
    render(svg,[mode,energy]) {
      const collision=mode===1, excited=collision?energy>=2:Math.abs(energy-2)<.001;
      line(svg,36,99,170,99,true); line(svg,36,41,170,41,true);
      dot(svg,98,excited?41:99,6); label(svg,178,45,'2 eV · excited'); label(svg,178,103,'0 eV · ground');
      label(svg,14,18,excited?'Outcome if excitation occurs':'Excitation unavailable in this model');
      if (!collision) return excited?'Resonance. Absorption is allowed and transfers 2.0 eV to the atom.':'Off resonance. A photon transfers its full energy in absorption. This ideal sharp two-level atom stays in the ground state.';
      return excited?'Excitation is energetically allowed. For an exciting collision, '+(energy-2).toFixed(1)+' eV remains as relative kinetic energy in the center-of-mass frame.':'Too little relative kinetic energy to excite this atom. It stays in the ground state.';
    }
  },
  'nuclear-basic-concepts/beta': {
    title:'Follow 80 independent decays',
    instruction:'Predict how many free neutrons will survive one half-life. Draw another sample at the same time and compare the two counts.',
    fields:[range('Elapsed time (half-lives)',0,5,1,.1)], random:true,
    render(svg,[t],sample) {
      const survives=life=>t===0 || life>t;
      const alive=sample.filter(survives).length;
      sample.forEach((life,i)=>dot(svg,20+(i%16)*17,28+Math.floor(i/16)*18,5,survives(life)?1:.14));
      label(svg,12,120,'Filled = surviving neutron · faded = decayed');
      return alive+' of 80 survive in this sample. Average predicted across many samples = '+(80*2**(-t)).toFixed(1)+'. Each neutron has an independent, random lifetime.';
    }
  },
  'nuclear-basic-concepts/binding': {
    title:'Measure the same helium atom from two references',
    instruction:'Switch the reference for helium-4. Predict why the sign changes while the mass of the atom stays fixed.',
    fields:[{title:'Reference mass',options:['Two hydrogen atoms + two neutrons','Four atomic mass units']}],
    render(svg,[mode]) {
      const he=heliumBinding();
      const x=e=>27+e*7.3;
      const bound=x(he.excess), separated=x(he.excess+he.energy), ref=mode?x(0):separated;
      line(svg,x(0),66,separated,66);
      for(const pos of [x(0),bound,separated]) line(svg,pos,59,pos,73,true);
      line(svg,ref,80,bound,80,true);dot(svg,ref,80,4);
      label(svg,8,47,'4 u');label(svg,bound+5,56,'He atom');label(svg,separated-43,47,'2 H + 2 n');
      label(svg,8,112,'Mass-energy above 4 u in MeV · dot = selected reference');
      return mode?'Helium minus 4 u = +'+he.excess.toFixed(2)+' MeV/c². This gives a positive atomic mass excess.':'Helium minus separated constituents = −'+he.energy.toFixed(2)+' MeV/c². The corresponding nuclear binding energy is approximately +'+he.energy.toFixed(2)+' MeV, neglecting the small electronic binding correction.';
    }
  },
  'emt-vector-analysis/components': {
    title:'Test the Cartesian basis products',
    instruction:'Choose i and j, then swap their order. Predict which product changes sign. Try two identical axes next.',
    fields:[{title:'First basis vector',options:axisNames},{title:'Second basis vector',options:axisNames,value:1}],
    render(svg,[a,b]) {
      const same=a===b, idx=3-a-b, sign=(a+1)%3===b?1:-1;
      const cross=same?'0':(sign<0?'−':'')+axisNames[idx];
      for(let i=0;i<3;i++) {
        const [dx,dy]=axisOffsets[i]; line(svg,135,70,135+dx,70+dy); label(svg,138+dx,73+dy,axisNames[i]);
      }
      if(!same) {
        const [dx,dy]=axisOffsets[idx].map(v=>v*sign*.8);
        line(svg,135,70,135+dx,70+dy,true);
        const ex=135+dx,ey=70+dy;
        line(svg,ex,ey,ex-dx*.17-dy*.10,ey-dy*.17+dx*.10,true);
        line(svg,ex,ey,ex-dx*.17+dy*.10,ey-dy*.17-dx*.10,true);
      } else dot(svg,135,70,4);
      label(svg,8,122,'Bold arrow = cross product in a right-handed frame');
      return axisNames[a]+' · '+axisNames[b]+' = '+Number(same)+'     '+axisNames[a]+' × '+axisNames[b]+' = '+cross+'. '+(same?'Parallel vectors span zero area.':'The cross product is perpendicular to both selected axes.');
    }
  }
};

export function experimentFor(course, id) {
  const model=models[course+'/'+id];
  if(!model) return null;
  const panel=document.createElement('details');
  panel.className='review-experiment';
  const heading=document.createElement('summary'); heading.textContent=model.title;
  const instruction=document.createElement('p'); instruction.textContent=model.instruction;
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 300 130'); svg.setAttribute('aria-label',model.title); svg.setAttribute('role','img');
  const inputs=document.createElement('div'); inputs.className='experiment-inputs';
  const result=document.createElement('output');
  let sample;
  function resample(){sample=Array.from({length:80},()=>-Math.log1p(-Math.random())/Math.LN2);}
  if(model.random) resample();
  const read=model.fields.map(field=>{
    const wrap=document.createElement('label');
    const name=document.createElement('span'); wrap.append(name);
    const input=document.createElement(field.options?'select':'input');
    if(field.options) {
      field.options.forEach((option,index)=>input.add(new Option(option,index)));
      input.value=field.value??0;
    } else {
      input.type='range'; input.min=field.min; input.max=field.max; input.step=field.step; input.value=field.value;
    }
    input.setAttribute('aria-label',field.title);
    wrap.append(input); inputs.append(wrap); input.addEventListener('input',update);
    return ()=>{name.textContent=field.title+(field.options?'':' · '+input.value);return Number(input.value);};
  });
  function update(){svg.replaceChildren();result.textContent=model.render(svg,read.map(get=>get()),sample);}
  panel.append(heading,instruction,svg,inputs);
  if(model.random) {
    const again=document.createElement('button');again.type='button';again.textContent='Draw another sample';
    again.addEventListener('click',()=>{resample();update();});panel.append(again);
  }
  panel.append(result);update();return panel;
}
