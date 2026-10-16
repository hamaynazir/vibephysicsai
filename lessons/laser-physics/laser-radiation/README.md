# Laser Radiation and Its Properties

Lecturer: Ms. Ahang Mohammed Hussein. Original: supplied `chapter 1.pdf`, 14 pages, preserved byte-for-byte.

19 visual sections cover the definition/history of lasers, transverse EM fields and vector components, amplitude/wavelength/frequency/period, spectrum, atomic energy levels, photons, three emission/absorption processes, the He–Ne example, temporal/spatial coherence, the chopped-pulse example, directionality, monochromaticity, irradiance, active media, pumping and cavity feedback.

The white split reader includes source-page synchronization, a section-only selector, phone panel switching, eight numerical exercises, 19 concept questions, a twelve-step foundation path, predictions, clickable explanations and browser-local mistake review. Storage keys are independent of the other chapters. No authentication, server computation or external inference API is required.

## Scientific decisions and corrections

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
