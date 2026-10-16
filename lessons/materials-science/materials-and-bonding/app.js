import {lesson,sections,pageSections,guide,challenges,sources} from './content.js';
import {bondVectors,bondAngle,pairEnergy,pairForce,cubeSurfaceRatio,compositeBounds,atoms} from './math.js';
import {MaterialsDiagram} from './visuals.js?v=study-motion-1';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}};
let progress={records:{},guide:0},memoryAvailable=true;
try{const saved=JSON.parse(store.get(lesson.learningKey));if(saved&&typeof saved.records==='object'&&saved.records!==null&&!Array.isArray(saved.records)){progress.records=saved.records;progress.guide=Number.isInteger(saved.guide)?Math.max(0,Math.min(guide.length-1,saved.guide)):0;progress.guideComplete=saved.guideComplete===true;}}catch{}
const defaults={sample:'transparent',family:'Metals',links:0,fraction:.5,Ef:70,Em:3,property:'Stiffness',doping:'Intrinsic',application:'Implant',smartType:'Piezoelectric',stimulus:0,divisions:5,element:'C',distance:1,depth:1,transfer:0,hybrid:'sp3',orbitalStage:'Geometry',field:0,dipoleType:'London',orientation:'Aligned',separation:1,polarization:.2};
const patches={ceramics:{family:'Ceramics'},metals:{family:'Metals'},sp2:{hybrid:'sp2'},sp3:{hybrid:'sp3'},alumina:{sample:'translucent'}};
let current=sections[0],currentPage=1,s={...defaults},mode='explore',answered=null,revealed=false,guideActive=false,challengeIndex=0,numericValue='',numericFeedback=null,reviewId=null,inspection=null,sync=true,pdf=null,zoom=1,rendering=false,epoch=0;
const states=new Map(),queue=new Set();
const diagram=new MaterialsDiagram($('#scene'),(title,text)=>{inspection={title,text};mode='explain';$('#learning-mode').value=mode;renderLearning();});
$('#animate').hidden=true;
diagram.onFrame=()=>{if(current.mode==='ionic'&&diagram.transferPhase){const p=diagram.transferPhase,values=$('#metrics').querySelectorAll('strong');if(values[0])values[0].textContent=p.na+' + '+p.cl+(p.free?' + 1 in transit':'');if(values[2])values[2].textContent=p.stage==='neutral'?'Neutral':p.stage==='transfer'?'Transferring':'Na⁺ · Cl⁻';}};
diagram.onBond=()=>renderMetrics();
const fmt=(n,d=3)=>Number(n.toFixed(d)).toString();
const save=()=>{memoryAvailable=store.set(lesson.learningKey,JSON.stringify(progress));renderCount();};
const unresolved=()=>Object.entries(progress.records).filter(([,r])=>r&&r.correct===false);
function record(id,correct){progress.records[id]={correct,attempts:(Number(progress.records[id]?.attempts)||0)+1};save();}
function renderCount(){$('#review-count').textContent=unresolved().length?`${unresolved().length} to revisit`:'';}
function chapterDrawer(open){$('#chapter-sidebar').inert=!open;$('#workspace').inert=open;$('#chapter-shade').hidden=!open;document.body.classList.toggle('chapters-open',open);$('#chapters-toggle').setAttribute('aria-expanded',String(open));if(open)$('#section-search').focus();else $('#chapters-toggle').focus();}
$('#chapters-toggle').onclick=()=>chapterDrawer($('#chapter-sidebar').inert);$('#chapter-shade').onclick=()=>chapterDrawer(false);
$('#section-search').oninput=renderToc;
function renderToc(){const query=$('#section-search').value.toLowerCase();$('#toc').innerHTML=sections.filter(t=>(t.title+' '+t.description).toLowerCase().includes(query)).map(t=>`<a href="#page=${t.page}&topic=${t.id}" data-topic="${t.id}" class="${current.id===t.id?'active':''}" ${current.id===t.id?'aria-current="location"':''}>${esc(t.title)}</a>`).join('')||'<p>No matching sections.</p>';}
$('#toc').onclick=e=>{const a=e.target.closest('[data-topic]');if(a){e.preventDefault();goSection(a.dataset.topic);chapterDrawer(false);}};
$('#visual-section').innerHTML=sections.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('');
$('#visual-section').onchange=e=>goSection(e.target.value);
$('#visual-previous').onclick=()=>goSection(sections[sections.indexOf(current)-1]?.id);
$('#visual-next').onclick=()=>goSection(sections[sections.indexOf(current)+1]?.id);
$('#next-topic').onclick=()=>goSection(sections[(sections.indexOf(current)+1)%sections.length].id);
function selectSection(section,keepMode=false){
 if(section.id!==current.id){states.set(current.id,{...s});current=section;s=states.get(section.id)||{...defaults,...patches[section.id]};if(!keepMode){mode='explore';guideActive=false;answered=null;revealed=false;inspection=null;$('#learning-mode').value=mode;}}
 $('#visual-section').value=current.id;$('#visual-previous').disabled=current===sections[0];$('#visual-next').disabled=current===sections.at(-1);
 $('#section-label').textContent=current.title.toUpperCase();$('#lab-title').textContent=current.heading;$('#lab-description').textContent=current.description;
 $('#scene-label').textContent=({hybrid:s.hybrid.toUpperCase()+' · BOND DIRECTIONS',energy:'PAIR ENERGY · NORMALIZED MODEL',nano:'SIZE & EXPOSED SURFACE'}[current.mode]||current.mode.toUpperCase()+' · TEACHING SCHEMATIC');
 $('#scene-hint').textContent=current.mode==='hybrid'?'Drag to rotate · Scroll to zoom · Choose two bond numbers':current.mode==='energy'?'Change r/r₀ · Click the energy minimum':'Change a control · Click a labeled part to explain it';
 $('#scene').setAttribute('aria-label',current.title+' interactive diagram');
 renderToc();renderControls();renderMetrics();renderNotes();renderLearning();$('#page-context').textContent='COMPANION TO PAGE '+currentPage;$('.lab-scroll').scrollTop=0;
}
function goSection(id,keepMode=false){const section=sections.find(t=>t.id===id);if(!section)return;goPage(section.page,section,keepMode);}
function updatePage(page,section=null,keepMode=false){currentPage=Math.max(1,Math.min(lesson.pages,Math.round(page)||1));$('#page-input').value=currentPage;$('#prev-page').disabled=currentPage===1;$('#next-page').disabled=currentPage===lesson.pages;
 if(section)selectSection(section,keepMode);else if(sync){const t=currentPage>=current.page&&currentPage<=current.end?current:sections.find(x=>x.id===pageSections[currentPage-1]);selectSection(t);}
 $('#page-context').textContent=(sync?'COMPANION TO PAGE ':'LAB PINNED · READING PAGE ')+currentPage;
 history.replaceState(null,'',`#page=${currentPage}&topic=${current.id}`);store.set(lesson.pageKey,String(currentPage));store.set('study-library-last-lesson',lesson.id);
}
function goPage(page,section=null,keepMode=false){const n=Math.max(1,Math.min(lesson.pages,Math.round(page)||1)),el=$('#page-'+n);if(el)$('#pdf-scroll').scrollTop=el.offsetTop-$('#pdf-pages').offsetTop;updatePage(n,section,keepMode);queueVisible();}
$('#page-input').onchange=e=>goPage(+e.target.value);$('#page-input').onkeydown=e=>{if(e.key==='Enter')goPage(+e.target.value);};
$('#prev-page').onclick=()=>goPage(currentPage-1);$('#next-page').onclick=()=>goPage(currentPage+1);
$('#sync').onclick=()=>{sync=!sync;$('#sync').setAttribute('aria-pressed',String(sync));$('#sync').textContent=sync?'Sync on':'Sync off';$('#sync-label').textContent=sync?'Diagrams follow your page':'Keep this diagram while reading';if(sync)updatePage(currentPage,sections.find(x=>x.id===pageSections[currentPage-1]));};
const select=(key,label,options)=>`<label>${label}<select data-key="${key}">${options.map(v=>`<option ${s[key]===v?'selected':''}>${v}</option>`).join('')}</select></label>`;
const slider=(key,label,min,max,step=1,unit='')=>`<label>${label}<input data-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${s[key]}" aria-label="${label}"><output data-output="${key}">${fmt(+s[key])}${unit}</output></label>`;
function renderControls(){let html='';const m=current.mode;
 if(m==='optics')html=select('sample','Specimen',['transparent','translucent','opaque']);
 if(m==='classes')html=select('family','Material class',['Metals','Ceramics','Polymers','Composites']);
 if(m==='chains')html=slider('links','Cross-links per gap',0,8);
 if(m==='composite')html=slider('fraction','Fiber volume fraction',0,1,.05)+`<label>Ef (GPa)<input data-key="Ef" type="number" min="1" max="500" step="1" value="${s.Ef}"></label><label>Em (GPa)<input data-key="Em" type="number" min=".1" max="100" step=".1" value="${s.Em}"></label><span class="control-note">Optional ideal-mixture extension · editable illustrative moduli</span>`;
 if(m==='comparison')html=select('property','Compare',['Density','Stiffness','Strength','Conductivity']);
 if(m==='semiconductor')html=select('doping','Si example',['Intrinsic','Donor','Acceptor']);
 if(m==='application')html=select('application','Application',['Implant','Dental','Delivery']);
 if(m==='smart')html=select('smartType','Mechanism',['Piezoelectric','Shape memory','Magnetostrictive'])+slider('stimulus','Relative stimulus',0,1,.05);
 if(m==='nano')html=slider('divisions','Pieces per edge',1,100)+`<span class="control-note">Start: a 100 nm cube. Total solid volume stays fixed.</span>`;
 if(m==='atom')html=select('element','Atom',Object.keys(atoms));
 if(m==='energy')html=slider('distance','Separation r/r₀',.8,2.4,.01)+slider('depth','Well depth D',.3,2,.1)+`<button class="small-button" id="equilibrium">Set equilibrium</button>`;
 if(m==='ionic')html=select('transfer','Transfer stage',['0','1'])+'<span class="control-note">0: play transfer from neutral atoms · 1: hold final Na⁺ and Cl⁻</span>';
 if(m==='hybrid')html=select('orbitalStage','View',['Geometry','Atomic orbitals','Promoted model','Hybrid orbitals'])+`<span class="control-note">${s.hybrid==='sp3'?'Four tetrahedral sp³ directions':'Three planar sp² directions + perpendicular p orbital'}</span><div role="group" aria-label="Select bond directions">${bondVectors(s.hybrid).map((_,i)=>`<button class="small-button" data-bond="${i}" aria-pressed="${diagram.selected.includes(i)}">Bond ${i+1}</button>`).join('')}</div>`;
 if(m==='metal')html=select('field','Electric field',['0','1'])+'<span class="control-note">0: off · 1: points right. Play traces schematic electron motion; the rightward field adds leftward drift.</span>';
 if(m==='dipoles')html=select('dipoleType','Interaction',['London','Induction','Permanent'])+(s.dipoleType==='Permanent'?select('orientation','Fixed dipole alignment',['Aligned','Opposed']):'')+'<span class="control-note">Qualitative charge-separation sketch; not a measured force or energy scale.</span>';
 if(['hydrogen','molecules'].includes(m))html=slider('separation','Molecular separation',0,2,.1);
 if(m==='mixed')html=slider('polarization','Relative polarization',0,1,.05);
 $('#controls').innerHTML=html;
}
$('#controls').oninput=e=>{const key=e.target.dataset.key;if(!key||e.target.tagName==='SELECT')return;if(!e.target.checkValidity()||e.target.value==='')return;s[key]=+e.target.value;const out=$(`[data-output="${key}"]`);if(out)out.textContent=fmt(s[key]);renderMetrics();};
$('#controls').onchange=e=>{const key=e.target.dataset.key;if(!key)return;if(e.target.tagName==='SELECT'){s[key]=e.target.value;renderControls();renderMetrics();}};
$('#controls').onclick=e=>{if(e.target.id==='equilibrium'){s.distance=1;renderControls();renderMetrics();}const button=e.target.closest('[data-bond]');if(button){const i=+button.dataset.bond;diagram.selected=[diagram.selected[1],i];if(diagram.selected[0]===i)diagram.selected=[(i+1)%bondVectors(s.hybrid).length,i];renderControls();renderMetrics();}};
function metric(v,label){return `<div class="metric"><strong>${esc(v)}</strong><small>${esc(label)}</small></div>`;}
function renderMetrics(){
 const m=current.mode;let values=[],insight=current.formula;
 if(m==='pipeline')values=[['4','connected stages'],['Same','composition can differ in structure'],['Many','property types']];
 if(m==='optics')values=[['Al₂O₃','same composition'],[s.sample,'optical behavior'],['Scattering','qualitative paths']];
 if(m==='classes')values=[[s.family,'selected class'],['Trends','not universal rules'],['Structure','changes properties']];
 if(m==='chains')values=[[s.links,'cross-links per drawn gap'],['Covalent','within chains'],['Restricted','motion with cross-linking']];
 if(m==='composite'){const b=compositeBounds(+s.fraction,+s.Ef,+s.Em);values=[[fmt(b.equalStrain,2)+' GPa','ideal equal-strain modulus'],[fmt(b.equalStress,2)+' GPa','ideal equal-stress comparison'],[Math.round(s.fraction*100)+'%','fiber volume fraction']];insight='The rule of mixtures assumes aligned continuous fibers, linear elasticity and ideal load transfer. The equal-stress model is a comparison, not an exact transverse modulus.';}
 if(m==='comparison')values=[[s.property,'selected property'],[s.property==='Density'?'g/cm³':s.property==='Conductivity'?'S/m':s.property==='Strength'?'MPa':'GPa','typical chart unit'],['pp. 4–5','original data ranges']];
 if(m==='semiconductor')values=[[s.doping,'Si sketch'],[s.doping==='Donor'?'Electrons':s.doping==='Acceptor'?'Holes':'Both','carrier picture'],['Qualitative','no current prediction']];
 if(m==='application')values=[[s.application,'biomedical use'],['Multiple','requirements'],['All classes','may supply biomaterials']];
 if(m==='smart')values=[[s.smartType,'mechanism'],[fmt(+s.stimulus),'relative stimulus'],['Exaggerated','schematic deformation']];
 if(m==='nano'){const L=100/+s.divisions;values=[[fmt(L,2)+' nm','small cube side L'],[fmt(cubeSurfaceRatio(L),3)+' nm⁻¹','surface / volume'],[s.divisions+'×','total surface relative to start']];insight='Total volume stays 10⁶ nm³. If separated, '+s.divisions**3+' cubes expose '+fmt(6*10000*s.divisions,0)+' nm² in total. Touching or agglomerated faces are not all exposed.';}
 if(m==='atom'){const a=atoms[s.element];values=[[a.z,'protons / neutral electrons'],[a.shells.join(' · '),'shell populations'],[a.shells.at(-1),'outer-shell electrons']];}
 if(m==='energy'){const r=+s.distance,D=+s.depth;values=[[fmt(pairEnergy(r,D)),'potential U · model units'],[fmt(pairForce(r,D)),'radial force · D/r₀ scale'],[fmt(72*D),'curvature at r₀ · r₀ = 1']];insight=(Math.abs(r-1)<.0001?'At equilibrium: force is zero. ':r<1?'Repulsive radial force pushes the pair apart. ':'Attractive radial force pulls the pair together. ')+`Separation energy is +D = ${fmt(D)} with U(∞) = 0. This added 12–6 model is not a universal interatomic potential.`;}
 if(m==='ionic')values=[[+s.transfer?'10 + 18':'11 + 17','electrons on Na / Cl'],['28','total electrons conserved'],[+s.transfer?'Na⁺ · Cl⁻':'Neutral','charge state']];
 if(m==='covalent')values=[['2','shared electrons in H₂'],['Directional','bonding'],['Shared','electron density']];
 if(m==='hybrid'){if(diagram.selected.some(i=>i>=bondVectors(s.hybrid).length))diagram.selected=[0,1];const vectors=bondVectors(s.hybrid),theta=bondAngle(vectors[diagram.selected[0]],vectors[diagram.selected[1]]);values=[[s.hybrid,'hybridization'],[vectors.length,'hybrid directions'],[fmt(theta,2)+'°','true angle of selected pair']];insight=s.hybrid==='sp3'?'Four equivalent tetrahedral directions. θ = arccos(−1/3) = 109.47°. The camera does not change the physical angle.':'Three coplanar directions at 120°. One p orbital remains perpendicular to the plane and contributes to π bonding in graphitic carbon.';}
 if(m==='metal')values=[['Delocalized','valence electrons'],[+s.field?'←':'Off','electron drift / field off'],['Ion cores','positive background']];
 if(m==='dipoles')values=[[s.dipoleType,'interaction model'],[s.dipoleType==='Permanent'?s.orientation:'Correlated','dipole relation'],['Qualitative','no universal energy ranking']];
 if(m==='hydrogen')values=[['F—H','covalent within molecule'],['H···F','hydrogen bond between'],['Directional','interaction geometry']];
 if(m==='mixed')values=[['Mixed','bonding character'],[fmt(+s.polarization),'relative polarization'],['Not %','qualitative control']];
 if(m==='molecules')values=[['Covalent','within H₂'],['Dispersion','between H₂ molecules'],['Intact','molecules remain bonded']];
 $('#metrics').innerHTML=values.map(v=>metric(...v)).join('');$('#insight').textContent=insight;
 $('#model-notes').innerHTML=current.ideas.map(([a,b])=>`<p><strong>${esc(a)}.</strong> ${esc(b)}</p>`).join('');
 diagram.set(current.mode,s);
}
function renderNotes(){$('#notes-view').innerHTML=`<div class="eyebrow">ORIGINAL LECTURE · PAGE${current.page===current.end?'':'S'} ${current.page}${current.page===current.end?'':'–'+current.end}</div><p class="notes-formula">${esc(current.formula)}</p>${current.ideas.map(([title,body])=>`<div class="idea-block"><h3>${esc(title)}</h3><p>${esc(body)}</p></div>`).join('')}<p class="materials-note">Explain it yourself: ${esc(current.quiz.question)} Try the chapter question, then justify your answer without looking.</p>`;}
$('#sources').innerHTML=sources.map(([title,url,note])=>`<p><a href="${url}" target="_blank" rel="noopener">${esc(title)} ↗</a><br>${esc(note)}</p>`).join('')+'<p>Supplementary formulas and caveats are identified as additions. Small spheres, clouds, paths and deformation are conceptual; no quantum or material-specific property simulation is claimed.</p>';
function questionHTML(q){return `<h3>${esc(q.title)}</h3><p class="study-prompt">${esc(q.question)}</p><div class="quiz-options">${q.options.map((v,i)=>`<button data-answer="${i}" ${answered!==null?'disabled':''} class="${answered===null?'':i===q.answer?'correct':i===answered?'incorrect':''}">${esc(v)}</button>`).join('')}</div>${answered!==null?`<p class="learning-feedback ${answered===q.answer?'success':'retry'}">${answered===q.answer?'Correct.':'Let’s work through it.'} ${esc(q.why)}</p>`:''}`;}
function renderLearning(){
 const notes=mode==='notes',quiz=mode==='quiz',review=mode==='review';$('#notes-view').hidden=!notes;$('#question-view').hidden=!quiz;$('#model-area').hidden=notes||quiz||review||(mode==='predict'&&!revealed);$('#learning-activity').hidden=['explore','notes','quiz'].includes(mode);
 if(quiz)$('#question-view').innerHTML=questionHTML(current.quiz);else $('#question-view').replaceChildren();
 let html='';
 if(mode==='explain')html=inspection?`<div class="eyebrow">YOU SELECTED</div><h3>${esc(inspection.title)}</h3><p>${esc(inspection.text)}</p>`:'<p>Click a labeled atom, bond, stage or diagram region to read what it means. Carbon bond numbers are also available as keyboard-accessible buttons.</p>';
 if(mode==='predict')html='<div class="eyebrow">PREDICT BEFORE REVEALING</div>'+questionHTML(current.quiz)+(answered!==null?'<button class="small-button" id="reveal">Show the diagram</button>':'<p class="progress-note">The diagram stays hidden until you answer and choose to reveal it.</p>');
 if(mode==='guide'){const n=progress.guide;html=`<div class="eyebrow">FROM ZERO · ${n+1} OF ${guide.length}</div><h3>${esc(current.title)}</h3><p>${esc(current.ideas[0][1])}</p><p>Explore the controls, then explain: ${esc(current.quiz.question)}</p><div class="action-row"><button id="guide-back" ${n===0?'disabled':''}>← Back</button><button id="guide-next">${n===guide.length-1?'Finish path ✓':'Next idea →'}</button></div><p class="progress-note">${progress.guideComplete?'Path completed. Revisit any step.':'Your place is saved in this browser.'}</p>`;}
 if(mode==='build'){const c=challenges[challengeIndex];html=`<div class="eyebrow">PRACTICE A CALCULATION</div><select id="challenge-select" aria-label="Choose calculation">${challenges.map((c,i)=>`<option value="${i}" ${i===challengeIndex?'selected':''}>${esc(c.title)}</option>`).join('')}</select><h3>${esc(c.title)}</h3><p>${esc(c.question)}</p><label>Your answer <input id="numeric-answer" type="number" step="any" value="${esc(numericValue)}" aria-label="Your numerical answer"> ${esc(c.unit)}</label><div class="action-row"><button id="check-number">Check &amp; explain</button></div>${numericFeedback?`<p role="status" class="learning-feedback ${numericFeedback.ok?'success':'retry'}">${numericFeedback.ok?'Correct.':'Try again.'} ${esc(c.why)}</p>`:''}`;}
 if(review){const weak=unresolved();html='<div class="eyebrow">REVIEW MY WEAK POINTS</div>';if(reviewId){const t=sections.find(t=>t.quiz.id===reviewId),c=challenges.find(c=>'materials:calculation:'+c.id===reviewId);if(t)html+=questionHTML(t.quiz);else if(c)html+=`<h3>${esc(c.title)}</h3><p>${esc(c.question)}</p><label>Your answer <input id="review-number" type="number" step="any" aria-label="Review numerical answer"> ${esc(c.unit)}</label><div class="action-row"><button id="check-review-number">Check answer</button></div>${numericFeedback?`<p>${numericFeedback.ok?'Correct.':'Try again.'} ${esc(c.why)}</p>`:''}`;html+='<div class="action-row"><button id="review-back">Back to review list</button></div>';}else{html+=`<h3>${weak.length?'A few ideas to revisit.':'Nothing waiting for review.'}</h3><p>Incorrect answers appear here. A clear list does not claim mastery.</p><div class="review-list">${weak.map(([id])=>{const t=sections.find(t=>t.quiz.id===id),c=challenges.find(c=>'materials:calculation:'+c.id===id);return t||c?`<button class="small-button" data-review="${esc(id)}">${esc(t?.title||c.title)}</button>`:'';}).join('')}</div><div class="action-row"><button id="clear-answers">Clear saved answers</button></div>`;}
 html+=`<p class="progress-note">${memoryAvailable?'Answers stay in this browser.':'Browser storage is unavailable; this session cannot save progress.'}</p>`;}
 $('#learning-activity').innerHTML=html;renderCount();
}
function startChallenge(){const c=challenges[challengeIndex];numericValue='';numericFeedback=null;goSection(c.section,true);if(c.id==='nano-area')s.divisions=10;if(c.id==='ion-electrons')s.transfer='1';if(c.id==='bond-energy')s.depth=2;renderControls();renderMetrics();renderLearning();}
$('#learning-mode').onchange=e=>{mode=e.target.value;answered=null;revealed=false;inspection=null;reviewId=null;numericFeedback=null;guideActive=mode==='guide';if(mode==='guide')goSection(guide[progress.guide],true);if(mode==='build')startChallenge();renderLearning();$('.lab-scroll').scrollTop=0;};
function handleLearning(e){const b=e.target.closest('button');if(!b)return;
 if(b.dataset.answer!==undefined){const q=mode==='review'?sections.find(t=>t.quiz.id===reviewId)?.quiz:current.quiz;if(!q)return;answered=+b.dataset.answer;record(q.id,answered===q.answer);renderLearning();}
 if(b.id==='reveal'){revealed=true;renderLearning();diagram.draw();}
 if(b.id==='guide-back'||b.id==='guide-next'){if(b.id==='guide-next'&&progress.guide===guide.length-1)progress.guideComplete=true;else progress.guide=Math.max(0,Math.min(guide.length-1,progress.guide+(b.id==='guide-next'?1:-1)));save();goSection(guide[progress.guide],true);renderLearning();}
 if(b.id==='check-number'){const input=$('#numeric-answer');if(input.value===''||!input.reportValidity())return;numericValue=input.value;const c=challenges[challengeIndex],ok=Math.abs(+numericValue-c.answer)<=c.tolerance;numericFeedback={ok};record('materials:calculation:'+c.id,ok);renderLearning();}
 if(b.dataset.review){reviewId=b.dataset.review;answered=null;numericFeedback=null;renderLearning();}
 if(b.id==='review-back'){reviewId=null;answered=null;numericFeedback=null;renderLearning();}
 if(b.id==='check-review-number'){const input=$('#review-number'),c=challenges.find(c=>'materials:calculation:'+c.id===reviewId);if(!c||input.value===''||!input.reportValidity())return;numericFeedback={ok:Math.abs(+input.value-c.answer)<=c.tolerance};record(reviewId,numericFeedback.ok);renderLearning();}
 if(b.id==='clear-answers'){progress.records={};save();renderLearning();}
}
$('#learning-activity').onclick=handleLearning;$('#question-view').onclick=handleLearning;
$('#learning-activity').onchange=e=>{if(e.target.id==='challenge-select'){challengeIndex=+e.target.value;startChallenge();}};
$('#reset').onclick=()=>{s={...defaults,...patches[current.id]};states.set(current.id,s);diagram.reset();renderControls();renderMetrics();};
$('#animate').onclick=()=>diagram.motion.toggle();
$('#theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light';store.set('materials-theme',document.documentElement.dataset.theme);diagram.draw();};document.documentElement.dataset.theme=store.get('materials-theme')==='dark'?'dark':'light';
$('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();
document.querySelectorAll('[data-panel]').forEach(b=>{if(b.tagName!=='BUTTON')return;b.onclick=()=>{$('#workspace').dataset.panel=b.dataset.panel;document.querySelectorAll('button[data-panel]').forEach(x=>x.classList.toggle('active',x===b));diagram.draw();queueVisible();};});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#chapter-sidebar').inert){chapterDrawer(false);return;}if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {e.preventDefault();chapterDrawer(true);return;}if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)||$('#workspace').inert||$('#help-dialog').open)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goPage(currentPage+(e.key==='ArrowRight'?1:-1));}});
async function openPDF(){try{if(!window.pdfjsLib)throw Error('PDF viewer unavailable.');pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('../../../vendor/pdf.worker.min.js',import.meta.url).href;pdf=await pdfjsLib.getDocument({url:new URL('assets/lecture.pdf',import.meta.url).href,isEvalSupported:false,enableScripting:false}).promise;if(pdf.numPages!==lesson.pages)throw Error('Unexpected lecture page count.');const first=await pdf.getPage(1),view=first.getViewport({scale:1});$('#pdf-pages').innerHTML=Array.from({length:lesson.pages},(_,i)=>`<div class="pdf-page" id="page-${i+1}" data-page="${i+1}" style="aspect-ratio:${view.width}/${view.height}" role="img" aria-label="Original Materials Science lecture, page ${i+1}"><span class="page-placeholder">Page ${i+1}</span></div>`).join('');$('#pdf-status').hidden=true;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)queuePage(+e.target.dataset.page);}),{root:$('#pdf-scroll'),rootMargin:'500px 0px'});document.querySelectorAll('.pdf-page').forEach(p=>observer.observe(p));const hash=new URLSearchParams(location.hash.slice(1));goPage(+hash.get('page')||+store.get(lesson.pageKey)||1,sections.find(t=>t.id===hash.get('topic'))||null);queueVisible();}catch(e){$('#pdf-status').innerHTML=`Could not open the PDF viewer: ${esc(e.message)}. <a href="assets/lecture.pdf" target="_blank" rel="noopener">Open the original PDF ↗</a>`;}}
function queuePage(n){if(!pdf||$('#page-'+n)?.dataset.rendered==='true')return;queue.add(n);drain();}
async function drain(){if(rendering)return;rendering=true;try{while(queue.size){const n=queue.values().next().value;queue.delete(n);const el=$('#page-'+n);if(!el||el.dataset.rendered==='true'||!el.clientWidth)continue;const version=epoch;try{const p=await pdf.getPage(n),base=p.getViewport({scale:1}),view=p.getViewport({scale:el.clientWidth/base.width*Math.min(devicePixelRatio,1.75)}),canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await p.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;if(version!==epoch)continue;el.querySelector('canvas')?.remove();el.append(canvas);el.dataset.rendered='true';}catch(e){el.querySelector('.page-placeholder').textContent='Rendering unavailable. Use Open original PDF.';}}}finally{rendering=false;}}
function queueVisible(){if(!pdf)return;const r=$('#pdf-scroll').getBoundingClientRect();document.querySelectorAll('.pdf-page').forEach(el=>{const a=el.getBoundingClientRect();if(a.bottom>r.top-450&&a.top<r.bottom+450)queuePage(+el.dataset.page);});}
let frame=0;$('#pdf-scroll').addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const r=$('#pdf-scroll').getBoundingClientRect(),marker=r.top+Math.min(r.height*.28,150);for(const el of document.querySelectorAll('.pdf-page')){const a=el.getBoundingClientRect();if(a.top<=marker&&a.bottom>=marker){if(+el.dataset.page!==currentPage)updatePage(+el.dataset.page);break;}}queueVisible();});},{passive:true});
function invalidate(){epoch++;document.querySelectorAll('.pdf-page').forEach(el=>{el.dataset.rendered='false';el.querySelector('canvas')?.remove();});queueVisible();}
function changeZoom(delta){zoom=Math.max(.7,Math.min(1.8,+(zoom+delta).toFixed(1)));document.querySelectorAll('.pdf-page').forEach(el=>el.style.width=zoom*100+'%');$('#zoom-label').textContent=zoom===1?'Fit':Math.round(zoom*100)+'%';invalidate();goPage(currentPage,current,true);}
$('#zoom-out').onclick=()=>changeZoom(-.1);$('#zoom-in').onclick=()=>changeZoom(.1);
let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(invalidate,180);}).observe($('#pdf-scroll'));
window.addEventListener('hashchange',()=>{const hash=new URLSearchParams(location.hash.slice(1));goPage(+hash.get('page')||1,sections.find(t=>t.id===hash.get('topic'))||null);});
selectSection(current);openPDF();
