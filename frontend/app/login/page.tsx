'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { loginByEmail } from '@/lib/app-store'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const user = await loginByEmail(email)
    if (!user) {
      setError('No account found for that email. Join the platform to create one.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Sign in
            </p>
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Welcome back</h1>
            <p className="text-[#6B7280]">
              Use the email you registered with. You will land on your live dashboard.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#2D8A6F] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#256F5A] transition-colors"
              >
                Continue to dashboard
              </button>
            </form>
            <p className="text-sm text-[#6B7280] text-center mt-6">
              New here?{' '}
              <Link href="/join" className="text-[#2D8A6F] font-medium hover:underline">
                Join the platform
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
