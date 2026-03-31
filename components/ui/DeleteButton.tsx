'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

interface Props {
  id: string
  table: string
  redirectTo: string
  label?: string
}

export default function DeleteButton({ id, table, redirectTo, label = 'Poista' }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Poistetaanko tämä merkintä pysyvästi?')) return
    setLoading(true)
    await supabase.from(table).delete().eq('id', id)
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? 'Poistetaan…' : label}
    </button>
  )
}
