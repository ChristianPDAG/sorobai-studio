'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';
import { requestNonce, verifySignatureAndLogin, getCurrentUser } from '@/app/actions/wallet-auth';
import type { UserWithProfile } from '@/types/wallet-auth';

// Helper functions to manage cookies from client-side
function setCookie(name: string, value: string, days: number = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    }
    return null;
}

interface UseWalletAuthReturn {
    user: UserWithProfile | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    error: string | null;
    authenticate: () => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export function useWalletAuth(): UseWalletAuthReturn {
    const wallet = useStellarWallet();
    const [user, setUser] = useState<UserWithProfile | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for existing authenticated wallet on mount
    useEffect(() => {
        const checkExistingAuth = async () => {
            const storedWallet = getCookie('authenticated_wallet');
            const walletConnected = getCookie('stellar_wallet_connected');

            if (storedWallet && walletConnected === 'true' && wallet.publicKey) {
                try {
                    const result = await getCurrentUser(wallet.publicKey);
                    if (result.success && result.user) {
                        setUser(result.user);
                    }
                } catch (err) {
                    console.error('Failed to restore session:', err);
                }
            }
        };

        if (wallet.publicKey && !wallet.isLoading) {
            checkExistingAuth();
        }
    }, [wallet.publicKey, wallet.isLoading]);

    const authenticate = useCallback(async () => {
        setIsAuthenticating(true);
        setError(null);

        try {
            // Connect wallet if not connected
            let publicKey = wallet.publicKey;

            if (!publicKey) {
                const connection = await wallet.connect();
                publicKey = connection.publicKey;
            }

            if (!publicKey) {
                throw new Error('Failed to get wallet address');
            }

            // Request nonce
            const nonceResponse = await requestNonce(publicKey);

            if (!nonceResponse.success || !nonceResponse.nonce) {
                throw new Error(nonceResponse.error || 'Failed to get authentication challenge');
            }

            // Create message to sign
            const message = `Sign this message to authenticate with Sorobai Studio.\n\nWallet: ${publicKey}\nNonce: ${nonceResponse.nonce}\nTimestamp: ${new Date().toISOString()}`;

            // Sign message
            const signature = await wallet.signMessage(message);

            if (!signature) {
                throw new Error('Failed to sign message');
            }

            // Verify and login
            const verifyResponse = await verifySignatureAndLogin(publicKey, message, signature);
            if (!verifyResponse.success) {
                throw new Error(verifyResponse.error || 'Authentication failed');
            }

            // Set user and store in cookies (not localStorage)
            setUser(verifyResponse.user!);
            setCookie('authenticated_wallet', publicKey, 30);
            setCookie('stellar_wallet_connected', 'true', 30);

        } catch (err: any) {
            const errorMsg = err.message || 'Authentication failed';
            setError(errorMsg);
            throw err;
        } finally {
            setIsAuthenticating(false);
        }
    }, [wallet]);

    const logout = useCallback(() => {
        setUser(null);
        setError(null);
        wallet.disconnect();

        // Delete cookies
        deleteCookie('authenticated_wallet');
        deleteCookie('stellar_wallet_connected');
    }, [wallet]);

    const refreshUser = useCallback(async () => {
        if (!wallet.publicKey) return;

        try {
            const result = await getCurrentUser(wallet.publicKey);
            if (result.success && result.user) {
                setUser(result.user);
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    }, [wallet.publicKey]);

    return {
        user,
        isAuthenticated: !!user,
        isAuthenticating,
        error,
        authenticate,
        logout,
        refreshUser,
    };
}
