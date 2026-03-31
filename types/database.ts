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
  manager_name: string
  manager_email: string
  manager_phone: string
  auditor_name: string
  board_chair_name: string
  bank_account: string
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
  created_at: string
  updated_at: string
}

export interface Renovation {
  id: string
  name: string
  description: string
  renovation_type: 'planned' | 'ongoing' | 'completed'
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
  debt_free_price: number | null
  loan_share: number | null
  maintenance_charge: number | null
  financing_charge: number | null
  other_charges: string
  encumbrances: string
  remarks: string
  created_by: string
  created_at: string
}
