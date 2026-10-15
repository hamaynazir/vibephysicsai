// Pure geometry shared by the diagrams, calculators and scientific checks.
export const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export const add=(a,b)=>a.map((x,i)=>x+b[i]);
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const mul=(a,s)=>a.map(x=>x*s);
export const norm=a=>Math.sqrt(dot(a,a));
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const unit=a=>mul(a,1/(norm(a)||1));
export const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
export const reduceIndices=v=>{const g=v.reduce((a,b)=>gcd(a,b),0)||1;return v.map(x=>x/g)};
export const systems={
  Cubic:{params:[1,1,1,90,90,90],rule:'a = b = c · α = β = γ = 90°',centerings:['P','I','F']},
  Tetragonal:{params:[1,1,1.5,90,90,90],rule:'a = b ≠ c · α = β = γ = 90°',centerings:['P','I']},
  Orthorhombic:{params:[1,1.3,1.65,90,90,90],rule:'a ≠ b ≠ c · α = β = γ = 90°',centerings:['P','C','I','F']},
  Monoclinic:{params:[1,1.2,1.5,90,90,110],rule:'a ≠ b ≠ c · α = β = 90°, γ ≠ 90°',centerings:['P','C']},
  Triclinic:{params:[1,1.3,1.5,75,80,70],rule:'Unequal edges · no angle constrained to 90°',centerings:['P']},
  Trigonal:{params:[1,1,1,75,75,75],rule:'a = b = c · α = β = γ ≠ 90°',centerings:['R']},
  Hexagonal:{params:[1,1,1.633,90,90,120],rule:'a = b ≠ c · α = β = 90°, γ = 120°',centerings:['P']}
};
export function basisVectors([a,b,c,alpha=90,beta=90,gamma=90]){
  const [ca,cb,cg]=[alpha,beta,gamma].map(v=>Math.cos(v*Math.PI/180));const sg=Math.sin(gamma*Math.PI/180);
  const cy=c*(ca-cb*cg)/sg, cz2=c*c-(c*cb)**2-cy*cy;
  if(a<=0||b<=0||c<=0||Math.abs(sg)<1e-7||cz2<=0)throw new Error('These angles do not form a valid unit cell.');
  return [[a,0,0],[b*cg,b*sg,0],[c*cb,cy,Math.sqrt(cz2)]];
}
export const fractional=(p,basis)=>basis.reduce((r,b,i)=>add(r,mul(b,p[i])),[0,0,0]);
export const volume=b=>Math.abs(dot(b[0],cross(b[1],b[2])));
export function reciprocal(b){const v=dot(b[0],cross(b[1],b[2]));return [cross(b[1],b[2]),cross(b[2],b[0]),cross(b[0],b[1])].map(x=>mul(x,1/v));}
export function dSpacing(indices,params){if(!indices.some(Boolean))return null;return 1/norm(fractional(indices,reciprocal(basisVectors(params))));}
export const cubicInfo={
  SC:{atoms:1,cn:6,apf:Math.PI/6,radius:.5,nearest:1,second:Math.SQRT2,relation:'a = 2R',count:'8 corners × ⅛ = 1',primitive:1},
  BCC:{atoms:2,cn:8,apf:Math.PI*Math.sqrt(3)/8,radius:Math.sqrt(3)/4,nearest:Math.sqrt(3)/2,second:1,relation:'√3a = 4R',count:'8 × ⅛ + 1 body = 2',primitive:.5},
  FCC:{atoms:4,cn:12,apf:Math.PI/(3*Math.SQRT2),radius:Math.SQRT2/4,nearest:1/Math.SQRT2,second:1,relation:'√2a = 4R',count:'8 × ⅛ + 6 faces × ½ = 4',primitive:.25},
  Diamond:{atoms:8,cn:4,apf:Math.PI*Math.sqrt(3)/16,radius:Math.sqrt(3)/8,nearest:Math.sqrt(3)/4,second:1/Math.SQRT2,relation:'√3a = 8R',count:'FCC sites + 4 interior = 8',primitive:.25},
  HCP:{atoms:2,cn:12,apf:Math.PI/(3*Math.SQRT2),radius:.5,nearest:1,relation:'c/a = √(8/3)',count:'2 atoms / primitive hexagonal cell',primitive:1}
};
// Display groups are teaching categories, not a change of chemical species.
export function atomDisplayGroup(type,p,species=0){
 const f=x=>((x%1)+1)%1;
 if(type==='Diamond')return Math.abs(f(p[0])-.25)<1e-6||Math.abs(f(p[0])-.75)<1e-6?1:0;
 if(type==='HCP')return Math.abs(f(p[2])-.5)<1e-6?1:0;
 if(type==='BCC')return p.every(x=>Math.abs(f(x)-.5)<1e-6)?1:0;
 if(type==='FCC')return p.some(x=>Math.abs(f(x)-.5)<1e-6)?1:0;
 return species;
}
export function centerSites(type){const c=[[0,0,0]];if(type==='I')c.push([.5,.5,.5]);if(type==='F')c.push([0,.5,.5],[.5,0,.5],[.5,.5,0]);if(type==='C')c.push([.5,.5,0]);return c;}
export function structureBasis(type){
 const fcc=centerSites('F');
 if(type==='NaCl')return [...fcc.map(p=>({p,s:0})),...fcc.map(p=>({p:p.map((x,i)=>(x+(i===0?.5:0))%1),s:1}))];
 if(type==='CsCl')return [{p:[0,0,0],s:0},{p:[.5,.5,.5],s:1}];
 if(type==='Diamond'||type==='ZnS')return [...fcc.map(p=>({p,s:0})),...fcc.map(p=>({p:add(p,[.25,.25,.25]),s:type==='ZnS'?1:0}))];
 if(type==='HCP')return [{p:[0,0,0],s:0},{p:[2/3,1/3,.5],s:0}];
 return centerSites(type==='BCC'?'I':type==='FCC'?'F':'P').map(p=>({p,s:0}));
}
export function unitSites(type,repeats=1,centering=null){
 const sites=centering?centerSites(centering).map(p=>({p,s:0})):structureBasis(type),out=[];
 for(let i=0;i<=repeats;i++)for(let j=0;j<=repeats;j++)for(let k=0;k<=repeats;k++)for(const {p,s}of sites){const q=add(p,[i,j,k]);if(q.every(x=>x<=repeats+1e-8))out.push({p:q,s});}return out;
}
export const cubeCorners=()=>Array.from({length:8},(_,i)=>[i&1,(i>>1)&1,(i>>2)&1]);
// Six-sided presentation contains three primitive basal cells (volume 3 Vprimitive).
export const hexagonVertices=()=>[[1,0],[1,1],[0,1],[-1,0],[-1,-1],[0,-1]];
export function hexagonalPrismSites(hcp=false){
 const ring=hexagonVertices(),sites=[];
 for(const z of [0,1])for(const p of [[0,0],...ring])sites.push({p:[...p,z],s:0});
 if(hcp)for(const p of [[2/3,1/3],[-1/3,1/3],[-1/3,-2/3]])sites.push({p:[...p,.5],s:0});
 return sites;
}
export function cellEdges(corners=cubeCorners()){const edges=[];corners.forEach((p,i)=>{for(let j=0;j<3;j++){const k=i^(1<<j);if(k>i)edges.push([p,corners[k]]);}});return edges;}
// Intersect a fractional plane h*x+k*y+l*z=t with the unit cube.
export function planePolygon(indices,t=1){
 const points=[];const insert=p=>{if(!points.some(q=>norm(sub(p,q))<1e-7))points.push(p)};
 for(const [a,b]of cellEdges()){const da=dot(a,indices)-t,db=dot(b,indices)-t;if(Math.abs(da)<1e-8)insert(a);if(da*db<0)insert(add(a,mul(sub(b,a),da/(da-db))));if(Math.abs(db)<1e-8)insert(b);}
 return sortPolygon(points,indices);
}
export function sortPolygon(points,normal){if(points.length<3)return points;const c=mul(points.reduce(add,[0,0,0]),1/points.length),u=unit(sub(points[0],c)),v=unit(cross(normal,u));return points.sort((a,b)=>Math.atan2(dot(sub(a,c),v),dot(sub(a,c),u))-Math.atan2(dot(sub(b,c),v),dot(sub(b,c),u)));}
export function wignerSeitz(type){
 const offsets=structureBasis(type),neighbors=[];
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)for(const {p}of offsets){const n=add(p,[x,y,z]),l=norm(n);if(l>1e-6&&l<=1.05)neighbors.push(n);}
 const vertices=[];
 for(let i=0;i<neighbors.length;i++)for(let j=i+1;j<neighbors.length;j++)for(let k=j+1;k<neighbors.length;k++){
  const a=neighbors[i],b=neighbors[j],c=neighbors[k],det=dot(a,cross(b,c));if(Math.abs(det)<1e-8)continue;
  const p=mul(add(add(mul(cross(b,c),dot(a,a)/2),mul(cross(c,a),dot(b,b)/2)),mul(cross(a,b),dot(c,c)/2)),1/det);
  if(neighbors.every(n=>dot(n,p)<=dot(n,n)/2+1e-7)&&!vertices.some(v=>norm(sub(v,p))<1e-6))vertices.push(p);
 }
 return neighbors.map(n=>sortPolygon(vertices.filter(p=>Math.abs(dot(n,p)-dot(n,n)/2)<1e-6),n)).filter(p=>p.length>=3);
}
export function potential(r,m=1,n=9,A=1,B=m/n){return -A/r**m+B/r**n;}
export function radialForce(r,m=1,n=9,A=1,B=m/n){return -m*A/r**(m+1)+n*B/r**(n+1);}
export function equilibrium(m,n,A=1,B=m/n){return (n*B/(m*A))**(1/(n-m));}
export function madelungShells(dim=3,count=4){
 const shells=new Map(),extent=Math.ceil(Math.sqrt(count*5))+2;
 for(let x=-extent;x<=extent;x++)for(let y=dim>=2?-extent:0;y<=(dim>=2?extent:0);y++)for(let z=dim===3?-extent:0;z<=(dim===3?extent:0);z++){
 const r2=x*x+y*y+z*z;if(!r2)continue;const sign=(Math.abs(x+y+z)%2)?1:-1;
 if(!shells.has(r2))shells.set(r2,{r2,n:0,sign,points:[]});const s=shells.get(r2);s.n++;s.points.push([x,y,z]);}
 return [...shells.values()].sort((a,b)=>a.r2-b.r2).slice(0,count).map(s=>({...s,term:s.sign*s.n/Math.sqrt(s.r2)}));
}
