import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-teal-100 shadow-sm shadow-teal-50 p-5 ${className}`}>
      {title && (
        <h2 className="text-base font-semibold text-slate-800 mb-3">{title}</h2>
      )}
      {children}
    </div>
  )
}
