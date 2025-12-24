'use client';

import { useState, useEffect } from 'react';
import { connectWallet, WalletConnection } from '@/lib/stellar/wallet';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const connection = await connectWallet();
      setWallet(connection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
  };

  return {
    wallet,
    isConnected: wallet?.isConnected || false,
    isLoading,
    error,
    connect,
    disconnect,
  };
}
