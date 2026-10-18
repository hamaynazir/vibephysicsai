# Laboratory experiment companions

Two independent manual readers share a white responsive interface, PDF.js viewer,
Canvas teaching diagrams, playback controls, procedure steps, calculation practice,
one conceptual question per experiment and browser-local notes/answers. All original
manual pages remain accessible. These are study companions, not validated digital
twins or replacements for supervised experimental work.

## Coverage and provenance

Page numbers below are **PDF page numbers**, including covers and contents, not the
manual's printed labels. The source files were read/extracted across the full manuals;
ambiguous LiF geometry, graphite geometry and the calibration sign were also checked
against rendered page images. Both copied PDFs match their supplied originals by SHA-256.

| Manual | Companion | PDF pages |
| --- | --- | --- |
| Nuclear | Counting statistics | 3–7 |
| Nuclear | Scintillation operating voltage | 8–10 |
| Nuclear | Energy calibration and resolution | 11–16 |
| Nuclear | Electronic measurement chain | 17–21 |
| Nuclear | GM dead time, two-source method | 22–24 |
| Nuclear | GM efficiency | 25–28 |
| Solid State | Semiconductor resistance coefficient | 3–6 |
| Solid State | LiF X-ray diffraction | 7–11 |
| Solid State | Moseley's law, including 12 spectrum worksheets | 12–26 |
| Solid State | GaAs powder diffraction | 27–31 |
| Solid State | Graphite electron diffraction | 32–36 |
| Solid State | Thermoelectric generator | 37–42 |

Nuclear pages 1–2 are cover/contents; Solid State pages 1–2 are cover/contents and
page 43 is the constants appendix. They remain readable, with the nearest experiment
selected. Nuclear instructor is not named in the supplied manual. Solid State credit
is explicitly attributed to PDF author metadata (Dr. Omed; Shaho M. Rasul), not
assumed to be the current instructor assignment.

- `nuclear/assets/manual.pdf`: supplied `nuclear-2026-2027.pdf`, 28 pages,
  SHA-256 `58e84aed2ddd34aada8db50e8334a5c361f48670336c4fae79d927d0a1a18758`.
- `solid-state/assets/manual.pdf`: supplied `Lab Manual - 1st semester.pdf`, 43 pages,
  SHA-256 `1c1ec03aa33d29c2e6fcaea54f05b17d0b361a6a4f160e86e25dedfbfda46ba9`.

The PDFs are unchanged and excluded from the original code's MIT license. Public
availability does not grant permission to redistribute the manuals or their figures.

## Scientific decisions and limitations

- Counts and rates are distinct. For equal gates, μ = rate × gate, σN = √μ and
  σrate = √μ/gate. Gates are independent Poisson trials; Gaussian FWHM is approximate.
  The manual's demonstration histogram/data are not adopted as validated measurements.
- Scintillator high voltage is in kV, not keV. A logistic threshold response and gain
  power six illustrate effects, not calibration, a recommended voltage or a true plateau.
- Co-60 reference peaks use the manual's rounded 1173 and 1332 keV. Both energy and
  channel differences have matching order; E = aC+b retains the intercept. A nonzero
  intercept prevents blindly equating fractional channel width and energy resolution.
  The synthetic spectrum has only Gaussian reference peaks, not a full NaI spectrum.
- Na-22 feeds Ne-22; 511 keV is annihilation radiation, not a nuclear pair-production
  transition. Companion notes correct these statements without altering source pages.
- Electronics waveforms and the regularly repeated demonstration pulse are schematic;
  pulse width is not the repetition period of random events. An SCA accepts analog
  pulse height and produces standardized logic, not an amplified analog output.
- Dead time is nonparalyzable with zero background in the synthetic two-source model.
  Displayed low-loss approximation is compared with the exact zero-background formula
  and chosen τ. Inverting measured rate requires mτ < 1. The event timeline illustrates
  missed arrivals but is not the rate estimator. Real backgrounds require consistent
  treatment rather than assuming an exact zero-background formula still applies.
- Efficiency uses an isotropic point source, exact on-axis circular-window solid angle,
  radius 0.675 cm and manual reference activity 74000 Bq. Reference age is user-adjusted,
  not an assumed experiment date. Half-life controls allow the manual's rounded 28.5 y
  and 2.6 y examples. One relevant quantum per decay is assumed; branching, attenuation,
  beta transport, Sr-90/Y-90 daughter activity and dead-time loss are omitted. Displayed
  detection rates are before dead-time loss, not a measured source efficiency.
- Semiconductor law has fixed gap/prefactor and R(40 °C)=100 Ω. Local derivative and
  finite-interval coefficient are distinguished. Prefactor is not resistance at 0 K;
  mobility, doping, contacts and self-heating are omitted.
- LiF analyzer spacing is labeled d≈201.4 pm and conventional rock-salt edge a≈402.8 pm.
  The usual (100)-oriented analyzer reflects the conventional (200) family; conventional
  FCC (100) is extinct. This avoids presenting the manual's analyzer-spacing notation
  as the conventional cubic lattice constant. Manual wavelengths remain selectable.
  Relative response is an illustrative Gaussian, not measured reflectivity.
- Moseley Kα is a simplified screening law. Supplied spectrum worksheets are preserved,
  not claimed to have been digitized. A fit to generated values recovers the constant
  used to generate them; it is not an independent Rydberg measurement. NaCl d111=a/√3.
- Powder model uses five manual-indexed families with arbitrary peak heights. It does
  not predict structure factors. Cylindrical-film arc s=2Rθ differs from a flat-screen
  ring radius L tan(2θ). The drawing is a cone cross-section, not a measured pattern.
- Graphite model uses manual bulb radius R=65 mm, d=213/123 pm and small-angle
  r≈2Rλ/d. Nonrelativistic wavelength drives the model; a relativistic value is separately
  displayed. The wavelength correction is below 0.4% over 4–6.5 kV. Moving ring markers
  are guides, not trajectories. The model is not valid for arbitrary screen geometry.
- Thermoelectric model uses 142 couples, constant coefficients and a resistive equivalent
  circuit. Seebeck is derived from open-circuit voltage, not an uncorrected loaded slope.
  Matched load maximizes electrical power, not generally efficiency. Water-based thermal
  estimate uses 0.194 kg × 4182 J/(kg K) and converts K/min to K/s. Pload/Pthermal is an
  apparent ratio, not a validated heat-engine efficiency; the two simplified models are
  not a coupled thermodynamic solution. The manual's 0.9% is not a universal constant.
- Appendix Avogadro exponent is corrected in notes to 10²³ (not 10²²). Current SI values
  of h, e, c and kB are used for calculations. Bond strength is not universally determined
  by atomic weight, and electron/hole mobilities need not be equal.

Reference links are in `content.js` and available in the readers. They include primary
manufacturer experiment descriptions, INL NaI spectra and NIST SI constants. Core
algebra, limiting cases and inverse relationships are checked in `tools/laboratories.test.mjs`.

## October 18, 2026 review

Reviewed all twelve companion definitions, equations, slider bounds, model limits,
plots and source/manual page mappings. This is a bounded implementation review,
not an independent experimental validation or a guarantee of error-free science.

- Replaced the repeated whole-library bibliography with explicit per-experiment
  references. Each experiment links to its own original manual page range; sources
  update when switching or syncing pages. Experiments without a verified external
  match show only their supplied manual. ORTEC Experiment 2 sections 2.2, 2.5 and
  2.6 support dead time, efficiency geometry and counting statistics respectively.
- Calibration now identifies extrapolation and nonphysical inferred energies;
  resolution is undefined at nonpositive energies. Added the selected-channel
  cursor and clarified that the manual prints 1333 keV while the model uses rounded
  1332 keV for the upper Co-60 line. The common assumed Gaussian width is explicit.
- Poisson histograms share a scale for observed/expected frequencies and include
  outlying recorded counts. Powder scans include every modeled peak, including
  reflections beyond 100 degrees at extreme slider settings.
- Added tests for all combinations of slider endpoints, not just all-min/all-max.
- Existing caveats remain: zero-background nonparalyzable dead time, unit-emission
  efficiency, simplified gain and semiconductor laws, schematic SCA pulses,
  kinematic diffraction, nonrelativistic graphite rings and conditional cooling
  calorimetry. No real apparatus data, intensity fit or validated thermal efficiency
  is implied. Original PDFs remain unchanged.

The shared website theme uses `vibephysicsai-theme`, independent of notes/progress.
It works across the library, About, all five lectures and both laboratories, with
cross-tab updates and a usable session-only fallback if storage is unavailable.

## Data, state and deployment

### Nuclear visual-first layout

All six Nuclear companions now lead with a large code-native SVG apparatus view:
counting source/detector/scaler, NaI(Tl)/photomultiplier, Co-60/pulse-height analyzer,
electronic pulse chain, GM cross-section and source/window geometry. Play/Step and
the existing physical controls update these views. Enlarge visual permits readable
inspection on small screens. The GM cross-section follows accepted Poisson events
from the live counting model, with schematic electron and positive-ion motion.
It is not a microscopic gas simulation; effective fixed dead time is not equated
to a calculated ion transit time. Display sizes, multiplication and ray density
are illustrative, not quantitative transport or pulse-shape predictions.

Original plots, deterministic data recording/CSV, equations and assumptions remain
under **Graphs, equations & calculated data**. Manuals, notes, quizzes, practice,
page synchronization, light/dark mode and full-screen remain available. The Solid
State layout and models are unchanged.

GM dead time alone now includes an optional live random-event panel. Exponential
interarrival times model stationary Poisson input; each accepted event starts a
fixed, non-extending dead interval. Source selection includes background-only,
source 1, source 2 and both. Background defaults to zero. Counts are generated
from events, not forced to equal the analytical expectation. Physical time and
slowed display time are separate. Playback pauses off-screen or in hidden tabs.
Start/Pause, one-arrival stepping, restart, duration and speed are available.
Completed-run records retain all physical settings and are separate from the
original deterministic table. They are session-only; this is not a real GM tube,
hardware model or background-corrected experimental analysis. Other experiments
do not display this new panel.

Recorded data and CSV files are explicitly labeled **SIMULATED**. Numerical values
are generated from the controls, not from apparatus. Each CSV includes control settings
and extra values where relevant. Tables are session-only (maximum 1000 rows); export
to keep them. Changing non-axis assumptions clears the current table to prevent mixing
different populations/models. Repeated points alone cannot establish a slope.

Reading position, per-experiment notes and conceptual-answer selections use independent
`vibe:lab:<manual-id>:v1` browser storage keys. Notes and lecture progress are never
cleared when switching readers. Playback respects reduced motion and pauses off-screen.
PDF page controls work with sync enabled or with a pinned experiment. Keyboard arrows
turn manual pages unless a form control/button has focus. All controls use native HTML.

GitHub Pages copies `laboratories/` and continues serving all existing lectures. There is
no backend, real radiation transport, hardware connection or experimental data claim.
