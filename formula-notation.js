import katex from './vendor/katex.mjs';
import {sections as crystals} from './lecture-data.js';
import {sections as vectors} from './lessons/electromagnetic-theory/vector-analysis/content.js';
import {sections as materials} from './lessons/materials-science/materials-and-bonding/content.js';
import {sections as laser} from './lessons/laser-physics/laser-radiation/content.js';
import {sections as nuclear} from './lessons/nuclear-models/basic-concepts/content.js';
import {manuals} from './laboratories/content.js';

const formulas=new Map();
const rendered=new Map();
function register(items, notation, field='formula') {
  for (const line of notation.trim().split('\n')) {
    const [id,...expressions]=line.split('§');
    formulas.set(items.find(item=>item.id===id)[field], expressions.map(mathMarkup).join(''));
  }
}

register(crystals, String.raw`
crystalline§\mathbf R=n_1\mathbf a+n_2\mathbf b+n_3\mathbf c,\quad n_i\in\mathbb Z
definitions§V_{\mathrm{primitive}}=|\mathbf a_1\cdot(\mathbf a_2\times\mathbf a_3)|
systems§\alpha=\angle(\mathbf b,\mathbf c)§\beta=\angle(\mathbf a,\mathbf c)§\gamma=\angle(\mathbf a,\mathbf b)
symmetry§(x,y,z)\mapsto(-x,-y,-z)\quad\text{(inversion)}§\theta=\frac{360^\circ}{n}
wigner§\mathbf r\cdot\mathbf R\leq\frac{|\mathbf R|^2}{2}\quad(\mathbf R\ne\mathbf 0)
packing§\mathrm{APF}=\frac{N(4\pi R^3/3)}{V_{\mathrm{cell}}}
indices§\text{Direction }[uvw],\quad\text{plane }(hkl)§\text{Families }\langle uvw\rangle,\ \{hkl\}
spacing§d_{hkl}=\frac{1}{|h\mathbf a^*+k\mathbf b^*+l\mathbf c^*|}§d_{\mathrm{cubic}}=\frac{a}{\sqrt{h^2+k^2+l^2}}
forces§U(r)=-\frac A{r^m}+\frac B{r^n},\quad n>m§F_r=-\frac{\mathrm dU}{\mathrm dr}
madelung§U_{\mathrm{pair}}=-\frac{\alpha e^2}{4\pi\varepsilon_0r_0}§\alpha_{\mathrm{1D}}=2\ln 2
`);
register(vectors, String.raw`
vectors§\mathbf A=A_x\hat{\mathbf i}+A_y\hat{\mathbf j}+A_z\hat{\mathbf k}§|\mathbf A|=\sqrt{A_x^2+A_y^2+A_z^2}
addition§\mathbf A+\mathbf B=(A_x+B_x,\ A_y+B_y,\ A_z+B_z)§\alpha\mathbf A\ \text{rescales }\mathbf A
dot§\mathbf A\cdot\mathbf B=\sum_i A_iB_i=|\mathbf A||\mathbf B|\cos\theta
cross§\mathbf A\times\mathbf B=(A_yB_z-A_zB_y,§\quad A_zB_x-A_xB_z,\ A_xB_y-A_yB_x)
components§\hat{\mathbf i}\cdot\hat{\mathbf j}=0,\quad\hat{\mathbf i}\times\hat{\mathbf j}=\hat{\mathbf k}§\mathbf A\cdot\hat{\mathbf i}=A_x
direction§\mathbf r_P=\mathbf P-\mathbf O§\Delta\mathbf r_{PQ}=\mathbf Q-\mathbf P
cube§\cos\theta=\frac{\mathbf A\cdot\mathbf B}{|\mathbf A||\mathbf B|}
position§\hat{\mathbf r}=\frac{\mathbf r}{|\mathbf r|},\quad |\mathbf r|>0
elements§\mathrm d\boldsymbol\ell=(\mathrm dx,\mathrm dy,\mathrm dz)§\mathrm d\tau=\mathrm dx\,\mathrm dy\,\mathrm dz§\mathrm d\mathbf S_x=\pm\hat{\mathbf i}\,\mathrm dy\,\mathrm dz
gradient§\nabla T=(2ax,2by,2cz)§\mathrm dT=\nabla T\cdot\mathrm d\boldsymbol\ell
divergence§\nabla\cdot\mathbf F=2a+c
curl§\nabla\times\mathbf F=(0,0,2b)
identities§\mathbf V=(x^2y,xy^2,z^2)§\nabla\times(\nabla\times\mathbf V)=\nabla(\nabla\cdot\mathbf V)-\nabla^2\mathbf V
gradient-theorem§\int_a^b\nabla T\cdot\mathrm d\boldsymbol\ell=T(b)-T(a)
gauss§\oint_{\partial V}\mathbf F\cdot\hat{\mathbf n}\,\mathrm dS=\int_V(a+b+c)\,\mathrm dV
stokes§\oint_C\mathbf F\cdot\mathrm d\boldsymbol\ell=\iint_S(\nabla\times\mathbf F)\cdot\hat{\mathbf n}\,\mathrm dS§=\pm2b\pi R^2
coordinates§\theta=\angle(\mathbf r,+z),\quad\phi=\operatorname{atan2}(y,x)
spherical§\hat{\mathbf e}_r=(\sin\theta\cos\phi,\sin\theta\sin\phi,\cos\theta)§\hat{\mathbf e}_\theta=(\cos\theta\cos\phi,\cos\theta\sin\phi,-\sin\theta)§\hat{\mathbf e}_\phi=(-\sin\phi,\cos\phi,0)
spherical-elements§(\mathrm d\ell_r,\mathrm d\ell_\theta,\mathrm d\ell_\phi)=(\mathrm dr,r\,\mathrm d\theta,r\sin\theta\,\mathrm d\phi)§\mathrm d\tau=r^2\sin\theta\,\mathrm dr\,\mathrm d\theta\,\mathrm d\phi
cylindrical§x=\rho\cos\phi,\quad y=\rho\sin\phi§\hat{\mathbf e}_\rho=(\cos\phi,\sin\phi,0)§\hat{\mathbf e}_\phi=(-\sin\phi,\cos\phi,0)
cylindrical-elements§(\mathrm d\ell_\rho,\mathrm d\ell_\phi,\mathrm d\ell_z)=(\mathrm d\rho,\rho\,\mathrm d\phi,\mathrm dz)§\mathrm d\tau=\rho\,\mathrm d\rho\,\mathrm d\phi\,\mathrm dz
classification§\mathbf F=(ax-by,bx+ay,cz)§\nabla\cdot\mathbf F=2a+c§\nabla\times\mathbf F=2b\hat{\mathbf k}
`);
register(materials, String.raw`
semiconductors§\sigma=q(n\mu_n+p\mu_p)
nano§\frac SV=\frac6L\quad\text{(cube)}§1\,\mathrm{nm}=10^{-9}\,\mathrm m
forces§U=D\left[\left(\frac{r_0}{r}\right)^{12}-2\left(\frac{r_0}{r}\right)^6\right]§F_r=-\frac{\mathrm dU}{\mathrm dr}
ionic§\mathrm{Na}\to\mathrm{Na}^++e^-§\mathrm{Cl}+e^-\to\mathrm{Cl}^-
sp3§s+3p\to4sp^3§\cos\theta=-\frac13,\quad\theta\approx109.47^\circ
sp2§s+2p\to3sp^2+p\quad\text{(one unhybridized orbital)}
`);
register(laser, String.raw`
fields§\mathbf E\perp\mathbf B§\mathbf E\times\mathbf B\parallel\mathbf k§\frac{E_0}{B_0}=c\quad\text{(vacuum)}
wave§E(x,t)=E_0\sin\left(\frac{2\pi x}{\lambda}-2\pi\nu t\right)§I\propto E_0^2
frequency§c=\lambda\nu\quad\text{(vacuum)}§T=\frac1\nu
levels§E_n\approx-\frac{13.6\,\mathrm{eV}}{n^2}§\Delta E=E_{\mathrm{upper}}-E_{\mathrm{lower}}
photons§E_\gamma=h\nu=\frac{hc}{\lambda}§\dot N=\frac{P}{E_\gamma}
interactions§h\nu=\Delta E\quad\text{(resonance)}
he-ne§\lambda=632.8\,\mathrm{nm},\quad P=2\,\mathrm{mW}§E_\gamma\approx1.9593\,\mathrm{eV}§\dot N\approx6.371\times10^{15}\,\mathrm{s^{-1}}
temporal§\Delta\nu\approx\frac{c\,\Delta\lambda}{\lambda_0^2}§\tau_c\approx\frac1{\Delta\nu},\quad L_c\approx\frac{c\tau_c}{n}
pulse§\Delta\nu\sim\frac1{\Delta t}§\Delta\lambda\approx\frac{\lambda_0^2\,\Delta\nu}{c},\quad L_c\sim\frac{c}{\Delta\nu}
direction§z_R=\frac{\pi w_0^2}{\lambda}§w(z)=w_0\sqrt{1+\left(\frac z{z_R}\right)^2}§\theta=\frac{\lambda}{\pi w_0}
intensity§I=\frac PA=\frac{4P}{\pi d^2}\quad(\mathrm{W\,m^{-2}})
pumping§\frac{N_2}{g_2}>\frac{N_1}{g_1}\quad\text{(gain)}§N_2>N_1\quad\text{if }g_2=g_1
cavity§G_{\mathrm{round\ trip}}=R_1R_2\,e^{2(g-\alpha)L}§G_{\mathrm{threshold}}=1
`);
register(nuclear, String.raw`
overview§A=Z+N,\quad Q_{\mathrm{nucleus}}=+Ze
nuclides§{}^{A}_{Z}\mathrm X,\quad A=Z+N
isomers§M_{\mathrm{excited}}-M_{\mathrm{ground}}=\frac{E^*}{c^2}
mass§1\,\mathrm u=\frac{m({}^{12}\mathrm C)}{12}\quad\text{(neutral ground-state atom)}§(1\,\mathrm u)c^2\approx931.494\,\mathrm{MeV}
binding§\Delta m=2m({}^{1}\mathrm H)+2m_n-m({}^{4}\mathrm{He})§B\approx\Delta m\,c^2§\Delta_{\mathrm{mass}}=(M-A\,\mathrm u)c^2
beta§n\to p+e^-+\bar\nu_e§Z\to Z+1,\quad N\to N-1,\quad A\text{ unchanged}
scattering§D=\frac{(1.43996455\,\mathrm{MeV\,fm})z_1z_2}{E_{\mathrm{cm}}}
radius§R=r_0 A^{1/3}§n=\frac3{4\pi r_0^3}
charge§Q_{\mathrm{nucleus}}=Ze,\quad Q_{\mathrm{atom}}=(Z-N_e)e
fermi§\rho(r)=\frac{\rho_0}{1+e^{(r-R)/a}}§t_{90\text{–}10}=4a\ln 3\approx4.394a
recoil§E_{\mathrm{cm}}=\frac{M}{m+M}E_{\mathrm{lab}}§D=\frac{k z_1z_2}{E_{\mathrm{cm}}}
surface§R=c=1.1A^{1/3}\,\mathrm{fm}§f_{\mathrm{surface}}=1-\frac{(R-a/2)^3}{R^3+Ra^2/4}
`);
register(manuals.flatMap(manual=>manual.experiments), String.raw`
statistics§\mu=(\text{rate})(\text{gate time}),\quad\sigma=\sqrt\mu§\mathrm{FWHM}\approx2.355\,\sigma\quad\text{(Gaussian)}
voltage§G\propto\left(\frac V{0.9\,\mathrm{kV}}\right)^6§r_{\mathrm{net}}=r_{\mathrm{source}}-r_{\mathrm{background}}
calibration§E=aC+b,\quad a=\frac{E_2-E_1}{C_2-C_1}§R=\frac{\mathrm{FWHM}(E)}{E_{\mathrm{peak}}}\times100\%
electronics§A_{\mathrm{out}}=G A_{\mathrm{in}}§A_{\mathrm{lower}}\leq A_{\mathrm{out}}\leq A_{\mathrm{upper}}
dead-time§m=\frac n{1+n\tau},\quad n=\frac m{1-m\tau}§\tau\approx\frac{m_1+m_2-m_{12}}{2m_1m_2}
efficiency§A(t)=A_0\,2^{-t/T_{1/2}}§g=\frac12\left(1-\frac d{\sqrt{d^2+r^2}}\right)§\varepsilon_{\mathrm{abs}}=g\,\varepsilon_{\mathrm{int}}
resistance§R(T)=R_{\mathrm{ref}}\exp\left[\frac{E_g}{2k_B}\left(\frac1T-\frac1{T_{\mathrm{ref}}}\right)\right]§\alpha_{\mathrm{local}}=-\frac{E_g}{2k_BT^2}
lif§n\lambda=2d\sin\theta,\quad a_{\mathrm{LiF}}\approx2d§\text{Detector angle}=2\theta
moseley§\sqrt f=\sqrt{\frac{3cR_\infty}{4}}\,(Z-b)§R_\infty=\frac{4(\text{slope})^2}{3c}
powder§d_{hkl}=\frac a{\sqrt{h^2+k^2+l^2}}§2d\sin\theta=\lambda§s=2R\theta\quad(\theta\text{ in radians})
electron§\lambda=\frac h{\sqrt{2m_e eU}}§r\approx\frac{2R\lambda}{d},\quad R=65\,\mathrm{mm}
thermoelectric§V_{\mathrm{oc}}=142\alpha_{\mathrm{pair}}\Delta T§I=\frac{V_{\mathrm{oc}}}{R_i+R_L},\quad P_L=I^2R_L
`,'equation');

export function mathMarkup(source) {
  if (!rendered.has(source)) {
    const math = katex.renderToString(source,{output:'mathml',displayMode:true,throwOnError:true});
    rendered.set(source, math.replace(/<annotation[^>]*>.*?<\/annotation>/g,''));
  }
  return rendered.get(source);
}

export function formatFormula(element) {
  if(element.querySelector('math'))return;
  const markup=formulas.get(element.textContent.trim());
  if(!markup)return;
  element.innerHTML=markup;
  element.classList.add('model-math');
}

if(typeof document!=='undefined'){
  const selector='#formula,#equation,#insight,.formula,.equation,.notes-formula';
  const powerPattern=/([\p{L}\p{N})\]])\^(?:\(([^()]+)\)|([−-]?[\p{L}\p{N}]+))/gu;
  function normalizePowers(textNode){
    const parent=textNode.parentElement;
    if(!textNode.data.includes('^') || !parent || parent.closest('math,pre,code,script,style,textarea,option'))return;
    const matches=[...textNode.data.matchAll(powerPattern)];
    if(!matches.length)return;
    const pieces=document.createDocumentFragment();
    let offset=0;
    for(const match of matches){
      pieces.append(textNode.data.slice(offset,match.index)+match[1]);
      const exponent=document.createElement('sup');
      exponent.textContent=match[2]??match[3];
      pieces.append(exponent);
      offset=match.index+match[0].length;
    }
    pieces.append(textNode.data.slice(offset));
    textNode.replaceWith(pieces);
  }
  function scan(scope){
    if(scope.matches?.(selector))formatFormula(scope);
    scope.querySelectorAll?.(selector).forEach(formatFormula);
    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
    const text=[];
    while(walker.nextNode())text.push(walker.currentNode);
    text.forEach(normalizePowers);
  }
  scan(document);
  new MutationObserver(records=>{
    for(const record of records){
      const target=record.target.nodeType===Node.TEXT_NODE?record.target.parentElement:record.target;
      const formula=target?.closest?.(selector);
      if(formula)formatFormula(formula);
      if(record.type==='characterData')normalizePowers(record.target);
      for(const node of record.addedNodes){
        if(node.nodeType===Node.ELEMENT_NODE)scan(node);
        else if(node.nodeType===Node.TEXT_NODE)normalizePowers(node);
      }
    }
  }).observe(document.body,{childList:true,characterData:true,subtree:true});
}
