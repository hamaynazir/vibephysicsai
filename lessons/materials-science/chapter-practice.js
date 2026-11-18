const exercise=(id,question,answer,tolerance,unit,equation)=>({id,question,answer,tolerance,unit,equation});
const tex=String.raw;

export const calculationExercises={
  '02':[
    exercise('composition','Convert 97 wt% aluminum in Al–Cu to aluminum atom percent.',98.7033,.06,'at% Al',tex`100\frac{97/26.98}{97/26.98+3/63.55}\approx98.70\%`),
    exercise('radius-ratio','Find the ideal lower radius ratio for octahedral coordination.',Math.sqrt(2)-1,.003,'ratio',tex`\frac{r_C}{r_A}=\sqrt{2}-1\approx0.4142`),
    exercise('molar-mass','For 85 molecules at 20 kg/mol and 15 at 100 kg/mol, find the number-average molar mass.',32,.05,'kg/mol',tex`M_n=\frac{85(20)+15(100)}{100}=32\,\mathrm{kg/mol}`),
    exercise('polymerization','Find the ideal number-average degree of polymerization at 98% conversion for balanced step growth.',50,.1,'repeat units',tex`\bar X_n=\frac{1}{1-0.98}=50`)
  ],
  '03':[
    exercise('elastic','Calculate the copper specimen elongation for 276 MPa, 305 mm and a modulus of 110 GPa.',.76527,.012,'mm',tex`\Delta L=\frac{276(305)}{110\,000}\,\mathrm{mm}\approx0.77\,\mathrm{mm}`),
    exercise('shear','Find the shear modulus for 60 MPa, 0.1125 mm displacement and a 25 mm block.',13.333,.05,'GPa',tex`G=\frac{60}{0.1125/25}\,\mathrm{MPa}\approx13.33\,\mathrm{GPa}`),
    exercise('poisson','Find the percent lateral strain for 0.4% axial strain and a Poisson ratio of 0.33.',-.132,.004,'%',tex`\varepsilon_{\mathrm{trans}}=-0.33(0.4\%)=-0.132\%`),
    exercise('ductility','Find the percent elongation from 50 mm to 62.5 mm.',25,.1,'%',tex`\%\,\mathrm{EL}=100\frac{62.5-50}{50}=25`),
    exercise('resilience','Find the resilience for a yield strength of 350 MPa and a modulus of 200 GPa.',306.25,.5,'kJ/m³',tex`U_r=\frac{350^2}{2(200\,000)}\,\mathrm{MPa}=306.25\,\mathrm{kJ\,m^{-3}}`),
    exercise('brass-example','Find the maximum load for 450 MPa UTS and the original 12.8 mm diameter.',57.906,.1,'kN',tex`F_{\max}=450\pi(12.8/2)^2\,\mathrm N\approx57.91\,\mathrm{kN}`),
    exercise('true-stress','At 420 MPa engineering stress and strain 0.18, find true stress assuming uniform constant volume.',495.6,.2,'MPa',tex`\sigma_T=420(1+0.18)\,\mathrm{MPa}=495.6\,\mathrm{MPa}`),
    exercise('indenters','Find the Vickers hardness number for 100 N and a 0.50 mm mean diagonal.',75.64,.15,'HV',tex`\mathrm{HV}=0.1891\frac{100}{0.50^2}=75.64`)
  ]
};
