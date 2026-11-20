export const U_MEV=931.49410372,U_KG=1.66053906892e-27,E=1.602176634e-19,COULOMB=1.43996455,MP=1.0072764665789,MN=1.00866491606;
export const NEUTRON_LIFETIME = 878.4;
export const ELECTRON_MEV = 0.51099895069;
export const DECAY_LIMIT = 3000;
export const COHORT_SIZE = 48;
export const FERMI_RANGE = 15;
export const bindingNuclides = {
  'h-2': {Z: 1, N: 1, mass: 2.014101777844, reference: 1.1122831},
  'he-4': {Z: 2, N: 2, mass: 4.00260325413, reference: 7.0739156},
  'c-12': {Z: 6, N: 6, mass: 12, reference: 7.6801446},
  'fe-56': {Z: 26, N: 30, mass: 55.934935537, reference: 8.7903563},
  'ni-62': {Z: 28, N: 34, mass: 61.928344753, reference: 8.7945555},
};
// AME2020 neutral hydrogen and free-neutron masses from the comparison table.
const hydrogenAtom = 1.007825031898;
const neutronMass = 1.00866491590;
export const elementNames=['n','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'];
export const nuclide=(Z,N)=>({Z,N,A:Z+N,symbol:elementNames[Z]||'X'});
export function relation(z1,n1,z2,n2){return {isotope:z1===z2&&n1!==n2,isotone:n1===n2&&z1!==z2,isobar:z1+n1===z2+n2&&z1!==z2,same:z1===z2&&n1===n2};}
export const massEnergy=mass=>({kg:mass*U_KG,MeV:mass*U_MEV,joule:mass*U_MEV*1e6*E});
export function bindingEnergy(id = 'he-4') {
  const {Z, N, mass} = bindingNuclides[id];
  const A = Z + N;
  const separated = Z * hydrogenAtom + N * neutronMass;
  const defect = separated - mass;
  const energy = defect * U_MEV;
  return {Z, N, A, mass, separated, defect, energy, perNucleon: energy / A, excess: (mass - A) * U_MEV};
}
export const heliumBinding = () => bindingEnergy();
export function closestApproach(z1,z2,energy,m1,m2,recoil=true){const ecm=recoil?energy*m2/(m1+m2):energy;return {ecm,distance:COULOMB*z1*z2/ecm};}
const collisionRange = 5;
const endParameter = Math.acosh(Math.sqrt(collisionRange));
const elapsed = u => u + Math.sinh(2 * u) / 2;
export function coulombState(s, progress) {
  const {ecm, distance} = closestApproach(s.z1, s.z2, s.energy, s.m1, s.m2, s.recoil === 1);
  const reducedMass = (s.recoil === 1 ? s.m1 * s.m2 / (s.m1 + s.m2) : s.m1) * U_MEV;
  const infinitySpeed = Math.sqrt(2 * ecm / reducedMass);
  const signed = 2 * Math.max(0, Math.min(1, progress)) - 1;
  // r/D = cosh²u integrates dt = dr/v. Invert it on the displayed interval.
  const target = Math.abs(signed) * elapsed(endParameter);
  let lo = 0, hi = endParameter;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (elapsed(mid) < target) lo = mid;
    else hi = mid;
  }
  const separation = distance * Math.cosh((lo + hi) / 2) ** 2;
  const potential = ecm * distance / separation;
  const kinetic = Math.max(0, ecm - potential);
  return {ecm, distance, separation, potential, kinetic, maxSeparation: collisionRange * distance,
    time: signed * distance / infinitySpeed * elapsed(endParameter), velocity: Math.sign(signed) * Math.sqrt(2 * kinetic / reducedMass)};
}

// Generate each lifetime once so seeking reuses the same synthetic events.
export function neutronCohort(seed = 9173) {
  let value = seed >>> 0;
  return Array.from({length: COHORT_SIZE}, () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return -NEUTRON_LIFETIME * Math.log((value + .5) / 4294967296);
  });
}
const lifetimes = neutronCohort();
export function decayState(seconds) {
  const time = Math.max(0, Math.min(DECAY_LIMIT, seconds));
  const live = lifetimes.map(life => life > time);
  return {seconds: time, survival: Math.exp(-time / NEUTRON_LIFETIME), live, remaining: live.filter(Boolean).length};
}
export const nuclearRadius=(A,r0=1.2)=>r0*Math.cbrt(A);
export function uniformDensity(r0){const number=3/(4*Math.PI*r0**3);return {number,perCM3:number*1e39,kgM3:number*U_KG*1e45};}
export const fermi=(r,R,a,rho=.165)=>rho/(1+Math.exp((r-R)/a));
export const skinThickness=a=>4*Math.log(3)*a;
export function linearSurface(A,width=3,r0=1.1,rho=.17){const c=nuclearRadius(A,r0),lo=c-width/2,hi=c+width/2;if(lo<0)throw Error('Linear surface model requires R ≥ width/2');const volumeFactor=c**3+c*width**2/4,total=4*Math.PI/3*rho*volumeFactor;return {c,lo,hi,total,fraction:1-lo**3/volumeFactor};}
export function evaluate(mode,s){switch(mode){
case 'overview':case 'nuclides':case 'relations':return {...nuclide(s.Z,s.N),other:nuclide(s.Z2,s.N2),relations:relation(s.Z,s.N,s.Z2,s.N2)};
case 'isomers':return {excitation:s.excitation,massIncrement:s.excitation/1000/U_MEV};
case 'mass':return massEnergy(s.mass);
case 'binding':return bindingEnergy(s.isotope);
case 'beta':return {daughterZ:s.Z+1,daughterN:s.N-1,A:s.Z+s.N,...decayState(s.seconds),halfLife:NEUTRON_LIFETIME*Math.log(2),Q:(MN-MP)*U_MEV-ELECTRON_MEV};
case 'scattering':case 'recoil':return closestApproach(s.z1,s.z2,s.energy,s.m1,s.m2,s.recoil===1);
case 'radius':return {radius:nuclearRadius(s.A,s.r0),volume:4*Math.PI/3*nuclearRadius(s.A,s.r0)**3,...uniformDensity(s.r0)};
case 'charge':return {charge:s.Z*E,atomNet:(s.Z-s.electrons)*E};
case 'fermi':{const R=nuclearRadius(s.A,s.r0),probe=s.probe??3;return {R,probe,density:fermi(probe,R,s.diffuseness,s.rho),skin:skinThickness(s.diffuseness),central:s.rho,atR:s.rho/2};}
case 'particles':return {electronEnergy:ELECTRON_MEV,muonMass:105.6583755,pionMass:139.57039,protonMass:MP*U_MEV};
case 'surface':return linearSurface(s.A,s.width);
default:throw Error('Unknown nuclear model');}}
