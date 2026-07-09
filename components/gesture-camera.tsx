"use client"

import { useEffect } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

/**
 * Two-finger pinch on touch devices → camera zoom. OrbitControls is paused
 * while two fingers are down, so the dolly is handled here. One-finger
 * rotate stays with OrbitControls.
 *
 * In parametric-01 the other two-finger axes (vertical / horizontal scroll)
 * nudged engine parameters; that hook was removed with the generator and
 * can be reattached here when this project grows its own.
 */
export function GestureCamera() {
  const gl = useThree((s) => s.gl)
  const controls = useThree((s) => s.controls) as {
    enabled: boolean
    target?: THREE.Vector3
  } | null
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    const el = gl.domElement
    const pts = new Map<number, { x: number; y: number }>()
    let last = { d: 0 }

    const measure = () => {
      const [a, b] = [...pts.values()]
      return { d: Math.hypot(a.x - b.x, a.y - b.y) }
    }

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size === 2) {
        last = measure()
        if (controls) controls.enabled = false
      }
    }

    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size !== 2) return
      const c = measure()
      if (last.d > 0 && c.d > 0) {
        // dolly around the current orbit target
        const target = controls?.target?.clone() ?? new THREE.Vector3(0, 0.35, 0)
        const offset = camera.position.clone().sub(target)
        const dist = THREE.MathUtils.clamp(
          offset.length() * (last.d / c.d),
          2.6,
          16,
        )
        camera.position.copy(target).add(offset.setLength(dist))
        invalidate()
      }
      last = c
    }

    const up = (e: PointerEvent) => {
      if (!pts.delete(e.pointerId)) return
      // hand control back only when the gesture fully ends
      if (pts.size === 0 && controls) controls.enabled = true
    }

    el.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      el.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (controls) controls.enabled = true
    }
  }, [gl, controls, camera, invalidate])

  return null
}
