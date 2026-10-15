import {basisVectors,fractional,sub,add,norm,dot,volume,unitSites,structureBasis,planePolygon,mul} from './crystal-math.js';

export function primitiveVectors(type){
 if(['FCC','Diamond','ZnS','NaCl'].includes(type))return [[0,.5,.5],[.5,0,.5],[.5,.5,0]];
 if(type==='BCC')return [[-.5,.5,.5],[.5,-.5,.5],[.5,.5,-.5]];
 return [[1,0,0],[0,1,0],[0,0,1]];
}
export function angleBetween(a,b){return Math.acos(Math.min(1,Math.max(-1,dot(a,b)/(norm(a)*norm(b)))))*180/Math.PI;}
export function cellAccounting(type){
 const rows={corner:{count:0,share:1/8,name:'Corners'},edge:{count:0,share:1/4,name:'Edges'},face:{count:0,share:1/2,name:'Faces'},interior:{count:0,share:1,name:'Interior'}};
 for(const site of unitSites(type,1)){const boundaries=site.p.filter(x=>Math.abs(x)<1e-7||Math.abs(x-1)<1e-7).length;rows[['interior','face','edge','corner'][boundaries]].count++;}
 const entries=Object.values(rows).filter(r=>r.count);return {rows:entries,total:entries.reduce((n,r)=>n+r.count*r.share,0)};
}
export function nearestNeighbors(type,selected,params=[1,1,1,90,90,90]){
 const basis=basisVectors(params),sites=structureBasis(type),origin=selected.p||selected,all=[];
 // Translate the same basis into adjacent cells. This includes neighbors outside
 // the displayed cell, so a corner selection does not lose coordination partners.
 const cell=origin.map(Math.floor);
 for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++)for(const atom of sites){
  const p=add(atom.p,add(cell,[i,j,k])),distance=norm(fractional(sub(p,origin),basis));if(distance>1e-6)all.push({p,s:atom.s,distance});
 }
 const distance=Math.min(...all.map(a=>a.distance));return {distance,sites:all.filter(a=>Math.abs(a.distance-distance)<1e-5)};
}
export function originCoordinates(A,B,O,basis){const a=fractional(sub(A,O),basis),b=fractional(sub(B,O),basis);return {a,b,displacement:sub(b,a)};}
export function actualPlanePolygon(indices){
 // Prefer the conventional cube when it contains an area of the actual t=1 plane.
 const positive=planePolygon(indices,1);if(positive.length>=3&&indices.every(x=>x>=0))return positive;
 // Otherwise include negative axes. This is the original plane, not a translated one.
 const min=[-1,-1,-1],offset=dot(indices,min);
 return planePolygon(indices,(1-offset)/2).map(p=>add(min,mul(p,2)));
}
export function primitiveVolume(type,params){const b=basisVectors(params);return volume(primitiveVectors(type).map(v=>fractional(v,b)));}
