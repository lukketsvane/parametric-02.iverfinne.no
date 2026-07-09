# parametric-02.iverfinne.no

A parametric ceramics studio. One generative model — a stack of two lathe
bodies studded with rings of spikes and bobbles, plus ball feet, apex
ornaments and a glaze palette — covers every reference piece; each design
is just a point in the shared parameter space (lib/model.ts, lib/build.ts).

Geometry is fully deterministic: all irregularity comes from a seeded
PRNG, so a design's parameter values (also encoded in the URL hash)
reproduce it bit-for-bit. The reference photographs live as parameter
points in lib/references.ts — regression fixtures, not UI presets. The
only presets the panel offers are glaze pairings and a gloss/satin
finish; form always comes from the sliders.

Lighting is pure directionals — no ambient or environment light — so
the steerable key light casts one hard shadow.

The UI shell (viewer stage, controls panel, gestures, shareable URL
state) comes from parametric-01.iverfinne.no. One-finger drag orbits,
pinch zooms, two-finger scroll sweeps model parameters, and a
three-finger drag steers the key light without moving the camera.
