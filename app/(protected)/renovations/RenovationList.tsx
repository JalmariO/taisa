'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'
import type { Renovation } from '@/types/database'

const typeLabel: Record<Renovation['renovation_type'], string> = {
  planned: 'Suunniteltu',
  ongoing: 'Käynnissä',
  completed: 'Valmis',
}

const typeColor: Record<Renovation['renovation_type'], string> = {
  planned: 'bg-slate-100 text-slate-600',
  ongoing: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800',
}

// Derive the display year for a renovation
function renovationYear(r: Renovation): number | null {
  if (r.fiscal_year) return r.fiscal_year
  if (r.end_date) return new Date(r.end_date).getFullYear()
  if (r.start_date) return new Date(r.start_date).getFullYear()
  return null
}

type GroupBy = 'status' | 'year' | 'category'

// Returns a sorted list of [groupKey, renovations[]] tuples
function groupRenovations(
  renovations: Renovation[],
  by: GroupBy
): [string, Renovation[]][] {
  const map = new Map<string, Renovation[]>()

  for (const r of renovations) {
    let key: string
    if (by === 'status') {
      key = r.renovation_type
    } else if (by === 'year') {
      const y = renovationYear(r)
      key = y != null ? String(y) : 'Ei vuotta'
    } else {
      key = r.renovation_category?.trim() || 'Muu / määrittelemätön'
    }
    const list = map.get(key) ?? []
    list.push(r)
    map.set(key, list)
  }

  const entries = Array.from(map.entries())

  if (by === 'status') {
    const order: Renovation['renovation_type'][] = ['ongoing', 'planned', 'completed']
    entries.sort(([a], [b]) => order.indexOf(a as Renovation['renovation_type']) - order.indexOf(b as Renovation['renovation_type']))
  } else if (by === 'year') {
    entries.sort(([a], [b]) => {
      if (a === 'Ei vuotta') return 1
      if (b === 'Ei vuotta') return -1
      return Number(b) - Number(a) // newest first
    })
  } else {
    entries.sort(([a], [b]) => a.localeCompare(b, 'fi'))
  }

  return entries
}

function groupLabel(key: string, by: GroupBy): string {
  if (by === 'status') {
    return typeLabel[key as Renovation['renovation_type']] ?? key
  }
  if (by === 'year') return `Tilikausi ${key}`
  return key
}

function RenovationCard({
  r,
  onDelete,
  attachmentCount = 0,
}: {
  r: Renovation
  onDelete: (id: string) => void
  attachmentCount?: number
}) {
  const year = renovationYear(r)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Poistetaanko "${r.name}" pysyvästi?`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('renovations').delete().eq('id', r.id)
    onDelete(r.id)
  }

  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-sm shadow-teal-50 p-4 hover:border-teal-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">{r.name}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[r.renovation_type]}`}>
              {typeLabel[r.renovation_type]}
            </span>
            {r.renovation_category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                {r.renovation_category}
              </span>
            )}
          </div>
          {r.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{r.description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-slate-400">
            {r.fiscal_year && !r.start_date && !r.end_date ? (
              <span>Tilikausi: {r.fiscal_year}</span>
            ) : (
              <>
                {r.start_date && <span>Alkaa: {new Date(r.start_date).toLocaleDateString('fi-FI')}</span>}
                {r.end_date && <span>Päättyy: {new Date(r.end_date).toLocaleDateString('fi-FI')}</span>}
                {year && !r.end_date && !r.start_date && <span>Vuosi: {year}</span>}
              </>
            )}
            {r.contractor && <span>Urakoitsija: {r.contractor}</span>}
            {r.total_cost != null && (
              <span>Kustannus: {r.total_cost.toLocaleString('fi-FI')} €</span>
            )}
            {attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-teal-600">
                <span>📎</span>
                {attachmentCount} {attachmentCount === 1 ? 'liite' : 'liitettä'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/renovations/${r.id}`}
            className="text-xs text-teal-600 hover:text-teal-800 hover:underline transition-colors"
          >
            Avaa →
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-40 transition-colors cursor-pointer px-1"
            title="Poista remontti"
          >
            {deleting ? '…' : '✕'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  renovations: Renovation[]
  attachmentCounts?: Record<string, number>
}

export default function RenovationList({ renovations: initial, attachmentCounts = {} }: Props) {
  const [renovations, setRenovations] = useState<Renovation[]>(initial)
  const [groupBy, setGroupBy] = useState<GroupBy>('status')

  function handleDelete(id: string) {
    setRenovations((prev) => prev.filter((r) => r.id !== id))
  }

  const groups = groupRenovations(renovations, groupBy)

  const tabs: { key: GroupBy; label: string }[] = [
    { key: 'status', label: 'Tila' },
    { key: 'year', label: 'Vuosi / tilikausi' },
    { key: 'category', label: 'Kategoria' },
  ]

  return (
    <div className="space-y-5">
      {/* Group-by toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Ryhmittele:</span>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setGroupBy(t.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                groupBy === t.key
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <p className="text-sm text-slate-400">Ei remontteja vielä.</p>
      ) : (
        groups.map(([key, items]) => (
          <div key={key} className="space-y-2">
            {/* Group heading */}
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-slate-700">
                {groupLabel(key, groupBy)}
              </h2>
              <span className="text-xs text-slate-400">({items.length})</span>
              <div className="flex-1 h-px bg-teal-50" />
            </div>
            {items.map((r) => (
              <RenovationCard
                key={r.id}
                r={r}
                onDelete={handleDelete}
                attachmentCount={attachmentCounts[r.id] ?? 0}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
