import test from 'node:test';
import assert from 'node:assert/strict';
import {basisVectors,fractional,dot,systems,structureBasis,atomDisplayGroup} from '../crystal-math.js';
import {primitiveVectors,angleBetween,cellAccounting,nearestNeighbors,originCoordinates,actualPlanePolygon,primitiveVolume} from '../teaching-math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('coordination includes periodic neighbors for every structure and basis site',()=>{
 for(const [type,count]of [['SC',6],['BCC',8],['FCC',12],['NaCl',6],['CsCl',8],['Diamond',4],['ZnS',4],['HCP',12]]){
  const params=type==='HCP'?[1,1,Math.sqrt(8/3),90,90,120]:[1,1,1,90,90,90];
  for(const atom of structureBasis(type)){const neighbors=nearestNeighbors(type,atom,params);assert.equal(neighbors.sites.length,count,`${type} ${atom.p}`);neighbors.sites.forEach(n=>near(n.distance,neighbors.distance));}
 }
});
test('boundary sharing counts atoms correctly for all displayed unit cells',()=>{
 for(const [type,count]of [['SC',1],['BCC',2],['FCC',4],['NaCl',8],['CsCl',2],['Diamond',8],['ZnS',8],['HCP',2]])near(cellAccounting(type).total,count);
});
test('moving the origin changes positions but preserves Cartesian displacement',()=>{
 const A=[.25,.25,.25],B=[.75,.5,.75];for(const system of Object.values(systems)){
  const basis=basisVectors(system.params),initial=originCoordinates(A,B,[0,0,0],basis);
  for(const O of [[.5,0,0],[.5,.5,.5],[1,1,1]]){const moved=originCoordinates(A,B,O,basis);moved.displacement.forEach((v,i)=>near(v,initial.displacement[i]));}
 }
});
test('cell angles are measured between the correct pairs of vectors',()=>{
 for(const sys of Object.values(systems)){const b=basisVectors(sys.params);near(angleBetween(b[1],b[2]),sys.params[3]);near(angleBetween(b[0],b[2]),sys.params[4]);near(angleBetween(b[0],b[1]),sys.params[5]);}
});
test('primitive components, angles and volumes match FCC and BCC geometry',()=>{
 const fcc=primitiveVectors('FCC'),bcc=primitiveVectors('BCC');near(angleBetween(fcc[0],fcc[1]),60);near(angleBetween(bcc[0],bcc[1]),Math.acos(-1/3)*180/Math.PI);near(primitiveVolume('FCC',[2,2,2,90,90,90]),2);near(primitiveVolume('BCC',[2,2,2,90,90,90]),4);near(primitiveVolume('CsCl',[2,2,2,90,90,90]),8);
 const hex=basisVectors([1,1,1.633,90,90,120]);const v=fractional([0,1,0],hex);near(v[0],-.5);near(v[1],Math.sqrt(3)/2);
});
test('actual Miller planes retain their offset and include negative intercepts',()=>{
 for(const hkl of [[1,1,1],[1,0,0],[1,0,-3],[-3,-2,0],[0,-1,2]]){const poly=actualPlanePolygon(hkl);assert.ok(poly.length>=3);poly.forEach(p=>near(dot(p,hkl),1));}
});
test('diamond teaching colors do not change carbon species',()=>{
 const atoms=structureBasis('Diamond');assert.ok(atoms.every(a=>a.s===0));assert.deepEqual(new Set(atoms.map(a=>atomDisplayGroup('Diamond',a.p,a.s))),new Set([0,1]));
});
