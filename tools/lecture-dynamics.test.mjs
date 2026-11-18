import test from 'node:test';
import assert from 'node:assert/strict';
import {numericalModels} from '../lecture-dynamics.js';
import {mathMarkup} from '../formula-notation.js';

function run(key, setting, steps) {
  const model=numericalModels[key].create(setting);
  for(let i=0;i<steps;i++)model.step();
  assert.ok(model.values().every(Number.isFinite));
  return model.values();
}

test('wave transmission changes at the boundary and the ends remain fixed',()=>{
  const uniform=run('emt-vector-analysis/overview',1,130);
  const interfaceWave=run('emt-vector-analysis/overview',.5,130);
  assert.ok(Math.max(...uniform.slice(45,95).map(Math.abs))<.05);
  assert.ok(Math.max(...interfaceWave.slice(45,95).map(Math.abs))>.15);
  assert.ok(Math.max(...interfaceWave.slice(100,199).map(Math.abs))>.4);
  assert.equal(interfaceWave[0],0);
  assert.equal(interfaceWave.at(-1),0);
});

test('lattice distortion propagates while endpoints remain fixed',()=>{
  const uniform=run('crystal-structures/crystalline',1,140);
  const alternate=run('crystal-structures/crystalline',4,140);
  assert.notDeepEqual(uniform,alternate);
  assert.ok(uniform.slice(19).some(value=>Math.abs(value)>.01));
  assert.equal(alternate[0],0);
  assert.equal(alternate.at(-1),0);
});

test('harmonic period is close to two pi and damping reduces amplitude',()=>{
  const key='materials-and-bonding/forces';
  const undamped=run(key,0,420), damped=run(key,1,420);
  const periodIndex=Math.round(2*Math.PI/.06);
  assert.ok(Math.abs(undamped[periodIndex]-1)<.01);
  assert.ok(Math.abs(damped[periodIndex])<.1);
});

test('pumping approaches the population balance from below',()=>{
  const key='laser-radiation/pumping';
  const pumped=run(key,2,260), dark=run(key,0,260);
  assert.ok(dark.every(value=>value===0));
  assert.ok(pumped.every((value,i)=>value<=2/3 && (i===0 || value>=pumped[i-1])));
  assert.ok(Math.abs(pumped.at(-1)-2/3)<1e-8);
});

test('decay stays within bounds and decreases, with a half-life of 20 steps',()=>{
  const key='nuclear-basic-concepts/beta';
  const fraction=run(key,80,100);
  assert.ok(fraction.every((value,i)=>value>=0&&value<=1&&(i===0||value<=fraction[i-1])));
  assert.equal(numericalModels[key].create(80).expected(20),.5);
});

test('each dynamics equation uses typeset math without visible source notation',()=>{
  for(const model of Object.values(numericalModels)){
    const markup=mathMarkup(model.equation);
    assert.match(markup,/<math\b/);
    assert.doesNotMatch(markup,/<annotation/);
  }
});
