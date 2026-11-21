export const constants = Object.freeze({
  k: 931.49410372, hydrogen: 1.007825031898, neutron: 1.00866491590,
  electronMeV: 0.51099895069, radius: 1.2,
});
export const coefficients = Object.freeze({volume: 15.5, surface: 16.8, coulomb: 0.72, asymmetry: 23.5, pairing: 12});
export const termNames = Object.freeze({volume:'Volume', surface:'Surface', coulomb:'Coulomb', asymmetry:'Asymmetry', pairing:'Pairing'});
export const particles = Object.freeze({n:[1,0,'Neutron'],p:[1,1,'Proton'],alpha:[4,2,'Helium-4']});

export function valid(A,Z,min=1) {
  return Number.isInteger(A) && Number.isInteger(Z) && A>=min && Z>=0 && Z<=A;
}
export function inModel(A,Z) {
  return valid(A,Z,5) && A<=250;
}
export function parity(A,Z) {
  return A%2 ? (Z%2?'odd Z, even N':'even Z, odd N') : Z%2?'odd–odd':'even–even';
}
export function binding(A,Z,mass,c=constants) {
  const defect=Z*c.hydrogen+(A-Z)*c.neutron-mass;
  const B=defect*c.k;
  return {defect,B,per:B/A};
}
export function electronicCorrection(Z,totalBindingMeV,hydrogenBindingMeV) {
  return totalBindingMeV-Z*hydrogenBindingMeV;
}
export function liquidDrop(A,Z,c=coefficients) {
  if(!inModel(A,Z)) return null;
  const N=A-Z, a13=Math.cbrt(A);
  const terms={
    volume:c.volume*A,
    surface:-c.surface*a13*a13,
    coulomb:-c.coulomb*Z*(Z-1)/a13,
    asymmetry:-c.asymmetry*(N-Z)**2/A,
    pairing:A%2 ? 0 : (Z%2 ? -1 : 1)*c.pairing/Math.sqrt(A),
  };
  const B=Object.values(terms).reduce((sum,term)=>sum+term,0);
  const R=constants.radius*a13;
  return {A,Z,N,R,density:A/(4*Math.PI*R**3/3),terms,B,per:B/A,mass:Z*constants.hydrogen+N*constants.neutron-B/constants.k};
}
export function parabola(A,c=coefficients,approx=false) {
  if(!inModel(A,0)) return null;
  const a13=Math.cbrt(A), ac=c.coulomb/a13, aa=c.asymmetry;
  const C0=constants.k*A*constants.neutron-c.volume*A+c.surface*a13*a13+aa*A;
  const C1=approx ? -4*aa : constants.k*(constants.hydrogen-constants.neutron)-ac-4*aa;
  const C2=ac+4*aa/A, vertex=-C1/(2*C2), minimum=C0-C1*C1/(4*C2);
  return {C0,C1,C2,vertex,minimum,smooth:Z=>C2*(Z-vertex)**2+minimum};
}
export function modelEnergy(A,Z) {
  const drop=liquidDrop(A,Z);
  return drop ? constants.k*(Z*constants.hydrogen+(A-Z)*constants.neutron)-drop.B : null;
}
export function threshold(A,Z,kind,lookup) {
  const [a,z]=particles[kind], daughter=[A-a,Z-z];
  if(!valid(A,Z)||!valid(...daughter)) return {available:false,reason:'This removal leaves an invalid daughter composition.',daughter};
  const initial=lookup(A,Z), final=lookup(...daughter), outgoing=lookup(a,z,true);
  if([initial,final,outgoing].some(record=>!record)) {
    return {available:false,reason:'A required mass is unavailable in the selected source or model domain.',daughter};
  }
  const Q=(final.mass+outgoing.mass-initial.mass)*constants.k;
  const byBinding=binding(A,Z,initial.mass).B-binding(...daughter,final.mass).B-binding(a,z,outgoing.mass).B;
  return {available:true,Q,byBinding,daughter,outgoing,extrapolated:[initial,final,outgoing].some(row=>row.extrapolated)};
}
export function transition(energy,A,Z,dz,positronCount=0) {
  if(!valid(A,Z)||!valid(A,Z+dz))return null;
  const parent=energy(A,Z), daughter=energy(A,Z+dz);
  if(!Number.isFinite(parent)||!Number.isFinite(daughter))return null;
  const q=parent-daughter-2*constants.electronMeV*positronCount;
  return Math.abs(q)<1e-10?0:q;
}
export const permitted=q=>q===null?'Unavailable':q>0?'Allowed':q<0?'Closed':'At threshold';
export function loadRecords(data) {
  if(data.format!==1||data.massEdition!=='AME2020'||data.propertyEdition!=='NUBASE2020')throw Error('Unsupported nuclide data edition');
  const records=data.rows.map(([A,Z,symbol,mass,uncertainty,extrapolated,property])=>({
    A,Z,symbol,mass,uncertainty,extrapolated,property,key:A+','+Z,
    ...binding(A,Z,mass),
  }));
  const map=new Map(records.map(row=>[row.key,row]));
  return {records, stableCounts:data.stableCounts, get:(A,Z)=>map.get(A+','+Z)??null};
}
