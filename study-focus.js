// A short question for the first look at each model.
const questions = {
  'crystal-structures': {
    introduction: 'Compare the ordered and disordered arrays. What makes a crystal different from an amorphous solid?',
    crystalline: 'Follow an interior site through one lattice translation. When you translate the array, which sites line up again?',
    definitions: 'Switch the motif and track two neighboring lattice sites. What changes when you add an atom to the repeating motif?',
    systems: 'Compare the tetragonal and hexagonal cells. Which cell edges and angles distinguish two crystal systems?',
    bravais: 'Compare primitive and body-centered cubic cells. How does centering add sites to a conventional cell?',
    symmetry: 'Follow one corner of the cube through the operation. Which operation brings the cube back to an equivalent arrangement?',
    'cube-symmetry': 'Compare a face axis with a body diagonal. How far must the cube rotate about each axis to look the same?',
    wigner: 'Compare the nearest-site regions for SC and FCC. How do neighboring sites determine the faces around the origin?',
    packing: 'Switch from SC to BCC to FCC and compare the occupied fractions. Which cubic arrangement leaves the least empty space?',
    structures: 'Compare diamond with zinc blende. What changes about the nearest neighbors when you switch structure?',
    indices: 'Compare (110) with (100). What happens to a plane when one of its indices becomes zero?',
    spacing: 'Compare (111) and (222) in the same cell. What happens to spacing when you double all three indices?',
    amorphous: 'Increase the disorder while watching neighboring sites. What local pattern can survive as long-range order disappears?',
    forces: 'Move the atoms across their equilibrium separation. Where does the radial force change sign as you move the atoms?',
    bonding: 'Compare the shared pair with the metallic electron distribution. Where are the electrons in each type of bond?',
    madelung: 'Add two successive shells to the alternating chain. What happens to the sum as you include more neighbor shells?'
  },
  'materials-and-bonding': {
    overview: 'Follow the diagram from processing to performance. How does a material’s structure help explain its properties?',
    alumina: 'Switch between transparent, translucent and opaque samples. How much detail can you see through each alumina specimen?',
    metals: 'Compare the metals and ceramics entries. Which features help distinguish metals from other material classes?',
    ceramics: 'Pick a ceramic and connect a property to an application. How do the properties of ceramics shape their uses?',
    polymers: 'Compare the chains at low and high cross-link density. What happens to chain mobility when you add cross-links?',
    composites: 'Increase the fiber fraction with both moduli fixed. How does adding more fiber change the predicted stiffness?',
    properties: 'Switch the comparison from stiffness to strength. Does the material ranking stay the same when you change the property?',
    semiconductors: 'Compare intrinsic, donor and acceptor cases. Which charge carriers do donor and acceptor dopants introduce?',
    biomaterials: 'Switch from an implant to a delivery material. What must a material do in each biomedical application?',
    smart: 'Choose shape memory and increase the stimulus. How does the material respond when you change the stimulus?',
    nano: 'Change from one piece per edge to two. What happens to total surface area when you divide the same volume?',
    atomic: 'Select two atoms and count their outer electrons. Which electrons are in the outer shell of the selected atom?',
    forces: 'Move through the bottom of the energy well. Where is the energy minimum as you change the separation?',
    ionic: 'Replay the electron transfer from neutral atoms. What charges do the atoms gain after one electron transfers?',
    covalent: 'Trace the electron density between the nuclei. Where is a shared electron pair relative to the two nuclei?',
    sp3: 'Select two different bonds and read their angle. How are four equivalent bond directions arranged in space?',
    sp2: 'Compare the geometry view with the orbital view. Which directions lie in the plane, and what points out of it?',
    metallic: 'Switch the field on and play the motion. Which way do electrons drift when you turn on the field?',
    secondary: 'Compare the London and induction mechanisms. What distinguishes a permanent, induced, or fluctuating dipole?',
    hydrogen: 'Increase the separation and follow the dashed contact. Which atoms act as the hydrogen-bond donor and acceptor?',
    mixed: 'Increase polarization and follow the shared charge. Where can different kinds of bonding appear in the same material?',
    molecules: 'Increase the distance between molecules. How do bonds within molecules differ from attractions between them?'
  },
  'laser-radiation': {
    overview: 'Choose one property and compare the two sources side by side. Which property best distinguishes the two light sources in each comparison?',
    history: 'Switch from the optical proposal to the working ruby laser. What changed between the milestones on the timeline?',
    fields: 'Rotate the polarization while tracking both field vectors. What rotates when you change polarization?',
    wave: 'Hold amplitude fixed and increase wavelength. Which part of the wave changes when you vary wavelength or amplitude?',
    frequency: 'Compare two wavelengths in vacuum. How does a longer wavelength change frequency and period?',
    spectrum: 'Scan from visible red toward infrared. Which band do you enter as you scan across wavelengths?',
    levels: 'Compare two downward transitions. How does changing the energy-level gap change the emitted wavelength?',
    photons: 'Increase wavelength while keeping optical power fixed. At the same power, which wavelength gives the larger photon rate?',
    interactions: 'Switch from absorption to stimulated emission. What happens to the atom and the light in each interaction?',
    'he-ne': 'Set the output to 2 mW at 632.8 nm. What do wavelength and optical power tell you about a He–Ne laser?',
    temporal: 'Broaden the spectrum at fixed central wavelength. How does a wider spectrum affect temporal coherence?',
    spatial: 'Compare a stable phase relation with a fluctuating one. What happens to the fringes when the relative phase fluctuates?',
    pulse: 'Shorten the pulse and read its estimated bandwidth. What happens to the estimated spectrum when the pulse gets shorter?',
    direction: 'Reduce the waist while keeping the wavelength fixed. How does changing the beam waist affect spreading?',
    monochromatic: 'Compare two linewidths at the same central wavelength. How does a narrow linewidth look on a spectrum?',
    intensity: 'Halve the beam diameter without changing the power. At fixed power, what happens to irradiance when you make the spot smaller?',
    medium: 'Switch between active media and compare their transitions. How does the active medium affect the light a laser can emit?',
    pumping: 'Raise the upper-level population past one half. When does the upper level become more populated than the lower one?',
    cavity: 'Increase the output mirror’s reflectivity. How does the output mirror affect the light retained in the cavity?'
  },
  'nuclear-basic-concepts': {
    overview: 'Find Z and N in the nuclear notation. Which quantities describe a nucleus, and how are they related?',
    nuclides: 'Add a neutron while holding the proton count fixed. Which number determines the element when you change the counts?',
    relations: 'Make two nuclei with the same Z and different N. What must two nuclei share to be isotopes, isotones, or isobars?',
    isomers: 'Increase the excitation energy of the same nucleus. What changes between nuclear isomers if proton and neutron counts stay fixed?',
    mass: 'Double the mass entered in atomic mass units. How do the mass and rest energy readouts change together?',
    binding: 'Open the helium comparison and switch its reference mass. What does the difference between the separated and bound masses represent?',
    beta: 'Follow a single neutron through beta-minus decay. Which counts change during beta-minus decay?',
    scattering: 'Increase projectile energy at fixed charges. What happens to the turning point when the incoming energy increases?',
    radius: 'Compare mass numbers 27 and 216 with the same radius coefficient. How can nuclei grow larger while their average density stays similar?',
    charge: 'Remove one atomic electron and keep the proton count fixed. How do nuclear charge and net atomic charge differ?',
    fermi: 'Widen the surface at a fixed half-density radius. Which part of the density profile broadens when diffuseness increases?',
    particles: 'Locate the muon, pion and proton in the classification. Which particles belong to the same family, and why?',
    recoil: 'Compare the fixed-target and recoil cases. How does allowing the target to recoil affect closest approach?',
    surface: 'Compare a small and a large nucleus at fixed surface width. What does the surface layer contribute to the nucleon count?'
  },
  'emt-vector-analysis': {
    overview: 'Trace the chapter from a single vector to a field integral. How do vector operations lead from components to field integrals?',
    vectors: 'Reverse the sign of one Cartesian component. How does changing one component change the arrow and its length?',
    addition: 'Follow the head-to-tail construction. Where does the sum end if you place the two arrows head to tail?',
    dot: 'Compare vectors that point together and then apart. When does the signed projection change sign?',
    cross: 'Compare the result with each input direction. How is the result oriented relative to the two input vectors?',
    components: 'Trace each component step from the tip of the last. Where do the three component steps end?',
    direction: 'Move the origin. Which position vectors change, and what happens to the displacement?',
    cube: 'Switch from the face diagonals to the body diagonals. How does the angle depend on which diagonals you compare?',
    position: 'Compare the position vector with its normalized direction. What happens to the unit direction if a point moves along the same ray?',
    elements: 'Change one edge and compare all three face areas. How do the orientation and area differ among the three faces?',
    gradient: 'Rotate the direction of the test step. Which direction gives the greatest local increase?',
    divergence: 'Change the expansion coefficient and inspect the outward flow. Which changes make more field flow out locally than in?',
    curl: 'Reverse the sign of the rotation coefficient. What happens to curl when you reverse the sense of rotation?',
    identities: 'Evaluate all three expressions at the same point. Do the three second-derivative operations give the same result?',
    'gradient-theorem': 'Drag Bend, then drag End. Which move changes the integral?',
    gauss: 'Change the enclosing size and compare both integrals. How do total outward flux and the volume integral compare?',
    stokes: 'Reverse the orientation of the boundary. What happens to both results when you reverse the orientation?',
    coordinates: 'Move a point across the y-axis. How does the azimuth change as the point crosses an axis?',
    spherical: 'Vary azimuth while holding the polar angle fixed. How does the local basis turn as you change the angles?',
    'spherical-elements': 'Double the radius and keep the angular increments fixed. How does the same angular step change length as you move outward?',
    cylindrical: 'Change the height while keeping the radius fixed. Which distance is measured from the axis?',
    'cylindrical-elements': 'Double the radius with a fixed angular step. What happens to the azimuthal edge when the radius doubles?',
    classification: 'Combine expansion and rotation in the same field. Can a field spread and circulate at the same point?',
    summary: 'Choose an operation for finding flow through a surface. Which operation would you use for projection, flux, or circulation?'
  },
  laboratory: {
    statistics: 'Take repeated simulated counts at the same settings. How much do repeated counts vary with the same settings?',
    voltage: 'Change the gain and follow a pulse past the threshold. What does changing the gain do to pulses near the threshold?',
    calibration: 'Compare the two peaks as resolution changes. What makes two nearby peaks harder to distinguish?',
    electronics: 'Move the window past one pulse height. Which pulses pass through the selected amplitude window?',
    'dead-time': 'Step through arrivals and watch the detector’s recovery interval. When does a second event reach the detector too soon to count?',
    efficiency: 'Move the simulated source farther from the detector. How does distance change the fraction of emissions that reach the detector?',
    resistance: 'Warm the sample and watch the resistance. Which way does it change?',
    lif: 'Move the simulated angle through a diffraction peak. Where does a peak appear as the crystal and detector turn?',
    moseley: 'Compare two target elements. How does the characteristic X-ray frequency change with atomic number?',
    powder: 'Select a different family of planes. How do the selected planes change the diffraction angle?',
    electron: 'Raise the voltage. What happens to the wavelength and both ring radii?',
    thermoelectric: 'Hold the load fixed and increase the temperature difference. How do temperature difference and load affect the power delivered?'
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

function installLectureTools(stage, intro, context) {
  const scroll = stage.closest('.lab-scroll, .companion');
  const model = stage.closest('#explore-view, #model-area, #model');
  const tools = disclosure('Study tools', 'lecture-tools');
  model.after(tools);
  const practice = disclosure('Practice and notes', 'lecture-practice');
  practice.name = 'lecture-study-tool';
  const mode = document.querySelector('#learning-mode');
  const picker = mode?.closest('.learning-nav, .mode');
  const reviewCount = document.querySelector('#review-count');
  const tabs = document.querySelector('.lab-tabs');
  practice.append(...[picker, picker?.contains(reviewCount) ? null : reviewCount, tabs, ...document.querySelectorAll('#learning-activity, #activity, #notes-view, #question-view, #ideas-view, #practice-view')].filter(Boolean));
  const back = () => {
    if (mode && mode.value !== 'explore') {
      mode.value = 'explore';
      mode.dispatchEvent(new Event('change', {bubbles: true}));
    } else if (tabs && tabs.querySelector('[aria-selected=true]')?.id !== 'tab-explore') {
      tabs.querySelector('#tab-explore').click();
    }
  };
  tools.addEventListener('toggle', () => { if (!tools.open) back(); });
  practice.addEventListener('toggle', () => { if (!practice.open && tools.open) back(); });
  mode?.addEventListener('change', () => {
    if (tools.open && practice.open) requestAnimationFrame(() => {
      practice.querySelector('summary').scrollIntoView({block: 'nearest'});
    });
  });
  const heading = intro.parentElement;
  context.append(...heading.querySelectorAll(':scope > .reader-chapter-context, :scope > .section-context, :scope > .lecture-lecturer, :scope > .credit'));
  heading.querySelector(':scope > #section-label').hidden = true;
  tools.append(practice);
  let notes = scroll.querySelector('#diagram-details');
  const notesContent = scroll.querySelector('#model-notes');
  if (!notes && notesContent) {
    notes = disclosure('Diagram notes', 'study-context');
    notes.append(notesContent);
  }
  const sources = scroll.querySelector('.sources-panel');
  for (const item of [context, model.querySelector('.study-equation'), notes, sources]) {
    if (item) {
      item.name = 'lecture-study-tool';
      tools.append(item);
    }
  }
  const playback = model.querySelector('.study-motion-actions');
  if (playback) {
    const extras = disclosure('Playback options', 'lecture-playback-options');
    const actions = document.createElement('div');
    actions.append(...playback.querySelectorAll('[data-motion=step], [data-motion=reset], label'));
    extras.append(actions);
    playback.append(extras);
  }
  scroll.classList.add('simple-lecture');
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

  if (!nuclearLab) {
    if (stage.parentElement === controls.parentElement) {
      controls.before(stage);
      const playback = stage.parentElement.querySelector(':scope > .study-motion, :scope > #motion-controls');
      if (playback) controls.after(playback);
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
  if (!lab) {
    installLectureTools(stage, compactIntro, context);
    document.dispatchEvent(new Event('study-focus-ready'));
  }
  document.documentElement.classList.add('study-focus');
  return true;
}

if (!installStudyFocus()) {
  const ready = new MutationObserver(() => { if (installStudyFocus()) ready.disconnect(); });
  ready.observe(document.body, {childList: true, subtree: true});
}
