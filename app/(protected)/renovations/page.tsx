import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Link from 'next/link'
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

export default async function RenovationsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: renovations } = await supabase
    .from('renovations')
    .select('*')
    .order('start_date', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Remontit</h1>
          <p className="mt-1 text-sm text-slate-500">Tehdyt ja tulevat remontit</p>
        </div>
        <Link
          href="/renovations/new"
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Uusi remontti
        </Link>
      </div>

      <div className="space-y-3">
        {renovations && renovations.length > 0 ? (
          (renovations as Renovation[]).map((r) => (
            <Card key={r.id} className="hover:border-teal-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[r.renovation_type]}`}>
                      {typeLabel[r.renovation_type]}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{r.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-slate-400">
                    {r.start_date && (
                      <span>Alkaa: {new Date(r.start_date).toLocaleDateString('fi-FI')}</span>
                    )}
                    {r.end_date && (
                      <span>Päättyy: {new Date(r.end_date).toLocaleDateString('fi-FI')}</span>
                    )}
                    {r.contractor && <span>Urakoitsija: {r.contractor}</span>}
                    {r.total_cost != null && (
                      <span>Kustannus: {r.total_cost.toLocaleString('fi-FI')} €</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/renovations/${r.id}`}
                  className="text-xs text-teal-600 hover:text-teal-800 hover:underline transition-colors shrink-0"
                >
                  Avaa →
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-slate-400">Ei remontteja vielä.</p>
        )}
      </div>
    </div>
  )
}
