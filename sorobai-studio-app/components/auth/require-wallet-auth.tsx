'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/lib/hooks/use-wallet-auth';
import { Loader2 } from 'lucide-react';

interface RequireWalletAuthProps {
    children: React.ReactNode;
    fallbackUrl?: string;
    loadingComponent?: React.ReactNode;
}

/**
 * Component to protect routes that require wallet authentication
 * Redirects to fallback URL if user is not authenticated
 */
export function RequireWalletAuth({
    children,
    fallbackUrl = '/auth/wallet-test',
    loadingComponent
}: RequireWalletAuthProps) {
    const { isAuthenticated, user } = useWalletAuth();
    const router = useRouter();

    useEffect(() => {
        // If not authenticated and not loading, redirect
        if (!isAuthenticated && user === null) {
            const timeout = setTimeout(() => {
                router.push(fallbackUrl);
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [isAuthenticated, user, router, fallbackUrl]);

    // Show loading state while checking authentication
    if (user === null && !isAuthenticated) {
        return loadingComponent || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Show children if authenticated
    if (isAuthenticated && user) {
        return <>{children}</>;
    }

    // Show loading while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground">Redirecting to authentication...</p>
            </div>
        </div>
    );
}
