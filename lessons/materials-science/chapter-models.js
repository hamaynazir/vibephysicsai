const slider = (id,label,min,max,step,value) => ({id,label,min,max,step,value});
const choice = (id,label,options) => ({id,label,options,value:options[0]});
const diagram = (kind, title, extras) => ({kind,title,...extras});
const entry = (controls, evaluate, duration=0) => ({controls,evaluate,duration});
const pair = (value,label) => [value,label];
const steps = (start,end,count,fn) => Array.from({length:count+1},(_,i)=> {
  const x=start+(end-start)*i/count;
  return [x,fn(x)];
});
const area = d => Math.PI*d*d/4;
export const formatValue = (value,digits=3) => typeof value==='number' ?
  Number(value.toFixed(digits)).toLocaleString('en-US',{maximumFractionDigits:digits}) : value;
const unit = (value,symbol,digits=3) => formatValue(value,digits)+' '+symbol;
const colors = ['#0d8685','#925cc5','#d47831','#447cc4'];

function compare(label, options) {
  const keys=Object.keys(options);
  return entry([choice('item',label,keys)],({item})=>{
    const [feature,use,detail]=options[item];
    return {
      ...diagram('flow',item,{nodes:[['Material',item],['Property',feature],['Example',use]]}),
      metrics:[pair(feature,'key property'),pair(use,'example use')],detail
    };
  });
}

export function weightToAtomPercent(wt, molarA, molarB) {
  const a=wt/molarA, b=(100-wt)/molarB;
  return 100*a/(a+b);
}
export function atomToWeightPercent(at, molarA, molarB) {
  const a=at*molarA, b=(100-at)*molarB;
  return 100*a/(a+b);
}
function gcd(a,b) { return b===0?a:gcd(b,a%b); }
export function radiusCoordination(ratio) {
  const limits=[[0,2,'Linear'],[2/Math.sqrt(3)-1,3,'Triangular'],[Math.sqrt(6)/2-1,4,'Tetrahedral'],
    [Math.sqrt(2)-1,6,'Octahedral'],[Math.sqrt(3)-1,8,'Cubic'],[1,12,'Cuboctahedral']];
  return limits.findLast(([lower])=>ratio>=lower);
}
export function molarMassAverages(groups) {
  const molecules=groups.reduce((sum,[count])=>sum+count,0);
  const total=groups.reduce((sum,[count,mass])=>sum+count*mass,0);
  const number=total/molecules;
  const weight=groups.reduce((sum,[count,mass])=>sum+count*mass**2,0)/total;
  return {number,weight,dispersity:weight/number};
}

const metalProperties={
  'Electrical wiring':['High conductivity','Copper cable','Copper is widely used for cables. The choice also depends on cost, mass and mechanical needs.'],
  'Structural support':['High strength','Structural steel','Steel composition and processing affect both its yield strength and toughness.'],
  'Lightweight frame':['Low density','Aluminum frame','Lower density reduces part mass. The required stiffness also depends on the section geometry.'],
  'Joint implant':['Corrosion resistance','Titanium alloy','Implant selection also requires biocompatibility, suitable strength and fatigue resistance.']
};

const composition=entry([
  choice('alloy','Binary alloy',['Al–Cu','Cu–Ni','Fe–C']),
  choice('basis','Input basis',['Mass percent','Atom percent']),
  slider('fraction','First element (%)',0,100,.1,97)
],({alloy,basis,fraction})=>{
  const [a,b]=alloy.split('–');
  const mass={Al:26.98,Cu:63.55,Ni:58.69,Fe:55.85,C:12.01};
  const wt=basis==='Mass percent'?fraction:atomToWeightPercent(fraction,mass[a],mass[b]);
  const at=basis==='Atom percent'?fraction:weightToAtomPercent(fraction,mass[a],mass[b]);
  return {
    ...diagram('bars',a+' share of the alloy',{bars:[['Mass',wt],['Atoms',at]],maximum:100,suffix:'%'}),
    metrics:[pair(unit(wt,'wt% '+a,2),'mass percentage'),pair(unit(at,'at% '+a,2),'atom percentage'),
      pair(unit(100-at,'at% '+b,2),'second element')],
    detail:'Each bar shows the share of the first element. Both compositions sum to 100% on their own basis.'
  };
});

const ionicExamples={
  'FeO':[.077,.140,6,'Rock salt'],
  'CsCl':[.170,.181,8,'CsCl type'],
  'ZnS':[.074,.184,4,'Zinc blende or wurtzite']
};
function ionModel(ratio,title) {
  const [limit,n,geometry]=radiusCoordination(ratio);
  return {
    ...diagram('ion',title,{count:n,ratio}),
    metrics:[pair(formatValue(ratio,4),'radius ratio'),pair(n,'ideal coordination'),pair(geometry,'neighbor geometry')],
    detail:'The ideal lower limit for this geometry is '+formatValue(limit,4)+'. Neighbor positions are schematic projections.'
  };
}

export const engineeringModels = {
  metals:compare('Application',metalProperties),
  'solid-solutions':entry([choice('type','Solid solution',['Substitutional','Interstitial']),slider('count','Illustrated solute atoms',0,12,1,6)],
    ({type,count})=>({...diagram('lattice',type+' solute',{type,count}),metrics:[
      pair(count,'solute atoms shown'),pair(type==='Interstitial'?'Between sites':'On host sites','solute location')],
      detail:'This is a two-dimensional site diagram. Atom sizes and distances are schematic.'})),
  composition,
  intermetallics:entry([choice('type','Atomic arrangement',['Ordered Ni₃Al','Disordered alloy'])],
    ({type})=>({...diagram('lattice',type,{type:type.startsWith('Ordered')?'Ordered':'Substitutional',count:12}),
      metrics:[pair('3:1','ideal atom ratio in both sketches'),pair(type.startsWith('Ordered')?'Repeats periodically':'Varies from cell to cell','occupation')],
      detail:'Both patterns contain the same number of each species. Ordering changes which sites a species tends to occupy.'})),
  applications:compare('Application',metalProperties),
  'ionic-charge':entry([slider('plus','Cation charge',1,4,1,3),slider('minus','Anion charge magnitude',1,4,1,2)],
    ({plus,minus})=>{
      const divisor=gcd(plus,minus);
      const cations=minus/divisor, anions=plus/divisor;
      return {...diagram('charges','Smallest neutral group',{cations,anions,plus,minus}),
        metrics:[pair(cations+' : '+anions,'cation to anion'),pair(0,'net elementary charges')],
        detail:'The positive and negative totals are equal in magnitude.'};
    }),
  'radius-ratio':entry([slider('ratio','Cation radius / anion radius',.05,1.08,.001,.55)],
    ({ratio})=>ionModel(ratio,'Ideal neighbor coordination')),
  'ionic-examples':entry([choice('salt','Ionic compound',Object.keys(ionicExamples))],({salt})=>{
    const [positive,negative,count,structure]=ionicExamples[salt];
    const result=ionModel(positive/negative,salt+' · hard-sphere estimate');
    result.metrics.push(pair(structure,'example structure'));
    result.detail='With illustrative radii of '+positive+' nm and '+negative+' nm, the estimate gives '+count+
      ' neighbors here. More than one structure can share a coordination number.';
    return result;
  }),
  ceramics:compare('Ceramic family',{
    Glass:['Optical transparency','Windows','Composition and processing determine optical transmission and other properties.'],
    'Clay products':['Shape before firing','Bricks','Firing develops the ceramic microstructure after the wet clay is shaped.'],
    Refractories:['Heat resistance','Furnace lining','Refractory selection also depends on chemical and thermal-shock resistance.'],
    Abrasives:['Hardness','Grinding tool','Hard particles remove material through contact and relative motion.'],
    Cements:['Hydration','Concrete','Hydration products bind the aggregate.'],
    Biomaterials:['Biocompatibility','Joint component','Alumina and zirconia can supply useful wear and chemical resistance.'],
    Carbon:['Bond connectivity','Electrodes','Graphite and diamond have different bonding arrangements.'],
    'Advanced ceramics':['Functional response','Piezoelectric sensor','Some engineered ceramics convert a mechanical load into an electrical signal.']
  }),
  carbon:entry([choice('form','Carbon form',['Diamond','Graphite','Graphene','Nanotube','Fullerene','Piezoelectric ceramic'])],
    ({form})=>({...diagram('carbon',form,{form}),
      metrics:[pair(form==='Diamond'?'Four':form==='Piezoelectric ceramic'?'Polarization':'Three','local bonds per carbon, or material response'),
        pair(form==='Graphite'?'Stacked sheets':form==='Graphene'?'Single sheet':form==='Diamond'?'3D network':form==='Nanotube'?'Rolled sheet':form==='Fullerene'?'Closed cage':'Functional ceramic','structure')],
      detail:'Connectivity is schematic. For the advanced ceramic example, applied stress can change electric polarization.'})),
  'polymer-basics':compare('Representative material',{
    Polypropylene:['Organic synthetic polymer','Packaging','Polypropylene uses repeating propylene-derived units.'],
    Cellulose:['Organic natural polymer','Plant fibers','Origin and molecular architecture describe different properties of the same polymer.'],
    'Silicone rubber':['Inorganic backbone','Flexible seal','Its silicon–oxygen backbone carries organic side groups.'],
    'Organic–inorganic hybrid':['Mixed structural units','Functional coating','The components can combine properties within one material.']
  }),
  polymerization:entry([choice('mode','Mechanism',['Step growth','Chain growth']),slider('conversion','Extent of reaction (%)',1,99,1,80)],
    ({mode,conversion})=>{
      const isStep=mode==='Step growth', length=1/(1-conversion/100);
      return {...diagram('chains',mode,{form:isStep?'Growth':'Active',fraction:conversion/100}),
        metrics:[pair(conversion+'%','illustrated conversion'),pair(isStep?formatValue(length,2):'Can be long early',isStep?'ideal number-average DP':'active chain length')],
        detail:isStep?'Average degree of polymerization follows the ideal balanced step-growth calculation.':'The highlighted chain grows at an active end. The drawing does not predict average molar mass.'};
    }),
  architecture:entry([choice('form','Architecture',['Linear','Branched','Cross-linked','Network'])],
    ({form})=>({...diagram('chains',form+' architecture',{form}),metrics:[pair(form,'architecture')],
      detail:'The connectors show covalent links. The diagram omits entanglement and molecular-scale motion.'})),
  tacticity:entry([choice('form','Tacticity',['Isotactic','Syndiotactic','Atactic'])],
    ({form})=>({...diagram('chains',form+' sequence',{form}),metrics:[pair(form==='Isotactic'?'Same':form==='Syndiotactic'?'Alternating':'Irregular','relative configuration')],
      detail:'Circles above or below the backbone stand for relative side-group configuration.'})),
  copolymers:entry([choice('form','Sequence',['Homopolymer','Alternating','Statistical','Block','Graft'])],
    ({form})=>({...diagram('chains',form,{form}),metrics:[pair(form==='Homopolymer'?1:2,'repeat unit types shown')],
      detail:'A and B indicate different repeat units. The statistical sequence is a fixed illustration.'})),
  thermal:entry([choice('form','Polymer family',['Thermoplastic','Thermoset','Elastomer']),slider('warm','Relative heating',0,100,1,30)],
    ({form,warm})=>({...diagram('chains',form+' under heating',{form:form==='Thermoset'?'Network':form==='Elastomer'?'Cross-linked':'Linear',fraction:warm/100,heated:true}),
      metrics:[pair(form==='Thermoplastic'&&warm>60?'Greater flow':form==='Thermoset'?'Network restrains flow':'Flexible response','illustrated behavior')],
      detail:'The heating scale is relative. These settings do not represent specific temperatures or processing recommendations.'})),
  crystallinity:entry([slider('fraction','Ordered regions (%)',0,100,10,50)],
    ({fraction})=>({...diagram('chains','Ordered and amorphous regions',{form:'Semicrystalline',fraction:fraction/100}),
      metrics:[pair(fraction+'%','ordered regions shown'),pair(100-fraction+'%','amorphous regions shown')],
      detail:'The ordered fraction is an illustration. The sketch does not define a measured mass fraction.'})),
  'molar-mass':entry([slider('count','Heavier chains in a group of 100',0,100,1,15),slider('mass','Heavier molar mass (kg/mol)',20,200,5,100)],
    ({count,mass})=>{
      const result=molarMassAverages([[100-count,20],[count,mass]]);
      return {...diagram('bars','Molar mass averages',{bars:[['Number average',result.number],['Mass average',result.weight]],maximum:200,suffix:' kg/mol'}),
        metrics:[pair(unit(result.number,'kg/mol',2),'number average'),pair(unit(result.weight,'kg/mol',2),'mass average'),pair(formatValue(result.dispersity,3),'dispersity')],
        detail:'Expected result at equal molar masses, or with only one population present: dispersity equals one.'};
    }),
  'glass-transition':entry([slider('temp','Temperature (°C)',-30,160,1,35),slider('glass','Glass transition (°C)',0,120,1,70)],
    ({temp,glass},t)=>({...diagram('chains','Segmental mobility near the glass transition',{form:'Motion',fraction:temp>=glass?.9:.22,time:t}),
      metrics:[pair(unit(temp-glass,'°C'),'relative to glass transition'),pair(temp>=glass?'More rubbery':'More glassy','amorphous response')],
      detail:'The motion is schematic. Real glass transitions span an interval and depend on the measurement timescale.'}),10)
};
const elasticMPa=200000;
const yieldPoint=250;
const postYield=12000;
export function offsetYield(E,yieldStress,H,offset) {
  const strain=yieldStress/E+E*offset/(E-H);
  return {strain,stress:E*(strain-offset)};
}
export function elasticEnergy(yieldStress,E) { return yieldStress**2/(2*E); }
export function areaUnderCurve(points) {
  return points.slice(1).reduce((sum,[x,y],i)=>sum+(x-points[i][0])*(y+points[i][1])/2,0);
}
export function trueTensile(stress,strain,areaRatio=1/(1+strain)) {
  return {stress:stress/areaRatio, strain:Math.log1p(strain)};
}
export function indentationHardness(method,force,length,diameter=10) {
  if(method==='Brinell') return 2*(force/9.80665)/(Math.PI*diameter*(diameter-Math.sqrt(diameter**2-length**2)));
  return (method==='Vickers'?.1891:1.451)*force/length**2;
}
const stressCurve = strain => Math.min(elasticMPa*strain,yieldPoint)+postYield*Math.max(0,strain-yieldPoint/elasticMPa);
const graph = (title,xLabel,yLabel,series,options={}) => diagram('graph',title,{xLabel,yLabel,series,...options});
const curve = (points,color=0,dashed=false) => ({points,color,dashed});
const tensileCurve = [[0,0],[.00125,250],[.02,305],[.09,405],[.16,450],[.22,405],[.28,325]];
const brittleCurve = [[0,0],[.0015,300],[.003,600],[.0031,605]];
const interpolate = (sequence,x) => {
  const index=sequence.findIndex(point=>point[0]>=x);
  if(index<=0)return index<0?sequence.at(-1)[1]:sequence[0][1];
  const [a,u]=sequence[index-1], [b,v]=sequence[index];
  return u+(v-u)*(x-a)/(b-a);
};
const materialGraphs = {
  loading:entry([choice('load','Loading mode',['Tension','Compression','Shear','Torsion']),slider('amount','Illustrated load',0,100,1,60)],
    ({load,amount})=>({...diagram('specimen',load,{form:load,amount:amount/100}),
      metrics:[pair(load==='Shear'?'Tangential force':load==='Torsion'?'Torque':'Axial force','load type'),
        pair(load==='Compression'?'Shorter':load==='Tension'?'Longer':load==='Shear'?'Skewed':'Twisted','shape under load')],
      detail:'Deformations are exaggerated to make the load directions and change in shape visible.'})),
  engineering:entry([slider('force','Axial force (kN)',-20,40,.5,18),slider('diameter','Original diameter (mm)',5,20,.5,12),
    slider('extension','Gauge length change (mm)',-2,10,.25,1)],
    ({force,diameter,extension})=>({...diagram('specimen','50 mm original gauge length',{form:extension<0?'Compression':'Tension',amount:Math.abs(extension)/10}),
      metrics:[pair(unit(area(diameter),'mm²',2),'original area'),pair(unit(1000*force/area(diameter),'MPa',2),'engineering stress'),
        pair(unit(100*extension/50,'%',2),'engineering strain')],
      detail:'Force and extension are independent inputs for practicing the definitions. The sketch is qualitative.'})),
  elastic:entry([choice('form','Elastic behavior',['Linear','Nonlinear']),slider('modulus','Initial modulus (GPa)',60,210,5,110),
    slider('strain','Elastic strain (%)',.05,.4,.01,.25)],({form,modulus,strain})=>{
      const x=strain/100, nonlinear=form==='Nonlinear';
      const stress=e=>1000*modulus*(e+(nonlinear?140*e**2:0));
      const tangent=modulus*(1+(nonlinear?280*x:0)), secant=stress(x)/x/1000;
      return {...graph('Elastic slopes','Strain (%)','Stress (MPa)',[
        curve(steps(0,.004,42,e=>stress(e)).map(([e,v])=>[100*e,v])),
        curve([[0,0],[strain,stress(x)]],1,true),
        curve([[-.0005,.0],[.0005,.0]].map(([delta])=>[100*(x+delta),stress(x)+1000*tangent*delta]),2)
      ],{marker:[strain,stress(x)],domain:[.0045*100,1400]}),
      metrics:[pair(unit(stress(x),'MPa',2),'elastic stress'),pair(unit(secant,'GPa',2),'secant slope'),pair(unit(tangent,'GPa',2),'tangent slope')],
      detail:'Dashed violet joins the origin to the marker. Orange is tangent at the selected strain.'};
  }),
  shear:entry([slider('stress','Shear stress (MPa)',5,125,5,60),slider('shift','Top displacement (mm)',.0125,.5,.0125,.1125),
    slider('height','Block height (mm)',10,60,1,25)],({stress,shift,height})=>{
    const strain=shift/height;
    return {...diagram('specimen','Small simple shear',{form:'Shear',amount:Math.min(1,strain*60)}),
      metrics:[pair(formatValue(strain,5),'shear strain'),pair(unit(stress/strain/1000,'GPa',3),'shear modulus')],
      detail:'Displacement is exaggerated. The ratio assumes the initial face stays fixed and deformation remains small.'};
  }),
  anelasticity:entry([slider('tau','Relaxation time (s)',.2,3,.1,1.2)],({tau},time)=>{
    const delay=t=>t<3?1-Math.exp(-t/tau):(1-Math.exp(-3/tau))*Math.exp(-(t-3)/tau);
    const response=t=>.8*(t<3?1:0)+.65*delay(t);
    return {...graph('Delayed strain recovery','Time (s)','Strain (%)',[
      curve([[0,.8],[3,.8],[3,0],[8,0]],1,true),
      curve([...steps(0,2.999,38,response),...steps(3,8,56,response)])
    ],{marker:[time,response(time)],domain:[8,1.6]}),
      metrics:[pair(unit(time,'s',2),'time'),pair(unit(response(time),'%',3),'total strain'),pair(unit(.65*delay(time),'%',3),'delayed strain')],
      detail:'The violet line represents the prompt elastic strain. Load is removed at 3 s.'};
  },8),
  poisson:entry([slider('strain','Axial strain (%)',0,1,.05,.4),slider('poisson','Poisson ratio',.05,.45,.01,.33),slider('modulus','Young’s modulus (GPa)',65,220,5,100)],
    ({strain,poisson,modulus})=>({...diagram('specimen','Longitudinal extension and lateral contraction',{form:'Tension',amount:strain,transverse:poisson}),
      metrics:[pair(unit(-strain*poisson,'%'),'lateral strain'),pair(unit(modulus/(2*(1+poisson)),'GPa',2),'shear modulus'),
        pair(unit(modulus/(3*(1-2*poisson)),'GPa',2),'bulk modulus')],
      detail:'The sketch enlarges the elastic strains so the lateral response is easier to see.'})),
  yield:entry([slider('offset','Strain offset (%)',.05,.35,.01,.2)],({offset})=>{
    const x=offset/100, result=offsetYield(elasticMPa,yieldPoint,postYield,x);
    const stop=x+700/elasticMPa;
    return {...graph('Offset intersection','Strain (%)','Stress (MPa)',[
      curve([[0,0],[100*yieldPoint/elasticMPa,yieldPoint],[.85,stressCurve(.0085)]]),
      curve([[offset,0],[100*stop,700]],1,true)
    ],{marker:[100*result.strain,result.stress],domain:[.85,720]}),
      metrics:[pair(unit(result.stress,'MPa',2),'offset yield strength'),pair(unit(100*result.strain,'%',3),'intersection strain')],
      detail:'The crossing is calculated for the example bilinear law. The offset is drawn parallel to the elastic slope.'};
  }),
  strength:entry([slider('strain','Engineering strain (%)',0,28,.1,16)],({strain})=>{
    const stress=interpolate(tensileCurve,strain/100);
    return {...graph('Engineering tensile curve','Strain (%)','Stress (MPa)',[curve(tensileCurve.map(([x,y])=>[100*x,y]))],
      {marker:[strain,stress],domain:[30,500]}),
      metrics:[pair(unit(stress,'MPa',1),'current engineering stress'),pair('450 MPa','ultimate tensile strength'),
        pair(strain>=16?'Necking':'Before necking','illustrated regime')],
      detail:'The maximum occurs at 16% strain in this illustrative curve.'};
  }),
  ductility:entry([slider('length','Final gauge length (mm)',50,80,.5,62.5),slider('diameter','Final minimum diameter (mm)',5,12.5,.1,9.5)],
    ({length,diameter})=>({...diagram('specimen','After fracture · pieces fitted together',{form:'Neck',amount:(length-50)/30,transverse:diameter/12.5}),
      metrics:[pair(unit((length/50-1)*100,'%',2),'elongation'),pair(unit(100*(1-(diameter/12.5)**2),'%',2),'reduction in area')],
      detail:'The initial gauge length is 50 mm and the original diameter is 12.5 mm. The neck is drawn schematically.'})),
  resilience:entry([slider('yield','Yield stress (MPa)',100,650,10,350),slider('modulus','Young’s modulus (GPa)',50,220,5,200)],
    ({yield:stress,modulus})=>{
      const E=modulus*1000, strain=100*stress/E;
      return {...graph('Elastic energy up to yield','Strain (%)','Stress (MPa)',[curve([[0,0],[strain,stress]])],
        {marker:[strain,stress],shade:true,domain:[1.4,700]}),
        metrics:[pair(unit(strain,'%',3),'yield strain'),pair(unit(1000*elasticEnergy(stress,E),'kJ/m³',2),'modulus of resilience')],
        detail:'The shaded triangle represents recoverable work per unit original volume.'};
    }),
  toughness:entry([choice('form','Material response',['Ductile','Brittle'])],({form})=>{
    const data=form==='Ductile'?tensileCurve:brittleCurve;
    return {...graph('Work up to fracture','Strain (%)','Stress (MPa)',[curve(data.map(([x,y])=>[100*x,y]))],{shade:true,domain:[30,650]}),
      metrics:[pair(unit(areaUnderCurve(data),'MJ/m³',2),'tensile toughness'),pair(unit(100*data.at(-1)[0],'%'),'fracture strain')],
      detail:'Both curves use the same axes. The brittle curve has a higher peak but much less strain to fracture.'};
  }),
  'brass-example':entry([slider('diameter','Original specimen diameter (mm)',5,25,.1,12.8),slider('stress','Stress before the peak (MPa)',50,450,5,345)],
    ({diameter,stress})=>{
      const data=[[0,0],[.0016,150],[.003,236],[.00466667,250],[.06,345],[.15,450],[.24,360]];
      const strain=interpolate(data.slice(0,-1).map(([e,s])=>[s,e]),stress);
      return {...graph('Illustrative brass stress–strain curve','Strain (%)','Stress (MPa)',[curve(data.map(([x,y])=>[100*x,y]))],
        {marker:[100*strain,stress],domain:[25,500]}),
        metrics:[pair('93.75 GPa','initial slope'),pair('≈250 MPa','offset yield strength'),pair(unit(450*area(diameter)/1000,'kN',2),'maximum load'),
          pair(unit(250*strain,'mm',2),'change from 250 mm')],
        detail:'The curve is a schematic reconstruction. The marker at 345 MPa gives about 6% strain and 15 mm extension.'};
    }),
  'true-stress':entry([choice('mode','Area model',['Uniform constant volume','Measured neck']),
    slider('stress','Engineering stress (MPa)',50,650,10,420),slider('strain','Engineering strain (%)',0,45,1,18),
    slider('current','Measured area remaining (%)',35,90,1,70)],({mode,stress,strain,current})=>{
      const uniform=mode==='Uniform constant volume';
      const ratio=uniform?1/(1+strain/100):current/100;
      const result=trueTensile(stress,strain/100,ratio);
      return {...diagram('specimen',mode,{form:uniform?'Tension':'Neck',amount:strain/45,transverse:Math.sqrt(ratio)}),
        metrics:[pair(unit(result.stress,'MPa',2),'true stress'),pair(uniform?formatValue(result.strain,4):'Needs local strain','true strain at section'),pair(unit(100*ratio,'%',2),'current to original area')],
        detail:uniform?'Uniform deformation lets us obtain current area from the axial stretch.':'Use the measured area at the neck. The engineering gauge strain does not give local strain there.'};
    }),
  recovery:entry([slider('maximum','Maximum strain (%)',.2,1.25,.01,1),choice('phase','Cycle',['Loading','Unloading'])],
    ({maximum,phase},time)=>{
      const x=maximum/100, y=stressCurve(x), residual=x-y/elasticMPa;
      const travelled=Math.min(1,time/5), marker=phase==='Loading'?[100*x*travelled,stressCurve(x*travelled)]:[100*(x-y/elasticMPa*travelled),y*(1-travelled)];
      return {...graph('Load path and elastic recovery','Strain (%)','Stress (MPa)',[
        curve([[0,0],[100*yieldPoint/elasticMPa,yieldPoint],[maximum,y]]),
        curve([[100*residual,0],[maximum,y]],1,true)],{marker,domain:[1.4,500]}),
        metrics:[pair(unit(100*y/elasticMPa,'%',3),'recoverable strain'),pair(unit(100*residual,'%',3),'residual strain')],
        detail:'The dashed unloading slope equals the initial elastic slope.'};
    },5),
  rockwell:entry([choice('scale','Regular scale',['HRC','HRB']),slider('depth','Permanent depth difference (μm)',70,160,2,100)],
    ({scale,depth})=>({...diagram('indent',scale+' depth measurement',{method:'Rockwell',amount:depth/200}),
      metrics:[pair(formatValue((scale==='HRC'?100:130)-depth/2,1)+' '+scale,'calculated hardness number')],
      detail:'Each regular-scale point corresponds to 2 μm of depth change. Use the matching indenter and standard load for a real test.'})),
  indenters:entry([choice('method','Indentation method',['Brinell','Vickers','Knoop']),slider('force','Applied force (N)',5,500,5,100),
    slider('length','Measured indent size (mm)',.25,4,.05,1)],
    ({method,force,length})=>({...diagram('indent',method+' impression',{method,amount:length/4}),
      metrics:[pair(formatValue(indentationHardness(method,force,length),2)+' '+({Brinell:'HBW',Vickers:'HV',Knoop:'HK'}[method]),'calculated hardness number'),
        pair({Brinell:'Diameter',Vickers:'Mean diagonal',Knoop:'Long diagonal'}[method],'measure this length')],
      detail:method==='Brinell'?'The demonstration uses a 10 mm ball and converts force to the conventional scale.':'The demonstration uses force in newtons and length in millimetres.'})),
  'hardness-strength':entry([slider('hardness','Brinell hardness number',100,450,5,200)],({hardness})=>
    ({...graph('Approximate correlation for steels','Brinell hardness number','Tensile strength (MPa)',[curve([[0,0],[450,1552.5]])],
      {marker:[hardness,3.45*hardness],domain:[450,1600]}),
      metrics:[pair(unit(3.45*hardness,'MPa',1),'estimated tensile strength')],detail:'A measured tensile result can differ. Use the estimate only for appropriate steel grades and hardness ranges.'}))
};
export const mechanicalModels=materialGraphs;
