'use client'

import { useState } from 'react'
import type { Announcement, Attachment } from '@/types/database'
import AttachmentPanel from '@/components/AttachmentPanel'

interface Props {
  announcement: Announcement
  initialAttachments: Attachment[]
}

export default function AnnouncementCard({ announcement: a, initialAttachments }: Props) {
  const [showAttachments, setShowAttachments] = useState(false)

  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-sm shadow-teal-50 p-4">
      <p className="text-sm font-semibold text-slate-800">{a.title}</p>
      <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{a.content}</p>
      <div className="flex items-center gap-4 mt-3">
        <p className="text-xs text-slate-400">
          {new Date(a.created_at).toLocaleDateString('fi-FI', {
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
      {showAttachments && (
        <div className="mt-3 pt-3 border-t border-teal-50">
          <AttachmentPanel
            entityType="announcement"
            entityId={a.id}
            initialAttachments={initialAttachments}
          />
        </div>
      )}
    </div>
  )
}
