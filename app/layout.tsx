import './globals.css'
import type { Metadata } from 'next'
import { ThemeProviderWrapper } from './ThemeProviderWrapper'

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
      <body>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  )
}
