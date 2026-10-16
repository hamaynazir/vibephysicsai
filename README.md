# Vibe Physics AI

An independent physics learning library: **original lecture pages beside interactive educational visualizations, guided explanations and practice.**

[Visit the website](https://vibephysicsai.com/) · [About & contact](https://vibephysicsai.com/about.html) · [Open source on GitHub](https://github.com/hamaynazir/vibephysicsai) · [MIT license](LICENSE)

Created by **Mohammed Ghazali Fadhil Tahir (Hamaynazir)**, a fourth-year BSc Physics student in the Department of Physics, College of Science, University of Sulaimani. This is a personal, independent educational project—not an official university website or an endorsement by the university or lecturers.

Reader labels distinguish subject labs from their chapters: Solid State Lab → Crystal Structures, Materials Lab → Materials and Bonding, and Laser Lab → Laser Radiation and Its Properties.

## Current experience

All five lecture readers and both laboratories have a **Full-screen simulation** button (⛶ on small screens). It hides the PDF and expands the interactive companion, keeping model controls, playback and learning tools available. Use **Back to lecture/manual** or Escape to return. Supported browsers use native full screen; otherwise a full-page focus view provides the same PDF-free layout. Models and saved progress are not recreated or cleared.

The homepage also has a separate **Laboratories** collection: **Nuclear Laboratory** (28 original manual pages) and **Solid State Physics Lab** (43 pages), with **six experiment companions each**. All 12 include animated schematics, adjustable calculated responses, procedure walkthroughs, synthetic data recording/CSV export, calculation practice, a conceptual check and local notes. Selected linearized relationships support regression. These are separate from lecture subjects and are not included in lecture chapter counts. See [laboratories/README.md](laboratories/README.md) for coverage, provenance, scientific corrections and model limits. Simulated outputs are not real measurements or instructions for operating equipment.

The lecture library has **five available chapters, 115 original PDF pages and 95 companion sections**. All five subjects now have a prepared first chapter. The separate Laboratories collection has two manuals, 71 original manual pages and twelve experiment companions.

**Electromagnetic Theory → Vector Analysis**, by Mr. Taha Yasin Ahmed, adds all 36 original slides, 24 companion sections, 16 calculation exercises and a 14-step introductory path. Models cover i/j/k components, vector sums and products, origin shifts, cube diagonals, gradient/divergence/curl, integral theorems, coordinate conversions, local bases and differential elements. Mathematical outputs are distinguished from real electromagnetic field simulations; see [the Vector Analysis README](lessons/electromagnetic-theory/vector-analysis/README.md).

**Nuclear Models → Basic Concepts in Nuclear Physics**, by Assistant Professor Dr. Adil M. Hussein M. Saeed, adds all nine original pages, fourteen sections, eleven calculation exercises and a nine-step introductory path. Models cover nuclide notation and relationships, isomer excitation, mass-energy units, helium binding, beta bookkeeping, Coulomb closest approach with recoil, radius/density scaling, nuclear charge, Fermi profiles and a piecewise-linear surface problem. Scientific clarifications are separated from the unchanged PDF; see [the nuclear chapter README](lessons/nuclear-models/basic-concepts/README.md).

- Subject → Chapter → Section navigation lets you switch directly between available readers and resume saved positions.
- The laser overview compares ordinary light with laser light through four animated views: coherence, directionality, spectral width and irradiance. Controls update diagrams and metrics; each comparison links to its detailed section.
- Other laser demonstrations animate waves, emission and absorption, coherence, pulses, divergence, pumping and cavity feedback.
- Materials and Solid State use motion where useful: electron transfer, scattering, molecular motion, electron drift, crystal rotation, vector component paths, angles, origin-invariant displacement and perpendicular interplanar gaps.
- Play/Pause, Step, Restart and Speed controls support deliberate exploration. Reduced-motion preferences start playback paused.
- Responsive white and optional dark layouts support phones and computers. Guided paths, predictions, questions, numerical exercises and saved review complement the lecture pages.
- No account, database, API key or paid AI service is required. Reading positions and practice history stay in the browser, not a cloud account. The explanations are prepared teaching content—not a live AI tutor.

The website uses **HTML, CSS and JavaScript**, with **Canvas** for 2D diagrams, **Three.js/WebGL** for 3D and **PDF.js** for lecture viewing. The main diagrams are not SVG animations. Models are idealized teaching tools, not full quantum or molecular-dynamics simulations; assumptions and scientific qualifications are described in each chapter.

## Open source, ownership and contributions

The original website code and original project documentation are **open source under the [MIT license](LICENSE)**, copyright (c) 2026 Mohammed Ghazali Fadhil Tahir (Hamaynazir). You may use, modify and redistribute them, including commercially, while preserving the copyright and license notice. **Lecture PDFs and third-party materials are excluded** and retain their own ownership and permissions; third-party libraries keep their existing licenses. See [LICENSING.md](LICENSING.md) for the scope.

Scientific corrections, accessibility feedback and suggestions are welcome through [GitHub issues](https://github.com/hamaynazir/vibephysicsai/issues). Include the chapter, section, observed problem and a reliable reference where relevant. Preserve original PDFs and existing progress-storage keys when proposing changes. Automated checks reduce mistakes but do not guarantee that every scientific explanation is error-free.

The live site is hosted on **GitHub Pages** at **https://vibephysicsai.com/**. Pushes to `main` run the publication workflow. The `CNAME` file declares the custom domain; DNS and HTTPS are configured separately in domain and hosting settings.

A simple white learning library for **Materials Science, Laser Physics, Solid State Principles, Nuclear Models, and Electromagnetic Theory**.

The other available chapters are **Materials and Bonding** (Materials Science, Professor Dr. Omed Gh. Abdullah, 16 original PDF pages, 22 sections), **Crystal Structures** (Solid State Principles, Mr. Shaho Mohammed Rasul, 40 pages, 16 sections), and **Laser Radiation and Its Properties** (Laser Physics, Ms. Ahang Mohammed Hussein, 14 pages, 19 sections). Laser has eight calculation exercises and a twelve-step learning path. Materials has its own models, notes, predictions, five numerical exercises, ten-step foundation path and saved review. See its chapter README for coverage, sources and assumptions.

**Crystal Structures**, under **Solid State Principles**, is an English-language interactive companion to the 40-page lecture from the Department of Physics, College of Science, University of Sulaimani. Each prepared lecture has its own reader and browser-local progress. Original PDF pages sit beside corresponding models; adding a subject chapter does not change existing reading or answer-storage keys.

The homepage is `index.html`; the existing interactive chapter is now `reader.html`. Old links such as `/#page=5` automatically open the reader at the same page. Reading position and answer history retain their existing storage keys.

## Run on your PC (optional, for development)

Visitors can use [the published website](https://vibephysicsai.com/) without installing anything. These instructions are only for running a local copy.

On Windows, double-click **START-STUDY-LIBRARY.cmd**. Node.js must be installed. Keep the server window open and visit **http://localhost:4173**. The older `START-CRYSTAL-LAB.cmd` shortcut also works.

Or run these commands in this folder:

```sh
npm start
```

No package installation is necessary. An alternative, with Python installed:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Open **http://localhost:4173**. Opening `index.html` directly as a file will not work because browser security requires an HTTP server for modules and PDFs.

## Use it

- Choose one of the five subjects on the library homepage. Search by subject or chapter, or choose **Ready to study** to show subjects with available chapters.
- Open **Solid State Principles → Crystal Structures**, **Materials Science → Materials and Bonding**, **Laser Physics → Laser Radiation and Its Properties**, **Nuclear Models → Basic Concepts in Nuclear Physics**, or **Electromagnetic Theory → Vector Analysis**.
- **Continue learning** resumes the available lesson at its saved page. The indicator is a reading position, not a completion or mastery score.
- Use **← Library** in the reader header to return to the homepage.
- Scroll the lecture or use the page arrows; Crystal Structures has 40 pages, Materials has 16, Laser has 14, Nuclear has nine (including its cover) and Vector Analysis has 36. Nuclear and Vector Analysis use a single-page preview with page controls; all original pages remain accessible.
- Open **Sections** to choose any of the 16 topics within the Crystal Structures chapter. The drawer closes after selection.
- The lab follows your lecture page. Turn **Sync off** to pin the current lab while browsing other pages.
- Use the single **Learn** menu: explore, explain what you click, build it yourself, predict then reveal, teach me from zero, review weak points, read notes, or answer a chapter question.
- Drag 3D models to rotate, use the wheel/pinch to zoom, and use the reset button to restore the camera. Automatic rotation is optional.
- The default is a pure white, minimal reader with serif headings, a full-height lecture, and one focused diagram. Dark mode is optional. Theme and reading position are saved in your browser.
- A labeled color key explains each crystal model. Diamond uses two colors for its two carbon sublattices, not two elements. BCC/FCC colors distinguish positions, and HCP colors distinguish A/B layers.
- Open **Diagram controls · vectors, angles & more** below a diagram for the existing teaching overlays and advanced controls. A readable result appears inside the model and a full explanation below it.
- **Vector components** draws a selected conventional or primitive vector with its Cartesian component path, î/ĵ/k̂ axes, endpoints and equation. For oblique cells it distinguishes lattice coefficients from Cartesian components.
- **See α, β and γ** highlights the defining pair of vectors and draws the true 3D angle arc. For lattice/structure models, compare conventional and primitive vectors: FCC primitive angles are 60°, BCC primitive angles are approximately 109.47°, while conventional cubic angles are 90°.
- **Move the origin** moves the coordinate reference among four positions, keeps points A/B fixed, and updates their position vectors. The A-to-B displacement remains unchanged.
- **Select an atom & its neighbors** supports clicking/tapping the model and a keyboard-accessible atom selector. Periodic copies outside the drawn cell complete the coordination shell; this works for all eight structures.
- **Build a primitive cell**, **Count shared atoms**, **Build a Miller plane**, and **Build a Wigner–Seitz cell** offer previous/next construction steps with corresponding diagrams and explanations. Counting always displays one cell. Miller teaching planes retain the actual offset and show negative-axis intercepts.
- Turn off **Show teaching overlay** to return to the original uncluttered model.
- On a phone, use the **Lecture / Interactive lab** switch.
- Keyboard: left/right arrows turn pages when a control is not focused; `/` opens chapter search. Escape closes the chapter drawer or Help.

### The new learning modes

The detailed controls below describe the Crystal Structures chapter. Materials and Bonding has its own lecture-specific diagrams, questions, five calculation exercises and ten-step foundation path. Laser Radiation and Its Properties has eight calculation exercises and a twelve-step foundation path; see its chapter README for models and assumptions.

- **Explain what I click:** select a crystal atom, cell-axis arrow, plane patch, or teaching angle arc. A focused explanation describes its coordinates, vector components, intercepts, or true angle. Atom explanations can highlight its full periodic neighborhood and expand to neighboring cells. These are authored, local explanations; there is no AI request or chatbot. The 2D lattice/bonding views give a concept explanation, and clicking the energy plot evaluates its model potential and force.
- **Build it yourself:** three exercises ask for an FCC primitive vector, the missing BCC body-center atom, and Miller indices from intercepts. Preview your entered vector, atom or plane, then check it. Feedback identifies incorrect components and explains the correct construction. Inputs are numerical rather than freehand drawing.
- **Predict, then reveal:** eight conceptual questions cover order, origin shifts, angles, neighbors, atom sharing, d-spacing, forces and finite Madelung sums. The diagram stays hidden while you predict. The explanation appears after answering; a separate action reveals the related diagram.
- **Teach me from zero:** a seven-step foundation path connects lattice points, vector components, atomic bases, atom counting, primitive cells, Miller planes and the extended crystal. Navigation is not gated and your position is saved locally. This is an introduction, not a replacement for all 40 lecture pages.
- **Review my weak points:** incorrect prediction, construction and chapter-question answers are saved in this browser. Review a question correctly to resolve it. The list records attempts, not a mastery score. You can clear saved answers. If browser storage is blocked, the current session still works but answers cannot persist.

## What is covered

All original pages are preserved, all 16 lecture sections have companion content, and all 13 worked examples have explanatory notes and an Explore action. Some consecutive pages share a model because they develop the same topic.

| Lecture pages | Companion |
| --- | --- |
| 1 | Ordered/disordered arrangements and lattice translations |
| 2–4 | Lattice + basis, primitive/conventional cells and 3D vectors |
| 4–8 | Seven systems and 14 allowed Bravais centerings |
| 9–12 | Inversion, mirrors, rotation axes and the cube's 23 elements |
| 12–13 | Geometrically constructed SC/BCC/FCC Wigner–Seitz cells |
| 13–14 | SC/BCC/FCC hard-sphere packing and atom counting |
| 14–21 | SC, BCC, FCC, NaCl, CsCl, diamond, zinc blende and HCP |
| 21–26 | [uvw] arrows and editable (hkl) planes, including negative/zero indices |
| 26–30 | d-spacing calculator for all seven metrics and Al/Ni examples |
| 30 | Amorphous order schematic |
| 30–35 | Pair potential, force sign, stable equilibrium and tensile limit |
| 36–39 | Ionic, covalent, metallic, hydrogen and dispersion bonding |
| 39–40 | 1D/2D/3D ionic shell sums and Madelung examples |

The original PDF is the authoritative record of what the lecture says. Companion notes are explanatory additions. They clarify several issues: 230 counts space-group types, CsCl is primitive cubic with a basis, the rhombohedral metric has equal lengths, covalent bonds can join unlike species, dispersion involves correlated fluctuations, and the radial force is −dU/dr. Diffraction indices retain their order when calculating d. The four-shell 2D Madelung result is explicitly a partial sum.

Models use idealized positions. Full spheres at cell boundaries are visual aids and are counted fractionally. Packing values refer to ideal touching spheres, independent of the display-size control. Bonding animations are conceptual, not quantum simulations. The disorder slider is not an atomistic glass model. Hexagonal and HCP overview models show the familiar six-sided prism. For HCP this contains six atoms after sharing; vector, counting, coordinate and repeated-cell teaching views use the two-atom primitive cell. Raw Madelung shell sums in 2D/3D do not provide a reliable converged bulk value.

## Hosting and deploying updates

This repository is already published on GitHub Pages. Push updates to `main`; `.github/workflows/pages.yml` tests and deploys the site. The setup steps below are for someone hosting their own copy, not requirements for visitors.

This is a buildless **static website**. It needs no backend, API key, database or paid AI service. All website libraries are stored in `vendor/`; there are no runtime CDN requests, external fonts or trackers. External references only open if clicked.

1. Create an empty GitHub repository.
2. Upload this folder's source files, including `assets/`, `vendor/`, `.github/workflows/pages.yml` and `.nojekyll`. Do not upload `tmp/`, `artifacts/` or `node_modules/`.
3. Use `main` as the default branch (or update the branch in the workflow).
4. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Push to `main`, or run **Publish Vibe Physics AI to GitHub Pages** from the Actions tab. The workflow checks the calculations and catalog, packages the website files, and publishes them.
6. GitHub reports the resulting Pages URL. Relative asset paths work under a repository subdirectory as well as a custom domain.

For local Git, once your empty remote exists:

```sh
git init
git add .
git commit -m "Add Solid State Lab interactive chapter"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Cloudflare Pages or Netlify can also serve a copy as a static site with no build command. Upload only website files, excluding temporary files, screenshots, credentials and local dependencies.

**Lecture rights:** The included `assets/lecture.pdf` is the user-supplied lecture and retains its original ownership. Only publish it if you have the right to share it. A public repository and ordinary public static hosting expose the PDF to visitors. The website does not grant a license to the lecture.

## Files

```text
index.html             Main library homepage + old-bookmark redirect
library.css            White library and subject-page styling
library.js             Subject routes, search, filters and resume links
catalog.js             Subject and available-chapter registry
about.html             Creator, independent-project details and source link
reader-navigation.js   Shared Subject → Chapter → Section navigation
study-motion.js        Shared playback and teaching-motion helpers
lessons/               Materials, Laser, Nuclear and Electromagnetic readers and PDFs
laboratories/          Nuclear/Solid State manuals and 12 experiment companions
reader.html            Existing interactive Crystal Structures reader
styles.css             Responsive dark and light themes
reader.css             White minimal reader and progressive disclosure
app.js                 PDF reader, page sync, controls and quizzes
lecture-data.js        Sections, page coverage and worked examples
crystal-math.js        Pure geometry and scientific calculations
visuals.js             Three.js models and Canvas illustrations
teaching.js            Teaching controls and explanatory notes
teaching-math.js       Coordination, origin changes, sharing and primitive geometry
teaching-visuals.js    Component paths, angle arcs and construction overlays
learning.js            Single Learn menu, object explanations and activities
learning-data.js       Guided path, predictions and construction exercises
learning-memory.js     Local answer history and weak-point review
assets/lecture.pdf     Unchanged supplied 40-page lecture
assets/favicon.svg     Local application icon
vendor/                Local PDF.js and Three.js libraries + licenses
tools/serve.mjs        Local-only static server
tools/science.test.mjs Scientific verification checks
tools/teaching.test.mjs Teaching geometry and periodic-neighbor checks
tools/learning.test.mjs Saved-answer and learning-content checks
tools/catalog.test.mjs Subject availability, search and saved-position checks
.github/workflows/     GitHub Pages deployment workflow
```

## Verification

All five chapter readers provide Subject → Chapter → Section selectors above the visualization. Switching to another available subject opens its chapter at the saved page; selecting the current chapter leaves the current page alone. Chapter options come from the shared catalog. No answers or reading history are cleared by switching.

Materials Science and Crystal Structures add Play/Pause, Step, Restart and Speed where motion explains something. Materials animates transfer, scattering, molecular motion, London dipoles, electron drift and carbon view rotation. Solid State rotates the view and traces actual component paths, angle arcs, invariant A→B displacement and the perpendicular interplanar gap. These are teaching demonstrations; cell geometry and calculated parameters stay fixed. Manual 3D interaction pauses playback. Reduced-motion settings start paused, with deliberate Play available. Original PDFs, section counts, questions, exercises and saved-answer keys remain unchanged. Shared playback and conservation tests are in `tools/study-motion.test.mjs`.

```sh
npm test
```

Checks include complete page/example coverage, 14 Bravais types, reciprocal-metric d-spacing, negative-index plane geometry, Wigner–Seitz face counts and volumes, hard-sphere packing, force equilibria/signs and Madelung shell multiplicities. Materials and Laser checks cover their content, calculations, playback timing, charge/electron conservation and ordinary-light versus laser comparison models. The checks use only Node.js built-in modules.

## Add future lectures

See `ADDING-LECTURES.md` for the catalog format and the workflow for adding independent subject chapters. Future chapter folders under `lessons/` are included automatically by the GitHub Pages workflow. The library does not invent placeholder chapters or turn an arbitrary uploaded PDF into an interactive lesson automatically: each lesson is prepared for its own content before being listed.

## Inspiration and acknowledgements

Part of the idea for Vibe Physics AI—reading lecture pages alongside interactive visualizations—was inspired by **Feynman Interactive**, originally shared by **mishig** on Hugging Face. The linked [hello2himel/feynman-interactive GitHub repository](https://github.com/hello2himel/feynman-interactive) is a community mirror and static-hosting adaptation of that project.

This credit acknowledges the conceptual inspiration. Vibe Physics AI is an independent educational project and does not imply affiliation with or endorsement by those creators.

## AI assistance

Vibe Physics AI was developed with assistance from **OpenAI Codex**, using **GPT-6.1 Sol** in the creator's development workflow. AI assistance supported writing and refining code, building interactive visualizations, drafting study explanations and exercises, and developing automated checks.

**Mohammed Ghazali Fadhil Tahir (Hamaynazir)** provides the project direction, selects the lecture materials and learning goals, and decides what to include. AI-assisted content and code can contain errors; automated tests do not replace scientific review, lecturer guidance or authoritative references. This acknowledgement does not imply endorsement by OpenAI, the university or the lecturers. The published website uses prepared content and browser-based models, not a live AI tutor.

## Sources and dependencies

- User-supplied lecture: **Chapter 1. Crystal Structure (1).pdf**, copied without alteration to `assets/lecture.pdf`.
- [IUCr: interplanar spacing](https://dictionary.iucr.org/Interplanar_spacing)
- [IUCr: Bravais nomenclature](https://www.iucr.org/who-we-are/commissions/commission-on-crystallographic-nomenclature/published-reports/bravais)
- [IUCr: Symmetry Database, including CsCl](https://journals.iucr.org/j/issues/2023/06/00/dv5006/index.html)
- [Three.js](https://threejs.org/) 0.180.0, MIT license in `vendor/THREE-LICENSE.txt`.
- [PDF.js](https://mozilla.github.io/pdf.js/) 3.11.174, Apache-2.0 license in `vendor/PDFJS-LICENSE.txt`. PDF scripting/evaluation is disabled for the supplied lecture viewer.

Use a current browser with WebGL and hardware acceleration for 3D. If WebGL is unavailable, the original lecture, notes and calculators remain usable. Reduced-motion preferences disable continuous animation.
