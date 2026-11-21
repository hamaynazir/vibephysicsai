const numericAttributes = ['cx','cy','r','x1','x2','y1','y2','width','opacity','stroke-dashoffset'];
const clamp = n => Math.min(1,Math.max(0,n));

function read(element,key) {
  if(key==='translate')return Number(element.getAttribute('transform')?.match(/^translate\(([-\d.]+)/)?.[1]??0);
  return Number(element.getAttribute(key));
}
function write(element,key,value) {
  if(key==='translate')element.setAttribute('transform','translate('+value+' 0)');
  else element.setAttribute(key,value);
}
function elements(scene){
  return scene.querySelectorAll('[data-motion]');
}

export class SceneMotion {
  constructor(scene, reduced, speed) {
    this.scene=scene;
    this.reduced=reduced;
    this.speed=speed;
    this.tracks=[];
    this.frame=0;
    this.elapsed=0;
    this.last=null;
  }

  replace(markup,key,immediate=false) {
    if(markup===this.markup&&key===this.key)return;
    const prior=new Map();
    if(key===this.key){
      for(const element of elements(this.scene)){
        prior.set(element.dataset.motion,Object.fromEntries(
          element.dataset.from.split(';').map(pair=>pair.split(':')[0]).map(attr=>[attr,read(element,attr)])));
      }
    }
    this.cancel();
    this.markup=markup;
    this.key=key;
    this.scene.innerHTML=markup;
    if(this.reduced()||immediate)return;

    for(const element of elements(this.scene)){
      const old=prior.get(element.dataset.motion);
      const attributes=element.dataset.from.split(';').flatMap(pair=>{
        const [key,start]=pair.split(':');
        if(key!=='translate'&&!numericAttributes.includes(key))return [];
        const from=old?.[key]??Number(start), to=read(element,key);
        return Number.isFinite(from)&&Number.isFinite(to)&&Math.abs(from-to)>.0001?[[key,from,to]]:[];
      });
      if(!attributes.length)continue;
      this.tracks.push({
        element, attributes,
        delay:old?0:Number(element.dataset.delay||0),
        duration:Number(element.dataset.duration||550),
      });
    }
    if(!this.tracks.length)return;
    this.elapsed=0;
    this.paint(0);
    this.resume();
  }

  paint(elapsed){
    let live=false;
    for(const {element,attributes,delay,duration} of this.tracks){
      const t=clamp((elapsed-delay)/duration);
      const smooth=t*t*(3-2*t);
      for(const [key,from,to] of attributes)write(element,key,from+(to-from)*smooth);
      live ||= t<1;
    }
    return live;
  }

  tick = now => {
    this.frame=0;
    if(this.last!==null)this.elapsed+=Math.min(50,now-this.last)*this.speed();
    this.last=now;
    if(this.paint(this.elapsed))this.frame=requestAnimationFrame(this.tick);
    else this.cancel();
  };

  pause(){
    if(this.frame)cancelAnimationFrame(this.frame);
    this.frame=0;
    this.last=null;
  }

  resume(){
    if(!this.frame&&this.tracks.length)this.frame=requestAnimationFrame(this.tick);
  }

  finish(){
    for(const {element,attributes} of this.tracks){
      for(const [key,,to] of attributes)write(element,key,to);
    }
    this.cancel();
  }

  replay(){
    if(!this.markup)return;
    const key=this.key;
    this.key=null;
    this.replace(this.markup,key);
  }

  cancel(){
    this.pause();
    this.tracks=[];
  }
}
