'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import type { ManagerCertificate, CompanyInfo } from '@/types/database'

interface Props {
  initial?: ManagerCertificate
  company: CompanyInfo | null
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
    debt_free_price: c?.debt_free_price ?? null,
    loan_share: c?.loan_share ?? null,
    maintenance_charge: c?.maintenance_charge ?? null,
    financing_charge: c?.financing_charge ?? null,
    other_charges: c?.other_charges ?? '',
    encumbrances: c?.encumbrances ?? '',
    remarks: c?.remarks ?? '',
    created_by: c?.created_by ?? company?.manager_name ?? '',
  }
}

export default function CertificateForm({ initial, company }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(toForm(initial, company))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormState, value: string | number | null) {
    setForm((prev) => ({ ...prev, [key]: value === '' ? null : value }))
  }
  function num(v: string) { return v === '' ? null : Number(v) }

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
      <Card title="Perustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Päivämäärä *</label>
            <input type="date" required className={inputCls} value={form.issued_date}
              onChange={(e) => set('issued_date', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vastaanottaja *</label>
            <input required className={inputCls} value={form.recipient_name}
              onChange={(e) => set('recipient_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huoneisto *</label>
            <input required className={inputCls} value={form.apartment_number}
              onChange={(e) => set('apartment_number', e.target.value)} placeholder="esim. A3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huoneistokuvaus</label>
            <input className={inputCls} value={form.rooms}
              onChange={(e) => set('rooms', e.target.value)} placeholder="esim. 3h+k+s" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huoneistoala (m²)</label>
            <input type="number" step="0.01" className={inputCls} value={form.floor_area_m2 ?? ''}
              onChange={(e) => set('floor_area_m2', num(e.target.value))} />
          </div>
        </div>
      </Card>

      <Card title="Osakkeet">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Osakesarja ja numerot</label>
            <input className={inputCls} value={form.share_numbers}
              onChange={(e) => set('share_numbers', e.target.value)} placeholder="esim. A 101–150" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Osakkeiden lukumäärä</label>
            <input type="number" className={inputCls} value={form.share_count ?? ''}
              onChange={(e) => set('share_count', num(e.target.value))} />
          </div>
        </div>
      </Card>

      <Card title="Taloustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Velaton hinta (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.debt_free_price ?? ''}
              onChange={(e) => set('debt_free_price', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lainaosuus (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.loan_share ?? ''}
              onChange={(e) => set('loan_share', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yhtiövastike (€/kk)</label>
            <input type="number" step="0.01" className={inputCls} value={form.maintenance_charge ?? ''}
              onChange={(e) => set('maintenance_charge', num(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rahoitusvastike (€/kk)</label>
            <input type="number" step="0.01" className={inputCls} value={form.financing_charge ?? ''}
              onChange={(e) => set('financing_charge', num(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Muut maksut</label>
            <input className={inputCls} value={form.other_charges}
              onChange={(e) => set('other_charges', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card title="Lisätiedot">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rasitteet / panttaukset</label>
            <textarea rows={2} className={inputCls + ' resize-none'} value={form.encumbrances}
              onChange={(e) => set('encumbrances', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huomautukset</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Allekirjoittaja</label>
            <input className={inputCls} value={form.created_by}
              onChange={(e) => set('created_by', e.target.value)} />
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
