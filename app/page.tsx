'use client'

import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import CatalogSection from '@/components/CatalogSection'
import CartDrawer from '@/components/CartDrawer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-onyx">
      <Navbar />
      <HeroSection />
      <CatalogSection />
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </main>
  )
}
