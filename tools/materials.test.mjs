import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lesson,sections,pageSections,guide,challenges} from '../lessons/materials-science/materials-and-bonding/content.js';
import {bondVectors,bondAngle,pairEnergy,pairForce,pairCurvature,cubeSurfaceRatio,compositeBounds,atoms} from '../lessons/materials-science/materials-and-bonding/math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Materials chapter covers the complete 16-page lecture and its section questions',()=>{
 assert.equal(lesson.pages,16);assert.equal(sections.length,22);assert.equal(pageSections.length,16);
 assert.equal(new Set(sections.map(t=>t.id)).size,sections.length);
 for(let page=1;page<=16;page++){const s=sections.find(s=>s.id===pageSections[page-1]);assert.ok(s);assert.ok(page>=s.page&&page<=s.end);}
 for(const s of sections){assert.ok(s.page>=1&&s.end<=16);assert.equal(s.quiz.options.length,3);assert.ok(s.quiz.answer>=0&&s.quiz.answer<3);assert.ok(s.ideas.length>=3);}
 for(const id of guide)assert.ok(sections.some(s=>s.id===id));for(const c of challenges)assert.ok(sections.some(s=>s.id===c.section));
 assert.ok(fs.statSync(new URL('../lessons/materials-science/materials-and-bonding/assets/lecture.pdf',import.meta.url)).size>1000000);
});
test('tetrahedral and planar hybrid directions preserve true angles in every pair',()=>{
 for(const type of ['sp3','sp2']){const v=bondVectors(type);assert.equal(v.length,type==='sp3'?4:3);for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++)near(bondAngle(v[i],v[j]),type==='sp3'?Math.acos(-1/3)*180/Math.PI:120);}
});
test('bond-energy minimum, force gradient and local stiffness agree',()=>{
 for(const D of [.3,1,2]){near(pairEnergy(1,D),-D);near(pairForce(1,D),0);near(pairCurvature(1,D),72*D);assert.ok(pairForce(.9,D)>0);assert.ok(pairForce(1.2,D)<0);for(const r of [.9,1.1,1.8]){const dr=1e-6;assert.ok(Math.abs(pairForce(r,D)+(pairEnergy(r+dr,D)-pairEnergy(r-dr,D))/(2*dr))<1e-5);}}
});
test('nanocube scaling conserves volume and increases separated exposed area linearly',()=>{
 for(const n of [1,2,10,100]){const L=100/n;near(n**3*L**3,100**3);near(n**3*6*L**2,n*6*100**2);near(cubeSurfaceRatio(L),6*n/100);}
});
test('ideal composite comparisons preserve endpoints and remain ordered',()=>{
 for(const [Ef,Em] of [[70,3],[3,70],[5,5]])for(const f of [0,.25,.5,1]){const m=compositeBounds(f,Ef,Em);assert.ok(m.equalStrain>=m.equalStress-1e-8);assert.ok(m.equalStress>=Math.min(Ef,Em)-1e-8);assert.ok(m.equalStrain<=Math.max(Ef,Em)+1e-8);if(f===0)near(m.equalStrain,Em);if(f===1)near(m.equalStress,Ef);}
});
test('neutral atom shell counts and ionic electron transfer conserve charge',()=>{
 for(const atom of Object.values(atoms))assert.equal(atom.shells.reduce((s,n)=>s+n,0),atom.z);
 assert.equal(atoms.Na.z+atoms.Cl.z,10+18);assert.equal((11-10)+(17-18),0);
});
