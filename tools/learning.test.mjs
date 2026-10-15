import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProgress,saveProgress,recordAnswer,weakPoints,MEMORY_KEY} from '../learning-memory.js';
import {predictions,guideSteps,buildChallenges} from '../learning-data.js';
import {sections} from '../lecture-data.js';
test('incorrect answers persist and a later correct review resolves the weak point',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const p=loadProgress(storage),q=predictions[1];recordAnswer(p,q,false);recordAnswer(p,q,false);saveProgress(storage,p);
 const restored=loadProgress(storage);assert.equal(weakPoints(restored).length,1);assert.equal(weakPoints(restored)[0].misses,2);recordAnswer(restored,q,true);assert.equal(weakPoints(restored).length,0);assert.equal(restored.records[q.id].resolved,true);
});
test('corrupt and unavailable browser storage have a safe fallback',()=>{
 assert.deepEqual(loadProgress({getItem:()=>'{invalid'}),{records:{},guide:0,guideComplete:false});assert.equal(saveProgress({setItem:()=>{throw Error('Blocked')}},{records:{}}),false);
 const storage={getItem:()=>JSON.stringify({records:{},guide:999,guideComplete:true})};assert.equal(loadProgress(storage).guide,6);
});
test('guided path, predictions and construction exercises reference real chapter sections',()=>{
 assert.equal(guideSteps.length,7);assert.equal(buildChallenges.length,3);assert.equal(predictions.length,8);
 for(const item of [...guideSteps,...buildChallenges,...predictions])assert.ok(sections.some(s=>s.id===item.section));
 for(const q of predictions){assert.equal(q.options.length,3);assert.ok(q.answer>=0&&q.answer<3);assert.ok(q.why.length>50);}
 assert.deepEqual(buildChallenges[0].target,[0,.5,.5]);assert.deepEqual(buildChallenges[1].target,[.5,.5,.5]);assert.deepEqual(buildChallenges[2].target,[1,1,0]);
});
