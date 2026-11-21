import {createScrollReader} from '../../../scrolling-reader.js';
import {installLectureReview} from '../../../lecture-review.js?v=math-1';
import {lesson,sections,pageSections,defaults,guide,challenges,sources} from './content.js?v=chapter-2';
import {COHORT_SIZE,coulombState,evaluate,fermiWalkthrough,massSamples,TC_ISOMER} from './math.js?v=chapter-2';
import {draw,bindingSteps,isomerSteps} from './visuals.js?v=chapter-2';
import {LecturePlayback} from './playback.js?v=chapter-2';
import katex from '../../../vendor/katex.mjs';
import {installReaderNavigation} from '../../../reader-navigation.js?v=materials-3';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=n=>n===null?'Not defined':typeof n==='number'?Number(n.toPrecision(5)).toString():String(n);
const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}};
let memory={records:{},notes:{},guide:0};try{const m=JSON.parse(storage.get(lesson.learningKey));if(m&&typeof m==='object'){if(m.records&&typeof m.records==='object'&&!Array.isArray(m.records))memory.records=m.records;if(m.notes&&typeof m.notes==='object'&&!Array.isArray(m.notes))memory.notes=m.notes;if(Number.isInteger(m.guide))memory.guide=Math.min(guide.length-1,Math.max(0,m.guide));}}catch{}
let current=sections[0],state={...defaults},page=1,mode='explore',sync=true,guideActive=false;
const states=new Map();
$('#app').innerHTML=`<a class="skip" href="#companion">Skip to interactive lesson</a><header><div><a href="../../../#subject=nuclear-models">← Library</a><strong>Nuclear Concepts</strong></div><div class="header-buttons"><button id="sections-button">Sections</button><button id="theme" aria-label="Switch color theme">☾</button><button id="help" aria-label="Help">?</button></div></header><div class="mobile-tabs" role="group" aria-label="View panel"><button data-panel="manual" aria-pressed="false">Lecture</button><button data-panel="lab" aria-pressed="true">Simulation</button></div><nav class="navigation visual-navigation" data-lesson="nuclear-basic-concepts" aria-label="Subject, chapter and visualization navigation"><label class="visual-section-field">Section<select id="visual-section" aria-label="Choose visualization section">${sections.map(s=>`<option value="${s.id}">${s.title}</option>`).join('')}</select></label><div class="visual-section-arrows"><button id="visual-previous" aria-label="Previous section">←</button><button id="visual-next" aria-label="Next section">→</button></div></nav><main class="workspace" data-panel="lab"><section class="manual-panel" aria-label="Original lecture PDF"><div class="pdf-toolbar"><button id="prev-page" aria-label="Previous lecture page">←</button><label>PDF page <input id="page-input" aria-label="PDF page" type="number" min="1" max="9" value="1"></label><span>/ 9</span><button id="next-page" aria-label="Next lecture page">→</button><button id="sync" aria-pressed="true">Sync on</button></div><div class="pdf-scroll"><p id="pdf-status" role="status">Opening your original lecture…</p></div></section><section class="companion" id="companion" tabindex="-1"><p class="section-context">Nuclear Models · Chapter 1: Basic Concepts in Nuclear Physics</p><div class="eyebrow" id="section-label"></div><h1 id="title"></h1><p class="credit">Lecturer: ${lesson.lecturer}</p><p class="description" id="description"></p><label class="mode">Learn<select id="learning-mode" aria-label="Choose learning mode"><option value="explore">Explore the diagram</option><option value="explain">Explain this diagram</option><option value="practice">Practice a calculation</option><option value="predict">Predict, then reveal</option><option value="guide">Teach me from zero</option><option value="review">Review my weak points</option><option value="notes">Read notes & my notes</option><option value="question">Chapter question</option></select></label><p id="review-count" class="review-count"></p><section id="activity" hidden></section><div id="model"><div class="controls" id="controls"></div><div class="stage" id="stage"><canvas id="scene" role="img" aria-label="Nuclear physics teaching diagram"></canvas><div class="scene-caption">Illustrative geometry and energy diagrams—not particle trajectories or measured data.</div></div><button id="diagram-size" class="diagram-zoom" aria-pressed="false">Enlarge diagram</button><div class="metrics" id="metrics"></div><p class="equation" id="formula"></p><div id="model-notes"></div></div><details class="sources-panel"><summary>Lecture, scientific clarifications & sources</summary><p class="note">All nine original PDF pages are unchanged, including the cover. Companion explanations identify corrections to source statements: mass defect is not mass excess; free-neutron mean life is not half-life; a muon is a lepton. Models use explicit approximations and do not determine the stability of arbitrary nuclides.</p><ul>${sources.map(([label,url])=>!url?`<li>${label} · in this reader</li>`:`<li><a href="${url}" target="_blank" rel="noopener">${label}</a></li>`).join('')}</ul><p class="note">The supplied lecture retains its ownership and is excluded from the website code’s MIT license. No live AI tutor, tracking or account is required.</p></details><p id="saved-status" class="note">Progress and notes stay in this browser; they are not a mastery score.</p><div class="bottom-links"><a href="../../../#subject=nuclear-models">← Nuclear Models</a><a href="../../../laboratories/nuclear/index.html">Nuclear Laboratory →</a></div></section></main><dialog id="sections-dialog" class="chapter-dialog"><button data-close="sections-dialog">Close</button><h2>Chapter sections</h2>${sections.map(s=>`<a href="#page=${s.page}&topic=${s.id}" data-topic="${s.id}">${s.title}</a>`).join('')}</dialog><dialog id="help-dialog" class="chapter-dialog"><button data-close="help-dialog">Close</button><h2>Read, change, explain.</h2><p>Read the supplied nine-page lecture alongside 14 companion sections. Subject, Chapter and Section menus provide direct navigation. On mobile, switch between Lecture and Interactive lab.</p><p>Drag the timeline to replay neutron survival or a Coulomb encounter. Binding and isomer playback reveals an explanation in steps. Enlarge a diagram for bigger labels.</p><p>Learn offers explanations, predictions, eleven calculation exercises, a guided path, notes and review of incorrect attempts. Browser storage keeps positions and answers locally; clearing browser data can remove them. Arrow keys turn pages when no form control is focused.</p></dialog>`;
installReaderNavigation($('.visual-navigation'));
let densityGuide = false;
const motion = new LecturePlayback($('#stage'), () => {
  if (current.id === 'fermi') densityGuide = true;
  redraw();
});
function placePlayback() {
  const anchor = current.id === 'binding' ? $('#controls') : $('#stage');
  anchor.after(motion.bar);
}
document.addEventListener('study-focus-ready',placePlayback,{once:true});
const captions = {
  overview: 'Filled dots represent protons and outlines represent neutrons. Their positions and sizes are schematic.',
  nuclides: 'Upper left is A. Lower left is Z. Filled and outline dots show counts only.',
  relations: 'Filled marker: first nuclide. Outline: second. Both positions use N horizontally and Z vertically.',
  isomers: 'The walkthrough reveals energy levels and their gap. Its steps have no physical time scale.',
  mass: 'Mass in u and kg is the same quantity. Multiplying by c² gives the rest energy.',
  binding: 'The gap illustrates energy accounting. Points show selected AME2020 nuclides on common A and B/A axes.',
  beta: 'Filled marker: expected survival. Ring: this replayable sample of 48 free neutrons. The parent counts below are a separate bookkeeping example.',
  scattering: 'Point-charge model. The laboratory frame includes center-of-mass drift when recoil is enabled. Detector flashes in the apparatus are illustrative.',
  recoil: 'Compare the center-of-mass and laboratory frames. The relative energy and separation are the same in both views.',
  radius: 'Projected outlines of two sharp spheres, drawn on the same scale.',
  charge: 'The nuclear charge stays fixed when the electron count changes.',
  fermi: 'The slice and graph share one profile. Shading spans 90% to 10% of ρ₀. Comparison curves are illustrative models.',
  particles: 'Bar length encodes rest energy on a linear scale. Particle size is outside this comparison.',
  surface: 'Shading marks the declining density region. Its fraction uses the volume of spherical shells.',
};
const equations = {
  overview: String.raw`A=Z+N,\quad Q_{\mathrm{nucleus}}=+Ze`,
  nuclides: String.raw`{}^{A}_{Z}\mathrm X,\quad A=Z+N`,
  isomers: String.raw`M_{\mathrm{excited}}-M_{\mathrm{ground}}=\frac{E^*}{c^2}`,
  mass: String.raw`1\,\mathrm u=\frac{m({}^{12}\mathrm C)}{12} \qquad (1\,\mathrm u)c^2\approx931.494\,\mathrm{MeV}`,
  binding: [String.raw`\Delta m=Zm_\mathrm{H}+Nm_\mathrm{n}-M_\mathrm{atom}`, String.raw`B\approx\Delta m\,c^2,\quad B/A`, String.raw`\Delta_{\mathrm{mass}}=(M_\mathrm{atom}-A\,\mathrm u)c^2`],
  beta: [String.raw`n\to p+e^-+\bar\nu_e`,String.raw`P_{\mathrm{survive}}(t)=e^{-t/\tau},\quad t_{1/2}=\tau\ln 2`],
  scattering: [String.raw`U(r)=\frac{kz_1z_2}{r},\quad K_\mathrm{rel}+U=E_\mathrm{cm}`,String.raw`d=\frac{kz_1z_2}{2E_\mathrm{cm}},\quad r_{\min}=d+\sqrt{d^2+b^2}`,String.raw`\theta=2\tan^{-1}(d/b),\quad \theta(b=0)=180^\circ`],
  recoil: [String.raw`E_\mathrm{cm}=\frac{M}{m+M}E_\mathrm{lab}`,String.raw`D=\frac{kz_1z_2}{E_\mathrm{cm}}`],
  radius: [String.raw`R=r_0 A^{1/3}`,String.raw`n=\frac{3}{4\pi r_0^3}`],
  charge: String.raw`Q_\mathrm{nucleus}=Ze,\quad Q_\mathrm{atom}=(Z-N_e)e`,
  fermi: [String.raw`\rho(r)=\frac{\rho_0}{1+e^{(r-R)/a}}`,String.raw`t_{90\text{–}10}=4a\ln 3`],
  surface: [String.raw`c=(1.1\,\mathrm{fm})A^{1/3}`,String.raw`f_\mathrm{surface}=1-\frac{(c-a/2)^3}{c^3+ca^2/4}`],
};
function equationMarkup(id) {
  if(id==='binding'&&state.view==='alpha'){
    return katex.renderToString(String.raw`\Delta m=2m_p+2m_n-M_\alpha,\quad B=\Delta mc^2`,{output:'mathml',displayMode:true});
  }
  if (!equations[id]) return esc(current.formula);
  return [equations[id]].flat().map(formula => katex.renderToString(formula,{output:'mathml',displayMode:true})).join('');
}

const explanations = {
  nuclides:['Read the starting composition','Identify the nucleon to add','Read the new composition'],
  relations:['Locate the first nuclide','Compare the second nuclide','Read the shared row, column or diagonal'],
  mass:['Start with the carbon-12 reference','Count atoms in one mole','Find the mass of one carbon-12 atom','Divide by twelve','Read one unified atomic mass unit'],
  conversion:['Start with the mass in atomic mass units','Convert the same mass to kilograms','Multiply by c², then express the energy in MeV'],
  radius:['Fix the density','Compare volumes and radii','Read the cube-root relationship'],
  surface:['Locate the uniform core','Mark the declining surface','Weight by shell volume and compare the counts'],
  event:['Before the beta event','At the transition','Check conservation across the products'],
  apparatus:['Collimate the alpha beam','Pass through the thin gold foil','Read flashes around the detector'],
};
function configurePlayback(){
  const id=current.id;
  const profile=id==='beta'&&state.view!=='main'?'event':id==='scattering'&&state.view==='apparatus'?'apparatus':
    id==='mass'&&state.view==='main'?'conversion':
    (id==='mass'&&state.view!=='standard') || (id==='binding'&&state.view==='excess') || (id==='nuclides'&&state.view==='main')?'static':id;
  motion.configure(profile);
  densityGuide=id==='fermi'&&motion.playing;
}
function updateControlVisibility(){
  const id=current.id, view=state.view;
  const visible={
    mass:{units:view==='particles',mass:view==='main',preset:view==='main'||view==='atomic'},
    binding:{isotope:view!=='alpha'},
    beta:{Z:view==='main',N:view==='main'},
    scattering:{energy:view!=='apparatus',impact:view!=='apparatus',z2:view!=='apparatus',recoil:view!=='apparatus'},
    charge:{electrons:view==='main',probe:view==='radial'},
    fermi:{rho:state.normalization==='free'},
  }[id];
  for(const [key,show] of Object.entries(visible||{})) $('#control-'+key).closest('label').hidden=!show;
  if(id==='mass'){
    for(const option of $('#control-preset').options) option.disabled=view==='atomic'&&!massSamples[option.value]?.A;
    if(view==='atomic'&&!massSamples[state.preset]?.A){
      state.preset='c12';
      state.mass=massSamples.c12.mass;
      $('#control-preset').value='c12';
      $('#control-mass').value=state.mass;
      $('#output-mass').textContent=fmt(state.mass);
    }
  }
}

function redraw(){
  const id = current.id, position = motion.position;
  if(id === 'beta' && state.view==='main') state.seconds = position;
  const collision = (id === 'scattering' && state.view!=='apparatus') || id === 'recoil';
  const extra = id==='nuclides'&&position>=2 ? {Z:state.Z+Number(state.view==='proton'),N:state.N+Number(state.view==='neutron')} : null;
  const model = id === 'fermi' && densityGuide ? fermiWalkthrough(state, position) : extra ? {...state,...extra} : state;
  const result = collision ? coulombState(state,position) : evaluate(id,model);
  draw($('#scene'),id,model,result,position);
  if(id === 'fermi') {
    const message = !densityGuide ? 'Explore with the sliders, or play the walkthrough.'
      : position < 2 ? 'Follow the probe from the center toward R.'
      : position < 4 ? 'At R, the density is half of ρ₀.'
      : position < 6 ? 'Follow the probe to the 10% edge of the surface band.'
      : model.diffuseness > state.diffuseness || state.diffuseness < 1
        ? 'Increasing a widens the band. R stays fixed.' : 'The band is at the widest setting. R stays fixed.';
    motion.update(message);
    for (const key of ['probe','diffuseness']) {
      $('#control-'+key).value = model[key];
      const output = $('#output-'+key);
      const value = Number(model[key].toFixed(2)).toString();
      if(output.textContent !== value) output.textContent = value;
    }
  }
  const step = Math.floor(position + .00001);
  const stages = explanations[id==='beta'?'event':id==='scattering'?'apparatus':id==='mass'&&state.view==='main'?'conversion':id];
  if(stages && ((id==='beta'&&state.view!=='main') || (id==='scattering'&&state.view==='apparatus') ||
    ['relations','radius','surface'].includes(id) || (id==='mass'&&['main','standard'].includes(state.view)) || (id==='nuclides'&&state.view!=='main'))) {
    motion.update(`Step ${step+1} of ${stages.length} · ${stages[step]}`);
  }
  if((id === 'binding' && state.view!=='excess') || id === 'isomers') {
    const steps = id === 'binding' ? bindingSteps : isomerSteps;
    motion.update(`Step ${step+1} of 3 · ${steps[step]}`);
  }
  if(id === 'beta' && state.view==='main') motion.update(`${Math.round(result.seconds)} s · ${result.remaining} of ${COHORT_SIZE} remain`);
  if(collision) {
    const phase = Math.abs(position-.5)<1e-9 ? 'Turning point' : position < .5 ? 'Approaching' : 'Separating';
    motion.update(`${phase} · t = ${fmt(result.time)} fm/c (zero at closest approach)`);
  }
  const values = entries(result);
  const container = $('#metrics');
  const metricSet=[id,state.view,...values.map(([,label])=>label)].join('|');
  if(container.dataset.topic !== metricSet) {
    container.dataset.topic = metricSet;
    container.innerHTML = values.map(([,label])=>`<div class="metric"><strong></strong><span>${label}</span></div>`).join('');
  }
  container.querySelectorAll('strong').forEach((element,index) => {
    const value = fmt(values[index][0]);
    if(element.textContent !== value) element.textContent = value;
  });
}
const unresolved=()=>Object.entries(memory.records).filter(([,r])=>r&&r.correct===false);
function save(){const ok=storage.set(lesson.learningKey,JSON.stringify(memory));$('#saved-status').textContent=ok?'Notes and answer history saved in this browser only.':'Browser storage unavailable; progress lasts only for this session.';$('#review-count').textContent=unresolved().length?`${unresolved().length} item(s) to revisit`:'';}
function record(id,correct){memory.records[id]={correct,attempts:(Number(memory.records[id]?.attempts)||0)+1};save();}
installLectureReview(sections, topic => memory.records['quiz:'+topic.id]?.correct,
  (topic, correct) => record('quiz:'+topic.id, correct));
function entries(r){switch(current.mode){
case 'overview':case 'nuclides':return [[`${r.name} (${r.symbol})`,'Element'],[r.Z,'Protons Z'],[r.N,'Neutrons N'],[r.A,'Mass number A'],[r.charge,'Nuclear charge (C)']];
case 'relations':{const names=Object.entries(r.relations).filter(([,v])=>v).map(([k])=>({same:'Same nuclide',isotope:'Isotopes',isotone:'Isotones',isobar:'Isobars'}[k]));return [[r.A,'First A'],[r.other.A,'Second A'],[names.join(', ')||'None of these','Relationship']];}
case 'isomers':return [[state.excitation,'Excitation (keV)'],[r.massIncrement,'Mass increment (u)'],...(state.preset==='tc'?[[TC_ISOMER.halfLifeHours,'Tc-99m half-life (h)'],[TC_ISOMER.groundHalfLifeYears,'Tc-99 half-life (years)']]:[])];
case 'mass': {
  const sample=massSamples[state.preset];
  if(state.view==='standard'||state.view==='particles')return [];
  if(state.view==='atomic'){
    const atom=sample?.A?sample:massSamples.c12;
    return [[`${atom.Z}, ${atom.A-atom.Z}, ${atom.A}`,'Z, N, A'],[atom.mass.toFixed(9),'Neutral-atom mass (u)'],[atom.mass-atom.A,'Atomic mass minus A u (u)']];
  }
  return [[sample?.A?sample.mass.toFixed(9):state.mass,'Mass (u)'],[r.kg,'Mass (kg)'],[r.MeV,'Rest energy (MeV)'],[r.joule,'Rest energy (J)'],
    ...(sample?.A?[[sample.A,'Mass number A'],[sample.mass-sample.A,'Atomic mass minus A u (u)']]:[])];
}
case 'binding':return [[`${r.Z}, ${r.N}, ${r.A}`,'Z, N, A'],[r.separated.toFixed(6),'Separated mass (u)'],[r.mass.toFixed(6),state.view==='alpha'?'Bare nucleus mass (u)':'Neutral-atom mass (u)'],[r.defect,'Binding defect (u)'],[r.energy,'Binding energy (MeV)'],[r.perNucleon,'B/A (MeV per nucleon)'],...(r.excess===undefined?[]:[[r.excess,'Atomic mass excess (MeV)']])];
case 'beta':return state.view==='thorium'?[[234,'A unchanged'],[91,'Daughter Z'],[143,'Daughter N']]:state.view==='event'?[[r.Q,'Total kinetic energy available ≈ (MeV)'],[0,'Net product charge (e)'],[0,'Net electron lepton number']]:[[`${r.daughterZ}, ${r.daughterN}`,'Daughter Z, N (bookkeeping)'],[r.A,'A unchanged'],[`${(r.survival*100).toFixed(1)}%`,'Expected free-neutron survival'],[`${r.remaining} / ${COHORT_SIZE}`,'Sample remaining'],[r.halfLife/60,'Reference half-life (min)'],[r.Q,'Free decay Q (MeV)']];
case 'scattering':case 'recoil':return state.view==='apparatus'?[]:[[r.separation,'Relative separation (fm)'],[r.distance,'Closest separation D (fm)'],[r.angle,'Asymptotic relative deflection (°)'],[r.kinetic,'Relative kinetic energy (MeV)'],[r.potential,'Electric potential energy (MeV)'],[r.ecm,'Total relative energy (MeV)']];
case 'radius':return [[r.radius,'Sharp-sphere R (fm)'],[r.volume,'Volume (fm³)'],[r.number,'Number density (fm⁻³)'],[r.perCM3,'Number density (cm⁻³)'],[r.kgM3,'Approximate mass density (kg/m³)']];
case 'charge':return [[r.charge,'Nuclear charge (C)'],[r.atomNet,'Atom/ion net charge (C)']];
case 'fermi':return [[r.R,'Half-density radius R (fm)'],[r.skin,'90–10% surface thickness (fm)'],[r.probe,'Probe position (fm)'],[r.density,'Probe density (fm⁻³)'],[r.rho,'Profile parameter ρ₀ (fm⁻³)'],[r.total,'Integrated nucleon count'],...(state.view==='shell'?[[r.shell,'Nucleons per fm at probe']]:[])];
case 'particles':return [[r.electronEnergy,'Electron · lepton (MeV)'],[r.muonMass,'Muon · lepton (MeV)'],[r.pionMass,'Charged pion · meson (MeV)'],[r.protonMass,'Proton · baryon (MeV)']];
case 'surface':return [[r.c,'Half-density radius c (fm)'],[r.lo,'Core edge (fm)'],[r.hi,'Outer edge (fm)'],[r.fraction*100,'Nucleons in linear surface (%)'],[`${fmt(r.total)} vs ${state.A}`,'Integrated count vs selected A']];
}}
function controlMarkup(c) {
  const entry = c.options
    ? `<select id="control-${c.key}" data-key="${c.key}">${c.options.map(([value,label])=>`<option value="${value}" ${value===state[c.key]?'selected':''}>${esc(label)}</option>`).join('')}</select>`
    : `<output id="output-${c.key}" for="control-${c.key}">${fmt(state[c.key])}</output><input id="control-${c.key}" data-key="${c.key}" type="${c.type||'range'}" min="${c.min}" max="${c.max}" step="${c.step}" value="${state[c.key]}">`;
  return `<label><span id="control-label-${c.key}">${esc(c.label)}</span>${entry}</label>`;
}
function selectSection(id){
  states.set(current.id,{...state});
  current=sections.find(s=>s.id===id)||sections[0];
  state=states.get(id)||{...defaults,...(id==='recoil'?{energy:4.2,recoil:1}:{}),...(id==='surface'?{A:27}:{}),...(id==='fermi'?{A:125}: {})};
  $('#visual-section').value=current.id;
  $('#section-label').textContent=current.title;
  $('#title').textContent=current.title.replace(/^\d+\. /,'');
  $('#description').textContent=current.description;
  $('#formula').innerHTML=equationMarkup(current.id);
  $('#visual-previous').disabled=current===sections[0];
  $('#visual-next').disabled=current===sections.at(-1);
  $('#controls').innerHTML=current.controls.map(controlMarkup).join('');
  $('#controls').hidden=!current.controls.length;
  $('#controls').querySelectorAll('[data-key]').forEach(control=>control.setAttribute('aria-labelledby',`control-label-${control.dataset.key}`));
  $('#model-notes').innerHTML=current.ideas.map(([a,b])=>`<div class="idea-block"><h3>${a}</h3><p>${b}</p></div>`).join('');
  const caption=$('.scene-caption');
  caption.id='scene-caption';
  caption.textContent=captions[current.id];
  $('#scene').setAttribute('aria-label',`${$('#title').textContent} diagram`);
  $('#scene').setAttribute('aria-describedby','scene-caption');
  configurePlayback();
  updateControlVisibility();
  placePlayback();
  redraw();
  $('.companion').scrollTop=0;
  renderMode();
}
function updateHash(){history.replaceState(null,'',`#page=${page}&topic=${current.id}`);}
function go(id){mode='explore';guideActive=false;$('#learning-mode').value=mode;const next=sections.find(s=>s.id===id);if(!next)return;selectSection(id);setPage(next.page,false);}
function setPage(n,follow=sync,jump=true){page=Math.min(9,Math.max(1,Math.floor(Number(n)||1)));$('#page-input').value=page;$('#prev-page').disabled=page===1;$('#next-page').disabled=page===9;storage.set(lesson.pageKey,String(page));storage.set('study-library-last-lesson',lesson.id);if(follow&&pageSections[page-1]!==current.id)selectSection(pageSections[page-1]);updateHash();if(jump)reading.go(page);}
function renderQuestion(predict=false){const q=current.quiz;$('#activity').innerHTML=`<h2>${predict?'Predict before looking':'Chapter question'}</h2><p>${q.question}</p><div class="question-options">${q.options.map((o,i)=>`<button data-answer="${i}">${esc(o)}</button>`).join('')}</div><p class="feedback" id="feedback" hidden></p>${predict?'<button id="reveal-model" hidden>Reveal the diagram</button>':''}`;}
function practice(selected){const exercise=challenges.find(c=>c.id===selected)||challenges.find(c=>c.section===current.id)||challenges[0];$('#activity').innerHTML=`<h2>Practice a calculation</h2><label>Exercise<select class="practice-select" id="exercise-select">${challenges.map(c=>`<option value="${c.id}" ${c===exercise?'selected':''}>${c.id}: ${c.question}</option>`).join('')}</select></label><p>${exercise.question}</p><label>Your answer (${exercise.unit}) <input id="numeric" class="practice-input" type="number" step="any"></label><div class="data-actions"><button id="check">Check answer</button><button id="worked">Show worked solution</button><button id="explore-exercise">Explore related diagram →</button></div><p class="feedback" id="calculation-feedback" hidden></p>`;$('#exercise-select').onchange=e=>practice(e.target.value);$('#check').onclick=()=>{const raw=$('#numeric').value;if(raw===''){feedback('Enter a number first.');return;}const value=Number(raw),correct=Number.isFinite(value)&&Math.abs(value-exercise.answer)<=Math.max(Math.abs(exercise.answer)*.02,1e-10);record('exercise:'+exercise.id,correct);feedback((correct?'Correct within 2% rounding tolerance. ':'Not yet. Check the units and stated assumptions. ')+(correct?exercise.working:''));};$('#worked').onclick=()=>feedback(`${exercise.working} Result: ${fmt(exercise.answer)} ${exercise.unit}.`);$('#explore-exercise').onclick=()=>go(exercise.section);}
function feedback(text){$('#calculation-feedback').hidden=false;$('#calculation-feedback').textContent=text;}
function renderMode(){mode=$('#learning-mode').value;const show=['explore','explain','guide'].includes(mode);$('#model').hidden=!show;$('#activity').hidden=mode==='explore'||mode==='explain';$('#activity').innerHTML='';
 if(mode==='explain'){$('#activity').hidden=false;$('#activity').innerHTML='<h2>Read the diagram</h2><p class="note">The controls set the quantities shown in the diagram. Read the equation and labeled values, then the explanation below. Each model states where its approximation stops.</p>';}
 if(mode==='predict'||mode==='question')renderQuestion(mode==='predict');
 if(mode==='practice')practice();
 if(mode==='notes'){$('#activity').innerHTML=`<h2>Lecture notes & scientific clarifications</h2><p class="equation">${equationMarkup(current.id)}</p>${current.ideas.map(([a,b])=>`<div class="idea-block"><h3>${a}</h3><p>${b}</p></div>`).join('')}<div class="notes-box"><h2>My notes</h2><textarea aria-label="My section notes" placeholder="Write your explanation, units, questions or exam reminders…"></textarea></div>`;$('#activity textarea').value=typeof memory.notes[current.id]==='string'?memory.notes[current.id]:'';$('#activity textarea').oninput=e=>{memory.notes[current.id]=e.target.value;save();};}
 if(mode==='guide'){$('#activity').hidden=false;$('#activity').innerHTML=`<h2>From notation to worked problems</h2><p id="guide-status">Step ${memory.guide+1} of ${guide.length}: ${sections.find(s=>s.id===guide[memory.guide]).title}</p><div class="guide-actions"><button id="guide-prev" ${memory.guide===0?'disabled':''}>← Previous</button><button id="guide-open">Explore this step</button><button id="guide-next" ${memory.guide===guide.length-1?'disabled':''}>Next →</button></div><p class="note">An introductory route, not a mastery certificate. Sections remain freely available.</p>`;$('#guide-prev').onclick=()=>advanceGuide(-1);$('#guide-next').onclick=()=>advanceGuide(1);$('#guide-open').onclick=()=>{guideActive=true;selectSection(guide[memory.guide]);setPage(current.page,false);};}
 if(mode==='review'){const weak=unresolved();$('#activity').innerHTML=`<h2>Review my weak points</h2><p class="note">Incorrect answers saved in this browser—not a measure of mastery. A correct retry resolves an item.</p><div class="review-list">${weak.length?weak.map(([id])=>{const item=id.startsWith('exercise:')?challenges.find(c=>c.id===id.slice(9)):sections.find(s=>s.id===id.slice(5));return item?`<button data-review="${id}">${esc(item.question||item.title)}</button>`:'';}).join(''):'No unresolved incorrect answers recorded.'}</div>`;}
 $('#review-count').textContent=unresolved().length?`${unresolved().length} item(s) to revisit`:'';
}
function advanceGuide(delta){memory.guide=Math.max(0,Math.min(guide.length-1,memory.guide+delta));save();guideActive=true;selectSection(guide[memory.guide]);setPage(current.page,false);}
$('#activity').onclick=e=>{const answer=e.target.closest('[data-answer]');if(answer){const correct=+answer.dataset.answer===current.quiz.answer;record('quiz:'+current.id,correct);$('#feedback').hidden=false;$('#feedback').textContent=(correct?'Correct. ':'Not quite. ')+current.quiz.explanation;if($('#reveal-model'))$('#reveal-model').hidden=false;}if(e.target.id==='reveal-model')$('#model').hidden=false;const review=e.target.closest('[data-review]');if(review){const id=review.dataset.review;if(id.startsWith('exercise:')){mode='practice';$('#learning-mode').value=mode;renderMode();practice(id.slice(9));}else{const sectionId=id.slice(5);go(sectionId);$('#learning-mode').value='question';renderMode();}}};
$('#learning-mode').onchange=()=>{guideActive=false;renderMode();};
$('#controls').oninput=e=>{
  const key=e.target.dataset.key;
  if(!key)return;
  const output=$('#output-'+key);
  if(e.target.type==='number' && (!e.target.validity.valid || e.target.value===''))return;
  if(current.id === 'fermi' && densityGuide) {
    state = {...state, diffuseness:Number($('#control-diffuseness').value), probe:Number($('#control-probe').value)};
    densityGuide = false;
    motion.pause();
    motion.position = 0;
  }
  state[key]=output?+e.target.value:e.target.value;
  if(output)output.textContent=fmt(state[key]);
  const preset=current.controls.find(control=>control.examples);
  if(key==='preset' && preset.examples[state.preset]) {
    if(current.id==='radius')delete state.referenceA;
    for(const [field,value] of Object.entries(preset.examples[state.preset][1])) {
      state[field]=value;
      const input=$('#control-'+field);
      if(input){
        input.value=value;
        $('#output-'+field).textContent=fmt(value);
      }
    }
  } else if(output && preset && Object.values(preset.examples).some(([,fields])=>key in fields)) {
    state.preset='custom';
    $('#control-preset').value='custom';
  }
  if(key==='preset' && state.preset==='custom' && current.id==='radius')delete state.referenceA;
  if(key==='view'){
    configurePlayback();
    $('#formula').innerHTML=equationMarkup(current.id);
  }
  if(key==='view'||key==='normalization')updateControlVisibility();
  redraw();
};
$('#visual-section').onchange=e=>go(e.target.value);$('#visual-previous').onclick=()=>go(sections[sections.indexOf(current)-1]?.id);$('#visual-next').onclick=()=>go(sections[sections.indexOf(current)+1]?.id);
$('#prev-page').onclick=()=>setPage(page-1);$('#next-page').onclick=()=>setPage(page+1);$('#page-input').onchange=e=>setPage(e.target.value);$('#sync').onclick=()=>{sync=!sync;$('#sync').textContent=sync?'Sync on':'Sync off';$('#sync').setAttribute('aria-pressed',String(sync));if(sync)setPage(page);};
$('#diagram-size').onclick=()=>{const large=$('#stage').classList.toggle('enlarged');$('#diagram-size').textContent=large?'Fit diagram to panel':'Enlarge diagram';$('#diagram-size').setAttribute('aria-pressed',String(large));};
document.querySelectorAll('.mobile-tabs button').forEach(b=>b.onclick=()=>{$('.workspace').dataset.panel=b.dataset.panel;document.querySelectorAll('.mobile-tabs button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
window.addEventListener('vibe-theme-change',()=>redraw());
$('#sections-button').onclick=()=>$('#sections-dialog').showModal();$('#help').onclick=()=>$('#help-dialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());$('#sections-dialog').onclick=e=>{const link=e.target.closest('[data-topic]');if(link){e.preventDefault();go(link.dataset.topic);$('#sections-dialog').close();}};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName)||document.querySelector('dialog[open]'))return;if(e.key==='ArrowRight'){e.preventDefault();setPage(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();setPage(page-1);}});
function readRoute(){const p=new URLSearchParams(location.hash.slice(1)),n=Math.max(1,Math.min(9,Number(p.get('page'))||Number(storage.get(lesson.pageKey))||1)),section=sections.find(s=>s.id===p.get('topic'))||sections.find(s=>s.id===pageSections[Math.floor(n)-1]);page=Math.floor(n);selectSection(section.id);setPage(page,false);}
const reading = createScrollReader(lesson.pages, n=>setPage(n,sync,false));
readRoute();window.addEventListener('hashchange',readRoute);let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{redraw();},120);});
