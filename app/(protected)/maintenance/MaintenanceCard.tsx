'use client'

import { useState } from 'react'
import type { MaintenanceRequest, Attachment } from '@/types/database'
import AttachmentPanel from '@/components/AttachmentPanel'

const statusLabel: Record<MaintenanceRequest['status'], string> = {
  open: 'Avoin',
  in_progress: 'Käsittelyssä',
  closed: 'Suljettu',
}

const statusColor: Record<MaintenanceRequest['status'], string> = {
  open: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-teal-100 text-teal-800',
  closed: 'bg-slate-100 text-slate-500',
}

interface Props {
  request: MaintenanceRequest
  initialAttachments: Attachment[]
}

export default function MaintenanceCard({ request: req, initialAttachments }: Props) {
  const [showAttachments, setShowAttachments] = useState(false)

  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-sm shadow-teal-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{req.title}</p>
          <p className="text-sm text-slate-600 mt-1">{req.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-slate-400">
              {new Date(req.created_at).toLocaleDateString('fi-FI', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <button
              onClick={() => setShowAttachments((v) => !v)}
              className="text-xs text-teal-600 hover:text-teal-800 font-medium cursor-pointer transition-colors"
            >
              {showAttachments ? 'Piilota liitteet' : `Liitteet${initialAttachments.length > 0 ? ` (${initialAttachments.length})` : ''}`}
            </button>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[req.status]}`}>
          {statusLabel[req.status]}
        </span>
      </div>
      {showAttachments && (
        <div className="mt-3 pt-3 border-t border-teal-50">
          <AttachmentPanel
            entityType="maintenance_request"
            entityId={req.id}
            initialAttachments={initialAttachments}
          />
        </div>
      )}
    </div>
  )
}
