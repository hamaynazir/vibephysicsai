export const RAD=Math.PI/180;
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const scale=(a,k)=>a.map(v=>v*k);
export const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=a=>Math.hypot(...a);
export const unit=a=>norm(a)>1e-12?scale(a,1/norm(a)):null;
export const angle=(a,b)=>norm(a)*norm(b)>1e-12?Math.acos(Math.max(-1,Math.min(1,dot(a,b)/norm(a)/norm(b))))/RAD:null;
export function spherical(r,theta,phi){const t=theta*RAD,p=phi*RAD;return {point:[r*Math.sin(t)*Math.cos(p),r*Math.sin(t)*Math.sin(p),r*Math.cos(t)],basis:[[Math.sin(t)*Math.cos(p),Math.sin(t)*Math.sin(p),Math.cos(t)],[Math.cos(t)*Math.cos(p),Math.cos(t)*Math.sin(p),-Math.sin(t)],[-Math.sin(p),Math.cos(p),0]]};}
export function cylindrical(rho,phi,z){const p=phi*RAD;return {point:[rho*Math.cos(p),rho*Math.sin(p),z],basis:[[Math.cos(p),Math.sin(p),0],[-Math.sin(p),Math.cos(p),0],[0,0,1]]};}
export function inverse([x,y,z]){const r=Math.hypot(x,y,z),rho=Math.hypot(x,y);return {r,rho,theta:r>1e-12?Math.acos(Math.max(-1,Math.min(1,z/r)))/RAD:null,phi:rho>1e-12?(Math.atan2(y,x)/RAD+360)%360:null};}
export const components=(A,basis)=>basis.map(e=>dot(A,e));
export const vectorField=(x,y,z,a,b,c)=>[a*x-b*y,b*x+a*y,c*z];
export const potential=(x,y,z,a,b,c)=>a*x*x+b*y*y+c*z*z;
export const gradient=(x,y,z,a,b,c)=>[2*a*x,2*b*y,2*c*z];
export function sphericalElements(r,t,dr,dt,dp){const h=[dr,r*dt*RAD,r*Math.sin(t*RAD)*dp*RAD];return {lengths:h,volume:h[0]*h[1]*h[2],areas:[h[1]*h[2],h[0]*h[2],h[0]*h[1]]};}
export function cylindricalElements(rho,dr,dp,dz){const h=[dr,rho*dp*RAD,dz];return {lengths:h,volume:h[0]*h[1]*h[2],areas:[h[1]*h[2],h[0]*h[2],h[0]*h[1]]};}
export function evaluate(id,s){const A=[s.ax,s.ay,s.az],B=[s.bx,s.by,s.bz],P=[s.x,s.y,s.z],O=[s.origin,0,0];switch(id){
 case 'overview':case 'vectors':case 'addition':case 'dot':case 'cross':case 'components':return {A,B,sum:add(A,B),scaled:scale(A,s.factor),dot:dot(A,B),cross:cross(A,B),angle:angle(A,B),unit:unit(A),magnitude:norm(A)};
 case 'direction':case 'position':return {P,Q:B,origin:O,position:sub(P,O),displacement:sub(B,P),distance:norm(sub(B,P)),radial:unit(sub(P,O))};
 case 'cube':{const a=s.diagonal===0?[1,0,1]:[1,1,1],b=s.diagonal===0?[0,1,1]:[1,1,-1];return {A:a,B:b,angle:angle(a,b),supplement:180-angle(a,b)};}
 case 'elements':return {displacement:[s.dx,s.dy,s.dz],volume:s.dx*s.dy*s.dz,areas:[s.dy*s.dz,s.dx*s.dz,s.dx*s.dy]};
 case 'gradient':return {value:potential(...P,s.a,s.b,s.c),gradient:gradient(...P,s.a,s.b,s.c),directional:dot(gradient(...P,s.a,s.b,s.c),[Math.cos(s.heading*RAD),Math.sin(s.heading*RAD),0])};
 case 'divergence':case 'curl':case 'classification':return {field:vectorField(...P,s.a,s.b,s.c),divergence:2*s.a+s.c,curl:[0,0,2*s.b],uniform:s.a===0&&s.b===0&&s.c===0};
 case 'identities':return {V:[s.x*s.x*s.y,s.x*s.y*s.y,s.z*s.z],div:4*s.x*s.y+2*s.z,gradDiv:[4*s.y,4*s.x,2],lapV:[2*s.y,2*s.x,2],curlCurl:[2*s.y,2*s.x,0],lapScalar:6,curlGrad:[0,0,0],divCurl:0};
 case 'gradient-theorem':{const start=[-1,0,0],end=[s.x,s.y,0],delta=potential(...end,s.a,s.b,0)-potential(...start,s.a,s.b,0);return {start,end,delta,straight:delta,bent:delta};}
 case 'gauss':{const volume=4*Math.PI*s.radius**3/3,div=s.a+s.b+s.c;return {volume,div,flux:div*volume,integral:div*volume};}
 case 'stokes':{const area=Math.PI*s.radius**2,curlZ=2*s.b*s.orientation;return {area,curlZ,circulation:curlZ*area,flux:curlZ*area};}
 case 'coordinates':return inverse(P);
 case 'spherical':{const r=spherical(s.radius,s.theta,s.phi);return {...r,components:components(A,r.basis)};}
 case 'spherical-elements':return sphericalElements(s.radius,s.theta,s.dr,s.dtheta,s.dphi);
 case 'cylindrical':{const r=cylindrical(s.rho,s.phi,s.z);return {...r,components:components(A,r.basis)};}
 case 'cylindrical-elements':return cylindricalElements(s.rho,s.dr,s.dphi,s.dz);
 case 'summary':return {sections:24};
 default:throw Error('Unknown vector-analysis model');}}
const f=v=>v===null?'Undefined':Array.isArray(v)?'('+v.map(x=>Number(x.toPrecision(4))).join(', ')+')':typeof v==='number'?Number(v.toPrecision(5)).toString():String(v);
export function metricEntries(id,s){const r=evaluate(id,s);let entries=[];switch(id){
case 'overview':case 'vectors':case 'components':entries=[[r.A,'A · i, j, k components'],[r.magnitude,'|A|'],[r.sum,'A + B'],[r.unit,'Unit vector along A']];break;
case 'addition':entries=[[r.A,'A · i, j, k components'],[r.sum,'A + B'],[r.scaled,'αA'],[r.magnitude,'|A|']];break;
case 'dot':entries=[[r.dot,'A · B (scalar)'],[r.angle,'Angle (degrees; undefined for a zero vector)'],[norm(r.B)?r.dot/norm(r.B):null,'Signed projection of A along B']];break;
case 'cross':entries=[[r.cross,'A × B · i, j, k components'],[norm(r.cross),'Parallelogram area'],[dot(r.cross,r.A),'(A × B) · A'],[dot(r.cross,r.B),'(A × B) · B']];break;
case 'direction':case 'position':entries=[[r.position,'Position of P from chosen origin'],[r.displacement,'P → Q displacement'],[r.distance,'Distance |Q − P|'],[r.radial,'Unit position direction (undefined at origin)']];break;
case 'cube':entries=[[r.A,'First oriented diagonal'],[r.B,'Second oriented diagonal'],[r.angle,'Vector angle (degrees)'],[r.supplement,'Supplement (degrees)']];break;
case 'elements':case 'spherical-elements':case 'cylindrical-elements':entries=[[r.lengths||r.displacement,'Differential edge components'],[r.volume,'Differential volume'],[r.areas,'Three separate positive-coordinate face areas']];break;
case 'gradient':entries=[[r.value,'Scalar T at selected point'],[r.gradient,'∇T · i, j, k'],[norm(r.gradient),'Maximum unit-direction derivative'],[r.directional,'Derivative along chosen xy heading']];break;
case 'divergence':case 'curl':case 'classification':entries=[[r.field,'F = (ax−by, bx+ay, cz) at P'],[r.divergence,'∇ · F = 2a + c'],[r.curl,'∇ × F = (0,0,2b)'],[r.divergence===0?'Yes':'No','Solenoidal in this smooth family']];break;
case 'identities':entries=[[r.gradDiv,'∇(∇ · V)'],[r.lapV,'∇²V (Cartesian components)'],[r.curlCurl,'∇ × (∇ × V)'],[r.divCurl,'∇ · (∇ × V)']];break;
case 'gradient-theorem':entries=[[r.delta,'T(end) − T(start)'],[r.straight,'∫ ∇T · dl · straight path'],[r.bent,'∫ ∇T · dl · bent path']];break;
case 'gauss':entries=[[r.div,'∇ · F for F=(ax,by,cz)'],[r.volume,'Sphere volume'],[r.flux,'Outward surface flux'],[r.integral,'Volume integral of divergence']];break;
case 'stokes':entries=[[r.area,'Disk area'],[r.curlZ,'Curl component along chosen normal'],[r.circulation,'Boundary circulation'],[r.flux,'Surface integral of curl']];break;
case 'coordinates':entries=[[r.r,'Spherical radius r'],[r.rho,'Cylindrical radius ρ'],[r.theta,'Polar θ from +z (degrees)'],[r.phi,'Azimuth φ, atan2(y,x), 0–360°']];break;
case 'spherical':case 'cylindrical':entries=[[r.point,'Position · Cartesian x, y, z'],[r.basis[0],'First local unit vector · i, j, k'],[r.basis[1],'Second local unit vector · i, j, k'],[r.components,'A components in the local basis']];break;
case 'summary':entries=[['36','Original PDF pages'],['24','Companion sections'],['16','Calculation exercises']];break;
}return entries.map(([v,label])=>[f(v),label]);}
