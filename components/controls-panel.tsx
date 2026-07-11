"use client"

import { useState } from "react"
import {
  Shuffle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  COMBOS,
  GLAZES,
  PARAM_RANGES,
  SECTIONS,
  dailySeed,
  designName,
  randomizeParams,
  randomSeed,
  type ParamKey,
  type Params,
} from "@/lib/model"

// monochrome controls — solid black/white ink, thin subtle hairline outlines
const HAIR = "border-black/15 dark:border-white/20"
const ICON_BTN =
  `flex h-10 w-10 items-center justify-center rounded-full border ${HAIR} text-black transition active:scale-95 dark:text-white`
const ICON_BTN_SOLID =
  "flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition active:scale-95 dark:bg-white dark:text-black"

function chipClass(active: boolean) {
  return `min-h-[32px] rounded-full border px-3 text-[11px] font-medium capitalize transition active:scale-95 ${
    active
      ? "border-transparent bg-black text-white dark:bg-white dark:text-black"
      : `${HAIR} text-black dark:text-white`
  }`
}

function Row({
  label,
  value,
  range,
  locked,
  onChange,
  onToggleLock,
}: {
  label: string
  value: number
  range: { min: number; max: number; step: number }
  locked: boolean
  onChange: (v: number) => void
  onToggleLock: () => void
}) {
  const isInt = range.step >= 1
  return (
    <div
      className={`flex items-center gap-3 py-1.5 transition-opacity ${
        locked ? "opacity-30" : ""
      }`}
    >
      {/* tap the label to lock this value against shuffle */}
      <button
        onClick={onToggleLock}
        aria-pressed={locked}
        title={locked ? "Locked — tap to let shuffle change it" : "Tap to lock against shuffle"}
        className="w-20 shrink-0 text-left text-[11px] uppercase tracking-widest text-black dark:text-white"
      >
        {label}
      </button>
      <input
        type="range"
        className="pslider flex-1"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
      />
      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-black dark:text-white">
        {isInt ? value : value.toFixed(2)}
      </span>
    </div>
  )
}

function GlazeRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-20 shrink-0 text-[11px] uppercase tracking-widest text-black dark:text-white">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {GLAZES.map((g, i) => (
          <button
            key={g.name}
            onClick={() => onChange(i)}
            aria-label={`${label}: ${g.name}`}
            aria-pressed={i === Math.round(value)}
            title={g.name}
            className={`h-6 w-6 rounded-full border transition active:scale-90 ${
              i === Math.round(value)
                ? "border-black ring-1 ring-black dark:border-white dark:ring-white"
                : HAIR
            }`}
            style={{ backgroundColor: g.hex }}
          />
        ))}
      </div>
    </div>
  )
}

export function ControlsPanel({
  params,
  isDesktop,
  hiDetail,
  onToggleDetail,
  onChange,
}: {
  params: Params
  isDesktop: boolean
  hiDetail: boolean
  onToggleDetail: () => void
  onChange: (p: Params) => void
}) {
  // collapsed → half (designs, glazes) → full (every parameter)
  const [mode, setMode] = useState<"collapsed" | "half" | "full">("collapsed")
  const open = mode !== "collapsed"
  // tapped-locked parameters survive shuffle untouched
  const [locked, setLocked] = useState<ReadonlySet<ParamKey>>(new Set())

  const set = (patch: Partial<Params>) => onChange({ ...params, ...patch })

  const toggleLock = (key: ParamKey) =>
    setLocked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const shuffle = () => {
    const next = randomizeParams(randomSeed())
    for (const k of locked) next[k] = params[k]
    onChange(next)
  }

  // a combo chip is lit while both glazes still match its pairing
  const activeCombo = COMBOS.find(
    (c) =>
      Math.round(params.glazeB) === c.glazeB &&
      Math.round(params.glazeT) === c.glazeT,
  )?.name

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className={`pointer-events-auto w-full max-w-md rounded-3xl border ${HAIR} bg-white dark:bg-black`}>
        {/* header row — every piece introduces itself by name */}
        <div className="flex items-center gap-1.5 p-2.5">
          <span className="pl-2 text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60">
            {designName(params)}
          </span>
          <span className="px-1 text-[11px] tabular-nums tracking-widest text-black/40 dark:text-white/40">
            {params.seed}
          </span>

          <div className="flex-1" />

          <button
            onClick={shuffle}
            aria-label="Randomize design"
            className={ICON_BTN_SOLID}
          >
            <Shuffle className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setMode(open ? "collapsed" : "half")}
            aria-label={open ? "Hide controls" : "Show controls"}
            aria-expanded={open}
            className={ICON_BTN}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
            ) : (
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />
            )}
          </button>
        </div>

        {/* expandable body */}
        {open && (
          <div className="max-h-[56vh] overflow-y-auto px-4 pb-4">
            {/* glaze pairings — color only, the form never changes */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {COMBOS.map(({ name, glazeB, glazeT }) => (
                <button
                  key={name}
                  onClick={() => set({ glazeB, glazeT })}
                  className={`${chipClass(activeCombo === name)} flex items-center gap-1.5`}
                  title={`${GLAZES[glazeB].name} body · ${GLAZES[glazeT].name} crown`}
                >
                  <span className="flex -space-x-1">
                    <span
                      className="h-3 w-3 rounded-full border border-black/20 dark:border-white/25"
                      style={{ backgroundColor: GLAZES[glazeB].hex }}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-black/20 dark:border-white/25"
                      style={{ backgroundColor: GLAZES[glazeT].hex }}
                    />
                  </span>
                  {name}
                </button>
              ))}
            </div>

            {/* material: wet glaze or dry satin */}
            <div className="mb-1 flex items-center gap-3 py-1.5">
              <span className="w-20 shrink-0 text-[11px] uppercase tracking-widest text-black dark:text-white">
                finish
              </span>
              <div className="flex flex-1 flex-wrap gap-1.5">
                <button
                  onClick={() => set({ gloss: 1 })}
                  className={chipClass(params.gloss >= 0.7)}
                >
                  gloss
                </button>
                <button
                  onClick={() => set({ gloss: 0.15 })}
                  className={chipClass(params.gloss < 0.7)}
                >
                  satin
                </button>
              </div>
            </div>

            <GlazeRow
              label="body"
              value={params.glazeB}
              onChange={(i) => set({ glazeB: i })}
            />
            <GlazeRow
              label="crown"
              value={params.glazeT}
              onChange={(i) => set({ glazeT: i })}
            />

            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => set({ seed: randomSeed() })}
                className={chipClass(false)}
                title="New seed, same parameters — a different throw of this form"
              >
                reseed
              </button>
              <button
                onClick={() => onChange(randomizeParams(dailySeed()))}
                className={chipClass(params.seed === dailySeed())}
                title="Today's firing — everyone gets this same piece today"
              >
                today
              </button>
            </div>

            {isDesktop && (
              <button
                onClick={onToggleDetail}
                role="switch"
                aria-checked={hiDetail}
                className={`my-3 flex w-full items-center justify-between rounded-2xl border ${HAIR} px-3 py-2 transition active:scale-[0.99]`}
              >
                <span className="text-[11px] uppercase tracking-widest text-black dark:text-white">
                  Max detail
                </span>
                <span
                  className={`relative h-5 w-9 rounded-full border ${HAIR} transition ${
                    hiDetail ? "bg-black dark:bg-white" : "bg-transparent"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
                      hiDetail
                        ? "left-[18px] bg-white dark:bg-black"
                        : "left-0.5 bg-black dark:bg-white"
                    }`}
                  />
                </span>
              </button>
            )}

            {/* half ↔ full: every parameter lives behind this expander */}
            <button
              onClick={() => setMode(mode === "full" ? "half" : "full")}
              aria-expanded={mode === "full"}
              className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border ${HAIR} py-2 text-[10px] font-semibold uppercase tracking-widest text-black/70 transition active:scale-[0.99] dark:text-white/70`}
            >
              {mode === "full" ? (
                <>
                  fewer controls
                  <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.2} />
                </>
              ) : (
                <>
                  all parameters
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.2} />
                </>
              )}
            </button>

            {mode === "full" &&
              SECTIONS.map(({ title, keys }) => (
                <div key={title} className="mb-2">
                  <p className="pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-black/50 dark:text-white/50">
                    {title}
                  </p>
                  {keys.map(({ key, label }) => (
                    <Row
                      key={key}
                      label={label}
                      value={params[key]}
                      range={PARAM_RANGES[key]}
                      locked={locked.has(key)}
                      onChange={(v) => set({ [key]: v } as Partial<Params>)}
                      onToggleLock={() => toggleLock(key)}
                    />
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
