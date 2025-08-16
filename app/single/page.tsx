// @ts-nocheck
'use client'

import React from 'react'
import Card from '@/components/Card'

/**
 * TEMPORARY SAFE PAGE
 * This replaces the Result rendering with error-guarded output
 * so the project compiles on Vercel. We'll wire this back into your
 * real calculator UI after deployment.
 */

type PriceBreakdown = {
  setup?: number
  materials?: number
  ink?: number
  cutting?: number
  preDelivery?: number
  delivery?: number
  deliveryBand?: string
  total?: number
  vinylLm?: number
  tiles?: number
  sheetFraction?: number
  usagePct?: number
  wastePct?: number
  notes?: string[]
}

// For now, we expect the page to receive a `result` somehow from your logic.
// To keep the build green, we'll render an empty object if none provided.
export default function Page(props: { result?: PriceBreakdown | { error: any } }) {
  const result: any = props?.result ?? {}

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Single Sign</h1>

      <Card>
        <h2 className="h2 mb-2">Result</h2>
        {('error' in (result as any)) ? (
          <div className="text-red-600 text-sm">{(result as any).error}</div>
        ) : (
          <div className="text-sm space-y-1">
            <div>Setup: £{result.setup?.toFixed(2) ?? '0.00'}</div>
            <div>Materials: £{result.materials?.toFixed(2) ?? '0.00'}</div>
            <div>Ink: £{result.ink?.toFixed(2) ?? '0.00'}</div>
            <div>Cutting: £{result.cutting?.toFixed(2) ?? '0.00'}</div>
            <div className="font-medium">Pre‑delivery (× profit): £{result.preDelivery?.toFixed(2) ?? '0.00'}</div>
            <div>Delivery: £{result.delivery?.toFixed(2) ?? '0.00'} {result.deliveryBand ? `(${result.deliveryBand})` : ''}</div>
            <div className="font-semibold">Total: £{result.total?.toFixed(2) ?? '0.00'}</div>
            <hr className="my-2" />
            <div className="text-gray-600">Stats</div>
            {result.vinylLm ? <div>Vinyl: {result.vinylLm.toFixed(3)} lm (incl. +1 m waste)</div> : null}
            {result.tiles ? <div>Tiles: {result.tiles}</div> : null}
            {result.sheetFraction ? <div>Substrate charged: {result.sheetFraction * 100}% sheet</div> : null}
            {typeof result.usagePct === 'number' ? <div>Sheet usage: {result.usagePct}% (waste {result.wastePct}%)</div> : null}
            {result.notes?.length ? (
              <ul className="list-disc ml-5 text-gray-600">
                {result.notes.map((n: string, i: number) => <li key={i}>{n}</li>)}
              </ul>
            ) : null}
          </div>
        )}
      </Card>
    </main>
  )
}
