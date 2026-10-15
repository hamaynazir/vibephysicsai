import {sections,pageMap,pageNotes,examples} from './lecture-data.js';
import {Visualizer} from './visuals.js';
import {Teaching} from './teaching.js';
import {Learning} from './learning.js';
import {systems,cubicInfo,basisVectors,volume,dSpacing,reduceIndices,norm,dot,madelungShells,potential,radialForce} from './crystal-math.js';

const $=s=>document.querySelector(s);
const storage={get(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
const model=new Visualizer($('#scene'));
const teaching=new Teaching(()=>refresh());
let learning;
model.onAtomSelected=p=>{if(learning?.mode==='build')return;teaching.setSelection(p);learning?.inspect({kind:'atom',p:[...p]});};
model.onInspect=detail=>learning?.inspect(detail);
let currentPage=1,currentSection=sections[0],sync=true,tab='explore',zoom=1,pdf=null,pdfEpoch=0,rendering=false;
const renderQueue=new Set();
const defaults={
 order:{disorder:0,cell:true,basis:false},translation:{disorder:0,shift:0,cell:true},
 lattice:{structure:'FCC',primitive:true,axes:true,atomScale:.7,bonds:false,repeat:false},
 systems:{system:'Cubic',centering:'P',axes:true,atomScale:.7},bravais:{system:'Cubic',centering:'P',axes:true,atomScale:.7},
 symmetry:{operation:'4-fold',angle:0,mirror:'Straight'},wigner:{structure:'BCC',neighbors:true},
 packing:{structure:'SC',atomScale:.55,axes:true,bonds:false,repeat:false},
 structures:{structure:'FCC',atomScale:.85,axes:true,bonds:true,repeat:false,primitive:false,ca:Math.sqrt(8/3)},
 indices:{indexMode:'plane',indices:[1,1,1],axes:true,family:false},
 spacing:{system:'Cubic',indices:[1,1,1],params:[4,4,4,90,90,90],family:true,axes:true},
 forces:{m:1,n:9,distance:1,components:true},bonding:{bond:'Ionic',animate:true},madelung:{dimension:3,shells:4,connections:false}
};
let mode='order',state=structuredClone(defaults.order),lastPagePreset=0;
const fmt=(n,dec=3)=>Number(n).toFixed(dec).replace(/\.?0+$/,'');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4000);}

function buildToc(){const term=$('#search').value.toLowerCase();let count=0;$('#toc').innerHTML=sections.filter(s=>(s.title+' '+s.heading+' '+s.description).toLowerCase().includes(term)).map(s=>{count++;return `<a href="#page=${s.pages[0]}&topic=${s.id}" data-topic="${s.id}" class="${s.id===currentSection.id?'active':''}" ${s.id===currentSection.id?'aria-current="location"':''}><span class="toc-num">${s.n}</span><span>${s.title}</span></a>`}).join('');$('#no-results').hidden=count!==0;}
$('#search').addEventListener('input',buildToc);
$('#toc').addEventListener('click',e=>{const link=e.target.closest('[data-topic]');if(!link)return;e.preventDefault();const section=sections.find(s=>s.id===link.dataset.topic);goPage(section.pages[0],section);});

$('#visual-section').innerHTML=sections.map(s=>`<option value="${s.id}">${s.n}. ${escapeHTML(s.title)}</option>`).join('');
function navigateVisualization(section){if(!section)return;goPage(section.pages[0],section);learning?.activate('explore');}
$('#visual-section').onchange=e=>navigateVisualization(sections.find(s=>s.id===e.target.value));
$('#visual-previous').onclick=()=>navigateVisualization(sections[sections.indexOf(currentSection)-1]);
$('#visual-next').onclick=()=>navigateVisualization(sections[sections.indexOf(currentSection)+1]);

function pagePreset(page){
 if(page===1)return {disorder:0};if(page===2||page===3)return {structure:'FCC',primitive:true};
 if(page===5)return {system:'Tetragonal'};if(page===6)return {system:'Monoclinic'};if(page===7)return {system:'Hexagonal'};
 if(page===14)return {structure:'FCC'};if(page===15)return {structure:'BCC',primitive:true};if(page===16)return {structure:'NaCl'};if(page===17)return {structure:'CsCl'};if(page===18)return {structure:'ZnS'};if(page===19||page===20)return {structure:'HCP'};
 if(page>=21&&page<=23)return {indexMode:'direction',indices:[1,2,3]};if(page===24)return {indices:[3,4,6],indexMode:'plane'};if(page===25)return {indices:[1,1,0],indexMode:'plane'};if(page===28)return {indices:[1,0,-3],indexMode:'plane'};
 if(page===29)return {system:'Cubic',params:[4.468914856,4.468914856,4.468914856,90,90,90],indices:[1,1,1]};if(page===30)return {disorder:100};
 if(page===33)return {m:2,n:10,distance:1};if(page===34||page===35)return {m:1,n:8,distance:1.2};
 if(page===37)return {bond:'Metallic'};if(page===38)return {bond:'Hydrogen'};if(page===40)return {dimension:2,shells:4};return {};
}
function setSection(section,{preset=true,force=false}={}){
 const changed=currentSection.id!==section.id||force;currentSection=section;
 $('#visual-section').value=section.id;
 $('#visual-previous').disabled=sections.indexOf(section)===0;
 $('#visual-next').disabled=sections.indexOf(section)===sections.length-1;
 if(changed){mode=section.mode;state=structuredClone(defaults[mode]);}
 if(preset&&lastPagePreset!==currentPage){Object.assign(state,pagePreset(currentPage));lastPagePreset=currentPage;}
 $('#section-label').textContent=`${section.n} / ${section.title.toUpperCase()}`;$('#lab-title').textContent=section.heading;$('#lab-description').textContent=section.description;
 $('#page-context').textContent=`COMPANION TO PAGE ${currentPage}`;$('#next-topic').textContent=section.id==='madelung'?'Back to the beginning →':'Next topic →';
 buildToc();renderControls();renderIdeas();renderPractice();refresh();
 if(changed){
  $('.lab-scroll').scrollTop=0;
  const active=$('#toc a.active'),nav=$('#toc');
  if(active){const r=active.getBoundingClientRect(),n=nav.getBoundingClientRect();if(innerWidth>720){if(r.bottom>n.bottom)nav.scrollTop+=r.bottom-n.bottom+6;else if(r.top<n.top)nav.scrollTop+=r.top-n.top-6;}else{if(r.right>n.right)nav.scrollLeft+=r.right-n.right+8;else if(r.left<n.left)nav.scrollLeft+=r.left-n.left-8;}}
 }
}
function updatePage(page,section=null){
 storage.set('study-library-last-lesson','crystal-structures');
 currentPage=Math.max(1,Math.min(40,page));$('#page-input').value=currentPage;$('#prev-page').disabled=currentPage===1;$('#next-page').disabled=currentPage===40;$('#progress-text').textContent=`${currentPage} / 40`;$('#progress').style.width=`${currentPage/40*100}%`;
 if(sync||section){const mapped=section||sections.find(s=>s.id===pageMap[currentPage-1][0]);setSection(mapped,{force:!!section});}
 else $('#page-context').textContent=`LAB PINNED · READING PAGE ${currentPage}`;
 const hash=`#page=${currentPage}${section?'&topic='+section.id:''}`;history.replaceState(null,'',hash);storage.set('crystal-page',String(currentPage));
}
function goPage(page,section=null){const target=Math.max(1,Math.min(40,Math.round(page)));const el=$(`#page-${target}`),root=$('#pdf-scroll');if(el)root.scrollTop=el.offsetTop-$('#pdf-pages').offsetTop;updatePage(target,section);queueVisible();}
$('#prev-page').onclick=()=>goPage(currentPage-1);$('#next-page').onclick=()=>goPage(currentPage+1);
$('#page-input').onchange=e=>{const p=+e.target.value;if(Number.isFinite(p)&&p>=1&&p<=40)goPage(p);else e.target.value=currentPage;};
$('#next-topic').onclick=()=>{const i=sections.indexOf(currentSection),next=sections[(i+1)%sections.length];goPage(next.pages[0],next);};
$('#sync').onclick=()=>{sync=!sync;$('#sync').textContent=sync?'Sync on':'Sync off';$('#sync').setAttribute('aria-pressed',String(sync));$('#sync-label').textContent=sync?'Diagrams follow your page':'Lab pinned while you read';if(sync){lastPagePreset=0;updatePage(currentPage);}else $('#page-context').textContent=`LAB PINNED · READING PAGE ${currentPage}`;};
window.addEventListener('hashchange',()=>{const p=new URLSearchParams(location.hash.slice(1));goPage(+p.get('page')||1,sections.find(s=>s.id===p.get('topic'))||null);});

// Controls stay in place while a range changes, keeping focus and dragging intact.
function select(id,label,values,value){return `<label for="${id}">${label}<select id="${id}">${values.map(v=>{const [key,text]=Array.isArray(v)?v:[v,v];return `<option value="${key}" ${String(value)===String(key)?'selected':''}>${text}</option>`}).join('')}</select></label>`;}
function segments(id,values,value){return `<div class="segmented" role="group" aria-label="${id}">${values.map(v=>`<button data-${id}="${v}" class="${value===v?'selected':''}" aria-pressed="${value===v}">${v}</button>`).join('')}</div>`;}
function range(id,label,min,max,step,value,suffix=''){return `<label class="range-row" for="${id}"><span>${label}</span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output for="${id}" id="${id}-out">${fmt(value,2)}${suffix}</output></label>`;}
function check(id,label,checked){return `<label class="check-row"><input id="${id}" type="checkbox" ${checked?'checked':''}>${label}</label>`;}
function indicesControls(){const labels=state.indexMode==='direction'&&mode==='indices'?['u','v','w']:['h','k','l'];return `<div class="number-grid">${labels.map((v,i)=>`<label>${v}<input id="index-${i}" type="number" min="-6" max="6" step="1" value="${state.indices[i]}" aria-label="Index ${v}"></label>`).join('')}</div>`;}
function renderControls(){
 const c=$('#controls'),e=$('#extra-controls'),s=state;let controls='',extra='';
 if(mode==='order'){controls=segments('order',['Crystalline','Amorphous'],s.disorder?'Amorphous':'Crystalline');extra=range('disorder','Disorder',0,100,1,s.disorder,'%')+check('cell','Show a repeating unit cell',s.cell)+check('basis','Add a second atom to each motif',s.basis);}
 if(mode==='translation'){controls='<span class="small">Shift by whole multiples of the a vector</span>';extra=range('shift','Translation',-2,2,1,s.shift,'a');}
 if(['lattice','packing','structures'].includes(mode)){
  const opts=mode==='structures'?['SC','BCC','FCC','NaCl','CsCl','Diamond','ZnS','HCP']:['SC','BCC','FCC'];controls=mode==='packing'?segments('structure',opts,s.structure):select('structure','Structure',opts,s.structure);
  extra=range('atom-scale','Atom display',.15,1,.05,s.atomScale,'×')+check('bonds','Show nearest-neighbor connections',s.bonds)+check('axes','Show crystal axes',s.axes)+check('repeat','Repeat 2 × 2 × 2 cells',s.repeat);
  if(mode!=='packing'&&['FCC','BCC'].includes(s.structure))extra+=check('primitive','Overlay primitive vectors / cell',s.primitive);
  if(s.structure==='HCP')extra=range('ca','c/a ratio',1.3,2,.001,s.ca)+`<button id="ideal-hcp" class="inline-link">Restore ideal √(8/3)</button>`+extra;
  extra+='<p class="small">Whole boundary atoms are drawn. Counts use fractional sharing. Display size does not change the ideal packing calculation.</p>';
  const legends={SC:['Equivalent lattice sites'],BCC:['Corner sites','Body-center sites'],FCC:['Corner sites','Face-center sites'],Diamond:['Carbon · sublattice A','Carbon · sublattice B'],NaCl:['Na⁺ ions','Cl⁻ ions'],CsCl:['Cs⁺ ions','Cl⁻ ions'],ZnS:['Zn atoms','S atoms'],HCP:['Layer A atoms','Layer B atoms']};
  const colors=document.documentElement.dataset.theme==='light'?['#158477','#8451c7']:['#76e0ce','#ba9dff'];
  controls+=`<div class="legend atom-legend" aria-label="Atom colors">${legends[s.structure].map((name,i)=>`<span><i style="background:${colors[i]}"></i>${name}</span>`).join('')}${['Diamond','BCC','FCC','HCP'].includes(s.structure)?`<p class="legend-note">${s.structure==='Diamond'?'Both colors are carbon. The two FCC sublattices are offset by (¼, ¼, ¼).':s.structure==='HCP'?'Colors distinguish ABAB stacking layers of the same element.':'Colors distinguish positions, not different elements.'}</p>`:''}</div>`;
 }
 if(mode==='systems'||mode==='bravais'){
  controls=select('system','System',Object.keys(systems),s.system);const centerings=systems[s.system].centerings;if(!centerings.includes(s.centering))s.centering=centerings[0];
  if(mode==='bravais')controls+=select('centering','Centering',centerings,s.centering);
  extra=`<div class="formula">${systems[s.system].rule}</div><p class="small">${mode==='bravais'?'P: primitive · I: body-centered · F: face-centered · C: base-centered · R: rhombohedral lattice. The R setting here uses primitive rhombohedral axes.':'The a, b and c axes are shown in mint, violet and gold.'}</p>`;
  if(mode==='bravais')extra+=`<div class="table-wrap"><table><thead><tr><th>System</th><th>Types</th><th>Count</th></tr></thead><tbody>${Object.entries(systems).map(([name,sys])=>`<tr><td>${name}</td><td>${sys.centerings.join(', ')}</td><td>${sys.centerings.length}</td></tr>`).join('')}</tbody></table></div>`;
 }
 if(mode==='symmetry'){
  controls=select('operation','Operation',['4-fold','3-fold','2-fold','Mirror','Inversion'],s.operation);
  if(s.operation==='Mirror')controls+=select('mirror','Plane',['Straight','Diagonal'],s.mirror);
  if(s.operation.includes('fold'))extra=range('angle','Rotation',0,360,1,s.angle,'°')+`<div class="action-row"><button id="symmetry-step">Rotate by ${s.operation==='4-fold'?90:s.operation==='3-fold'?120:180}°</button><button id="symmetry-zero">Reset angle</button></div>`;
  extra+='<p class="small">Gold marks a rotation axis or inversion center; violet marks a mirror plane. Orbiting with the mouse changes only the camera.</p>';
 }
 if(mode==='wigner'){controls=segments('structure',['SC','BCC','FCC'],s.structure);extra=check('neighbors','Show sites across the cell faces',s.neighbors)+'<p class="small">The translucent body is the intersection of the perpendicular-bisector half-spaces around the origin.</p>';}
 if(mode==='indices'){
  controls=segments('indexMode',['plane','direction'],s.indexMode)+indicesControls();extra=`<div class="action-row">${(s.indexMode==='direction'?['1,0,0','1,1,0','1,1,1','1,2,3','1,-2,1']:['1,0,0','1,1,0','1,1,1','1,2,2','1,0,-3','3,4,6']).map(v=>`<button data-indices="${v}">${s.indexMode==='direction'?'[':'('}${v.split(',').join(' ')}${s.indexMode==='direction'?']':')'}</button>`).join('')}</div>`;
  if(s.indexMode==='plane')extra+=check('family','Show parallel planes at integer offsets',s.family);
  extra+='<div id="index-detail" class="note"></div>';
  if(s.indexMode==='direction')extra+='<div class="formula">[123] · [1 −2 1] = 1 − 4 + 3 = 0 → 90°</div>';
 }
 if(mode==='spacing'){
  controls=select('system','System',Object.keys(systems),s.system)+indicesControls();const names=['a (Å)','b (Å)','c (Å)','α (°)','β (°)','γ (°)'];extra=`<div class="number-grid">${names.map((name,i)=>`<label>${name}<input id="param-${i}" type="number" min="${i<3?.1:1}" max="${i<3?100:179}" step="${i<3?.01:1}" value="${fmt(s.params[i],6)}" ${paramLocked(s.system,i)?'disabled':''}></label>`).join('')}</div><div class="action-row"><button id="preset-al">Example 1.7 · Al</button><button id="preset-ni">Example 1.8 · Ni (220)</button><button id="preset-spacing">Reset cell</button></div>`+check('family','Show the parallel plane stack',s.family)+'<div id="spacing-detail" class="note"></div>';
 }
 if(mode==='forces'){
  controls=select('potential-preset','Potential', [['1,9','m = 1, n = 9'],['2,10','m = 2, n = 10'],['1,8','m = 1, n = 8']],`${s.m},${s.n}`);
  extra=range('distance','Distance r/r₀',.7,2.5,.01,s.distance)+check('components','Show attraction and repulsion terms',s.components)+`<div class="legend"><span><i></i>Total U</span><span><i style="background:#ba9dff"></i>Attraction</span><span><i style="background:#f4bd77"></i>Repulsion</span></div><div class="action-row"><button id="equilibrium">Go to equilibrium</button><button id="critical">Go to tensile limit</button></div><p class="small">Normalized model: A = 1, B = m/n, r₀ = 1. Fᵣ is positive for repulsion. U is in model energy units.</p>`;
 }
 if(mode==='bonding'){controls=select('bond','Bond type',['Ionic','Covalent','Metallic','Hydrogen','London'],s.bond);extra=check('animate','Animate electron illustration',s.animate);}
 if(mode==='madelung'){controls=select('dimension','Arrangement',[[1,'1D chain'],[2,'2D square'],[3,'3D NaCl']],s.dimension);extra=range('shells','Shells',1,s.dimension===1?12:8,1,s.shells)+check('connections','Connect the central ion to neighbors',s.connections)+'<div class="legend"><span><i style="background:#f4bd77"></i>Central + ion</span><span><i style="background:#ba9dff"></i>Opposite (−)</span><span><i></i>Like (+)</span></div><div id="shell-table" class="table-wrap"></div><p class="small">These are raw distance-shell partial sums. In 2D and 3D they can oscillate strongly; use Ewald or another suitable convergence method for an accurate bulk constant.</p>';}
 c.innerHTML=controls;e.innerHTML=extra;
}
function paramLocked(system,i){if(system==='Cubic')return [1,2,3,4,5].includes(i);if(system==='Tetragonal')return [1,3,4,5].includes(i);if(system==='Orthorhombic')return i>=3;if(system==='Monoclinic')return [3,4].includes(i);if(system==='Trigonal')return [1,2,4,5].includes(i);if(system==='Hexagonal')return [1,3,4,5].includes(i);return false;}
function constrainParams(){const p=state.params,s=state.system;if(['Cubic','Tetragonal','Trigonal','Hexagonal'].includes(s))p[1]=p[0];if(['Cubic','Trigonal'].includes(s))p[2]=p[0];if(['Cubic','Tetragonal','Orthorhombic'].includes(s))p.splice(3,3,90,90,90);if(s==='Monoclinic'){p[3]=90;p[4]=90;}if(s==='Hexagonal')p.splice(3,3,90,90,120);if(s==='Trigonal'){p[4]=p[3];p[5]=p[3];}}
function metric(value,label){return `<div class="metric"><strong>${value}</strong><small>${label}</small></div>`;}
function refresh(){
 const s=state;let metrics='',insight='',label='';
 try{
  if(mode==='order'){metrics=metric(s.disorder?'Local':'Long-range','order')+metric(s.basis?'2':'1','atoms per motif')+metric(s.disorder?'Broken':'Periodic','translation symmetry');label=s.disorder?'SCHEMATIC DISORDER':'PERIODIC ARRANGEMENT';insight=s.disorder?'<strong>Local structure survives.</strong> An amorphous solid can have preferred neighbor distances without a periodically repeating unit cell.':'<strong>Look for the repeat.</strong> A small motif, repeated by lattice translations, builds the whole crystal.';document.querySelectorAll('[data-order]').forEach(b=>{const selected=b.dataset.order===(s.disorder?'Amorphous':'Crystalline');b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}
  if(mode==='translation'){metrics=metric(`${s.shift}a`,'lattice translation')+metric('Same','interior environment')+metric('ℤ','integer translations');label='TRANSLATIONAL SYMMETRY';insight='<strong>Watch the outlined sites.</strong> Translated mint points land on equivalent positions. Only the artificial sample boundary changes.';}
  if(['lattice','packing','structures'].includes(mode)){
   const type=s.structure,info=cubicInfo[type];label=`${type.toUpperCase()} · ${mode==='packing'?'HARD-SPHERE PACKING':'CRYSTAL STRUCTURE'}`;
   const other={NaCl:[8,6,'FCC + 2 ions'],CsCl:[2,8,'SC + 2 ions'],ZnS:[8,4,'FCC + 2 atoms']};
   if(info){const largeHcp=type==='HCP'&&!teaching.state.enabled&&!s.repeat;metrics=metric(largeHcp?6:info.atoms,type==='HCP'?(largeHcp?'atoms / six-sided prism':'atoms / primitive cell'):'atoms / conventional cell')+metric(info.cn,'nearest neighbors')+metric(`${(info.apf*100).toFixed(1)}%`,'ideal packing fraction');insight=`<strong>${largeHcp?'12 corners × ⅙ + 2 basal centers × ½ + 3 inside = 6 atoms':info.count}.</strong> ${info.relation}. ${mode==='lattice'||s.primitive?`Primitive volume: ${info.primitive===1?'Vcell':`a³/${Math.round(1/info.primitive)}`}. `:''}${type==='HCP'?(largeHcp?'The six-sided prism shows A–B–A stacking and contains three primitive cells. Vector and coordinate teaching views use the two-atom primitive cell.':'Primitive-cell view: 2 atoms. The familiar six-sided prism contains 6 atoms.'):''}`;
   }else{const [atoms,cn,lattice]=other[type];metrics=metric(atoms,'atoms / conventional cell')+metric(cn,'nearest unlike neighbors')+metric(type==='CsCl'?'P':'F','Bravais centering');insight=`<strong>${lattice}.</strong> ${type==='CsCl'?'Corner and body-center ions differ, so this is primitive cubic with a basis, not a BCC Bravais lattice.':type==='NaCl'?'Two FCC sublattices are offset by (½, 0, 0); each ion has six opposite-charge nearest neighbors.':'Two FCC sublattices are offset by (¼, ¼, ¼); each atom has four tetrahedral neighbors.'}`;}
   if(type==='HCP'&&Math.abs(s.ca-Math.sqrt(8/3))>.003)insight+='<br>The displayed c/a is distorted; the quoted 74.0% APF applies to the ideal ratio.';
  }
  if(mode==='systems'||mode==='bravais'){const sys=systems[s.system],p=sys.params,points={P:1,C:2,I:2,F:4,R:1}[mode==='systems'?'P':s.centering];label=`${s.system.toUpperCase()} · ${mode==='bravais'?s.centering+' CENTERING':'CELL METRIC'}`;metrics=metric(s.system,'crystal system')+metric(mode==='bravais'?s.centering:'P','lattice setting')+metric(points,'points / displayed cell');insight=`<strong>${sys.rule}.</strong> ${s.system==='Monoclinic'?'This lecture uses γ as the non-right angle (unique c-axis). Another common setting uses β.':s.system==='Trigonal'?'Primitive rhombohedral axes are used. The alternate R-centered hexagonal setting has three lattice points per conventional cell.':'The cell wireframe shows the geometry. Atom positions in this view represent lattice sites.'}`;}
  if(mode==='symmetry'){const op=s.operation,fold=op.includes('fold')?parseInt(op):null;label=`CUBIC SYMMETRY · ${op.toUpperCase()}`;metrics=metric(fold?`${360/fold}°`:op==='Mirror'?'9':'1',fold?'rotation step':op==='Mirror'?'mirror planes in cube':'inversion center')+metric(fold?({2:6,3:4,4:3}[fold]):op==='Mirror'?'13':'r → −r',fold?'axes of this order':op==='Mirror'?'rotation axes':'inversion map')+metric(fold?`${s.angle}°`:'23',fold?'current rotation':'geometric elements');insight=fold?`<strong>${s.angle%(360/fold)===0?'Symmetry position.':'Between symmetry positions.'}</strong> ${fold===4?'Three axes pass through opposite face centers.':fold===3?'Four axes follow body diagonals.':'Six axes connect opposite edge midpoints.'} Use the rotation step to return to an indistinguishable cube.`:'<strong>Compare equivalent positions.</strong> A mirror exchanges points across a plane; inversion exchanges opposite positions through the center.';}
  if(mode==='wigner'){const type=s.structure,facets={SC:6,BCC:14,FCC:12}[type],vol={SC:'a³',BCC:'a³/2',FCC:'a³/4'}[type];label=`${type} · WIGNER–SEITZ CELL`;metrics=metric(facets,'faces')+metric('1','lattice point')+metric(vol,'primitive volume');insight=`<strong>${{SC:'Cube',BCC:'Truncated octahedron',FCC:'Rhombic dodecahedron'}[type]}.</strong> Every point inside is closer to the origin than to another lattice site. Face-sharing sites lie across perpendicular bisectors.`;}
  if(mode==='indices'||mode==='spacing'){
   const v=s.indices,valid=v.some(Boolean);if(!valid){metrics=metric('Invalid','(0 0 0)')+metric('—','no direction / plane')+metric('—','enter a nonzero index');insight='At least one index must be nonzero.';}
   else if(mode==='indices'){
    const len=norm(v),reduced=reduceIndices(v),dir=s.indexMode==='direction',intercepts=v.map(x=>x===0?'∞':fmt(1/x,3));label=`${dir?'DIRECTION':'MILLER PLANE'} ${dir?'[':'('}${v.join(' ')}${dir?']':')'}`;
    metrics=dir?metric(`√${dot(v,v)}a`,'vector length, cubic axes')+metric(`[${reduced.join(' ')}]`,'reduced direction')+metric('Cubic','displayed unit cell'):metric(intercepts[0]+'a','x intercept')+metric(intercepts[1]+'b','y intercept')+metric(intercepts[2]+'c','z intercept');
    insight=dir?'<strong>Same direction, shorter arrow.</strong> The arrow is translated and scaled to fit the cell. Its orientation matches the entered vector.':'<strong>Violet is the plane; gold is its normal.</strong> Negative indices give negative intercepts. A translated parallel member may be shown so it intersects the visible cell.';
    const detail=$('#index-detail');if(detail)detail.innerHTML=dir?`Unit vector = (${v.map(x=>fmt(x/len,4)).join(', ')}). Direction length is evaluated for the entered cubic vector a(${v.join(', ')}).`:`Fractional intercepts = (${intercepts.join(', ')}). Plane equation: ${v[0]}x/a + ${v[1]}y/b + ${v[2]}z/c = 1. The normal is [hkl] here because the axes are cubic.`;
   }else{
    constrainParams();const basis=basisVectors(s.params),d=dSpacing(v,s.params);label=`(${v.join(' ')}) PLANES · ${s.system.toUpperCase()}`;metrics=metric(d.toFixed(4)+' Å','interplanar spacing')+metric(volume(basis).toFixed(2)+' Å³','cell volume')+metric(v.join(' '),'indices · order retained');insight='<strong>Measure perpendicular to the planes.</strong> Increasing the indices at fixed cell dimensions decreases d. The spacing formula uses reciprocal vectors for the selected metric.';const detail=$('#spacing-detail');if(detail)detail.innerHTML=`d = 1 / |h a* + k b* + l c*| = <strong>${d.toFixed(5)} Å</strong>.<br>${s.system==='Cubic'?`Cubic check: ${fmt(s.params[0])} / √(${v.map(x=>x*x).join(' + ')})`:'No cubic approximation is used for this cell.'}`;
   }
  }
  if(mode==='forces'){const m=s.m,n=s.n,r=s.distance,u=potential(r,m,n),f=radialForce(r,m,n),rcrit=((n+1)/(m+1))**(1/(n-m));label=`PAIR POTENTIAL · m = ${m}, n = ${n}`;metrics=metric(u.toFixed(3),'potential U · model units')+metric(Math.abs(f)<.0005?'0':f.toFixed(3),'radial force Fᵣ')+metric(rcrit.toFixed(3),'tensile limit r/r₀');insight=`<strong>${Math.abs(r-1)<.006?'At equilibrium: the forces cancel.':r<1?'Too close: repulsion dominates.':'Stretched: attraction pulls the pair together.'}</strong> U has its minimum at r₀ = 1. The maximum sustainable tensile load is reached at r/r₀ ≈ ${rcrit.toFixed(3)}.`;}
  if(mode==='bonding'){const info={Ionic:['Transfer','Electrostatic','NaCl','An electron transfers between species, creating oppositely charged ions.'],Covalent:['Sharing','Directional','Diamond','Electron density is shared; diamond forms four directional tetrahedral bonds per atom.'],Metallic:['Delocalized','Mobile','Sodium','Valence electrons spread through the crystal and bind the positive ion cores.'],Hydrogen:['Secondary','Polar','Ice','Hydrogen bonds connect molecules; the O–H bonds within each water molecule are covalent.'],London:['Secondary','Fluctuating','Argon','Correlated temporary dipoles produce dispersion attraction. This is present in all atoms and molecules.']}[s.bond];label=`${s.bond.toUpperCase()} BOND · CONCEPTUAL VIEW`;metrics=metric(info[0],'electron behavior')+metric(info[1],'bond character')+metric(info[2],'lecture example');insight=`<strong>${s.bond} bonding.</strong> ${info[3]} The animation is an illustrative model, not a quantum trajectory.`;}
  if(mode==='madelung'){const shells=madelungShells(+s.dimension,+s.shells),sum=shells.reduce((a,x)=>a+x.term,0);label=`${s.dimension}D ALTERNATING IONS · ${s.shells} SHELL${s.shells>1?'S':''}`;metrics=metric(sum.toFixed(5),'finite shell sum αₙ')+metric(s.shells,'distance shells included')+metric(s.dimension===1?'1.38629':s.dimension===3?'1.74756':'Finite sum',s.dimension===1?'exact limit 2 ln 2':s.dimension===3?'NaCl reference limit':'not a converged constant');insight='<strong>Attraction and repulsion alternate.</strong> Adding one shell can change the partial sum substantially. The four-shell 2D result on page 40 is a truncation.';const el=$('#shell-table');if(el)el.innerHTML=`<table><thead><tr><th>Shell</th><th>Ions</th><th>r/r₀</th><th>Term</th></tr></thead><tbody>${shells.map((x,i)=>`<tr><td>${i+1}</td><td>${x.n} ${x.sign===1?'opposite':'like'}</td><td>${fmt(Math.sqrt(x.r2))}</td><td>${x.term>=0?'+':''}${x.term.toFixed(4)}</td></tr>`).join('')}</tbody></table>`;}
  learning?.update(mode,s,currentSection);
  const teachingOverlay=teaching.update(mode,s);
  model.set(mode,learning?.sceneState(mode,s,teachingOverlay)||{...s,teaching:teachingOverlay});
 }catch(error){metrics=metric('Invalid cell','check lengths and angles');insight=escapeHTML(error.message);}
 $('#metrics').innerHTML=metrics;$('#insight').innerHTML=insight;$('#scene-label').textContent=label;
}

function bindControl(container){
 container.addEventListener('input',e=>{
  const t=e.target,id=t.id;if(t.type==='number'&&(!t.value||!t.checkValidity()))return;
  const out=$(`#${id}-out`);if(out)out.textContent=fmt(+t.value,2)+(id==='disorder'?'%':id==='atom-scale'?'×':id==='angle'?'°':id==='shift'?'a':'');
  const keys={'atom-scale':'atomScale',disorder:'disorder',shift:'shift',angle:'angle',distance:'distance',ca:'ca',shells:'shells'};
  if(keys[id]){state[keys[id]]=+t.value;refresh();return;}
  if(id.startsWith('index-')){state.indices[+id.slice(-1)]=+t.value;refresh();return;}
  if(id.startsWith('param-')){state.params[+id.slice(-1)]=+t.value;constrainParams();state.params.forEach((v,i)=>{const input=$(`#param-${i}`);if(input&&input!==t)input.value=fmt(v,6)});refresh();return;}
  if(t.type==='checkbox'){state[id]=t.checked;refresh();return;}
 });
 container.addEventListener('change',e=>{
  const t=e.target,id=t.id;if(t.tagName!=='SELECT')return;
  if(id==='potential-preset'){[state.m,state.n]=t.value.split(',').map(Number);state.distance=1;}
  else if(id==='system'){state.system=t.value;if(mode==='spacing')state.params=systems[t.value].params.map((v,i)=>i<3?v*4:v);else state.centering=systems[t.value].centerings[0];}
  else if(id==='operation'){state.operation=t.value;state.angle=0;}
  else state[id]=id==='dimension'?+t.value:t.value;
  if(id==='dimension')state.shells=4;renderControls();refresh();
 });
 container.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.order){state.disorder=t.dataset.order==='Amorphous'?100:0;}
  else if(t.dataset.structure)state.structure=t.dataset.structure;
  else if(t.dataset.indexmode){state.indexMode=t.dataset.indexmode;}
  else if(t.dataset.indices)state.indices=t.dataset.indices.split(',').map(Number);
  else if(t.id==='ideal-hcp')state.ca=Math.sqrt(8/3);
  else if(t.id==='symmetry-step')state.angle=(state.angle+(state.operation==='4-fold'?90:state.operation==='3-fold'?120:180))%360;
  else if(t.id==='symmetry-zero')state.angle=0;
  else if(t.id==='equilibrium')state.distance=1;
  else if(t.id==='critical')state.distance=((state.n+1)/(state.m+1))**(1/(state.n-state.m));
  else if(t.id==='preset-al'){state.system='Cubic';state.params=[4.468914856,4.468914856,4.468914856,90,90,90];state.indices=[1,1,1];}
  else if(t.id==='preset-ni'){state.system='Cubic';state.params=[3.524,3.524,3.524,90,90,90];state.indices=[2,2,0];}
  else if(t.id==='preset-spacing')state.params=systems[state.system].params.map((v,i)=>i<3?v*4:v);
  else return;renderControls();refresh();
 });
}
bindControl($('#controls'));bindControl($('#extra-controls'));
$('#spin').onclick=()=>{model.spin=!model.spin;$('#spin').setAttribute('aria-pressed',String(model.spin));model.dirty=true;};$('#reset').onclick=()=>model.reset();

function renderIdeas(){const section=currentSection;const relevant=examples.filter(e=>e.pages[1]>=section.pages[0]&&e.pages[0]<=section.pages[1]);$('#ideas-view').innerHTML=`<div class="note"><strong>On page ${currentPage}</strong><br>${pageNotes[currentPage]}</div><div class="formula">${section.formula}</div>${section.ideas.map(([title,body])=>`<div class="idea-block"><h3>${title}</h3><p>${body}</p></div>`).join('')}${relevant.length?'<div class="eyebrow">WORKED EXAMPLES</div>':''}${relevant.map(e=>`<details><summary>Example ${e.n} · ${e.title}</summary><p>${e.body}</p><button class="inline-link" data-example="${e.n}">Explore this example →</button><p class="small">Original solution: ${e.pages[0]===e.pages[1]?'page '+e.pages[0]:'pages '+e.pages.join('–')}</p></details>`).join('')}<details><summary>About these companion notes</summary><p>The PDF is unchanged. These original study notes clarify terminology and sign conventions. For formal definitions, see the <a href="https://dictionary.iucr.org/Interplanar_spacing" target="_blank" rel="noopener">IUCr definition of interplanar spacing</a>, <a href="https://www.iucr.org/who-we-are/commissions/commission-on-crystallographic-nomenclature/published-reports/bravais" target="_blank" rel="noopener">Bravais nomenclature</a>, and <a href="https://journals.iucr.org/j/issues/2023/06/00/dv5006/index.html" target="_blank" rel="noopener">IUCr symmetry database and CsCl example</a>.</p></details>`;}
$('#ideas-view').onclick=e=>{const t=e.target.closest('[data-example]');if(!t)return;const ex=examples.find(x=>x.n===t.dataset.example);goPage(ex.pages[0]);mode=ex.mode;state=structuredClone(defaults[mode]);if(mode==='structures')state.structure=ex.preset;if(mode==='indices'){state.indexMode=ex.preset==='direction'?'direction':'plane';state.indices=ex.preset==='negative'?[1,0,-3]:ex.preset==='direction'?[1,2,3]:[1,1,1];}if(mode==='spacing'){const a=ex.preset==='Al'?4.468914856:3.524;state.params=[a,a,a,90,90,90];state.indices=ex.preset==='Al'?[1,1,1]:[2,2,0];}if(mode==='forces')[state.m,state.n]=ex.preset.split(',').map(Number);if(mode==='madelung')state.dimension=+ex.preset;renderControls();refresh();switchTab('explore');};
function renderPractice(){const [question,options]=currentSection.quiz;$('#practice-view').innerHTML=`<div class="eyebrow">CHECK YOUR UNDERSTANDING</div><p class="quiz-question">${question}</p><div class="quiz-options">${options.map((o,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div><p class="quiz-feedback" id="quiz-feedback" aria-live="polite">Choose an answer, then explore the model to test your reasoning.</p><button id="retry-quiz" hidden>Try again</button>`;}
$('#practice-view').onclick=e=>{if(e.target.id==='retry-quiz'){renderPractice();return;}const t=e.target.closest('[data-answer]');if(!t)return;const [,options,correct,why]=currentSection.quiz,ok=+t.dataset.answer===correct;learning?.recordQuiz(currentSection,ok);$('#practice-view').querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;if(+b.dataset.answer===correct)b.classList.add('correct');});if(!ok)t.classList.add('incorrect');$('#quiz-feedback').textContent=(ok?'Correct. ':'The answer is '+options[correct]+'. ')+why;$('#retry-quiz').hidden=false;};
function switchTab(next){tab=next;for(const name of ['explore','ideas','practice']){$(`#tab-${name}`).setAttribute('aria-selected',String(name===next));$(`#tab-${name}`).tabIndex=name===next?0:-1;$(`#${name}-view`).hidden=name!==next;}if(next==='explore'){model.resize();model.dirty=true;}}
for(const name of ['explore','ideas','practice'])$(`#tab-${name}`).onclick=()=>switchTab(name);
$('.lab-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopPropagation();const tabs=['explore','ideas','practice'];switchTab(tabs[(tabs.indexOf(tab)+(e.key==='ArrowRight'?1:2))%3]);$(`#tab-${tab}`).focus();});

// Render original pages lazily. The page containers remain stable for scroll sync.
async function openPDF(){
 const status=$('#pdf-status');
 try{
  if(!window.pdfjsLib)throw new Error('The local PDF viewer could not load.');pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.js',import.meta.url).href;
  pdf=await pdfjsLib.getDocument({url:new URL('./assets/lecture.pdf',import.meta.url).href,isEvalSupported:false}).promise;
  if(pdf.numPages!==40)throw new Error('This companion expects the original 40-page lecture.');
  const first=await pdf.getPage(1),vp=first.getViewport({scale:1});
  $('#pdf-pages').innerHTML=Array.from({length:40},(_,i)=>`<div class="pdf-page" id="page-${i+1}" data-page="${i+1}" style="aspect-ratio:${vp.width}/${vp.height}" role="img" aria-label="Original lecture, page ${i+1}"><span class="page-placeholder">Page ${i+1}</span></div>`).join('');status.hidden=true;
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)queuePage(+entry.target.dataset.page);});},{root:$('#pdf-scroll'),rootMargin:'600px 0px'});document.querySelectorAll('.pdf-page').forEach(p=>observer.observe(p));
  const params=new URLSearchParams(location.hash.slice(1)),start=Number(params.get('page'))||Number(storage.get('crystal-page',1))||1;goPage(start,sections.find(s=>s.id===params.get('topic'))||null);
 }catch(error){status.className='error-message';status.innerHTML=`The PDF viewer could not open the lecture. ${escapeHTML(error.message)}<br><a href="assets/lecture.pdf" target="_blank" rel="noopener">Open the original PDF directly ↗</a><br>Run this folder through the included local server, rather than double-clicking index.html.`;}
}
function queuePage(page){const el=$(`#page-${page}`);if(!pdf||!el||el.dataset.rendered==='true')return;renderQueue.add(page);drainQueue();}
async function drainQueue(){
 if(rendering)return;rendering=true;
 try{while(renderQueue.size){const page=renderQueue.values().next().value;renderQueue.delete(page);const el=$(`#page-${page}`);if(!el||el.dataset.rendered==='true')continue;const epoch=pdfEpoch;try{const p=await pdf.getPage(page),base=p.getViewport({scale:1}),width=el.clientWidth;if(!width)continue;const viewport=p.getViewport({scale:width/base.width*Math.min(devicePixelRatio,1.75)}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await p.render({canvasContext:canvas.getContext('2d'),viewport}).promise;if(epoch!==pdfEpoch)continue;el.querySelector('canvas')?.remove();el.append(canvas);el.dataset.rendered='true';}catch(error){el.querySelector('.page-placeholder').textContent=`Page ${page} could not render. Open the original PDF above.`;console.error(error);}}}finally{rendering=false;}
}
function queueVisible(){if(!pdf)return;const root=$('#pdf-scroll').getBoundingClientRect();document.querySelectorAll('.pdf-page').forEach(p=>{const r=p.getBoundingClientRect();if(r.bottom>root.top-500&&r.top<root.bottom+500)queuePage(+p.dataset.page);});}
let scrollFrame=0;
$('#pdf-scroll').addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const root=$('#pdf-scroll').getBoundingClientRect(),marker=root.top+Math.min(root.height*.28,160);let best=currentPage;for(const p of document.querySelectorAll('.pdf-page')){const r=p.getBoundingClientRect();if(r.top<=marker&&r.bottom>=marker){best=+p.dataset.page;break;}}if(best!==currentPage)updatePage(best);queueVisible();});},{passive:true});
function invalidatePDF(){pdfEpoch++;document.querySelectorAll('.pdf-page').forEach(p=>{p.dataset.rendered='false';p.querySelector('canvas')?.remove();});queueVisible();}
function changeZoom(delta){const next=Math.max(.7,Math.min(1.8,+(zoom+delta).toFixed(1)));if(next===zoom)return;zoom=next;document.querySelectorAll('.pdf-page').forEach(p=>p.style.width=`${zoom*100}%`);$('#zoom-label').textContent=zoom===1?'Fit':Math.round(zoom*100)+'%';invalidatePDF();goPage(currentPage);}
$('#zoom-in').onclick=()=>changeZoom(.1);$('#zoom-out').onclick=()=>changeZoom(-.1);
let resizeTimer=0,lastPDFWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-lastPDFWidth)>2){lastPDFWidth=width;clearTimeout(resizeTimer);resizeTimer=setTimeout(invalidatePDF,220);}}).observe($('#pdf-scroll'));

function setTheme(theme){document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]').content=theme==='light'?'#ffffff':'#0c1220';$('#theme').textContent=theme==='dark'?'☀':'☾';$('#theme').setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} mode`);storage.set('crystal-theme',theme);model.themeChanged();renderControls();}
// Apply the requested paper appearance once to existing installations; later choices persist.
if(storage.get('crystal-appearance-version','')!=='4'){storage.set('crystal-theme','light');storage.set('crystal-appearance-version','4');}
setTheme(storage.get('crystal-theme','light'));$('#theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
$('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();$('#help-dialog').onclick=e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>{$('#workspace').dataset.panel=b.dataset.panel;document.querySelectorAll('.mobile-switch button').forEach(t=>t.classList.toggle('active',t===b));model.resize();queueVisible();});
document.addEventListener('keydown',e=>{if($('#help-dialog').open)return;if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName))return;if(e.key==='/'){e.preventDefault();learning?.setChapters(true);}else if(e.key==='ArrowRight'){e.preventDefault();goPage(currentPage+1);}else if(e.key==='ArrowLeft'){e.preventDefault();goPage(currentPage-1);}});
learning=new Learning({teaching,showTab:switchTab,refresh:()=>refresh(),patch:values=>{Object.assign(state,values);renderControls();refresh();},navigate:id=>{const section=sections.find(s=>s.id===id)||sections[0];goPage(section.pages[0],section);},setup:config=>{
 const section=sections.find(s=>s.id===config.section)||sections[0];goPage(config.page||section.pages[0],section);
 mode=config.mode||section.mode;state=structuredClone(defaults[mode]);Object.assign(state,config.patch||{});teaching.previousKey='';teaching.update(mode,state);Object.assign(teaching.state,config.teach||{enabled:false});renderControls();refresh();
}});
buildToc();setSection(sections[0],{preset:false});switchTab('explore');openPDF();
