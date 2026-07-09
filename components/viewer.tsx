"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { Environment, Lightformer, OrbitControls } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import type { Params } from "@/lib/model"
import { Sculpture } from "./sculpture"
import { GestureParams, type NudgeAxis } from "./gesture-params"

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

export function Viewer({
  params,
  dark,
  hiDetail,
  mobile,
  light,
  onNudge,
  onLight,
}: {
  params: Params
  dark: boolean
  hiDetail: boolean
  mobile: boolean
  light: LightDir
  onNudge: (axis: NudgeAxis, deltaPx: number) => void
  onLight: (dxPx: number, dyPx: number) => void
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

      <ambientLight intensity={0.35} />
      <directionalLight
        key={shadow}
        position={lightPos}
        intensity={1.2}
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
      <directionalLight position={[-6, 3, -2]} intensity={0.35} />

      <Suspense fallback={null}>
        <group position={[0, -0.85, 0]}>
          <Sculpture
            params={params}
            hiDetail={hiDetail}
            onFit={(r, cy) => setFit({ r, cy })}
          />
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
        {/* local softbox studio — no remote HDR fetch. The tall window
            card gives the glaze its long vertical highlight, like the
            gallery shots. */}
        <Environment resolution={256} environmentIntensity={1}>
          <color attach="background" args={["#9a9a9a"]} />
          <Lightformer
            form="rect"
            intensity={3}
            position={[0, 6, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[9, 7, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.8}
            position={[-6, 2, 3]}
            rotation={[0, Math.PI / 2.4, 0]}
            scale={[2.2, 4.6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.1}
            position={[6, 1.4, -2.5]}
            rotation={[0, -Math.PI / 2.2, 0]}
            scale={[5, 2.6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.7}
            position={[0, 1, 6]}
            rotation={[0, Math.PI, 0]}
            scale={[7, 1.8, 1]}
          />
        </Environment>
      </Suspense>

      <FitCamera fit={fit} />
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
