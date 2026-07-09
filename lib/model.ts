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
  | "gloss"
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
  gloss: { min: 0, max: 1, step: 0.05 }, // 0 dry satin · 1 wet glaze
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
      { key: "gloss", label: "gloss" },
    ],
  },
]

/**
 * Glaze pairings lifted from the reference pieces. These are the only
 * "presets" the UI offers — pure color/material choices. The form always
 * comes from the sliders; a combo never touches a geometry parameter.
 */
export const COMBOS: { name: string; glazeB: number; glazeT: number }[] = [
  { name: "chartreuse", glazeB: 4, glazeT: 2 },
  { name: "butter", glazeB: 5, glazeT: 0 },
  { name: "nude", glazeB: 6, glazeT: 6 },
  { name: "caramel", glazeB: 9, glazeT: 1 },
  { name: "rose", glazeB: 8, glazeT: 11 },
  { name: "sky", glazeB: 11, glazeT: 10 },
  { name: "coral", glazeB: 13, glazeT: 7 },
  { name: "petrol", glazeB: 12, glazeT: 12 },
  { name: "porcelain", glazeB: 0, glazeT: 3 },
  { name: "chalk", glazeB: 0, glazeT: 0 },
]

/** Two-finger scroll on the canvas sweeps these parameters. */
export const NUDGE_PARAMS: Record<"vertical" | "horizontal", ParamKey> = {
  vertical: "rMaxB",
  horizontal: "sizeB",
}

export const DEFAULT_PARAMS: Params = {
  seed: 7,
  hB: 1.05, footH: 0, footR: 0, rBaseB: 0.3, rMaxB: 0.72, bellyB: 0.55, rTopB: 0.26, roundB: 2.2,
  ringsB: 10, perRingB: 16, shapeB: 0, sizeB: 0.07, aspectB: 2.8, alignB: 1, bandLoB: 0.05, bandHiB: 0.97,
  hT: 0.9, rBaseT: 0.32, rMaxT: 0.32, bellyT: 0.05, rTopT: 0.08, roundT: 1,
  ringsT: 5, perRingT: 4, shapeT: 0, sizeT: 0.055, aspectT: 5.6, alignT: 0, bandLoT: 0.14, bandHiT: 0.88,
  apexType: 1, apexH: 0.34, apexR: 0.05, feet: 0, feetR: 0.12,
  stagger: 0.5, jitter: 0.1, gloss: 1, glazeB: 4, glazeT: 2,
}

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
    gloss: rnd() < 0.75 ? 1 : pick("gloss", 0.05, 0.4),
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
