import test from 'node:test';
import assert from 'node:assert/strict';
import {allLessons} from '../catalog.js';
import {sections as engineering} from '../lessons/materials-science/engineering-materials/content.js';
import {sections as metals} from '../lessons/materials-science/mechanical-properties-of-metals/content.js';
import {calculationExercises} from '../lessons/materials-science/chapter-practice.js';
import {engineeringModels,mechanicalModels,weightToAtomPercent,atomToWeightPercent,radiusCoordination,molarMassAverages,offsetYield,elasticEnergy,areaUnderCurve,trueTensile,indentationHardness} from '../lessons/materials-science/chapter-models.js';
import {mathMarkup} from '../formula-notation.js';

const near=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<=tolerance,String(actual)+' ≈ '+expected);
const catalogs=[
  ['engineering-materials',engineering,engineeringModels],
  ['mechanical-properties-of-metals',metals,mechanicalModels]
];

test('each new lecture page maps to a working section and each equation typesets',()=>{
  for(const [id,sections,models] of catalogs){
    const lesson=allLessons().find(candidate=>candidate.id===id);
    assert.equal(lesson.topics,sections.length);
    assert.equal(sections.length,Object.keys(models).length);
    for(let page=1;page<=lesson.pages;page++)assert.ok(sections.some(section=>page>=section.page&&page<=section.end),id+' page '+page);
    for(const section of sections){
      assert.ok(section.quiz.options[section.quiz.answer]);
      if(section.equation)assert.match(mathMarkup(section.equation),/<math\b/);
      const model=models[section.id];
      const values=Object.fromEntries(model.controls.map(c=>[c.id,c.value]));
      const configurations=[values, ...model.controls.flatMap(c=>(c.options??[c.min,c.max]).map(value=>({...values,[c.id]:value})))];
      for(const state of configurations){
        const result=model.evaluate(state,model.duration/2);
        assert.ok(result.kind&&result.metrics.length);
        for(const [value] of result.metrics){
          if(typeof value==='number')assert.ok(Number.isFinite(value));
          else assert.doesNotMatch(value,/NaN|Infinity|undefined/);
        }
      }
    }
    for(const exercise of calculationExercises[lesson.number]){
      assert.ok(sections.some(section=>section.id===exercise.id));
      assert.match(mathMarkup(exercise.equation),/<math\b/);
    }
  }
});

test('alloy percentage conversions preserve the PDF example and round-trip',()=>{
  const atomic=weightToAtomPercent(97,26.98,63.55);
  near(atomic,98.704,.002);
  near(atomToWeightPercent(atomic,26.98,63.55),97);
  near(weightToAtomPercent(0,26.98,63.55),0);
  near(weightToAtomPercent(100,26.98,63.55),100);
});

test('hard-sphere thresholds and polymer averages reproduce their definitions',()=>{
  for(const [ratio,coordination] of [[.12,2],[.18,3],[.3,4],[.55,6],[.94,8],[1.04,12]])assert.equal(radiusCoordination(ratio)[1],coordination);
  const {number,weight,dispersity}=molarMassAverages([[85,20],[15,100]]);
  near(number,32);near(weight,57.5);near(dispersity,weight/number);
  near(molarMassAverages([[100,40],[0,90]]).dispersity,1);
});

test('mechanics calculations use consistent strain and hardness conventions',()=>{
  near(60/(.1125/25)/1000,13.3333333333,1e-8);
  const E=200000,H=12000,offset=.002,yieldStress=250;
  const computed=offsetYield(E,yieldStress,H,offset);
  near(computed.stress,E*(computed.strain-offset));
  near(computed.stress,yieldStress+H*(computed.strain-yieldStress/E));
  near(elasticEnergy(350,E)*1000,306.25);
  near(areaUnderCurve([[0,0],[.01,200]]),1);
  near(trueTensile(420,.18).stress,495.6);
  near(trueTensile(460,.18,(10.7/12.8)**2).stress,658.3125,.2);
  near(indentationHardness('Vickers',100,.5),75.64);
  near(indentationHardness('Knoop',100,.5),580.4);
});
