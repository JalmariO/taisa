import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Link from 'next/link'
import type { MaintenanceRequest, Attachment } from '@/types/database'
import MaintenanceCard from './MaintenanceCard'

export default async function MaintenancePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data: requests }, { data: allAttachments }] = await Promise.all([
    supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('attachments').select('*').eq('entity_type', 'maintenance_request').order('created_at', { ascending: false }),
  ])

  const attachmentsByEntity = ((allAttachments ?? []) as Attachment[]).reduce<Record<string, Attachment[]>>(
    (acc, a) => {
      if (a.entity_id) {
        acc[a.entity_id] = [...(acc[a.entity_id] ?? []), a]
      }
      return acc
    },
    {}
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Vikailmoitukset</h1>
        <Link
          href="/maintenance/new"
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Uusi vikailmoitus
        </Link>
      </div>

      <div className="space-y-3">
        {requests && requests.length > 0 ? (
          (requests as MaintenanceRequest[]).map((req) => (
            <MaintenanceCard
              key={req.id}
              request={req}
              initialAttachments={attachmentsByEntity[req.id] ?? []}
            />
          ))
        ) : (
          <p className="text-sm text-slate-400">Ei vikailmoituksia vielä.</p>
        )}
      </div>
    </div>
  )
}
