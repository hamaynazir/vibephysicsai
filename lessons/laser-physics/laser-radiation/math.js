export const C=299792458,H=6.62607015e-34,EV=1.602176634e-19;
export function light(lambdaNm){const wavelength=lambdaNm*1e-9,frequency=C/wavelength,energy=H*frequency;return {wavelength,frequency,period:1/frequency,energy,eV:energy/EV};}
export const photonRate=(powerMw,lambdaNm)=>powerMw*1e-3/light(lambdaNm).energy;
export const irradiance=(powerMw,diameterMm)=>4*powerMw*1e-3/(Math.PI*(diameterMm*1e-3)**2);
export function coherence(lambdaNm,widthNm,n=1){const lambda=lambdaNm*1e-9,width=widthNm*1e-9,bandwidth=C*width/lambda**2,time=1/bandwidth;return {bandwidth,time,length:C/n*time};}
export function pulse(durationNs,lambdaNm,shape='Estimate'){const duration=durationNs*1e-9,factor=shape==='Gaussian'?0.4412712:shape==='Rectangular'?0.88589294:1,bandwidth=factor/duration;return {factor,bandwidth,widthNm:lambdaNm**2*1e-9/C*bandwidth,length:C/bandwidth};}
export function gaussianBeam(lambdaNm,waistMm,zMetres){const w0=waistMm*1e-3,lambda=lambdaNm*1e-9,zR=Math.PI*w0*w0/lambda;return {zR,radius:w0*Math.sqrt(1+(zMetres/zR)**2),halfAngle:lambda/(Math.PI*w0)};}
export const hydrogenEnergy=n=>-13.6/(n*n);
export function cavityGain(inversion,gain=.8,loss=.1,R1=.995,R2=.95){return R1*R2*Math.exp(2*(gain*inversion-loss));}
export const inversion=n2=>2*n2-1;
