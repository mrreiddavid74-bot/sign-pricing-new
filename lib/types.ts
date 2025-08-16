export type Mode = 'SolidColourCutVinyl' | 'PrintAndCutVinyl' | 'PrintedVinylOnly' | 'PrintedVinylOnSubstrate' | 'SubstrateOnly'

export type Finishing = 'KissCutOnRoll' | 'CutIntoSheets' | 'IndividuallyCut' | 'None'
export type Complexity = 'Basic' | 'Standard' | 'Complex'
export type Orientation = 'Vertical' | 'Horizontal'

export type Settings = {
  // Master machine limits
  masterMaxPrintWidthMm: number
  masterMaxCutWidthMm: number

  // Global margins & overlaps
  vinylMarginMm: number
  substrateMarginMm: number
  tileOverlapMm: number
  vinylWasteLmPerJob: number // in metres

  // Costs
  setupFee: number
  cutPerSign: number
  inkCostPerSqm: number
  applicationTapePerSqm: number

  // Finishing uplifts (multipliers or percentages applied later)
  finishingUplifts: Record<Finishing, number> // percentage e.g. 0.05 = +5%

  // Complexity price per sticker (vinyl-only cutting labour)
  complexityPerSticker: Record<Complexity, number>

  // Delivery bands (girth L+W+H in cm)
  delivery: {
    baseFee: number
    bands: { name: string; maxGirthCm: number; price: number }[]
  }

  // Profit & VAT
  profitMultiplier: number
  vatRatePct: number
}

export type VinylMedia = {
  id: string
  name: string
  category: 'printable' | 'solid'
  rollWidthMm: number // physical roll width
  rollPrintableWidthMm: number // usable print width
  maxPrintWidthMm?: number
  maxCutWidthMm?: number
  pricePerLm: number // £ per linear metre
}

export type Substrate = {
  id: string
  name: string
  thicknessMm: number
  sizeW: number
  sizeH: number
  pricePerSheet: number
}

export type SingleSignInput = {
  mode: Mode
  widthMm: number
  heightMm: number
  qty: number
  vinylId?: string
  substrateId?: string
  doubleSided?: boolean // for PrintedVinylOnSubstrate
  finishing?: Finishing
  complexity?: Complexity
  applicationTape?: boolean
  panelSplits?: number // 0..6 (0 = none)
  panelOrientation?: Orientation
}

export type PriceBreakdown = {
  materials: number
  ink: number
  setup: number
  cutting: number
  finishingUplift: number
  preDelivery: number // (setup + materials + ink + cutting) * profit
  delivery: number
  total: number

  // stats
  vinylLm?: number
  vinylLmWithWaste?: number
  tiles?: number
  sheetFraction?: 0.25 | 0.5 | 0.75 | 1
  sheetsUsed?: number
  usagePct?: number
  wastePct?: number
  deliveryBand?: string
  notes?: string[]
}
