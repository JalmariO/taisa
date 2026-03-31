'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabaseClient'
import type { Attachment, AttachmentEntityType } from '@/types/database'

interface Props {
  entityType: AttachmentEntityType
  entityId?: string        // omit for singleton entities like 'company'
  initialAttachments: Attachment[]
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return '🖼'
  if (mime === 'application/pdf') return '📕'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜'
  return '📄'
}

export default function AttachmentPanel({ entityType, entityId, initialAttachments }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Storage folder: e.g. "renovation/abc-123/" or "company/"
  const folder = entityId ? `${entityType}/${entityId}` : entityType

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    // Session check
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      setError('Istunto vanhentunut. Kirjaudu uudelleen.')
      setUploading(false)
      return
    }

    const storagePath = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: storageErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { upsert: false })

    if (storageErr) {
      setError(storageErr.message)
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(storagePath)

    const { data: inserted, error: dbErr } = await supabase
      .from('attachments')
      .insert({
        entity_type: entityType,
        entity_id: entityId ?? null,
        name: file.name,
        file_url: urlData.publicUrl,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: session.session.user.email ?? '',
      })
      .select()
      .single()

    if (dbErr) {
      // Attempt to clean up orphaned storage file
      await supabase.storage.from('documents').remove([storagePath])
      setError(dbErr.message)
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setAttachments((prev) => [inserted as Attachment, ...prev])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(attachment: Attachment) {
    if (!confirm(`Poistetaanko "${attachment.name}"?`)) return
    setDeletingId(attachment.id)

    // Delete from storage
    await supabase.storage.from('documents').remove([attachment.storage_path])

    // Delete DB record
    const { error: dbErr } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachment.id)

    if (dbErr) {
      setError(dbErr.message)
    } else {
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-3">
      {/* File list */}
      {attachments.length > 0 ? (
        <ul className="divide-y divide-teal-50">
          {attachments.map((a) => (
            <li key={a.id} className="py-2.5 flex items-center gap-3">
              <span className="text-lg leading-none shrink-0">{fileIcon(a.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline truncate block transition-colors"
                >
                  {a.name}
                </a>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString('fi-FI')}
                  {a.file_size ? ` · ${formatBytes(a.file_size)}` : ''}
                  {a.uploaded_by ? ` · ${a.uploaded_by}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(a)}
                disabled={deletingId === a.id}
                className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-40 transition-colors cursor-pointer px-1 shrink-0"
                title="Poista liite"
              >
                {deletingId === a.id ? '…' : '✕'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">Ei liitteitä vielä.</p>
      )}

      {/* Upload row */}
      <div className="flex items-center gap-3 pt-2 border-t border-teal-50">
        <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors border ${
          uploading
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
        }`}>
          {uploading ? (
            <>
              <span className="animate-spin">⟳</span> Ladataan...
            </>
          ) : (
            <>
              ⬆ Lisää liite
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
        <span className="text-xs text-slate-400">PDF, Word, kuva, taulukko…</span>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
