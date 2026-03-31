import { redirect, notFound } from 'next/navigation'
import { getUser, createServerSupabaseClient } from '@/lib/auth'
import Link from 'next/link'
import type { ManagerCertificate, CompanyInfo, Attachment } from '@/types/database'
import PrintButton from './PrintButton'
import DeleteButton from '@/components/ui/DeleteButton'
import AttachmentPanel from '@/components/AttachmentPanel'

function fmtDate(d: string | null | undefined) {
  if (!d) return undefined
  return new Date(d).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' })
}
function euros(v: number | null | undefined) {
  if (v == null) return undefined
  return v.toLocaleString('fi-FI', { minimumFractionDigits: 2 }) + ' €'
}

// Two-column label/value row for the printed table layout
function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <tr className="border-b border-slate-100 print:border-slate-300">
      <td className="py-1.5 pr-6 text-sm text-slate-500 font-medium w-56 align-top whitespace-nowrap">{label}</td>
      <td className="py-1.5 text-sm text-slate-800">{value}</td>
    </tr>
  )
}

// Bold section heading for the printed document
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2 print:text-slate-800 print:border-b print:border-slate-300 print:pb-0.5">
        {title}
      </h2>
      {children}
    </section>
  )
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
  const [{ data: cert }, { data: company }, { data: attachments }] = await Promise.all([
    supabase.from('manager_certificates').select('*').eq('id', id).single(),
    supabase.from('company_info').select('*').eq('id', 1).single(),
    supabase.from('attachments').select('*').eq('entity_type', 'certificate').eq('entity_id', id).order('created_at', { ascending: false }),
  ])

  if (!cert) notFound()
  const c = cert as ManagerCertificate
  const co = company as CompanyInfo | null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Screen-only toolbar ── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/certificates" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">
          ← Takaisin
        </Link>
        <div className="flex gap-3 items-center">
          <DeleteButton id={id} table="manager_certificates" redirectTo="/certificates" label="Poista" />
          <Link href={`/certificates/${id}/edit`}
            className="text-sm text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
            Muokkaa
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ══════════════════════════════════════
           PRINTABLE CERTIFICATE
         ══════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 print:shadow-none print:border-0 print:p-0 print:rounded-none">

        {/* ── Cover / header ── */}
        <div className="text-center border-b-2 border-teal-700 pb-5 mb-6 print:border-slate-800">
          <p className="text-xs font-bold tracking-widest text-teal-700 uppercase print:text-slate-700">
            Isännöitsijäntodistus
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{co?.company_name ?? 'Taloyhtiö'}</h1>
        </div>

        {/* ── Two-column header block (matches example) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Yhtiön nimi, osoite ja y-tunnus</p>
            {co?.company_name && <p className="font-medium text-slate-900">{co.company_name}</p>}
            {co?.address && <p className="text-slate-700">{co.address}</p>}
            {(co?.postal_code || co?.city) && <p className="text-slate-700">{[co.postal_code, co.city].filter(Boolean).join(' ')}</p>}
            {co?.business_id && <p className="text-slate-700">Y-tunnus: {co.business_id}</p>}
            {co?.board_chair_name && <p className="text-slate-700">Hallituksen pj: {co.board_chair_name}</p>}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Yhteyshenkilön nimi, osoite ja puhelin</p>
            {co?.manager_name && <p className="font-medium text-slate-900">Isännöitsijä {co.manager_name}</p>}
            {co?.manager_phone && <p className="text-slate-700">Puh. {co.manager_phone}</p>}
            {co?.manager_email && <p className="text-slate-700">{co.manager_email}</p>}
          </div>
        </div>

        {/* ── Kiinteistötunnus ── */}
        {co?.property_id && (
          <Section title="Kiinteistötunnus">
            <p className="text-sm text-slate-800">{co.property_id}</p>
          </Section>
        )}

        {/* ── Huoneisto ja osakkeet ── */}
        <Section title="Tietoja huoneistosta ja osakkeista">
          <table className="w-full">
            <tbody>
              <Row label="Osakkeiden numerot" value={c.share_numbers} />
              <Row label="Osakkeiden lukumäärä" value={c.share_count ?? undefined} />
              <Row label="Huoneisto" value={c.apartment_number} />
              <Row label="Huoneistotyyppi" value={c.rooms} />
              <Row label="Käyttötarkoitus" value={c.apartment_purpose} />
              <Row label="Yhtiöjärjestyksen mukainen pinta-ala" value={c.floor_area_m2 != null ? c.floor_area_m2 + ' m²' : undefined} />
              <Row label="Omistaja (osakeluettelo)" value={c.recipient_name} />
              <Row label="Omistusosuus" value={c.ownership_percentage} />
            </tbody>
          </table>
        </Section>

        {/* ── Vastikkeet ── */}
        <Section title="Huoneiston vastikkeet ja muut maksut">
          <table className="w-full">
            <tbody>
              <Row label="Osuus yhtiön lainoista" value={euros(c.loan_share) ?? '0,00 €'} />
              <Row label="Erääntyneet maksut yhtiölle" value={euros(c.overdue_payments) ?? '0,00 €'} />
              <Row label="Hoitovastike" value={c.maintenance_charge != null ? `${euros(c.maintenance_charge)}/kk` : undefined} />
              <Row label="Hoitovastikkeen peruste" value={c.maintenance_charge_basis} />
              <Row
                label="Rahoitusvastike"
                value={c.financing_charge != null ? `${euros(c.financing_charge)}/kk` : 'Rahoitusvastiketta ei ole'}
              />
              <Row label="Vesimaksu" value={c.water_charge} />
              <Row label="Muut maksut" value={c.other_charges} />
            </tbody>
          </table>
        </Section>

        {/* ── Tietoja yhtiöstä ── */}
        <Section title="Tietoja yhtiöstä">
          <table className="w-full">
            <tbody>
              <Row label="Kaupparekisterin merkinnän pvm" value={fmtDate(co?.trade_register_date)} />
              <Row label="Yhtiöjärjestyksen pvm" value={fmtDate(co?.articles_date)} />
              <Row label="Tontti" value={co?.plot_type} />
              <Row label="Tontin pinta-ala" value={co?.plot_area_m2 != null ? co.plot_area_m2 + ' m²' : undefined} />
              <Row label="Vapaa rakennusoikeus" value={co?.building_rights_unused} />
              <Row label="Vuokra-aika päättyy" value={fmtDate(co?.plot_lease_end)} />
              <Row label="Vuokranantaja" value={co?.plot_landlord} />
              <Row label="Rakennusten lukumäärä" value={co?.building_count != null ? co.building_count + ' kpl' : undefined} />
              <Row label="Valmistumisvuosi" value={co?.built_year ?? undefined} />
              <Row label="Talotyyppi" value={co?.building_type} />
              <Row label="Kerrosluku" value={co?.floors ?? undefined} />
              <Row label="Tilavuus" value={co?.volume_m3 != null ? co.volume_m3 + ' m³' : undefined} />
              <Row label="Pääasiallinen rakennusaine" value={co?.building_material} />
              <Row label="Kattotyyppi" value={co?.roof_type} />
              <Row label="Kate" value={co?.roof_material} />
              <Row label="Lämmitysjärjestelmä" value={co?.heating_system} />
              <Row label="Ilmanvaihtojärjestelmä" value={co?.ventilation_system} />
              <Row label="Antennijärjestelmä" value={co?.antenna_system} />
              <Row label="Vakuutus" value={co?.insurance_company} />
              <Row label="Huoneistoja" value={co?.apartment_count != null ? co.apartment_count + ' kpl' : undefined} />
              <Row label="Osakemäärä yhteensä" value={co?.total_shares != null ? co.total_shares + ' kpl' : undefined} />
              <Row label="Yhtiöjärjestyksen mukainen pinta-ala" value={co?.floor_area_m2 != null ? co.floor_area_m2 + ' m²' : undefined} />
              <Row label="Autopaikkatiedot" value={co?.parking_info} />
            </tbody>
          </table>
        </Section>

        {/* ── Rajoitukset ── */}
        {c.restrictions && (
          <Section title="Käyttö- ja luovutusrajoitukset">
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{c.restrictions}</p>
          </Section>
        )}

        {/* ── Suoritetut peruskorjaukset ── */}
        {c.included_renovations && c.included_renovations.length > 0 && (
          <Section title="Suoritetut peruskorjaukset">
            <ul className="space-y-1">
              {c.included_renovations.map((r, i) => (
                <li key={i} className="text-sm text-slate-800 flex gap-2">
                  <span className="text-teal-500 print:text-slate-600 shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Rasitteet / huomautukset ── */}
        {(c.encumbrances || c.remarks) && (
          <Section title="Lisätiedot">
            <table className="w-full">
              <tbody>
                <Row label="Rasitteet / panttaukset" value={c.encumbrances} />
                <Row label="Huomautukset" value={c.remarks} />
              </tbody>
            </table>
          </Section>
        )}

        {/* ── Todistuksen tilaaja ── */}
        {c.requester_apartment && (
          <Section title="Isännöitsijäntodistuksen tilaaja">
            <p className="text-sm text-slate-800">
              {c.recipient_name}{c.requester_apartment ? ` (asunto ${c.requester_apartment})` : ''}
            </p>
          </Section>
        )}

        {/* ── Paikka, päivämäärä ja allekirjoitus ── */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-700 mb-6">
            {co?.city ?? ''}{co?.city ? ' ' : ''}
            {new Date(c.issued_date).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' })}
          </p>
          {co?.company_name && (
            <p className="text-sm font-medium text-slate-800 mb-4">{co.company_name}</p>
          )}
          <div className="h-10 border-b border-dashed border-slate-300 w-64" />
          <p className="text-sm font-medium text-slate-700 mt-2">{c.created_by || co?.manager_name}</p>
          <p className="text-xs text-slate-400">Isännöitsijä</p>
        </div>

      </div>
      {/* ── End of printable certificate ── */}

      {/* ── Liitteet (screen only) ── */}
      <div className="mt-6 print:hidden">
        <div className="bg-white border border-teal-100 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Liitteet</h3>
          <AttachmentPanel
            entityType="certificate"
            entityId={id}
            initialAttachments={(attachments as Attachment[]) ?? []}
          />
        </div>
      </div>

    </div>
  )
}
