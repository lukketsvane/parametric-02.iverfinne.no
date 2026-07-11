"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  DEFAULT_PARAMS,
  NUDGE_PARAMS,
  PARAM_RANGES,
  clampParams,
  designName,
  type KeptPiece,
  type Params,
} from "@/lib/model"
import { Viewer, type LightDir } from "./viewer"
import { ControlsPanel } from "./controls-panel"
import type { NudgeAxis } from "./gesture-params"

// pixels of two-finger scroll to sweep a parameter's full range
const NUDGE_RANGE_PX = 420

// the visitor's kiln shelf, persisted across visits
const SHELF_KEY = "p02.shelf.v1"
const SHELF_MAX = 12

// follow the system color scheme only — no in-app toggle
function useSystemDark() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const sync = () => setDark(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return dark
}

// desktop = fine pointer + roomy viewport; only there do we offer max detail
function useIsDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px)")
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return desktop
}

export function Studio() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS)
  const [hiDetail, setHiDetail] = useState(false)
  const [mounted, setMounted] = useState(false)
  // key-light direction, steered by a three-finger drag on the canvas
  const [light, setLight] = useState<LightDir>({ az: 0.64, el: 0.95 })
  const dark = useSystemDark()
  const isDesktop = useIsDesktop()

  // avoid SSR of the WebGL canvas; restore a shared design from the URL.
  // The hash is untrusted input — every field is validated and clamped so
  // no crafted URL can push NaN or hostile values into the model.
  useEffect(() => {
    setMounted(true)
    try {
      const h = window.location.hash.slice(1)
      if (h.startsWith("p=")) {
        const obj = JSON.parse(decodeURIComponent(h.slice(2)))
        setParams((prev) => clampParams(obj, prev) ?? prev)
      }
    } catch {
      // malformed hash — ignore
    }
  }, [])

  // ---- the shelf: pieces the visitor kept, remembered across visits ----
  const captureRef = useRef<(() => string | null) | null>(null)
  const [shelf, setShelf] = useState<KeptPiece[]>([])
  const [shelfReady, setShelfReady] = useState(false)

  // hydrate from storage; stored params are as untrusted as a URL hash
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SHELF_KEY)
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const kept: KeptPiece[] = []
          for (const it of list.slice(0, SHELF_MAX)) {
            const p = clampParams(it?.params, DEFAULT_PARAMS)
            if (
              p &&
              typeof it.id === "number" &&
              typeof it.thumb === "string" &&
              it.thumb.startsWith("data:image/")
            ) {
              kept.push({ id: it.id, name: designName(p), thumb: it.thumb, params: p })
            }
          }
          setShelf(kept)
        }
      }
    } catch {
      // unreadable shelf — start empty
    }
    setShelfReady(true)
  }, [])

  useEffect(() => {
    if (!shelfReady) return
    try {
      window.localStorage.setItem(SHELF_KEY, JSON.stringify(shelf))
    } catch {
      // storage full or blocked — the shelf just won't persist
    }
  }, [shelf, shelfReady])

  const keep = useCallback(() => {
    const thumb = captureRef.current?.()
    if (!thumb) return
    const sig = JSON.stringify(params)
    setShelf((prev) => [
      { id: Date.now(), name: designName(params), thumb, params },
      ...prev.filter((k) => JSON.stringify(k.params) !== sig),
    ].slice(0, SHELF_MAX))
  }, [params])

  const loadKept = useCallback((k: KeptPiece) => setParams(k.params), [])
  const removeKept = useCallback(
    (id: number) => setShelf((prev) => prev.filter((k) => k.id !== id)),
    [],
  )

  // keep the URL shareable: it always encodes the current design exactly
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.history.replaceState(
        null,
        "",
        "#p=" + encodeURIComponent(JSON.stringify(params)),
      )
    }, 400)
    return () => window.clearTimeout(id)
  }, [params])

  // two-finger scroll sweeps whichever parameters the model mapped
  const nudge = useCallback((axis: NudgeAxis, deltaPx: number) => {
    const key = NUDGE_PARAMS[axis]
    if (key === undefined) return
    setParams((p) => {
      const r = PARAM_RANGES[key]
      const v = Math.min(
        r.max,
        Math.max(r.min, p[key] + (deltaPx / NUDGE_RANGE_PX) * (r.max - r.min)),
      )
      return { ...p, [key]: +v.toFixed(3) }
    })
  }, [])

  // three-finger drag orbits the key light around the piece — drag right
  // to swing it around, drag up to raise it. The camera stays put.
  const nudgeLight = useCallback((dxPx: number, dyPx: number) => {
    setLight((l) => ({
      az: l.az + dxPx * 0.012,
      el: Math.min(1.4, Math.max(0.12, l.el - dyPx * 0.008)),
    }))
  }, [])

  // never leave hi-detail on for a non-desktop client
  const detailOn = hiDetail && isDesktop

  return (
    <main className="fixed inset-0 overflow-hidden bg-white dark:bg-black">
      <div className="absolute inset-0">
        {mounted && (
          <Viewer
            params={params}
            dark={dark}
            hiDetail={detailOn}
            mobile={!isDesktop}
            light={light}
            onNudge={nudge}
            onLight={nudgeLight}
            onCaptureReady={(fn) => {
              captureRef.current = fn
            }}
          />
        )}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-end p-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <a
          href="https://iverfinne.no"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto text-[11px] tracking-wide text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
        >
          iverfinne.no
        </a>
      </header>

      <ControlsPanel
        params={params}
        isDesktop={isDesktop}
        hiDetail={hiDetail}
        shelf={shelf}
        onToggleDetail={() => setHiDetail((d) => !d)}
        onChange={setParams}
        onKeep={keep}
        onLoadKept={loadKept}
        onRemoveKept={removeKept}
      />
    </main>
  )
}
