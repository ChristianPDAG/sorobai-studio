'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ConnectWalletButton } from '@/components/wallet/connect-wallet-button';

export function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname?.includes(path);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-serif font-bold">Sorobai Studio</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/studio" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive('/studio') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Studio
            </Link>
            <Link 
              href="/hub" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive('/hub') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Hub
            </Link>
            <Link 
              href="/bounties" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive('/bounties') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Bounties
            </Link>
            <Link 
              href="https://developers.stellar.org" 
              target="_blank"
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Docs
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
}
