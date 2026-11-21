# Chapter One scientific correction log

The lecture PDF is preserved verbatim. Statements below are paraphrased except for symbols and numerical expressions.

| PDF | Statement in the lecture | Correction and implementation |
| --- | --- | --- |
| 2 | Isomers share A and Z, with Tc-99m and Tc-99 as examples | Distinguish metastability from arbitrary excitation. The Tc preset uses 142.6836 keV and 6.0066 h from NUBASE2020, with an energy-level arrow for a possible de-excitation. |
| 3 | Carbon-12 was chosen because carbon has one isotope and is more stable than oxygen-16 | The unified atomic mass unit is defined as one twelfth of the mass of a neutral ground-state carbon-12 atom at rest. Carbon has other isotopes. The staged derivation uses the measured kg equivalent and the exact Avogadro constant. In the present SI, the carbon-12 molar mass is approximately 12 g/mol. |
| 3–4 | Several historical masses and conversion figures appear in the text | Use modern kg and energy equivalents and distinguish mass in MeV/c² from rest energy in MeV. AME2020 supplies neutral-atom masses. CODATA 2022 supplies the constants used for bare particles. |
| 4–5 | Greater mass, greater excitation, and less stability are treated as a general rule | Excitation adds E*/c² to the same nuclide. Decay stability depends on available channels and rates. The energy-level diagram retains Z and N, and the binding view distinguishes binding from radioactive stability. |
| 5 | A free neutron has a half-life of about 13 min | The adopted PDG mean life of 878.4 s corresponds to about 609 s or 10.15 min for the half-life. The population view reports both the exponential expectation and its seeded sample. |
| 5 | Th-234 changes to Pa-234 by beta emission | The change in Z and N is correct. ENSDF documents population of excited daughter levels. The event view uses Pa-234* and tracks charge with the emitted electron and electron antineutrino. |
| 5 | Separated-nucleon mass difference and M − A are both treated as mass defect | Binding defect compares free constituents with the bound state. Atomic mass excess compares a neutral atom with A u. The two views use consistent mass conventions. Helium-4 gives about 28.30 MeV and 7.07 MeV per nucleon. |
| 5 | All very light or all very heavy nuclei are presented as unstable, with maximum stability near A=56 | Stable light nuclides exist. A broad maximum in B/A occurs around iron and nickel. Ni-62 has higher evaluated B/A than Fe-56 in this set. The graph identifies selected evaluated data and avoids claims about lifetime from B/A alone. |
| 6 | The fixed-target closest approach is about 10.585 fm at 25 MeV | Modern constants give about 10.598 fm for the stated model. This is a separation, not a direct nuclear-radius measurement. Finite recoil and nonzero impact parameter have separate model behavior. |
| 7 | Radius parameters and uniform density are treated as general nuclear properties | R = r₀∛A describes an equivalent sharp sphere. Radius definitions vary by probe. Mean sharp-sphere density differs from a Fermi profile parameter. Conversions use 1 fm = 10⁻¹⁵ m = 10⁻¹³ cm and 1 fm⁻³ = 10³⁹ cm⁻³. |
| 7 | Tiny nonzero neutron charge and proton–electron charge mismatch are stated as established | The model uses a neutral neutron and opposite elementary charges for protons and electrons. Net neutrality permits internal electromagnetic structure. |
| 8 | Charge-density figures are paired with discussion of total nucleon density | The charge and nucleon profiles are separate illustrative views. The nucleon view uses shell weighting and can normalize its integral to A. Its 90–10% width is 4a ln 3. At r=0, the exact value may differ from the ρ₀ parameter, especially for small R/a. |
| 8–9 | Muons are grouped with mesons and the nucleon sketch suggests literal classical clouds | The particle view identifies muons as charged leptons and pions as mesons. The valence display shows uud and udd along with the role of gluons and sea quarks. It provides no measured three-dimensional charge distributions. |
| 9 | Light nuclei are assigned roughly 3 fm and heavy nuclei about 10 fm | The radius depends on A, r₀ and the radius convention. For A=208 and r₀=1.2 fm the sharp-sphere model yields about 7.11 fm. |
| 9 | The surface problem gives a=3 fm and c=R with a half-density marker | The scan supports a full declining width from R−a/2 to R+a/2. The implementation weights each shell by 4πr² and computes both surface and total counts. A common normalization rescales both equally and preserves the fraction. |

## References

- [CODATA 2022, NIST](https://physics.nist.gov/cuu/pdf/RevModPhys.97.025002.pdf)
- [AME2020 atomic masses](https://amdc.impcas.ac.cn/web/masseval.html)
- [NUBASE2020 nuclide properties](https://amdc.impcas.ac.cn/web/nubase_en.html)
- [ENSDF Th-234 beta-decay evaluation](https://www.nndc.bnl.gov/ensnds/234/Pa/beta_decay.pdf)
- [PDG free-neutron properties](https://pdg.lbl.gov/2025/AtomicNuclearProperties/neutron.html)
- [Princeton classical Coulomb scattering notes](https://kirkmcd.princeton.edu/examples/Ph205/ph205l12.pdf)
