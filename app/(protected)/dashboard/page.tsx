import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import type { Announcement, MaintenancePlanItem, Renovation } from '@/types/database'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()

  const [
    { data: announcements },
    { data: criticalPts },
    { data: ongoingRenovations },
  ] = await Promise.all([
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('maintenance_plan').select('*')
      .in('urgency', ['high', 'critical']).eq('status', 'planned')
      .order('planned_year', { ascending: true }).limit(3),
    supabase.from('renovations').select('*').eq('renovation_type', 'ongoing').limit(3),
  ])

  const quickLinks = [
    { href: '/company',          label: '🏢 Perustiedot',              color: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100' },
    { href: '/maintenance-plan', label: '� Kunnossapitosuunnitelma',   color: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100' },
    { href: '/renovations/new',  label: '🔨 Uusi remontti',            color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
    { href: '/certificates/new', label: '� Uusi todistus',            color: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100' },
    { href: '/announcements/new',label: '📢 Uusi ilmoitus',            color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
    { href: '/maintenance/new',  label: '🔧 Uusi vikailmoitus',        color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Tervetuloa, {user.email}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickLinks.map(({ href, label, color }) => (
          <Link key={href} href={href}
            className={`flex items-center justify-center rounded-2xl border px-3 py-5 text-sm font-semibold text-center transition-colors ${color}`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent announcements */}
        <Card title="Viimeisimmät ilmoitukset">
          {announcements && announcements.length > 0 ? (
            <ul className="divide-y divide-teal-50">
              {(announcements as Announcement[]).map((a) => (
                <li key={a.id} className="py-2.5">
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleDateString('fi-FI')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ei ilmoituksia vielä.</p>
          )}
          <Link href="/announcements" className="mt-3 inline-block text-xs font-medium text-teal-600 hover:text-teal-800 hover:underline transition-colors">
            Näytä kaikki →
          </Link>
        </Card>

        {/* Urgent PTS */}
        <Card title="Kiireelliset PTS-kohteet">
          {criticalPts && criticalPts.length > 0 ? (
            <ul className="divide-y divide-teal-50">
              {(criticalPts as MaintenancePlanItem[]).map((item) => (
                <li key={item.id} className="py-2.5">
                  <p className="text-sm font-medium text-slate-800">{item.target}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.planned_year ?? 'Vuosi ei tiedossa'}
                    {item.estimated_cost != null && ` · ${item.estimated_cost.toLocaleString('fi-FI')} €`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ei kiireellisiä kohteita.</p>
          )}
          <Link href="/maintenance-plan" className="mt-3 inline-block text-xs font-medium text-teal-600 hover:text-teal-800 hover:underline transition-colors">
            Näytä kaikki →
          </Link>
        </Card>

        {/* Ongoing renovations */}
        <Card title="Käynnissä olevat remontit">
          {ongoingRenovations && ongoingRenovations.length > 0 ? (
            <ul className="divide-y divide-teal-50">
              {(ongoingRenovations as Renovation[]).map((r) => (
                <li key={r.id} className="py-2.5">
                  <Link href={`/renovations/${r.id}`}
                    className="text-sm font-medium text-slate-800 hover:text-teal-700 transition-colors">
                    {r.name}
                  </Link>
                  {r.end_date && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Päättyy: {new Date(r.end_date).toLocaleDateString('fi-FI')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Ei käynnissä olevia remontteja.</p>
          )}
          <Link href="/renovations" className="mt-3 inline-block text-xs font-medium text-teal-600 hover:text-teal-800 hover:underline transition-colors">
            Näytä kaikki →
          </Link>
        </Card>
      </div>
    </div>
  )
}
