'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RequestModal({ isOpen, onClose }: RequestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    urgency: 'Medium',
    description: '',
    tags: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('Request submitted successfully!')
    onClose()
    setFormData({
      title: '',
      category: 'Web Development',
      urgency: 'Medium',
      description: '',
      tags: '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1F2937]">Post a Request</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Request Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Need help making my portfolio responsive"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                >
                  <option>Web Development</option>
                  <option>Design</option>
                  <option>Career</option>
                  <option>Mobile</option>
                  <option>Backend</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your problem in detail..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., HTML/CSS, Responsive, Portfolio"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-[#E5E5E0] text-[#6B7280] font-medium hover:bg-[#F5F5F0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-[#2D8A6F] text-white font-medium hover:bg-[#256F5A] transition-colors"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
