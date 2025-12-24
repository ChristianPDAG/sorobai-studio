'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingModal } from '@/components/auth/onboarding-modal';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';
import { useRouter } from 'next/navigation';

export function Hero() {
  const searchParams = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isConnected } = useStellarWallet();
  const router = useRouter();

  // Check if user was redirected here due to auth requirement
  useEffect(() => {
    const authRequired = searchParams?.get('auth');
    if (authRequired === 'required' && !isConnected) {
      setShowOnboarding(true);
    }
  }, [searchParams, isConnected]);

  const handleStartBuilding = () => {
    if (isConnected) {
      // Check if there's a return URL
      const returnUrl = searchParams?.get('return') || '/dashboard';
      router.push(decodeURIComponent(returnUrl));
    } else {
      setShowOnboarding(true);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-4rem)] py-16 sm:py-20 lg:py-24">
            {/* Left Column - Text */}
            <div className="space-y-8 max-w-2xl mx-auto lg:mx-0">
              <div className="space-y-6">
                <p className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
                  STELLAR AI DEVELOPER TOOLS
                </p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1]">
                  Build Soroban Smart Contracts with AI
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  AI-powered IDE for building, testing, and deploying on Stellar
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-black text-white hover:bg-black/90 group h-12 px-8"
                  onClick={handleStartBuilding}
                >
                  {isConnected ? 'Go to Dashboard' : 'Start Building'}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 px-8"
                  asChild
                >
                  <Link href="https://developers.stellar.org" target="_blank">
                    View Documentation
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground pt-4">
                Powered by Soroban
              </p>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative order-first lg:order-last">
              <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
                <img
                  src="/hero-tree.png"
                  alt="Sorobai Studio - Bridging nature and technology on Stellar"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />
    </>
  );
}
