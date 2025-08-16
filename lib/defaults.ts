import { Settings, VinylMedia, Substrate } from './types'

export const DEFAULT_SETTINGS: Settings = {
  masterMaxPrintWidthMm: 1340,
  masterMaxCutWidthMm: 1340,
  vinylMarginMm: 5,
  substrateMarginMm: 5,
  tileOverlapMm: 10,
  vinylWasteLmPerJob: 1,
  setupFee: 5.0,
  cutPerSign: 3.0,
  inkCostPerSqm: 1.75,
  applicationTapePerSqm: 2.0,
  finishingUplifts: {
    None: 0,
    KissCutOnRoll: 0.05,
    CutIntoSheets: 0.08,
    IndividuallyCut: 0.12,
  },
  complexityPerSticker: { Basic: 0.2, Standard: 0.4, Complex: 0.8 },
  delivery: {
    baseFee: 9.5,
    bands: [
      { name: 'Under100', maxGirthCm: 100, price: 5 },
      { name: 'Band101to150', maxGirthCm: 150, price: 10 },
      { name: 'Band151to200', maxGirthCm: 200, price: 20 },
      { name: 'Over200', maxGirthCm: 9999, price: 30 },
      { name: 'CustomerCollection', maxGirthCm: 0, price: 0 }
    ]
  },
  profitMultiplier: 1.8,
  vatRatePct: 20
}

export const DEFAULT_MEDIA: VinylMedia[] = [
  { id: 'md3', name: 'MD3 Printable', category: 'printable', rollWidthMm: 1370, rollPrintableWidthMm: 1340, pricePerLm: 8.5, maxPrintWidthMm: 1340, maxCutWidthMm: 1340 },
  { id: 'frosted1220', name: 'Frosted 1220', category: 'solid', rollWidthMm: 1220, rollPrintableWidthMm: 1220, pricePerLm: 6.2, maxCutWidthMm: 1220 },
  { id: 'frosted610', name: 'Frosted 610', category: 'solid', rollWidthMm: 610, rollPrintableWidthMm: 610, pricePerLm: 4.1, maxCutWidthMm: 610 },
]

export const DEFAULT_SUBSTRATES: Substrate[] = [
  { id: 'foamex-2440x1220-3', name: 'Foamex 3mm 2440x1220', thicknessMm: 3, sizeW: 2440, sizeH: 1220, pricePerSheet: 18 },
  { id: 'foamex-3050x1560-3', name: 'Foamex 3mm 3050x1560', thicknessMm: 3, sizeW: 3050, sizeH: 1560, pricePerSheet: 32 },
  { id: 'acm-3050x2030-3', name: 'ACM 3mm 3050x2030', thicknessMm: 3, sizeW: 3050, sizeH: 2030, pricePerSheet: 58 },
]
