import { redirect, notFound } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import RenovationForm from '../../RenovationForm'
import type { Renovation } from '@/types/database'

export default async function EditRenovationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('renovations').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Muokkaa remonttia</h1>
      <RenovationForm initial={data as Renovation} />
    </div>
  )
}
