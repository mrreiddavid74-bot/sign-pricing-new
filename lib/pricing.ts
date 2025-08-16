import { Settings, VinylMedia, Substrate, SingleSignInput, PriceBreakdown, Finishing, Orientation } from './types'

const mm2ToSqm = (mm2: number) => mm2 / 1_000_000
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))

export function getEffectiveWidths(media: VinylMedia, settings: Settings) {
  const printCaps = [
    settings.masterMaxPrintWidthMm,
    media.rollPrintableWidthMm,
    media.maxPrintWidthMm ?? Infinity,
  ]
  const cutCaps = [
    settings.masterMaxCutWidthMm,
    media.rollWidthMm,
    media.maxCutWidthMm ?? Infinity,
  ]
  return {
    effectivePrintWidthMm: Math.min(...printCaps),
    effectiveCutWidthMm: Math.min(...cutCaps),
  }
}

/** Compute vinyl tiling into columns given max/effective print width. Returns columns and lm before +1m waste. */
export function tileVinylByWidth(
  pieceW: number,
  pieceH: number,
  effectivePrintW: number,
  overlapMm: number,
  gutterMm: number,
): { columns: number; lm: number; notes: string[] } {
  const denom = Math.max(1, effectivePrintW - overlapMm)
  const columns = Math.ceil((pieceW + overlapMm) / denom)
  const lm = columns * (pieceH + gutterMm) / 1000 // stack columns sequentially down the roll
  const notes = [`Tiled into ${columns} column(s) @ ${effectivePrintW}mm max print width`]
  return { columns, lm, notes }
}

/**
 * For solid cut vinyl (no printing): pack rectangles across cut width.
 * Simple heuristic: items per row = floor(effectiveCutW / (w + gutter)), rows = ceil(qty/itemsPerRow)
 */
export function cutVinylUtilisation(
  w: number,
  h: number,
  qty: number,
  effectiveCutW: number,
  gutter: number,
): { lm: number; perRow: number; rows: number; notes: string[] } {
  const perRow = Math.max(1, Math.floor(effectiveCutW / (w + gutter)))
  const rows = Math.ceil(qty / perRow)
  const lm = rows * (h + gutter) / 1000
  const notes = [`${perRow}/row across ${effectiveCutW}mm cut width, ${rows} row(s)`]
  return { lm, perRow, rows, notes }
}

/**
 * Substrate charging by fraction (¼/½/¾/full). We approximate utilisation by area ratio and round up.
 * You can replace with a guillotine/shelf packer later for Mixed Signs.
 */
export function substrateFraction(
  signW: number,
  signH: number,
  sheetW: number,
  sheetH: number,
  margin: number,
): { fraction: 0.25 | 0.5 | 0.75 | 1; usagePct: number } {
  const usableW = Math.max(0, sheetW - 2 * margin)
  const usableH = Math.max(0, sheetH - 2 * margin)
  const sheetArea = usableW * usableH
  const signArea = signW * signH
  const u = sheetArea > 0 ? signArea / sheetArea : 1
  let fraction: 0.25 | 0.5 | 0.75 | 1 = 1
  if (u <= 0.25) fraction = 0.25
  else if (u <= 0.5) fraction = 0.5
  else if (u <= 0.75) fraction = 0.75
  else fraction = 1
  return { fraction, usagePct: clamp(u * 100, 0, 100) }
}

export function deliveryFromGirth(settings: Settings, wMm: number, hMm: number, tMm = 10): { band: string; price: number } {
  // Simple girth L+W+H in cm. Thickness tMm default 10mm; adjust as needed.
  const girthCm = (wMm + hMm + tMm) / 10
  const band = settings.delivery.bands.find(b => girthCm <= b.maxGirthCm) || settings.delivery.bands.at(-1)!
  return { band: band.name, price: band.price }
}

export function priceSingle(
  input: SingleSignInput,
  media: VinylMedia[],
  substrates: Substrate[],
  settings: Settings,
): PriceBreakdown {
  const s = settings
  const notes: string[] = []
  const areaSqm = (input.mode === 'SolidColourCutVinyl' || input.mode === 'SubstrateOnly') ? 0 : mm2ToSqm(input.widthMm * input.heightMm * input.qty)

  let materials = 0
  let ink = areaSqm * s.inkCostPerSqm
  let setup = s.setupFee
  let cutting = s.cutPerSign * input.qty
  let finishingUplift = 0

  let vinylLm = 0
  let tiles = 0
  let sheetFraction: 0.25 | 0.5 | 0.75 | 1 | undefined
  let sheetsUsed: number | undefined
  let usagePct: number | undefined

  // Common fetches
  const mediaItem = input.vinylId ? media.find(m => m.id === input.vinylId) : undefined
  const substrateItem = input.substrateId ? substrates.find(su => su.id === input.substrateId) : undefined

  const addVinylCost = (lm: number, pricePerLm: number) => {
    const lmWithWaste = lm + s.vinylWasteLmPerJob
    materials += lmWithWaste * pricePerLm
    vinylLm = lmWithWaste
  }

  if (input.mode === 'SolidColourCutVinyl') {
    if (!mediaItem) throw new Error('Select a vinyl media')
    const { effectiveCutWidthMm } = getEffectiveWidths(mediaItem, s)
    const gutter = s.vinylMarginMm
    const { lm, perRow, rows, notes: n } = cutVinylUtilisation(input.widthMm + s.vinylMarginMm, input.heightMm + s.vinylMarginMm, input.qty, effectiveCutWidthMm, gutter)
    notes.push(...n)
    addVinylCost(lm, mediaItem.pricePerLm)
    // Complexity cost (per sticker)
    if (input.complexity) cutting += s.complexityPerSticker[input.complexity] * input.qty
    // Application tape included by default
    if (input.applicationTape !== false) {
      const tapeArea = mm2ToSqm((input.widthMm + s.vinylMarginMm) * (input.heightMm + s.vinylMarginMm) * input.qty)
      materials += tapeArea * s.applicationTapePerSqm
    }
    // Finishing uplifts
    const fin: Finishing = input.finishing ?? 'None'
    finishingUplift = s.finishingUplifts[fin] * (materials + ink + cutting + setup)
  }

  if (input.mode === 'PrintedVinylOnly' || input.mode === 'PrintAndCutVinyl' || input.mode === 'PrintedVinylOnSubstrate') {
    if (!mediaItem) throw new Error('Select a printable media')
    const { effectivePrintWidthMm, effectiveCutWidthMm } = getEffectiveWidths(mediaItem, s)
    // Vinyl tiling
    const { columns, lm, notes: n } = tileVinylByWidth(input.widthMm + s.vinylMarginMm, input.heightMm + s.vinylMarginMm, effectivePrintWidthMm, s.tileOverlapMm, s.vinylMarginMm)
    notes.push(...n)
    tiles = columns
    addVinylCost(lm, mediaItem.pricePerLm)

    // If contour cutting required, ensure tiles also fit cut width
    const needsCut = input.mode !== 'PrintedVinylOnly' && (input.finishing && input.finishing !== 'None')
    if (needsCut && effectiveCutWidthMm < effectivePrintWidthMm) {
      notes.push(`Cut limited to ${effectiveCutWidthMm}mm; printing at ${effectivePrintWidthMm}mm`)
    }

    // Application tape default for Print&Cut is off unless toggled
    if (input.mode !== 'PrintedVinylOnly' && input.applicationTape) {
      const tapeArea = mm2ToSqm((input.widthMm + s.vinylMarginMm) * (input.heightMm + s.vinylMarginMm) * input.qty)
      materials += tapeArea * s.applicationTapePerSqm
    }

    // Finishing uplifts
    const fin: Finishing = input.finishing ?? 'None'
    finishingUplift = s.finishingUplifts[fin] * (materials + ink + cutting + setup)
  }

  if (input.mode === 'PrintedVinylOnSubstrate' || input.mode === 'SubstrateOnly') {
    if (!substrateItem) throw new Error('Select a substrate')
    // Substrate charge by fraction (single sign approximation)
    const { fraction, usagePct: u } = substrateFraction(input.widthMm + s.substrateMarginMm, input.heightMm + s.substrateMarginMm, substrateItem.sizeW, substrateItem.sizeH, s.substrateMarginMm)
    sheetFraction = fraction
    usagePct = u
    sheetsUsed = 1
    const sheetCost = substrateItem.pricePerSheet * fraction
    materials += sheetCost * (input.doubleSided ? 2 : 1)
  }

  // Totals
  const base = setup + materials + ink + cutting
  const preDelivery = base * s.profitMultiplier
  const { band, price: bandPrice } = deliveryFromGirth(s, input.widthMm, input.heightMm)
  const delivery = s.delivery.baseFee + bandPrice
  const total = preDelivery + delivery

  return {
    materials: +materials.toFixed(2),
    ink: +ink.toFixed(2),
    setup: +setup.toFixed(2),
    cutting: +cutting.toFixed(2),
    finishingUplift: +finishingUplift.toFixed(2),
    preDelivery: +preDelivery.toFixed(2),
    delivery: +delivery.toFixed(2),
    total: +total.toFixed(2),
    vinylLm: vinylLm ? +vinylLm.toFixed(3) : undefined,
    vinylLmWithWaste: vinylLm ? +(vinylLm).toFixed(3) : undefined,
    tiles,
    sheetFraction,
    sheetsUsed,
    usagePct: usagePct ? +usagePct.toFixed(1) : undefined,
    wastePct: usagePct ? +(100 - usagePct).toFixed(1) : undefined,
    deliveryBand: band,
    notes
  }
}
