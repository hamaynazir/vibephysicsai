# Vector Analysis — Electromagnetic Theory, Chapter 1

Independent study companion to the supplied **Chapter_1_2026_.pdf**, 36 slides,
University of Sulaimani, 2026–2027. The cover names **Taha Yasin Ahmed**; the catalog
retains the user's requested credit **Mr. Taha Yasin Ahmed**. PDF metadata naming
another author is not substituted for the visible lecturer credit.

The complete text was extracted and mapped; cross-product algebra, Cartesian face
elements and field-classification claims were checked against rendered page images.
The original PDF is copied unchanged. SHA-256:
`bdfd8fac34bff62ff40a07eb87832582333eb2a4f7a4409ff76736e791d46215`.

## Coverage

| Original slides | Companion |
| --- | --- |
| 1–3 | Cover, outcomes and chapter map |
| 4 | Scalars, vectors, magnitude and unit directions |
| 5 | Addition, scalar multiplication, dot product and projection |
| 6 | Cross product and right-hand rule |
| 7–9 | Cartesian basis, components and cross-product determinant |
| 10 | Position/displacement and origin invariance |
| 11–12 | Cube face-diagonal example and body-diagonal homework |
| 13 | Position magnitude and radial unit vector |
| 14 | Cartesian differential length, face area and volume |
| 15–16 | Gradient, directional derivative and stationary-point caveat |
| 17 | Divergence |
| 18 | Curl |
| 19–20 | Second-derivative identities |
| 21 | Gradient theorem and two paths |
| 22 | Divergence theorem on a sphere |
| 23 | Stokes theorem on a disk, with orientation |
| 24 | Coordinate conventions, inverse angles and quadrants |
| 25–27 | Spherical position, local basis and vector transformation |
| 28–30 | Spherical differential elements |
| 31–32 | Cylindrical position and local basis |
| 33 | Cylindrical differential elements |
| 34–35 | Field classification, domain and boundary conditions |
| 36 | Chapter review |

There are 24 companion sections, 16 numerical exercises, 24 conceptual questions also
usable as predictions, and a 14-step introductory guide. Personal notes and review of
incorrect attempts persist in this browser. These do not claim complete exam mastery.

## Mathematical models and explicit qualifications

- Vector components are signed Cartesian i/j/k components. Zero vectors have no unit
  direction or angle. Dot/cross results and 3D angles are calculated from full vectors,
  not measured from the oblique projected diagram. The 3D view can be dragged without
  changing the mathematical vector components.
- Addition uses translated free vectors; component traces are construction paths, not
  particle trajectories. Scalar multiplication can reverse direction. Cross-product
  orientation assumes a right-handed orthonormal basis. Parallel/zero inputs give a
  zero cross product with no unique normal.
- The face-diagonal example gives 60°. Body homework uses oriented (1,1,1) and
  (1,1,−1), giving acos(1/3)=70.5288°; reversing one arrow gives 109.4712°. The angle
  between unoriented lines is acute; the lecture question needs this convention stated.
- Changing origin alters position vectors but not P→Q displacement. Q uses the B
  component controls. Normalizing at the origin is explicitly undefined.
- Differential area formulas describe **different face choices**, not a universal sum
  of unrelated face normals for one surface. Closed boundaries need outward signs;
  opposite box faces have opposite normals. Curvilinear differential boxes are local,
  unwrapped scale-factor cartoons, not exact finite spherical/cylindrical wedges.
- Gradient uses T=ax²+by²+cz². Its maximum unit-direction derivative is |grad T|.
  A zero gradient can be a saddle; it does not imply a maximum or minimum. The heatmap
  and arrows display a fixed-z slice, while numerical values retain all three dimensions.
- Divergence/curl/classification use smooth F=(ax−by,bx+ay,cz), giving div F=2a+c and
  curl F=(0,0,2b). The xy slice hides the cz component even though c contributes to
  full 3D divergence. Field-arrow lengths are compressed for readability. Moving dots
  are geometric guides, not integrated particle paths or a calibrated fluid simulation.
- Second-derivative example uses V=(x²y,xy²,z²). The displayed grad(div V), vector
  Laplacian and curl(curl V) satisfy the identity componentwise. Mixed-derivative
  identities require sufficient smoothness. Componentwise vector Laplacians are used
  in Cartesian coordinates, not blindly applied to varying curvilinear bases.
- Gradient theorem compares a straight and bent path in the global polynomial
  potential. Integrals are analytical and endpoint-dependent. Divergence theorem uses
  F=(ax,by,cz), a closed sphere and outward normals. The drawn circle is a sphere
  cross-section, not a 2D substitute for the volume integral.
- Stokes uses F=b(−y,x,0) on a disk. Normal +k is paired with CCW traversal viewed
  from +z; reversing normal and traversal reverses both integrals. Analytical equality
  is independently checked by numerical boundary integration in tests.
- Spherical convention is physics (r,θ,φ): θ from +z, φ from +x toward +y. Some texts
  exchange the angle letters. The inverse uses atan2(y,x), not atan(y/x); azimuth is
  undefined on the axis and polar angle is undefined at the origin.
- Spherical/cylindrical local bases are normalized, orthogonal and right-handed.
  Vector components are dot products with local basis directions; reconstruction is
  tested. The basis changes with position, unlike Cartesian i/j/k. Drawing controls
  avoid singularities for unique local-basis views; inverse-coordinate views report
  singularities explicitly. Cylindrical ρ is not spherical r.
- Differential angular controls are converted from degrees to radians before forming
  physical edge lengths and Jacobians. Surface-area outputs list three separate face
  magnitudes; select the appropriate normal and sign for an actual surface.
- Curl-free fields are conservative under suitable domain/smoothness conditions, not
  unconditionally on arbitrary punctured domains. Vector-potential existence also has
  topological conditions. Divergence and curl do not uniquely determine a field without
  appropriate boundary/decay data: adding a constant vector is a simple counterexample.
- Uniform means spatially independent; steady/static means time independent. A scalar
  is harmonic if its Laplacian vanishes. Electrostatic E=−grad V uses the standard
  electric-potential sign. The models are mathematical examples, not Maxwell evolution,
  real charges, electrical apparatus or measured electromagnetic data.

Primary educational references (OpenStax and MIT) are linked in `content.js` and the
reader. Original lecture text is preserved; added qualifications are companion notes,
not attributed to the lecturer.

## Implementation and verification

Static HTML/CSS/JavaScript, Canvas projection and local PDF.js. Interface/playback
patterns reuse the Nuclear chapter, with independent content, controls and storage.
The layout stylesheet is copied from the same minimal reader design, not a dependency
on nuclear-specific calculations. Shared laboratory styles provide the PDF/panel shell;
this chapter remains under Electromagnetic Theory, not the Laboratories collection.

Storage keys:

- `study:electromagnetic-theory:vector-analysis:page`
- `study:electromagnetic-theory:vector-analysis:learning`

Scientific tests include coverage, dot/cross invariants, zero vectors, origin changes,
basis reconstruction, quadrants/singularities, independent finite-difference derivative
checks, second-derivative identities, numerical path/flux/circulation integrals and
degree-to-radian differential volume checks. Browser QA covers all 36 pages, all 24
sections, 16 exercises, predictions, saved notes, guide/review, mobile layouts, dragging,
step motion and direct navigation from another reader.

Original lecture ownership is retained. The PDF is excluded from the code's MIT
license; redistribution requires the relevant permissions.
