export interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

/** Legacy general-area document (kept for backwards compat) */
export interface Document {
  id: string
  name: string
  file_url: string
  created_at: string
}

export type AttachmentEntityType =
  | 'general'
  | 'company'
  | 'renovation'
  | 'maintenance_plan'
  | 'maintenance_request'
  | 'announcement'
  | 'certificate'

export interface Attachment {
  id: string
  entity_type: AttachmentEntityType
  entity_id: string | null
  name: string
  file_url: string
  storage_path: string
  file_size: number | null
  mime_type: string
  uploaded_by: string
  created_at: string
}

export interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'closed'
  created_at: string
}

// ── Extensions ───────────────────────────────────────────────

export interface CompanyInfo {
  id: 1
  company_name: string
  business_id: string
  address: string
  postal_code: string
  city: string
  built_year: number | null
  floor_area_m2: number | null
  volume_m3: number | null
  plot_area_m2: number | null
  property_id: string
  apartment_count: number | null
  total_shares: number | null
  manager_name: string
  manager_email: string
  manager_phone: string
  auditor_name: string
  board_chair_name: string
  bank_account: string
  // Rekisteritiedot
  trade_register_date: string | null
  articles_date: string | null
  // Tontti
  plot_type: string
  plot_lease_end: string | null
  plot_landlord: string
  building_rights_unused: string
  // Rakennus
  building_count: number | null
  building_type: string
  building_material: string
  floors: number | null
  roof_type: string
  roof_material: string
  heating_system: string
  ventilation_system: string
  antenna_system: string
  insurance_company: string
  parking_info: string
  updated_at: string
}

export interface MaintenancePlanItem {
  id: string
  target: string
  description: string
  planned_year: number | null
  estimated_cost: number | null
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'planned' | 'in_progress' | 'done'
  notes: string
  /** Käyttöikä vuosina (esim. 40) */
  service_life_years: number | null
  /** Huoltoväli vuosina (esim. 10) */
  maintenance_interval_years: number | null
  /** Priorisointi-kategoria (esim. "Kiireellinen", "Suositeltava", "Seurattava") */
  priority_category: string
  created_at: string
  updated_at: string
}

export interface Renovation {
  id: string
  name: string
  description: string
  renovation_type: 'planned' | 'ongoing' | 'completed'
  fiscal_year: number | null       // Tilikausi / suoritusvuosi
  renovation_category: string      // Vapaa kategoria (Katto, LVIS, …)
  start_date: string | null
  end_date: string | null
  total_cost: number | null
  estimated_cost: number | null
  contractor: string
  contractor_email: string
  contractor_phone: string
  notes: string
  created_at: string
  updated_at: string
}

export interface RenovationTask {
  id: string
  renovation_id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  due_date: string | null
  notes: string
  created_at: string
}

export interface ManagerCertificate {
  id: string
  issued_date: string
  recipient_name: string
  apartment_number: string
  share_numbers: string
  share_count: number | null
  floor_area_m2: number | null
  rooms: string
  apartment_purpose: string
  ownership_percentage: string
  debt_free_price: number | null
  loan_share: number | null
  overdue_payments: number | null
  maintenance_charge: number | null
  maintenance_charge_basis: string
  financing_charge: number | null
  other_charges: string
  water_charge: string
  encumbrances: string
  restrictions: string
  remarks: string
  included_renovations: string[]   // JSONB array of strings
  requester_apartment: string
  created_by: string
  created_at: string
}
