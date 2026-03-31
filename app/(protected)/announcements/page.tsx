import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Link from 'next/link'
import type { Announcement, Attachment } from '@/types/database'
import AnnouncementCard from './AnnouncementCard'

export default async function AnnouncementsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data: announcements }, { data: allAttachments }] = await Promise.all([
    supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    supabase.from('attachments').select('*').eq('entity_type', 'announcement').order('created_at', { ascending: false }),
  ])

  // Group attachments by entity_id for O(1) lookup
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
        <h1 className="text-2xl font-bold text-slate-900">Ilmoitukset</h1>
        <Link
          href="/announcements/new"
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Uusi ilmoitus
        </Link>
      </div>

      <div className="space-y-3">
        {announcements && announcements.length > 0 ? (
          (announcements as Announcement[]).map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              initialAttachments={attachmentsByEntity[a.id] ?? []}
            />
          ))
        ) : (
          <p className="text-sm text-slate-400">Ei ilmoituksia vielä.</p>
        )}
      </div>
    </div>
  )
}
