'use client';

import { useState } from 'react';
import { Wallet, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WalletDropdown } from './wallet-dropdown';

export function ConnectWalletButton() {
  const router = useRouter();
  const { isConnected, publicKey, isLoading, connect, error } = useStellarWallet();
  const [showDialog, setShowDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      console.log('🔄 Attempting to connect to Freighter...');
      await connect();
      console.log('✅ Connected successfully!');
      setShowDialog(false);
      
      // Redirect to dashboard after successful connection
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Error is handled in the hook
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  // Show dropdown when connected
  if (isConnected && publicKey) {
    return <WalletDropdown />;
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="bg-yellow-400 text-black hover:bg-yellow-500 gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Stellar Wallet</DialogTitle>
            <DialogDescription>
              Connect your Freighter wallet to interact with Sorobai Studio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Freighter Option */}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              <div className="h-12 w-12 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Freighter</p>
                <p className="text-sm text-muted-foreground">
                  Official Stellar wallet
                </p>
              </div>
              {isConnecting && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
                {error.includes('not installed') && (
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 mt-2"
                  >
                    Install Freighter
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
