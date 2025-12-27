'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';
import { requestNonce, verifySignatureAndLogin, getCurrentUser } from '@/app/actions/wallet-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletAuthButtonProps {
    onSuccess?: (user: any) => void;
    onError?: (error: string) => void;
}

export function WalletAuthButton({ onSuccess, onError }: WalletAuthButtonProps) {
    const wallet = useStellarWallet();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authStep, setAuthStep] = useState<'idle' | 'connecting' | 'signing' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const handleAuthenticate = async () => {
        setIsAuthenticating(true);
        setAuthStep('connecting');
        setErrorMessage(null);

        try {
            // Step 1: Connect wallet
            let publicKey = wallet.publicKey;

            if (!publicKey) {
                console.log('🔌 Connecting wallet...');
                const connection = await wallet.connect();
                publicKey = connection.publicKey;
            }

            if (!publicKey) {
                throw new Error('Failed to get wallet address');
            }

            console.log('✅ Wallet connected:', publicKey);

            // Step 2: Request nonce
            setAuthStep('signing');
            console.log('📝 Requesting nonce...');

            const nonceResponse = await requestNonce(publicKey);

            if (!nonceResponse.success || !nonceResponse.nonce) {
                throw new Error(nonceResponse.error || 'Failed to get authentication challenge');
            }

            console.log('✅ Nonce received');

            // Step 3: Create message to sign
            const message = `Sign this message to authenticate with Sorobai Studio.\n\nWallet: ${publicKey}\nNonce: ${nonceResponse.nonce}\nTimestamp: ${new Date().toISOString()}`;

            console.log('🖊️ Requesting signature...');

            // Sign the message with Freighter
            const signature = await wallet.signMessage(message);

            if (!signature) {
                throw new Error('Failed to sign message');
            }

            console.log('✅ Message signed');

            // Step 4: Verify signature and login
            setAuthStep('verifying');
            console.log('🔐 Verifying signature...');

            const verifyResponse = await verifySignatureAndLogin(publicKey, message, signature);

            if (!verifyResponse.success) {
                throw new Error(verifyResponse.error || 'Authentication failed');
            }

            console.log('✅ Authentication successful:', verifyResponse.user);

            // Step 5: Success
            setAuthStep('success');
            setUser(verifyResponse.user);

            if (onSuccess) {
                onSuccess(verifyResponse.user);
            }

            // Store wallet address in localStorage for session persistence
            localStorage.setItem('authenticated_wallet', publicKey);

        } catch (error: any) {
            console.error('❌ Authentication error:', error);
            setAuthStep('error');
            const errorMsg = error.message || 'Authentication failed';
            setErrorMessage(errorMsg);

            if (onError) {
                onError(errorMsg);
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleDisconnect = () => {
        wallet.disconnect();
        setAuthStep('idle');
        setUser(null);
        setErrorMessage(null);
        localStorage.removeItem('authenticated_wallet');
    };

    const getStepMessage = () => {
        switch (authStep) {
            case 'connecting':
                return 'Connecting to Freighter wallet...';
            case 'signing':
                return 'Please sign the message in Freighter...';
            case 'verifying':
                return 'Verifying signature...';
            case 'success':
                return 'Successfully authenticated!';
            case 'error':
                return errorMessage || 'Authentication failed';
            default:
                return null;
        }
    };

    if (authStep === 'success' && user) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Authenticated
                    </CardTitle>
                    <CardDescription>
                        Connected with Stellar wallet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Wallet Address:</p>
                        <p className="text-sm font-mono break-all bg-muted p-2 rounded">
                            {user.wallet_address}
                        </p>
                    </div>

                    {user.user_profiles && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">User ID:</p>
                            <p className="text-sm font-mono break-all bg-muted p-2 rounded">
                                {user.id}
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={handleDisconnect}
                        variant="outline"
                        className="w-full"
                    >
                        Disconnect
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Authentication
                </CardTitle>
                <CardDescription>
                    Sign in with your Stellar wallet using Freighter
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {authStep !== 'idle' && authStep !== 'error' && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>{getStepMessage()}</AlertDescription>
                    </Alert>
                )}

                {authStep === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{getStepMessage()}</AlertDescription>
                    </Alert>
                )}

                <Button
                    onClick={handleAuthenticate}
                    disabled={isAuthenticating}
                    className="w-full"
                >
                    {isAuthenticating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Authenticating...
                        </>
                    ) : (
                        <>
                            <Wallet className="mr-2 h-4 w-4" />
                            Sign in with Freighter
                        </>
                    )}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Connect your Freighter wallet</p>
                    <p>• Sign a message to prove ownership</p>
                    <p>• No transaction fees required</p>
                </div>
            </CardContent>
        </Card>
    );
}
