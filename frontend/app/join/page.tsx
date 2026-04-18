'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Users, Zap, Shield } from 'lucide-react'
import { registerUser, setCurrentUserId } from '@/lib/app-store'

const benefits = [
  {
    icon: Users,
    title: 'Join the community',
    description: 'Connect with 384+ students, mentors, and builders who want to help each other grow.',
  },
  {
    icon: Zap,
    title: 'Get faster help',
    description: 'AI-powered matching ensures your requests reach the right people quickly.',
  },
  {
    icon: Shield,
    title: 'Build trust score',
    description: 'Earn badges and recognition as you help others in the community.',
  },
]

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    skills: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = await registerUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      skills: formData.skills,
    })
    setCurrentUserId(user.id)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#2D8A6F] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Welcome to HelpHub AI!</h2>
          <p className="text-[#6B7280] mb-6">
            Your account has been created. You can now start exploring requests and helping others.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left - Info */}
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Join Us
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
                Become part of the HelpHub AI community
              </h1>
              <p className="text-[#6B7280] text-lg mb-10">
                Whether you need help or want to offer it, joining takes less than a minute.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-[#2D8A6F]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-[#2D8A6F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-1">{benefit.title}</h3>
                      <p className="text-[#6B7280] text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Create your account</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    I am a...
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                  >
                    <option>Student</option>
                    <option>Mentor</option>
                    <option>Professional</option>
                    <option>Creator</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Skills (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., Web Development, Design, Python"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2D8A6F] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#256F5A] transition-colors"
                >
                  Join the platform
                </button>

                <p className="text-sm text-[#6B7280] text-center">
                  By joining, you agree to our community guidelines and terms of service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
