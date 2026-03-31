'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function UploadDocument() {
  const router = useRouter()
  const supabase = createClient()

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    // Ensure the session is fresh before any authenticated operation.
    // Without this, RLS rejects the request if the token has expired.
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      setError('Et ole kirjautunut sisään. Kirjaudu uudelleen.')
      setLoading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${Date.now()}.${fileExt}`

    // Upload to Supabase Storage (bucket: "documents")
    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (storageError) {
      setError(storageError.message)
      setLoading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)

    // Save record to DB
    const { error: dbError } = await supabase
      .from('documents')
      .insert({ name: file.name, file_url: urlData.publicUrl })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setFile(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <input
        type="file"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
      />

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
          Tiedosto ladattu onnistuneesti!
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
      >
        {loading ? 'Ladataan...' : 'Lataa tiedosto'}
      </button>
    </form>
  )
}
