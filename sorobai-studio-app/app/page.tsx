import { Suspense } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { Footer } from '@/components/marketing/footer';
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <main className="flex-1">
          <Hero />
          <Features />
        </main>
      </Suspense>
      <Footer />
    </div>
  );
}

