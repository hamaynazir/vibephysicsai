export const U_MEV=931.49410372,U_KG=1.66053906892e-27,E=1.602176634e-19,COULOMB=1.43996455,MP=1.0072764665789,MN=1.00866491606;
export const NEUTRON_LIFETIME = 878.4;
export const ELECTRON_MEV = 0.51099895069;
export const DECAY_LIMIT = 3000;
export const COHORT_SIZE = 48;
export const FERMI_RANGE = 15;
export const AVOGADRO = 6.02214076e23;
export const ALPHA_MASS = 4.001506179129;
export const TC_ISOMER = {excitation:142.6836, halfLifeHours:6.0066, groundHalfLifeYears:211100};
export const bindingNuclides = {
  'h-2': {Z: 1, N: 1, mass: 2.014101777844, reference: 1.1122831},
  'he-4': {Z: 2, N: 2, mass: 4.00260325413, reference: 7.0739156},
  'c-12': {Z: 6, N: 6, mass: 12, reference: 7.6801446},
  'fe-56': {Z: 26, N: 30, mass: 55.934935537, reference: 8.7903563},
  'ni-62': {Z: 28, N: 34, mass: 61.928344753, reference: 8.7945555},
  'pb-208': {Z:82,N:126,mass:207.976652005,reference:7.8674530},
};
// AME2020 neutral hydrogen and free-neutron masses from the comparison table.
const hydrogenAtom = 1.007825031898;
const neutronMass = 1.00866491590;
export const elementNames='n H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U'.split(' ');
const names = 'Neutron Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc'.split(' ');
export const nuclide=(Z,N)=>({Z,N,A:Z+N,symbol:elementNames[Z]||'X',name:names[Z],charge:Z*E});
export const massSamples = {
  electron:{name:'Electron', mass:5.485799090441e-4},
  proton:{name:'Proton', mass:MP},
  neutron:{name:'Neutron', mass:MN},
  alpha:{name:'Helium-4 nucleus', mass:ALPHA_MASS},
  unit:{name:'Unified atomic mass unit',mass:1},
  h1:{name:'Hydrogen-1',mass:hydrogenAtom,A:1,Z:1},
  he4:{name:'Helium-4',mass:bindingNuclides['he-4'].mass,A:4,Z:2},
  li7:{name:'Lithium-7',mass:7.01600343426,A:7,Z:3},
  be9:{name:'Beryllium-9',mass:9.012183062,A:9,Z:4},
  c12:{name:'Carbon-12',mass:12,A:12,Z:6},
};
export const valenceCharge = quarks => [...quarks].reduce((thirds,q)=>thirds+(q==='u'?2:-1),0)/3;
export function betaBookkeeping(Z,N) {
  return {daughterZ:Z+1,daughterN:N-1,A:Z+N,chargeBefore:Z,chargeAfter:Z+1-1,leptons:1-1};
}
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
export function coulombState(s, progress) {
  const {ecm, distance: headOn} = closestApproach(s.z1, s.z2, s.energy, s.m1, s.m2, s.recoil === 1);
  const reducedMass = (s.recoil === 1 ? s.m1 * s.m2 / (s.m1 + s.m2) : s.m1) * U_MEV;
  const infinitySpeed = Math.sqrt(2 * ecm / reducedMass);
  const b = s.impact ?? 0;
  const scale = headOn / 2, eccentricity = Math.hypot(1,b/scale);
  const distance = scale * (1 + eccentricity);
  const maxSeparation = collisionRange * distance;
  const endParameter = Math.acosh((maxSeparation/scale-1)/eccentricity);
  const elapsed = u => u + eccentricity*Math.sinh(u);
  const signed = 2 * Math.max(0, Math.min(1, progress)) - 1;
  // Repulsive Kepler hyperbola, with the head-on radial path as its b=0 limit.
  const target = Math.abs(signed) * elapsed(endParameter);
  let lo = 0, hi = endParameter;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (elapsed(mid) < target) lo = mid;
    else hi = mid;
  }
  const u = Math.sign(signed)*(lo + hi) / 2;
  const position = [scale*(eccentricity+Math.cosh(u)),b*Math.sinh(u)];
  const separation = Math.hypot(...position);
  const potential = ecm * headOn / separation;
  const kinetic = Math.max(0, ecm - potential);
  const time = scale/infinitySpeed*elapsed(u);
  const dtdu=separation/infinitySpeed;
  const vector=[scale*Math.sinh(u)/dtdu,b*Math.cosh(u)/dtdu];
  const targetFraction=s.recoil===1?s.m1/(s.m1+s.m2):0;
  const comSpeed=targetFraction*Math.sqrt(2*s.energy/(s.m1*U_MEV));
  // Incoming velocity points along (-scale, b) in the hyperbola's axes.
  const drift=[-scale,b].map(component=>component/Math.hypot(scale,b)*comSpeed*time);
  return {ecm,distance,separation,potential,kinetic,maxSeparation,time,position,vector,
    incoming:[-scale/Math.hypot(scale,b),b/Math.hypot(scale,b)],
    outgoing:[scale/Math.hypot(scale,b),b/Math.hypot(scale,b)],
    velocity:Math.sign(signed)*Math.sqrt(2*kinetic/reducedMass),angle:2*Math.atan2(scale,b)*180/Math.PI,
    targetFraction,drift,
    angularMomentum:reducedMass*infinitySpeed*b};
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
export const shellDensity = (r,density) => 4*Math.PI*r*r*density;
export function fermiProfile(R,a,rho) {
  // Composite Simpson rule with an exponential tail below e^-32.
  const count=512, step=(R+32*a)/count;
  let integral=0;
  for(let i=0;i<=count;i++) {
    const r=i*step, weight=i===0||i===count?1:i%2?4:2;
    integral+=weight*shellDensity(r,fermi(r,R,a,rho));
  }
  return integral*step/3;
}
export function densityState(s) {
  const R=nuclearRadius(s.A,s.r0), probe=s.probe??3;
  const integral=fermiProfile(R,s.diffuseness,1);
  const rho=s.normalization==='normalize'?s.A/integral:s.rho;
  return {R,probe,rho,density:fermi(probe,R,s.diffuseness,rho),skin:skinThickness(s.diffuseness),
    atR:rho/2,total:rho*integral,shell:shellDensity(probe,fermi(probe,R,s.diffuseness,rho))};
}
export function alphaBinding() {
  const separated=2*(MP+MN), defect=separated-ALPHA_MASS;
  return {Z:2,N:2,A:4,mass:ALPHA_MASS,separated,defect,energy:defect*U_MEV,perNucleon:defect*U_MEV/4,excess:undefined};
}
export function fermiWalkthrough(state, position) {
  const R = nuclearRadius(state.A, state.r0);
  const smooth = t => {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  };
  const diffuseness = state.diffuseness + (Math.min(1, state.diffuseness + .35) - state.diffuseness) * smooth((position - 6) / 2);
  const probe = R * smooth(position / 2) + skinThickness(diffuseness) / 2 * smooth((position - 4) / 2);
  return {...state, diffuseness, probe};
}
export function linearSurface(A,width=3,r0=1.1,rho=.17){const c=nuclearRadius(A,r0),lo=c-width/2,hi=c+width/2;if(lo<0)throw Error('Linear surface model requires R ≥ width/2');const volumeFactor=c**3+c*width**2/4,total=4*Math.PI/3*rho*volumeFactor;return {c,lo,hi,total,fraction:1-lo**3/volumeFactor};}
export function evaluate(mode,s){switch(mode){
case 'overview':case 'nuclides':case 'relations':return {...nuclide(s.Z,s.N),other:nuclide(s.Z2,s.N2),relations:relation(s.Z,s.N,s.Z2,s.N2)};
case 'isomers':return {excitation:s.excitation,massIncrement:s.excitation/1000/U_MEV};
case 'mass':return massEnergy(s.mass);
case 'binding':return s.view==='alpha'?alphaBinding():bindingEnergy(s.isotope);
case 'beta':return {...betaBookkeeping(s.Z,s.N),...decayState(s.seconds),halfLife:NEUTRON_LIFETIME*Math.log(2),Q:(MN-MP)*U_MEV-ELECTRON_MEV};
case 'scattering':case 'recoil':return closestApproach(s.z1,s.z2,s.energy,s.m1,s.m2,s.recoil===1);
case 'radius':return {radius:nuclearRadius(s.A,s.r0),volume:4*Math.PI/3*nuclearRadius(s.A,s.r0)**3,...uniformDensity(s.r0)};
case 'charge':return {charge:s.Z*E,atomNet:(s.Z-s.electrons)*E};
case 'fermi':return densityState(s);
case 'particles':return {electronEnergy:ELECTRON_MEV,muonMass:105.6583755,pionMass:139.57039,protonMass:MP*U_MEV};
case 'surface':return linearSurface(s.A,s.width);
default:throw Error('Unknown nuclear model');}}
