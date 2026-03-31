import Navbar from '@/components/Navbar'
import { ReactNode } from 'react'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
