import { redirect } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import type { ManagerCertificate } from '@/types/database'

export default async function CertificatesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: certs } = await supabase
    .from('manager_certificates')
    .select('*')
    .order('issued_date', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Isännöitsijäntodistukset</h1>
          <p className="mt-1 text-sm text-slate-500">Luo ja hallinnoi isännöitsijäntodistuksia</p>
        </div>
        <Link
          href="/certificates/new"
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Uusi todistus
        </Link>
      </div>

      <div className="space-y-3">
        {certs && certs.length > 0 ? (
          (certs as ManagerCertificate[]).map((c) => (
            <Card key={c.id} className="hover:border-teal-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Huoneisto {c.apartment_number} – {c.recipient_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Päivätty: {new Date(c.issued_date).toLocaleDateString('fi-FI', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                    {c.created_by && ` · ${c.created_by}`}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Link href={`/certificates/${c.id}`}
                    className="text-xs text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                    Avaa / Tulosta
                  </Link>
                  <Link href={`/certificates/${c.id}/edit`}
                    className="text-xs text-slate-500 hover:text-slate-700 hover:underline transition-colors">
                    Muokkaa
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-slate-400">Ei todistuksia vielä.</p>
        )}
      </div>
    </div>
  )
}
