import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import type { CompanyInfo, Attachment } from '@/types/database'
import CompanyForm from './CompanyForm'
import AttachmentPanel from '@/components/AttachmentPanel'

export default async function CompanyPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data }, { data: attachments }] = await Promise.all([
    supabase.from('company_info').select('*').eq('id', 1).single(),
    supabase.from('attachments').select('*').eq('entity_type', 'company').order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yhtiön perustiedot</h1>
        <p className="mt-1 text-sm text-slate-500">
          Taloyhtiön perustiedot käytetään mm. isännöitsijäntodistuksissa.
        </p>
      </div>
      <CompanyForm initial={data as CompanyInfo | null} />
      <Card title="Asiakirjat (yhtiöjärjestys ym.)">
        <AttachmentPanel
          entityType="company"
          initialAttachments={(attachments as Attachment[]) ?? []}
        />
      </Card>
    </div>
  )
}
