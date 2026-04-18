import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { StateBootstrap } from '@/components/state-bootstrap'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'HelpHub AI | Community Support Platform',
  description: 'HelpHub AI is a community-powered support network for students, mentors, creators, and builders.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#F5F5F0]">
      <body className={`${inter.variable} font-sans antialiased bg-[#F5F5F0] min-h-screen`}>
        <StateBootstrap />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
