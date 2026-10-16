import {lesson,sections,pageSections,guide,challenges,sources} from './content.js?v=motion-1';
import {C,H,EV,light,photonRate,irradiance,coherence,pulse,gaussianBeam,hydrogenEnergy,cavityGain,inversion} from './math.js';
import {LaserDiagram} from './visuals.js?v=motion-1';
import {movingModes} from './dynamics.js';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}};
let progress={records:{},guide:0},memoryAvailable=true;
try{const saved=JSON.parse(store.get(lesson.learningKey));if(saved&&typeof saved.records==='object'&&saved.records!==null&&!Array.isArray(saved.records)){progress.records=saved.records;progress.guide=Number.isInteger(saved.guide)?Math.max(0,Math.min(guide.length-1,saved.guide)):0;progress.guideComplete=saved.guideComplete===true;}}catch{}
const defaults={lambda:632.8,amplitude:1,polarization:0,milestone:'3',logLambda:-6.2,lower:'1',upper:'2',power:2,process:'Stimulated',width:.05,index:1,delay:.5,relation:'Stable',phase:0,duration:.05,shape:'Estimate',waist:.5,distance:100,diameter:1.3,medium:'He–Ne',upperFraction:.8,reflectivity:.95};
const patches={intensity:{power:20},pulse:{lambda:623.8}};
let current=sections[0],currentPage=1,s={...defaults},mode='explore',answered=null,revealed=false,guideActive=false,challengeIndex=0,numericValue='',numericFeedback=null,reviewId=null,inspection=null,sync=true,pdf=null,zoom=1,rendering=false,epoch=0;
const states=new Map(),queue=new Set();
const diagram=new LaserDiagram($('#scene'),(title,text)=>{inspection={title,text};mode='explain';$('#learning-mode').value=mode;renderLearning();});
diagram.onFrame=renderMotion;
function renderMotion(){const active=movingModes.has(current.mode);$('#motion-controls').hidden=!active;$('#motion-status').hidden=!active;$('#animate').textContent=diagram.running?'Ⅱ Pause':'▷ Play';$('#animate').setAttribute('aria-pressed',String(diagram.running));$('#animate').setAttribute('aria-label',diagram.running?'Pause simulation':'Play simulation');$('#motion-status').textContent=(diagram.running?'Playing · ':'Paused · ')+(diagram.motionText||'Slowed teaching model, not real optical speed');}
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
 $('#scene-label').textContent=current.title.toUpperCase()+' · TEACHING MODEL';
 $('#scene-hint').textContent='Change a control · Click a labeled part to explain it';
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
 if(['fields','wave','photons','direction','monochromatic','temporal'].includes(m))html+=slider('lambda','Vacuum wavelength',380,1000,.1,' nm');
 if(m==='wave')html+=slider('amplitude','Relative field amplitude',.2,1.5,.1);
 if(m==='fields')html+=slider('polarization','Polarization angle',0,180,5,'°');
 if(m==='history')html+=select('milestone','Milestone',['0','1','2','3']);
 if(m==='spectrum')html+=slider('logLambda','log₁₀ wavelength (m)',-12,3,.05);
 if(m==='levels')html+=select('lower','Lower level n',['1','2','3'])+select('upper','Upper level n',['2','3','4'])+'<span class="control-note">Hydrogen illustration, not He–Ne laser levels. Upper n must exceed lower n.</span>';
 if(['photons','intensity'].includes(m))html+=slider('power','Optical power',.1,50,.1,' mW');
 if(m==='interactions')html+=select('process','Process',['Absorption','Spontaneous','Stimulated']);
 if(['temporal','monochromatic'].includes(m))html+=slider('width','Spectral width Δλ',.001,1,.001,' nm');
 if(m==='temporal')html+=slider('index','Refractive index (constant n)',1,2,.05)+slider('delay','Delay scan starts at τΔν',0,2,.02);
 if(m==='spatial')html+=select('relation','Relative phase',['Stable','Fluctuating'])+slider('phase','Phase difference',0,360,5,'°');
 if(m==='pulse')html+=slider('duration','Assumed pulse duration',.01,.5,.01,' ns')+select('shape','Width convention',['Estimate','Rectangular','Gaussian'])+'<span class="control-note">Center λ₀ = 623.8 nm. Estimate: ΔνΔt ≈ 1. Shape-specific options use intensity FWHM. PDF time units are incomplete.</span>';
 if(m==='direction')html+=slider('waist','Waist radius w₀',.1,3,.1,' mm')+slider('distance','Distance from waist',1,2000,1,' m');
 if(m==='intensity')html+=slider('diameter','Beam diameter',.2,4,.1,' mm');
 if(m==='medium')html+=select('medium','Active medium',['Ruby','Nd:YAG','He–Ne','CO₂','Dye','GaAs']);
 if(['pumping','cavity'].includes(m))html+=slider('upperFraction','Upper-state fraction N₂/N',0,1,.05);
 if(m==='cavity')html+=slider('reflectivity','Output mirror R₂',.5,.99,.01);
 $('#controls').innerHTML=html;
}
$('#controls').oninput=e=>{const key=e.target.dataset.key;if(!key||e.target.tagName==='SELECT')return;if(!e.target.checkValidity()||e.target.value==='')return;s[key]=+e.target.value;const out=$('[data-output="'+key+'"]');if(out)out.textContent=fmt(s[key]);renderMetrics();};
$('#controls').onchange=e=>{const key=e.target.dataset.key;if(!key||e.target.tagName!=='SELECT')return;s[key]=e.target.value;if(+s.lower>=+s.upper){if(key==='lower')s.upper=String(+s.lower+1);else s.lower=String(+s.upper-1);}renderControls();renderMetrics();};
function metric(v,label){return '<div class="metric"><strong>'+esc(v)+'</strong><small>'+esc(label)+'</small></div>';}
const sci=(n,d=3)=>n.toExponential(d).replace('e+',' × 10^').replace('e-',' × 10^−');
function renderMetrics(){const m=current.mode,l=light(+s.lambda);let values=[],insight=current.formula;
 if(m==='overview')values=[['4','key properties'],['Stimulated','emission'],['Pump','energy source']];
 if(m==='history')values=[['1917 · 1950s · 1958 · 1960','teaching timeline'],[['Einstein','Maser','Optical proposal','Ruby laser'][+s.milestone],'selected milestone']];
 if(m==='fields'){const p=s.polarization*Math.PI/180;values=[['(1, 0, 0)','k̂ propagation'],['(0, '+fmt(Math.cos(p),2)+', '+fmt(Math.sin(p),2)+')','Ê · i, j, k components'],['(0, '+fmt(-Math.sin(p),2)+', '+fmt(Math.cos(p),2)+')','B̂ · i, j, k components']];insight='Ê · B̂ = 0 and Ê × B̂ = (1,0,0). E and B are in phase for this vacuum plane wave. Arrow lengths use independent scales, not equal SI magnitudes.';}
 if(m==='wave')values=[[fmt(l.frequency/1e12,2)+' THz','frequency ν'],[fmt(l.period/1e-15,3)+' fs','period T'],[fmt(s.amplitude**2,2)+'×','irradiance relative to E₀ = 1']];
 if(m==='spectrum'){const q=light(10**(+s.logLambda)*1e9);values=[[sci(q.wavelength)+' m','vacuum wavelength'],[sci(q.frequency)+' Hz','frequency'],[sci(q.eV)+' eV','photon energy']];}
 if(m==='levels'){const delta=hydrogenEnergy(+s.upper)-hydrogenEnergy(+s.lower);values=[[fmt(hydrogenEnergy(+s.lower),3)+' eV','lower energy'],[fmt(delta,3)+' eV','energy difference ΔE'],[fmt(H*C/(delta*EV)*1e9,2)+' nm','radiative transition wavelength']];}
 if(m==='photons')values=[[fmt(l.eV,4)+' eV','energy / photon'],[sci(l.energy)+' J','energy / photon'],[sci(photonRate(+s.power,+s.lambda))+' s⁻¹','photon rate at '+s.power+' mW']];
 if(m==='interactions')values=[[s.process,'selected process'],[s.process==='Absorption'?'Lower → upper':'Upper → lower','emitter transition'],[s.process==='Absorption'?'1 → 0':s.process==='Stimulated'?'1 → 2':'0 → 1','photons · input → output']];
 if(m==='temporal'){const b=coherence(+s.lambda,+s.width,+s.index);values=[[fmt(b.bandwidth/1e9,3)+' GHz','narrow-band Δν'],[fmt(b.time*1e12,3)+' ps','estimate τc ≈ 1/Δν'],[fmt(b.length*100,3)+' cm','estimate Lc ≈ cτc/n']];insight='Lc uses the lecture’s inverse-bandwidth estimate, not a universal exact correlation length. The graph separately illustrates |g₁(τ)| for a Gaussian spectrum; its horizontal axis is normalized delay τΔν.';}
 if(m==='spatial')values=[[s.relation,'phase relation'],[s.phase+'°','phase offset'],[s.relation==='Stable'?'1':'0','ideal averaged fringe visibility']];
 if(m==='pulse'){const b=pulse(+s.duration,623.8,s.shape);values=[[fmt(b.bandwidth/1e9,3)+' GHz','spectral width Δν'],[fmt(b.widthNm,5)+' nm','narrow-band Δλ'],[fmt(b.length*100,3)+' cm','inverse-bandwidth Lc estimate']];insight='Explicitly assumed Δt = '+s.duration+' ns. '+(s.shape==='Estimate'?'Order estimate ΔνΔt ≈ 1; not an exact FWHM result.':s.shape+' transform-limited convention: ΔνΔt = '+fmt(b.factor,4)+'.')+' The PDF’s incomplete duration cannot determine a unique exact result without these assumptions.';}
 if(m==='direction'){const b=gaussianBeam(+s.lambda,+s.waist,+s.distance);values=[[fmt(b.radius*1000,3)+' mm','1/e² radius w(z)'],[fmt(b.halfAngle*1000,3)+' mrad','far-field half-angle θ'],[fmt(b.zR,3)+' m','Rayleigh range zR']];}
 if(m==='monochromatic')values=[[s.lambda+' nm','center wavelength'],[s.width+' nm','Gaussian intensity FWHM'],[fmt(coherence(+s.lambda,+s.width).bandwidth/1e9,3)+' GHz','narrow-band frequency width']];
 if(m==='intensity'){const I=irradiance(+s.power,+s.diameter);values=[[fmt(I,1)+' W/m²','uniform average irradiance'],[fmt(I/1e4,4)+' W/cm²','same irradiance'],[fmt(Math.PI*(s.diameter/2)**2,4)+' mm²','circular area']];insight='Correct formula: I = 4P/(πd²), not 4P/(πd). This uniform-beam model does not give Gaussian peak intensity or determine eye safety.';}
 if(m==='medium')values=[[s.medium,'selected gain medium'],['Pump','supplies energy'],['Cavity','selects modes']];
 if(['pumping','cavity'].includes(m)){const inv=inversion(+s.upperFraction),G=cavityGain(inv,.8,.1,.995,+s.reflectivity);values=[[Math.round(s.upperFraction*100)+'%','upper-state population'],[fmt(inv,2),'(N₂−N₁)/N · equal degeneracies'],[m==='pumping'?(inv>0?'Gain':inv===0?'Transparency':'Absorption'):fmt(G,3),m==='pumping'?'stimulated transition contribution':'small-signal round-trip factor']];if(m==='cavity')insight=(G>1?'Above small-signal threshold. ':G<1?'Below small-signal threshold. ':'At threshold. ')+'R₁ = 0.995; gL = 0.8(N₂−N₁)/N; αL = 0.1. This omits saturation and does not predict steady output power.';}
 $('#metrics').innerHTML=values.map(v=>metric(...v)).join('');$('#insight').textContent=insight;
 $('#model-notes').innerHTML=current.ideas.map(([a,b])=>'<p><strong>'+esc(a)+'.</strong> '+esc(b)+'</p>').join('');diagram.set(current.mode,s);
}
function renderNotes(){$('#notes-view').innerHTML=`<div class="eyebrow">ORIGINAL LECTURE · PAGE${current.page===current.end?'':'S'} ${current.page}${current.page===current.end?'':'–'+current.end}</div><p class="notes-formula">${esc(current.formula)}</p>${current.ideas.map(([title,body])=>`<div class="idea-block"><h3>${esc(title)}</h3><p>${esc(body)}</p></div>`).join('')}<p class="materials-note">Explain it yourself: ${esc(current.quiz.question)} Try the chapter question, then justify your answer without looking.</p>`;}
$('#sources').innerHTML=sources.map(([title,url,note])=>`<p><a href="${url}" target="_blank" rel="noopener">${esc(title)} ↗</a><br>${esc(note)}</p>`).join('')+'<p>Supplementary formulas and caveats are identified as additions. Diagrams are teaching models, not full electromagnetic or quantum simulations. Added formulas, corrections and assumptions are stated alongside the lecture. Never look into a laser or a reflection; this is not a laser-safety assessment.</p>';
function questionHTML(q){return `<h3>${esc(q.title)}</h3><p class="study-prompt">${esc(q.question)}</p><div class="quiz-options">${q.options.map((v,i)=>`<button data-answer="${i}" ${answered!==null?'disabled':''} class="${answered===null?'':i===q.answer?'correct':i===answered?'incorrect':''}">${esc(v)}</button>`).join('')}</div>${answered!==null?`<p class="learning-feedback ${answered===q.answer?'success':'retry'}">${answered===q.answer?'Correct.':'Let’s work through it.'} ${esc(q.why)}</p>`:''}`;}
function renderLearning(){
 const notes=mode==='notes',quiz=mode==='quiz',review=mode==='review';$('#notes-view').hidden=!notes;$('#question-view').hidden=!quiz;$('#model-area').hidden=notes||quiz||review||(mode==='predict'&&!revealed);$('#learning-activity').hidden=['explore','notes','quiz'].includes(mode);
 if(quiz)$('#question-view').innerHTML=questionHTML(current.quiz);else $('#question-view').replaceChildren();
 let html='';
 if(mode==='explain')html=inspection?`<div class="eyebrow">YOU SELECTED</div><h3>${esc(inspection.title)}</h3><p>${esc(inspection.text)}</p>`:'<p>Click a labeled field, transition, beam or component to read what it means.</p>';
 if(mode==='predict')html='<div class="eyebrow">PREDICT BEFORE REVEALING</div>'+questionHTML(current.quiz)+(answered!==null?'<button class="small-button" id="reveal">Show the diagram</button>':'<p class="progress-note">The diagram stays hidden until you answer and choose to reveal it.</p>');
 if(mode==='guide'){const n=progress.guide;html=`<div class="eyebrow">FROM ZERO · ${n+1} OF ${guide.length}</div><h3>${esc(current.title)}</h3><p>${esc(current.ideas[0][1])}</p><p>Explore the controls, then explain: ${esc(current.quiz.question)}</p><div class="action-row"><button id="guide-back" ${n===0?'disabled':''}>← Back</button><button id="guide-next">${n===guide.length-1?'Finish path ✓':'Next idea →'}</button></div><p class="progress-note">${progress.guideComplete?'Path completed. Revisit any step.':'Your place is saved in this browser.'}</p>`;}
 if(mode==='build'){const c=challenges[challengeIndex];html=`<div class="eyebrow">PRACTICE A CALCULATION</div><select id="challenge-select" aria-label="Choose calculation">${challenges.map((c,i)=>`<option value="${i}" ${i===challengeIndex?'selected':''}>${esc(c.title)}</option>`).join('')}</select><h3>${esc(c.title)}</h3><p>${esc(c.question)}</p><label>Your answer <input id="numeric-answer" type="number" step="any" value="${esc(numericValue)}" aria-label="Your numerical answer"> ${esc(c.unit)}</label><div class="action-row"><button id="check-number">Check &amp; explain</button></div>${numericFeedback?`<p role="status" class="learning-feedback ${numericFeedback.ok?'success':'retry'}">${numericFeedback.ok?'Correct.':'Try again.'} ${esc(c.why)}</p>`:''}`;}
 if(review){const weak=unresolved();html='<div class="eyebrow">REVIEW MY WEAK POINTS</div>';if(reviewId){const t=sections.find(t=>t.quiz.id===reviewId),c=challenges.find(c=>'laser:calculation:'+c.id===reviewId);if(t)html+=questionHTML(t.quiz);else if(c)html+=`<h3>${esc(c.title)}</h3><p>${esc(c.question)}</p><label>Your answer <input id="review-number" type="number" step="any" aria-label="Review numerical answer"> ${esc(c.unit)}</label><div class="action-row"><button id="check-review-number">Check answer</button></div>${numericFeedback?`<p>${numericFeedback.ok?'Correct.':'Try again.'} ${esc(c.why)}</p>`:''}`;html+='<div class="action-row"><button id="review-back">Back to review list</button></div>';}else{html+=`<h3>${weak.length?'A few ideas to revisit.':'Nothing waiting for review.'}</h3><p>Incorrect answers appear here. A clear list does not claim mastery.</p><div class="review-list">${weak.map(([id])=>{const t=sections.find(t=>t.quiz.id===id),c=challenges.find(c=>'laser:calculation:'+c.id===id);return t||c?`<button class="small-button" data-review="${esc(id)}">${esc(t?.title||c.title)}</button>`:'';}).join('')}</div><div class="action-row"><button id="clear-answers">Clear saved answers</button></div>`;}
 html+=`<p class="progress-note">${memoryAvailable?'Answers stay in this browser.':'Browser storage is unavailable; this session cannot save progress.'}</p>`;}
 $('#learning-activity').innerHTML=html;renderCount();
}
function startChallenge(){const c=challenges[challengeIndex];numericValue='';numericFeedback=null;goSection(c.section,true);renderControls();renderMetrics();renderLearning();}
$('#learning-mode').onchange=e=>{mode=e.target.value;answered=null;revealed=false;inspection=null;reviewId=null;numericFeedback=null;guideActive=mode==='guide';if(mode==='guide')goSection(guide[progress.guide],true);if(mode==='build')startChallenge();renderLearning();$('.lab-scroll').scrollTop=0;};
function handleLearning(e){const b=e.target.closest('button');if(!b)return;
 if(b.dataset.answer!==undefined){const q=mode==='review'?sections.find(t=>t.quiz.id===reviewId)?.quiz:current.quiz;if(!q)return;answered=+b.dataset.answer;record(q.id,answered===q.answer);renderLearning();}
 if(b.id==='reveal'){revealed=true;renderLearning();diagram.draw();}
 if(b.id==='guide-back'||b.id==='guide-next'){if(b.id==='guide-next'&&progress.guide===guide.length-1)progress.guideComplete=true;else progress.guide=Math.max(0,Math.min(guide.length-1,progress.guide+(b.id==='guide-next'?1:-1)));save();goSection(guide[progress.guide],true);renderLearning();}
 if(b.id==='check-number'){const input=$('#numeric-answer');if(input.value===''||!input.reportValidity())return;numericValue=input.value;const c=challenges[challengeIndex],ok=Math.abs(+numericValue-c.answer)<=c.tolerance;numericFeedback={ok};record('laser:calculation:'+c.id,ok);renderLearning();}
 if(b.dataset.review){reviewId=b.dataset.review;answered=null;numericFeedback=null;renderLearning();}
 if(b.id==='review-back'){reviewId=null;answered=null;numericFeedback=null;renderLearning();}
 if(b.id==='check-review-number'){const input=$('#review-number'),c=challenges.find(c=>'laser:calculation:'+c.id===reviewId);if(!c||input.value===''||!input.reportValidity())return;numericFeedback={ok:Math.abs(+input.value-c.answer)<=c.tolerance};record(reviewId,numericFeedback.ok);renderLearning();}
 if(b.id==='clear-answers'){progress.records={};save();renderLearning();}
}
$('#learning-activity').onclick=handleLearning;$('#question-view').onclick=handleLearning;
$('#learning-activity').onchange=e=>{if(e.target.id==='challenge-select'){challengeIndex=+e.target.value;startChallenge();}};
$('#reset').onclick=()=>{s={...defaults,...patches[current.id]};states.set(current.id,s);diagram.reset();renderControls();renderMetrics();};
$('#animate').onclick=()=>diagram.running?diagram.pause():diagram.play();
$('#step').onclick=()=>diagram.step();
$('#motion-speed').onchange=e=>{diagram.speed=+e.target.value;renderMotion();};
$('#theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light';store.set('laser-theme',document.documentElement.dataset.theme);diagram.draw();};document.documentElement.dataset.theme=store.get('laser-theme')==='dark'?'dark':'light';
$('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();
document.querySelectorAll('[data-panel]').forEach(b=>{if(b.tagName!=='BUTTON')return;b.onclick=()=>{$('#workspace').dataset.panel=b.dataset.panel;document.querySelectorAll('button[data-panel]').forEach(x=>x.classList.toggle('active',x===b));diagram.draw();queueVisible();};});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#chapter-sidebar').inert){chapterDrawer(false);return;}if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {e.preventDefault();chapterDrawer(true);return;}if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)||$('#workspace').inert||$('#help-dialog').open)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goPage(currentPage+(e.key==='ArrowRight'?1:-1));}});
async function openPDF(){try{if(!window.pdfjsLib)throw Error('PDF viewer unavailable.');pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('../../../vendor/pdf.worker.min.js',import.meta.url).href;pdf=await pdfjsLib.getDocument({url:new URL('assets/lecture.pdf',import.meta.url).href,isEvalSupported:false,enableScripting:false}).promise;if(pdf.numPages!==lesson.pages)throw Error('Unexpected lecture page count.');const first=await pdf.getPage(1),view=first.getViewport({scale:1});$('#pdf-pages').innerHTML=Array.from({length:lesson.pages},(_,i)=>`<div class="pdf-page" id="page-${i+1}" data-page="${i+1}" style="aspect-ratio:${view.width}/${view.height}" role="img" aria-label="Original Laser Physics lecture, page ${i+1}"><span class="page-placeholder">Page ${i+1}</span></div>`).join('');$('#pdf-status').hidden=true;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)queuePage(+e.target.dataset.page);}),{root:$('#pdf-scroll'),rootMargin:'500px 0px'});document.querySelectorAll('.pdf-page').forEach(p=>observer.observe(p));const hash=new URLSearchParams(location.hash.slice(1));goPage(+hash.get('page')||+store.get(lesson.pageKey)||1,sections.find(t=>t.id===hash.get('topic'))||null);queueVisible();}catch(e){$('#pdf-status').innerHTML=`Could not open the PDF viewer: ${esc(e.message)}. <a href="assets/lecture.pdf" target="_blank" rel="noopener">Open the original PDF ↗</a>`;}}
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
