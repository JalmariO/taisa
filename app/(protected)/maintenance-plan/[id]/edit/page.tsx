import { redirect, notFound } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import MaintenancePlanForm from '../../MaintenancePlanForm'
import AttachmentPanel from '@/components/AttachmentPanel'
import type { MaintenancePlanItem, Attachment } from '@/types/database'

export default async function EditMaintenancePlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data }, { data: attachments }] = await Promise.all([
    supabase.from('maintenance_plan').select('*').eq('id', id).single(),
    supabase.from('attachments').select('*').eq('entity_type', 'maintenance_plan').eq('entity_id', id).order('created_at', { ascending: false }),
  ])
  if (!data) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Muokkaa PTS-kohdetta</h1>
      <MaintenancePlanForm initial={data as MaintenancePlanItem} />
      <Card title="Liitteet">
        <AttachmentPanel
          entityType="maintenance_plan"
          entityId={id}
          initialAttachments={(attachments as Attachment[]) ?? []}
        />
      </Card>
    </div>
  )
}
