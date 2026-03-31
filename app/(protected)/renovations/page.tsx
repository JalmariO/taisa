import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Link from 'next/link'
import type { Renovation } from '@/types/database'
import RenovationList from './RenovationList'

export default async function RenovationsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data: renovations }, { data: attachmentRows }] = await Promise.all([
    supabase
      .from('renovations')
      .select('*')
      .order('fiscal_year', { ascending: false, nullsFirst: false }),
    supabase
      .from('attachments')
      .select('entity_id')
      .eq('entity_type', 'renovation'),
  ])

  // Build a count map: renovationId → number of attachments
  const attachmentCounts: Record<string, number> = {}
  for (const row of attachmentRows ?? []) {
    if (row.entity_id) {
      attachmentCounts[row.entity_id] = (attachmentCounts[row.entity_id] ?? 0) + 1
    }
  }

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

      <RenovationList
        renovations={(renovations as Renovation[]) ?? []}
        attachmentCounts={attachmentCounts}
      />
    </div>
  )
}

