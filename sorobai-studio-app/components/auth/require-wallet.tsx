'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';
import { Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequireWalletProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireWallet({ children, fallback }: RequireWalletProps) {
  const { isConnected, isLoading, connect } = useStellarWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for wallet state to be determined
    if (!isLoading) {
      setIsChecking(false);
      
      // If not connected, redirect to home with return URL
      if (!isConnected) {
        const returnUrl = encodeURIComponent(pathname || '/dashboard');
        router.push(`/?auth=required&return=${returnUrl}`);
      }
    }
  }, [isConnected, isLoading, router, pathname]);

  // Show loading state while checking
  if (isLoading || isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  // Show connect prompt if not connected (shouldn't reach here due to redirect)
  if (!isConnected) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold">Wallet Required</h2>
          <p className="text-muted-foreground">
            You need to connect your Stellar wallet to access this page.
          </p>
          <Button 
            onClick={() => connect()}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Wallet is connected, render children
  return <>{children}</>;
}
