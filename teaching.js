import {systems,basisVectors,fractional,sub,mul,unitSites,volume,norm,reciprocal} from './crystal-math.js';
import {primitiveVectors,angleBetween,cellAccounting,nearestNeighbors,originCoordinates,primitiveVolume} from './teaching-math.js';

const f=x=>Math.abs(x)<1e-8?'0':Number(x.toFixed(4)).toString();
const triple=p=>`(${p.map(f).join(', ')})`;
const equation=(v,suffix='')=>`${f(v[0])}î ${v[1]<0?'−':'+'} ${f(Math.abs(v[1]))}ĵ ${v[2]<0?'−':'+'} ${f(Math.abs(v[2]))}k̂${suffix}`;
export function teachingParams(mode,state){if(['systems','bravais'].includes(mode))return systems[state.system].params;if(mode==='spacing')return state.params;if(mode==='structures'&&state.structure==='HCP')return [1,1,state.ca,90,90,120];return [1,1,1,90,90,90];}
const choices={lattice:['vectors','angles','origin','primitive','counting','neighbors'],systems:['angles','vectors','origin'],bravais:['angles','vectors','origin'],packing:['counting','neighbors','vectors'],structures:['neighbors','vectors','angles','origin','primitive','counting'],indices:['vectors','origin','planes'],spacing:['planes','angles','vectors'],wigner:['construction']};
const names={vectors:'Vector components · î, ĵ, k̂',angles:'See α, β and γ',origin:'Move the origin',neighbors:'Select an atom & its neighbors',primitive:'Build a primitive cell',counting:'Count shared atoms',planes:'Build a Miller plane',construction:'Build a Wigner–Seitz cell'};
const steps={primitive:['Choose the origin','Draw primitive vectors','Complete the cell','Compare volumes'],counting:['Identify positions','Apply sharing fractions','Add the contributions'],planes:['Locate the intercepts','Take reciprocals','Read the integer indices','Draw the actual plane'],construction:['Choose a lattice site','Connect its neighbors','Bisect at right angles','Keep the closest region']};

export class Teaching{
 constructor(onChange){
  this.onChange=onChange;this.previousKey='';this.state={enabled:false,topic:'vectors',vector:'a',angle:'gamma',angleBasis:'conventional',origin:[0,0,0],selected:[0,0,0],step:0};
  this.toolbar=document.createElement('div');this.toolbar.id='teaching-toolbar';this.toolbar.className='teaching-toolbar';document.querySelector('#visual-stage').before(this.toolbar);
  this.notes=document.createElement('div');this.notes.id='teaching-notes';this.notes.className='teaching-notes';document.querySelector('#metrics').after(this.notes);
  this.settings=document.createElement('details');this.settings.id='diagram-settings';this.settings.innerHTML='<summary>Diagram controls · vectors, angles & more</summary>';document.querySelector('#insight').after(this.settings);this.settings.append(this.toolbar,document.querySelector('#extra-controls'));
  this.toolbar.addEventListener('change',e=>{
   const t=e.target;
   if(t.id==='teach-topic'){this.state.topic=t.value;this.state.step=0;}
   else if(t.id==='teach-vector')this.state.vector=t.value;
   else if(t.id==='teach-angle')this.state.angle=t.value;
   else if(t.id==='teach-angle-basis')this.state.angleBasis=t.value;
   else if(t.id==='teach-atom')this.state.selected=t.value.split(',').map(Number);
   else if(t.id==='teach-origin')this.state.origin=t.value.split(',').map(Number);
   else if(t.id==='teach-enabled')this.state.enabled=t.checked;
   else return;this.onChange();
  });
  this.toolbar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='teach-next')this.state.step=Math.min(this.state.step+1,steps[this.state.topic].length-1);else if(b.id==='teach-prev')this.state.step=Math.max(0,this.state.step-1);else return;this.onChange();});
 }
 setSelection(p){this.state.selected=[...p];this.state.topic='neighbors';this.state.enabled=true;this.onChange();}
 update(mode,state){
  this.mode=mode;this.main=state;const available=choices[mode];this.toolbar.hidden=!available;this.notes.hidden=!available;
  if(!available)return null;
  const key=mode+'|'+(state.structure||'')+'|'+(mode==='indices'?state.indexMode:'');
  if(key!==this.previousKey){this.previousKey=key;this.state.topic=mode==='indices'&&state.indexMode==='direction'?'vectors':mode==='indices'?'planes':available[0];this.state.vector=mode==='indices'&&state.indexMode==='direction'?'direction':'a';this.state.step=0;this.state.selected=[0,0,0];}
  const options=available.filter(x=>!(mode==='indices'&&(state.indexMode==='direction'?x==='planes':x==='vectors'||x==='origin')));
  if(!options.includes(this.state.topic))this.state.topic=options[0];
  const t=this.state,params=teachingParams(mode,state),basis=basisVectors(params),type=state.structure||'SC';
  if(t.topic==='neighbors'&&!unitSites(type,state.repeat?2:1).some(x=>norm(sub(x.p,t.selected))<1e-6))t.selected=[0,0,0];
  let html=`<div class="teaching-title"><span>UNDERSTAND THIS DIAGRAM</span><label><input id="teach-enabled" type="checkbox" ${t.enabled?'checked':''}> Show teaching overlay</label></div>`;
  html+=`<label class="teach-choice" for="teach-topic"><span>Learn</span><select id="teach-topic">${options.map(x=>`<option value="${x}" ${t.topic===x?'selected':''}>${names[x]}</option>`).join('')}</select></label>`;
  if(t.enabled){
   if(t.topic==='vectors'){
    const vectors=[['a','a · conventional edge'],['b','b · conventional edge'],['c','c · conventional edge']];
    if(['lattice','structures'].includes(mode))for(let i=1;i<=3;i++)vectors.push(['p'+i,`a${['₁','₂','₃'][i-1]} · primitive vector`]);
    if(mode==='indices')vectors.push(['direction','Entered [uvw] direction']);
    if(!vectors.some(v=>v[0]===t.vector))t.vector=vectors[0][0];
    html+=`<label class="teach-choice">Vector<select id="teach-vector">${vectors.map(([id,label])=>`<option value="${id}" ${t.vector===id?'selected':''}>${label}</option>`).join('')}</select></label>`;
   }
   if(t.topic==='angles'){
    const hasPrimitive=['lattice','structures'].includes(mode),usePrimitive=hasPrimitive&&t.angleBasis==='primitive';
    if(hasPrimitive)html+=`<label class="teach-choice">Cell<select id="teach-angle-basis"><option value="conventional" ${!usePrimitive?'selected':''}>Conventional vectors</option><option value="primitive" ${usePrimitive?'selected':''}>Primitive vectors</option></select></label>`;
    html+=`<label class="teach-choice">Angle<select id="teach-angle">${(usePrimitive?[['alpha','α · between a₂ and a₃'],['beta','β · between a₁ and a₃'],['gamma','γ · between a₁ and a₂']]:[['alpha','α · between b and c'],['beta','β · between a and c'],['gamma','γ · between a and b']]).map(([v,label])=>`<option value="${v}" ${t.angle===v?'selected':''}>${label}</option>`).join('')}</select></label>`;
   }
   if(t.topic==='origin')html+=`<label class="teach-choice">Origin O′<select id="teach-origin">${[[0,0,0],[.5,0,0],[.5,.5,.5],[1,1,1]].map(p=>`<option value="${p}" ${String(p)===String(t.origin)?'selected':''}>${triple(p)} in cell coordinates</option>`).join('')}</select></label>`;
   if(t.topic==='neighbors')html+=`<label class="teach-choice">Atom<select id="teach-atom">${unitSites(type,state.repeat?2:1).map((atom,i)=>`<option value="${atom.p}" ${String(atom.p)===String(t.selected)?'selected':''}>${i+1}. ${triple(atom.p)}</option>`).join('')}</select></label><p class="small teach-hint">Click or tap an atom in the model, or choose it here.</p>`;
   if(steps[t.topic])html+=`<div class="teaching-steps"><button id="teach-prev" ${t.step===0?'disabled':''} aria-label="Previous construction step">←</button><span>STEP ${t.step+1} / ${steps[t.topic].length} · ${steps[t.topic][t.step]}</span><button id="teach-next" ${t.step===steps[t.topic].length-1?'disabled':''} aria-label="Next construction step">→</button></div>`;
   if(t.topic==='counting')html+='<p class="small teach-hint">Teaching colors: gold corners · purple faces · pink edges · green interior. One cell is shown for counting.</p>';
   if(t.topic==='neighbors')html+='<p class="small teach-hint">Teaching colors: gold selected atom · purple nearest neighbors · faint periodic copies outside the box.</p>';
  }
  // Replacing these controls only happens on a discrete selection, never a range drag.
  this.toolbar.innerHTML=html;this.notes.hidden=!t.enabled;
  if(!t.enabled)return null;
  const config={...t,origin:[...t.origin],selected:[...t.selected]};
  let body='';
  if(t.topic==='vectors'){
   const primitive=t.vector.startsWith('p'),dir=t.vector==='direction';
   const vec=dir?[...state.indices]:primitive?primitiveVectors(type)[+t.vector[1]-1]:[[1,0,0],[0,1,0],[0,0,1]][['a','b','c'].indexOf(t.vector)];
   const cart=fractional(vec,basis),displayScale=dir?1/Math.max(...vec.map(Math.abs),1):1;
   config.vector=mul(vec,displayScale);config.originalComponents=[...cart];config.vectorName=dir?'R':primitive?'a'+['₁','₂','₃'][+t.vector[1]-1]:t.vector;
   body=`<h3>Read the arrow through its components</h3><p>The gold arrow is <strong>${config.vectorName}</strong>. The colored path adds its x, y and z components in order; the fixed Cartesian directions are î, ĵ and k̂.</p><div class="formula">${config.vectorName} = ${equation(cart)}</div><div class="component-grid"><span>x / î <strong>${f(cart[0])}</strong></span><span>y / ĵ <strong>${f(cart[1])}</strong></span><span>z / k̂ <strong>${f(cart[2])}</strong></span></div><p>Start at O = (0, 0, 0). The unscaled endpoint in Cartesian coordinates is ${triple(cart)}. ${dir?`The arrow is drawn at ${f(displayScale)} times its length so it fits; its direction is unchanged.`:'Lengths use a = 1 for the unit models, or Å for the spacing calculator.'}</p><p>${primitive&&['Diamond','ZnS','NaCl'].includes(type)?'These are primitive vectors of the underlying FCC Bravais lattice. Its atomic basis travels with every lattice point.':params.slice(3).some(a=>Math.abs(a-90)>1e-6)?'The cell axes are oblique. A coefficient along b is not the same as a Cartesian y component: b can contribute to both î and ĵ.':'For this orthogonal cell, a, b and c align with x, y and z.'}</p>`;
  }
  if(t.topic==='angles'){
   const primitive=['lattice','structures'].includes(mode)&&t.angleBasis==='primitive';
   config.angleVectors=primitive?primitiveVectors(type).map(v=>fractional(v,basis)):basis;
   config.angleNames=primitive?['a₁','a₂','a₃']:['a','b','c'];
   const map={alpha:[1,2,0,'α'],beta:[0,2,1,'β'],gamma:[0,1,2,'γ']},[i,j,p,symbol]=map[t.angle],first=config.angleNames[i],second=config.angleNames[j],degrees=angleBetween(config.angleVectors[i],config.angleVectors[j]);
   config.anglePair=[i,j];body=`<h3>${symbol} is the angle between ${first} and ${second}</h3><p>The two highlighted rays start at the same origin. The curved arc measures their included angle, even when the camera is rotated.</p><div class="formula">${symbol} = cos⁻¹[(${first} · ${second}) / (|${first}| |${second}|)] = ${f(degrees)}°</div><p><strong>${primitive?'Primitive: α = ∠(a₂,a₃), β = ∠(a₁,a₃), γ = ∠(a₁,a₂).':'Conventional: α = ∠(b,c), β = ∠(a,c), γ = ∠(a,b).'}</strong> These are angles between actual vectors, not their apparent angle on the screen.</p><p>${primitive?'For the primitive-vector choices used here, FCC angles are 60° and BCC angles are about 109.47°. Their conventional cubic cell angles are 90°. Changing the basis changes the cell description, not the underlying lattice.':mode==='systems'||mode==='bravais'?'Change the System control above to see which angles and lengths change.':mode==='spacing'?'Edit the enabled metric controls below; locked angles follow the selected crystal system.':'These conventional axes are cubic except HCP, whose basal angle γ is 120°. Compare Primitive vectors in the Cell selector.'}</p>`;
  }
  if(t.topic==='origin'){
   const A=[.25,.25,.25],B=[.75,.5,.75],data=originCoordinates(A,B,t.origin,basis);config.A=A;config.B=B;
   body=`<h3>Move the origin; keep the same two points</h3><p>O is the original cell corner. O′ is ${triple(t.origin)} in cell coordinates. The crystal, A and B stay fixed; only the coordinate reference moves.</p><div class="formula">r′ = r − O′<br>r′<sub>A</sub> = ${equation(data.a)}<br>r′<sub>B</sub> = ${equation(data.b)}</div><p>The gold arrow A → B is always <strong>${equation(data.displacement)}</strong>. Subtracting the same origin cancels: (B − O′) − (A − O′) = B − A.</p><p>Colored arrows from O′ are the fixed Cartesian directions î, ĵ, k̂. This control moves the origin; it does not rotate the axes or move the atoms.</p>`;
  }
  if(t.topic==='neighbors'){
   const neighbors=nearestNeighbors(type,t.selected,params);config.neighbors=neighbors;
   const selectedSpecies=unitSites(type,state.repeat?2:1).find(a=>norm(sub(a.p,t.selected))<1e-6)?.s||0;
   const species=type==='Diamond'?'carbon':type==='NaCl'?selectedSpecies?'Cl⁻':'Na⁺':type==='CsCl'?selectedSpecies?'Cl⁻':'Cs⁺':type==='ZnS'?selectedSpecies?'S':'Zn':'atom';
   body=`<h3>This ${species} has ${neighbors.sites.length} nearest neighbors</h3><p>The selected atom is gold; its nearest neighbors and connecting bonds are highlighted. Faint atoms outside the cell are periodic copies needed to show the complete environment.</p><div class="formula">Selected cell coordinates: ${triple(t.selected)}<br>d<sub>nearest</sub> = ${f(neighbors.distance)} · unit model length</div><p>${['Diamond','ZnS'].includes(type)?'The four bond directions form a tetrahedron. Some neighbors lie in adjacent cells, so one isolated unit-cell drawing can hide them.':type==='HCP'?'At the ideal c/a ratio, six neighbors lie in the same layer, three above and three below. Distorting c/a can split those distances, changing the strict nearest shell.':'Coordination counts the full periodic crystal, not only the neighbors drawn inside a single box.'}</p>`;
  }
  if(t.topic==='primitive'){
   const p=primitiveVectors(type),vectors=p.map(v=>fractional(v,basis)),pv=primitiveVolume(type,params),cv=volume(basis),isFCC=['FCC','Diamond','NaCl','ZnS'].includes(type);
   config.primitiveVectors=p;body=`<h3>${steps.primitive[t.step]}</h3><p>${['Begin at a lattice site O. A primitive cell is generated by three independent translation vectors.','Draw the three gold primitive arrows. Each joins equivalent lattice sites; the cell edges a, b, c remain the reference.','Translate each primitive vector by the other two to close a parallelepiped. It tiles space without gaps or overlaps.','Use the scalar triple product. The primitive cell contains exactly one Bravais lattice point after sharing.'][t.step]}</p><div class="formula">${vectors.map((v,i)=>`a${['₁','₂','₃'][i]} = ${equation(v)}`).join('<br>')}</div><p>V<sub>primitive</sub> = |a₁ · (a₂ × a₃)| = <strong>${f(pv)}</strong>; V<sub>conventional</sub> = ${f(cv)}. Ratio = ${f(pv/cv)}${isFCC?' = ¼':type==='BCC'?' = ½':''}.</p><p>${['Diamond','ZnS','NaCl'].includes(type)?'One lattice point carries a two-atom basis here: the primitive cell contains two atoms, not one.':type==='HCP'?'The displayed two-atom hexagonal cell is already primitive for the underlying hexagonal lattice.':type==='CsCl'?'CsCl has a primitive cubic lattice with a two-ion basis. Body-center and corner species are different, so a BCC centering vector is not a lattice translation.':'Primitive refers to lattice points, not to the number of spheres visibly touching the cell.'}</p>`;
  }
  if(t.topic==='counting'){
   const count=cellAccounting(type);config.accounting=count;body=`<h3>${steps.counting[t.step]}</h3><p>${['Look at one cell. A corner touches eight cells, an edge four, a face two, and an interior position only one.','Multiply the number of visible atom centers in each category by the fraction owned by this cell.','Add the weighted contributions. Boundary atoms belong partly to neighboring cells; interior atoms belong entirely to this cell.'][t.step]}</p><div class="table-wrap"><table><thead><tr><th>Position</th><th>Visible centers</th><th>Share</th><th>Contribution</th></tr></thead><tbody>${count.rows.map(r=>`<tr><td>${r.name}</td><td>${r.count}</td><td>${t.step?f(r.share):'?'}</td><td>${t.step===2?f(r.count*r.share):'?'}</td></tr>`).join('')}</tbody></table></div><p>${t.step===2?`Total = ${count.rows.map(r=>r.count+' × '+f(r.share)).join(' + ')} = <strong>${f(count.total)} atoms</strong>.`:'Advance the construction to reveal the sharing fractions and then the total.'}</p><p>Gold: corners; purple: faces; pink: edges; green: interior. These teaching colors indicate sharing, not chemical species. ${type==='HCP'?'This is the smaller two-atom parallelepiped, not the large six-atom hexagonal prism.':''}</p>`;
  }
  if(t.topic==='planes'){
   const h=state.indices||[1,1,1],valid=h.some(Boolean);config.indices=h;
   const intercepts=h.map(x=>x?f(1/x):'∞'),recip=h.map(x=>f(x));
   body=`<h3>${steps.planes[t.step]}</h3>${!valid?'<p>Enter at least one nonzero index to define a plane.</p>':`<p>${['Mark each intercept on its actual positive or negative axis. A zero index means the plane is parallel to that axis, so no finite intercept point exists.','Take the reciprocals of the intercepts measured in a, b, c units. Infinity becomes zero. A negative intercept gives a negative reciprocal.','For an orientation problem, clear denominators to obtain an integer ratio. Here the entered integers are already the plane indices. For d-spacing, retain their entered order.','Connect the finite intercepts and extend along any parallel axes. The displayed teaching plane is the actual plane with right-hand side 1, including negative intercepts.'][t.step]}</p><div class="formula">Intercepts / (a,b,c): (${intercepts.join(', ')})${t.step>=1?`<br>Reciprocals: (${recip.join(', ')})`:''}${t.step>=2?`<br>Miller indices: (${h.join(' ')})`:''}${t.step===3?`<br>${h[0]}ξ + ${h[1]}η + ${h[2]}ζ = 1<br>r = ξa + ηb + ζc`:''}</div><p>ξ, η and ζ are fractional cell coordinates, not generally Cartesian x/a, y/b and z/c. Finite intercept markers lie on the corresponding cell axes. Negative axes extend outside the original cell. ${t.step===3?'The gold arrow is the reciprocal-space normal. For a noncubic cell it need not point along the direct-lattice direction [hkl].':''}</p>`}`;
  }
  if(t.topic==='construction')body=`<h3>${steps.construction[t.step]}</h3><p>${['Choose the gold lattice site as the origin. Surrounding points belong to the same periodic lattice.','Connect the origin to nearby lattice sites. Their directions determine potential cell boundaries.','Construct perpendicular-bisector faces: r · R = |R|²/2. A point on such a face is equally distant from the origin and the corresponding neighbor.','Keep the region nearer to the origin than to every other site. The closed Wigner–Seitz body is one primitive cell.'][t.step]}</p><div class="formula">${t.step>=2?'r · R ≤ |R|²/2':'R joins the origin to a lattice neighbor'}</div><p>SC → cube; BCC → truncated octahedron; FCC → rhombic dodecahedron. This construction uses the nearest-site region, rather than an arbitrary choice of parallelepiped.</p>`;
  const overlayText={vectors:()=>`${config.vectorName} = ${equation(fractional(config.vector,basis))}${config.vectorName==='R'?' (drawn scale)':''}`,angles:()=>`${{alpha:'α',beta:'β',gamma:'γ'}[t.angle]} = ∠(${config.angleNames[config.anglePair[0]]},${config.angleNames[config.anglePair[1]]}) = ${f(angleBetween(config.angleVectors[config.anglePair[0]],config.angleVectors[config.anglePair[1]]))}°`,origin:()=>`O′ = ${triple(t.origin)} · A → B stays fixed`,neighbors:()=>`${config.neighbors.sites.length} nearest neighbors · d = ${f(config.neighbors.distance)}`,primitive:()=>`Step ${t.step+1}: ${steps.primitive[t.step]}`,counting:()=>t.step===2?`${config.accounting.total} atoms after boundary sharing`:`Step ${t.step+1}: ${steps.counting[t.step]}`,planes:()=>`Step ${t.step+1}: ${steps.planes[t.step]}`,construction:()=>`Step ${t.step+1}: ${steps.construction[t.step]}`};
  config.readout=overlayText[t.topic]();
  this.notes.innerHTML=body;return config;
 }
}
