import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import CertificateForm from '../CertificateForm'
import type { CompanyInfo, Renovation } from '@/types/database'

export default async function NewCertificatePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data: company }, { data: renovations }] = await Promise.all([
    supabase.from('company_info').select('*').eq('id', 1).single(),
    supabase.from('renovations').select('*')
      .in('renovation_type', ['ongoing', 'completed'])
      .order('end_date', { ascending: false }),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Uusi isännöitsijäntodistus</h1>
      <CertificateForm
        company={company as CompanyInfo | null}
        renovations={(renovations as Renovation[]) ?? []}
      />
    </div>
  )
}
