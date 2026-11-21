# Basic Concepts in Nuclear Physics

See the [chapter coverage matrix](CHAPTER-AUDIT.md) and [scientific correction log](SCIENTIFIC-CORRECTIONS.md) for the second-pass review and current model limits.

Independent study companion to the nine-page Chapter One lecture supplied by the user,
credited on its scanned cover to **Dr. Adil M. Hussein M. Saeed, Assistant Professor in
Nuclear Physics**, University of Sulaimani, 2026–2027. The catalog retains the user's
full lecturer spelling: Assistant Professor Dr. Adil M. Hussein M. Saeed.

All original pages are preserved, including the scanned cover that has no extracted
text. The text layer contains OCR errors, so key figures/formulas and the final problem
were also checked against rendered page images. Original PDF SHA-256:
`9e9cecfdb838654a2483c8dd8d7f26b1c5c9a965a0055924bb104ed1b01db1b1`.

## Coverage

| PDF pages | Companion sections |
| --- | --- |
| 1 | Cover and chapter introduction |
| 2 | Nuclide notation; isotopes/isotones/isobars; nuclear isomers |
| 3–4 | Atomic mass unit, nuclear versus atomic masses, unit conversion |
| 4–5 | Helium binding and four comparison nuclides, mass defect versus mass excess, stability qualifications |
| 5 | Free-neutron decay and beta-minus count conservation |
| 6 | Head-on Coulomb closest approach; alpha/U 25 MeV example |
| 7 | Radius scaling, number/mass density, nuclear charge and atomic neutrality |
| 8 | Diffuse Fermi density; particle classifications |
| 9 | Nucleon structure caveats; recoil Problems 1A–C; surface Problem 2 |

Fourteen sections, eleven numerical exercises, nine introductory guide steps, fourteen
conceptual questions also usable as predictions, authored notes, personal notes and
browser-local review of incorrect answers. These do not claim to answer every possible
exam question or replace the lecturer. The original isotope table and density plots
remain in the PDF; the companion does not claim to digitize them.

## Scientific clarifications

- A is an integer nucleon count, not a measured mass in u. The nucleus does not contain
  the atom's electrons. Arbitrary Z/N pairs are illustrative and not declared bound.
- Carbon has multiple isotopes; the reference is one twelfth of the mass of a neutral
  ground-state carbon-12 atom. A free nucleon is not exactly 1 u. The proton/electron
  mass ratio is approximately 1836. Unit values use modern reference precision, not
  the scanned table's historical rounding.
- Binding defect compares constituents with the bound system. Atomic mass excess is
  (M−Au)c². Their signs/references differ. The sign of mass excess alone does not
  decide stability, and many light nuclei are stable. Nuclear binding energy is not
  the same as resistance to every allowed decay channel.
- The binding model uses neutral atomic masses. Electron rest-mass terms cancel;
  the differing electronic binding energies are omitted. Helium-4 gives approximately
  28.30 MeV total and 7.074 MeV per nucleon. AME2020 Table I supplies the reference data.
- The PDG neutron table gives a mean life of 878.4 s. The corresponding half-life is
  τ ln2≈609 s (10.15 min). Page 5 gives about 13 min. The exponential expectation and
  the replayable sample of 48 lifetimes are for free neutrons. The separate bound-nuclide
  example checks proton and neutron bookkeeping. Its decay energetics require mass data.
- Closest approach uses positive charges, nonrelativistic classical Coulomb relative
  motion. For a target at rest, Ecm=Elab M/(m+M). A fixed-target approximation uses
  Ecm≈Elab. Approximate integer mass ratios match the final problems. Nuclear forces,
  screening, tunneling and finite charge distributions are outside this model. The
  relative-motion timeline is evaluated from the classical energy equation. It shows
  the target as the origin of the relative coordinate.
- The 25 MeV alpha/U fixed-target example yields 10.598 fm. Problem 1A with finite recoil
  yields 64.144 fm; 1B yields 17.9996 fm; 1C requires 0.8 MeV. Closest approach alone
  is not a direct measurement of nuclear radius.
- Radius is an equivalent sharp-sphere convention R=r₀A^(1/3). Charge RMS radius,
  half-density radius and reaction/interaction radius are not interchangeable.
  R(A=208,r₀=1.2 fm)≈7.11 fm; a blanket 10 fm radius does not follow. The sharp model
  gives n=3/(4πr₀³), independent of A. One fm⁻³ is 10³⁹ cm⁻³. Mass density uses an
  approximate nucleon mass of one u.
- Qnucleus=+Ze; Qatom=(Z−Ne)e. Experimental neutrality limits do not establish the
  definite nonzero neutron charge or proton/electron charge mismatch quoted in the
  lecture. Zero net neutron charge is compatible with internal structure.
- Two-parameter Fermi profile is a mathematical nucleon-density illustration, not a
  fit to the lecture's charge-density plots. R is the half-density radius; the 90–10%
  thickness is 4a ln3. The default mode lets A set the radius and shows the
  integrated count. Optional normalization rescales the profile to integrate to A.
  ρ₀ is a profile parameter and can differ from ρ(0).
- Muons are leptons, not mesons. Pions are mesons; proton/neutron are baryons.
  The historical core/vector/scalar-cloud sketch is not reproduced as an exact
  modern nucleon-density model. Mass-comparison bars are not physical particle sizes.
- Surface Problem 2 is distinct from the Fermi profile. Interpreting the drawing's c
  at half density and a as the FULL linear declining width, core ends at c−a/2 and
  surface ends at c+a/2. Spherical integration gives surface fraction
  `1−(c−a/2)^3/(c^3+c a^2/4)`, with c=1.1A^(1/3) and a=3 fm for Al-27, Te-125, Po-216.
  This interpretation is explicit because notation differs between the two models.
  Density ρ₀ cancels from the fraction; the fixed source parameters need not integrate
  to precisely A. A triangle area in a radial plot is not the number in a shell.

Primary references include [AME2020 Table I](https://amdc.impcas.ac.cn/web/masseval.html)
(M. Wang et al., *Chinese Physics C* **45**, 030003, 2021),
[CODATA 2022](https://physics.nist.gov/cuu/pdf/RevModPhys.97.025002.pdf),
the [PDG neutron table](https://pdg.lbl.gov/2025/AtomicNuclearProperties/neutron.html),
and [NNDC beta-decay bookkeeping](https://www.nndc.bnl.gov/nudat3/help/betadecay.jsp).
The reader's companion explanations are independently authored.

## Interface and implementation

HTML/CSS/JavaScript, Canvas and scrollable lecture previews. Playback starts paused,
advances from animation timestamps, and suspends when hidden or mostly outside the
visible panel. The physical timelines have explicit seeking and 0.25×–4× speed.
Walkthroughs use three discrete explanatory steps. The drawing maintains its aspect
ratio and can be enlarged. Canvas diagrams have text captions and separate numerical
readouts. Keyboard and touch use native form controls.

Subject → Chapter → Section navigation uses the existing catalog. Notes and progress
use `study:nuclear-models:basic-concepts:page` and
`study:nuclear-models:basic-concepts:learning`; no old keys are reused. Personal notes
are plain textarea text. Predictions hide the model until an answer and deliberate
reveal; correct retries remove items from the weak-point review.

## Pilot audit

Scope: all nine source pages and 14 companion components. The original had one
analytical survival curve, a shared Coulomb calculation shown in two sections, and
11 other diagrams or static calculations. Five topics had looping visual motion.
The pilot has physical-time models in three sections using two distinct models,
two explanatory walkthroughs, and nine other static or user-controlled views.

| Page | Existing component | Classification | Audit finding and change |
| --- | --- | --- | --- |
| 1 | Chapter introduction | Static scientific illustration | Retained count illustration and separated its spatial sketch from the numbers it represents. |
| 2 | Nuclide notation | Interactive diagram | Z/N inputs now synchronize the count glyphs, conventional stacked nuclide notation and the metric readouts. |
| 2 | Nuclide relationships | Interactive scientific graph | The local chart previously clipped valid second points. Axes now include both choices at every allowed input. Related points connect by row, column or diagonal. |
| 2 | Isomers | Analytical calculation and animated explanation | Replaced an oscillating energy marker with three steps that show the ground state, excited state and gap. Both states retain the same Z and N. |
| 3–4 | Mass units | Interactive analytical conversion | Visually separates the same mass in u and kg from its rest energy in MeV and J. |
| 4–5 | Mass defect and binding | Interactive analytical comparison and animated explanation | Replaced fixed helium-only levels with selectable AME2020 examples, a staged mass comparison and a common-scale B/A chart. Notes distinguish binding from mass excess and decay stability. |
| 5 | Neutron decay and beta bookkeeping | Analytical and stochastic simulation | Replaced the independent decorative marker with one clock for the survival curve, 48 synthetic lifetimes and the readouts. Bound-parent arithmetic is separate. |
| 6 | Closest approach | Analytical and numerical time simulation | Preserved the fixed-target example and added timed relative motion. The moving separation and the energy markers use the same state. |
| 7 | Radius and density | Interactive scientific visualization | Added a fixed-scale A=27 comparator and retained the cancellation of A in sharp-sphere number density. |
| 7 | Charge | Interactive diagram and calculation | Separates nuclear charge, the electron contribution and the resulting atom/ion charge. |
| 8 | Fermi profile | Interactive scientific graph | Replaced automatic motion with a radial probe. Kept a fixed plot range and highlighted the full 90–10% density interval. |
| 8–9 | Particle classification | Static scientific graph | Shows particle class and linear rest-energy values. A tick locates the electron bar at this scale. |
| 9 | Finite recoil | Analytical and numerical time simulation | Uses the shared relative-motion solver with reduced mass. Existing worked cases and adjustable inputs are preserved. |
| 9 | Surface nucleons | Analytical model and scientific graph | Uses a fixed comparison scale, marks the declining shell and retains the analytical spherical-shell integral. |

The previous canvas reallocated its backing buffer per frame and ran a loop in static
sections. The pilot reallocates only on density changes, paints on input or active
playback, and keeps control nodes in place. Values and equations are selectable text
or MathML alongside the Canvas diagrams. Existing layouts and study tools remain in
the same reader. Cross-device assistive-technology and learner testing are still open.

## Reference videos and design decisions

Reviewed ten frames sampled across each of the six local MP4s. The table records the
design techniques applied. The pilot uses original graphics and no reference assets.

| Video | Observed sequence and technique | Application and constraint |
| --- | --- | --- |
| 01 AVisualize Physics | Equations above one focused illustration. Coulomb arrows and other diagrams change with the principle shown. | Stack the nuclide’s A and Z, pair the binding gap with its numerical value, and render display equations as MathML. Avoid ornament that suggests a quantity is physically modeled. |
| 03 CurvaTure73 | A dark-room question develops through bounce-count examples, familiar scenes and a final comparison of where the energy goes. | Give binding and isomers a short staged reveal driven by a question. Keep analogies out of the quantitative state. |
| 04 RGChemistry | Downward spectral transitions share colors with the reconstructed spectral lines. | Synchronize kinetic and potential markers with separation. Use line style and marker shape alongside color. Avoid carrying visible colors into a context where color has no physical meaning. |
| 05 Fadhel Mahdi | Blender cutaway, current and push traces update together, making a hidden mechanism visible. | Show separation and the otherwise invisible change in relative energy together. Label the relative frame and the model’s point-charge approximation. |
| 06 Planckscape | The bulb and laser wave trains share the same frame with alternating emphasis and a schematic scale note. | Use a common scale and a stable selected highlight for binding-energy bars and radius comparisons. |
| 07 thachdv.it | Requests, server statuses and response traces change together through successive load-balancing scenarios. | Drive sample state, graph marker and numeric readouts from one seekable neutron clock. Keep the one explanation and omit a dashboard. |

PhET’s learner-directed exploration and Falstad’s immediate model feedback informed
the benchmark for compact controls and linked views. Classroom effectiveness was not
measured in this pilot. [PhET research](https://phet.colorado.edu/en/research) ·
[Falstad applets](https://www.falstad.com/mathphysics.html).

## Validation

`npm test` covers the scientific and site regressions. The nuclear tests compare all
five binding calculations with AME2020 tabulations, differentiate relative position
against the modeled velocity, check energy conservation and time symmetry, replay
the decay sample and verify the Fermi and linear-surface geometry. `node --test
tools/reading-pages.test.mjs` checks every reading asset across the site. Run the
Chromium browser regression with the local server running using
`node tools/nuclear-pilot-browser.mjs`. It uses Playwright and Chrome, with
optional `PLAYWRIGHT_MODULE`, `BROWSER_CHANNEL`, and `CHECK_BASE` overrides.

The pilot also passed the all-reader scrolling regression. A separate, older
simplified-layout check still expects the Materials Science subject picker to be
hidden. The same assertion fails on the published baseline because the picker is
visible there. The pilot does not change that layout.

The supplied PDF retains its original ownership and is excluded from the code's MIT
license. Redistribution requires the relevant permissions.
