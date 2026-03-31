'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import type { RenovationTask } from '@/types/database'

const statusLabel: Record<RenovationTask['status'], string> = {
  todo: 'Tekemättä',
  in_progress: 'Käynnissä',
  done: 'Valmis',
}

const statusColor: Record<RenovationTask['status'], string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-teal-100 text-teal-800',
  done: 'bg-green-100 text-green-800',
}

interface Props {
  renovationId: string
  initialTasks: RenovationTask[]
}

const inputCls =
  'px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition'

export default function TaskList({ renovationId, initialTasks }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [tasks, setTasks] = useState<RenovationTask[]>(initialTasks)
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    setError(null)

    const { data, error } = await supabase
      .from('renovation_tasks')
      .insert({
        renovation_id: renovationId,
        title: title.trim(),
        assignee,
        due_date: dueDate || null,
        status: 'todo',
      })
      .select()
      .single()

    if (error) { setError(error.message); setAdding(false); return }
    setTasks((prev) => [...prev, data as RenovationTask])
    setTitle('')
    setAssignee('')
    setDueDate('')
    setAdding(false)
    router.refresh()
  }

  async function updateStatus(id: string, status: RenovationTask['status']) {
    await supabase.from('renovation_tasks').update({ status }).eq('id', id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  async function deleteTask(id: string) {
    await supabase.from('renovation_tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Task list */}
      {tasks.length > 0 ? (
        <ul className="divide-y divide-teal-50">
          {tasks.map((task) => (
            <li key={task.id} className="py-2.5 flex items-center gap-3">
              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value as RenovationTask['status'])}
                className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-teal-500 ${statusColor[task.status]}`}
              >
                <option value="todo">Tekemättä</option>
                <option value="in_progress">Käynnissä</option>
                <option value="done">Valmis</option>
              </select>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-400">
                  {task.assignee && <span>{task.assignee}</span>}
                  {task.assignee && task.due_date && <span> · </span>}
                  {task.due_date && <span>Deadline: {new Date(task.due_date).toLocaleDateString('fi-FI')}</span>}
                </p>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer px-1"
                title="Poista tehtävä"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">Ei tehtäviä vielä.</p>
      )}

      {/* Add task form */}
      <form onSubmit={addTask} className="pt-2 border-t border-teal-50 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lisää tehtävä</p>
        <div className="flex flex-wrap gap-2">
          <input
            className={inputCls + ' flex-1 min-w-40'}
            placeholder="Tehtävän otsikko *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className={inputCls + ' w-40'}
            placeholder="Vastuuhenkilö"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
          <input
            type="date"
            className={inputCls + ' w-40'}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            {adding ? '...' : '+ Lisää'}
          </button>
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </form>
    </div>
  )
}
