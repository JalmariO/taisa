import { redirect, notFound } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Link from 'next/link'
import type { ManagerCertificate, CompanyInfo } from '@/types/database'
import PrintButton from './PrintButton'

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <tr className="border-b border-slate-100 print:border-slate-300">
      <td className="py-1.5 pr-4 text-sm text-slate-500 font-medium w-56 align-top">{label}</td>
      <td className="py-1.5 text-sm text-slate-800">{value}</td>
    </tr>
  )
}

function euros(v: number | null | undefined) {
  if (v == null) return undefined
  return v.toLocaleString('fi-FI', { minimumFractionDigits: 2 }) + ' €'
}

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const [{ data: cert }, { data: company }] = await Promise.all([
    supabase.from('manager_certificates').select('*').eq('id', id).single(),
    supabase.from('company_info').select('*').eq('id', 1).single(),
  ])

  if (!cert) notFound()
  const c = cert as ManagerCertificate
  const co = company as CompanyInfo | null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Screen-only toolbar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/certificates" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">
          ← Takaisin
        </Link>
        <div className="flex gap-3">
          <Link href={`/certificates/${id}/edit`}
            className="text-sm text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
            Muokkaa
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ── Printable certificate ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 print:shadow-none print:border-0 print:p-0 print:rounded-none">

        {/* Header */}
        <div className="text-center border-b-2 border-teal-700 pb-5 mb-6 print:border-slate-800">
          <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase print:text-slate-600">
            Isännöitsijäntodistus
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{co?.company_name ?? 'Taloyhtiö'}</h1>
          {co?.address && (
            <p className="text-sm text-slate-500 mt-0.5">
              {co.address}, {co.postal_code} {co.city}
            </p>
          )}
          {co?.business_id && (
            <p className="text-xs text-slate-400 mt-0.5">Y-tunnus: {co.business_id}</p>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-6 text-sm mb-6">
          <div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Päivätty</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {new Date(c.issued_date).toLocaleDateString('fi-FI', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Vastaanottaja</span>
            <p className="font-semibold text-slate-800 mt-0.5">{c.recipient_name}</p>
          </div>
        </div>

        {/* Sections */}
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2 print:text-slate-600">
            Huoneisto
          </h2>
          <table className="w-full">
            <tbody>
              <Row label="Huoneistonumero" value={c.apartment_number} />
              <Row label="Huoneistokuvaus" value={c.rooms} />
              <Row label="Pinta-ala" value={c.floor_area_m2 != null ? c.floor_area_m2 + ' m²' : undefined} />
              <Row label="Osakesarja ja numerot" value={c.share_numbers} />
              <Row label="Osakkeiden lukumäärä" value={c.share_count ?? undefined} />
            </tbody>
          </table>
        </section>

        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2 print:text-slate-600">
            Taloustiedot
          </h2>
          <table className="w-full">
            <tbody>
              <Row label="Velaton hinta" value={euros(c.debt_free_price)} />
              <Row label="Lainaosuus" value={euros(c.loan_share)} />
              <Row label="Yhtiövastike" value={c.maintenance_charge != null ? euros(c.maintenance_charge) + '/kk' : undefined} />
              <Row label="Rahoitusvastike" value={c.financing_charge != null ? euros(c.financing_charge) + '/kk' : undefined} />
              <Row label="Muut maksut" value={c.other_charges} />
            </tbody>
          </table>
        </section>

        {(c.encumbrances || c.remarks) && (
          <section className="mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2 print:text-slate-600">
              Lisätiedot
            </h2>
            <table className="w-full">
              <tbody>
                <Row label="Rasitteet / panttaukset" value={c.encumbrances} />
                <Row label="Huomautukset" value={c.remarks} />
              </tbody>
            </table>
          </section>
        )}

        {/* Signature area */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Isännöitsijän allekirjoitus</p>
            <div className="h-10 border-b border-dashed border-slate-300 w-64 mt-4" />
            <p className="text-sm font-medium text-slate-700 mt-1">{c.created_by || co?.manager_name}</p>
            {co?.manager_name && c.created_by !== co?.manager_name && (
              <p className="text-xs text-slate-400">Isännöitsijä</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
