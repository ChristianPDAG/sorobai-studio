'use client';

import { WalletAuthButton } from '@/components/auth/wallet-auth-button';
import { useState } from 'react';

export default function WalletAuthTestPage() {
    const [authStatus, setAuthStatus] = useState<string>('Not authenticated');
    const [userData, setUserData] = useState<any>(null);

    const handleSuccess = (user: any) => {
        console.log('✅ Authentication successful:', user);
        setAuthStatus('Authenticated successfully!');
        setUserData(user);
    };

    const handleError = (error: string) => {
        console.error('❌ Authentication error:', error);
        setAuthStatus(`Authentication failed: ${error}`);
        setUserData(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">Wallet Authentication Test</h1>
                    <p className="text-muted-foreground">
                        Test the Stellar wallet authentication flow using Freighter
                    </p>
                </div>

                <div className="flex justify-center">
                    <WalletAuthButton
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </div>

                <div className="space-y-4">
                    <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Status:</h3>
                        <p className="text-sm text-muted-foreground">{authStatus}</p>
                    </div>

                    {userData && (
                        <div className="bg-card border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">User Data:</h3>
                            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                                {JSON.stringify(userData, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="bg-card border rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold">How it works:</h3>
                        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                            <li>Click "Sign in with Freighter" to connect your Stellar wallet</li>
                            <li>Approve the connection request in Freighter extension</li>
                            <li>A nonce (random challenge) is generated and stored temporarily</li>
                            <li>Sign the authentication message in Freighter (no gas fees)</li>
                            <li>The signature is verified using Stellar cryptography</li>
                            <li>Your account is created or retrieved from the database</li>
                            <li>You're now authenticated with your Stellar wallet!</li>
                        </ol>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                            ⚠️ Prerequisites:
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Freighter wallet extension must be installed</li>
                            <li>You must have at least one Stellar account in Freighter</li>
                            <li>Database must have the wallet auth tables created</li>
                            <li>Supabase environment variables must be configured</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
