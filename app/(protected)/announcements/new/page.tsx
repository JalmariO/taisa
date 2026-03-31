'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('announcements')
      .insert({ title, content })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/announcements')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Uusi ilmoitus</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Otsikko
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
              Sisältö
            </label>
            <textarea
              id="content"
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {loading ? 'Tallennetaan...' : 'Tallenna'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Peruuta
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
