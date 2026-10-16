# Basic Concepts in Nuclear Physics

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
| 4–5 | Helium binding, mass defect versus mass excess, stability qualifications |
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
- Helium calculation uses atomic hydrogen and helium masses so electron rest masses
  cancel approximately. Electronic binding corrections are neglected at this scale;
  the result is approximately 28.30 MeV, not an exact nuclear-mass conversion.
- The PDG 2025 free-neutron mean life 878.4 s is used as a dated reference, not claimed
  as a newly measured value. Half-life is τ ln2≈609 s, not three minutes. The survival
  curve is for free neutrons; arbitrary bound-nucleus beta examples conserve counts
  but are not asserted energetically allowed. A missing antineutrino is not omitted.
- Closest approach uses positive charges, nonrelativistic classical Coulomb relative
  motion. For a target at rest, Ecm=Elab M/(m+M). A fixed-target approximation uses
  Ecm≈Elab. Approximate integer mass ratios match the final problems. Nuclear forces,
  screening, tunneling and finite charge distributions are not solved. The animated
  marker is a schematic guide, not a time-integrated trajectory or a bombarding setup.
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
  thickness is 4a ln3. Shape controls are not renormalized to integrate to A; A sets
  the radius scale only. ρ₀ is a profile parameter, not necessarily exactly ρ(0).
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

Primary references are linked in `content.js` and the reader: NIST mass-energy units,
PDG free-neutron properties/muon classification and NNDC beta decay. The companion's
own explanations are separated from the unchanged source, not attributed to the lecturer.

## Interface and implementation

HTML/CSS/JavaScript, Canvas and locally served PDF.js; shared `StudyMotion` respects
reduced-motion preferences. Circle geometry retains aspect ratio on mobile; diagrams
can be enlarged inside their panel. Nuclear uses the shared laboratory layout styles
for its single-page PDF preview, but has independent lecture content, navigation and
learning state. It remains a lecture under Nuclear Models, not an experimental manual.

Subject → Chapter → Section navigation uses the existing catalog. Notes and progress
use `study:nuclear-models:basic-concepts:page` and
`study:nuclear-models:basic-concepts:learning`; no old keys are reused. Personal notes
are plain textarea text. Predictions hide the model until an answer and deliberate
reveal; correct retries remove items from the weak-point review.

Scientific tests check coverage, conversions, binding sign/reference differences,
recoil, density units, lifetime/half-life, Fermi thickness, and independent numerical
quadrature for the surface fraction. Browser QA covers all pages, sections, exercises,
mobile widths, storage, review, guides, playback and cross-reader navigation.

The supplied PDF retains its original ownership and is excluded from the code's MIT
license. Redistribution requires the relevant permissions.
