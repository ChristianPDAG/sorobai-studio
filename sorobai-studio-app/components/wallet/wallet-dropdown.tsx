'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Copy,
  Check,
  ExternalLink,
  User,
  Settings,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';

export function WalletDropdown() {
  const router = useRouter();
  const { publicKey, disconnect } = useStellarWallet();
  const [copied, setCopied] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock data - En producción, esto vendría de la blockchain
  const balance = '1,234.56';
  const network = 'Testnet' as 'Testnet' | 'Mainnet';

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleViewOnExplorer = () => {
    if (!publicKey) return;
    const explorerUrl = network === 'Mainnet'
      ? `https://stellar.expert/explorer/public/account/${publicKey}`
      : `https://stellar.expert/explorer/testnet/account/${publicKey}`;
    window.open(explorerUrl, '_blank');
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDisconnectDialog(false);
    setIsDropdownOpen(false);
    router.push('/');
  };

  if (!publicKey) return null;

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 min-w-[140px] justify-start"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline font-mono text-xs">
              {truncateAddress(publicKey)}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[280px]">
          {/* Header con balance */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">My Wallet</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  network === 'Mainnet' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {network}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{balance}</p>
                <p className="text-sm text-muted-foreground">XLM</p>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <p className="text-xs font-mono flex-1 truncate">
                  {publicKey}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="flex-shrink-0 hover:bg-background rounded p-1 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false);
              router.push(`/profile/${publicKey}`);
            }}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false);
              router.push('/settings');
            }}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleViewOnExplorer}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Disconnect */}
          <DropdownMenuItem
            onClick={() => setShowDisconnectDialog(true)}
            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle>Disconnect Wallet?</DialogTitle>
                <DialogDescription className="mt-1">
                  Are you sure you want to disconnect your wallet?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">
                You will be disconnected from:
              </p>
              <p className="text-sm font-mono break-all">
                {publicKey}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You'll need to reconnect your wallet to access protected features.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
