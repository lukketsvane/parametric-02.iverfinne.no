import * as THREE from "three"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"
import { mulberry32, type Params } from "./model"

/**
 * Deterministic geometry for the whole sculpture. Same params in, same
 * triangles out — every wobble comes from the seeded PRNG, so any design
 * is perfectly reproducible from its parameter values alone.
 *
 * The sculpture is returned as two merged geometries, one per glaze:
 * body (bottom segment + feet) and crown (top segment + apex). Either
 * may be null when that part has no surface.
 */
export type Built = {
  body: THREE.BufferGeometry | null
  crown: THREE.BufferGeometry | null
  /** bounding-sphere-ish fit for the camera: radius + center height */
  fit: { r: number; cy: number }
}

type Segment = {
  h: number
  rBase: number
  rMax: number
  belly: number
  rTop: number
  round: number
  footH?: number
  footR?: number
}

type Studs = {
  rings: number
  perRing: number
  shape: number // 0 cones · 1 spheres · between = alternate rings
  size: number
  aspect: number
  align: number // 0 horizontal · 1 surface normal
  bandLo: number
  bandHi: number
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Lathe profile radius at t ∈ [0,1] (bottom → top). */
function profileR(t: number, s: Segment): number {
  const footH = s.footH ?? 0
  const footR = s.footR ?? 0
  if (footH > 0.01 && footR > 0.01) {
    if (t < footH) {
      // straight flared foot: footR at the ground easing into the base
      const u = t / footH
      return footR + (s.rBase - footR) * (u * u * (3 - 2 * u))
    }
    t = (t - footH) / (1 - footH)
  }
  const { rBase, rMax, rTop, belly, round } = s
  // beyond round ≈ 2 the eased-power arcs blend toward true circular
  // arcs, so a segment can close as a genuine dome/ball instead of an
  // onion point (vertical tangents at the ends, flat at the belly)
  const w = Math.min(1, Math.max(0, (round - 2) / 1.4))
  if (t <= belly) {
    const u = belly <= 0 ? 1 : t / belly
    const pow = 1 - Math.pow(1 - u, round)
    const circ = Math.sqrt(Math.max(0, 1 - (1 - u) * (1 - u)))
    return rBase + (rMax - rBase) * ((1 - w) * pow + w * circ)
  }
  const u = belly >= 1 ? 0 : (t - belly) / (1 - belly)
  const pow = Math.pow(u, round)
  const circ = 1 - Math.sqrt(Math.max(0, 1 - u * u))
  return rMax + (rTop - rMax) * ((1 - w) * pow + w * circ)
}

/** Outward surface normal (radial, y) of the profile at t. */
function profileN(t: number, s: Segment): { nr: number; ny: number } {
  const e = 0.004
  const r0 = profileR(clamp01(t - e), s)
  const r1 = profileR(clamp01(t + e), s)
  const dr = (r1 - r0) / (2 * e) // d(radius)/dt
  // tangent (dr, h) → outward normal (h, -dr), normalised
  const len = Math.hypot(s.h, dr)
  return { nr: s.h / len, ny: -dr / len }
}

function latheFor(s: Segment, y0: number, radial: number): THREE.BufferGeometry {
  const N = 56
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, 0)]
  for (let i = 0; i <= N; i++) {
    const t = i / N
    pts.push(new THREE.Vector2(Math.max(0.001, profileR(t, s)), t * s.h))
  }
  // wide tops read as vessel mouths: dish the cap slightly inward.
  // narrow tops close to a point/dome and get a flat pinch instead.
  const rTopEdge = profileR(1, s)
  if (rTopEdge >= 0.09) {
    const dish = Math.min(0.05, s.h * 0.08)
    pts.push(new THREE.Vector2(rTopEdge * 0.72, s.h - dish * 0.6))
    pts.push(new THREE.Vector2(0.001, s.h - dish))
  } else {
    pts.push(new THREE.Vector2(0.001, s.h))
  }
  const g = new THREE.LatheGeometry(pts, radial)
  g.translate(0, y0, 0)
  return g
}

/** Stud instances for one segment, merged into a single geometry. */
function studsFor(
  s: Segment,
  st: Studs,
  y0: number,
  stagger: number,
  jitter: number,
  rnd: () => number,
  detail: number,
): THREE.BufferGeometry | null {
  const rings = Math.round(st.rings)
  const perRing = Math.round(st.perRing)
  if (rings < 1 || perRing < 1) return null

  const coneProto = new THREE.ConeGeometry(1, 1, 20 + detail * 8, 1)
  coneProto.translate(0, 0.5, 0) // grow from the surface
  const ballProto = new THREE.SphereGeometry(1, 24 + detail * 8, 18 + detail * 6)

  const parts: THREE.BufferGeometry[] = []
  const up = new THREE.Vector3(0, 1, 0)
  const q = new THREE.Quaternion()
  const m = new THREE.Matrix4()
  const pos = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const scl = new THREE.Vector3()

  for (let i = 0; i < rings; i++) {
    const t =
      rings === 1
        ? (st.bandLo + st.bandHi) / 2
        : st.bandLo + ((st.bandHi - st.bandLo) * i) / (rings - 1)
    const r = profileR(t, s)
    const y = y0 + t * s.h
    const n = profileN(t, s)
    const phase = ((i % 2) * stagger * Math.PI * 2) / perRing
    for (let j = 0; j < perRing; j++) {
      // pattern comes from the mix value: all cones, checkerboard,
      // alternating rows, or all balls
      const ball =
        st.shape <= 0.05
          ? false
          : st.shape >= 0.95
            ? true
            : st.shape < 0.5
              ? (i + j) % 2 === 1
              : i % 2 === 1
      const a = (j / perRing) * Math.PI * 2 + phase + (rnd() - 0.5) * 0.14 * jitter
      const wob = 1 + (rnd() - 0.5) * 2 * 0.5 * jitter
      const cosA = Math.cos(a)
      const sinA = Math.sin(a)
      // blend between horizontal-out and the true surface normal
      dir
        .set(
          cosA * ((1 - st.align) + st.align * n.nr),
          st.align * n.ny,
          sinA * ((1 - st.align) + st.align * n.nr),
        )
        .normalize()
      pos.set(cosA * r, y, sinA * r)
      q.setFromUnitVectors(up, dir)
      if (ball) {
        const rad = st.size * 1.1 * wob
        pos.addScaledVector(dir, rad * 0.5)
        scl.setScalar(rad)
        m.compose(pos, q, scl)
        parts.push(ballProto.clone().applyMatrix4(m))
      } else {
        const w = st.size * wob
        const len = st.size * st.aspect * wob
        pos.addScaledVector(dir, -w * 0.35) // root sunk into the wall
        scl.set(w, len, w)
        m.compose(pos, q, scl)
        parts.push(coneProto.clone().applyMatrix4(m))
      }
    }
  }
  coneProto.dispose()
  ballProto.dispose()
  if (parts.length === 0) return null
  const merged = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  return merged
}

export function buildSculpture(p: Params, hiDetail: boolean): Built {
  const detail = hiDetail ? 1 : 0
  const radial = hiDetail ? 128 : 88
  const rnd = mulberry32(p.seed)

  const segB: Segment = {
    h: p.hB, rBase: p.rBaseB, rMax: p.rMaxB, belly: p.bellyB,
    rTop: p.rTopB, round: p.roundB, footH: p.footH, footR: p.footR,
  }
  const studsB: Studs = {
    rings: p.ringsB, perRing: p.perRingB, shape: p.shapeB, size: p.sizeB,
    aspect: p.aspectB, align: p.alignB, bandLo: p.bandLoB, bandHi: p.bandHiB,
  }
  const segT: Segment = {
    h: p.hT, rBase: p.rBaseT, rMax: p.rMaxT, belly: p.bellyT,
    rTop: p.rTopT, round: p.roundT,
  }
  const studsT: Studs = {
    rings: p.ringsT, perRing: p.perRingT, shape: p.shapeT, size: p.sizeT,
    aspect: p.aspectT, align: p.alignT, bandLo: p.bandLoT, bandHi: p.bandHiT,
  }

  const feet = Math.round(p.feet)
  const lift = feet > 0 ? p.feetR * 1.2 : 0

  // ---- body: bottom segment + ball feet -------------------------------
  const bodyParts: THREE.BufferGeometry[] = [latheFor(segB, lift, radial)]
  const sB = studsFor(segB, studsB, lift, p.stagger, p.jitter, rnd, detail)
  if (sB) bodyParts.push(sB)
  if (feet > 0) {
    const baseR = profileR(0.02, segB)
    const ringR = Math.max(baseR * 0.62, baseR - p.feetR * 0.6)
    for (let i = 0; i < feet; i++) {
      const a = (i / feet) * Math.PI * 2 + Math.PI / feet
      const foot = new THREE.SphereGeometry(p.feetR, 18 + detail * 8, 14 + detail * 6)
      foot.translate(Math.cos(a) * ringR, p.feetR, Math.sin(a) * ringR)
      bodyParts.push(foot)
    }
  }
  const body = mergeGeometries(bodyParts, false)
  for (const g of bodyParts) g.dispose()

  // ---- crown: top segment + apex ornament ------------------------------
  const hasTop = p.hT > 0.03
  const embed = 0.05
  const yTop = lift + p.hB - embed
  const crownParts: THREE.BufferGeometry[] = []
  if (hasTop) {
    crownParts.push(latheFor(segT, yTop, radial))
    const sT = studsFor(segT, studsT, yTop, p.stagger, p.jitter, rnd, detail)
    if (sT) crownParts.push(sT)
  }
  const apexType = Math.round(p.apexType)
  if (apexType > 0) {
    const yA = hasTop ? yTop + p.hT - 0.02 : lift + p.hB - 0.02
    if (apexType === 1) {
      const spike = new THREE.ConeGeometry(p.apexR * 2, p.apexH, 22 + detail * 10, 1)
      spike.translate(0, yA + p.apexH / 2 - 0.01, 0)
      crownParts.push(spike)
    } else {
      const ball = new THREE.SphereGeometry(p.apexR, 22 + detail * 10, 16 + detail * 8)
      ball.translate(0, yA + p.apexR * 0.72, 0)
      crownParts.push(ball)
    }
  }
  const crown = crownParts.length ? mergeGeometries(crownParts, false) : null
  if (crown) for (const g of crownParts) g.dispose()

  // ---- camera fit -------------------------------------------------------
  const reachB = p.ringsB >= 1 ? Math.max(p.sizeB * p.aspectB, p.sizeB * 1.35) : 0
  const reachT = hasTop && p.ringsT >= 1 ? Math.max(p.sizeT * p.aspectT, p.sizeT * 1.35) : 0
  const w =
    2 *
    Math.max(
      p.rMaxB + reachB,
      p.footR,
      hasTop ? p.rMaxT + reachT : 0,
    )
  const h =
    lift +
    p.hB +
    (hasTop ? p.hT - embed : 0) +
    (apexType === 1 ? p.apexH - 0.03 : apexType === 2 ? p.apexR * 1.7 : 0)
  return { body, crown, fit: { r: Math.hypot(w, h) / 2, cy: h / 2 } }
}
