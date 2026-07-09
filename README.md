# parametric-02.iverfinne.no

A parametric ceramics studio. One generative model — a stack of two lathe
bodies studded with rings of spikes and bobbles, plus ball feet, apex
ornaments and a glaze palette — covers every reference piece; each design
is just a point in the shared parameter space (lib/model.ts, lib/build.ts).

Geometry is fully deterministic: all irregularity comes from a seeded
PRNG, so a design's parameter values (also encoded in the URL hash)
reproduce it bit-for-bit. The built-in designs in lib/model.ts each
reproduce one of the reference photographs.

The UI shell (viewer stage, controls panel, gestures, shareable URL
state) comes from parametric-01.iverfinne.no. One-finger drag orbits,
pinch zooms, two-finger scroll sweeps model parameters, and a
three-finger drag steers the key light without moving the camera.
