export const chapters = [
  {id:'binding', title:'Binding Energy and Mass Defect', page:1, text:'Follow the mass difference from separated particles to a bound atom, then compare nuclei on the same energy scale.'},
  {id:'separation', title:'Separation Energy and Pairing', page:3, text:'Choose what to remove and compare the parent with the daughter and outgoing particle.'},
  {id:'drop', title:'Build the Liquid Drop Model', page:6, text:'Explore how five contributions add to the binding energy and where the smooth model departs from evaluated masses.'},
  {id:'parabolas', title:'Mass Parabolas and Beta Decay', page:14, text:'Hold the mass number fixed and read which ground-state transitions are energetically allowed.'},
];

export const modes = {
  binding:{ledger:'Energy ledger', mirror:'Mirror nuclei', curve:'Binding curve'},
  separation:{removal:'Removal and threshold', chain:'Neighboring nuclei'},
  drop:{terms:'Drop and energy terms', charge:'Charge assembly', filling:'Level filling', chart:'Nuclide chart', residual:'Shell residuals'},
  parabolas:{vertex:'Parabola and vertex', transitions:'Transition energies', branches:'Odd and even mass numbers'},
};
export const defaults = {
  binding:{A:15,Z:7,mode:'ledger',focus:''},
  separation:{A:16,Z:8,mode:'removal',kind:'n',source:'eval',focus:'',removed:false},
  drop:{A:40,Z:20,mode:'terms',focus:'volume',omit:'',parity:'all',well:false},
  parabolas:{A:33,Z:14,mode:'vertex',focus:'',source:'both',full:false,approx:false},
};
export const beats = {
  binding:[
    ['ledger','electron',{},'A neutral-atom calculation uses hydrogen masses to balance the electron count.'],
    ['ledger','gap',{},'A bound atom lies below its separated constituents. The gap gives its binding energy.'],
    ['ledger','average',{},'Dividing the gap by A gives the average binding energy per nucleon.'],
    ['mirror','compare',{A:15,Z:8},'Nitrogen-15 and oxygen-15 have the same A, so their total and average binding have the same ordering.'],
    ['curve','regions',{},'The broad iron–nickel maximum helps explain why some balanced reactions toward intermediate nuclei release energy.'],
  ],
  separation:[
    ['removal','particle',{removed:false},'Choose the outgoing particle to define the final state.'],
    ['removal','daughter',{removed:true},'The daughter and outgoing particle together have the original A and Z.'],
    ['removal','threshold',{removed:true},'The signed gap is the energy needed for this specific removal.'],
    ['removal','cluster',{A:16,Z:8,kind:'alpha',removed:true},'Helium-4 carries its own binding energy, which enters the final-state balance.'],
    ['chain','pairing',{A:17,Z:8,kind:'n',source:'eval'},'Compare neighboring thresholds to see how pairing contributes to the even–odd pattern.'],
  ],
  drop:[
    ['terms','volume',{},'Short-range attraction gives each interior nucleon a limited set of neighbors.'],
    ['terms','surface',{A:64,Z:32},'As the drop grows, fewer nucleons per unit volume lie near the boundary.'],
    ['charge','coulomb',{shells:5},'Adding successive charged shells costs energy as each shell repels the charge already inside.'],
    ['filling','asymmetry',{A:38,Z:17},'At fixed A, neutron excess pushes the last neutrons into higher schematic levels.'],
    ['terms','pairing',{A:38,Z:19},'Odd–odd, odd-A and even–even nuclei get different signed pairing contributions.'],
    ['chart','diagonal',{},'Heavier stable nuclides tend toward neutron excess because additional neutrons add no proton Coulomb repulsion.'],
    ['residual','shell',{},'Evaluated binding minus the smooth model highlights local departures near shell closures.'],
  ],
  parabolas:[
    ['vertex','adjacent',{},'Adjacent nuclei on the same parabola exchange one neutron and one proton at fixed A.'],
    ['vertex','vertex',{},'The smooth derivative vanishes at the vertex. The physical nuclei occupy integer Z values.'],
    ['transitions','threshold',{A:33,Z:14,channel:'plus'},'Electron capture and positron emission have separate energy thresholds for the same daughter.'],
    ['branches','pairing',{A:102,Z:46},'Even A splits the model into two parity branches, which can yield several local single-step minima.'],
    ['transitions','double',{A:102,Z:46,source:'both',channel:'double'},'Pd-102 to Ru-102 is energetically possible by two-unit electron capture even though the single step to Rh-102 is uphill.'],
    ['transitions','approx',{A:33,Z:14,source:'model',channel:'minus',approx:true},'For Si-33, the lecture approximation drops two linear terms and changes the computed beta-minus Q value.'],
  ],
};
export const presets = {
  mirror:['binding',2,{A:15,Z:8,mode:'mirror'}],
  curve:['binding',3,{mode:'curve'}],
  fission:['binding',4,{mode:'curve',focus:'regions'}],
  alpha:['separation',5,{kind:'alpha',removed:true}],
  pairing:['separation',13,{A:17,Z:8,mode:'chain'}],
  stable:['drop',6,{mode:'chart'}],
  surface:['drop',9,{focus:'surface'}],
  charge:['drop',10,{mode:'charge',focus:'coulomb'}],
  potassium:['drop',11,{A:38,Z:19,mode:'filling'}],
  chlorine:['drop',11,{A:38,Z:17,mode:'filling'}],
  wells:['drop',12,{A:38,Z:17,mode:'filling',well:true}],
  shell:['drop',13,{mode:'residual'}],
  silicon:['parabolas',17,{mode:'transitions',source:'model'}],
  odd:['parabolas',18,{A:135,Z:55,mode:'branches'}],
  even:['parabolas',18,{A:102,Z:46,mode:'branches'}],
  palladium:['parabolas',18,{A:102,Z:46,mode:'transitions',source:'both',focus:'double'}],
};
export function pageTopic(page) {
  return page<=2?'binding':page<=5?'separation':page<=13?'drop':'parabolas';
}
export const anchors = [
  [1,'Atomic mass and binding','binding'],[2,'The mirror example','binding','mirror'],
  [3,'Binding systematics','binding','curve'],[3,'Neutron separation','separation'],
  [4,'Qualitative heavy-nucleus comparison','binding','fission'],[5,'Alpha removal','separation','alpha'],
  [6,'Nuclide chart and parity','drop','stable'],[7,'Five-term mass model','drop'],
  [8,'Saturation and the volume term','drop'],[9,'Surface penalty','drop','surface'],
  [10,'Uniform sphere and distinct pairs','drop','charge'],[11,'A = 38 and the Pauli principle','drop','chlorine'],
  [12,'Schematic proton and neutron wells','drop','wells'],[13,'Separation-energy staggering','separation','pairing'],
  [13,'Shell effects','drop','shell'],[14,'Isobars and model limits','parabolas'],
  [15,'Expand the mass polynomial','parabolas'],[16,'Find the smooth minimum','parabolas'],
  [17,'Silicon-33 worked example','parabolas','silicon'],[18,'Odd and even isobars','parabolas','odd'],
  [18,'Palladium-102 ground-state energetics','parabolas','palladium'],
];
