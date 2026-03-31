import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import type { Attachment } from '@/types/database'
import AttachmentPanel from '@/components/AttachmentPanel'

export default async function DocumentsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: attachments } = await supabase
    .from('attachments')
    .select('*')
    .eq('entity_type', 'general')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dokumentit</h1>
        <p className="mt-1 text-sm text-slate-500">
          Yleiset asiakirjat, joita ei liitetä tiettyyn kohteeseen. Kohdekohtaiset liitteet löytyvät kunkin osion sivulta.
        </p>
      </div>
      <Card title="Yleiset dokumentit">
        <AttachmentPanel
          entityType="general"
          initialAttachments={(attachments as Attachment[]) ?? []}
        />
      </Card>
    </div>
  )
}
