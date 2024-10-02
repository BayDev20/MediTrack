import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MedStock',
  description: 'Urgent care inventory management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
