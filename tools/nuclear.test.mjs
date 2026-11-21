import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {lesson,sections,pageSections,guide,challenges,defaults} from '../lessons/nuclear-models/basic-concepts/content.js';
import {relation,nuclide,massEnergy,heliumBinding,closestApproach,nuclearRadius,uniformDensity,fermi,skinThickness,linearSurface,evaluate} from '../lessons/nuclear-models/basic-concepts/math.js';
import {bindingEnergy,bindingNuclides,COHORT_SIZE,coulombState,decayState,ELECTRON_MEV,FERMI_RANGE,NEUTRON_LIFETIME,neutronCohort} from '../lessons/nuclear-models/basic-concepts/math.js';
import {ALPHA_MASS,alphaBinding,betaBookkeeping,densityState,fermiProfile,massSamples,U_KG,valenceCharge,baryonIdentity} from '../lessons/nuclear-models/basic-concepts/math.js';
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<Math.max(1e-12,Math.abs(b)*t),`${a} != ${b}`);
test('Nuclear lecture preserves all nine pages and defines fourteen sections and eleven exercises',()=>{assert.equal(lesson.pages,9);assert.equal(sections.length,14);assert.equal(challenges.length,11);assert.equal(pageSections.length,9);assert.equal(new Set(sections.map(s=>s.id)).size,14);for(const id of [...pageSections,...guide])assert.ok(sections.some(s=>s.id===id));for(const c of challenges){assert.ok(Number.isFinite(c.answer));assert.ok(sections.some(s=>s.id===c.section));}assert.ok(fs.existsSync(new URL('../lessons/nuclear-models/basic-concepts/assets/lecture.pdf',import.meta.url)));});
test('All nuclear model controls produce finite values at default and extremes',()=>{for(const section of sections){assert.ok(section.quiz.answer>=0&&section.quiz.answer<section.quiz.options.length);for(const edge of ['value','min','max']){const s={...defaults,...(section.id==='surface'?{A:27}: {})};for(const c of section.controls)s[c.key]=c[edge];const result=evaluate(section.id,s);for(const value of Object.values(result))if(typeof value==='number')assert.ok(Number.isFinite(value),section.id);}}});
test('Nuclide relations distinguish counts without assuming a stability chart',()=>{assert.equal(nuclide(6,8).A,14);assert.ok(relation(6,6,6,8).isotope);assert.ok(relation(12,14,13,14).isotone);assert.ok(relation(14,17,15,16).isobar);assert.ok(relation(6,6,6,6).same);});
test('Mass conversions and helium binding keep atomic electron bookkeeping consistent',()=>{near(massEnergy(1).MeV,931.49410372);near(heliumBinding().energy,28.29566,1e-5);assert.ok(heliumBinding().defect>0&&heliumBinding().excess>0);near(heliumBinding().perNucleon,heliumBinding().energy/4);});
test('Finite-recoil closest approach reproduces all three final problems',()=>{const fixed=closestApproach(2,92,25,4,238,false),recoil=closestApproach(2,92,25,4,238,true);assert.ok(recoil.distance>fixed.distance);near(fixed.distance,10.598139088);near(closestApproach(1,2,.2,1,4,true).distance,closestApproach(2,1,.8,4,1,true).distance);near(closestApproach(2,92,4.2,4,238,true).distance,64.144399242,1e-9);});
test('Radius scaling and density units cancel mass number correctly',()=>{near(nuclearRadius(216)/nuclearRadius(27),2);near(uniformDensity(1.4).number,.0870017,1e-5);near(uniformDensity(1.4).perCM3,uniformDensity(1.4).number*1e39);assert.ok(nuclearRadius(208)<8);});
test('Fermi half-density and 90–10 percent thickness follow the analytic law',()=>{near(fermi(6,6,.55),.165/2);const a=.55,R=6,t=skinThickness(a);near(fermi(R-t/2,R,a)/.165,.9);near(fermi(R+t/2,R,a)/.165,.1);});
test('Free-neutron lifetime differs from half-life; beta bookkeeping conserves A and charge',()=>{const r=evaluate('beta',{...defaults,seconds:878.4*Math.log(2)});near(r.survival,.5);near(r.daughterZ+r.daughterN,defaults.Z+defaults.N);assert.ok(r.halfLife>600&&r.halfLife<615);assert.ok(r.Q>.78&&r.Q<.79);});
test('Surface fraction includes shell weighting and agrees with independent numerical quadrature',()=>{for(const A of [27,125,216]){const r=linearSurface(A),steps=200000,dr=r.hi/steps;let total=0,surface=0;for(let i=0;i<steps;i++){const x=(i+.5)*dr,rho=x<=r.lo?.17:.17*(r.hi-x)/3,v=4*Math.PI*x*x*rho*dr;total+=v;if(x>=r.lo)surface+=v;}near(r.total,total,1e-8);near(r.fraction,surface/total,1e-5);assert.ok(r.fraction>0&&r.fraction<1);}assert.ok(linearSurface(27).fraction>linearSurface(216).fraction);});

test('The sampled binding trend reproduces AME2020 Table I to teaching precision',()=>{
  assert.ok(Object.keys(bindingNuclides).length>=50);
  for(const [id,{reference}] of Object.entries(bindingNuclides)) {
    const r=bindingEnergy(id);
    assert.ok(Math.abs(r.perNucleon-reference)<.000001, id);
    near(r.energy,r.perNucleon*r.A);
    assert.equal(r.A,r.Z+r.N);
  }
  assert.equal(bindingEnergy('c-12').excess,0);
  assert.ok(bindingEnergy('he-4').excess>0 && bindingEnergy('fe-56').excess<0);
  assert.ok(bindingEnergy('ni-62').perNucleon>bindingEnergy('fe-56').perNucleon);
  near(ELECTRON_MEV,.51099895069);
});

test('Light diffuse profiles keep the formal 90% radius separate from the physical domain',()=>{
  const light=densityState({...defaults,A:4,r0:1.2,diffuseness:1});
  const heavy=densityState({...defaults,A:208,r0:1.2,diffuseness:1});
  assert.ok(light.r90<0 && light.center<.9*light.rho);
  assert.ok(heavy.r90>0 && heavy.center>.9*heavy.rho);
  near(light.r10-light.r90,light.skin);
});

test('Valence builder preserves the three constituent charges',()=>{
  assert.deepEqual([0,1,2,3].map(up=>baryonIdentity(up).charge),[-1,0,1,2]);
  assert.equal(baryonIdentity(1).name,'Neutron');
  assert.equal(baryonIdentity(2).name,'Proton');
});

test('Coulomb timeline conserves relative energy and reproduces the analytic radial velocity',()=>{
  for(const s of [defaults,{...defaults,recoil:1,energy:4.2},{...defaults,recoil:1,energy:.1,z2:1,m1:1,m2:1},{...defaults,energy:30}]) {
    const start=coulombState(s,0), turn=coulombState(s,.5), end=coulombState(s,1);
    near(start.separation,5*turn.distance);
    near(turn.separation,turn.distance);
    near(turn.kinetic,0);
    near(end.separation,start.separation);
    near(end.time,-start.time);
    near(end.velocity,-start.velocity);
    for(const p of [.05,.2,.4,.6,.8,.95]) {
      const point=coulombState(s,p), before=coulombState(s,p-.00001), after=coulombState(s,p+.00001);
      near(point.kinetic+point.potential,point.ecm);
      near((after.separation-before.separation)/(after.time-before.time),point.velocity,.00002);
      assert.ok(point.separation>=turn.distance && point.separation<=end.maxSeparation);
    }
  }
});

test('Neutron sample replay is seeded, independent of seek order and monotone in time',()=>{
  assert.deepEqual(neutronCohort(),neutronCohort());
  assert.notDeepEqual(neutronCohort(),neutronCohort(4));
  assert.equal(decayState(0).remaining,COHORT_SIZE);
  const half=decayState(NEUTRON_LIFETIME*Math.log(2));
  near(half.survival,.5);
  assert.ok(half.remaining<COHORT_SIZE && half.remaining>decayState(3000).remaining);
  assert.deepEqual(decayState(half.seconds),half);
  near(decayState(NEUTRON_LIFETIME).survival,1/Math.E);
  assert.equal(decayState(5000).seconds,3000);
});

test('Density walkthrough pauses at half density and widens the surface at fixed R',()=>{
  const settings={...defaults,A:125};
  const at=(position)=>evaluate('fermi',fermiWalkthrough(settings,position));
  assert.equal(at(0).probe,0);
  const half=at(2);
  near(half.probe,half.R);
  near(half.density,settings.rho/2);
  near(at(3).probe,half.probe);
  const edge=at(6), widened=at(8);
  near(edge.density,settings.rho*.1);
  near(widened.density,edge.density);
  near(widened.R,edge.R);
  assert.ok(widened.skin>edge.skin);
  assert.equal(settings.diffuseness,defaults.diffuseness);
});

test('Off-axis paths satisfy energy, angular momentum, asymptotic angle and the closest approach',()=>{
  for(const energy of [4.2,25])for(const impact of [.1,5,50])for(const recoil of [0,1]){
    const s={...defaults,energy,impact,recoil};
    const mu=(recoil?s.m1*s.m2/(s.m1+s.m2):s.m1)*931.49410372;
    const turn=coulombState(s,.5);
    const d=1.43996455*s.z1*s.z2/(2*turn.ecm);
    near(turn.distance,d+Math.hypot(d,impact));
    near(turn.angle,2*Math.atan(d/impact)*180/Math.PI);
    assert.ok(turn.kinetic>0);
    for(const progress of [0,.25,.5,.75,1]){
      const state=coulombState(s,progress), [x,y]=state.position, [vx,vy]=state.vector;
      near(state.kinetic,.5*mu*(vx*vx+vy*vy));
      near(mu*(x*vy-y*vx),state.angularMomentum);
      near(state.kinetic+state.potential,state.ecm);
    }
  }
});

test('Reference masses, alpha convention, beta charge and valence charges agree',()=>{
  near(massSamples.c12.mass*U_KG/12,U_KG);
  near(massEnergy(massSamples.electron.mass).MeV,ELECTRON_MEV);
  near(alphaBinding().mass,ALPHA_MASS);
  near(alphaBinding().energy,28.29561,1e-6);
  assert.equal(nuclide(29,34).symbol,'Cu');
  assert.equal(nuclide(29,34).A,63);
  const beta=betaBookkeeping(90,144);
  assert.deepEqual([beta.daughterZ,beta.daughterN,beta.A,beta.chargeAfter,beta.leptons],[91,143,234,90,0]);
  assert.equal(valenceCharge('uud'),1);
  assert.equal(valenceCharge('udd'),0);
});

test('Normalized Fermi profiles have the chosen count under independent quadrature',()=>{
  for(const A of [12,40,208])for(const diffuseness of [.2,1]){
    const s={...defaults,A,diffuseness,normalization:'normalize'};
    const r=densityState(s), count=30000, dx=(r.R+40*diffuseness)/count;
    let independent=0;
    for(let i=0;i<count;i++){
      const x=(i+.5)*dx;
      independent+=4*Math.PI*x*x*fermi(x,r.R,diffuseness,r.rho)*dx;
    }
    near(independent,A,1e-7);
    near(fermiProfile(r.R,diffuseness,r.rho),A);
  }
});

test('Fermi ruler uses a stable domain and includes the full 90–10 percent interval',()=>{
  for(const A of [16,240])for(const r0 of [1.1,1.4])for(const diffuseness of [.2,1]) {
    const s={...defaults,A,r0,diffuseness,probe:FERMI_RANGE};
    const r=evaluate('fermi',s);
    assert.equal(r.probe,FERMI_RANGE);
    near(r.density,fermi(FERMI_RANGE,r.R,diffuseness,s.rho));
    assert.ok(r.R-r.skin/2>=0&&r.R+r.skin/2<=FERMI_RANGE);
  }
});
import {fermiWalkthrough} from '../lessons/nuclear-models/basic-concepts/math.js';
