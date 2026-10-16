// Shared PDF-free simulation focus view. Does not write progress or recreate models.
const stylesheet=new URL('./simulation-fullscreen.css',import.meta.url);
if(!document.querySelector('link[data-simulation-fullscreen]')){const link=document.createElement('link');link.rel='stylesheet';link.href=stylesheet.href;link.dataset.simulationFullscreen='';document.head.append(link);}

export function installSimulationFullscreen(){
 const panel=document.querySelector('.lab-panel, .companion');
 if(!panel||!panel.querySelector('#scene')||document.querySelector('#simulation-fullscreen'))return false;
 const header=document.querySelector('.header-actions, .header-buttons')||document.querySelector('header');
 if(!header)return false;
 const button=document.createElement('button');button.id='simulation-fullscreen';button.type='button';button.className='simulation-fullscreen-button';button.textContent='⛶ Full-screen simulation';button.setAttribute('aria-label','Full-screen simulation');button.setAttribute('aria-expanded','false');
 header.append(button);
 const toolbar=document.createElement('div');toolbar.className='simulation-focus-toolbar';toolbar.hidden=true;
 const title=document.createElement('span');title.textContent='Simulation view · PDF hidden';
 const exitButton=document.createElement('button');exitButton.type='button';exitButton.textContent=location.pathname.includes('/laboratories/')?'← Back to manual':'← Back to lecture';exitButton.setAttribute('aria-label','Exit full-screen simulation');
 toolbar.append(title,exitButton);panel.prepend(toolbar);
 const scrollArea=panel.querySelector('.lab-scroll')||panel;
 let active=false,previousFocus=null,scrollTop=0,previousOverflow='',previousScroll=null,hiddenSiblings=[],session=0;
 const resize=()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>window.dispatchEvent(new Event('resize'))));};
 function restore(){
  if(!active)return;active=false;session++;
  panel.classList.remove('simulation-focus');document.body.classList.remove('simulation-focus-open');toolbar.hidden=true;button.setAttribute('aria-expanded','false');document.body.style.overflow=previousOverflow;
  for(const [node,inert]of hiddenSiblings)node.inert=inert;hiddenSiblings=[];
  scrollArea.scrollTop=scrollTop;
  if(previousScroll)window.scrollTo({left:previousScroll.x,top:previousScroll.y,behavior:'instant'});
  resize();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 }
 async function exit(){const ownsNative=document.fullscreenElement===panel;restore();if(ownsNative&&document.exitFullscreen)try{await document.exitFullscreen();}catch{} }
 async function enter(){
  if(active)return;active=true;const token=++session;previousFocus=document.activeElement;scrollTop=scrollArea.scrollTop;previousScroll={x:scrollX,y:scrollY};previousOverflow=document.body.style.overflow;
  // Make only branches outside the active panel inert, without moving/rebuilding it.
  let branch=panel;while(branch.parentElement&&branch!==document.body){for(const sibling of branch.parentElement.children){if(sibling!==branch&&sibling instanceof HTMLElement){hiddenSiblings.push([sibling,sibling.inert]);sibling.inert=true;}}branch=branch.parentElement;}
  panel.classList.add('simulation-focus');document.body.classList.add('simulation-focus-open');document.body.style.overflow='hidden';toolbar.hidden=false;button.setAttribute('aria-expanded','true');scrollArea.scrollTop=0;resize();exitButton.focus({preventScroll:true});
  // Fullscreen API is optional (e.g. mobile Safari/embedded previews). CSS focus remains usable.
  if(panel.requestFullscreen&&!document.fullscreenElement)try{await panel.requestFullscreen();if(!active||token!==session){if(document.fullscreenElement===panel)await document.exitFullscreen();}}catch{}
 }
 button.onclick=enter;exitButton.onclick=exit;
 document.addEventListener('fullscreenchange',()=>{if(active&&document.fullscreenElement!==panel)restore();resize();});
 document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();exit();return;}if(e.key==='Tab'){
  const focusable=[...panel.querySelectorAll('button,select,input,textarea,a[href],summary,[tabindex]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length&&!el.closest('[hidden],[inert]'));
  const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }},true);
 return true;
}
if(!installSimulationFullscreen()){const observer=new MutationObserver(()=>{if(installSimulationFullscreen())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
