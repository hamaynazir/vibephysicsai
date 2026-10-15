export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const norm=a=>Math.sqrt(dot(a,a));
export function bondVectors(type){return type==='sp2'?[[1,0,0],[-.5,Math.sqrt(3)/2,0],[-.5,-Math.sqrt(3)/2,0]]:[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>v.map(x=>x/Math.sqrt(3)));}
export const bondAngle=(u,v)=>Math.acos(Math.max(-1,Math.min(1,dot(u,v)/(norm(u)*norm(v)))))*180/Math.PI;
export const pairEnergy=(r,D=1)=>D*(r**-12-2*r**-6);
export const pairForce=(r,D=1)=>12*D*(r**-13-r**-7);
export const pairCurvature=(r,D=1)=>D*(156*r**-14-84*r**-8);
export const cubeSurfaceRatio=L=>6/L;
export function compositeBounds(f,Ef=70,Em=3){return {equalStrain:f*Ef+(1-f)*Em,equalStress:1/(f/Ef+(1-f)/Em)};}
export const atoms={C:{z:6,shells:[2,4],name:'Carbon'},Na:{z:11,shells:[2,8,1],name:'Sodium'},Cl:{z:17,shells:[2,8,7],name:'Chlorine'},Ne:{z:10,shells:[2,8],name:'Neon'}};
