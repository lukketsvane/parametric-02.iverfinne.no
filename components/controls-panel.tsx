"use client"

import { useState, type ReactNode } from "react"
import {
  Bookmark,
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
  type KeptPiece,
  type ParamKey,
  type Params,
} from "@/lib/model"
import {
  INKS,
  PRINT_TRAITS,
  printName,
  randomizePrint,
  type PrintParamKey,
  type PrintParams,
} from "@/lib/print-model"
import type { Engine } from "./viewer"

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

/**
 * The print engine's whole control language: tiny stroke glyphs of the
 * silhouettes, tappable as chips. No sliders anywhere — each trait is a
 * handful of curated options you can see.
 */
const GLYPH = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

const FORM_GLYPHS: ReactNode[] = [
  <svg key="pill" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><rect x="6" y="3.5" width="8" height="13" rx="3.6" /></svg>,
  <svg key="bulb" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M6.5 16.5 C4.8 12.5 5.2 8.2 7.8 5.6 C9 4.4 11 4.4 12.2 5.6 C14.8 8.2 15.2 12.5 13.5 16.5 Z" /></svg>,
  <svg key="urn" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M8.2 16.5 C5.6 15 4.2 11.5 5.8 8.6 C6.8 6.8 8.4 5.6 8.4 3.5 M11.6 3.5 C11.6 5.6 13.2 6.8 14.2 8.6 C15.8 11.5 14.4 15 11.8 16.5 Z M8.2 16.5 h3.6" /></svg>,
  <svg key="column" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M7.2 3.5 h5.6 M7.4 3.5 L7 16.5 M12.6 3.5 L13 16.5 M7 16.5 h6" /></svg>,
]

const CUP_GLYPHS: ReactNode[] = [
  <svg key="none" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M6 10 h8" /></svg>,
  <svg key="goblet" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M5.5 4 C5.5 9.5 7.3 12 10 12 C12.7 12 14.5 9.5 14.5 4 M10 12 V16.5" /></svg>,
  <svg key="trumpet" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M5 3.5 C7 8 8.6 9.6 8.6 12 V16.5 M15 3.5 C13 8 11.4 9.6 11.4 12 V16.5" /></svg>,
  <svg key="petal" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M5 7.5 C5 12.5 7 15 10 15 C13 15 15 12.5 15 7.5 M4.6 7.2 a1.8 1.8 0 0 1 3.6 0 M8.2 7.2 a1.8 1.8 0 0 1 3.6 0 M11.8 7.2 a1.8 1.8 0 0 1 3.6 0" /></svg>,
  <svg key="turbine" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M4.5 16 V7 M8.2 16 V4 M11.8 16 V4 M15.5 16 V7" /></svg>,
  <svg key="bell" viewBox="0 0 20 20" className="h-5 w-5" {...GLYPH}><path d="M7.5 3.5 h5 M12.5 3.5 C15 6 16 9.5 15.5 12.5 H4.5 C4 9.5 5 6 7.5 3.5 M8 12.5 v4 h4 v-4" /></svg>,
]

const TRAIT_GLYPHS: Partial<Record<PrintParamKey, ReactNode[]>> = {
  form: FORM_GLYPHS,
  cup: CUP_GLYPHS,
}

function TraitRow({
  label,
  options,
  value,
  glyphs,
  onPick,
}: {
  label: string
  options: string[]
  value: number
  glyphs?: ReactNode[]
  onPick: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-20 shrink-0 text-[11px] uppercase tracking-widest text-black dark:text-white">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {options.map((name, i) => (
          <button
            key={name}
            onClick={() => onPick(i)}
            aria-pressed={i === value}
            title={name}
            className={
              glyphs
                ? `flex h-9 w-10 items-center justify-center rounded-xl border transition active:scale-95 ${
                    i === value
                      ? "border-transparent bg-black text-white dark:bg-white dark:text-black"
                      : `${HAIR} text-black dark:text-white`
                  }`
                : chipClass(i === value)
            }
          >
            {glyphs ? glyphs[i] : name}
          </button>
        ))}
      </div>
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
  engine,
  params,
  printParams,
  isDesktop,
  hiDetail,
  shelf,
  onEngineChange,
  onToggleDetail,
  onChange,
  onPrintChange,
  onKeep,
  onLoadKept,
  onRemoveKept,
}: {
  engine: Engine
  params: Params
  printParams: PrintParams
  isDesktop: boolean
  hiDetail: boolean
  shelf: KeptPiece[]
  onEngineChange: (e: Engine) => void
  onToggleDetail: () => void
  onChange: (p: Params) => void
  onPrintChange: (p: PrintParams) => void
  onKeep: () => void
  onLoadKept: (k: KeptPiece) => void
  onRemoveKept: (id: number) => void
}) {
  // collapsed → half (designs, glazes) → full (every parameter)
  const [mode, setMode] = useState<"collapsed" | "half" | "full">("collapsed")
  const open = mode !== "collapsed"
  // tapped-locked parameters survive shuffle untouched (ceramics only)
  const [locked, setLocked] = useState<ReadonlySet<ParamKey>>(new Set())

  const set = (patch: Partial<Params>) => onChange({ ...params, ...patch })
  const setPrint = (patch: Partial<PrintParams>) =>
    onPrintChange({ ...printParams, ...patch })

  const toggleLock = (key: ParamKey) =>
    setLocked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // shuffle stays inside the current engine — it never swaps them
  const shuffle = () => {
    if (engine === "print") {
      onPrintChange(randomizePrint(randomSeed()))
      return
    }
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
        {/* header row — engine picker, then the piece introduces itself */}
        <div className="flex items-center gap-1.5 p-2.5">
          <select
            value={engine}
            onChange={(e) => onEngineChange(e.target.value as Engine)}
            aria-label="Engine"
            className={`h-8 appearance-none rounded-full border ${HAIR} bg-transparent pl-3 pr-2 text-[11px] uppercase tracking-widest text-black outline-none dark:text-white [&>option]:normal-case`}
          >
            <option value="clay">ceramics</option>
            <option value="print">prints</option>
          </select>
          <span className="pl-1 text-[11px] uppercase tracking-widest text-black/60 dark:text-white/60">
            {engine === "print" ? printName(printParams) : designName(params)}
          </span>
          <span className="px-1 text-[11px] tabular-nums tracking-widest text-black/40 dark:text-white/40">
            {engine === "print" ? printParams.seed : params.seed}
          </span>

          <div className="flex-1" />

          <button
            onClick={() => {
              onKeep()
              if (mode === "collapsed") setMode("half")
            }}
            aria-label="Keep this piece on your shelf"
            title="Keep this piece on your shelf"
            className={ICON_BTN}
          >
            <Bookmark className="h-4 w-4" strokeWidth={2.2} />
          </button>
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
            {/* the shelf — pieces this visitor kept, across visits */}
            {shelf.length > 0 && (
              <div className="mb-3">
                <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-black/50 dark:text-white/50">
                  shelf
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {shelf.map((k) => (
                    <div key={k.id} className="relative shrink-0">
                      <button
                        onClick={() => onLoadKept(k)}
                        title={`${k.name} ${k.params.seed}`}
                        aria-label={`Bring back ${k.name} ${k.params.seed}`}
                        className={`block h-16 w-14 overflow-hidden rounded-xl border ${HAIR} transition active:scale-95`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={k.thumb}
                          alt={k.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <button
                        onClick={() => onRemoveKept(k.id)}
                        aria-label={`Remove ${k.name} from the shelf`}
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] leading-none text-white transition active:scale-90 dark:bg-white dark:text-black"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {engine === "print" ? (
              <>
                {/* filament inks */}
                {(["inkBase", "inkCup"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-3 py-1.5">
                    <span className="w-20 shrink-0 text-[11px] uppercase tracking-widest text-black dark:text-white">
                      {key === "inkBase" ? "body ink" : "cup ink"}
                    </span>
                    <div className="flex flex-1 flex-wrap gap-1.5">
                      {INKS.map((ink, i) => (
                        <button
                          key={ink.name}
                          onClick={() => setPrint({ [key]: i })}
                          aria-label={`${key === "inkBase" ? "body" : "cup"} ink: ${ink.name}`}
                          aria-pressed={i === Math.round(printParams[key])}
                          title={ink.name}
                          className={`h-6 w-6 rounded-full border transition active:scale-90 ${
                            i === Math.round(printParams[key])
                              ? "border-black ring-1 ring-black dark:border-white dark:ring-white"
                              : HAIR
                          }`}
                          style={{ backgroundColor: ink.hex }}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* the whole form language as tappable trait chips */}
                {PRINT_TRAITS.map(({ key, label, options }) => (
                  <TraitRow
                    key={key}
                    label={label}
                    options={options}
                    value={Math.round(printParams[key])}
                    glyphs={TRAIT_GLYPHS[key]}
                    onPick={(i) => setPrint({ [key]: i })}
                  />
                ))}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPrint({ seed: randomSeed() })}
                    className={chipClass(false)}
                    title="New seed, same traits — reflows the details"
                  >
                    reseed
                  </button>
                  <button
                    onClick={() => onPrintChange(randomizePrint(dailySeed()))}
                    className={chipClass(printParams.seed === dailySeed())}
                    title="Today's print — everyone gets this same piece today"
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
