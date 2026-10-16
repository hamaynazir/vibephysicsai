export const U_MEV=931.49410372,U_KG=1.66053906892e-27,E=1.602176634e-19,COULOMB=1.43996455,MP=1.00727646658,MN=1.00866491606,MH=1.00782503223;
export const elementNames=['n','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'];
export const nuclide=(Z,N)=>({Z,N,A:Z+N,symbol:elementNames[Z]||'X'});
export function relation(z1,n1,z2,n2){return {isotope:z1===z2&&n1!==n2,isotone:n1===n2&&z1!==z2,isobar:z1+n1===z2+n2&&z1!==z2,same:z1===z2&&n1===n2};}
export const massEnergy=mass=>({kg:mass*U_KG,MeV:mass*U_MEV,joule:mass*U_MEV*1e6*E});
export const heliumBinding=()=>{const m=4.00260325413,defect=2*MH+2*MN-m;return {defect,energy:defect*U_MEV,perNucleon:defect*U_MEV/4,excess:(m-4)*U_MEV};};
export function closestApproach(z1,z2,energy,m1,m2,recoil=true){const ecm=recoil?energy*m2/(m1+m2):energy;return {ecm,distance:COULOMB*z1*z2/ecm};}
export const nuclearRadius=(A,r0=1.2)=>r0*Math.cbrt(A);
export function uniformDensity(r0){const number=3/(4*Math.PI*r0**3);return {number,perCM3:number*1e39,kgM3:number*U_KG*1e45};}
export const fermi=(r,R,a,rho=.165)=>rho/(1+Math.exp((r-R)/a));
export const skinThickness=a=>4*Math.log(3)*a;
export function linearSurface(A,width=3,r0=1.1,rho=.17){const c=nuclearRadius(A,r0),lo=c-width/2,hi=c+width/2;if(lo<0)throw Error('Linear surface model requires R ≥ width/2');const volumeFactor=c**3+c*width**2/4,total=4*Math.PI/3*rho*volumeFactor;return {c,lo,hi,total,fraction:1-lo**3/volumeFactor};}
export function evaluate(mode,s){switch(mode){
case 'overview':case 'nuclides':case 'relations':return {...nuclide(s.Z,s.N),other:nuclide(s.Z2,s.N2),relations:relation(s.Z,s.N,s.Z2,s.N2)};
case 'isomers':return {excitation:s.excitation,massIncrement:s.excitation/1000/U_MEV};
case 'mass':return massEnergy(s.mass);
case 'binding':return heliumBinding();
case 'beta':return {daughterZ:s.Z+1,daughterN:s.N-1,A:s.Z+s.N,survival:Math.exp(-s.seconds/878.4),halfLife:878.4*Math.log(2),Q:(MN-MP)*U_MEV-.51099895};
case 'scattering':case 'recoil':return closestApproach(s.z1,s.z2,s.energy,s.m1,s.m2,s.recoil===1);
case 'radius':return {radius:nuclearRadius(s.A,s.r0),volume:4*Math.PI/3*nuclearRadius(s.A,s.r0)**3,...uniformDensity(s.r0)};
case 'charge':return {charge:s.Z*E,atomNet:(s.Z-s.electrons)*E};
case 'fermi':return {R:nuclearRadius(s.A,s.r0),skin:skinThickness(s.diffuseness),central:s.rho,atR:s.rho/2};
case 'particles':return {muonMass:105.6583755,pionMass:139.57039,protonMass:938.272088};
case 'surface':return linearSurface(s.A,s.width);
default:throw Error('Unknown nuclear model');}}
