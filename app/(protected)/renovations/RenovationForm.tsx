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

export default function RenovationForm({ initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initial

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    renovation_type: initial?.renovation_type ?? 'planned',
    start_date: initial?.start_date ?? '',
    end_date: initial?.end_date ?? '',
    estimated_cost: initial?.estimated_cost ?? '',
    total_cost: initial?.total_cost ?? '',
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

  function num(v: string | number) {
    return v === '' ? null : Number(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      estimated_cost: num(form.estimated_cost),
      total_cost: num(form.total_cost),
      updated_at: new Date().toISOString(),
    }

    const { error } = isEdit
      ? await supabase.from('renovations').update(payload).eq('id', initial!.id)
      : await supabase.from('renovations').insert(payload)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/renovations')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card title="Perustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Remontin nimi *</label>
            <input required className={inputCls} value={form.name}
              onChange={(e) => set('name', e.target.value)} placeholder="esim. Kattoremontti 2026" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kuvaus</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.description}
              onChange={(e) => set('description', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tyyppi</label>
            <select className={selectCls} value={form.renovation_type}
              onChange={(e) => set('renovation_type', e.target.value)}>
              <option value="planned">Suunniteltu</option>
              <option value="ongoing">Käynnissä</option>
              <option value="completed">Valmis</option>
            </select>
          </div>

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
        </div>
      </Card>

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
