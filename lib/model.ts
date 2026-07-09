/**
 * The sculpture model's public parameter space.
 *
 * One generative model covers every reference piece: a stack of two
 * bodies of revolution (bottom body + top crown), each defined by a
 * lathe profile (base / belly / top radii, belly height, roundness,
 * optional flared foot) and studded with rings of protrusions — cones
 * that read as spikes, spheres that read as bobbles, or alternating
 * rows of both. Ball feet, an apex ornament (spike or ball) and a
 * two-glaze ceramic palette complete the space. Every reference photo
 * is a single point in this space; the sliders move between them.
 *
 * This module is UI-facing and dependency-free. The geometry itself is
 * built in lib/build.ts and mounted by components/sculpture.tsx.
 */

export type ParamKey =
  // bottom body — form
  | "hB"
  | "footH"
  | "footR"
  | "rBaseB"
  | "rMaxB"
  | "bellyB"
  | "rTopB"
  | "roundB"
  // bottom body — studs
  | "ringsB"
  | "perRingB"
  | "shapeB"
  | "sizeB"
  | "aspectB"
  | "alignB"
  | "bandLoB"
  | "bandHiB"
  // top crown — form
  | "hT"
  | "rBaseT"
  | "rMaxT"
  | "bellyT"
  | "rTopT"
  | "roundT"
  // top crown — studs
  | "ringsT"
  | "perRingT"
  | "shapeT"
  | "sizeT"
  | "aspectT"
  | "alignT"
  | "bandLoT"
  | "bandHiT"
  // apex ornament + ball feet
  | "apexType"
  | "apexH"
  | "apexR"
  | "feet"
  | "feetR"
  // surface
  | "stagger"
  | "jitter"
  | "glazeB"
  | "glazeT"

export type ParamRange = { min: number; max: number; step: number }

export type Params = { seed: number } & Record<ParamKey, number>

export const PARAM_RANGES: Record<ParamKey, ParamRange> = {
  hB: { min: 0.3, max: 2.0, step: 0.01 },
  footH: { min: 0, max: 0.45, step: 0.01 },
  footR: { min: 0, max: 0.7, step: 0.01 },
  rBaseB: { min: 0.05, max: 0.8, step: 0.01 },
  rMaxB: { min: 0.1, max: 0.9, step: 0.01 },
  bellyB: { min: 0, max: 1, step: 0.01 },
  rTopB: { min: 0.02, max: 0.7, step: 0.01 },
  roundB: { min: 0.6, max: 3.5, step: 0.05 },

  ringsB: { min: 0, max: 14, step: 1 },
  perRingB: { min: 3, max: 20, step: 1 },
  shapeB: { min: 0, max: 1, step: 0.05 },
  sizeB: { min: 0.02, max: 0.2, step: 0.005 },
  aspectB: { min: 0.8, max: 6, step: 0.1 },
  alignB: { min: 0, max: 1, step: 0.05 },
  bandLoB: { min: 0, max: 0.6, step: 0.01 },
  bandHiB: { min: 0.3, max: 1, step: 0.01 },

  hT: { min: 0, max: 1.2, step: 0.01 },
  rBaseT: { min: 0.02, max: 0.5, step: 0.01 },
  rMaxT: { min: 0.02, max: 0.5, step: 0.01 },
  bellyT: { min: 0, max: 1, step: 0.01 },
  rTopT: { min: 0.01, max: 0.4, step: 0.01 },
  roundT: { min: 0.6, max: 3.5, step: 0.05 },

  ringsT: { min: 0, max: 8, step: 1 },
  perRingT: { min: 2, max: 20, step: 1 },
  shapeT: { min: 0, max: 1, step: 0.05 },
  sizeT: { min: 0.02, max: 0.2, step: 0.005 },
  aspectT: { min: 0.8, max: 6, step: 0.1 },
  alignT: { min: 0, max: 1, step: 0.05 },
  bandLoT: { min: 0, max: 0.7, step: 0.01 },
  bandHiT: { min: 0.2, max: 1, step: 0.01 },

  apexType: { min: 0, max: 2, step: 1 }, // 0 none · 1 spike · 2 ball
  apexH: { min: 0.05, max: 0.6, step: 0.01 },
  apexR: { min: 0.02, max: 0.16, step: 0.005 },
  feet: { min: 0, max: 8, step: 1 },
  feetR: { min: 0.08, max: 0.22, step: 0.005 },

  stagger: { min: 0, max: 1, step: 0.05 },
  jitter: { min: 0, max: 0.4, step: 0.01 },
  glazeB: { min: 0, max: 14, step: 1 },
  glazeT: { min: 0, max: 14, step: 1 },
}

/** Ceramic glaze palette sampled from the reference pieces. */
export const GLAZES: { name: string; hex: string }[] = [
  { name: "porcelain", hex: "#f1efe9" },
  { name: "cream", hex: "#e9e1d3" },
  { name: "fog", hex: "#c9c8d4" },
  { name: "ash", hex: "#98979d" },
  { name: "chartreuse", hex: "#d8d63e" },
  { name: "butter", hex: "#e6df8e" },
  { name: "nude", hex: "#d9b7a1" },
  { name: "blush", hex: "#eec5b8" },
  { name: "rose", hex: "#c49691" },
  { name: "caramel", hex: "#b9785a" },
  { name: "mauve", hex: "#a37b73" },
  { name: "sky", hex: "#7cc7dd" },
  { name: "petrol", hex: "#1d6e88" },
  { name: "coral", hex: "#de5a33" },
  { name: "noir", hex: "#2c2b2e" },
]

export const glazeHex = (i: number) =>
  GLAZES[Math.min(GLAZES.length - 1, Math.max(0, Math.round(i)))].hex

/** Slider layout for the full controls panel. */
export const SECTIONS: {
  title: string
  keys: { key: ParamKey; label: string }[]
}[] = [
  {
    title: "body · form",
    keys: [
      { key: "hB", label: "height" },
      { key: "footH", label: "foot h" },
      { key: "footR", label: "foot r" },
      { key: "rBaseB", label: "base" },
      { key: "rMaxB", label: "belly" },
      { key: "bellyB", label: "belly y" },
      { key: "rTopB", label: "top" },
      { key: "roundB", label: "round" },
    ],
  },
  {
    title: "body · studs",
    keys: [
      { key: "ringsB", label: "rings" },
      { key: "perRingB", label: "per ring" },
      { key: "shapeB", label: "pattern" },
      { key: "sizeB", label: "size" },
      { key: "aspectB", label: "length" },
      { key: "alignB", label: "align" },
      { key: "bandLoB", label: "from" },
      { key: "bandHiB", label: "to" },
    ],
  },
  {
    title: "crown · form",
    keys: [
      { key: "hT", label: "height" },
      { key: "rBaseT", label: "base" },
      { key: "rMaxT", label: "belly" },
      { key: "bellyT", label: "belly y" },
      { key: "rTopT", label: "top" },
      { key: "roundT", label: "round" },
    ],
  },
  {
    title: "crown · studs",
    keys: [
      { key: "ringsT", label: "rings" },
      { key: "perRingT", label: "per ring" },
      { key: "shapeT", label: "pattern" },
      { key: "sizeT", label: "size" },
      { key: "aspectT", label: "length" },
      { key: "alignT", label: "align" },
      { key: "bandLoT", label: "from" },
      { key: "bandHiT", label: "to" },
    ],
  },
  {
    title: "apex · feet",
    keys: [
      { key: "apexType", label: "apex" },
      { key: "apexH", label: "apex h" },
      { key: "apexR", label: "apex r" },
      { key: "feet", label: "feet" },
      { key: "feetR", label: "feet r" },
    ],
  },
  {
    title: "surface",
    keys: [
      { key: "stagger", label: "stagger" },
      { key: "jitter", label: "jitter" },
    ],
  },
]

/** Two-finger scroll on the canvas sweeps these parameters. */
export const NUDGE_PARAMS: Record<"vertical" | "horizontal", ParamKey> = {
  vertical: "rMaxB",
  horizontal: "sizeB",
}

/**
 * The reference pieces, each an exact point in the parameter space.
 * Loading one reproduces the same geometry bit-for-bit: the builder is
 * fully deterministic and all irregularity comes from the seeded PRNG.
 */
export const DESIGNS: { name: string; params: Params }[] = [
  {
    // chartreuse urn under a pale grey spiked tower (IMG_8647)
    name: "durian",
    params: {
      seed: 7,
      hB: 1.05, footH: 0, footR: 0, rBaseB: 0.3, rMaxB: 0.72, bellyB: 0.55, rTopB: 0.26, roundB: 2.2,
      ringsB: 10, perRingB: 16, shapeB: 0, sizeB: 0.07, aspectB: 2.8, alignB: 1, bandLoB: 0.05, bandHiB: 0.97,
      hT: 0.9, rBaseT: 0.32, rMaxT: 0.32, bellyT: 0.05, rTopT: 0.08, roundT: 1,
      ringsT: 5, perRingT: 4, shapeT: 0, sizeT: 0.055, aspectT: 5.6, alignT: 0, bandLoT: 0.14, bandHiT: 0.88,
      apexType: 1, apexH: 0.34, apexR: 0.05, feet: 0, feetR: 0.12,
      stagger: 0.5, jitter: 0.1, glazeB: 4, glazeT: 2,
    },
  },
  {
    // nude trunk ringed with bobbles and long thorns (IMG_8645 left)
    name: "totem",
    params: {
      seed: 3,
      hB: 1.85, footH: 0, footR: 0, rBaseB: 0.24, rMaxB: 0.4, bellyB: 0.8, rTopB: 0.18, roundB: 2.2,
      ringsB: 8, perRingB: 5, shapeB: 0.6, sizeB: 0.105, aspectB: 3.8, alignB: 0.25, bandLoB: 0.1, bandHiB: 0.95,
      hT: 0, rBaseT: 0.2, rMaxT: 0.2, bellyT: 0.5, rTopT: 0.15, roundT: 1,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.05, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 0, feetR: 0.12,
      stagger: 0.5, jitter: 0.18, glazeB: 6, glazeT: 6,
    },
  },
  {
    // petrol column of fin rings under a small chalice (IMG_8645 middle)
    name: "fins",
    params: {
      seed: 11,
      hB: 1.0, footH: 0, footR: 0, rBaseB: 0.15, rMaxB: 0.16, bellyB: 0.5, rTopB: 0.14, roundB: 1,
      ringsB: 9, perRingB: 12, shapeB: 0, sizeB: 0.036, aspectB: 5.2, alignB: 0, bandLoB: 0.04, bandHiB: 0.8,
      hT: 0.32, rBaseT: 0.08, rMaxT: 0.09, bellyT: 0.3, rTopT: 0.22, roundT: 1.9,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.04, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 0, feetR: 0.12,
      stagger: 0.5, jitter: 0.1, glazeB: 12, glazeT: 12,
    },
  },
  {
    // rose dome with thorns and bobble skirt, sky ball on top (IMG_8645 right)
    name: "sputnik",
    params: {
      seed: 5,
      hB: 0.72, footH: 0, footR: 0, rBaseB: 0.62, rMaxB: 0.66, bellyB: 0.15, rTopB: 0.16, roundB: 1.7,
      ringsB: 2, perRingB: 6, shapeB: 0, sizeB: 0.15, aspectB: 2.4, alignB: 0.9, bandLoB: 0.42, bandHiB: 0.78,
      hT: 0.62, rBaseT: 0.05, rMaxT: 0.33, bellyT: 0.5, rTopT: 0.03, roundT: 3.4,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.05, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 2, apexH: 0.1, apexR: 0.1, feet: 8, feetR: 0.155,
      stagger: 0.5, jitter: 0.05, glazeB: 8, glazeT: 11,
    },
  },
  {
    // white bell on ball feet under a grey studded drum (IMG_8646)
    name: "bell",
    params: {
      seed: 9,
      hB: 0.85, footH: 0, footR: 0, rBaseB: 0.68, rMaxB: 0.7, bellyB: 0.02, rTopB: 0.26, roundB: 0.85,
      ringsB: 7, perRingB: 14, shapeB: 0.35, sizeB: 0.065, aspectB: 2, alignB: 1, bandLoB: 0.04, bandHiB: 0.94,
      hT: 0.5, rBaseT: 0.26, rMaxT: 0.27, bellyT: 0.5, rTopT: 0.24, roundT: 1.2,
      ringsT: 3, perRingT: 11, shapeT: 0.35, sizeT: 0.048, aspectT: 1.6, alignT: 0.2, bandLoT: 0.25, bandHiT: 0.85,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 3, feetR: 0.18,
      stagger: 0.5, jitter: 0.14, glazeB: 0, glazeT: 3,
    },
  },
  {
    // sky totem with bobble tiers under a mauve head (IMG_7405)
    name: "doll",
    params: {
      seed: 4,
      hB: 1.0, footH: 0.3, footR: 0.42, rBaseB: 0.2, rMaxB: 0.48, bellyB: 0.3, rTopB: 0.15, roundB: 1.1,
      ringsB: 2, perRingB: 9, shapeB: 1, sizeB: 0.1, aspectB: 1, alignB: 0.35, bandLoB: 0.42, bandHiB: 0.72,
      hT: 0.5, rBaseT: 0.06, rMaxT: 0.26, bellyT: 0.5, rTopT: 0.03, roundT: 3.3,
      ringsT: 1, perRingT: 3, shapeT: 1, sizeT: 0.115, aspectT: 1, alignT: 0.05, bandLoT: 0.5, bandHiT: 0.58,
      apexType: 1, apexH: 0.42, apexR: 0.075, feet: 0, feetR: 0.12,
      stagger: 0.5, jitter: 0.04, glazeB: 11, glazeT: 10,
    },
  },
  {
    // coral thorn barrel under a blush spiked cone (IMG_8648)
    name: "cactus",
    params: {
      seed: 13,
      hB: 1.2, footH: 0, footR: 0, rBaseB: 0.42, rMaxB: 0.5, bellyB: 0.5, rTopB: 0.27, roundB: 1.4,
      ringsB: 13, perRingB: 15, shapeB: 0, sizeB: 0.058, aspectB: 2.6, alignB: 0.75, bandLoB: 0.02, bandHiB: 0.99,
      hT: 0.8, rBaseT: 0.36, rMaxT: 0.36, bellyT: 0.05, rTopT: 0.02, roundT: 1.1,
      ringsT: 4, perRingT: 15, shapeT: 0, sizeT: 0.05, aspectT: 2.4, alignT: 0.85, bandLoT: 0.02, bandHiT: 0.42,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 0, feetR: 0.12,
      stagger: 0, jitter: 0.12, glazeB: 13, glazeT: 7,
    },
  },
  {
    // butter urn in dense thorn columns under a white cone roof (IMG_8659)
    name: "spore",
    params: {
      seed: 21,
      hB: 1.15, footH: 0, footR: 0, rBaseB: 0.26, rMaxB: 0.6, bellyB: 0.5, rTopB: 0.18, roundB: 2.3,
      ringsB: 10, perRingB: 18, shapeB: 0, sizeB: 0.05, aspectB: 5, alignB: 1, bandLoB: 0.04, bandHiB: 0.92,
      hT: 0.62, rBaseT: 0.42, rMaxT: 0.42, bellyT: 0.03, rTopT: 0.02, roundT: 1,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.05, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 0, feetR: 0.12,
      stagger: 0, jitter: 0.08, glazeB: 5, glazeT: 0,
    },
  },
  {
    // caramel canister, big side bobbles, pearl ball lid, ball feet (IMG_8656)
    name: "bobble",
    params: {
      seed: 17,
      hB: 0.95, footH: 0, footR: 0, rBaseB: 0.4, rMaxB: 0.43, bellyB: 0.6, rTopB: 0.22, roundB: 2.6,
      ringsB: 3, perRingB: 4, shapeB: 1, sizeB: 0.13, aspectB: 1, alignB: 0.1, bandLoB: 0.25, bandHiB: 0.82,
      hT: 0.58, rBaseT: 0.07, rMaxT: 0.31, bellyT: 0.5, rTopT: 0.02, roundT: 3.4,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.05, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 4, feetR: 0.135,
      stagger: 0.5, jitter: 0.05, glazeB: 9, glazeT: 1,
    },
  },
  {
    // white pedestal, spiked sphere belly, trumpet neck (IMG_8654)
    name: "urchin",
    params: {
      seed: 19,
      hB: 0.95, footH: 0.24, footR: 0.3, rBaseB: 0.1, rMaxB: 0.4, bellyB: 0.5, rTopB: 0.1, roundB: 3.2,
      ringsB: 3, perRingB: 10, shapeB: 0, sizeB: 0.065, aspectB: 2, alignB: 1, bandLoB: 0.35, bandHiB: 0.8,
      hT: 0.55, rBaseT: 0.09, rMaxT: 0.1, bellyT: 0.2, rTopT: 0.28, roundT: 1.5,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.05, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 0, feetR: 0.12,
      stagger: 0.5, jitter: 0.1, glazeB: 0, glazeT: 0,
    },
  },
  {
    // matte-white open cylinder in horizontal thorn columns (IMG_8650)
    name: "spool",
    params: {
      seed: 23,
      hB: 1.05, footH: 0, footR: 0, rBaseB: 0.34, rMaxB: 0.35, bellyB: 0.5, rTopB: 0.33, roundB: 1,
      ringsB: 5, perRingB: 9, shapeB: 0, sizeB: 0.06, aspectB: 2.8, alignB: 0, bandLoB: 0.12, bandHiB: 0.88,
      hT: 0, rBaseT: 0.2, rMaxT: 0.2, bellyT: 0.5, rTopT: 0.15, roundT: 1,
      ringsT: 0, perRingT: 8, shapeT: 0, sizeT: 0.05, aspectT: 2, alignT: 0.5, bandLoT: 0.1, bandHiT: 0.9,
      apexType: 0, apexH: 0.2, apexR: 0.06, feet: 0, feetR: 0.12,
      stagger: 0, jitter: 0.08, glazeB: 0, glazeT: 0,
    },
  },
]

export const DEFAULT_PARAMS: Params = DESIGNS[0].params

/** Deterministic PRNG — the only source of "handmade" irregularity. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const randomSeed = () => Math.floor(Math.random() * 9000) + 1000

const quant = (v: number, r: ParamRange) => {
  const q = Math.round((v - r.min) / r.step) * r.step + r.min
  return +Math.min(r.max, Math.max(r.min, q)).toFixed(4)
}

/** A tasteful random point in the space — still fully seed-reproducible. */
export function randomizeParams(seed: number): Params {
  const rnd = mulberry32(seed * 2654435761)
  const pick = (k: ParamKey, lo = 0, hi = 1) => {
    const r = PARAM_RANGES[k]
    const span = r.max - r.min
    return quant(r.min + span * (lo + (hi - lo) * rnd()), r)
  }
  const p: Params = {
    seed,
    hB: pick("hB", 0.25, 0.85),
    footH: rnd() < 0.25 ? pick("footH", 0.4, 0.9) : 0,
    footR: pick("footR", 0.45, 0.8),
    rBaseB: pick("rBaseB", 0.2, 0.8),
    rMaxB: pick("rMaxB", 0.35, 0.85),
    bellyB: pick("bellyB", 0.1, 0.9),
    rTopB: pick("rTopB", 0.1, 0.6),
    roundB: pick("roundB", 0.2, 0.85),
    ringsB: pick("ringsB", 0.15, 0.95),
    perRingB: pick("perRingB", 0.2, 0.9),
    shapeB: rnd() < 0.5 ? (rnd() < 0.6 ? 0 : 1) : pick("shapeB"),
    sizeB: pick("sizeB", 0.2, 0.8),
    aspectB: pick("aspectB", 0.15, 0.75),
    alignB: pick("alignB"),
    bandLoB: pick("bandLoB", 0, 0.5),
    bandHiB: pick("bandHiB", 0.6, 1),
    hT: rnd() < 0.8 ? pick("hT", 0.25, 0.9) : 0,
    rBaseT: pick("rBaseT", 0.1, 0.7),
    rMaxT: pick("rMaxT", 0.2, 0.8),
    bellyT: pick("bellyT", 0.1, 0.9),
    rTopT: pick("rTopT", 0, 0.5),
    roundT: pick("roundT", 0.2, 0.85),
    ringsT: pick("ringsT", 0, 0.8),
    perRingT: pick("perRingT", 0.1, 0.8),
    shapeT: rnd() < 0.5 ? (rnd() < 0.6 ? 0 : 1) : pick("shapeT"),
    sizeT: pick("sizeT", 0.2, 0.8),
    aspectT: pick("aspectT", 0.15, 0.75),
    alignT: pick("alignT"),
    bandLoT: pick("bandLoT", 0, 0.5),
    bandHiT: pick("bandHiT", 0.5, 1),
    apexType: pick("apexType"),
    apexH: pick("apexH", 0.2, 0.8),
    apexR: pick("apexR", 0.2, 0.8),
    feet: rnd() < 0.35 ? pick("feet", 0.35, 1) : 0,
    feetR: pick("feetR", 0.3, 0.9),
    stagger: rnd() < 0.7 ? 0.5 : pick("stagger"),
    jitter: pick("jitter", 0.1, 0.6),
    glazeB: pick("glazeB"),
    glazeT: pick("glazeT"),
  }
  // keep the silhouette sane: belly is the widest ring of the body
  p.rMaxB = Math.max(p.rMaxB, p.rBaseB + 0.05, p.rTopB + 0.05)
  if (p.bandHiB - p.bandLoB < 0.15) p.bandHiB = quant(p.bandLoB + 0.3, PARAM_RANGES.bandHiB)
  if (p.bandHiT - p.bandLoT < 0.1) p.bandHiT = quant(p.bandLoT + 0.25, PARAM_RANGES.bandHiT)
  // two glazes that actually differ
  if (p.glazeT === p.glazeB) p.glazeT = (p.glazeB + 3) % GLAZES.length
  return p
}
