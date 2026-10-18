// PDF page numbers below include covers/contents; printed-page labels differ.
const control=(key,label,min,max,step,value)=>({key,label,min,max,step,value});
const experiment=(id,title,pages,aim,apparatus,equation,controls,steps,insight,limits,question,options,answer,explanation)=>({id,title,pages,aim,apparatus,equation,controls,steps,insight,limits,question,options,answer,explanation});
export const manuals=[
 {id:'nuclear-laboratory',slug:'nuclear',title:'Nuclear Laboratory',icon:'nuclear',accent:'#6e66a4',tint:'#f5f3fb',description:'Six experiment companions: radiation counting, scintillation, calibration, electronics, dead time and efficiency.',reader:'laboratories/nuclear/index.html',pages:28,credit:'Instructor not specified in the supplied manual',experiments:[
 experiment('statistics','Counting statistics',[3,7],'See why repeated counts fluctuate and compare the sample spread with the Poisson prediction.','Radiation source → detector → scaler + fixed timer','μ = rate × gate; σ = √μ; Gaussian FWHM ≈ 2.355σ',[
 control('rate','Mean detected rate (s⁻¹)',1,20,1,6),control('gate','Counting gate (s)',1,20,1,10)],
 ['Choose the detected rate and gate duration. These specify the expected count μ, not the result of every trial.','Use Record simulated reading repeatedly, or Generate a dataset, to collect independent Poisson counts.','Compare the sample mean and sample standard deviation with μ and √μ.','Compare the histogram with the expected distribution; use the manual’s questions to discuss uncertainty.'],
 'A count is dimensionless. A rate is a count divided by time. For equal gates, σ(rate) = √μ / gate. The uncertainty of an average decreases with the number of independent trials.',
 'Independent, stationary Poisson arrivals; no dead time or drift. Gaussian FWHM is an approximation suitable at large μ, not an exact width for low-count Poisson distributions. The manual’s illustrative table is retained as supplied, not treated as verified measured data.',
 'If you quadruple the gate time at a constant rate, what happens to relative Poisson uncertainty?', ['It doubles','It halves','It stays the same'],1,'Relative uncertainty is 1/√μ. Quadrupling time quadruples μ and halves the relative uncertainty.'),
 experiment('voltage','Scintillation operating voltage',[8,10],'Explore the distinction between photomultiplier gain, discriminator threshold and detected count rate.','NaI(Tl) → photocathode → dynodes → amplifier → discriminator → scaler','Illustrative gain ∝ (V / 0.9 kV)⁶; net rate = source rate − background rate',[
 control('voltage','High voltage (kV)',.8,1,.01,.9),control('threshold','Pulse threshold (relative units)',.1,1.5,.05,.5)],
 ['Watch the signal chain: deposited gamma energy becomes scintillation light, then a charge pulse.','Increase voltage: photomultiplier gain increases. A threshold accepts more pulses as their amplitudes rise.','Record values across 0.80–1.00 kV and identify the stable part of this illustrative response.','In the real lab, use the approved detector settings and compare source/background measurements at equal times.'],
 'Voltage changes gain, not the energy of the emitted gamma rays. An operating region depends on threshold, noise, stability and the specific detector. It is not a universal voltage.',
 'The response curve and sixth-power gain are illustrative, not a fitted device calibration or a recommended operating voltage. The manual’s “0.80 keV–1 keV” voltage text should read kV. Subtract counts taken over the same duration before dividing by time; N−NB over 10 s is not yet counts/s.',
 'Does increasing detector high voltage increase the gamma energy emitted by the source?', ['Yes','No'],1,'The source transition energy is unchanged; the photomultiplier changes electrical gain.'),
 experiment('calibration','Energy calibration & resolution',[11,16],'Map pulse-height channels to energy and see how peak width affects resolution.','Known gamma source → scintillation detector → pulse-height analyzer','E = aC + b; a = (E₂−E₁)/(C₂−C₁); R = FWHM(E) / Epeak × 100%',[
 control('channel1','Co-60 lower peak channel C₁',200,500,1,350),control('channel2','Co-60 upper peak channel C₂',550,850,1,650),control('unknown','Unknown peak channel',0,1000,1,500),control('width','Gaussian peak σ (channels)',3,50,1,12)],
 ['Identify two known peak centroids, not arbitrary peak edges. Here E₁ = 1173 keV and E₂ = 1332 keV are rounded Co-60 reference energies; the manual prints 1333 keV for the upper line.','Set the two channel positions and calculate the positive slope a and the intercept b.','Move the unknown channel marker to read its energy. Only interpret the calibrated range; extrapolation is not verified.','Increase σ and compare FWHM with energy resolution. Lower percentage resolution means sharper separation.'],
 'Both calibration differences must use the same ordering. The intercept is not assumed zero. For a nonzero intercept, FWHM(channel)/channel is not generally the energy-resolution ratio.',
 'Two Gaussian reference photopeaks only: continuum, escape/sum peaks and noise are omitted. Channels here are arbitrary digitizer units, not the manual’s BLV volts. Companion corrects the reversed calibration-sign formula on printed p14. Na-22 decays to Ne-22, not Na-22; 511 keV is positron-annihilation radiation, not a nuclear “pair-production peak.”',
 'With a nonzero calibration intercept, which expression gives energy resolution?', ['FWHM(E) / Epeak','FWHM(channel) / channel, always'],0,'Convert width using |a| and the centroid using aC+b. The channel-only ratio assumes b = 0.'),
 experiment('electronics','Electronic measurement chain',[17,21],'Follow pulse shaping and learn what a single-channel analyzer accepts.','Detector → preamplifier → shaping amplifier → SCA → scaler/timer','Amplified amplitude = gain × input; accept if lower ≤ amplitude ≤ upper',[
 control('amplitude','Input pulse height (V)',.1,1,.05,.5),control('gain','Amplifier gain',1,8,.5,4),control('lower','SCA lower threshold (V)',0,3,.1,1),control('window','SCA window width (V)',.2,4,.1,2)],
 ['Follow the labeled blocks as a demonstration pulse moves through the chain.','Compare the preamplifier decay pulse and shaped amplifier pulse.','Change amplitude, gain and the SCA window; accepted events produce a standardized logic pulse.','In a report, distinguish pulse width, repetition interval, gain and the analyzer’s acceptance window.'],
 'The SCA converts accepted analog pulse heights to standardized logic signals. A multichannel analyzer instead sorts pulse heights into many bins. Pulse duration is not the repetition period of random radiation events.',
 'Normalized schematic pulse shapes; polarity, widths and absolute timing do not reproduce a specific instrument. Event repetition is deliberately regular for teaching. No hardware-control or wiring instructions are implied.',
 'What determines acceptance by an ideal SCA?', ['Whether amplified pulse height lies inside its window','The source’s name'],0,'The lower and upper amplitude thresholds define the acceptance window.'),
 experiment('dead-time','GM dead time: two-source method',[22,24],'See missed events and compare observed and true rates under a nonparalyzable model.','Source 1 / Source 2 → GM tube → scaler + timer','m = n/(1+nτ); n = m/(1−mτ); τapprox = (m₁+m₂−m₁₂)/(2m₁m₂)',[
 control('source1','True source 1 rate (s⁻¹)',50,1000,10,300),control('source2','True source 2 rate (s⁻¹)',50,1000,10,400),control('dead','Dead time τ (μs)',50,800,10,400)],
 ['A detected event starts a fixed insensitive interval; arrivals inside it are missed and do not extend it.','Compare observed rates for source 1, source 2 and both together with unchanged geometry.','Record the three expected observed rates; calculate the low-loss two-source estimate.','Compare its estimate with the chosen τ and note the increasing bias at high losses.'],
 'The correction uses rates in s⁻¹ and τ in seconds. It requires mτ < 1. The low-loss two-source estimate is approximate; it is not exact at large count losses.',
 'Nonparalyzable detector with zero background for the synthetic two-source exercise. Real background subtraction, source positioning and a different dead-time model can change the inference. The packet timeline is schematic, not a random-time estimator.',
 'In this model, does an arrival during dead time extend the dead interval?', ['Yes','No'],1,'Not in a nonparalyzable model. An extending interval describes a different, paralyzable model.'),
 experiment('efficiency','GM counter efficiency',[25,28],'Separate source activity, geometric acceptance and intrinsic detection efficiency.','Isotropic point source → circular detector window (radius 0.675 cm) → counter','A(t) = A₀ 2^(−t/T½); g = [1−d/√(d²+r²)]/2; εabs = g εint',[
 control('distance','Source-to-window distance (cm)',1,10,.1,3),control('age','Source age (years)',0,40,.1,22),control('half','Half-life (years; manual examples 28.5 or 2.6)',2.6,28.5,.1,28.5),control('intrinsic','Assumed intrinsic efficiency (%)',1,100,1,40)],
 ['Choose the time elapsed since source manufacture; use the actual experiment date in a report.','Change distance to see the window’s geometric fraction g.','Compare emitted quanta, quanta reaching the window and recorded events.','Distinguish εabs = counted/emitted from εint = counted/incident; the two denominators are different.'],
 'A₀ = 74000 Bq is interpreted as the manual’s reference activity, not a number of atoms. This simplified demonstration assumes one relevant quantum per decay; branching, Sr/Y daughter contributions, attenuation and dead time need separate treatment with real data.',
 'Exact on-axis point-source circular-window solid angle; the manual’s r²/(4d²) is the far-field approximation. Assumed εint is not a measured GM efficiency or a property of all radiation. Model output is before dead-time loss; real measurement analysis must correct it consistently.',
 'Moving the same small detector farther away primarily reduces which factor?', ['Geometric acceptance','The source’s half-life'],0,'The detector subtends a smaller solid angle. Source half-life is independent of this geometry.')
 ]},
 {id:'solid-state-physics-lab',slug:'solid-state',title:'Solid State Physics Lab',icon:'crystal',accent:'#277e70',tint:'#f0f8f5',description:'Six experiment companions: semiconductor resistance, X-ray diffraction, Moseley’s law, graphite diffraction and thermoelectric generation.',reader:'laboratories/solid-state/index.html',pages:43,credit:'Manual PDF author metadata: Dr. Omed; Shaho M. Rasul',experiments:[
 experiment('resistance','Semiconductor temperature coefficient',[3,6],'Explore a decreasing germanium resistance and distinguish local from interval temperature coefficients.','Germanium sample + heater + thermometer + current source + voltmeter','R(T) = Rref exp[(Eg/2kB)(1/T−1/Tref)]; αlocal = −Eg/(2kBT²)',[
 control('temperature','Sample temperature (°C)',40,140,1,80),control('gap','Assumed band gap Eg (eV)',.4,.9,.01,.67),control('current','Measuring current (mA)',1,5,.5,5)],
 ['Set the sample temperature; the model uses Kelvin internally.','At a chosen current, read V and infer R = V/I.','Record points over 40–140 °C and plot R against temperature.','Compare the local derivative α with the finite-interval coefficient relative to 40 °C.'],
 'Higher temperature increases intrinsic carrier population in this simplified regime. The exponential prefactor is not resistance at 0 K: the formula diverges as T approaches zero. A local derivative and a wide-interval secant need not agree.',
 'Illustrative intrinsic-semiconductor law with fixed Eg and prefactor, normalized to 100 Ω at 40 °C. Mobility prefactors, doping, contacts, self-heating and temperature-dependent Eg are omitted. This behavior is not universal for every semiconductor at every temperature.',
 'Which temperature must appear in the exponential law?', ['Kelvin','Degrees Celsius'],0,'Absolute temperature in Kelvin is required; temperature differences may use K or °C.'),
 experiment('lif','LiF X-ray diffraction',[7,11],'See Bragg matching and the difference between crystal angle θ and detector angle 2θ.','X-ray tube → collimator → LiF crystal → coupled detector','nλ = 2d sinθ; detector scattering angle = 2θ; a(conventional LiF) ≈ 2d',[
 control('theta','Glancing angle θ (degrees)',10,60,.1,22.4),control('wavelength','X-ray wavelength (pm)',130,165,.01,153.45),control('order','Diffraction order n',1,2,1,1),control('spacing','LiF reflecting-plane spacing d (pm)',190,215,.1,201.4)],
 ['Identify θ from the reflecting plane, not its normal; the detector follows 2θ.','Change θ until 2d sinθ matches nλ and the illustrative peak marker reaches its maximum.','Repeat with the manual’s listed wavelengths 139.23 pm and 153.45 pm, and n = 1 or 2.','Plot nλ versus sinθ: slope = 2d. Distinguish that d from the conventional rock-salt cell edge.'],
 'For the usual LiF (100)-oriented analyzer, the reflecting spacing is about 201.4 pm (conventional (200) family); the conventional cell edge is about 402.8 pm. Conventional (100) reflections are systematically absent in the FCC lattice. The manual’s d100 = a0 notation must not be confused with this conventional indexing.',
 'Single-family kinematic Bragg demonstration. Displayed intensity is an illustrative Gaussian angular response, not measured reflectivity, a structure-factor calculation or a full copper spectrum. The listed manual wavelengths are retained rather than silently replaced.',
 'When the crystal glancing angle is θ, what is the detector scattering angle?', ['θ','2θ','θ/2'],1,'The incident and outgoing beam directions are separated by 2θ in the coupled geometry.'),
 experiment('moseley','Moseley’s law',[12,26],'Connect characteristic X-ray frequency with atomic number and recover the Rydberg constant from a slope.','Characteristic X-ray source → analyzer crystal → detector','√f = √(3cR∞/4)(Z−b); R∞ = 4 slope²/(3c)',[
 control('atomic','Atomic number Z',19,30,1,26),control('screen','Assumed Kα screening b',.5,1.5,.05,1)],
 ['Vary atomic number from K (19) to Zn (30), matching the manual’s spectrum worksheets.','Use the simplified Kα law to generate frequencies and plot √f against Z.','Record several points and fit a straight line: slope recovers R∞, and −intercept/slope gives b.','For measured spectra, read the axis carefully: if it is 2θ, divide by two before applying Bragg’s law.'],
 'The supplied 12 spectrum worksheets remain available in PDF pages 15–26. This simulation does not claim to have digitized their curves. Its Kα screening law is a nonrelativistic approximation, not a precision atomic spectrum.',
 'R∞ = 1.0973731568×10⁷ m⁻¹ is a reference value. A plot synthesized from that constant only verifies the algebra; it does not independently measure R∞. For the manual’s NaCl (111) analyzer, d111 = a/√3, not a.',
 'Moseley’s plot uses √frequency against which quantity?', ['Atomic number Z','Atomic mass'],0,'Atomic number organizes characteristic X-ray frequencies in Moseley’s law.'),
 experiment('powder','GaAs powder diffraction',[27,31],'Relate indexed cubic spacings to diffraction angles and powder cones.','Monochromatic X-rays → randomly oriented powder → cylindrical film / detector','d(hkl) = a/√(h²+k²+l²); 2d sinθ = λ; film arc s = 2Rθ (θ in radians)',[
 control('lattice','Assumed cubic lattice constant a (Å)',5.3,6,.01,5.65),control('wavelength','X-ray wavelength λ (Å)',1,2,.01,1.6),control('family','Plane family: 1=111, 2=220, 3=311, 4=400, 5=331',1,5,1,1)],
 ['Select one of the five indexed families in the manual: (111), (220), (311), (400), (331).','Compare d and 2θ; smaller d generally moves the reflection to a larger angle at fixed λ.','Imagine a cylindrical film of radius R: the arc distance along the film is s = 2Rθ, not a flat-screen ring radius.','Record d versus 1/√(h²+k²+l²); the slope of this cubic relation is a.'],
 'Random crystallite orientations produce cones at fixed 2θ around the beam, not random Bragg angles. For a flat screen, the radius instead depends on tan(2θ). Distinguish these detector geometries before converting distances.',
 'Five listed families only; arbitrary relative peak heights, no structure factors, absorption, texture or line broadening analysis. The manual labels an arc distance r; the companion calls it s to avoid confusing it with a flat-screen radius. No ring-intensity prediction is made.',
 'At fixed wavelength, a smaller interplanar spacing usually produces what?', ['A larger Bragg angle','A smaller Bragg angle'],0,'sinθ = λ/(2d), provided the reflection is geometrically accessible.'),
 experiment('electron','Graphite electron diffraction',[32,36],'Change electron accelerating voltage and watch the two graphite diffraction rings contract.','Electron gun → polycrystalline graphite → fluorescent bulb screen','λ = h/√(2meeU); r ≈ 2Rλ/d; R = 65 mm',[
 control('voltage','Accelerating voltage (kV)',4,6.5,.1,4),control('bulb','Bulb radius R (mm)',60,70,1,65)],
 ['Choose a voltage in the manual’s 4–6.5 kV range.','Read the nonrelativistic electron wavelength and the two predicted ring radii for d₁ = 213 pm and d₂ = 123 pm.','Record r against λ for each ring; keep length units consistent.','Use each slope = 2R/d to recover d. Explain why voltage increases shrink the rings.'],
 'The manual’s R is the bulb radius, not the gun-to-screen distance. Its small-angle geometry gives r ≈ 2Rλ/d. This is not the generic flat-screen r ≈ Lλ/d unless L ≈ 2R in the corresponding geometry.',
 'Small-angle, nonrelativistic model matching the manual. Relativistic wavelength is shown as a comparison, not silently substituted; in this voltage range the wavelength correction is below 0.4%. Ring brightness and moving points are schematic; points are not literal electron trajectories.',
 'Why do the rings shrink as accelerating voltage rises?', ['Electron wavelength decreases','Graphite spacing must increase'],0,'Higher momentum reduces λ, so the diffraction angles and ring radii decrease for unchanged d.'),
 experiment('thermoelectric','Semiconductor thermoelectric generator',[37,42],'Compare open-circuit emf, loaded output voltage and load power.','Hot/cold junctions → 142-couple module → load → voltmeter/ammeter','Voc = 142 αpair ΔT; I = Voc/(Ri+RL); Pload = I²RL',[
 control('delta','Hot minus cold temperature ΔT (K)',0,60,1,40),control('alpha','Assumed pair Seebeck coefficient (μV/K)',100,500,10,350),control('internal','Module internal resistance Ri (Ω)',1,10,.5,4),control('load','Load resistance RL (Ω)',.5,20,.5,4),control('cooling','Magnitude of cooling slope (K/min)',.5,10,.1,3)],
 ['Change ΔT and see the open-circuit emf of 142 series thermocouples.','Connect a load in the model: the terminal voltage drops below Voc.','Vary RL around Ri and find the maximum electrical load power.','For the manual’s water model, estimate thermal power as 0.194 × 4182 × |dΔT/dt|, converting K/min to K/s, then compare with electrical power.'],
 'The pair Seebeck coefficient is obtained from OPEN-CIRCUIT voltage slope divided by 142. Using loaded voltage without correcting for the internal resistance underestimates it. Maximum power at RL = Ri is not maximum thermodynamic efficiency.',
 'Fixed-coefficient equivalent circuit, not a full coupled heat-flow solver. The manual’s water-cooling estimate is conditional on its calorimetric assumptions; it is not guaranteed to equal heat entering the module. Displayed Pload/Pthermal is an apparent ratio, not a validated efficiency. No universal 0.9% value is imposed. The appendix’s Avogadro exponent 10²² should be 10²³.',
 'Which voltage should determine the module Seebeck slope?', ['Open-circuit voltage','Loaded voltage without correction'],0,'Open circuit removes the voltage drop across internal resistance. Divide the module slope by 142 for the pair coefficient.')
 ]}
];
export function experimentForPage(manual,page){return manual.experiments.find(e=>page>=e.pages[0]&&page<=e.pages[1])|| (page<manual.experiments[0].pages[0]?manual.experiments[0]:manual.experiments.at(-1));}
const references=[
 ['PHYWE: electron diffraction','https://www.phywe.com/experiments-sets/nobel-prize-experiments/electron-diffraction_9532_10463/'],
 ['Graphite ring spacings (University of Washington)','https://phys-office.phys.washington.edu/lectdemo/DetailPages/7/A/Electron_Diffraction_%287A60.10%29.html'],
 ['PHYWE: thermogenerator, no-load voltage and Seebeck coefficient','https://www.phywe.com/experiments-sets/university-experiments/semiconductor-thermogenerator-seebeck-effect_10679_11610/'],
 ['NaI(Tl) reference spectra (Idaho National Laboratory)','https://inl.gov/content/uploads/2023/07/naicat.pdf'],
 ['NIST: SI defining constants','https://www.nist.gov/pml/special-publication-330/sp-330-section-2'],
 ['LD Didactic: LiF diffraction and conventional cell edge','https://www.ld-italia.it/uploads/4/7/2/8/47287479/p7122_e.pdf']
];
const geiger = ['ORTEC Experiment 2: counting statistics and GM resolving-time corrections', 'https://www.ortec-online.com/-/media/ametekortec/third-edition-experiments/2-geiger-counting.pdf'];
// Explicit opt-in: never attach a whole-library bibliography to an experiment.
const experimentReferences = {
 'statistics': [['ORTEC Experiment 2.6: counting statistics (PDF pages 9–11)', geiger[1]+'#page=9']],
 'voltage': [],
 'calibration': [references[3]],
 'electronics': [],
 'dead-time': [[geiger[0]+' · section 2.2 (PDF pages 3–4)',geiger[1]+'#page=3']],
 'efficiency': [['ORTEC Experiment 2.5: counting geometry and intrinsic efficiency (PDF pages 8–9)',geiger[1]+'#page=8']],
 'resistance': [],
 'lif': [references[5]],
 'moseley': [references[4]],
 'powder': [],
 'electron': [references[0], references[1], references[4]],
 'thermoelectric': [references[2]]
};
export function referencesForExperiment(id) {
 if (!Object.hasOwn(experimentReferences, id)) throw new Error('Unknown experiment reference scope: ' + id);
 return experimentReferences[id];
}

