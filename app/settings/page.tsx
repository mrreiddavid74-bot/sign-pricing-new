'use client'
import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { DEFAULT_SETTINGS } from '../../lib/defaults'
import type { Settings } from '../../lib/types'

const KEY = 'pricing_settings_v1'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const raw = localStorage.getItem(KEY)
    if (raw) setSettings(JSON.parse(raw))
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
  }, [settings])

  return (
    <div className="space-y-6">
      <h1 className="h1">Settings</h1>
      <Card>
        <h2 className="h2 mb-3">Machine Capabilities</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="label">Master Max Print Width (mm)
            <input type="number" className="input" value={settings.masterMaxPrintWidthMm}
              onChange={e => setSettings({ ...settings, masterMaxPrintWidthMm: +e.target.value || 0 })} />
          </label>
          <label className="label">Master Max Cut Width (mm)
            <input type="number" className="input" value={settings.masterMaxCutWidthMm}
              onChange={e => setSettings({ ...settings, masterMaxCutWidthMm: +e.target.value || 0 })} />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="h2 mb-3">Costs & Margins</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="label">Setup fee (£)
            <input type="number" className="input" value={settings.setupFee}
              onChange={e => setSettings({ ...settings, setupFee: +e.target.value || 0 })} />
          </label>
          <label className="label">Cut per sign (£)
            <input type="number" className="input" value={settings.cutPerSign}
              onChange={e => setSettings({ ...settings, cutPerSign: +e.target.value || 0 })} />
          </label>
          <label className="label">Ink per m² (£)
            <input type="number" className="input" value={settings.inkCostPerSqm}
              onChange={e => setSettings({ ...settings, inkCostPerSqm: +e.target.value || 0 })} />
          </label>
          <label className="label">App tape per m² (£)
            <input type="number" className="input" value={settings.applicationTapePerSqm}
              onChange={e => setSettings({ ...settings, applicationTapePerSqm: +e.target.value || 0 })} />
          </label>
          <label className="label">Profit multiplier (×)
            <input type="number" className="input" value={settings.profitMultiplier}
              onChange={e => setSettings({ ...settings, profitMultiplier: +e.target.value || 0 })} />
          </label>
          <label className="label">VAT (%)
            <input type="number" className="input" value={settings.vatRatePct}
              onChange={e => setSettings({ ...settings, vatRatePct: +e.target.value || 0 })} />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="h2 mb-3">Spacing & Waste</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="label">Vinyl margin (mm)
            <input type="number" className="input" value={settings.vinylMarginMm}
              onChange={e => setSettings({ ...settings, vinylMarginMm: +e.target.value || 0 })} />
          </label>
          <label className="label">Substrate margin (mm)
            <input type="number" className="input" value={settings.substrateMarginMm}
              onChange={e => setSettings({ ...settings, substrateMarginMm: +e.target.value || 0 })} />
          </label>
          <label className="label">Tile overlap (mm)
            <input type="number" className="input" value={settings.tileOverlapMm}
              onChange={e => setSettings({ ...settings, tileOverlapMm: +e.target.value || 0 })} />
          </label>
          <label className="label">Vinyl waste per job (m)
            <input type="number" className="input" value={settings.vinylWasteLmPerJob}
              onChange={e => setSettings({ ...settings, vinylWasteLmPerJob: +e.target.value || 0 })} />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="h2 mb-3">Delivery Bands</h2>
        <p className="text-sm text-gray-600 mb-3">Base fee + band by largest item girth (L+W+H in cm). Customer collection = £0.</p>
        <div className="grid grid-cols-3 gap-3">
          {settings.delivery.bands.map((b, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div className="text-sm font-medium">{b.name}</div>
              <label className="label">Max girth (cm)
                <input type="number" className="input" value={b.maxGirthCm}
                  onChange={e => {
                    const bands = [...settings.delivery.bands]
                    bands[i] = { ...b, maxGirthCm: +e.target.value || 0 }
                    setSettings({ ...settings, delivery: { ...settings.delivery, bands } })
                  }} />
              </label>
              <label className="label">Price (£)
                <input type="number" className="input" value={b.price}
                  onChange={e => {
                    const bands = [...settings.delivery.bands]
                    bands[i] = { ...b, price: +e.target.value || 0 }
                    setSettings({ ...settings, delivery: { ...settings.delivery, bands } })
                  }} />
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="h2 mb-3">Export / Import</h2>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => {
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'settings.json'
            a.click()
            URL.revokeObjectURL(url)
          }}>Download settings.json</button>

          <label className="btn">
            <input type="file" className="hidden" accept="application/json" onChange={async e => {
              const f = e.target.files?.[0]
              if (!f) return
              const text = await f.text()
              setSettings(JSON.parse(text))
            }} />
            Import settings.json
          </label>
        </div>
      </Card>
    </div>
  )
}
