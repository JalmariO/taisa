'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import type { MaintenancePlanItem } from '@/types/database'

interface Props {
  initial?: MaintenancePlanItem
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition'

const selectCls = inputCls + ' bg-white'

export default function MaintenancePlanForm({ initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initial

  const [form, setForm] = useState({
    target: initial?.target ?? '',
    description: initial?.description ?? '',
    planned_year: initial?.planned_year ?? '',
    estimated_cost: initial?.estimated_cost ?? '',
    urgency: initial?.urgency ?? 'medium',
    status: initial?.status ?? 'planned',
    notes: initial?.notes ?? '',
    service_life_years: initial?.service_life_years ?? '',
    maintenance_interval_years: initial?.maintenance_interval_years ?? '',
    priority_category: initial?.priority_category ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      planned_year: form.planned_year === '' ? null : Number(form.planned_year),
      estimated_cost: form.estimated_cost === '' ? null : Number(form.estimated_cost),
      service_life_years: form.service_life_years === '' ? null : Number(form.service_life_years),
      maintenance_interval_years: form.maintenance_interval_years === '' ? null : Number(form.maintenance_interval_years),
      updated_at: new Date().toISOString(),
    }

    const { error } = isEdit
      ? await supabase.from('maintenance_plan').update(payload).eq('id', initial!.id)
      : await supabase.from('maintenance_plan').insert(payload)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/maintenance-plan')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kohde *</label>
            <input required className={inputCls} value={form.target}
              onChange={(e) => set('target', e.target.value)}
              placeholder="esim. Katto, Putkisto, Julkisivu" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kuvaus</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.description}
              onChange={(e) => set('description', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Arvioitu vuosi</label>
            <input type="number" className={inputCls} value={form.planned_year}
              onChange={(e) => set('planned_year', e.target.value)} placeholder="esim. 2028" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Arvioitu kustannus (€)</label>
            <input type="number" step="0.01" className={inputCls} value={form.estimated_cost}
              onChange={(e) => set('estimated_cost', e.target.value)} placeholder="esim. 50000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Käyttöikä (vuotta)</label>
            <input type="number" className={inputCls} value={form.service_life_years}
              onChange={(e) => set('service_life_years', e.target.value)} placeholder="esim. 40" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huoltoväli (vuotta)</label>
            <input type="number" className={inputCls} value={form.maintenance_interval_years}
              onChange={(e) => set('maintenance_interval_years', e.target.value)} placeholder="esim. 10" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Priorisointi-kategoria</label>
            <select className={selectCls} value={form.priority_category} onChange={(e) => set('priority_category', e.target.value)}>
              <option value="">– Ei valittu –</option>
              <option value="Kiireellinen">Kiireellinen</option>
              <option value="Suositeltava">Suositeltava</option>
              <option value="Seurattava">Seurattava</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kiireellisyys</label>
            <select className={selectCls} value={form.urgency} onChange={(e) => set('urgency', e.target.value)}>
              <option value="low">Matala</option>
              <option value="medium">Normaali</option>
              <option value="high">Korkea</option>
              <option value="critical">Kriittinen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tila</label>
            <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="planned">Suunniteltu</option>
              <option value="in_progress">Käynnissä</option>
              <option value="done">Valmis</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Muistiinpanot</label>
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.notes}
              onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>
      </Card>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
          {loading ? 'Tallennetaan...' : isEdit ? 'Tallenna muutokset' : 'Lisää kohde'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
          Peruuta
        </button>
      </div>
    </form>
  )
}
