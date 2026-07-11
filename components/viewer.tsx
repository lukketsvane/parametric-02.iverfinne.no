"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import type { Params } from "@/lib/model"
import type { PrintParams } from "@/lib/print-model"
import { Sculpture } from "./sculpture"
import { PrintSculpture } from "./print-sculpture"
import { GestureParams, type NudgeAxis } from "./gesture-params"

export type Engine = "clay" | "print"

/**
 * Frame the piece whenever its size changes meaningfully: tall or wide
 * designs used to overflow the fixed camera. The view direction the user
 * chose is preserved — only the distance and target height adapt.
 */
function FitCamera({ fit }: { fit: { r: number; cy: number } | null }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as
    | { target: THREE.Vector3; update?: () => void }
    | null
  const invalidate = useThree((s) => s.invalidate)
  const lastR = useRef(0)
  useEffect(() => {
    if (!fit || !controls) return
    if (lastR.current && Math.abs(fit.r - lastR.current) / lastR.current < 0.12) return
    lastR.current = fit.r
    // the sculpture is grounded at y=0 inside a group at y=-0.85
    const ty = Math.min(1.2, Math.max(-0.05, fit.cy - 0.85 + 0.12))
    controls.target.set(0, ty, 0)
    // frame against the tighter field of view — portrait screens clip
    // horizontally long before the vertical fov does
    const persp = camera as THREE.PerspectiveCamera
    const vHalf = ((persp.fov ?? 32) * Math.PI) / 360
    const hHalf = Math.atan(Math.tan(vHalf) * (persp.aspect || 1))
    const dist = Math.min(
      15,
      Math.max(3.2, (fit.r * 1.18) / Math.tan(Math.min(vHalf, hHalf))),
    )
    const dir = camera.position.clone().sub(controls.target)
    if (dir.lengthSq() < 1e-6) dir.set(2.6, 1.85, 6.6)
    camera.position.copy(controls.target).add(dir.setLength(dist))
    controls.update?.()
    invalidate()
  }, [fit, controls, camera, invalidate])
  return null
}

export type LightDir = { az: number; el: number }

/**
 * Hands the parent a snapshot function: force one render (the loop is
 * demand-driven, so the drawing buffer may be stale) and downscale the
 * center of the frame into a small thumbnail for the shelf.
 */
function CaptureBridge({
  onReady,
}: {
  onReady: (fn: () => string | null) => void
}) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    onReady(() => {
      try {
        gl.render(scene, camera)
        const src = gl.domElement
        const side = Math.min(src.width, src.height)
        const c = document.createElement("canvas")
        c.width = 96
        c.height = 96
        const ctx = c.getContext("2d")
        if (!ctx) return null
        ctx.drawImage(
          src,
          (src.width - side) / 2,
          (src.height - side) / 2,
          side,
          side,
          0,
          0,
          96,
          96,
        )
        return c.toDataURL("image/webp", 0.82)
      } catch {
        return null
      }
    })
  }, [gl, scene, camera, onReady])
  return null
}

export function Viewer({
  engine,
  params,
  printParams,
  dark,
  hiDetail,
  mobile,
  light,
  onNudge,
  onLight,
  onCaptureReady,
}: {
  engine: Engine
  params: Params
  printParams: PrintParams
  dark: boolean
  hiDetail: boolean
  mobile: boolean
  light: LightDir
  onNudge: (axis: NudgeAxis, deltaPx: number) => void
  onLight: (dxPx: number, dyPx: number) => void
  onCaptureReady?: (fn: () => string | null) => void
}) {
  const bg = dark ? "#000000" : "#ffffff"
  const shadow = hiDetail ? 2048 : 1024
  // the steerable key light rides a fixed-radius dome around the piece
  const lightPos = useMemo<[number, number, number]>(() => {
    const R = 8.6
    const h = R * Math.cos(light.el)
    return [h * Math.cos(light.az), R * Math.sin(light.el), h * Math.sin(light.az)]
  }, [light])
  // measured size of the current sculpture, reported after each rebuild
  const [fit, setFit] = useState<{ r: number; cy: number } | null>(null)
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={hiDetail ? [1, 3] : [1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [2.6, 2.2, 6.6], fov: 32 }}
      className="touch-none"
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 14, 34]} />

      {/* pure directional lighting — no ambient, no environment map.
          One steerable key that casts the single hard shadow, plus two
          fixed dim fills so unlit faces don't collapse to black. */}
      <directionalLight
        key={shadow}
        position={lightPos}
        intensity={2.1}
        castShadow
        shadow-mapSize={[shadow, shadow]}
        shadow-bias={-0.0002}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
      />
      <directionalLight position={[-6, 3, -2]} intensity={0.5} />
      <directionalLight position={[2, 1.5, 7]} intensity={0.35} />

      <Suspense fallback={null}>
        <group position={[0, -0.85, 0]}>
          {engine === "print" ? (
            <PrintSculpture
              params={printParams}
              hiDetail={hiDetail}
              onFit={(r, cy) => setFit({ r, cy })}
            />
          ) : (
            <Sculpture
              params={params}
              hiDetail={hiDetail}
              onFit={(r, cy) => setFit({ r, cy })}
            />
          )}
          {/* ground: an invisible plane that only receives the hard cast
              shadow — light mode only, dark mode floats the piece in the
              void. No soft contact blob: one light, one shadow. */}
          {!dark && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <shadowMaterial transparent opacity={0.22} />
            </mesh>
          )}
        </group>
      </Suspense>

      <FitCamera fit={fit} />
      {onCaptureReady && <CaptureBridge onReady={onCaptureReady} />}
      <GestureParams onNudge={onNudge} onLight={onLight} />
      <OrbitControls
        target={[0, 0.35, 0]}
        enablePan={false}
        enableZoom
        minDistance={2.6}
        maxDistance={16}
        enableRotate
        rotateSpeed={0.9}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 + 0.35}
        makeDefault
      />
    </Canvas>
  )
}
