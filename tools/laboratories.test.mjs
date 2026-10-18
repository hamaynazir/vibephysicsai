import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {manuals,experimentForPage,referencesForExperiment} from '../laboratories/content.js';
import {DeadTimeRun} from '../laboratories/dead-time-events.js';
import {nuclearScene,tubeScene,gmReplayScene} from '../laboratories/nuclear-apparatus.js';
import {sequenceAt,gmPhase,sequences} from '../laboratories/nuclear-sequences.js';
test('Every nuclear presentation has ordered causal stages; GM missed replay never claims a counted avalanche',()=>{
 for(const [id,labels]of Object.entries(sequences))for(let i=0;i<labels.length;i++){const stage=sequenceAt(id,(i+.1)*8/labels.length);assert.equal(stage.index,i);assert.equal(stage.label,labels[i]);}
 for(let i=0;i<5;i++){assert.equal(gmPhase((i+.1)/5).index,i);const svg=gmReplayScene((i+.1)/5,false);assert.ok(!svg.includes('Counted pulse'));assert.ok(!svg.includes('Avalanche →'));assert.ok(!/NaN|Infinity/.test(svg));}
 assert.match(gmReplayScene(.01),/β \(beta\)/);assert.match(gmReplayScene(.31),/Ionization creates/);assert.match(gmReplayScene(.71),/Counted pulse/);assert.match(gmReplayScene(.91,false),/not extended/);
});
test('Nuclear apparatus views cover all six experiments with finite SVG coordinates and correct labels',()=>{
 for(const e of manuals[0].experiments){if(e.id==='dead-time')continue;for(const endpoint of ['min','value','max']){const s=Object.fromEntries(e.controls.map(c=>[c.key,c[endpoint]]));const svg=nuclearScene(e.id,s,1);assert.match(svg,/<svg/);assert.ok(!/NaN|Infinity|undefined/.test(svg),e.id);assert.notEqual(svg,nuclearScene(e.id,s,2),e.id+' changes with playback');}}
 const ready=tubeScene(),recovering=tubeScene({time:.0001,ready:.0004,tau:.0004,events:[{at:0,accepted:true}]});assert.match(ready,/READY/);assert.match(recovering,/RECOVERING/);assert.match(recovering,/Cathode \(−\)/);assert.match(recovering,/positive ions/);assert.ok(!/paralyzed|efficiency/i.test(recovering));
});
test('Random arrivals obey fixed non-extending dead intervals and exact one-event steps',()=>{
 const uniforms=[1-Math.exp(-.1),1-Math.exp(-.05),1-Math.exp(-.1),1-Math.exp(-1)];let i=0;
 const run=new DeadTimeRun({rate:1,tau:.12,duration:1},()=>uniforms[i++]??.9);
 run.step();assert.equal(run.arrivals,1);assert.equal(run.detected,1);const ready=run.ready;
 run.step();assert.equal(run.missed,1);assert.equal(run.ready,ready);
 run.step();assert.equal(run.detected,2);assert.equal(run.arrivals,3);
 run.advance(2);assert.equal(run.time,1);assert.ok(run.complete);
});
test('Random-run long-time rates converge and zero source/background gives no events',()=>{
 let seed=12345;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296;};
 const run=new DeadTimeRun({rate:700,tau:.0004,duration:300},rng);run.advance(300);
 assert.ok(Math.abs(run.arrivals/300-700)/700<.015);assert.ok(Math.abs(run.detected/300-700/1.28)/(700/1.28)<.015);
 assert.equal(run.arrivals,run.detected+run.missed);
 const empty=new DeadTimeRun({rate:0,tau:.0004,duration:1});empty.step();assert.equal(empty.arrivals,0);assert.ok(empty.complete);
});
import {evaluate,correctedRate,observedRate,twoSourceApprox,twoSourceExact,geometry,activity,semiconductor,bragg,electron,thermoelectric,regression,calibration,poisson,statistics,RYDBERG,C} from '../laboratories/math.js';
const near=(a,b,rel=1e-9)=>assert.ok(Math.abs(a-b)<=Math.max(1e-12,Math.abs(b)*rel),`${a} != ${b}`);
test('References are experiment-specific, with no diffraction references in nuclear dead time',()=>{
 for(const m of manuals)for(const e of m.experiments){const refs=referencesForExperiment(e.id);assert.equal(new Set(refs.map(r=>r[1])).size,refs.length);for(const [label,url]of refs){assert.ok(label.length>10);assert.ok(url.startsWith('https://'));}}
 assert.match(referencesForExperiment('dead-time')[0][0],/GM resolving/);
 assert.ok(!referencesForExperiment('dead-time').some(r=>/diffraction|Seebeck|LiF|NaI/.test(r[0])));
 assert.ok(referencesForExperiment('electron').some(r=>/Graphite/.test(r[0])));
 assert.deepEqual(referencesForExperiment('resistance'),[]);
 assert.throws(()=>referencesForExperiment('missing'));
});
test('Every public page loads the shared theme; deployment includes its assets',()=>{
 const pages=['index.html','about.html','reader.html',...manuals.map(m=>m.reader),...['materials-science/materials-and-bonding','laser-physics/laser-radiation','nuclear-models/basic-concepts','electromagnetic-theory/vector-analysis'].map(p=>'lessons/'+p+'/index.html')];
 for(const page of pages){const html=fs.readFileSync(new URL('../'+page,import.meta.url),'utf8');assert.match(html,/site-theme\.js/);assert.match(html,/site-theme\.css/);}
 const workflow=fs.readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');assert.match(workflow,/cp site-theme\.js site-theme\.css _site\//);
});
test('Every mixed slider corner remains numerically safe; calibration rejects nonpositive resolution',()=>{
 for(const m of manuals)for(const e of m.experiments)for(let bits=0;bits<2**e.controls.length;bits++){
  const s=Object.fromEntries(e.controls.map((c,i)=>[c.key,bits&(1<<i)?c.max:c.min]));
  for(const value of Object.values(evaluate(e.id,s)))if(typeof value==='number')assert.ok(Number.isFinite(value),e.id);
 }
 assert.equal(calibration(500,550,0,12).resolution,null);
});
test('Both complete manuals map every experiment page and define twelve finite teaching models',()=>{
 assert.deepEqual(manuals.map(m=>m.pages),[28,43]);
 for(const m of manuals){assert.equal(m.experiments.length,6);assert.ok(fs.existsSync(new URL('../'+m.reader,import.meta.url)));assert.ok(fs.existsSync(new URL('../'+m.reader.replace('index.html','assets/manual.pdf'),import.meta.url)));for(const e of m.experiments){assert.equal(e.steps.length,4);assert.ok(e.answer>=0&&e.answer<e.options.length);for(let p=e.pages[0];p<=e.pages[1];p++)assert.equal(experimentForPage(m,p).id,e.id);for(const extreme of ['value','min','max']){const s=Object.fromEntries(e.controls.map(c=>[c.key,c[extreme]]));const result=evaluate(e.id,s);for(const v of Object.values(result))if(typeof v==='number')assert.ok(Number.isFinite(v),e.id);}}}
});
test('Poisson gates have reproducible mean and spread and do not force the same count',()=>{
 let seed=18324;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};const counts=Array.from({length:20000},()=>poisson(60,rng)),s=statistics(counts);near(s.mean,60,.01);near(s.sd,Math.sqrt(60),.03);assert.ok(new Set(counts).size>30);assert.equal(poisson(0),0);
});
test('Calibration retains intercept, positive slope and FWHM energy conversion',()=>{const r=calibration(350,650,500,12);near(r.a,.53);near(r.b,987.5);near(r.energy,1252.5);assert.ok(r.fwhm>0);assert.throws(()=>calibration(1,1,1,1));});
test('Nonparalyzable rates invert, approximate two-source bias is explicit, and invalid correction is rejected',()=>{const tau=.0004,n=700,m=observedRate(n,tau);near(correctedRate(m,tau),n);const est=twoSourceApprox(observedRate(300,tau),observedRate(400,tau),m);assert.ok(est>0&&est<tau);near(twoSourceExact(observedRate(300,tau),observedRate(400,tau),m),tau);assert.throws(()=>correctedRate(2500,tau));});
test('Circular detector solid angle and source decay preserve bounds',()=>{assert.ok(geometry(3)>geometry(6));near(geometry(100),.675**2/(4*100**2),.0001);near(activity(74000,28.5,28.5),37000);});
test('Semiconductor local coefficient matches numerical derivative and reference normalization',()=>{near(semiconductor(40,.67,5).R,100);const t=80,h=.001,r=semiconductor(t,.67,5);near((semiconductor(t+h,.67,5).R-semiconductor(t-h,.67,5).R)/(2*h*r.R),r.alpha,1e-7);assert.ok(r.alpha<0&&r.R<100);});
test('Bragg angles, reciprocal spacing, graphite rings and relativistic comparison are consistent',()=>{near(2*201.4*Math.sin(bragg(153.45,201.4)*Math.PI/180),153.45);assert.equal(bragg(1000,100),null);assert.ok(electron(6.5).inner<electron(4).inner);const e=electron(4);near(e.outer/e.inner,213/123);assert.ok(e.rel<e.lambda&&(e.lambda/e.rel-1)<.004);});
test('Fits recover known lattice constant, Rydberg constant and graphite spacing from synthetic points',()=>{const powder=[1,2,3,4,5].map(f=>{const r=evaluate('powder',{family:f,lattice:5.65,wavelength:1.6});return [r.x,r.d];});near(regression(powder).slope,5.65);const m=[19,22,26,30].map(atomic=>[atomic,evaluate('moseley',{atomic,screen:1}).root]);const fit=regression(m);near(4*fit.slope**2/(3*C),RYDBERG);near(-fit.intercept/fit.slope,1);const rings=[4,5,6.5].map(v=>{const e=electron(v);return [e.lambda,e.inner];});near(130/regression(rings).slope,213);assert.throws(()=>regression([[1,2],[1,3]]));});
test('Thermoelectric circuit obeys divider, zero-gradient limit and matched-load maximum',()=>{const r=thermoelectric(40,350,4,4,3);near(r.V,r.voc/2);near(r.power,r.I*r.V);near(r.thermal,.194*4182*3/60);assert.ok(r.power>thermoelectric(40,350,4,1,3).power&&r.power>thermoelectric(40,350,4,12,3).power);near(thermoelectric(0,350,4,4,3).power,0);});
