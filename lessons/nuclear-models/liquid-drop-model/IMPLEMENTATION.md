# Liquid Drop Model implementation and verification

The reader is under **Nuclear Models → 02. Liquid Drop Model**. It contains four modules, 13 views, 23 explanation steps, 16 presets and 21 anchors into the lecture preview.

## Starting capability audit

| Capability | Before | Implementation |
|---|---|---|
| Chapter 2 route | Missing. Nuclear Models contained Basic Concepts only. | Registered a new chapter with its own reading position and generated the standard web reader assets from a byte-for-byte copy of the supplied PDF. |
| Mass calculations | Chapter 1 had selected mass samples and binding helpers. Separation chains, the chapter five-term model and isobar polynomials were missing. | Added chapter-scoped binding, removal, SEMF and Q-value functions using one atomic-mass convention. |
| Evaluated data | Chapter 1's smaller sample did not cover the new charts or most selectable nuclei. | Imported AME2020 and linked NUBASE2020 ground-state labels. Kept uncertainty and extrapolation flags. |
| Four visual modules | Missing. The lecture source needed corrections to specific formulas and examples. | Added original SVG diagrams, plots, selected-state readouts, MathML derivations and scientific notes. |
| Navigation, PDF scrolling, fullscreen, theme | Existing. The baseline passed 111 tests. | Reused the existing controls, with chapter-specific presets and explanations. |
| Annotated summary | Unverified. The supplied Chapter 2.pdf has 18 pages and no PDF annotation objects. | Implemented the worked values supplied in the brief. Pages 19–20 and annotations in any separate edition remain unverified. |

## Coverage

| PDF pages | Reader treatment |
|---|---|
| 1 | **Binding** · Neutral-atom energy ledger, B/A and an expandable electronic correction. |
| 2–3 | **Binding** · N-15/O-15 mirror ledger, rounded worked values and evaluated binding scatter. The disclosure includes a balanced helium capture example. |
| 3–5 | **Separation** · Removable token, A and Z bookkeeping, mass and binding derivations, signed threshold and neighboring-nuclide chart. |
| 4 | **Binding** · Qualitative heavy-nucleus context and a dedicated source preset. |
| 5–6 | **Liquid drop** · N–Z chart, parity filters, neutron excess and historical versus evaluated counts. |
| 7–8 | **Liquid drop** · Radius, uniform density, five-term waterfall and short-range saturation. |
| 9–10 | **Liquid drop** · Boundary links, the surface contribution per nucleon, concentric shell assembly and the distinct-pair Coulomb term. |
| 10–12 | **Liquid drop** · Occupation ladders, schematic wells, A = 38 and pairing categories. |
| 12–13 | **Separation / Liquid drop** · Local odd-A pairing estimator and residual chart with canonical shell-number guides. |
| 14 | **Liquid drop / Mass parabolas** · Schematic potentials, model limits and fixed-A masses. |
| 15–16 | **Mass parabolas** · Expanded polynomial, one common relative-energy baseline, continuous vertex and discrete minima. |
| 17 | **Mass parabolas** · Adjacent Q values, positron threshold and the full and approximate Si-33 calculation. |
| 18 | **Mass parabolas** · A = 135 and A = 102 presets, parity branches and Pd-102 to Ru-102. |
| 19–20 | Source unavailable. Worked presets link back to the matching available pages. The default coefficients supplied by the brief are identified as a lecture fit. |

## Data provenance

- The version 1 JSON contains 3,558 AME2020 masses, including 1,008 extrapolations. The importer reads the mass and uncertainty fields from the original fixed-width table and converts micro-u to u. It keeps the source digits within the precision of a JavaScript number. [AME2020 Part I](https://doi.org/10.1088/1674-1137/abddb0), [AME2020 Part II](https://doi.org/10.1088/1674-1137/abddaf), [AMDC data](https://amdc.impcas.ac.cn/web/masseval.html)
- The NUBASE2020 totals use index 0 and the half-life field marked stbl. The four parity counts are 147, 54, 48 and 4 for even–even, even Z/odd N, odd Z/even N and odd–odd. This edition's classification includes some records with decay limits, such as Pd-102. [NUBASE2020 paper](https://amdc.impcas.ac.cn/masstables/Ame2020/Kondev_2021_Chinese_Phys._C_45_030001.pdf), [AMDC data](https://amdc.impcas.ac.cn/web/nubase_en.html)
- The hydrogen and neutron masses follow AME2020. The mass conversion is 931.49410372 MeV/u and the electron rest energy is 0.51099895069 MeV. The displayed uncertainty concerns the selected atomic mass. Covariance-based uncertainties for mass differences are outside this lesson. [CODATA 2022](https://physics.nist.gov/cuu/pdf/RevModPhys.97.025002.pdf)
- The original PDF and local working copy both hash to 31e89ce3bc0251fa77cde0e779a9441f1eadcec2f136295030092ca33ed42b43. This chapter commits the prepared page previews and keeps the PDF local. The existing Pages workflow packages the previews.

| Source file | SHA-256 |
|---|---|
| [mass_1.mas20](https://amdc.impcas.ac.cn/masstables/Ame2020/mass_1.mas20) | e8599c6d7f724fac91934e59f1b9de8fb8f63e820f4b39456b790665ed2a3307 |
| [nubase_4.mas20](https://amdc.impcas.ac.cn/masstables/Ame2020/nubase_4.mas20) | 1585a5eea86c5e17e90307c7e6e786d060049c4039e392a261ff6db977df9859 |

The import used the official AMDC mirror after the requested portal returned an error. Regenerate from the repository root with:

    python tools/import-liquid-drop-data.py mass_1.mas20 nubase_4.mas20 lessons/nuclear-models/liquid-drop-model/assets/ame2020-nubase2020.json

## Scientific corrections

| Source topic | Interactive reader |
|---|---|
| Atomic versus bare masses, pp. 1–2 and 5 | The N/O worked preset uses neutral masses. The bare formula and electronic correction appear in the disclosure. |
| Average binding, pp. 2–4 | B/A is an average. A specific removal threshold uses a daughter and an outgoing particle. |
| Neutron excess, p. 6 | Fewer protons at fixed A lower the Coulomb cost. Greater imbalance increases the asymmetry penalty. Neutrons provide no electric shielding. |
| Coulomb term, pp. 9–10 | The sphere result scales as Z²/R. The fitted term uses Z(Z−1) for distinct pairs. |
| A = 38, p. 11 | Z = 17 is chlorine, and (N−Z)² is 16. The signed term is −9.895 MeV for 23.5 MeV or −9.516 MeV for 22.6 MeV. It vanishes at Z = 19. |
| Shell effects, pp. 13–14 | Residuals subtract the full five-term baseline from non-extrapolated binding data. |
| Positron threshold, p. 17 | Positron emission subtracts 2mₑc² from the neutral-atom electron-capture Q value. |
| Si-33, p. 17 | Full SEMF gives 5.891 MeV. Omitting the mass-difference and linear Coulomb pieces from C₁ gives 4.884 MeV. |
| A = 102, p. 18 | AME2020 gives −1.120 MeV for single EC from Pd-102 to Rh-102 and +1.203 MeV for two-unit EC from Pd-102 to Ru-102. Those numbers establish ground-state energetics only. |

## Reference techniques

Three frames from each of the six available local videos were reviewed. AVisualize Physics informed equation-to-scene alignment. CurvaTure73 informed single-concept reveals. RGChemistry informed synchronized representations. Fadhel Mahdi informed diagrams for hidden mechanisms. Planckscape informed comparisons with shared scales. Thachdv.it informed the successive states in the shell-assembly view. The diagrams use original artwork.

## Verification

- `npm test` passed 118 tests, including seven new chapter tests. The science tests cover AME/NUBASE rows, signed thresholds, constants and electronic bookkeeping, model boundaries, pairing and the expanded polynomial over every supported integer pair.
- `node --test tools/reading-pages.test.mjs` passed. It checks every lecture and manual preview for completeness.
- Local Chromium checks covered library and chapter switching, all 23 explanation steps, 16 presets and 21 anchors, PDF scrolling, autoplay and manual interruption, mouse dragging, keyboard point selection, fullscreen, touch and reduced motion. The desktop viewport was 1440 pixels and the mobile widths were 320, 390 and 742 pixels. The project has no separate build, lint or type-check command. JavaScript syntax and static reader assets were checked.
- A second browser pass loaded all 18 PDF images, tested recovery from a malformed link, checked the direction of both signed energy gaps and verified that a failed AME2020/NUBASE2020 fetch leaves the SEMF usable.
- Remaining source limitation is the missing annotated edition. Browser validation used Chromium with mobile emulation. Safari and physical mobile devices were outside this run.

## Diagram motion and direct controls

- The binding ledger opens its energy gap. The separation diagram moves the outgoing particle and reveals the daughter threshold. The drop view grows its radius and signed bars, assembles charge shells and updates occupation markers. The isobar view traces the curve and moves the selected-nucleus marker and transition ruler.
- Playback is visible above the diagram. It controls the rate of explanatory steps and visual reveals. The animation between selections represents a teaching transition. Calculations use the chosen integer composition throughout.
- Plots support dragging, point selection and arrow keys. The isobar plot also has a proton-number slider. Reduced-motion mode keeps manual steps and updates the diagram immediately.
- Additional Chromium checks measured intermediate and final SVG positions, tested freeze and resume, verified dragging and the mobile slider, and checked that the Q table still reports the same endpoint values. The full science and reader suites passed again.

Changes are in the chapter folder, catalog, data importer and test suite.
