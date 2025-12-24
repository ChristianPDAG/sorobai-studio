import { Sidebar } from '@/components/shared/sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ConnectWalletButton } from '@/components/wallet/connect-wallet-button';
import { RequireWallet } from '@/components/auth/require-wallet';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireWallet>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slim Top Bar - Only User Controls */}
          <header className="h-12 border-b flex items-center justify-end px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <ConnectWalletButton />
              <ThemeSwitcher />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </RequireWallet>
  );
}
