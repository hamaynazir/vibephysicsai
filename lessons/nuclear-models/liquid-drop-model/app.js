
import {createScrollReader} from '../../../scrolling-reader.js';
import {installReaderNavigation} from '../../../reader-navigation.js';
import {chapters,modes,defaults,beats,presets,pageTopic,anchors} from './content.js';
import {inModel,liquidDrop,loadRecords,parabola} from './model.js';
import {name,option,views} from './views.js';
import {SceneMotion} from './scene-motion.js';

const $=selector=>document.querySelector(selector);
const maxPage=18, book='study:nuclear-models:liquid-drop-model:page';
const lesson='nuclear-liquid-drop-model';
const memory=new Map();
let page=1, topic='binding', linkedPreset='', guideIndex=-1, guideOrigin=null;
let state={...defaults[topic]}, currentView, data, reader, sync=true, pointer;
let guideTimer=null;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const sceneMotion=new SceneMotion($('#scene'),()=>reduceMotion.matches,()=>Number($('#guide-speed').value));
const emptyData={records:[],get:()=>null,stableCounts:['Unavailable','Unavailable','Unavailable','Unavailable'],baseline:new Map()};
const onePage=(value,fallback=1)=>Math.max(1,Math.min(maxPage,Math.round(Number(value)||fallback)));
function urlFor(p,t,preset) {
  return '#'+new URLSearchParams({page:p,topic:t,...(preset?{preset}:{})});
}
function save(){
  try{
    localStorage.setItem(book,String(page));
    localStorage.setItem('study-library-last-lesson',lesson);
  }catch{}
}
function readHash(){
  const params=new URLSearchParams(location.hash.slice(1));
  const t=params.get('topic'), preset=params.get('preset');
  let recent=1;
  if(!params.has('page'))try{recent=Number(localStorage.getItem(book))||1;}catch{}
  const requested=Object.hasOwn(presets,preset)?presets[preset]:null;
  const p=onePage(params.get('page'),requested?.[1]??recent);
  return {p,t:requested?.[0]??(Object.hasOwn(defaults,t)?t:pageTopic(p)),preset:requested?preset:''};
}
function route({p,t,preset=''},{historyMode='push',scroll=true}={}){
  pauseGuide();
  pointer=null;
  if(topic!==t||preset){
    if(!preset&&topic!==t)memory.set(topic,state);
    topic=t;
    state=preset?{...defaults[t],...presets[preset][2]}:memory.get(t)||{...defaults[t]};
    endGuide();
    $('.companion').scrollTop=0;
    $('#calculation').open=false;
  }
  const change=page!==p;
  page=p; linkedPreset=preset; save();
  $('#page-input').value=page;
  $('#prev-page').disabled=page===1;
  $('#next-page').disabled=page===maxPage;
  if(historyMode&&location.hash!==urlFor(page,topic,linkedPreset)){
    history[historyMode+'State']({},'',urlFor(page,topic,linkedPreset));
  }
  if(scroll&&(change||historyMode===null))reader?.go(page);
  render();
}
function section(index) {
  const ch=chapters[index];
  if(ch)route({p:ch.page,t:ch.id});
}
function changePage(p) {
  route({p,t:sync?pageTopic(p):topic});
}
function endGuide(){
  pauseGuide();
  guideIndex=-1;
  guideOrigin=null;
}
function goBeat(beat) {
  guideOrigin??={...state};
  guideIndex=beat;
  const [mode,focus,patch]=beats[topic][guideIndex];
  state={...guideOrigin,...patch,mode,focus};
  render();
}
function pauseGuide(){
  if(guideTimer!==null)clearTimeout(guideTimer);
  guideTimer=null;
  $('#guide-play').textContent='▶ Play';
  $('#guide-play').setAttribute('aria-label','Play explanation');
  $('#guide-play').setAttribute('aria-pressed','false');
}
function scheduleGuide(){
  if(guideIndex>=beats[topic].length-1){pauseGuide();return;}
  guideTimer=setTimeout(()=>{
    goBeat(guideIndex+1);
    scheduleGuide();
  },4200/Number($('#guide-speed').value));
  $('#guide-play').textContent='Ⅱ Pause';
  $('#guide-play').setAttribute('aria-label','Pause explanation');
  $('#guide-play').setAttribute('aria-pressed','true');
}
function setState(patch,message='',immediate=false){
  const exitParabolaGuide=guideIndex>=0&&topic==='parabolas';
  endGuide();
  if(linkedPreset){
    linkedPreset='';
    history.replaceState({},'',urlFor(page,topic,''));
  }
  state={...state,...(exitParabolaGuide?{focus:''}:{}),...patch};
  render(immediate);
  if(message)$('#feedback').textContent=message;
}
function render(immediate=false) {
  if(!data)return;
  const focused=document.activeElement, focusedField=focused.dataset.key;
  const focusedChart=focused.classList.contains('selectable-chart');
  const focusedAction=focused.dataset.action;
  const index=chapters.findIndex(c=>c.id===topic), ch=chapters[index];
  const shownData=loadedData===false?emptyData:data;
  currentView=views[topic](state,shownData);
  $('#title').textContent=ch.title;
  $('#description').textContent=ch.text;
  $('#visual-section').value=topic;
  $('#visual-previous').disabled=index===0;
  $('#visual-next').disabled=index===chapters.length-1;
  $('#view').innerHTML=Object.entries(modes[topic]).map(([v,l])=>option(v,l,state.mode)).join('');
  sceneMotion.replace(currentView.graphic,[topic,state.mode,currentView.motionKey].join(':'),immediate);
  $('#proton-controls').hidden=topic!=='parabolas';
  if(topic==='parabolas'){
    const scrub=$('#proton-scrub');
    scrub.max=state.A;
    scrub.value=state.Z;
    scrub.setAttribute('aria-valuetext','Z '+state.Z+' of '+state.A);
    $('#proton-value').value=state.Z;
  }
  $('#reading').textContent=currentView.caption;
  $('#controls').innerHTML=currentView.choices;
  $('#scene-actions').innerHTML=currentView.actions+(currentView.readings||'');
  $('#math').innerHTML=currentView.math;
  $('#feedback').textContent=loadedData===false?'AME2020/NUBASE2020 data could not be loaded. Model calculations remain available.':'';
  const scenes=beats[topic];
  $('#guide-step').innerHTML=option('-1','Explore',String(guideIndex))+scenes.map((_,i)=>option(String(i),`Step ${i+1} / ${scenes.length}`,String(guideIndex))).join('');
  $('#guide-prev').disabled=guideIndex<=0;
  $('#guide-next').disabled=guideIndex>=scenes.length-1;
  $('#guide-play').hidden=$('#guide-speed').parentElement.hidden=reduceMotion.matches;
  $('#narration').hidden=guideIndex<0;
  $('#narration').textContent=guideIndex<0?'':scenes[guideIndex][3];
  if(focusedField)$('[data-key="'+focusedField+'"]')?.focus({preventScroll:true});
  if(focusedChart)$('.selectable-chart')?.focus({preventScroll:true});
  if(focusedAction)$('[data-action="'+focusedAction+'"]')?.focus({preventScroll:true});
}
function parseNuclide(input) {
  const code=input.toLowerCase().replace(/[\s‐‑–—-]/g,'');
  if(code==='neutron')return data.get(1,0);
  return data.records.find(r=>r.symbol.toLowerCase()+r.A===code||r.A+r.symbol.toLowerCase()===code);
}
function fieldChanged(event){
  const field=event.target;
  const k=field.dataset.key;
  if(!k)return;
  let v=field.type==='checkbox'?field.checked:field.value;
  if(k==='nuclide'){
    const record=parseNuclide(v);
    if(record)setState({A:record.A,Z:record.Z,removed:false});
    else {
      field.value=name(data.get(state.A,state.Z));
      $('#feedback').textContent='That nuclide is unavailable. Try an element and mass number, such as O-16.';
    }
    return;
  }
  if(field.type==='number'){
    if(!field.validity.valid||field.value===''){
      field.value=state[k];
      $('#feedback').textContent=`Enter an integer from ${field.min} to ${field.max}.`;
      return;
    }
    v=Number(v);
  }
  const patch={[k]:v};
  if(k==='A'&&state.Z>v)patch.Z=v;
  let message=patch.Z!==undefined&&k==='A'?`Z was adjusted to ${v} because Z cannot exceed A.`:'';
  if(topic==='separation'){
    patch.removed=false;
    if(k==='source'&&v==='model'&&!inModel(state.A,state.Z)){
      patch.A=Math.max(5,Math.min(250,state.A));
      patch.Z=Math.min(state.Z,patch.A);
      message='The parent was moved to the model range A = 5–250.';
    }
  }
  if(topic==='parabolas'&&k==='A'&&Math.abs((patch.Z??state.Z)-parabola(v).vertex)>6){
    patch.Z=Math.round(parabola(v).vertex);
    message=`Selected Z = ${patch.Z}, near the new smooth minimum.`;
  }
  setState(patch,message);
}
function openPreset(id){
  const [t,p]=presets[id];
  route({p,t,preset:id});
}
function choosePoint(A,Z,immediate=false){
  if(A===state.A&&Z===state.Z)return;
  if((topic==='drop'||topic==='parabolas'||(topic==='separation'&&state.source==='model'))&&!inModel(A,Z)){
    $('#feedback').textContent='This plotted nuclide lies outside the interactive model range A = 5–250.';
    return;
  }
  const mode=topic==='binding'&&state.mode==='mirror'?'ledger':state.mode;
  setState({A,Z,mode,removed:false},'',immediate);
}
function clickControls(event){
  const button=event.target.closest('button[data-preset],button[data-action]');
  if(!button)return;
  if(button.dataset.preset){openPreset(button.dataset.preset);return;}
  const action=button.dataset.action;
  if(action==='remove'&&currentView.canRemove)setState({removed:!state.removed});
  if(action==='grow'){
    const A=Math.min(250,2*state.A);
    setState({A,Z:Math.round(A*state.Z/state.A)});
  }
  if(action==='neutron-excess'&&state.Z>0)setState({Z:state.Z-1});
  const parityPresets={'even-even':[40,20],'odd-a':[39,19],'odd-odd':[38,19]};
  if(parityPresets[action]){
    const [A,Z]=parityPresets[action]; setState({A,Z});
  }
}
function focusPlotPoint(event) {
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  const rows=currentView.points;
  if(!rows.length)return;
  event.preventDefault();
  const index=rows.findIndex(r=>r.A===state.A&&r.Z===state.Z);
  const forward=['ArrowRight','ArrowUp'].includes(event.key);
  const i=event.key==='Home'?0:event.key==='End'?rows.length-1:Math.max(0,Math.min(rows.length-1,index+(forward?1:-1)));
  choosePoint(rows[i].A,rows[i].Z);
}
$('#scene').addEventListener('click',event=>{
  const target=event.target.closest('[data-nuclide]');
  if(target)choosePoint(...target.dataset.nuclide.split(',').map(Number));
});
$('#scene').addEventListener('keydown',event=>{
  if(event.target.classList.contains('selectable-chart'))focusPlotPoint(event);
});
$('#scene').addEventListener('pointerdown',event=>{
  if(event.button!==0||pointer)return;
  const token=event.target.closest('[data-token]');
  if(token&&!state.removed&&currentView.canRemove){
    sceneMotion.finish();
    pointer={id:event.pointerId,x:event.clientX,token};
    $('#scene').setPointerCapture(event.pointerId);
  }else{
    const chart=event.target.closest('.selectable-chart');
    if(chart&&currentView.points.length){
      const bounds=chart.getBoundingClientRect();
      const available=new Set(currentView.points.map(row=>row.A+','+row.Z));
      const points=[...chart.querySelectorAll('circle[data-nuclide]:not([data-motion])')].filter(point=>available.has(point.dataset.nuclide)).map(point=>({
        x:Number(point.getAttribute('cx')),
        y:Number(point.getAttribute('cy')),
        composition:point.dataset.nuclide.split(',').map(Number),
      }));
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,bounds,points,last:-Infinity};
    }
  }
});
function scrubChart(event,drag){
  const {bounds,points}=drag;
  if(!points.length)return;
  const x=(event.clientX-bounds.left)*520/bounds.width;
  const y=(event.clientY-bounds.top)*285/bounds.height;
  let nearest, distance=Infinity;
  for(const point of points){
    const d=(point.x-x)**2+(point.y-y)**2;
    if(d<distance){nearest=point;distance=d;}
  }
  choosePoint(...nearest.composition,true);
}
$('#scene').addEventListener('pointermove',event=>{
  if(pointer?.id!==event.pointerId)return;
  if(!pointer.token){
    if(!pointer.active&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)<6)return;
    if(!pointer.active){
      pointer.active=true;
      sceneMotion.finish();
      $('#scene').setPointerCapture(event.pointerId);
    }
    if(event.timeStamp-pointer.last>=60){
      pointer.last=event.timeStamp;
      scrubChart(event,pointer);
    }
    return;
  }
  const svg=$('#scene svg');
  const px=(event.clientX-pointer.x)*520/svg.getBoundingClientRect().width;
  pointer.token.setAttribute('transform','translate('+Math.max(0,Math.min(124,px))+' 0)');
});
$('#scene').addEventListener('pointerup',event=>{
  if(pointer?.id!==event.pointerId)return;
  const drag=pointer;
  pointer=null;
  if(!drag.token){
    if(drag.active)scrubChart(event,drag);
    return;
  }
  const bounds=$('#scene svg').getBoundingClientRect();
  const x=(event.clientX-bounds.left)/bounds.width;
  const y=(event.clientY-bounds.top)/bounds.height;
  if(x>=.61&&x<=.92&&y>=.15&&y<=.49)setState({removed:true});
  else drag.token.removeAttribute('transform');
});
$('#scene').addEventListener('pointercancel',()=>{
  pointer?.token?.removeAttribute('transform');pointer=null;
});
window.addEventListener('pointerup',event=>{if(pointer?.id===event.pointerId)pointer=null;});
$('#companion').addEventListener('change',fieldChanged);
$('#proton-scrub').addEventListener('input',event=>choosePoint(state.A,Number(event.target.value)));
$('#scene-actions').addEventListener('click',clickControls);
$('#view').addEventListener('change',event=>setState({mode:event.target.value,focus:topic==='drop'?state.focus:''}));
$('#reset').onclick=()=>{setState({...defaults[topic],channel:undefined,shells:undefined});};
$('#guide-next').onclick=()=>{pauseGuide();goBeat(guideIndex+1);};
$('#guide-prev').onclick=()=>{pauseGuide();goBeat(guideIndex-1);};
$('#guide-reset').onclick=()=>{
  setState({...defaults[topic],channel:undefined,shells:undefined},'',true);
  goBeat(0);
  sceneMotion.replay();
};
$('#guide-step').onchange=event=>{
  pauseGuide();
  if(Number(event.target.value)<0)setState(guideOrigin??{});
  else goBeat(Number(event.target.value));
};
$('#guide-play').onclick=()=>{
  if(guideTimer!==null){pauseGuide();sceneMotion.pause();return;}
  if(guideIndex<0||guideIndex===beats[topic].length-1){
    goBeat(0);
    sceneMotion.replay();
  }
  sceneMotion.resume();
  scheduleGuide();
};
$('#guide-speed').onchange=()=>{
  if(guideTimer!==null){pauseGuide();scheduleGuide();}
};
function settleScene(){
  pauseGuide();
  sceneMotion.finish();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)settleScene();});
window.addEventListener('pagehide',settleScene);
reduceMotion.addEventListener('change',()=>{settleScene();render();});
$('#visual-section').innerHTML=chapters.map(ch=>option(ch.id,ch.title)).join('');
$('#visual-section').onchange=event=>section(chapters.findIndex(ch=>ch.id===event.target.value));
$('#visual-previous').onclick=()=>section(chapters.findIndex(ch=>ch.id===topic)-1);
$('#visual-next').onclick=()=>section(chapters.findIndex(ch=>ch.id===topic)+1);
$('#page-input').onchange=event=>changePage(onePage(event.target.value,page));
$('#prev-page').onclick=()=>changePage(onePage(page-1));
$('#next-page').onclick=()=>changePage(onePage(page+1));
$('#sync').onclick=()=>{
  sync=!sync;
  $('#sync').setAttribute('aria-pressed',String(sync));
  $('#sync').textContent=sync?'Sync on':'Sync off';
  if(sync)changePage(page);
};
$('#sections-button').onclick=()=>$('#sections-dialog').showModal();
$('#close-sections').onclick=()=>$('#sections-dialog').close();
$('#section-links').innerHTML=chapters.map(ch=>`<p><a href="${urlFor(ch.page,ch.id,'')}">${ch.title}</a></p>`).join('');
$('#section-links').addEventListener('click',()=>$('#sections-dialog').close());
$('#anchors').innerHTML=anchors.map(([p,label,t,id])=>`<li><a href="${urlFor(p,t,id)}">PDF p. ${p} · ${label}</a></li>`).join('');
document.querySelectorAll('.mobile-tabs button').forEach(button=>button.onclick=()=>{
  document.querySelectorAll('.mobile-tabs button').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));
  $('.workspace').dataset.panel=button.dataset.panel;
  if(button.dataset.panel==='manual'){
    settleScene();
    requestAnimationFrame(()=>reader?.go(page));
  }
});
window.addEventListener('hashchange',()=>route(readHash(),{historyMode:null}));
const navigation=$('.visual-navigation');
navigation.dataset.lesson=lesson;
installReaderNavigation(navigation);

let loadedData=true;
try{
  const response=await fetch('assets/ame2020-nubase2020.json');
  if(!response.ok)throw Error('Mass table unavailable');
  data=loadRecords(await response.json());
  data.baseline=new Map(data.records.filter(r=>inModel(r.A,r.Z)).map(r=>[r.key,liquidDrop(r.A,r.Z).B]));
  const list=document.createElement('datalist');
  list.id='nuclide-options';
  for(const r of data.records)list.append(new Option('',name(r)));
  document.body.append(list);
}catch{
  data=emptyData;
  loadedData=false;
}
reader=createScrollReader(maxPage,p=>{
  if(p===page)return;
  route({p,t:sync?pageTopic(p):topic},{historyMode:'replace',scroll:false});
});
route(readHash(),{historyMode:null});
