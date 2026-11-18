// A short question for the first look at each model.
const questions = {
  'crystal-structures': {
    introduction: 'What makes a crystal different from an amorphous solid?',
    crystalline: 'When you translate the array, which sites line up again?',
    definitions: 'What changes when you add an atom to the repeating motif?',
    systems: 'Which cell edges and angles distinguish two crystal systems?',
    bravais: 'How does centering add sites to a conventional cell?',
    symmetry: 'Which operation brings the cube back to an equivalent arrangement?',
    'cube-symmetry': 'How far must the cube rotate about each axis to look the same?',
    wigner: 'How do neighboring sites determine the faces around the origin?',
    packing: 'Which cubic arrangement leaves the least empty space?',
    structures: 'What changes about the nearest neighbors when you switch structure?',
    indices: 'What happens to a plane when one of its indices becomes zero?',
    spacing: 'What happens to spacing when you double all three indices?',
    amorphous: 'What local pattern can survive as long-range order disappears?',
    forces: 'Where does the radial force change sign as you move the atoms?',
    bonding: 'Where are the electrons in each type of bond?',
    madelung: 'What happens to the sum as you include more neighbor shells?'
  },
  'materials-and-bonding': {
    overview: 'How does a material’s structure help explain its properties?',
    alumina: 'How much detail can you see through each alumina specimen?',
    metals: 'Which features help distinguish metals from other material classes?',
    ceramics: 'How do the properties of ceramics shape their uses?',
    polymers: 'What happens to chain mobility when you add cross-links?',
    composites: 'How does adding more fiber change the predicted stiffness?',
    properties: 'Does the material ranking stay the same when you change the property?',
    semiconductors: 'Which charge carriers do donor and acceptor dopants introduce?',
    biomaterials: 'What must a material do in each biomedical application?',
    smart: 'How does the material respond when you change the stimulus?',
    nano: 'What happens to total surface area when you divide the same volume?',
    atomic: 'Which electrons are in the outer shell of the selected atom?',
    forces: 'Where is the energy minimum as you change the separation?',
    ionic: 'What charges do the atoms gain after one electron transfers?',
    covalent: 'Where is a shared electron pair relative to the two nuclei?',
    sp3: 'How are four equivalent bond directions arranged in space?',
    sp2: 'Which directions lie in the plane, and what points out of it?',
    metallic: 'Which way do electrons drift when you turn on the field?',
    secondary: 'What distinguishes a permanent, induced, or fluctuating dipole?',
    hydrogen: 'Which atoms act as the hydrogen-bond donor and acceptor?',
    mixed: 'Where can different kinds of bonding appear in the same material?',
    molecules: 'How do bonds within molecules differ from attractions between them?'
  },
  'laser-radiation': {
    overview: 'Which property best distinguishes the two light sources in each comparison?',
    history: 'What changed between the milestones on the timeline?',
    fields: 'What rotates when you change polarization?',
    wave: 'Which part of the wave changes when you vary wavelength or amplitude?',
    frequency: 'How does a longer wavelength change frequency and period?',
    spectrum: 'Which band do you enter as you scan across wavelengths?',
    levels: 'How does changing the energy-level gap change the emitted wavelength?',
    photons: 'At the same power, which wavelength gives the larger photon rate?',
    interactions: 'What happens to the atom and the light in each interaction?',
    'he-ne': 'What do wavelength and optical power tell you about a He–Ne laser?',
    temporal: 'How does a wider spectrum affect temporal coherence?',
    spatial: 'What happens to the fringes when the relative phase fluctuates?',
    pulse: 'What happens to the estimated spectrum when the pulse gets shorter?',
    direction: 'How does changing the beam waist affect spreading?',
    monochromatic: 'How does a narrow linewidth look on a spectrum?',
    intensity: 'At fixed power, what happens to irradiance when you make the spot smaller?',
    medium: 'How does the active medium affect the light a laser can emit?',
    pumping: 'When does the upper level become more populated than the lower one?',
    cavity: 'How does the output mirror affect the light retained in the cavity?'
  },
  'nuclear-basic-concepts': {
    overview: 'Which quantities describe a nucleus, and how are they related?',
    nuclides: 'Which number determines the element when you change the counts?',
    relations: 'What must two nuclei share to be isotopes, isotones, or isobars?',
    isomers: 'What changes between nuclear isomers if proton and neutron counts stay fixed?',
    mass: 'How do the mass and rest energy readouts change together?',
    binding: 'What does the difference between the separated and bound masses represent?',
    beta: 'Which counts change during beta-minus decay?',
    scattering: 'What happens to the turning point when the incoming energy increases?',
    radius: 'How can nuclei grow larger while their average density stays similar?',
    charge: 'How do nuclear charge and net atomic charge differ?',
    fermi: 'Which part of the density profile broadens when diffuseness increases?',
    particles: 'Which particles belong to the same family, and why?',
    recoil: 'How does allowing the target to recoil affect closest approach?',
    surface: 'What does the surface layer contribute to the nucleon count?'
  },
  'emt-vector-analysis': {
    overview: 'How do vector operations lead from components to field integrals?',
    vectors: 'How does changing one component change the arrow and its length?',
    addition: 'Where does the sum end if you place the two arrows head to tail?',
    dot: 'When does the signed projection change sign?',
    cross: 'How is the result oriented relative to the two input vectors?',
    components: 'Where do the three component steps end?',
    direction: 'Move the origin. Which position vectors change, and what happens to the displacement?',
    cube: 'How does the angle depend on which diagonals you compare?',
    position: 'What happens to the unit direction if a point moves along the same ray?',
    elements: 'How do the orientation and area differ among the three faces?',
    gradient: 'Which direction gives the greatest local increase?',
    divergence: 'Which changes make more field flow out locally than in?',
    curl: 'What happens to curl when you reverse the sense of rotation?',
    identities: 'Do the three second-derivative operations give the same result?',
    'gradient-theorem': 'Do the straight and bent paths give different integrals?',
    gauss: 'How do total outward flux and the volume integral compare?',
    stokes: 'What happens to both results when you reverse the orientation?',
    coordinates: 'How does the azimuth change as the point crosses an axis?',
    spherical: 'How does the local basis turn as you change the angles?',
    'spherical-elements': 'How does the same angular step change length as you move outward?',
    cylindrical: 'Which distance is measured from the axis?',
    'cylindrical-elements': 'What happens to the azimuthal edge when the radius doubles?',
    classification: 'Can a field spread and circulate at the same point?',
    summary: 'Which operation would you use for projection, flux, or circulation?'
  },
  laboratory: {
    statistics: 'How much do repeated counts vary with the same settings?',
    voltage: 'What does changing the gain do to pulses near the threshold?',
    calibration: 'What makes two nearby peaks harder to distinguish?',
    electronics: 'Which pulses pass through the selected amplitude window?',
    'dead-time': 'When does a second event reach the detector too soon to count?',
    efficiency: 'How does distance change the fraction of emissions that reach the detector?',
    resistance: 'Warm the sample and watch the resistance. Which way does it change?',
    lif: 'Where does a peak appear as the crystal and detector turn?',
    moseley: 'How does the characteristic X-ray frequency change with atomic number?',
    powder: 'How do the selected planes change the diffraction angle?',
    electron: 'Raise the voltage. What happens to the wavelength and both ring radii?',
    thermoelectric: 'How do temperature difference and load affect the power delivered?'
  }
};

function disclosure(label, className) {
  const details = document.createElement('details');
  details.className = className;
  const summary = document.createElement('summary');
  summary.textContent = label;
  details.append(summary);
  return details;
}

function installStudyFocus() {
  const controls = document.querySelector('#controls');
  const stage = document.querySelector('#visual-stage, #stage');
  const description = document.querySelector('#lab-description, #description, #aim');
  const section = document.querySelector('#visual-section, #experiment-select');
  if (!controls || !stage || !description || !section) return false;

  const lab = document.body.dataset.manual;
  const nuclearLab = lab === 'nuclear';
  const course = lab ? 'laboratory' : section.closest('nav')?.dataset.lesson;
  const compactIntro = document.createElement('div');
  compactIntro.className = 'study-intro';
  const question = document.createElement('p');
  const context = disclosure(lab ? 'Experiment aim' : 'About this section', 'study-context');
  description.before(compactIntro);
  context.append(description);
  compactIntro.append(question, context);
  let currentSection;
  function updatePrompt() {
    const id = section.value;
    if (id !== currentSection) context.open = false;
    currentSection = id;
    const prompt = questions[course]?.[id];
    question.textContent = prompt || description.textContent;
    context.hidden = !prompt;
  }
  new MutationObserver(updatePrompt).observe(description, {childList: true, characterData: true, subtree: true});
  section.addEventListener('change', updatePrompt);
  updatePrompt();
  if (!lab) document.dispatchEvent(new Event('study-focus-ready'));

  if (!nuclearLab) {
    if (stage.parentElement === controls.parentElement) {
      controls.after(stage);
      const playback = stage.parentElement.querySelector(':scope > .study-motion, :scope > #motion-controls');
      if (playback) stage.after(playback);
      const status = stage.parentElement.querySelector(':scope > #motion-status');
      if (status && playback) playback.after(status);
    }
    const equation = document.querySelector('#model > .equation');
    const insight = lab ? document.querySelector('#insight') : null;
    if (equation) {
      const notes = disclosure('Model equation', 'study-equation');
      (insight || equation).after(notes);
      notes.append(equation);
    }
    if (lab) {
      const data = document.querySelector('#record')?.closest('details');
      if (data) data.open = false;
      const limits = document.querySelector('#limits')?.closest('details');
      const safety = document.querySelector('.safety');
      if (limits && safety) limits.querySelector('summary').after(safety);
      const pageContext = document.querySelector('#page-context');
      if (pageContext) context.append(pageContext);
    }
  }

  // Keep the existing input nodes and delegated handlers inside their original control set.
  let more;
  let controlSection;
  const observer = new MutationObserver(groupControls);
  function groupControls() {
    observer.disconnect();
    const id = section.value;
    const wasOpen = controlSection === id && more?.open;
    controlSection = id;
    const fields = [...controls.children].filter(field => field.matches('label') && field.querySelector('input, select'));
    const primary = lab === 'solid-state' && id === 'electron' ? 'voltage'
      : course === 'emt-vector-analysis' && id === 'direction' ? 'origin' : null;
    if ((fields.length > 3 || (primary && fields.length > 1)) && id !== 'dead-time') {
      const body = document.createElement('div');
      body.className = 'controls study-extra-fields';
      more = disclosure('More controls', 'study-more-controls');
      more.open = Boolean(wasOpen);
      const featured = primary && fields.find(field => field.querySelector('input, select').dataset.key === primary);
      const visible = featured ? [featured] : fields.slice(0, 3);
      body.append(...fields.filter(field => !visible.includes(field)));
      more.append(body);
      controls.append(more);
    } else {
      more = undefined;
    }
    observer.observe(controls, {childList: true});
  }
  groupControls();
  document.documentElement.classList.add('study-focus');
  return true;
}

if (!installStudyFocus()) {
  const ready = new MutationObserver(() => { if (installStudyFocus()) ready.disconnect(); });
  ready.observe(document.body, {childList: true, subtree: true});
}
