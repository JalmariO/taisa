import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import RenovationForm from '../RenovationForm'

export default async function NewRenovationPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Uusi remontti</h1>
      <RenovationForm />
    </div>
  )
}
