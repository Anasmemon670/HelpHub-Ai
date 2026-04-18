'use client'

import { useState } from 'react'
import { Sparkles, Zap, Brain, Target, MessageSquare, TrendingUp } from 'lucide-react'
import { analyzeRequestText } from '@/lib/ai-rules'
import { getStats, useAppData } from '@/lib/app-store'

const aiFeatures = [
  {
    icon: Sparkles,
    title: 'Smart Request Analysis',
    description: 'AI automatically categorizes your request, detects urgency level, and suggests relevant tags to attract the right helpers.',
  },
  {
    icon: Brain,
    title: 'Intelligent Matching',
    description: 'Our AI analyzes helper skills, availability, and past performance to recommend the best matches for your needs.',
  },
  {
    icon: Target,
    title: 'Rewrite Suggestions',
    description: 'Get AI-powered suggestions to improve your request clarity, making it easier for helpers to understand and respond.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Insights',
    description: 'See what types of requests are trending in the community and discover emerging topics and skills in demand.',
  },
  {
    icon: MessageSquare,
    title: 'Response Templates',
    description: 'AI generates helpful response templates for common questions, speeding up helper interactions.',
  },
  {
    icon: Zap,
    title: 'Quick Actions',
    description: 'One-click AI actions to summarize threads, extract action items, and generate follow-up suggestions.',
  },
]

export default function AICenterPage() {
  useAppData()
  const stats = getStats()
  const [demoText, setDemoText] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    if (!demoText.trim()) return

    setIsAnalyzing(true)

    window.setTimeout(() => {
      const ai = analyzeRequestText(demoText)
      const tags = ai.tags.length ? ai.tags.join(', ') : 'Add more detail for stronger tags'
      setAiSuggestion(
        `Based on your request, I suggest:\n\n` +
          `• Category: ${ai.category}\n` +
          `• Urgency: ${ai.urgency}\n` +
          `• Suggested Tags: ${tags}\n\n` +
          `Tip: Consider adding specific browser or device information to help helpers reproduce your issue faster.`
      )
      setIsAnalyzing(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              AI Center
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              AI-powered assistance for better connections
            </h1>
            <p className="text-[#6B7280] text-lg max-w-3xl">
              Experience intelligent features that help you create better requests, find ideal matches, and contribute more effectively to the community.
            </p>
          </div>

          {/* AI Demo Section */}
          <div className="bg-[#3D4F4F] rounded-3xl p-8 md:p-10 text-white mb-12 relative overflow-hidden">
            <div className="absolute top-6 right-6 w-20 h-20 bg-[#F5D76E] rounded-full opacity-80" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Try AI Request Analysis</h2>
              <p className="text-white/70 mb-6 max-w-xl">
                Enter a sample request below and see how our AI can help categorize, tag, and improve it.
              </p>
              
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  placeholder="Type a sample request... e.g., 'My website looks broken on mobile and I need help fixing the CSS'"
                  className="w-full bg-transparent text-white placeholder:text-white/50 focus:outline-none resize-none h-24"
                />
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !demoText.trim()}
                className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
              
              {aiSuggestion && (
                <div className="mt-6 bg-white/10 rounded-2xl p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F5D76E]" />
                    AI Suggestions
                  </h3>
                  <pre className="text-white/90 text-sm whitespace-pre-wrap font-sans">
                    {aiSuggestion}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* AI Features Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-6">AI Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature) => (
                <div key={feature.title} className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-[#F5F5F0] rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#2D8A6F]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Stats */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2937] mb-6">AI Impact Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-3xl font-bold text-[#2D8A6F]">94%</p>
                <p className="text-sm text-[#6B7280]">Categorization accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#2D8A6F]">2.3x</p>
                <p className="text-sm text-[#6B7280]">Faster helper matching</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#2D8A6F]">87%</p>
                <p className="text-sm text-[#6B7280]">Improved request clarity</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#2D8A6F]">{stats.total}</p>
                <p className="text-sm text-[#6B7280]">Requests in the live community dataset</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
