export const H=6.62607015e-34,E=1.602176634e-19,ME=9.1093837139e-31,C=299792458,KB=8.617333262145e-5,RYDBERG=1.0973731568e7;
export const FWHM=2*Math.sqrt(2*Math.log(2));
export function poisson(mu,random=Math.random){if(!(mu>=0&&mu<700))throw Error('Poisson mean out of supported range');let p=1,k=0,L=Math.exp(-mu);do{k++;p*=random();}while(p>L);return k-1;}
export function statistics(values){const n=values.length,mean=n?values.reduce((a,b)=>a+b,0)/n:0;return {n,mean,sd:n>1?Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):null};}
export function calibration(c1,c2,unknown,width){if(c1===c2)throw Error('Distinct peak positions required');const a=(1332-1173)/(c2-c1),b=1173-a*c1,energy=a*unknown+b;return {a,b,energy,fwhm:Math.abs(a)*width*FWHM,resolution:Math.abs(a)*width*FWHM/energy*100};}
export const observedRate=(n,tau)=>n/(1+n*tau);
export function correctedRate(m,tau){if(m<0||tau<0||m*tau>=1)throw Error('Rate correction requires 0 ≤ mτ < 1');return m/(1-m*tau);}
export const twoSourceApprox=(m1,m2,m12)=>(m1+m2-m12)/(2*m1*m2);
export function twoSourceExact(m1,m2,m12){const product=m1*m2,radicand=product*(m12-m1)*(m12-m2);if(!(product>0&&m12>0&&radicand>=0))throw Error('Rates do not support the zero-background two-source model');return (product-Math.sqrt(radicand))/(product*m12);}
export const geometry=(distance,radius=.675)=>(1-distance/Math.hypot(distance,radius))/2;
export const activity=(initial,age,half)=>initial*2**(-age/half);
export function semiconductor(tC,gap,current){const t=tC+273.15,t0=313.15,R=100*Math.exp(gap/(2*KB)*(1/t-1/t0));return {R,V:R*current/1000,alpha:-gap/(2*KB*t*t),secant:tC===40?null:(R-100)/(100*(tC-40))};}
export function bragg(wavelength,spacing,order=1){const x=order*wavelength/(2*spacing);return x>=0&&x<=1?Math.asin(x)*180/Math.PI:null;}
export const families=[[1,1,1],[2,2,0],[3,1,1],[4,0,0],[3,3,1]];
export function electron(kV,R=65){const U=kV*1000,lambda=H/Math.sqrt(2*ME*E*U)*1e12,rel=lambda/Math.sqrt(1+E*U/(2*ME*C*C));return {lambda,rel,inner:2*R*lambda/213,outer:2*R*lambda/123};}
export function thermoelectric(delta,alpha,internal,load,cooling){const voc=142*alpha*1e-6*delta,I=voc/(internal+load),V=I*load,power=I*I*load,thermal=.194*4182*cooling/60;return {voc,I,V,power,thermal,apparent:power/thermal*100};}
export function regression(points){if(points.length<2)throw Error('Need two points');const n=points.length,sx=points.reduce((s,p)=>s+p[0],0),sy=points.reduce((s,p)=>s+p[1],0),sxx=points.reduce((s,p)=>s+p[0]*p[0],0),sxy=points.reduce((s,p)=>s+p[0]*p[1],0),den=n*sxx-sx*sx;if(Math.abs(den)<1e-20)throw Error('Vary x before fitting');const slope=(n*sxy-sx*sy)/den;return {slope,intercept:(sy-slope*sx)/n};}
export function evaluate(id,s){switch(id){
 case 'statistics':return {mu:s.rate*s.gate,sigma:Math.sqrt(s.rate*s.gate),rateSigma:Math.sqrt(s.rate*s.gate)/s.gate};
 case 'voltage':{const gain=(s.voltage/.9)**6,source=80/(1+Math.exp(-(gain-s.threshold)*8)),background=2+8*Math.max(0,s.voltage-.95)*20;return {gain,source,background,total:source+background};}
 case 'calibration':return calibration(s.channel1,s.channel2,s.unknown,s.width);
 case 'electronics':{const amplitude=s.amplitude*s.gain,upper=s.lower+s.window;return {amplitude,upper,accepted:amplitude>=s.lower&&amplitude<=upper};}
 case 'dead-time':{const tau=s.dead*1e-6,m1=observedRate(s.source1,tau),m2=observedRate(s.source2,tau),both=observedRate(s.source1+s.source2,tau);return {tau,m1,m2,both,estimate:twoSourceApprox(m1,m2,both),exact:twoSourceExact(m1,m2,both)};}
 case 'efficiency':{const A=activity(74000,s.age,s.half),g=geometry(s.distance),intrinsic=s.intrinsic/100;return {A,g,intrinsic,absolute:g*intrinsic,incident:A*g,recorded:A*g*intrinsic};}
 case 'resistance':return semiconductor(s.temperature,s.gap,s.current);
 case 'lif':{const target=bragg(s.wavelength,s.spacing,s.order);return {target,detector:2*s.theta,path:2*s.spacing*Math.sin(s.theta*Math.PI/180),intensity:target===null?0:Math.exp(-.5*((s.theta-target)/.5)**2)};}
 case 'moseley':{const slope=Math.sqrt(3*C*RYDBERG/4),root=slope*(s.atomic-s.screen);return {slope,root,frequency:root*root,energy:H*root*root/E/1000};}
 case 'powder':{const hkl=families[s.family-1],x=1/Math.hypot(...hkl),d=s.lattice*x,theta=bragg(s.wavelength,d);return {hkl,x,d,theta,two:theta===null?null:2*theta};}
 case 'electron':return electron(s.voltage,s.bulb);
 case 'thermoelectric':return thermoelectric(s.delta,s.alpha,s.internal,s.load,s.cooling);
 default:throw Error('Unknown experiment');
}}
