# Laser Radiation and Its Properties

Lecturer: Ms. Ahang Mohammed Hussein. Original: supplied `chapter 1.pdf`, 14 pages, preserved byte-for-byte.

19 visual sections cover the definition/history of lasers, transverse EM fields and vector components, amplitude/wavelength/frequency/period, spectrum, atomic energy levels, photons, three emission/absorption processes, the He–Ne example, temporal/spatial coherence, the chopped-pulse example, directionality, monochromaticity, irradiance, active media, pumping and cavity feedback.

The white split reader includes source-page synchronization, a section-only selector, phone panel switching, eight numerical exercises, 19 concept questions, a twelve-step foundation path, predictions, clickable explanations and browser-local mistake review. Storage keys are independent of the other chapters. No authentication, server computation or external inference API is required.

## Scientific decisions and corrections

### Four-property comparison on page 1

The overview now directly compares an ordinary-source example with a laser example. Four accessible property buttons switch the two-panel animation; sliders, Play/Pause, Step, speed, Reset and a link to the existing detailed section are available. All 19 original companion sections, notes, questions and eight calculations remain.

- Coherence uses the same nominal carrier and phase sketches at three sampled positions. The first two interfere. Ordinary-source relative phase is sampled from a zero-mean Gaussian of adjustable standard deviation σ; ideal ensemble fringe visibility is exp(−σ²/2). The laser example has a fixed adjustable offset and ideal visibility 1. The average strip is the analytic ensemble expectation, not a measured finite exposure. Stable nonzero phase offsets are still coherent. Display time is not calibrated as a coherence-time measurement.
- Directionality is a labeled geometric ray comparison, not the Gaussian diffraction solver. Both sources start at radius 5 mm; end diameter is 2(r₀ + z tan θ), with the same propagation distance and shared auto-fitted transverse scale. Ordinary half-angle is entered in degrees, laser half-angle in mrad. Both are nonzero. Dots indicate representative propagation, not a photon count or physical propagation timing.
- Spectra have common wavelength axes (380–780 nm) and independent unit-height Gaussian profiles; FWHM sliders explicitly set widths. The moving probe scans these stationary spectra. Packet colors qualitatively distinguish the broadband versus narrow-band examples. Neither profile is claimed to be a measured lamp/laser spectrum; normalized peak heights must not be used to infer equal spectral power.
- Irradiance holds optical power equal in the two spots. Uniform circular I = 4P/(πd²); the ratio is the inverse area ratio. Spot diameters share a fixed spatial scale, while brightness is tone-mapped and equal packet-symbol counts are illustrative energy arrivals, not a hazard or photon statistics calculation. This isolates concentration rather than assuming lasers necessarily have higher total power.

These examples are not universal definitions: ordinary light can be filtered or collimated, and actual lasers differ in coherence, divergence, mode structure, linewidth and power. All model limits are stated in the live comparison, not only here.

### Dynamic models

Ten useful models now animate by default: traveling E/B fields, the wave snapshot, photon flow, absorption/emission, spatial coherence, cavity feedback, beam cross-section propagation, pulse-envelope passage, a temporal-delay scan and pump-energy flow. Play/Pause, a deterministic Step, 0.25×–2× speed and Reset are available. Reduced-motion preferences start paused, with deliberate Play or Step still available. Animation stops drawing while hidden or outside the viewport. Pausing and resuming uses elapsed-frame increments, never jumps to an absolute wall-clock time.

Optical field motion uses a common slowed physical time and the vacuum relation x−ct, so changing wavelength changes frequency without changing c. E and B use the same oscillation phase and preserve transverse geometry. A fixed red probe distinguishes field oscillation at one place from propagation of the pattern. Polarization rotation changes the transverse basis, not the propagation direction.

Absorption removes one incoming photon while raising the emitter; spontaneous emission lowers a prepared emitter and produces one packet; stimulated emission lowers a prepared emitter with one input and two same-mode outputs. Events change discrete energy levels without showing a continuous electron path between them. Repetition represents newly prepared emitters. Timing and wave-packet glyphs are teaching illustrations, not lifetime statistics or measured photon trajectories.

The cavity trace applies each mirror's intensity reflectivity and the stated small-signal gain/loss on each pass; output fraction is 1−R₂. It resets after four round trips and explicitly does not simulate saturation or final output power. Offset drawing rows do not imply distinct modes. Stable spatial coherence correctly keeps fringes fixed even as both fields oscillate; fluctuating phases shift instantaneous fringes while their ensemble average is flat. The temporal model scans delay, not source aging. Pump-energy flow does not change the slider-set populations or pretend to solve rate equations.

The pulse envelope moves across a fixed 0–400 mm spatial window with width cΔt; its optical carrier is not drawn. Its spectrum stays fixed during vacuum propagation, and the loop repeats the passage at greatly slowed speed. Beam directionality tracks a cross-section through an otherwise stationary Gaussian envelope. Summary/history/lookup plots remain still where motion would add no physical meaning.

Dynamic geometry, interaction conservation and cavity losses are checked in `tools/laser-dynamics.test.mjs`. Browser QA verifies changing canvas pixels in all ten models, pause/step/reset/resume, reduced-motion opt-in, and phone layouts, in addition to the complete chapter-reader regression checks.

- Exact SI c, h and elementary charge; rounded lecture constants can give slightly different numerical answers.
- Field amplitude is not intensity: irradiance scales with amplitude squared. Vacuum speed is c; a medium can change phase velocity and wavelength while preserving frequency at a stationary interface.
- The Bohr picture is explicitly historical. Hydrogen energies are an added illustration, never He–Ne energy levels or literal electron orbits.
- The He–Ne 632.8 nm, 2 mW example has both energy and photon-rate solutions.
- The pulse example's incomplete printed duration is explicitly assumed to mean 0.05 ns at 623.8 nm (not 632.8). The default inverse-duration estimate is not labeled an exact FWHM result; rectangular and Gaussian transform-limited conventions are separate choices.
- Coherence lengths use the lecture inverse-bandwidth estimate and state spectrum/definition caveats. The normalized Gaussian correlation illustration is a separately identified model.
- Real lasers have finite linewidth and diffraction. The Gaussian beam extension uses M² = 1, vacuum, 1/e² intensity radius and far-field half-angle, not full-angle or diameter.
- The irradiance example corrects the missing square in the final PDF formula: I = 4P/(πd²), with units W/m². Uniform-beam averages are not Gaussian peak values.
- Population sliders set an illustrative fraction, not a rate-equation pump model. Equal degeneracies are assumed; a resonantly pumped isolated two-level system does not sustain inversion.
- Cavity reflectivities are not universal 100%/99%. The dimensionless round-trip small-signal factor has explicit gain/loss assumptions and does not predict steady output power or saturation.
- No arbitrary claims about harmless non-ionizing radiation, eye interception or universal laser coherence length are repeated as facts. No laser exposure guidance or safety calculator is provided.

References are linked in the reader: NIST, OpenStax, and authored RP Photonics articles. All diagrams are original Canvas drawings, not copied source images. Numerical correctness is checked in `tools/laser.test.mjs`; browser checks cover PDF pages, all sections, controls, learning interactions, resume and mobile overflow.

HTML, CSS and native JavaScript; uses the existing local PDF.js viewer and shared reader styles. GitHub Pages automatically includes this directory. Open `index.html` through the project server, not directly as a file URL.
