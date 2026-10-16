export function ionicTransfer(time){const phase=(time%6)/6,stage=phase<.25?'neutral':phase<.65?'transfer':'ions';return {stage,progress:Math.max(0,Math.min(1,(phase-.25)/.4)),na:stage==='neutral'?11:10,cl:stage==='ions'?18:17,free:stage==='transfer'?1:0};}
export function pathPoint(points,fraction){if(points.length<2)return points[0]||[0,0,0];const u=Math.max(0,Math.min(.999999,fraction))*(points.length-1),i=Math.floor(u),t=u-i;return points[i].map((v,k)=>v+(points[i+1][k]-v)*t);}
export class MotionClock{
 constructor(paused=false){this.paused=paused;this.time=0;this.speed=1;this.last=null;}
 tick(now,visible=true){const dt=this.last===null?0:Math.max(0,Math.min((now-this.last)/1000,.05));this.last=now;if(!this.paused&&visible)this.time+=dt*this.speed;return !this.paused&&visible&&dt>0;}
 step(){this.paused=true;this.time+=.25;}
}
export class StudyMotion{
 constructor(stage,onChange){this.stage=stage;this.onChange=onChange;this.clock=new MotionClock(matchMedia('(prefers-reduced-motion:reduce)').matches);this.active=false;this.key='';this.note='Slowed teaching model';
  this.bar=document.createElement('div');this.bar.className='study-motion';this.bar.hidden=true;this.bar.innerHTML='<div class="study-motion-actions" role="group" aria-label="Simulation playback"><button data-motion="play"></button><button data-motion="step">Step →</button><button data-motion="reset">Restart</button><label>Speed <select aria-label="Simulation speed"><option value=".25">0.25×</option><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div><p class="study-motion-status"></p>';stage.before(this.bar);
  this.bar.onclick=e=>{const action=e.target.closest('[data-motion]')?.dataset.motion;if(action==='play')this.toggle();if(action==='step'){this.clock.step();this.changed();}if(action==='reset'){this.clock.time=0;this.changed();}};this.bar.querySelector('select').onchange=e=>{this.clock.speed=+e.target.value;this.changed();};matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',e=>{if(e.matches){this.clock.paused=true;this.changed();}});
 }
 configure(key,active,note){if(key!==this.key){this.key=key;this.clock.time=0;}this.active=active;this.note=note;this.bar.hidden=!active;this.update();}
 toggle(){this.clock.paused=!this.clock.paused;this.changed();}
 changed(){this.update();this.onChange?.();}
 restart(){this.clock.time=0;this.update();}
 tick(now,visible){const changed=this.clock.tick(now,visible&&this.active);if(changed)this.update();return changed;}
 update(){const b=this.bar.querySelector('[data-motion="play"]');b.textContent=this.clock.paused?'▷ Play':'Ⅱ Pause';b.setAttribute('aria-pressed',String(!this.clock.paused));b.setAttribute('aria-label',this.clock.paused?'Play simulation':'Pause simulation');this.stage.dataset.motionTime=this.clock.time.toFixed(4);this.bar.querySelector('p').textContent=(this.clock.paused?'Paused · ':'Playing · ')+(typeof this.note==='function'?this.note(this.clock.time):this.note);}
}
