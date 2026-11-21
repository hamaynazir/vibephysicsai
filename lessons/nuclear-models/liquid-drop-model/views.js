
import katex from '../../../vendor/katex.mjs';
import {constants,coefficients,particles,termNames,parity,liquidDrop,modelEnergy,parabola,threshold,transition,permitted} from './model.js';
import {num,ledger,removal,dropScene,parabolaScene} from './visuals.js';

const math=tex=>katex.renderToString(tex,{output:'mathml',displayMode:true,throwOnError:true});
const fmt=(v,d=2)=>num(v,d);
const signed=(v,d=2)=>v>0?'+'+fmt(v,d):fmt(v,d);
const value=(v,unit,d=2)=>Number.isFinite(v)?`${fmt(v,d)} ${unit}`:'Unavailable';
export const name=r=>r?.symbol?r.symbol==='n'?'Neutron':`${r.symbol}-${r.A}`:r?`A = ${r.A}, Z = ${r.Z}`:'Unavailable';
export const option=(v,label,selected)=>`<option value="${v}" ${v===selected?'selected':''}>${label}</option>`;
const select=(key,label,entries,state)=>`<label>${label}<select data-key="${key}">${Object.entries(entries).map(([v,l])=>option(v,l,state[key])).join('')}</select></label>`;
const number=(key,label,min,max,state)=>`<label>${label}<input data-key="${key}" type="number" required min="${min}" max="${max}" step="1" value="${state[key]}"></label>`;
const check=(key,label,state)=>`<label class="drop-check"><input type="checkbox" data-key="${key}" ${state[key]?'checked':''}>${label}</label>`;
const actions=(action,label,disabled=false)=>`<button type="button" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
const preset=(id,label)=>`<button type="button" data-preset="${id}">${label}</button>`;
const counts=state=>number('A','Mass number A',5,250,state)+number('Z','Proton number Z',0,state.A,state);
const sourceLabel=r=>!r?'Mass unavailable':r.extrapolated?'AME2020 · extrapolated':'AME2020 · evaluated mass';
const metric=(label,reading)=>`<span>${label}<strong>${reading}</strong></span>`;
const metrics=(...values)=>`<div class="inline-metrics">${values.join('')}</div>`;
export const delta=String.raw`\Delta m=Zm_\mathrm{H}+Nm_\mathrm n-M_\mathrm{atom},\qquad B_\mathrm{atom}=\Delta m c^2`;
const lookupModel=(A,Z,outgoing,data)=>{
  if(outgoing) {
    if(A===1)return {mass:Z===1?constants.hydrogen:constants.neutron,source:'reference'};
    return data.get(A,Z);
  }
  return liquidDrop(A,Z);
};
export function getThreshold(state,data,A=state.A,Z=state.Z) {
  return threshold(A,Z,state.kind,state.source==='model'?(a,z,outgoing)=>lookupModel(a,z,outgoing,data):data.get);
}
function chainFor(state,data) {
  const {A,Z}=state,N=A-Z;
  const match=r=>state.kind==='p'?r.A-r.Z===N:r.Z===Z;
  const rows=state.source==='eval'?data.records.filter(match):
    Array.from({length:21},(_,i)=>({A:A-10+i,Z:state.kind==='p'?A-10+i-N:Z})).filter(r=>r.A>=5&&r.A<=250&&r.Z>=0&&r.Z<=r.A);
  return rows.map(r=>({...r,result:getThreshold(state,data,r.A,r.Z)})).sort((a,b)=>a.A-b.A);
}
function nuclide(state,data) {
  return `<label>Nuclide<input data-key="nuclide" list="nuclide-options" value="${name(data.get(state.A,state.Z))}" autocomplete="off" placeholder="e.g. O-16"></label>`;
}
function bindingView(state,data) {
  const selected=data.get(state.A,state.Z), n=data.get(15,7),o=data.get(15,8);
  const mirror=state.mode==='mirror';
  const curve=state.mode==='curve';
  const uncertainty=(u,unit)=>(u*constants.k).toPrecision(3)+' '+unit;
  const unc=selected?.uncertainty==null?'Unavailable':uncertainty(selected.uncertainty,'MeV');
  const caption=selected?`${name(selected)} · ${sourceLabel(selected)}${curve?' · Drag across the curve to select a nucleus. Scatter points exclude extrapolated masses.':' · Gap and composition symbols are schematic.'}`:'This evaluated mass is unavailable.';
  return {
    graphic:ledger(selected,n,o,state,data.records),caption,
    choices:nuclide(state,data),
    actions:preset('mirror','Compare with oxygen-15')+preset('curve','Show binding curve'),
    readings:selected?metrics(metric('Atomic mass',selected.mass.toString()+' u'),metric('Mass defect',value(selected.defect,'u',8)),
      metric('B',value(selected.B,'MeV',3)),metric('B/A',value(selected.per,'MeV/nucleon',3)),metric('Mass uncertainty × c²',unc),
      selected.uncertainty==null?'':metric('Mass uncertainty / A',uncertainty(selected.uncertainty/selected.A,'MeV/nucleon')),
      mirror?metric('N-15 minus O-15',value(n.B-o.B,'MeV',3)):''):'',
    math:math(delta)+math(String.raw`M_\mathrm{atom}c^2=M_\mathrm{nucleus}c^2+Zm_\mathrm ec^2-E_{\mathrm e,tot}`)+
      math(String.raw`B_\mathrm{nuc}=(Zm_\mathrm p+Nm_\mathrm n-M_\mathrm{nucleus})c^2`)+
      math(String.raw`B_\mathrm{atom}-B_\mathrm{nuc}=E_{\mathrm e,tot}-ZE_\mathrm H`)+
      `<p>The neutral-atom ledger balances electrons by using hydrogen atoms. Bare masses instead use proton and nucleus masses. The signed electronic correction connects the two results.</p>
      <p>Using the brief’s rounded pp. 2 and supplied summary inputs (15.000109 u and 15.003065 u, hydrogen 1.007825 u, neutron 1.008665 u and 931.494 MeV/u) gives 115.49 and 111.96 MeV, or 7.699 and 7.464 MeV/nucleon. The total difference is about 3.54 MeV. Rounded masses and constants change the final digits.</p>
      <p>Binding per nucleon is an average. A removal energy compares a particular parent and products. A lifetime cannot be inferred from average binding.</p>`+
      (curve?`<p>In a balanced reaction, total product binding minus total reactant binding gives the energy release under a consistent particle convention. At fixed total nucleon count, a higher weighted average binding means a larger total binding. Some splittings of heavy nuclei favor more tightly bound products.</p>${captureExample(data)}`:''),
    points:curve?data.records.filter(r=>!r.extrapolated&&r.A>1&&r.per>=-1&&r.per<=10):[],
  };
}
function captureExample(data){
  const reactants=[data.get(3,2),data.get(4,2)], product=data.get(7,4);
  if(!product||reactants.some(r=>!r))return '';
  const q=product.B-reactants[0].B-reactants[1].B;
  return math(String.raw`{}^3\mathrm{He}+{}^4\mathrm{He}\longrightarrow{}^7\mathrm{Be}+\gamma`)+
    `<p>AME2020 neutral-atom example · Both sides have A = 7 and Z = 4. The product’s total binding exceeds the reactants’ sum by ${value(q,'MeV',3)}.</p>`;
}
function separationView(state,data) {
  const result=getThreshold(state,data), chain=state.mode==='chain'?chainFor(state,data):[];
  const current=data.get(state.A,state.Z), daughter=data.get(...result.daughter);
  const [a,z,particle]=particles[state.kind];
  const caption=result.available?`${name(current||state)} → ${name(daughter||{A:result.daughter[0],Z:result.daughter[1]})} + ${particle.toLowerCase()} · ${state.source==='model'?'SEMF nuclei, reference outgoing mass':result.extrapolated?'AME2020 · contains an extrapolated mass':'AME2020 · evaluated masses'}`:result.reason;
  const low=getThreshold({...state,kind:'n'},data), high=getThreshold({...state,kind:'n'},data,state.A+1,state.Z);
  const estimator=state.A%2&&state.Z%2===0&&low.available&&high.available?value((high.Q-low.Q)/2,'MeV',3):'Select odd A and even Z with both thresholds available.';
  return {
    graphic:removal(state,result,chain,particle),
    caption:caption+(result.available&&(state.removed||state.mode==='chain')?` · S = ${signed(result.Q,3)} MeV.`:'')+
      (state.mode==='chain'?' Drag across the plot to compare thresholds. Teal even, violet odd.':
        state.removed?' The energy axis uses the initial state as zero.':' Drag the particle into the final-state box or use the Remove button.'),
    choices:select('kind','Outgoing particle',{n:'Neutron',p:'Proton',alpha:'Alpha (helium-4)'},state)+
      select('source','Mass source',{eval:'AME2020',model:'SEMF + reference outgoing mass'},state)+(state.source==='eval'?nuclide(state,data):counts(state)),
    actions:state.mode==='chain'?preset('pairing','Pairing example'):actions('remove',state.removed?'Restore parent':'Remove '+particle.toLowerCase(),!result.available),
    readings:result.available&&(state.removed||state.mode==='chain')?metrics(metric('Signed threshold',value(result.Q,'MeV',3)),
      metric('Channel',result.Q<0?'Energetically open':result.Q>0?'Energy required':'At threshold'),
      metric('Final A and Z',`${state.A-a} + ${a} = ${state.A}; ${state.Z-z} + ${z} = ${state.Z}`),
      state.focus==='cluster'?metric('Outgoing helium-4 binding',value(liquidAlpha(data),'MeV',3)):''):'',
    math:math(String.raw`S_{a,z}=\big[M(A-a,Z-z)+M(a,z)-M(A,Z)\big]c^2`)+
      math(String.raw`S_{a,z}=B(A,Z)-B(A-a,Z-z)-B(a,z)`)+
      `<p>Substitute the three atomic mass balances. On both sides the hydrogen and neutron contributions have coefficients Z and N, so they cancel. Hydrogen represents the outgoing proton in this convention, and helium-4 represents alpha removal. The SEMF view uses reference masses for the outgoing light species.</p>`+
      (result.available?`<p>The mass form gives ${fmt(result.Q,5)} MeV. The binding form gives ${fmt(result.byBinding,5)} MeV.</p>`:'')+
      math(String.raw`\widehat{\delta}(A,Z)=\frac{S_\mathrm{n}(A+1,Z)-S_\mathrm{n}(A,Z)}{2}`)+
      `<p>Local odd-A, even-Z pairing estimate · ${estimator} The smooth background has curvature, so this finite difference also picks up part of that background. The odd–even labels refer to N at fixed Z for neutron removal, and Z at fixed N for proton removal. For alpha removal the chain holds Z fixed.</p>`,
    points:chain.filter(r=>r.result.available),canRemove:result.available,
    motionKey:state.mode==='chain'?`${state.source}:${state.kind}:${state.kind==='p'?state.A-state.Z:state.Z}`:state.kind,
  };
}
function liquidAlpha(data){return data.get(4,2)?.B;}
const parityLabels=['Even Z, even N','Even Z, odd N','Odd Z, even N','Odd Z, odd N'];
const termCopy={
  volume:'Short-range nuclear attraction saturates. Adding interior nucleons therefore gives an approximately constant gain per nucleon.',
  surface:'Surface nucleons have fewer neighbors. The negative surface contribution per nucleon falls in magnitude as the drop grows.',
  coulomb:'Proton pairs repel. The fitted penalty vanishes at Z = 0 or 1 and increases with the number of distinct proton pairs.',
  asymmetry:'Neutron–proton imbalance pushes one species to higher levels. The smooth fit penalizes the squared imbalance.',
  pairing:'The binding term is positive for even–even, zero for odd A and negative for odd–odd.',
};
function dropView(state,data) {
  const model=liquidDrop(state.A,state.Z), record=data.get(state.A,state.Z);
  const residual=record&&!record.extrapolated?record.B-model.B:null;
  const focus=state.focus in termNames?state.focus:'volume';
  const chart=state.mode==='chart', residualView=state.mode==='residual', filling=state.mode==='filling';
  const surface=state.mode==='terms'&&focus==='surface';
  const omit=state.omit?model.B-model.terms[state.omit]:null;
  const selection=state.mode==='terms'?select('focus','Focus term',termNames,state)+
    select('omit','Teaching comparison',{'':'All five terms',...termNames},state):'';
  const status=chart?'NUBASE2020 · ground states marked stable.':
    residualView?'AME2020 evaluated binding minus the SEMF. Teal positive, violet negative.':
    filling?'Schematic filling. Markers show the highest levels in the displayed window.':
    state.mode==='charge'?'Uniform-sphere derivation uses the continuum charge. The fitted term counts distinct proton pairs.':
    termCopy[focus]+' Particle markers and links are schematic.';
  return {
    graphic:dropScene(model,state,data),
    caption:status,
    choices:counts(state)+selection+
      (chart?select('parity','Parity filter',{all:'All',...Object.fromEntries(parityLabels.map((l,i)=>[Math.floor(i/2)+','+i%2,l]))},state):'')+
      (filling?check('well','Show schematic wells and Coulomb shift',state):'')+
      (state.mode==='charge'?select('shells','Charged shells assembled',{1:'1 of 5',2:'2 of 5',3:'3 of 5',4:'4 of 5',5:'5 of 5'},{shells:String(state.shells??3)}):''),
    actions:filling?actions('neutron-excess','Replace a proton with a neutron',state.Z===0)+preset('potassium','A = 38, Z = 19')+preset('chlorine','A = 38, Z = 17'):
      state.mode==='terms'?actions('grow','Grow A at fixed proton fraction',state.A>=250)+
      (focus==='pairing'?actions('even-even','Even–even')+actions('odd-a','Odd A')+actions('odd-odd','Odd–odd'):''):'',
    readings:metrics(metric('SEMF binding',value(model.B,'MeV',3)),metric('Radius',value(model.R,'fm',3)),
      metric('Composition parity',parity(state.A,state.Z)),state.mode==='terms'?metric(termNames[focus],`${value(model.terms[focus],'MeV',3)} · ${value(model.terms[focus]/state.A,'MeV/nucleon',3)}`):'',
      surface?metric('Uniform number density',value(model.density,'fm⁻³',3)):'',
      omit!==null?metric('Omitting '+termNames[state.omit].toLowerCase(),value(omit,'MeV',3)):'',
      residualView?metric('Evaluated minus SEMF',value(residual,'MeV',3)):''),
    math:math(String.raw`B=a_vA-a_sA^{2/3}-a_c\frac{Z(Z-1)}{A^{1/3}}-a_a\frac{(N-Z)^2}{A}+\delta`)+
      math(String.raw`R=(1.2\,\mathrm{fm})A^{1/3},\qquad \rho=\frac{A}{4\pi R^3/3}`)+
      `<p>Lecture coefficient set (MeV) · 15.5, 16.8, 0.72, 23.5 and 12. Pairing is ±12/√A for even–even / odd–odd and zero for odd A. The prompt supplies the default set. Page 8 of the available lecture gives rounded values from a different fit. The separate 0.17 fm⁻³ is an approximate nuclear-density scale.</p>`+
      (state.mode==='charge'?math(String.raw`Q(r)=Ze(r/R)^3,\quad \mathrm dU=\frac{Q(r)\,\mathrm dQ}{4\pi\epsilon_0r},\quad U=\frac35\frac{(Ze)^2}{4\pi\epsilon_0R}`)+
      '<p>Each shell interacts with the charge already assembled. The integral scales as Z²/R. The distinct-pair substitution Z(Z−1) excludes self-pairs in the fitted term.</p>':'')+
      (filling?math(String.raw`\nu=\tfrac12(N-Z),\qquad \Delta B_\mathrm{asym}=-a_a(N-Z)^2/A`)+'<p>At A = 38, Z = 19 gives zero. At Z = 17 (chlorine), N = 21 and the square is 16. The binding contribution is −9.895 MeV with the default set or −9.516 MeV using the p. 11 coefficient 22.6 MeV. The p. 11 worked line substitutes 4 where the formula requires 16 and writes Kr for Z = 17. The schematic well overlay shows a Coulomb increase of the proton potential. Its heights and depths have no energy scale.</p>':'')+
      (chart?`<div class="table-scroll"><table><thead><tr><th scope="col">Parity</th><th scope="col">Lecture p. 6<br>Stable + long-lived</th><th scope="col">NUBASE2020<br>Stable ground states</th></tr></thead><tbody>${parityLabels.map((l,i)=>`<tr><th scope="row">${l}</th><td>${['166 + 11 = 177','55 + 3 = 58','51 + 3 = 54','6 + 4 = 10'][i]}</td><td>${data.stableCounts[i]}</td></tr>`).join('')}</tbody></table></div><p>NUBASE2020 totals use ground-state index 0 and the half-life field marked stbl. Long-lived radioactive ground states are excluded from the evaluated column. Heavy nuclei benefit from more neutrons at fixed A as Coulomb repulsion competes with the asymmetry penalty. Neutrons do not shield electric charge.</p>`:'')+
      (residualView?'<p>Shell guides use canonical closures 2, 8, 20, 28, 50, 82 and 126. Residuals can reflect several missing effects and are absent for extrapolated or missing masses. The five-term baseline is used unchanged.</p>':''),
    points:chart?data.records.filter(r=>r.property==='stable'&&(state.parity==='all'||`${r.Z%2},${(r.A-r.Z)%2}`===state.parity)&&r.A>=5&&r.A<=250):
      residualView?data.records.filter(r=>!r.extrapolated&&r.A>=5&&r.A<=250):[],
  };
}

const transitions=[
  {id:'minus',label:'β⁻',dz:1,positrons:0},{id:'ec',label:'Electron capture',dz:-1,positrons:0},
  {id:'plus',label:'β⁺',dz:-1,positrons:1},{id:'double',label:'Two-unit EC',dz:-2,positrons:0},
];
function isobars(state,data) {
  const {A,Z}=state, poly=parabola(A);
  // All values, including the AME points, use this same offset at fixed A.
  const tableEnergy=(a,z)=>{
    const r=data.get(a,z);return r?r.mass*constants.k:null;
  };
  const useModel=state.source!=='eval', useEval=state.source!=='model';
  const lo=state.full?0:Math.max(0,Math.min(Math.floor(poly.vertex)-6,Z-2));
  const hi=state.full?A:Math.min(A,Math.max(Math.ceil(poly.vertex)+6,Z+2));
  const range=Array.from({length:hi-lo+1},(_,i)=>i+lo);
  const modelPoints=useModel?range.map(z=>({A,Z:z,e:modelEnergy(A,z)-poly.minimum})):[];
  const evalPoints=useEval?range.map(z=>data.get(A,z)).filter(Boolean).map(r=>({...r,e:r.mass*constants.k-poly.minimum})):[];
  const evalSelected=evalPoints.find(r=>r.Z===Z);
  const active=state.source==='eval'||(state.source==='both'&&evalSelected)?evalSelected:modelPoints.find(r=>r.Z===Z);
  const plotted=[...modelPoints,...evalPoints];
  const ymin=Math.min(0,...plotted.map(r=>r.e))-2,ymax=Math.max(5,...plotted.map(r=>r.e))+5;
  const channel=state.channel??(state.focus==='double'?'double':state.focus==='threshold'?'plus':'minus');
  const choice=transitions.find(t=>t.id===channel), target=active?(active===evalSelected?evalPoints:modelPoints).find(r=>r.Z===Z+choice.dz):null;
  const result=fn=>transitions.map(t=>({...t,q:transition(fn,A,Z,t.dz,t.positrons)}));
  const evaluated=result(tableEnergy), modeled=result(modelEnergy);
  const discretes=Array.from({length:A+1},(_,z)=>z);
  const closest=discretes.reduce((best,z)=>modelEnergy(A,z)<modelEnergy(A,best)?z:best,0);
  const SiFull=transition(modelEnergy,33,14,1), approx=parabola(33,coefficients,true);
  const SiApprox=approx.smooth(14)-approx.smooth(15);
  const evalHere=tableEnergy(A,Z), neighbors=[Z-1,Z+1].map(z=>tableEnergy(A,z));
  const localMin=evalHere!==null&&neighbors.every(Number.isFinite)?(neighbors.every(energy=>energy>=evalHere)?'Yes':'No'):'Unavailable';
  const inline=state.mode==='vertex'?metrics(metric('Smooth minimum Z',fmt(poly.vertex,4)),metric('SEMF minimum at integer Z',closest)):
    state.mode==='branches'?metrics(metric('Mass number parity',A%2?'Odd A':'Even A'),metric('SEMF vertical branch separation',value(A%2?0:24/Math.sqrt(A),'MeV',3)),
      useEval?metric('AME2020 adjacent-isobar local minimum',localMin):''):
    `<div class="table-scroll"><table class="q-table"><thead><tr><th scope="col">Ground-state channel</th>${useEval?'<th scope="col">AME2020</th>':''}${useModel?'<th scope="col">SEMF</th>':''}</tr></thead><tbody>${transitions.filter(t=>t.id!=='double'||state.A===102||channel==='double').map(t=>{
      const evaluatedQ=evaluated.find(r=>r.id===t.id).q, modeledQ=modeled.find(r=>r.id===t.id).q;
      const extrapolated=[data.get(A,Z),data.get(A,Z+t.dz)].some(r=>r?.extrapolated);
      const cell=(q,flag=false)=>q===null?'Unavailable':`${signed(q,3)} MeV · ${permitted(q)}${flag?' · extrapolated':''}`;
      return `<tr><th scope="row">${t.label}</th>${useEval?`<td>${cell(evaluatedQ,extrapolated)}</td>`:''}${useModel?`<td>${cell(modeledQ)}</td>`:''}</tr>`;
    }).join('')}</tbody></table></div>`;
  return {
    graphic:parabolaScene({...state,channel},poly,{lo,hi,ymin,ymax,positronThreshold:2*constants.electronMeV},modelPoints,evalPoints,active,target),
    motionKey:`${A}:${lo}:${hi}:${state.source}`,
    caption:`${name(data.get(A,Z)||state)} · A = ${A}, Z = ${Z} · ${useModel?'SEMF gray and smooth guide. ':''}${useEval?sourceLabel(data.get(A,Z))+' selected. AME2020 teal, extrapolated violet. ':''}Drag the chart or move Z to compare nuclei. Energies are relative to the smooth SEMF minimum.${state.mode==='transitions'?' The Q table applies the positron rest-energy threshold.':''}`,
    choices:counts(state)+select('source','Mass view',{both:'AME2020 + SEMF',eval:'AME2020',model:'SEMF'},state)+check('full','Show full Z range',state)+
      (state.mode==='transitions'?select('channel','Transition ruler',Object.fromEntries(transitions.map(t=>[t.id,t.label])),{channel}):''),
    actions:preset('silicon','Silicon-33')+preset('odd','A = 135')+preset('even','A = 102')+(A===102?preset('palladium','Palladium-102 energetics'):''),
    readings:inline,
    math:math(String.raw`E=k[Zm_\mathrm H+(A-Z)m_\mathrm n]-B=C_0+C_1Z+C_2Z^2-\delta`)+
      math(String.raw`C_0=kAm_\mathrm n-a_v A+a_s A^{2/3}+a_a A`)+
      math(String.raw`C_1=k(m_\mathrm H-m_\mathrm n)-a_c A^{-1/3}-4a_a,\quad C_2=a_c A^{-1/3}+4a_a/A`)+
      math(String.raw`Z_*=-\frac{C_1}{2C_2},\qquad E_\mathrm{smooth}(Z)=E_\mathrm{min}+C_2(Z-Z_*)^2`)+
      `<p>At A = ${A}, the smooth vertex is Z = ${fmt(poly.vertex,4)}, compared with A/2 = ${fmt(A/2,1)}. An actual ground-state comparison uses integer Z and keeps the mass shift −δ. Positive Q values establish energetic allowance. A local minimum against adjacent isobars can have other decay channels.</p>`+
      math(String.raw`Q_{\beta^-}=E_Z-E_{Z+1},\quad Q_{\rm EC}=E_Z-E_{Z-1},\quad Q_{\beta^+}=Q_{\rm EC}-2m_\mathrm ec^2`)+
      math(String.raw`E_Z-E_{Z\pm1}=C_2\big[\mp2(Z-Z_*)-1\big]+\delta_{Z\pm1}-\delta_Z`)+
      (A===102?'<p>The AME2020 two-unit comparison uses neutral Pd-102 and Ru-102 ground states. The single electron-capture step to Rh-102 is uphill. The two-unit comparison gives no observation, branching fraction or half-life.</p>':'')+
      (A===33&&Z===14?`<p>Silicon-33 → phosphorus-33 uses adjacent integer points in the odd-A parabola. Dropping the mass-difference and linear Coulomb pieces makes C₁ ≈ −4aₐ.</p>
      ${check('approx','Use the p. 17 lecture approximation in this worked line',state)}
      <p>${state.approx?'Approximate':'Full'} Q<sub>β⁻</sub> = ${value(state.approx?SiApprox:SiFull,'MeV',3)}. Full ${value(SiFull,'MeV',3)} · Approximate ${value(SiApprox,'MeV',3)}.</p>`:''),
    points:useModel?modelPoints:evalPoints,
  };
}
export const views={binding:bindingView,separation:separationView,drop:dropView,parabolas:isobars};
