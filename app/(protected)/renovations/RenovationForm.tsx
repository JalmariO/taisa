'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import type { Renovation } from '@/types/database'

interface Props {
  initial?: Renovation
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition'
const selectCls = inputCls + ' bg-white'

// Common renovation categories for the datalist
const CATEGORIES = [
  'Katto', 'Julkisivu', 'Putket / LVI', 'Sähkö', 'Hissi',
  'Parveke', 'Ikkunat', 'Ovet', 'Piha-alueet', 'Kellari / alapohja',
  'Lämmitysjärjestelmä', 'Ilmanvaihto', 'Yhteistilat', 'Huoneistoremontti', 'Muu',
]

type DateMode = 'year_only' | 'date_range'

function deriveFiscalYear(startDate: string, endDate: string): number {
  const d = endDate || startDate
  return d ? new Date(d).getFullYear() : new Date().getFullYear()
}

export default function RenovationForm({ initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initial

  // Determine initial date mode: if no dates but fiscal_year exists → year_only
  const initMode: DateMode =
    initial && !initial.start_date && !initial.end_date && initial.fiscal_year != null
      ? 'year_only'
      : 'date_range'

  const [dateMode, setDateMode] = useState<DateMode>(initMode)

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    renovation_type: initial?.renovation_type ?? 'planned',
    renovation_category: initial?.renovation_category ?? '',
    fiscal_year: initial?.fiscal_year?.toString() ?? new Date().getFullYear().toString(),
    start_date: initial?.start_date ?? '',
    end_date: initial?.end_date ?? '',
    estimated_cost: initial?.estimated_cost?.toString() ?? '',
    total_cost: initial?.total_cost?.toString() ?? '',
    contractor: initial?.contractor ?? '',
    contractor_email: initial?.contractor_email ?? '',
    contractor_phone: initial?.contractor_phone ?? '',
    notes: initial?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function num(v: string) { return v === '' ? null : Number(v) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Resolve dates + fiscal_year based on mode
    let start_date: string | null = null
    let end_date: string | null = null
    let fiscal_year: number | null = null

    if (dateMode === 'year_only') {
      fiscal_year = form.fiscal_year ? Number(form.fiscal_year) : null
    } else {
      start_date = form.start_date || null
      end_date = form.end_date || null
      // Auto-derive fiscal_year from end_date or start_date
      fiscal_year = (end_date || start_date)
        ? deriveFiscalYear(start_date ?? '', end_date ?? '')
        : null
    }

    const payload = {
      name: form.name,
      description: form.description,
      renovation_type: form.renovation_type,
      renovation_category: form.renovation_category,
      fiscal_year,
      start_date,
      end_date,
      estimated_cost: num(form.estimated_cost),
      total_cost: num(form.total_cost),
      contractor: form.contractor,
      contractor_email: form.contractor_email,
      contractor_phone: form.contractor_phone,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }

    const { error } = isEdit
      ? await supabase.from('renovations').update(payload).eq('id', initial!.id)
      : await supabase.from('renovations').insert(payload)

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/renovations')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Perustiedot ── */}
      <Card title="Perustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Remontin nimi *</label>
            <input required className={inputCls} value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="esim. Kattoremontti 2020" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kuvaus</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.description}
              onChange={(e) => set('description', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tila</label>
            <select className={selectCls} value={form.renovation_type}
              onChange={(e) => set('renovation_type', e.target.value)}>
              <option value="planned">Suunniteltu</option>
              <option value="ongoing">Käynnissä</option>
              <option value="completed">Valmis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategoria</label>
            <input
              className={inputCls}
              list="category-suggestions"
              value={form.renovation_category}
              onChange={(e) => set('renovation_category', e.target.value)}
              placeholder="esim. Katto, LVIS, Julkisivu…"
            />
            <datalist id="category-suggestions">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>
      </Card>

      {/* ── Ajoitus ── */}
      <Card title="Ajoitus">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-4">
          <button
            type="button"
            onClick={() => setDateMode('year_only')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              dateMode === 'year_only'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Vain vuosi / tilikausi
          </button>
          <button
            type="button"
            onClick={() => setDateMode('date_range')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              dateMode === 'date_range'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tarkat päivämäärät
          </button>
        </div>

        {dateMode === 'year_only' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tilikausi / suoritusvuosi
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                className={inputCls}
                value={form.fiscal_year}
                onChange={(e) => set('fiscal_year', e.target.value)}
                placeholder={new Date().getFullYear().toString()}
              />
              <p className="text-xs text-slate-400 mt-1">
                Käytä tätä kun tarkkoja päivämääriä ei ole saatavilla.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alkamispäivä</label>
              <input type="date" className={inputCls} value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Päättymispäivä</label>
              <input type="date" className={inputCls} value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tilikausi / vuosi
                <span className="ml-1 font-normal text-slate-400">(automaattinen, voi ylikirjoittaa)</span>
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                className={inputCls}
                value={
                  form.fiscal_year ||
                  (form.end_date || form.start_date
                    ? deriveFiscalYear(form.start_date, form.end_date).toString()
                    : '')
                }
                onChange={(e) => set('fiscal_year', e.target.value)}
                placeholder="Derivoidaan päivämäärästä"
              />
            </div>
          </div>
        )}
      </Card>

      {/* ── Kustannukset ── */}
      <Card title="Kustannukset">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Arvioitu kustannus (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.estimated_cost}
              onChange={(e) => set('estimated_cost', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Toteutunut kustannus (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.total_cost}
              onChange={(e) => set('total_cost', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* ── Urakoitsija ── */}
      <Card title="Urakoitsija">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Urakoitsijan nimi</label>
            <input className={inputCls} value={form.contractor}
              onChange={(e) => set('contractor', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sähköposti</label>
            <input type="email" className={inputCls} value={form.contractor_email}
              onChange={(e) => set('contractor_email', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Puhelin</label>
            <input type="tel" className={inputCls} value={form.contractor_phone}
              onChange={(e) => set('contractor_phone', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* ── Muistiinpanot ── */}
      <Card title="Muistiinpanot">
        <textarea rows={4} className={inputCls + ' resize-none'} value={form.notes}
          onChange={(e) => set('notes', e.target.value)} />
      </Card>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
          {loading ? 'Tallennetaan...' : isEdit ? 'Tallenna muutokset' : 'Lisää remontti'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
          Peruuta
        </button>
      </div>
    </form>
  )
}
