'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import type { CompanyInfo } from '@/types/database'

interface Props {
  initial: CompanyInfo | null
}

type FormState = Omit<CompanyInfo, 'id' | 'updated_at'>

const empty: FormState = {
  company_name: '', business_id: '', address: '', postal_code: '', city: '',
  built_year: null, floor_area_m2: null, volume_m3: null, plot_area_m2: null,
  property_id: '', apartment_count: null, total_shares: null,
  manager_name: '', manager_email: '', manager_phone: '',
  auditor_name: '', board_chair_name: '', bank_account: '',
  trade_register_date: null, articles_date: null,
  plot_type: '', plot_lease_end: null, plot_landlord: '', building_rights_unused: '',
  building_count: null, building_type: '', building_material: '', floors: null,
  roof_type: '', roof_material: '', heating_system: '', ventilation_system: '',
  antenna_system: '', insurance_company: '', parking_info: '',
}

function toForm(info: CompanyInfo | null): FormState {
  if (!info) return empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, updated_at, ...rest } = info
  return { ...empty, ...rest }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition'

export default function CompanyForm({ initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState<FormState>(toForm(initial))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set(key: keyof FormState, value: string | number | null) {
    setForm((prev) => ({ ...prev, [key]: value === '' ? null : value }))
  }
  function str(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }
  function num(val: string) { return val === '' ? null : Number(val) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase
      .from('company_info')
      .upsert({ id: 1, ...form, updated_at: new Date().toISOString() })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Perustiedot */}
      <Card title="Perustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Yhtiön nimi *">
            <input required className={inputCls} value={form.company_name}
              onChange={(e) => str('company_name', e.target.value)} />
          </Field>
          <Field label="Y-tunnus">
            <input className={inputCls} value={form.business_id}
              onChange={(e) => str('business_id', e.target.value)} placeholder="1234567-8" />
          </Field>
          <Field label="Kiinteistötunnus">
            <input className={inputCls} value={form.property_id}
              onChange={(e) => str('property_id', e.target.value)} placeholder="esim. 179-029-0005-0008" />
          </Field>
          <Field label="Huoneistojen lukumäärä">
            <input type="number" className={inputCls} value={form.apartment_count ?? ''}
              onChange={(e) => set('apartment_count', num(e.target.value))} />
          </Field>
          <Field label="Osakemäärä yhteensä">
            <input type="number" className={inputCls} value={form.total_shares ?? ''}
              onChange={(e) => set('total_shares', num(e.target.value))} />
          </Field>
          <Field label="Tilinumero (IBAN)">
            <input className={inputCls} value={form.bank_account}
              onChange={(e) => str('bank_account', e.target.value)} placeholder="FI00 0000 0000 0000 00" />
          </Field>
        </div>
      </Card>

      {/* Rekisteritiedot */}
      <Card title="Rekisteritiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kaupparekisterin merkinnän pvm">
            <input type="date" className={inputCls} value={form.trade_register_date ?? ''}
              onChange={(e) => set('trade_register_date', e.target.value || null)} />
          </Field>
          <Field label="Voimassa olevan yhtiöjärjestyksen pvm">
            <input type="date" className={inputCls} value={form.articles_date ?? ''}
              onChange={(e) => set('articles_date', e.target.value || null)} />
          </Field>
        </div>
      </Card>

      {/* Osoite */}
      <Card title="Osoite">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <Field label="Katuosoite">
              <input className={inputCls} value={form.address}
                onChange={(e) => str('address', e.target.value)} />
            </Field>
          </div>
          <Field label="Postinumero">
            <input className={inputCls} value={form.postal_code}
              onChange={(e) => str('postal_code', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Kaupunki">
              <input className={inputCls} value={form.city}
                onChange={(e) => str('city', e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Tontti */}
      <Card title="Tontti">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tonttityyppi">
            <select className={inputCls} value={form.plot_type}
              onChange={(e) => str('plot_type', e.target.value)}>
              <option value="">– valitse –</option>
              <option value="Oma">Oma</option>
              <option value="Vuokra">Vuokra</option>
            </select>
          </Field>
          <Field label="Tontin pinta-ala (m²)">
            <input type="number" step="0.01" className={inputCls} value={form.plot_area_m2 ?? ''}
              onChange={(e) => set('plot_area_m2', num(e.target.value))} />
          </Field>
          <Field label="Vuokra-aika päättyy">
            <input type="date" className={inputCls} value={form.plot_lease_end ?? ''}
              onChange={(e) => set('plot_lease_end', e.target.value || null)} />
          </Field>
          <Field label="Vuokranantaja">
            <input className={inputCls} value={form.plot_landlord}
              onChange={(e) => str('plot_landlord', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Vapaa rakennusoikeus">
              <input className={inputCls} value={form.building_rights_unused}
                onChange={(e) => str('building_rights_unused', e.target.value)} placeholder="esim. – tai 200 k-m²" />
            </Field>
          </div>
        </div>
      </Card>

      {/* Rakennus */}
      <Card title="Rakennustiedot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Talotyyppi / kuvaus">
            <input className={inputCls} value={form.building_type}
              onChange={(e) => str('building_type', e.target.value)} placeholder="esim. 2-kerroksinen paritalo" />
          </Field>
          <Field label="Rakennusvuosi">
            <input type="number" className={inputCls} value={form.built_year ?? ''}
              onChange={(e) => set('built_year', num(e.target.value))} placeholder="esim. 1990" />
          </Field>
          <Field label="Rakennusten lukumäärä">
            <input type="number" className={inputCls} value={form.building_count ?? ''}
              onChange={(e) => set('building_count', num(e.target.value))} />
          </Field>
          <Field label="Kerrosluku">
            <input type="number" className={inputCls} value={form.floors ?? ''}
              onChange={(e) => set('floors', num(e.target.value))} />
          </Field>
          <Field label="Pääasiallinen rakennusaine">
            <input className={inputCls} value={form.building_material}
              onChange={(e) => str('building_material', e.target.value)} placeholder="esim. Puurunko, lautaverhous" />
          </Field>
          <Field label="Kattotyyppi">
            <input className={inputCls} value={form.roof_type}
              onChange={(e) => str('roof_type', e.target.value)} placeholder="esim. harjakatto" />
          </Field>
          <Field label="Katemateriaali">
            <input className={inputCls} value={form.roof_material}
              onChange={(e) => str('roof_material', e.target.value)} placeholder="esim. pelti, tiili" />
          </Field>
          <Field label="Lämmitysjärjestelmä">
            <input className={inputCls} value={form.heating_system}
              onChange={(e) => str('heating_system', e.target.value)} placeholder="esim. kaukolämpö, suorasähkö" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Ilmanvaihtojärjestelmä">
              <input className={inputCls} value={form.ventilation_system}
                onChange={(e) => str('ventilation_system', e.target.value)} placeholder="esim. koneellinen poisto, liesituulettimet" />
            </Field>
          </div>
          <Field label="Antennijärjestelmä">
            <input className={inputCls} value={form.antenna_system}
              onChange={(e) => str('antenna_system', e.target.value)} placeholder="esim. Kaapeli-tv" />
          </Field>
          <Field label="Vakuutus">
            <input className={inputCls} value={form.insurance_company}
              onChange={(e) => str('insurance_company', e.target.value)} placeholder="esim. OP-Pohjola, kiinteistön täysarvovakuutus" />
          </Field>
        </div>
      </Card>

      {/* Pinta-alat */}
      <Card title="Pinta-alat ja tilavuus">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Kerrosala (m²)">
            <input type="number" step="0.01" className={inputCls} value={form.floor_area_m2 ?? ''}
              onChange={(e) => set('floor_area_m2', num(e.target.value))} />
          </Field>
          <Field label="Tilavuus (m³)">
            <input type="number" step="0.01" className={inputCls} value={form.volume_m3 ?? ''}
              onChange={(e) => set('volume_m3', num(e.target.value))} />
          </Field>
        </div>
      </Card>

      {/* Autopaikat */}
      <Card title="Autopaikkatiedot">
        <Field label="Kuvaus autopaikoista">
          <textarea rows={2} className={inputCls + ' resize-none'} value={form.parking_info}
            onChange={(e) => str('parking_info', e.target.value)}
            placeholder="esim. Asuntokohtaiset autokatokset. Taloyhtiöllä kaksi vieraspaikkaa." />
        </Field>
      </Card>

      {/* Henkilöt */}
      <Card title="Isännöitsijä ja hallinto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Isännöitsijä">
            <input className={inputCls} value={form.manager_name}
              onChange={(e) => str('manager_name', e.target.value)} />
          </Field>
          <Field label="Isännöitsijän sähköposti">
            <input type="email" className={inputCls} value={form.manager_email}
              onChange={(e) => str('manager_email', e.target.value)} />
          </Field>
          <Field label="Isännöitsijän puhelin">
            <input type="tel" className={inputCls} value={form.manager_phone}
              onChange={(e) => str('manager_phone', e.target.value)} />
          </Field>
          <Field label="Hallituksen puheenjohtaja">
            <input className={inputCls} value={form.board_chair_name}
              onChange={(e) => str('board_chair_name', e.target.value)} />
          </Field>
          <Field label="Tilintarkastaja">
            <input className={inputCls} value={form.auditor_name}
              onChange={(e) => str('auditor_name', e.target.value)} />
          </Field>
        </div>
      </Card>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
          Tiedot tallennettu ✓
        </p>
      )}

      <button type="submit" disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
        {loading ? 'Tallennetaan...' : 'Tallenna tiedot'}
      </button>
    </form>
  )
}
