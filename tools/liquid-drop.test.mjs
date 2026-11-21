import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {allLessons} from '../catalog.js';
import {anchors,beats,chapters,defaults,modes,pageTopic,presets} from '../lessons/nuclear-models/liquid-drop-model/content.js';
import {binding,constants,coefficients,electronicCorrection,inModel,liquidDrop,loadRecords,modelEnergy,parabola,particles,permitted,threshold,transition} from '../lessons/nuclear-models/liquid-drop-model/model.js';

const asset = new URL('../lessons/nuclear-models/liquid-drop-model/assets/ame2020-nubase2020.json',import.meta.url);
const raw=JSON.parse(readFileSync(asset,'utf8'));
const data=loadRecords(raw);
const close=(actual,expected,tolerance)=>assert.ok(Math.abs(actual-expected)<=tolerance,'Expected '+expected+', found '+actual);
const energy=(A,Z)=>{const r=data.get(A,Z);return r?r.mass*constants.k:null;};

test('versioned evaluated dataset preserves AME precision, uncertainty and extrapolation',()=>{
  assert.equal(raw.rows.length,3558);
  assert.equal(new Set(raw.rows.map(([A,Z])=>A+','+Z)).size,raw.rows.length);
  const sourceCases=[
    [1,0,1.00866491590,0.00000000047,false],
    [1,1,1.007825031898,0.000000000014,false],
    [3,3,3.030775,0.002147,true],
    [12,6,12,0,false],
    [15,7,15.00010889827,0.00000000062,false],
  ];
  for(const [A,Z,mass,uncertainty,extrapolated] of sourceCases){
    const row=data.get(A,Z);
    assert.equal(row.mass,mass);
    assert.equal(row.uncertainty,uncertainty);
    assert.equal(row.extrapolated,extrapolated);
  }
  assert.equal(data.get(250,1),null);
  assert.equal(data.get(1,0).property,'other');
  assert.equal(data.get(1,1).property,'stable');
  assert.equal(data.get(3,1).property,'other');
  assert.equal(data.stableCounts.reduce((a,b)=>a+b),253);
  assert.match(raw.massSHA256,/^[a-f\d]{64}$/);
});

test('mirror ledger checks rounded inputs and neutral-atom electron bookkeeping',()=>{
  const lecture={k:931.494,hydrogen:1.007825,neutron:1.008665};
  const n=binding(15,7,15.000109,lecture), o=binding(15,8,15.003065,lecture);
  close(n.B,115.49,.01);close(o.B,111.96,.01);
  close(n.per,7.699,.001);close(o.per,7.464,.001);close(n.B-o.B,3.54,.01);
  const Z=7,N=8,mp=1.0072764665789,me=constants.electronMeV/constants.k;
  const EH=(mp+me-constants.hydrogen)*constants.k, electrons=.001486;
  const atomicMass=data.get(15,7).mass;
  const nuclearMass=atomicMass-Z*me+electrons/constants.k;
  const bareBinding=(Z*mp+N*constants.neutron-nuclearMass)*constants.k;
  close(data.get(15,7).B-bareBinding,electronicCorrection(Z,electrons,EH),1e-10);
});

test('oxygen-16 thresholds reproduce AME and preserve A and Z',()=>{
  for(const [kind,expected] of Object.entries({n:15.66,p:12.13,alpha:7.16})){
    const result=threshold(16,8,kind,data.get);
    assert.ok(result.available);
    assert.equal(result.extrapolated,false);
    close(result.Q,expected,.03);
    close(result.Q,result.byBinding,.001);
    assert.deepEqual(result.daughter.map((v,i)=>v+particles[kind][i]),[16,8]);
  }
  assert.ok(threshold(8,4,'alpha',data.get).Q<0,'Be-8 → two alpha particles');
  assert.equal(threshold(8,0,'p',data.get).available,false);
  assert.equal(threshold(250,8,'n',data.get).available,false);
  assert.equal(threshold(3,3,'p',data.get).available,false);
  assert.equal(threshold(7,1,'n',data.get).extrapolated,true);
  assert.equal(threshold(5,2,'alpha',(A,Z,particle)=>particle?data.get(A,Z):liquidDrop(A,Z)).available,false);
});

test('liquid-drop model honors all parity and domain invariants',()=>{
  close(liquidDrop(8,4).R*2,liquidDrop(64,32).R,1e-12);
  close(liquidDrop(40,20).density,3/(4*Math.PI*1.2**3),1e-12);
  close(liquidDrop(38,19).terms.asymmetry,0,1e-12);
  close(liquidDrop(38,17).terms.asymmetry,-9.894736842,1e-9);
  close(liquidDrop(38,17,{...coefficients,asymmetry:22.6}).terms.asymmetry,-9.515789474,1e-9);
  for(const [A,Z] of [[4,2],[251,30],[10,11],[10,-1],[10,1.5]])assert.equal(liquidDrop(A,Z),null);
  for(let A=5;A<=250;A++){
    for(let Z=0;Z<=A;Z++){
      const m=liquidDrop(A,Z);
      if(Z<2)close(m.terms.coulomb,0,0);
      assert.equal(Math.sign(m.terms.pairing),A%2?0:Z%2?-1:1);
      close(m.B,Object.values(m.terms).reduce((x,y)=>x+y),1e-11);
      close(m.B,binding(A,Z,m.mass).B,1e-9);
    }
  }
});

test('isobaric polynomial agrees with direct mass evaluation across the supported grid',()=>{
  for(let A=5;A<=250;A++){
    const p=parabola(A);
    close(p.C1+2*p.C2*p.vertex,0,1e-9);
    for(let Z=0;Z<=A;Z++){
      const paired=liquidDrop(A,Z).terms.pairing;
      close(p.C0+p.C1*Z+p.C2*Z*Z-paired,modelEnergy(A,Z),.000001);
      close(p.smooth(Z)-paired,modelEnergy(A,Z),.000001);
    }
  }
  const p=parabola(33), approx=parabola(33,coefficients,true);
  close(p.C2,3.07296,.00002);
  close(p.vertex,15.4585,.00005);
  close(transition(modelEnergy,33,14,1),5.891,.001);
  close(approx.smooth(14)-approx.smooth(15),4.884,.001);
});

test('positron threshold and two-unit electron capture use distinct channels',()=>{
  const energies=(A,Z)=>Z===15?.8:0;
  close(transition(energies,33,15,-1),.8,1e-12);
  close(transition(energies,33,15,-1,1),-.222,.00001);
  assert.equal(permitted(transition(()=>2*constants.electronMeV,33,15,-1)),'At threshold');
  assert.equal(permitted(transition(()=>null,33,15,-1)),'Unavailable');
  assert.ok(transition(energy,102,46,-1)<0);
  assert.ok(transition(energy,102,46,1)<0);
  assert.ok(transition(energy,102,46,-2)>0);
  close(transition(energy,102,46,-2),1.203472,.000001);
  assert.ok(transition(energy,102,44,2)<0);
});

test('coverage sends every supplied PDF page and every worked preset to a real view',()=>{
  const chapter=allLessons().find(l=>l.id==='nuclear-liquid-drop-model');
  assert.equal(chapter.pages,18);
  assert.equal(chapter.topics,chapters.length);
  for(let p=1;p<=chapter.pages;p++){
    assert.ok(anchors.some(([page])=>page===p),p);
    assert.ok(defaults[pageTopic(p)]);
  }
  for(const [id,[topic,p,patch]] of Object.entries(presets)){
    assert.ok(p>=1&&p<=chapter.pages,id);
    assert.ok(modes[topic][patch.mode||defaults[topic].mode],id);
    const s={...defaults[topic],...patch};
    if(topic==='drop'||topic==='parabolas')assert.ok(inModel(s.A,s.Z));
  }
  assert.equal(Object.values(beats).flat().length,23);
});
