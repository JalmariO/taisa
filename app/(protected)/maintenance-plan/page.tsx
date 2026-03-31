import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import type { MaintenancePlanItem } from '@/types/database'

const urgencyLabel: Record<MaintenancePlanItem['urgency'], string> = {
  low: 'Matala',
  medium: 'Normaali',
  high: 'Korkea',
  critical: 'Kriittinen',
}

const urgencyColor: Record<MaintenancePlanItem['urgency'], string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-cyan-100 text-cyan-800',
  high: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
}

const statusLabel: Record<MaintenancePlanItem['status'], string> = {
  planned: 'Suunniteltu',
  in_progress: 'Käynnissä',
  done: 'Valmis',
}

const statusColor: Record<MaintenancePlanItem['status'], string> = {
  planned: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-teal-100 text-teal-800',
  done: 'bg-green-100 text-green-800',
}

export default async function MaintenancePlanPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: items } = await supabase
    .from('maintenance_plan')
    .select('*')
    .order('planned_year', { ascending: true })

  const grouped = (items as MaintenancePlanItem[] | null)?.reduce<Record<string, MaintenancePlanItem[]>>(
    (acc, item) => {
      const key = item.planned_year ? String(item.planned_year) : 'Ei vuotta'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {}
  ) ?? {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kunnossapitosuunnitelma</h1>
          <p className="mt-1 text-sm text-slate-500">Pitkän tähtäimen kunnossapitosuunnitelma (PTS)</p>
        </div>
        <Link
          href="/maintenance-plan/new"
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Uusi kohde
        </Link>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-slate-400">Ei kunnossapitosuunnitelman kohteita vielä.</p>
      )}

      {Object.entries(grouped).map(([year, yearItems]) => (
        <div key={year}>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{year}</h2>
          <div className="space-y-2">
            {yearItems.map((item) => (
              <Card key={item.id} className="hover:border-teal-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{item.target}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyColor[item.urgency]}`}>
                        {urgencyLabel[item.urgency]}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    )}
                    {item.estimated_cost != null && (
                      <p className="text-xs text-slate-400 mt-1">
                        Arvioitu kustannus: {item.estimated_cost.toLocaleString('fi-FI')} €
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[item.status]}`}>
                      {statusLabel[item.status]}
                    </span>
                    <Link
                      href={`/maintenance-plan/${item.id}/edit`}
                      className="text-xs text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                    >
                      Muokkaa
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
