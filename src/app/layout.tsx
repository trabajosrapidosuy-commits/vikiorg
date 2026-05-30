import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Victoriosa - Premium Beauty & Aesthetics',
  description: 'Discover premium skincare and beauty products delivered to your door',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900">
        <header className="bg-victoriosa-primary text-white p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_BRAND_NAME || 'Victoriosa'}</h1>
            <p className="text-sm opacity-90">{process.env.NEXT_PUBLIC_BRAND_DESCRIPTION}</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
        <footer className="bg-gray-100 text-center p-4 mt-8 text-sm">
          <p>&copy; 2026 {process.env.NEXT_PUBLIC_BRAND_NAME || 'Victoriosa'}. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
