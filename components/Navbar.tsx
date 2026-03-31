'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

const navGroups = [
  {
    label: 'Taloyhtiö',
    items: [
      { href: '/company', label: 'Perustiedot' },
      { href: '/certificates', label: 'Todistukset' },
    ],
  },
  {
    label: 'Suunnittelu',
    items: [
      { href: '/maintenance-plan', label: 'Kunnossapitosuunnitelma' },
      { href: '/renovations', label: 'Remontit' },
    ],
  },
  {
    label: 'Viestintä',
    items: [
      { href: '/announcements', label: 'Ilmoitukset' },
      { href: '/documents', label: 'Dokumentit' },
    ],
  },
  {
    label: 'Huolto',
    items: [
      { href: '/maintenance', label: 'Vikailmoitukset' },
    ],
  },
]

// Flat list for mobile
const allItems = navGroups.flatMap((g) => g.items)

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="bg-teal-800 shadow-md print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/dashboard"
            className="text-xl font-bold text-white tracking-tight hover:text-teal-100 transition-colors shrink-0">
            Taisa
          </Link>

          {/* Desktop grouped nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {/* Dashboard link */}
            <Link href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-teal-600 text-white'
                  : 'text-teal-100 hover:bg-teal-700 hover:text-white'
              }`}>
              Dashboard
            </Link>

            {/* Grouped dropdowns — pure CSS hover, no JS state */}
            {navGroups.map((group) => {
              const groupActive = group.items.some((i) => isActive(i.href))

              return (
                <div key={group.label} className="relative group">
                  {/* Trigger button */}
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      groupActive
                        ? 'bg-teal-600 text-white'
                        : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                    }`}
                  >
                    {group.label}
                    <span className="text-xs opacity-70 transition-transform group-hover:rotate-180">▾</span>
                  </button>

                  {/*
                    Dropdown panel.
                    - `invisible opacity-0` hides it by default.
                    - `group-hover:visible group-hover:opacity-100` shows it on hover.
                    - `pt-2` extends the hoverable area upward to bridge the gap
                      between the button and the panel, preventing mouseLeave flicker.
                    - `top-full` positions it just below the button baseline.
                  */}
                  <div className="absolute top-full left-0 pt-2 w-52 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-100">
                    <div className="bg-white rounded-xl shadow-lg border border-teal-100 py-1">
                      {group.items.map(({ href, label }) => (
                        <Link key={href} href={href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(href)
                              ? 'text-teal-700 font-semibold bg-teal-50'
                              : 'text-slate-700 hover:bg-teal-50 hover:text-teal-800'
                          }`}>
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sign out */}
          <button onClick={handleSignOut}
            className="text-sm text-teal-200 hover:text-white hover:bg-teal-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0">
            Kirjaudu ulos
          </button>
        </div>
      </div>

      {/* Mobile scrollable nav */}
      <div className="lg:hidden border-t border-teal-700 px-2 py-2 flex gap-1 overflow-x-auto bg-teal-800">
        <Link href="/dashboard"
          className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            pathname === '/dashboard' ? 'bg-teal-600 text-white' : 'text-teal-100 hover:bg-teal-700 hover:text-white'
          }`}>
          Dashboard
        </Link>
        {allItems.map(({ href, label }) => (
          <Link key={href} href={href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive(href) ? 'bg-teal-600 text-white' : 'text-teal-100 hover:bg-teal-700 hover:text-white'
            }`}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
