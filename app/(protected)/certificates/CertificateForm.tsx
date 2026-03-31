'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import type { ManagerCertificate, CompanyInfo, Renovation } from '@/types/database'

interface Props {
  initial?: ManagerCertificate
  company: CompanyInfo | null
  renovations: Renovation[]
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition'

type FormState = Omit<ManagerCertificate, 'id' | 'created_at'>

function toForm(c: ManagerCertificate | undefined, company: CompanyInfo | null): FormState {
  return {
    issued_date: c?.issued_date ?? new Date().toISOString().slice(0, 10),
    recipient_name: c?.recipient_name ?? '',
    apartment_number: c?.apartment_number ?? '',
    share_numbers: c?.share_numbers ?? '',
    share_count: c?.share_count ?? null,
    floor_area_m2: c?.floor_area_m2 ?? null,
    rooms: c?.rooms ?? '',
    apartment_purpose: c?.apartment_purpose ?? 'asunto',
    ownership_percentage: c?.ownership_percentage ?? '100 %',
    debt_free_price: c?.debt_free_price ?? null,
    loan_share: c?.loan_share ?? null,
    overdue_payments: c?.overdue_payments ?? 0,
    maintenance_charge: c?.maintenance_charge ?? null,
    maintenance_charge_basis: c?.maintenance_charge_basis ?? '',
    financing_charge: c?.financing_charge ?? null,
    other_charges: c?.other_charges ?? '',
    water_charge: c?.water_charge ?? '',
    encumbrances: c?.encumbrances ?? '',
    restrictions: c?.restrictions ?? 'Ei ole.',
    remarks: c?.remarks ?? '',
    included_renovations: c?.included_renovations ?? [],
    requester_apartment: c?.requester_apartment ?? '',
    created_by: c?.created_by ?? company?.manager_name ?? '',
  }
}

export default function CertificateForm({ initial, company, renovations }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(toForm(initial, company))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormState, value: string | number | null) {
    setForm((prev) => ({ ...prev, [key]: value === '' ? null : value }))
  }
  function str(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }
  function num(v: string) { return v === '' ? null : Number(v) }

  function toggleRenovation(label: string) {
    setForm((prev) => {
      const list = prev.included_renovations
      return {
        ...prev,
        included_renovations: list.includes(label)
          ? list.filter((r) => r !== label)
          : [...list, label],
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = isEdit
      ? await supabase.from('manager_certificates').update(form).eq('id', initial!.id).select().single()
      : await supabase.from('manager_certificates').insert(form).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/certificates/${(data as ManagerCertificate).id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Perustiedot */}
      <Card title="Perustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Päivämäärä *</label>
            <input type="date" required className={inputCls} value={form.issued_date}
              onChange={(e) => str('issued_date', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Todistuksen tilaaja (huoneisto)</label>
            <input className={inputCls} value={form.requester_apartment}
              onChange={(e) => str('requester_apartment', e.target.value)} placeholder="esim. B3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Omistajan nimi *</label>
            <input required className={inputCls} value={form.recipient_name}
              onChange={(e) => str('recipient_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Omistusosuus</label>
            <input className={inputCls} value={form.ownership_percentage}
              onChange={(e) => str('ownership_percentage', e.target.value)} placeholder="100 %" />
          </div>
        </div>
      </Card>

      {/* Huoneisto */}
      <Card title="Tietoja huoneistosta">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huoneisto *</label>
            <input required className={inputCls} value={form.apartment_number}
              onChange={(e) => str('apartment_number', e.target.value)} placeholder="esim. B3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huoneistotyyppi</label>
            <input className={inputCls} value={form.rooms}
              onChange={(e) => str('rooms', e.target.value)} placeholder="esim. 4h+k+s" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Käyttötarkoitus</label>
            <input className={inputCls} value={form.apartment_purpose}
              onChange={(e) => str('apartment_purpose', e.target.value)} placeholder="asunto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yhtiöjärjestyksen mukainen pinta-ala (m²)</label>
            <input type="number" step="0.01" className={inputCls} value={form.floor_area_m2 ?? ''}
              onChange={(e) => set('floor_area_m2', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Osakesarja ja numerot</label>
            <input className={inputCls} value={form.share_numbers}
              onChange={(e) => str('share_numbers', e.target.value)} placeholder="esim. 177–264" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Osakkeiden lukumäärä</label>
            <input type="number" className={inputCls} value={form.share_count ?? ''}
              onChange={(e) => set('share_count', num(e.target.value))} />
          </div>
        </div>
      </Card>

      {/* Vastikkeet */}
      <Card title="Vastikkeet ja maksut">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Osuus yhtiön lainoista (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.loan_share ?? ''}
              onChange={(e) => set('loan_share', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Erääntyneet maksut yhtiölle (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.overdue_payments ?? ''}
              onChange={(e) => set('overdue_payments', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hoitovastike (€/kk)</label>
            <input type="number" step="0.01" className={inputCls} value={form.maintenance_charge ?? ''}
              onChange={(e) => set('maintenance_charge', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hoitovastikkeen peruste</label>
            <input className={inputCls} value={form.maintenance_charge_basis}
              onChange={(e) => str('maintenance_charge_basis', e.target.value)} placeholder="esim. neliöt" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rahoitusvastike (€/kk)</label>
            <input type="number" step="0.01" className={inputCls} value={form.financing_charge ?? ''}
              onChange={(e) => set('financing_charge', num(e.target.value))} placeholder="Jätä tyhjäksi jos ei ole" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vesimaksu / peruste</label>
            <input className={inputCls} value={form.water_charge}
              onChange={(e) => str('water_charge', e.target.value)} placeholder="esim. huoneistokohtaiset mittarit kulutuksen mukaan" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Muut maksut</label>
            <input className={inputCls} value={form.other_charges}
              onChange={(e) => str('other_charges', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Suoritetut peruskorjaukset */}
      <Card title="Suoritetut peruskorjaukset">
        <p className="text-xs text-slate-500 mb-3">
          Valitse remontit, jotka sisällytetään todistukseen. Vain valmiit ja käynnissä olevat remontit näkyvät.
        </p>
        {renovations.length > 0 ? (
          <div className="space-y-2">
            {renovations.map((r) => {
              const label = `${r.name}${r.end_date ? ` (${new Date(r.end_date).getFullYear()})` : r.start_date ? ` (${new Date(r.start_date).getFullYear()})` : ''}`
              const checked = form.included_renovations.includes(label)
              return (
                <label key={r.id} className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRenovation(label)}
                    className="mt-0.5 w-4 h-4 accent-teal-600 shrink-0"
                  />
                  <span className={`text-sm ${checked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                    {label}
                  </span>
                </label>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Ei remontteja järjestelmässä.</p>
        )}
        {form.included_renovations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-teal-50">
            <p className="text-xs font-medium text-slate-500 mb-2">Valitut ({form.included_renovations.length} kpl):</p>
            <ul className="space-y-1">
              {form.included_renovations.map((r, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                  <span className="text-teal-500">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Lisätiedot */}
      <Card title="Lisätiedot">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rasitteet / panttaukset</label>
            <textarea rows={2} className={inputCls + ' resize-none'} value={form.encumbrances}
              onChange={(e) => str('encumbrances', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Käyttö- ja luovutusrajoitukset</label>
            <textarea rows={2} className={inputCls + ' resize-none'} value={form.restrictions}
              onChange={(e) => str('restrictions', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huomautukset</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.remarks}
              onChange={(e) => str('remarks', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Allekirjoittaja</label>
            <input className={inputCls} value={form.created_by}
              onChange={(e) => str('created_by', e.target.value)} />
          </div>
        </div>
      </Card>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
          {loading ? 'Tallennetaan...' : isEdit ? 'Tallenna muutokset' : 'Luo todistus'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
          Peruuta
        </button>
      </div>
    </form>
  )
}
