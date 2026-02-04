import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'PersonalCRM',
  description: 'AI-assisted CRM for personal projects and partnerships',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
