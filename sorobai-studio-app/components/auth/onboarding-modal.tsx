'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Github, ArrowRight, Check } from 'lucide-react';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/lib/hooks/use-wallet-auth';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const searchParams = useSearchParams();
  const wallet = useStellarWallet();
  const auth = useWalletAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const router = useRouter();

  const handleWalletConnect = async () => {
    try {
      // Conectar wallet
      await wallet.connect();

      // Autenticar (incluye registro si es primera vez)
      await auth.authenticate();

      // Pasar al Step 2 (GitHub)
      setStep(2);
    } catch (error) {
      console.error('Failed to authenticate:', error);
    }
  };

  const getRedirectUrl = () => {
    const returnUrl = searchParams?.get('return');
    return returnUrl ? decodeURIComponent(returnUrl) : '/dashboard';
  };

  const handleSkipGithub = () => {
    onOpenChange(false);
    router.push(getRedirectUrl());
  };

  const handleConnectGithub = () => {
    // TODO: Implementar OAuth de GitHub
    onOpenChange(false);
    router.push(getRedirectUrl());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Welcome to Sorobai Studio</DialogTitle>
              <DialogDescription>
                Connect your Stellar wallet to get started
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">Step 1: Connect Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Stellar wallet is your identity on Sorobai Studio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-lg opacity-50">
                <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                  <Github className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">Step 2: Link GitHub (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Required only for publishing contracts and earning bounties
                  </p>
                </div>
              </div>

              <Button
                onClick={handleWalletConnect}
                className="w-full bg-black text-white hover:bg-black/90"
                size="lg"
                disabled={auth.isAuthenticating}
              >
                {auth.isAuthenticating ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Freighter Wallet
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Don't have Freighter?{' '}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Install it here
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Link Your GitHub</DialogTitle>
              <DialogDescription>
                Connect GitHub to publish contracts and participate in bounties
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-green-900">Wallet Connected</h3>
                  <p className="text-sm text-green-700 font-mono text-xs">
                    {wallet.publicKey?.slice(0, 8)}...{wallet.publicKey?.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Why link GitHub?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Publish contracts to the Community Hub</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Participate in bounties and earn rewards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Build your developer reputation</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleConnectGithub}
                  className="w-full bg-black text-white hover:bg-black/90"
                  size="lg"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Connect GitHub
                </Button>

                <Button
                  onClick={handleSkipGithub}
                  variant="ghost"
                  className="w-full"
                  size="lg"
                >
                  Skip for now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                You can always link GitHub later in Settings
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
