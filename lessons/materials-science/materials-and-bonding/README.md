# Materials and Bonding

## Dynamic companion models

Nine model views now include automatic motion: alumina scattering paths, Na/Cl transfer, sp³/sp² view rotation, metallic electron motion, London dipoles, a small H₂ bond vibration, and relative molecular motion in the hydrogen-bond/molecular-material sketches. Play/Pause, Step, Restart and Speed supplement the existing controls. Dragging carbon models pauses rotation; true bond angles stay fixed. Reduced-motion settings start paused, with Play and Step available. Hidden/offscreen models do not advance.

The ionic sequence preserves 28 electrons, including one in transit during transfer. Each repetition starts a fresh pair. Transfer paths are symbolic, not quantum trajectories or a solved reaction mechanism; shell circles remain counting diagrams, never animated electron orbits. Transfer stage 1 still holds the original final ion state. Displayed counts follow the actual animation stage.

Small bond and molecular motions are prescribed qualitative oscillations, not temperature/force-law simulations. Internal covalent lengths stay fixed during relative molecular motion; H₂'s separate bond-vibration example changes its own bond length slightly. Metal motion adds a leftward drift for a rightward field and is not a band-transport calculation. The drawing has 15 positive ion cores and 15 representative monovalent electrons. London charge separation varies together in correlated dipoles, without claiming an absolute force scale. Ray markers trace qualitative scattering paths, not measured transmission.

Original PDF pages, all 22 sections, notes, five exercises, quizzes and saved-answer keys are preserved. Static calculators, orbital bookkeeping and other diagrams remain unchanged where motion adds no meaning.

Materials Science, Chapter 1. Lecturer: Professor Dr. Omed Gh. Abdullah.

The 16-page supplied `[Chap.1] Materals Science.pdf` is copied unchanged into `assets/lecture.pdf`. Its printed page numbers match PDF page numbers. PDF scripting is not run by this reader.

There are 22 companion sections. The reader covers the complete PDF, not just its bonding pages. Several sections share a PDF page; the section selector preserves the selected topic while its source page is read.

Page mapping: 1 overview; 2 alumina optics/metals; 3 ceramics/polymers; 4 composites; 5 property-chart interpretation; 6 semiconductors/biomaterials; 7 smart/nano/atomic structure; 8 forces and energy; 9 ionic bonding; 10 covalent bonding/sp³; 11 sp³/sp²; 12 sp²/metallic; 13 metallic/secondary; 14 van der Waals mechanisms; 15 hydrogen/mixed bonding; 16 molecules.

Learning modes: explore, click to explain, five numerical exercises, prediction before diagram reveal, a ten-step foundation path, saved incorrect answers, complete companion notes and one chapter question for each of the 22 sections. Weak-point review records actual attempts, not mastery. Reading position and answers use separate Materials Science keys and do not overwrite Crystal Structures progress.

The white interface uses responsive Canvas diagrams and original PDF.js pages. The carbon direction model supports drag rotation, zoom, keyboard-accessible bond selections and true 3D angles. Atomic-orbital views show ground-state bookkeeping, the promoted bonding model and sp³/sp² hybrid orbitals. These are qualitative bonding models, not time-resolved electron transitions or quantum probability-density calculations.

Numerical models:

- Pair energy: U = D[(r₀/r)^12 − 2(r₀/r)^6], with r₀ = 1 in model units. Its minimum is −D; Fᵣ = −dU/dr; curvature at the minimum is 72D/r₀². This potential is an explicitly added example, not a fit for every material in the lecture. The original force graph uses positive attraction; the companion uses positive radial repulsion.
- Nanocubes: total solid volume is held fixed while separated cubes expose more surface. S/V = 6/L. Contact, agglomeration and finite atomic-size corrections are not modeled.
- Composite stiffness: editable illustrative constituent moduli with ideal equal-strain and equal-stress mixture comparisons. This is a labeled extension beyond the supplied introduction, not a material-specific prediction or an exact transverse fiber-composite law.
- Hybrid geometry: tetrahedral dot product −1/3 gives 109.4712…°; planar directions give 120°. All displayed angles are computed before screen projection.

Qualitative models: transparency/scattering; material classification; chain cross-linking; carriers in Si; smart responses; shell populations and electron transfer; metallic drift; dipole mechanisms; HF hydrogen bonds; polarization; intra/intermolecular connections. Property comparison refers back to the original PDF charts and does not fabricate exact data ranges for entire material classes.

Companion clarifications: some ceramics contain no metallic element (e.g. SiC); not every ceramic is electrically or thermally insulating; no universal strength ranking puts induced-dipole interactions above all dispersion interactions. Strength, modulus and density are distinct quantities. Hydrogen bonds may also occur within molecules, although the HF sketch shows an intermolecular example. References are linked in the reader and listed in `content.js`.

Run the project through its root local server; open `/lessons/materials-science/materials-and-bonding/`. The existing GitHub workflow includes all files in `lessons/` automatically. The source PDF retains its original ownership.
