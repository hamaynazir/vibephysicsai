import {predictions,guideSteps,buildChallenges} from './learning-data.js';
import {loadProgress,recordAnswer,weakPoints,saveProgress} from './learning-memory.js';
import {nearestNeighbors} from './teaching-math.js';
import {teachingParams} from './teaching.js';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=n=>Math.abs(n)<1e-7?'0':Number(n.toFixed(4)).toString();
const coords=v=>'('+v.map(f).join(', ')+')';
const equation=v=>`${f(v[0])}î ${v[1]<0?'−':'+'} ${f(Math.abs(v[1]))}ĵ ${v[2]<0?'−':'+'} ${f(Math.abs(v[2]))}k̂`;
const modes=[['explore','Explore the diagram'],['explain','Explain what I click'],['build','Build it yourself'],['predict','Predict, then reveal'],['guide','Teach me from zero'],['review','Review my weak points'],['notes','Read the notes'],['quiz','Chapter question']];

export class Learning{
 constructor(api){
  this.api=api;this.mode='explore';this.context=null;this.busy=false;this.question=null;this.answered=null;this.revealed=false;this.detail=null;this.buildIndex=0;this.preview=null;this.buildFeedback=null;this.reviewQuestion=null;
  try{this.storage=localStorage;}catch{this.storage={getItem:()=>null,setItem:()=>{throw Error('Storage unavailable')}};}
  this.progress=loadProgress(this.storage);this.memoryAvailable=true;
  this.nav=document.createElement('div');this.nav.className='learning-nav';this.nav.innerHTML=`<label for="learning-mode">Learn<select id="learning-mode">${modes.map(([value,title])=>`<option value="${value}">${title}</option>`).join('')}</select></label><span class="review-count" id="review-count"></span>`;document.querySelector('.lab-tabs').before(this.nav);
  this.activity=document.createElement('div');this.activity.className='learning-activity';this.activity.id='learning-activity';document.querySelector('#controls').before(this.activity);
  this.nav.querySelector('select').addEventListener('change',e=>this.activate(e.target.value));
  this.activity.addEventListener('click',e=>this.handleClick(e));
  this.activity.addEventListener('change',e=>{if(e.target.id==='build-challenge'){this.buildIndex=+e.target.value;this.startBuild();}});
  document.querySelector('#ideas-view').addEventListener('click',e=>{if(e.target.closest('[data-example]')){this.mode='explore';this.nav.querySelector('select').value='explore';this.render();}});
  this.installDrawer();this.updateCount();
 }
 installDrawer(){
  const sidebar=document.querySelector('.sidebar'),button=document.querySelector('#chapters-toggle');this.shade=document.createElement('button');this.shade.className='chapter-shade';this.shade.hidden=true;this.shade.setAttribute('aria-label','Close chapters');document.body.append(this.shade);
  this.setChapters=(open,focus=false)=>{document.body.classList.toggle('chapters-open',open);sidebar.inert=!open;document.querySelector('#workspace').inert=open;button.setAttribute('aria-expanded',String(open));this.shade.hidden=!open;if(open)document.querySelector('#search').focus();else if(focus)button.focus();};
  button.onclick=()=>this.setChapters(!document.body.classList.contains('chapters-open'),true);this.shade.onclick=()=>this.setChapters(false,true);document.querySelector('#toc').addEventListener('click',e=>{if(e.target.closest('[data-topic]'))this.setChapters(false,true)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('chapters-open'))this.setChapters(false,true);});
 }
 save(){this.memoryAvailable=saveProgress(this.storage,this.progress);this.updateCount();}
 updateCount(){const n=weakPoints(this.progress).length;document.querySelector('#review-count').textContent=n?`${n} to revisit`:'';}
 record(question,correct){recordAnswer(this.progress,question,correct);this.save();}
 recordQuiz(section,correct){const [question,options,answer,why]=section.quiz;this.record({id:'quiz-'+section.id,title:section.title,section:section.id,question,options,answer,why},correct);}
 update(mode,state,section){
  const changed=this.context?.section.id!==section.id;this.context={mode,state,section};
  if(changed&&!this.busy){
   if(['build','guide'].includes(this.mode)){this.mode='explore';this.preview=null;this.api.teaching.state.enabled=false;document.querySelector('#learning-mode').value=this.mode;}
   if(this.mode==='explain'){this.detail=null;this.api.teaching.state.enabled=false;}
   if(this.mode==='predict'){this.question=this.predictionFor(section.id);this.answered=null;this.revealed=false;}
  }
  if(changed)this.render();this.updateCount();
 }
 predictionFor(section){return predictions.find(q=>q.section===section)||predictions.find(q=>q.section===({bravais:'systems','cube-symmetry':'systems',symmetry:'systems',indices:'spacing',wigner:'definitions',amorphous:'crystalline',bonding:'structures'}[section]))||predictions[0];}
 activate(mode){
  this.mode=mode;document.querySelector('#learning-mode').value=mode;this.api.showTab(mode==='notes'?'ideas':mode==='quiz'?'practice':'explore');this.detail=null;this.answered=null;this.revealed=false;this.preview=null;this.buildFeedback=null;
  if(!['guide','build'].includes(mode))this.api.teaching.state.enabled=false;
  if(mode==='predict')this.question=this.predictionFor(this.context.section.id);
  if(mode==='review')this.reviewQuestion=null;
  if(mode==='guide')this.startGuide();else if(mode==='build')this.startBuild();else this.api.refresh();
  this.render();document.querySelector('.lab-scroll').scrollTop=0;
 }
 setup(config){this.busy=true;try{this.api.setup(config);}finally{this.busy=false;}this.render();}
 startGuide(){const stage=guideSteps[this.progress.guide];this.setup({...stage,teach:{enabled:false,...stage.teach}});if(stage.teach)document.querySelector('#diagram-settings').open=true;}
 startBuild(){const c=buildChallenges[this.buildIndex];this.preview=null;this.buildFeedback=null;this.setup({...c,teach:{enabled:false}});document.querySelector('#diagram-settings').open=false;}
 render(){
  if(!this.context)return;
  if(this.mode==='explain'&&this.detail)document.querySelector('#visual-stage').after(this.activity);else document.querySelector('#controls').before(this.activity);
  let html='';
  if(this.mode==='explain')html=this.detail?this.inspectorHTML():`<div class="eyebrow">POINT TO SOMETHING</div><h3>What are you looking at?</h3><p>Click an atom, a cell-axis arrow or a plane to see what it means. For angles and primitive vectors, open <strong>Diagram controls</strong> below the model and enable the teaching overlay.</p>`;
  if(this.mode==='build'){
   const c=buildChallenges[this.buildIndex];html=`<div class="eyebrow">BUILD IT YOURSELF</div><label class="teach-choice">Exercise<select id="build-challenge">${buildChallenges.map((x,i)=>`<option value="${i}" ${i===this.buildIndex?'selected':''}>${x.title}</option>`).join('')}</select></label><h3>${c.title}</h3><p>${c.question}</p><div class="number-grid">${c.labels.map((l,i)=>`<label>${l}<input id="build-${i}" type="number" min="-6" max="6" step="${this.buildIndex===2?'1':'0.01'}" value="${this.preview?this.preview[i]:0}" aria-label="${l}"></label>`).join('')}</div><div class="action-row"><button id="build-preview">Preview my construction</button><button id="build-check" class="primary">Check & explain</button></div><div id="build-feedback" class="learning-feedback ${this.buildFeedback?.ok?'success':'retry'}" role="status">${this.buildFeedback?.text||''}</div>`;
  }
  if(this.mode==='predict'&&this.question)html=this.questionHTML(this.question,'PREDICT BEFORE REVEALING')+(this.answered!==null?'<div class="action-row"><button id="show-prediction">Show it in the diagram</button><button id="next-prediction">Another prediction →</button></div>':'');
  if(this.mode==='guide'){
   const i=this.progress.guide,s=guideSteps[i];html=`<div class="eyebrow">FROM ZERO · ${i+1} OF ${guideSteps.length}</div><div class="guide-progress"><span style="width:${(i+1)/guideSteps.length*100}%"></span></div><h3>${s.title}</h3><p>${s.text}</p><div class="action-row"><button id="guide-prev" ${i===0?'disabled':''}>← Back</button><button id="guide-next" class="primary">${i===guideSteps.length-1?'Finish this path ✓':'Next idea →'}</button></div><p class="progress-note">${this.progress.guideComplete?'Path completed. You can revisit any step.':'Your place is saved in this browser. Explore the diagram before continuing.'}</p>`;
  }
  if(this.mode==='review'){
   const weak=weakPoints(this.progress);
   if(this.reviewQuestion)html=this.questionHTML(this.reviewQuestion,'REVISIT AN IDEA')+`<div class="action-row"><button id="review-back">Back to my list</button><button id="review-diagram">Open its diagram</button></div>`;
   else html=`<div class="eyebrow">YOUR LEARNING NOTES</div><h3>${weak.length?'A few ideas to revisit.':'Nothing waiting for review.'}</h3><p>${weak.length?'These are questions you answered incorrectly. Answer one correctly to mark it reviewed.':'Mistakes from predictions, construction exercises and chapter questions will appear here. A clear list means no saved unresolved mistakes; it is not a claim that you have mastered the chapter.'}</p><div class="review-list">${weak.map(q=>`<button data-review="${esc(q.id)}">${esc(q.title)}<small>${q.misses} incorrect attempt${q.misses===1?'':'s'}</small></button>`).join('')}</div><p class="progress-note">${this.memoryAvailable?'Saved only in this browser. No account or AI service.':'Browser storage is unavailable; progress lasts only until this page closes.'}</p>${Object.keys(this.progress.records).length?'<button id="clear-progress">Clear saved answers</button>':''}`;
  }
  this.activity.innerHTML=html;this.activity.hidden=['notes','quiz'].includes(this.mode);
  document.querySelector('#explore-view').dataset.predictHidden=String(this.mode==='predict'&&!this.revealed);
 }
 questionHTML(q,label){const answered=this.answered!==null,correct=answered&&this.answered===q.answer;return `<div class="eyebrow">${label}</div><h3>${esc(q.title)}</h3><p>${esc(q.question)}</p><div class="quiz-options">${q.options.map((o,i)=>`<button data-learning-answer="${i}" class="${answered?(i===q.answer?'correct':i===this.answered?'incorrect':''):''}" ${answered?'disabled':''}>${esc(o)}</button>`).join('')}</div>${answered?`<p class="learning-feedback" role="status"><strong>${correct?'Correct.':'Let’s unpack it.'}</strong> ${esc(q.why)}</p>`:''}`;}
 inspect(detail){
  if(['build','guide'].includes(this.mode))return;
  this.mode='explain';this.detail=detail;document.querySelector('#learning-mode').value='explain';this.api.showTab('explore');this.render();this.activity.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
 inspectorHTML(){
  const d=this.detail,c=this.context;let title='',body='';
  if(d.kind==='atom'){
   const type=c.state.structure||'SC',neighbors=nearestNeighbors(type,d.p,teachingParams(c.mode,c.state));title='An atom at '+coords(d.p);body=`<p>These are <strong>fractional cell coordinates</strong>: the coefficients along a, b and c. They are not automatically Cartesian x, y, z for an oblique cell.</p><p>This site has <strong>${neighbors.sites.length} nearest neighbors</strong> in the full periodic crystal, at distance ${f(neighbors.distance)} in the model’s length units.</p><p>${type==='Diamond'?'Both model colors are carbon. They distinguish the two FCC sublattices; the local four-neighbor arrangement is tetrahedral.':type==='CsCl'?'Cs and Cl occupy different sites. This is a primitive cubic lattice with a two-ion basis, rather than a BCC Bravais lattice.':'A cell boundary is a drawing boundary, not a physical break in the crystal. Equivalent copies continue beyond the box.'}</p><div class="action-row"><button id="inspect-neighbors">Highlight its neighbors</button><button id="inspect-expand">${c.state.repeat?'Return to one cell':'Show neighboring cells'}</button></div>`;
  }else if(d.kind==='vector'){title=d.label||'A vector';body=`<div class="formula">${esc(d.label||'v')} = ${equation(d.components)}</div><p>The three numbers multiply î, ĵ and k̂, the fixed Cartesian unit directions. A negative component points opposite its positive axis.</p><p>For an oblique cell, a lattice vector can contribute to more than one Cartesian component. Moving the origin alone does not change a displacement vector.</p>`;}
  else if(d.kind==='plane'){title='The ('+d.indices.join(' ')+') plane';body=`<p>Its fractional intercepts are <strong>${d.indices.map(x=>x?f(1/x):'∞').join(', ')}</strong>. Take reciprocals of the fractional intercepts to obtain the indices. Zero means parallel to that axis.</p><p>The plane normal is h a* + k b* + l c*. It aligns with the direct direction [hkl] only in cubic axes. A translucent patch shows only a bounded part of an infinite plane.</p>`;}
  else if(d.kind==='angle'){title=d.label;body=`<p>${esc(d.text)}</p><p>This is the true angle between the highlighted three-dimensional vectors. Rotating the camera changes its appearance, not its value.</p>`;}
  else if(d.kind==='energy'){title='At r/r₀ = '+f(d.r);body=`<p>Potential energy U = <strong>${f(d.energy)}</strong> and radial force Fᵣ = <strong>${f(d.force)}</strong> in model units.</p><p>The energy minimum gives equilibrium. Fᵣ = −dU/dr: positive is repulsive; negative is attractive.</p>`;}
  else{title=d.label||'A repeating point';body=`<p>${esc(d.text||'This point represents a site in a repeating lattice. Place the same atomic basis at every equivalent site to construct the crystal.')}</p>`;}
  return `<div class="inspect-title"><span class="eyebrow">YOU SELECTED</span><button id="inspect-close" aria-label="Close object explanation">×</button></div><h3>${esc(title)}</h3>${body}`;
 }
 sceneState(mode,state,overlay){
  let result={...state,teaching:overlay};
  if(this.mode==='build'&&this.preview){
   if(this.buildIndex===0)result.teaching={topic:'vectors',vector:[...this.preview],vectorName:'Your a₁',readout:'Your vector: '+equation(this.preview)};
   if(this.buildIndex===1)result.teaching={topic:'placement',point:[...this.preview],readout:'Your atom at '+coords(this.preview)};
   if(this.buildIndex===2)result={...result,indices:[...this.preview],teaching:{topic:'planes',indices:[...this.preview],step:3,readout:'Your plane ('+this.preview.join(' ')+')'}};
  }
  return result;
 }
 readBuild(){const values=[0,1,2].map(i=>document.querySelector('#build-'+i));if(values.some(i=>!i.value||!i.reportValidity()))return null;return values.map(i=>+i.value);}
 handleClick(event){
  const button=event.target.closest('button');if(!button)return;const id=button.id;
  if(button.dataset.learningAnswer!==undefined){const q=this.mode==='review'?this.reviewQuestion:this.question;this.answered=+button.dataset.learningAnswer;this.record(q,this.answered===q.answer);this.render();return;}
  if(button.dataset.review){this.reviewQuestion=this.progress.records[button.dataset.review];this.answered=null;this.render();return;}
  if(id==='build-preview'||id==='build-check'){
   const v=this.readBuild();if(!v)return;this.preview=v;const c=buildChallenges[this.buildIndex];
   if(id==='build-check'){
    const matches=v.map((x,i)=>Math.abs(x-c.target[i])<1e-6),ok=matches.every(Boolean);this.buildFeedback={ok,text:(ok?'Correct. ':`Check ${c.labels.filter((_,i)=>!matches[i]).join(', ')}. `)+esc(c.why)};
    this.record({id:c.id,title:c.title,section:c.section,question:c.question,options:[coords(c.target),coords(c.target.map(x=>x+.25)),coords(c.target.map(x=>-x-1))],answer:0,why:c.why},ok);
   }else this.buildFeedback=null;
   this.api.refresh();this.render();return;
  }
  if(id==='guide-prev'||id==='guide-next'){
   if(id==='guide-prev')this.progress.guide=Math.max(0,this.progress.guide-1);else if(this.progress.guide<guideSteps.length-1)this.progress.guide++;else this.progress.guideComplete=true;
   this.save();this.startGuide();return;
  }
  if(id==='next-prediction'){this.question=predictions[(predictions.indexOf(this.question)+1)%predictions.length];this.answered=null;this.revealed=false;this.render();return;}
  if(id==='show-prediction'){
   const map={'predict-order':{section:'crystalline',mode:'translation',page:1,patch:{shift:1}},'predict-origin':{section:'definitions',mode:'lattice',page:2,teach:{enabled:true,topic:'origin',origin:[.5,.5,.5]}},'predict-angle':{section:'systems',mode:'systems',page:7,patch:{system:'Hexagonal'},teach:{enabled:true,topic:'angles',angle:'gamma'}},'predict-neighbors':{section:'structures',mode:'structures',page:17,patch:{structure:'Diamond'},teach:{enabled:true,topic:'neighbors'}},'predict-sharing':{section:'packing',mode:'packing',page:13,teach:{enabled:true,topic:'counting',step:2}},'predict-spacing':{section:'spacing',mode:'spacing',page:27,patch:{indices:[2,2,0]}},'predict-forces':{section:'forces',mode:'forces',page:32,patch:{distance:1.2}},'predict-madelung':{section:'madelung',mode:'madelung',page:40,patch:{dimension:2,shells:4}}};
   this.revealed=true;this.setup(map[this.question.id]);return;
  }
  if(id==='review-back'){this.reviewQuestion=null;this.answered=null;this.render();return;}
  if(id==='review-diagram'){this.api.navigate(this.reviewQuestion.section);this.activate('explain');return;}
  if(id==='clear-progress'){this.progress.records={};this.save();this.render();return;}
  if(id==='inspect-close'){this.detail=null;this.render();return;}
  if(id==='inspect-neighbors'){this.api.teaching.setSelection(this.detail.p);this.render();return;}
  if(id==='inspect-expand'){this.api.teaching.setSelection(this.detail.p);this.api.patch({repeat:!this.context.state.repeat});this.render();return;}
 }
}
