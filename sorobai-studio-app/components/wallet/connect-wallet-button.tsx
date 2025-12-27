'use client';

import { useState } from 'react';
import { Wallet, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletAuth } from '@/lib/hooks/use-wallet-auth';
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
  const wallet = useStellarWallet();
  const auth = useWalletAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 1. Conectar wallet (Freighter popup)
      await wallet.connect();

      // 2. Autenticar (firma + registro/login)
      await auth.authenticate();

      // 3. Cerrar modal y redirect
      setShowDialog(false);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Connection failed:', error);
      // Mostrar error al usuario
    } finally {
      setIsConnecting(false);
    }
  };

  // Si ya está autenticado, mostrar dropdown
  if (auth.isAuthenticated) {
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

            {/* Error handling UI can be added here if needed */}

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
