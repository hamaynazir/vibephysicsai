import test from 'node:test';
import assert from 'node:assert/strict';
import {systems,basisVectors,volume,dSpacing,cubicInfo,planePolygon,dot,wignerSeitz,madelungShells,potential,radialForce,equilibrium,structureBasis} from '../crystal-math.js';
import {sections,pageMap,pageNotes,examples} from '../lecture-data.js';
const near=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);

test('all 40 lecture pages and all 13 worked examples are represented',()=>{
 assert.equal(pageMap.length,40);assert.equal(Object.keys(pageNotes).length,40);assert.equal(examples.length,13);assert.equal(sections.length,16);
 pageMap.forEach(([id,mode],i)=>{assert.ok(sections.find(s=>s.id===id),`Missing section for page ${i+1}`);assert.ok(mode);});
 for(const s of sections){assert.ok(s.pages[0]>=1&&s.pages[1]<=40);assert.equal(s.quiz[1].length,3);assert.ok(s.quiz[2]>=0&&s.quiz[2]<3);}
});
test('seven crystal systems produce valid cells and 14 Bravais types',()=>{
 assert.equal(Object.keys(systems).length,7);assert.equal(Object.values(systems).reduce((n,s)=>n+s.centerings.length,0),14);
 Object.values(systems).forEach(s=>assert.ok(volume(basisVectors(s.params))>0));
});
test('cubic, tetragonal, hexagonal and triclinic reciprocal spacing',()=>{
 near(dSpacing([1,1,1],[4,4,4,90,90,90]),4/Math.sqrt(3));
 near(dSpacing([2,2,0],[3.524,3.524,3.524,90,90,90]),3.524/Math.sqrt(8));
 near(dSpacing([1,2,3],[3,3,5,90,90,90]),1/Math.sqrt(5/9+9/25));
 near(dSpacing([1,1,0],[3,3,5,90,90,120]),1.5);
 const b=basisVectors([2,3,4,70,80,75]);near(volume(b),2*3*4*Math.sqrt(1-Math.cos(70*Math.PI/180)**2-Math.cos(80*Math.PI/180)**2-Math.cos(75*Math.PI/180)**2+2*Math.cos(70*Math.PI/180)*Math.cos(80*Math.PI/180)*Math.cos(75*Math.PI/180)));
 near(dSpacing([2,2,0],[4,4,4,90,90,90]),dSpacing([1,1,0],[4,4,4,90,90,90])/2);
 assert.equal(dSpacing([0,0,0],[1,1,1,90,90,90]),null);
 assert.throws(()=>basisVectors([1,1,1,5,5,170]));
});
test('hard sphere packing and atom counts',()=>{
 near(cubicInfo.SC.apf,Math.PI/6);near(cubicInfo.BCC.apf,Math.PI*Math.sqrt(3)/8);near(cubicInfo.FCC.apf,Math.PI/(3*Math.SQRT2));near(cubicInfo.Diamond.apf,Math.PI*Math.sqrt(3)/16);
 assert.equal(structureBasis('NaCl').length,8);assert.equal(structureBasis('CsCl').length,2);assert.equal(structureBasis('Diamond').length,8);assert.equal(structureBasis('HCP').length,2);
});
test('plane polygons lie on requested planes, including negative and zero indices',()=>{
 for(const [hkl,t] of [[[1,1,1],1],[[1,0,0],1],[[1,0,-3],-1],[[0,-1,2],1],[[-3,-2,0],-1]]){
 const polygon=planePolygon(hkl,t);assert.ok(polygon.length>=3);polygon.forEach(p=>{near(dot(p,hkl),t);p.forEach(x=>assert.ok(x>=-1e-7&&x<=1+1e-7));});}
 assert.equal(planePolygon([0,0,0],1).length,0);
});
test('Wigner-Seitz polyhedra have correct faces and primitive volumes',()=>{
 for(const [type,count,expectedV]of [['SC',6,1],['BCC',14,.5],['FCC',12,.25]]){
 const faces=wignerSeitz(type);assert.equal(faces.length,count);let total=0;
 for(const f of faces)for(let j=1;j<f.length-1;j++){const [a,b,c]=[f[0],f[j],f[j+1]];total+=Math.abs(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;}
 near(total,expectedV);
 }
});
test('potential minima and force signs match all three worked models',()=>{
 for(const [m,n]of [[1,9],[2,10],[1,8]]){near(equilibrium(m,n),1);near(radialForce(1,m,n),0);assert.ok(potential(.95,m,n)>potential(1,m,n));assert.ok(potential(1.05,m,n)>potential(1,m,n));assert.ok(radialForce(.9,m,n)>0);assert.ok(radialForce(1.1,m,n)<0);}
 near(potential(1,2,10),-.8);near(potential(1,1,9),-8/9);
});
test('Madelung shells reproduce lecture examples without claiming convergence',()=>{
 const chain=madelungShells(1,12);near(chain.slice(0,4).reduce((a,s)=>a+s.term,0),2*(1-.5+1/3-.25));
 const square=madelungShells(2,4);assert.deepEqual(square.map(s=>s.n),[4,4,4,8]);near(square.reduce((a,s)=>a+s.term,0),4-4/Math.SQRT2-2+8/Math.sqrt(5));
 const nacl=madelungShells(3,4);assert.deepEqual(nacl.map(s=>s.n),[6,12,8,6]);near(nacl.reduce((a,s)=>a+s.term,0),6-12/Math.SQRT2+8/Math.sqrt(3)-3);
});
