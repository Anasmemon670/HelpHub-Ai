'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { getNotificationsForUser, setCurrentUserId, useSessionUserId } from '@/lib/app-store'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/ai-center', label: 'AI Center' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const sessionId = useSessionUserId()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!sessionId) {
      setUnreadCount(0)
      return
    }
    void (async () => {
      const { unreadCount: count } = await getNotificationsForUser(sessionId)
      if (!cancelled) setUnreadCount(count)
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-[#E5E5E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2D8A6F] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-semibold text-[#1F2937] text-lg">HelpHub AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white text-[#1F2937] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/notifications" className="text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
              Live community signals
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-[#2D8A6F] text-white text-[10px] font-semibold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            {sessionId ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setCurrentUserId(null)}
                  className="text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/join"
                  className="bg-[#2D8A6F] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#256F5A] transition-colors"
                >
                  Join the platform
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#1F2937]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1F2937]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E5E0]">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-white text-[#1F2937] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-white/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {sessionId ? (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-white/50"
                  >
                    Notifications
                    {unreadCount > 0 ? ` (${unreadCount > 99 ? '99+' : unreadCount})` : ''}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-white/50"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUserId(null)
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-white/50 text-left w-full"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-white/50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/join"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-[#2D8A6F] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#256F5A] transition-colors text-center mt-2"
                  >
                    Join the platform
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
