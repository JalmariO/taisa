import { redirect, notFound } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import type { Renovation, RenovationTask, Attachment } from '@/types/database'
import TaskList from './TaskList'
import AttachmentPanel from '@/components/AttachmentPanel'

const typeLabel: Record<Renovation['renovation_type'], string> = {
  planned: 'Suunniteltu', ongoing: 'Käynnissä', completed: 'Valmis',
}
const typeColor: Record<Renovation['renovation_type'], string> = {
  planned: 'bg-slate-100 text-slate-600',
  ongoing: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800',
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between py-2 border-b border-teal-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  )
}

export default async function RenovationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data: renovation }, { data: tasks }, { data: attachments }] = await Promise.all([
    supabase.from('renovations').select('*').eq('id', id).single(),
    supabase.from('renovation_tasks').select('*').eq('renovation_id', id).order('created_at'),
    supabase.from('attachments').select('*').eq('entity_type', 'renovation').eq('entity_id', id).order('created_at', { ascending: false }),
  ])

  if (!renovation) notFound()
  const r = renovation as Renovation

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{r.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor[r.renovation_type]}`}>
              {typeLabel[r.renovation_type]}
            </span>
          </div>
          {r.description && (
            <p className="mt-1 text-sm text-slate-600">{r.description}</p>
          )}
        </div>
        <Link href={`/renovations/${id}/edit`}
          className="shrink-0 text-sm text-teal-600 hover:text-teal-800 border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors">
          Muokkaa
        </Link>
      </div>

      {/* Details */}
      <Card title="Tiedot">
        <Row label="Aloituspäivä" value={r.start_date ? new Date(r.start_date).toLocaleDateString('fi-FI') : undefined} />
        <Row label="Päättymispäivä" value={r.end_date ? new Date(r.end_date).toLocaleDateString('fi-FI') : undefined} />
        <Row label="Arvioitu kustannus" value={r.estimated_cost != null ? r.estimated_cost.toLocaleString('fi-FI') + ' €' : undefined} />
        <Row label="Toteutunut kustannus" value={r.total_cost != null ? r.total_cost.toLocaleString('fi-FI') + ' €' : undefined} />
        <Row label="Urakoitsija" value={r.contractor || undefined} />
        <Row label="Urakoitsijan sähköposti" value={r.contractor_email || undefined} />
        <Row label="Urakoitsijan puhelin" value={r.contractor_phone || undefined} />
        {r.notes && (
          <div className="pt-2">
            <p className="text-xs font-medium text-slate-500 mb-1">Muistiinpanot</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.notes}</p>
          </div>
        )}
      </Card>

      {/* Tasks */}
      <Card title="Tehtävät ja vaiheet">
        <TaskList renovationId={id} initialTasks={(tasks as RenovationTask[]) ?? []} />
      </Card>

      {/* Attachments */}
      <Card title="Liitteet">
        <AttachmentPanel
          entityType="renovation"
          entityId={id}
          initialAttachments={(attachments as Attachment[]) ?? []}
        />
      </Card>

      <Link href="/renovations" className="inline-block text-sm text-slate-500 hover:text-slate-700 hover:underline">
        ← Takaisin listaan
      </Link>
    </div>
  )
}
