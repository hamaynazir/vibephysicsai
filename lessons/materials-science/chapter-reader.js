import {allLessons} from '../../catalog.js?v=materials-3';
import {createScrollReader} from '../../scrolling-reader.js';
import '../../reader-navigation.js?v=materials-3';
import {installLectureReview} from '../../lecture-review.js?v=materials-3';
import {mathMarkup} from '../../formula-notation.js';
import {StudyMotion} from '../../study-motion.js?v=speed-4';
import {sections as engineering} from './engineering-materials/content.js';
import {sections as mechanical} from './mechanical-properties-of-metals/content.js';
import {engineeringModels,mechanicalModels,formatValue} from './chapter-models.js';
import {renderDiagram} from './chapter-visuals.js';
import {calculationExercises} from './chapter-practice.js';

const $=selector=>document.querySelector(selector);
const chapter=allLessons().find(lesson=>lesson.id===document.body.dataset.lesson);
const second=chapter.number==='02';
const sections=second?engineering:mechanical;
const models=second?engineeringModels:mechanicalModels;
const practice=calculationExercises[chapter.number];
const storage={
  get(key){try{return localStorage.getItem(key);}catch{return null;}},
  set(key,value){try{localStorage.setItem(key,value);}catch{}}
};
function readMemory(){
  try{return JSON.parse(storage.get(chapter.storage.learning))??{};}catch{return {};}
}
const stored=readMemory(), answers=stored.answers??{}, calculations=stored.calculations??{};
function save(){
  storage.set(chapter.storage.learning,JSON.stringify({answers,calculations}));
  $('#review-count').textContent=Object.values(answers).some(result=>result===false)?'Review saved questions in Chapter review.':'';
}
const sectionSelect=$('#visual-section'), pageInput=$('#page-input');
let current, state, page=1, zoom=1, sync=true;
const settings=new Map();
const motion=new StudyMotion($('#visual-stage'),updateModel);
motion.clock.paused=true;
const reading=createScrollReader(chapter.pages,value=>go(value,false));
const sectionFor=value=>sections.find(item=>value>=item.page&&value<=item.end)??sections[0];
const clamp=value=>Math.max(1,Math.min(chapter.pages,Math.floor(Number(value))||1));
function go(value,jump=true,selected){
  page=clamp(value);
  if(jump)reading.go(page);
  if(selected)selectSection(selected);
  else if(!current||(sync&&(current.page>page||current.end<page)))selectSection(sectionFor(page));
  pageInput.value=page;
  $('#prev-page').disabled=page===1;
  $('#next-page').disabled=page===chapter.pages;
  $('#page-context').textContent='LECTURE PAGE '+page+' / '+chapter.pages;
  storage.set('study-library-last-lesson',chapter.id);
  storage.set(chapter.storage.page,String(page));
  const hash='#page='+page+'&topic='+current.id;
  if(location.hash!==hash)history.replaceState(null,'',hash);
}
function jumpSection(section){if(section)go(section.page,true,section);}

function renderIndex(){
  const filter=$('#section-search').value.trim().toLowerCase();
  const toc=$('#toc');
  toc.replaceChildren();
  for(const [i,section] of sections.entries()){
    if(!section.title.toLowerCase().includes(filter))continue;
    const link=document.createElement('a');
    link.href='#page='+section.page+'&topic='+section.id;
    const ordinal=document.createElement('span');
    ordinal.className='toc-num';
    ordinal.textContent=String(i+1).padStart(2,'0');
    link.append(ordinal,section.title);
    if(section===current){link.className='active';link.setAttribute('aria-current','true');}
    link.onclick=event=>{event.preventDefault();jumpSection(section);drawer(false);};
    toc.append(link);
  }
}
function selectSection(section){
  if(current===section)return;
  current=section;
  sectionSelect.value=section.id;
  $('#lab-title').textContent=section.title;
  $('#section-label').textContent=section.title;
  $('#lab-description').textContent=section.description;
  const i=sections.indexOf(section);
  $('#visual-previous').disabled=i===0;
  $('#visual-next').disabled=i===sections.length-1;
  $('#next-topic').disabled=i===sections.length-1;
  const notes=$('#model-notes');
  notes.replaceChildren();
  for(const note of section.notes){
    const p=document.createElement('p');p.textContent=note;notes.append(p);
  }
  if(section.equation){
    const formula=document.createElement('div');
    formula.className='model-math';formula.innerHTML=mathMarkup(section.equation);
    notes.append(formula);
  }
  const model=models[section.id];
  state=settings.get(section.id)??Object.fromEntries(model.controls.map(field=>[field.id,field.value]));
  settings.set(section.id,state);
  motion.clock.paused=true;
  motion.configure(section.id,Boolean(model.duration),'Teaching model · time advances during playback');
  motion.restart();
  renderControls();
  renderIndex();
  showExercise(section.id);
}
function renderControls(){
  const group=$('#controls');group.replaceChildren();
  for(const field of models[current.id].controls){
    const label=document.createElement('label');
    label.append(field.label);
    const input=document.createElement(field.options?'select':'input');
    const output=document.createElement('output');
    if(field.options)for(const option of field.options)input.add(new Option(option,option));
    else Object.assign(input,{type:'range',min:field.min,max:field.max,step:field.step});
    input.value=state[field.id];input.dataset.key=field.id;
    if(!field.options)output.textContent=formatValue(Number(input.value),5);
    input.oninput=()=>{
      state[field.id]=field.options?input.value:Number(input.value);
      if(!field.options)output.textContent=formatValue(state[field.id],5);
      if(field.id==='phase')motion.restart();
      updateModel();
    };
    label.append(input);
    if(!field.options)label.append(output);
    group.append(label);
  }
  updateModel();
}
function updateModel(){
  if(!current)return;
  const view=models[current.id], t=Math.min(motion.clock.time,view.duration||Infinity);
  const result=view.evaluate(state,t);
  renderDiagram($('#scene'),result);
  $('#metrics').replaceChildren(...result.metrics.map(([value,label])=>{
    const metric=document.createElement('div'), strong=document.createElement('strong'), small=document.createElement('small');
    metric.className='metric';strong.textContent=value;small.textContent=label;
    metric.append(strong,small);return metric;
  }));
  if($('#insight').textContent!==result.detail)$('#insight').textContent=result.detail;
}
function showExercise(topic){
  const form=$('#numeric-practice'), menu=$('#exercise-picker');
  menu.value=practice.some(item=>item.id===topic)?topic:practice[0].id;
  function display(){
    const selected=practice.find(item=>item.id===menu.value);
    $('#exercise-prompt').textContent=selected.question;
    $('#exercise-unit').textContent=selected.unit;
    $('#exercise-solution').innerHTML=mathMarkup(selected.equation);
    $('#worked-solution').open=false;
    $('#exercise-answer').value='';
    $('#exercise-feedback').textContent=calculations[selected.id]===true?'Previously checked correctly.':'';
  }
  menu.onchange=display;
  form.onsubmit=event=>{
    event.preventDefault();
    const item=practice.find(item=>item.id===menu.value);
    const result=Math.abs(Number($('#exercise-answer').value)-item.answer)<=item.tolerance;
    calculations[item.id]=result;save();
    $('#exercise-feedback').textContent=result?'Correct.':'Check the units and try again. You can open the worked solution.';
  };
  display();
}
function drawer(open){
  document.body.classList.toggle('chapters-open',open);
  $('#chapter-sidebar').inert=!open;
  $('#workspace').inert=open;
  $('#chapter-shade').hidden=!open;
  $('#chapters-toggle').setAttribute('aria-expanded',String(open));
  if(open)$('#section-search').focus();
  else if($('#chapter-sidebar').contains(document.activeElement))$('#chapters-toggle').focus();
}
$('#chapters-toggle').onclick=()=>drawer($('#chapter-sidebar').inert);
$('#chapter-shade').onclick=()=>drawer(false);
$('#section-search').oninput=renderIndex;
$('#help').onclick=()=>$('#help-dialog').showModal();
$('#close-help').onclick=()=>$('#help-dialog').close();
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('#chapter-sidebar').inert)drawer(false);
});
for(const tab of document.querySelectorAll('button[data-panel]'))tab.onclick=()=>{
  $('#workspace').dataset.panel=tab.dataset.panel;
  for(const other of document.querySelectorAll('button[data-panel]')){
    other.classList.toggle('active',tab===other);
    other.setAttribute('aria-pressed',String(tab===other));
  }
};
sections.forEach(section=>sectionSelect.add(new Option(section.title,section.id)));
for(const exercise of practice)$('#exercise-picker').add(new Option(sections.find(section=>section.id===exercise.id).title,exercise.id));
sectionSelect.onchange=()=>jumpSection(sections.find(section=>section.id===sectionSelect.value));
$('#visual-previous').onclick=()=>jumpSection(sections[sections.indexOf(current)-1]);
$('#next-topic').onclick=$('#visual-next').onclick=()=>jumpSection(sections[sections.indexOf(current)+1]);
pageInput.onchange=()=>go(pageInput.value);
pageInput.onkeydown=event=>{if(event.key==='Enter')go(pageInput.value);};
$('#prev-page').onclick=()=>go(page-1);
$('#next-page').onclick=()=>go(page+1);
$('#sync').onclick=()=>{
  sync=!sync;
  $('#sync').setAttribute('aria-pressed',String(sync));
  $('#sync').textContent=sync?'Sync on':'Sync off';
  $('#sync-label').textContent=sync?'Diagrams follow your page':'Keep this diagram while reading';
  if(sync)go(page,false,sectionFor(page));
};
for(const [id,direction] of [['zoom-in',1],['zoom-out',-1]])$('#'+id).onclick=()=>{
  zoom=Math.min(1.8,Math.max(.7,Math.round((zoom+direction*.1)*10)/10));
  $('#zoom-label').textContent=zoom===1?'Fit':Math.round(zoom*100)+'%';
  reading.zoom(zoom);
};
$('#reset').onclick=()=>{
  for(const field of models[current.id].controls)state[field.id]=field.value;
  motion.clock.paused=true;motion.restart();renderControls();
};
function restore(){
  const route=new URLSearchParams(location.hash.slice(1));
  const target=sections.find(section=>section.id===route.get('topic'));
  const position=route.get('page')||target?.page||storage.get(chapter.storage.page)||1;
  go(position,true,target??sectionFor(clamp(position)));
}
restore();
installLectureReview(sections,topic=>answers[topic.id],(topic,value)=>{answers[topic.id]=value;save();});
window.addEventListener('hashchange',restore);
motion.bar.addEventListener('click',event=>{
  if(event.target.matches('[data-motion=play]')&&motion.clock.time>=models[current.id].duration)motion.restart();
},true);
document.body.classList.add('chapter-simulation');
function animate(now){
  if(motion.active&&!motion.clock.paused){
    const stage=$('#visual-stage').getBoundingClientRect();
    if(motion.tick(now,stage.height>0&&stage.top<innerHeight&&stage.bottom>0&&!document.hidden)){
      if(motion.clock.time>=models[current.id].duration){
        motion.clock.paused=true;motion.changed();
      }else updateModel();
    }
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
