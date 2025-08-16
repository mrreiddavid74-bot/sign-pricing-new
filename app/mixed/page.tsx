import Card from "@/components/Card";

export default function MixedPage({ result }: { result: any }) {
  return (
    <Card>
      <h2 className="h2 mb-2">Mixed Result</h2>
      {("error" in (result as any)) ? (
        <div className="text-red-600 text-sm">{(result as any).error}</div>
      ) : (
        <div className="text-sm space-y-1">
          <div>Setup: £{result.setup?.toFixed(2)}</div>
          <div>Materials: £{result.materials?.toFixed(2)}</div>
          <div>Ink: £{result.ink?.toFixed(2)}</div>
          <div>Cutting: £{result.cutting?.toFixed(2)}</div>
          <div className="font-medium">Pre‑delivery (× profit): £{result.preDelivery?.toFixed(2)}</div>
          <div>Delivery: £{result.delivery?.toFixed(2)} ({result.deliveryBand})</div>
          <div className="font-semibold">Total: £{result.total?.toFixed(2)}</div>
          <hr className="my-2" />
          <div className="text-gray-600">Stats</div>
          {result.vinylLm && <div>Vinyl: {result.vinylLm.toFixed(3)} lm (incl. +1 m waste)</div>}
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
  )
}
