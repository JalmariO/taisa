'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
    >
      🖨 Tulosta / PDF
    </button>
  )
}
