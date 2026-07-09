"use client"

import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { buildSculpture } from "@/lib/build"
import { glazeHex, type Params } from "@/lib/model"

/**
 * Mounts the deterministic sculpture geometry with its two ceramic
 * glazes. Rebuilds are cheap (lathe + merged primitives), so geometry is
 * derived synchronously from params — no worker, no async gap.
 */
export function Sculpture({
  params,
  hiDetail,
  onFit,
}: {
  params: Params
  hiDetail: boolean
  onFit?: (radius: number, centerY: number) => void
}) {
  const invalidate = useThree((s) => s.invalidate)

  const built = useMemo(
    () => buildSculpture(params, hiDetail),
    [params, hiDetail],
  )

  // hand back the measured size so the camera can frame the piece,
  // and dispose geometries when they are replaced
  useEffect(() => {
    onFit?.(built.fit.r, built.fit.cy)
    invalidate()
    return () => {
      built.body?.dispose()
      built.crown?.dispose()
    }
  }, [built, onFit, invalidate])

  // high-gloss slip-cast ceramic: deep clearcoat over a barely rough body
  const glaze = (hex: string) => (
    <meshPhysicalMaterial
      color={hex}
      roughness={0.09}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.04}
      envMapIntensity={1.15}
    />
  )

  return (
    <group>
      {built.body && (
        <mesh geometry={built.body} castShadow receiveShadow>
          {glaze(glazeHex(params.glazeB))}
        </mesh>
      )}
      {built.crown && (
        <mesh geometry={built.crown} castShadow receiveShadow>
          {glaze(glazeHex(params.glazeT))}
        </mesh>
      )}
    </group>
  )
}
