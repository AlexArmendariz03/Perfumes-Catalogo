import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ararat Perfumes — Fragancias de Lujo',
  description: 'Catálogo exclusivo de perfumes orientales y de lujo. Descubre nuestras fragancias únicas y solicita tu cotización.',
  keywords: 'perfumes, fragancias, lujo, oriental, oud, ararat',
  openGraph: {
    title: 'Ararat Perfumes',
    description: 'Fragancias exclusivas de lujo',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
