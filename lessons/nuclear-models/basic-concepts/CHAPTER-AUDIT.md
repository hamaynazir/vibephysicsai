# Chapter One coverage and verification

The nine-page lecture PDF and its original figures were inspected. The local reader returned HTTP 200 before the upgrade. The six supplied MP4s were reviewed through their time-sequenced frame sheets.

| PDF page and concept | Baseline | Implementation target |
| --- | --- | --- |
| 1, cover | Already correct | Preserve original cover and route |
| 2, nuclide notation and charge | Needs improvement | Extend element coverage and link charge to Z |
| 2, relationship examples and chart | Missing lecture presets and evaluated status | Add lecture comparisons and distinguish selected evaluated data from other coordinates |
| 2, technetium isomers | Generic schematic | Add evaluated Tc-99m reference and transition |
| 3–4, u and rest energy | Correct calculator, derivation missing | Add guided carbon standard and reference masses |
| 4, atomic mass versus A | Missing comparison | Show measured examples and magnified difference |
| 4–5, excitation and beta | Correct baseline calculations, event explanation missing | Add decay conservation and Th-234 example |
| 5, binding and excess | Correct baseline, limited comparison | Add heavy nucleus, separate references and alpha-nucleus accounting |
| 6, Rutherford scattering | Head-on only | Add apparatus, nonzero impact parameter, analytical path and energy readouts |
| 6–7, radii and density | Correct scaling | Add volume comparison, explanatory stages and common scale |
| 7–8, charge | Correct sum, distribution missing | Show schematic radial charge view and preserve ion arithmetic |
| 8, Fermi–Saxon | Correct curve and walkthrough, missing shell weighting | Add cross-section, profile comparison and optional normalization and radial counts |
| 8–9, nucleon structure | Particle mass chart only | Add scale and valence-charge schematics |
| 9, recoil Problems 1A–C | Correct numbers, manual sliders | Add presets and moving target |
| 9, surface Problem 2 | Correct integral, lacks process explanation | Add presets and staged shell weighting |

## Delivered coverage

| PDF | Topic | Visual and interaction | Playback and model | Evidence and limits |
| --- | --- | --- | --- | --- |
| 1 | Cover and chapter entry | Schematic nucleus, count and charge | Static overview | Original page and route verified |
| 2 §1.1 | Notation and composition | Synchronized Z, N, A, element and charge. Add one neutron or proton in an optional demonstration | Three explanation stages, integer arithmetic | Counts and charge checked. Dots represent composition only |
| 2 §1.1 | Isotopes, isotones, isobars and chart | Cu-63/Cu-65, Mg-26/Al-27/Si-28, Si-31/P-31/S-31 presets plus adjustable coordinates. Active row, column or diagonal | Three explanation stages, coordinate and status lookup | Chart is local. Eight entries carry NUBASE2020 status. Other coordinates are unclassified in this view |
| 2 §1.1 and 4 | Excitation and isomers | Tc-99m preset, downward transition, lifetime and mass increment. Adjustable generic gap | Three explanation stages, E*/c² | Tc-99m evaluated at 142.6836 keV and 6.0066 h. Branching and recoil photon energy are outside the schematic |
| 3–4 §1.2a | Carbon standard, particle masses and rest energy | Five-step derivation, units selector, logarithmic particle scale and mass-energy calculator | Explanation time for derivation. Other views update on input | Carbon definition, measured u and CODATA electron conversion checked. The post-2019 molar mass of carbon-12 is approximately 12 g/mol |
| 4 §1.2a | Atomic mass versus A | Five measured atomic examples and magnified M − A u | Static input-driven comparison | AME2020 atom masses. The readout identifies the convention |
| 4–5 | Free and nuclear beta decay | Sample count and expected survival. Separate free event and Th-234 example with daughter notation | Physical population time and separate explanation stages | Seeded replay tested. The event shows conservation without predicting momentum or beta spectra. Pa-234* represents populated excited levels |
| 5 | Binding, defect, excess and B/A | Six evaluated nuclei on common axes. Bare-alpha energy accounting and separate mass-reference view | Three explanation stages and static comparisons | AME2020 and CODATA checks. Electronic binding correction stated. No reaction trajectory or stability classifier |
| 6 | Rutherford apparatus and trajectories | Gold foil and movable detector. Impact parameter, energy and charge controls, path and velocity, live energy budget | Apparatus stages and physical Coulomb time | Independent head-on and off-axis tests. Illustrative flashes, single idealized encounter, no absolute count rate |
| 6–7 | Radius, volume, density | Same-scale spheres. 8× volume gives 2× radius. Live V and density and separate logarithmic scale | Three explanation stages, equivalent sharp sphere | Constant average density at fixed r₀ tested. Radius parameter depends on probe and definition |
| 7–8 §1.2c | Nuclear charge and atom/ion charge | Signed sum plus radial probe linking cross-section to illustrative charge curve | Static interactive calculation and relative profile | Charge arithmetic checked. Profile uses illustrative A≈2Z radius scaling and relative, rather than absolute, charge density |
| 8 | Fermi–Saxon and radial counts | Modelled slice, radial probe, 90% and 10% points, selectable comparison and normalization | Existing autoplay walkthrough plus direct inputs | Half-density and shell-weighted integral verified. Selected nuclei set model sizes. The printed He-4 charge profile remains in the PDF because a simple Fermi model is particularly limited there |
| 8–9 | Nucleon structure, pions, muons, physical scales | Schematics of uud and udd, log-scale landmarks, rest energies and interaction roles | Static selectable contrasts | Quark sums tested. Includes sea quarks and gluons as context. No measured charge-density reconstruction |
| 9 Problem 1A–C | Recoil | Three exact-input presets, moving target and projectile, selector for lab and center-of-mass frames | Physical point-charge model and seekable time | 64.144 fm, 18.000 fm and 0.8 MeV at mass-number precision. Weak interactions, screening, finite size and relativistic corrections are outside this model |
| 9 Problem 2 | Surface fraction | Al-27, Te-125 and Po-216 presets. Separate core, surface and weighted shell stages | Three explanation stages, analytic spherical-shell integral | Piecewise integral checked by independent numerical quadrature. Fixed density and width need not integrate to A |

## Validation and visual references

- Verified all nine original PDF pages and eleven exercises. Original PDF SHA-256 is preserved.
- Chromium regression covers all fourteen sections, lecture navigation and deep links, study tools, keyboard, touch, fullscreen, reduced motion and density autoplay. It exercises copper, carbon-12, Rutherford impact parameter, recoil presets and shell playback.
- Local Chromium sample of 120 probe changes measured 1.0 ms p95 for synchronous input/render work and a 16.9 ms p95 frame interval. This is one desktop measurement.
- AVisualize Physics informed the variable-to-diagram links. CurvaTure73 informed staged reveals. RGChemistry informed linked labels and readouts. Fadhel Mahdi informed the radial cutaway. Planckscape informed comparisons on shared scales. thachdv.it informed the apparatus sequence and synchronized output.
- Remaining limits include no digitized experimental charge-density curves, no full nuclide atlas, no detector-rate or beta spectrum model, and no screen-reader or classroom study. The local screenshots cover desktop scattering and the mobile density view. The baseline screenshot is from the previous pilot, so it establishes the old head-on layout rather than a pixel-controlled comparison.
