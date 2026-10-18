import {evaluate} from './math.js';
import {sequenceAt,gmPhase,gmStages} from './nuclear-sequences.js?v=causal-1';
const n=v=>Number(v.toPrecision(4)).toString();
const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${label}</text>`;
const line=(x1,y1,x2,y2,cls='wire')=>`<path d="M${x1} ${y1}L${x2} ${y2}" class="${cls}"/>`;
const dot=(x,y,r=5,cls='particle')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
const box=(x,y,w,h,label)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="instrument"/>${text(x+w/2,y+h+26,label,'center label')}`;
const packet=(x1,y1,x2,y2,t,offset=0,cls='particle')=>{const f=(t*.35+offset)%1;return dot(x1+(x2-x1)*f,y1+(y2-y1)*f,5,cls);};
const wrap=(title,body)=>`<svg viewBox="0 0 760 390" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg"><title>${title}</title>${body}</svg>`;
export function tubeScene({time=0,ready=0,tau=.0004,events=[],next=Infinity}={}){
 const dead=time<ready,accepted=events.filter(e=>e.accepted).at(-1),age=accepted?time-accepted.at:Infinity,p=Math.min(1,age/tau),cx=385,cy=188,r=123;
 let body=`<circle cx="${cx}" cy="${cy}" r="${r}" class="tube-wall"/>`;
 for(let i=0;i<16;i++){const a=i*Math.PI/8;body+=line(cx+12*Math.cos(a),cy+12*Math.sin(a),cx+115*Math.cos(a),cy+115*Math.sin(a),dead?'field weak':'field');}
 if(accepted&&p<1){for(let i=0;i<22;i++){const a=i*Math.PI/11,rr=22+91*p;body+=dot(cx+rr*Math.cos(a),cy+rr*Math.sin(a),6,'ion');if(p<.3){const er=90*(1-p/.3);body+=dot(cx+er*Math.cos(a),cy+er*Math.sin(a),3,'electron');}}}
 body+=dot(cx,cy,7,'anode')+text(cx,cy-15,'+','center');
 body+=text(cx,37,'GM tube · cross-section','center label')+text(560,100,'Cathode (−)','label')+line(550,106,488,130)+text(560,200,'Anode wire (+)','label')+line(548,205,400,190);
 body+=text(560,258,dead?'RECOVERING':'READY',dead?'ion-text':'positive-text')+text(560,282,`τ = ${n(tau*1e6)} μs`,'muted');
 const recent=events.at(-1);if(recent&&time-recent.at<tau*2){body+=line(62,188,255,188,recent.accepted?'ray':'missed-ray')+dot(225,188,7,recent.accepted?'particle':'missed');body+=text(42,143,recent.accepted?'Detected arrival':'Missed arrival','label');}
 else body+=text(42,147,'β (beta) →','muted');
 if(Number.isFinite(next)&&next>=time){const travel=Math.max(.001,tau*3),approach=Math.max(0,1-(next-time)/travel);if(approach>0)body+=dot(55+approach*255,188,6);}
 body+=text(385,353,'Electrons → wire · positive ions → wall','center label')+text(385,377,'Schematic charge motion; effective fixed recovery interval, not a gas-transport solver.','center muted');
 return wrap('GM tube: electron avalanche and recovery after detection',body);
}
export function nuclearScene(id,s,time,records=[]){
 const r=evaluate(id,s),sequence=sequenceAt(id,time),phase=sequence.index,u=sequence.progress;let b='';
 if(id==='statistics'){
  b+=box(45,131,85,100,'Source')+dot(87,180,22,'source')+text(87,187,'β / γ','center');
  b+=box(278,105,115,150,'Detector')+`<path d="M285 120V240" class="window"/>`+box(548,100,160,150,'Scaler + timer');
  b+=line(130,180,278,180,'ray')+line(393,180,548,180);
  if(phase===0)b+=dot(140+u*138,180);
  if(phase===1)b+=dot(328,180,10+u*12,'ion');
  if(phase===2)b+=dot(400+u*142,180,5,'electron');
  if(phase===3)b+=text(628,125,'PULSE REGISTERED','center positive-text');
  b+=text(628,147,records.length?'LAST GATE':'EXPECTED / GATE','center muted')+text(628,197,records.length?String(records.at(-1).count):n(r.mu),'center readout')+text(628,226,`${s.gate} s gate`,'center muted');
  b+=text(380,42,'Count separate arrivals over equal time gates','center label')+text(380,335,'Record repeated gates to see Poisson fluctuations.','center label')+text(380,365,'One illustrated pulse is not a random gate measurement. Use Record / Generate.','center muted');
 }
 if(id==='voltage'){
  b+=box(123,118,112,130,'NaI(Tl) crystal')+box(271,118,300,130,'Photomultiplier tube')+box(617,145,105,75,'Discriminator');
  b+=text(30,183,'γ →','label')+line(65,179,122,179,'ray');if(phase===0)b+=dot(65+u*110,179);
  if(phase===1)for(let i=0;i<9;i++){const a=i*2.4;b+=`<path d="M179 183l${Math.cos(a)*34*u} ${Math.sin(a)*40*u}" class="photon"/>`;}
  if(phase===2){if(u<.6){for(let j=0;j<4;j++)b+=dot(211+u/.6*70,170+j*7,3,'scint-photon');}else{for(let j=0;j<4;j++)b+=dot(284+(u-.6)/.4*25,170+j*7,3,'electron');}}
  b+=line(282,132,282,234,'window');for(let i=0;i<5;i++){const x=320+i*48;b+=line(x,150+(i%2)*35,x+14,169+(i%2)*35,'dynode');if(phase===3&&u*5>=i)for(let j=0;j<Math.min(10,Math.ceil((i+1)*r.gain));j++)b+=dot(x+Math.min(1,u*5-i)*40,164+j*4,3,'electron');}
  if(phase===4)b+=text(670,124,r.gain>=s.threshold?'Example: passes':'Example: rejected','center muted');
  b+=line(571,183,617,183)+text(420,85,`${s.voltage} kV · relative gain ×${n(r.gain)}`,'center label')+text(670,185,n(r.source)+' s⁻¹','center')+text(282,298,'Photocathode','center muted')+text(451,298,'Dynodes → multiplication','center muted');
  b+=text(380,42,'Gamma energy → scintillation light → amplified charge','center label')+text(380,323,'Higher voltage changes gain—not the emitted gamma energy.','center label')+text(380,359,'Light flashes, electron multiplication and rate response are illustrative.','center muted');
 }
 if(id==='calibration'){
  b+=box(35,94,106,90,'Co-60')+box(207,94,125,90,'Scintillator')+line(141,139,207,139,'ray')+line(332,139,411,139);if(phase===0)b+=dot(141+u*110,139);if(phase===1)b+=dot(268,139,8+u*15,'ion');if(phase===2)b+=dot(332+u*79,139,5,'electron');
  b+=`<rect x="411" y="55" width="317" height="237" rx="16" class="instrument"/>`+text(570,87,'PULSE-HEIGHT ANALYZER','center muted');
  let path='';for(let c=0;c<=1000;c+=3){const height=Math.exp(-.5*((c-s.channel1)/s.width)**2)+.8*Math.exp(-.5*((c-s.channel2)/s.width)**2);path+=`${c?'L':'M'}${436+c*.265} ${252-height*130}`;}
  b+=`<path d="${path}" class="spectrum"/>`+line(436,253,702,253)+line(436+s.unknown*.265,110,436+s.unknown*.265,255,'cursor');
  if(phase===3)b+=dot(436+(u<.5?s.channel1:s.channel2)*.265,113+u*110,5,'electron');
  b+=text(570,277,`C₁ ${s.channel1} · C₂ ${s.channel2} · selected ${s.unknown}`,'center muted')+text(380,340,r.energy>0?`Selected channel → ${n(r.energy)} keV`:'Nonphysical inferred energy — change the selected channel','center label')+text(380,371,s.unknown<s.channel1||s.unknown>s.channel2?'Outside the reference peaks: unvalidated extrapolation.':'Reference peaks fixed by controls; pulse and spectrum display are schematic.','center muted');
 }
 if(id==='electronics'){
  const names=['Detector','Preamplifier','Shaping amplifier','SCA'];for(let i=0;i<4;i++){const x=25+i*187;b+=box(x,95,150,175,names[i]);if(i<3)b+=line(x+150,182,x+187,182);if(phase===i){b+=`<rect x="${x-3}" y="92" width="156" height="181" rx="16" class="spectrum"/>`;if(i<3)b+=dot(x+150+u*37,182,5,'electron');}
   let path='';for(let j=0;j<100;j++){const u=j/99;let v=i===0?(u>.25&&u<.31?1:0):i===1?(u>.25?Math.exp(-(u-.25)*8):0):i===2?Math.exp(-.5*((u-.5)/.12)**2)*(s.amplitude*s.gain/8):(r.accepted&&u>.3&&u<.65?1:0);path+=`${j?'L':'M'}${x+12+u*126} ${230-v*92}`;}
   b+=`<path d="${path}" class="${i===3&&!r.accepted?'rejected-trace':'spectrum'}"/>`;
   if(i===3)b+=text(x+75,132,r.accepted?'ACCEPT':'REJECT','center label');
  }
  b+=text(380,46,'Follow one pulse through the measurement chain','center label')+text(380,332,`${n(r.amplitude)} V amplified · window ${s.lower}–${n(r.upper)} V`,'center label')+text(380,371,'Pulse shapes and amplitudes use separate display scales; timing is not calibrated.','center muted');
 }
 if(id==='efficiency'){
  const x=330+s.distance*25,cy=184,half=49;
  b+=dot(125,cy,24,'source')+text(125,cy+6,'β / γ','center')+text(125,278,'Isotropic point source','center label');
  b+=`<rect x="${x}" y="${cy-half}" width="48" height="98" rx="9" class="instrument"/>`+line(x,cy-half,x,cy+half,'window');
  for(let i=0;i<20;i++){const a=i*Math.PI/10,endX=125+Math.cos(a)*140,endY=cy+Math.sin(a)*140;b+=line(125,cy,endX,endY,'field');}
  b+=line(125,cy,x,cy-half,'ray')+line(125,cy,x,cy+half,'ray');
  if(phase===0)for(let i=0;i<12;i++){const a=i*Math.PI/6;b+=dot(125+u*100*Math.cos(a),cy+u*100*Math.sin(a));}
  if(phase===1){b+=dot(125+u*(x-125),cy-85*u,5,'missed')+text(380,82,'Missed window ≠ detector inefficiency','center muted');}
  if(phase===2)b+=dot(125+u*(x-125),cy,6);
  if(phase===3){b+=line(x+48,cy,700,143,'ray')+line(x+48,cy,700,231,'missed-ray')+text(650,125,`Counted ${s.intrinsic}%`,'center muted')+text(650,255,`Not counted ${100-s.intrinsic}%`,'center muted')+text(380,82,'Two possible outcomes for incident radiation—not two detections','center muted');}
  b+=text(x+24,278,'Detector window','center label')+line(125,306,x,306)+text((125+x)/2,332,`${s.distance} cm`,'center label')+text(380,44,`Geometric acceptance ${n(r.g*100)}% · assumed intrinsic ${s.intrinsic}%`,'center label')+text(380,375,'Distance changes solid angle. Ray density and drawing sizes are not quantitative.','center muted');
 }
 return wrap('Animated apparatus: '+id,b);
}
export function installNuclearApparatus(anchor){
 const stage=document.createElement('div');stage.className='nuclear-apparatus';stage.id='apparatus-stage';anchor.before(stage);
 const zoom=addVisualZoom(stage);
 const explanation=document.createElement('p');explanation.className='causal-stage';zoom.after(explanation);
 return {draw(exp,state,time,records){stage.hidden=exp.id==='dead-time';zoom.hidden=stage.hidden;explanation.hidden=stage.hidden;if(!stage.hidden){stage.innerHTML=nuclearScene(exp.id,state,time,records);const seq=sequenceAt(exp.id,time);explanation.textContent=`${seq.index+1} / ${seq.labels.length} · ${seq.label} · slowed teaching sequence, not measured timing`;}}};
}
export function gmReplayScene(progress,accepted=true){
 const {index,local:u,label}=gmPhase(progress),cx=360,cy=185;let b=`<circle cx="${cx}" cy="${cy}" r="122" class="tube-wall"/>`+dot(cx,cy,6,'anode');
 b+=text(360,32,'GM tube · beta-particle event replay','center label')+text(560,115,'Cathode (−)','label')+line(550,120,469,133)+text(560,199,'Anode (+)','label')+line(550,204,371,185);
 if(index===0){const x=40+u*270;b+=line(x-24,cy,x,cy,'ray')+dot(x,cy,7)+text(80,147,'β (beta)','label');}
 if(!accepted&&index>0){b+=dot(310+(progress-.2)/.8*220,cy,6,'missed')+text(360,293,'Particle enters, but no separate counted pulse','center ion-text');}
 if(accepted&&index===1){b+=dot(310,185,7,'electron')+dot(314,199,7,'ion')+text(360,292,'Ionization creates electron–positive-ion pairs','center label');}
 if(accepted&&index===2){for(let j=0;j<6;j++)b+=dot(305+u*52,170+j*6,3,'electron');b+=text(360,292,'Electrons move toward the positive wire','center label');}
 if(accepted&&index===3){for(let j=0;j<4+Math.floor(u*24);j++){const a=j*Math.PI/12;b+=dot(cx+(12+u*8)*Math.cos(a),cy+(12+u*8)*Math.sin(a),3,'electron');}const x=500+u*60;b+=`<path d="M490 245H${x}v-55h15v55h70" class="spectrum"/>`+text(570,273,'Counted pulse','center label');}
 if(accepted&&index===4){for(let j=0;j<20;j++){const a=j*Math.PI/10,r=25+u*88;b+=dot(cx+r*Math.cos(a),cy+r*Math.sin(a),6,'ion');}b+=text(360,322,'Positive ions drift outward; sensitivity recovers','center label');}
 const missedLabels=['Beta particle approaches during dead time','Particle enters the insensitive tube','A separate detection is missed','No new counted pulse','Dead interval is not extended'];
 b+=text(360,355,accepted?label:missedLabels[index],'center label')+text(360,379,'Conceptual replay: timing and charge populations are illustrative; counters unchanged.','center muted');return wrap('Step-by-step beta interaction in GM gas',b);
}
export function addVisualZoom(stage){const button=document.createElement('button');button.className='apparatus-zoom';button.textContent='Enlarge visual';button.setAttribute('aria-pressed','false');stage.after(button);button.onclick=()=>{const enlarged=stage.classList.toggle('zoomed');button.textContent=enlarged?'Fit visual':'Enlarge visual';button.setAttribute('aria-pressed',String(enlarged));};return button;}
