'use client';

import { useState, useEffect } from 'react';
import freighterApi from '@stellar/freighter-api';

// Helper functions to manage cookies from client-side
function setCookie(name: string, value: string, days: number = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useStellarWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    network: null,
    isLoading: true,
    error: null,
  });

  // Check if Freighter is installed
  const checkFreighterInstalled = async () => {
    try {
      const connected = await freighterApi.isConnected();
      return connected;
    } catch (error) {
      return false;
    }
  };

  // Connect wallet
  const connect = async () => {
    console.log('🔄 Starting connection process...');
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if Freighter is installed
      console.log('🔍 Checking if Freighter is installed...');
      const installed = await checkFreighterInstalled();
      console.log('📦 Freighter installed:', installed);

      if (!installed) {
        throw new Error('Freighter wallet is not installed. Please install it from https://freighter.app');
      }

      // Request access (this will ALWAYS show the popup)
      console.log('🔐 Requesting access from Freighter...');
      const accessGranted = await freighterApi.requestAccess();
      console.log('🔐 Access granted:', accessGranted);

      if (!accessGranted) {
        throw new Error('Access denied by user');
      }

      // Get public key after access is granted
      console.log('🔑 Getting address from Freighter...');
      const addressResponse = await freighterApi.getAddress();
      console.log('📬 Address response:', addressResponse);

      const publicKey = addressResponse.address;

      if (!publicKey || publicKey === '') {
        throw new Error('No address returned from Freighter. Please make sure you have an account created.');
      }

      console.log('✅ Public key received:', publicKey);

      console.log('🌐 Getting network details...');
      const networkDetails = await freighterApi.getNetwork();
      console.log('🌐 Network details:', networkDetails);

      const network = networkDetails.network || 'TESTNET';
      console.log('✅ Network:', network);

      setWallet({
        isConnected: true,
        publicKey,
        network,
        isLoading: false,
        error: null,
      });

      // Store in both localStorage AND cookies
      localStorage.setItem('stellar_wallet_connected', 'true');
      localStorage.setItem('stellar_wallet_publicKey', publicKey);

      setCookie('stellar_wallet_connected', 'true', 30);
      setCookie('stellar_wallet_publicKey', publicKey, 30);

      console.log('✅ Connection successful!');

      return { publicKey, network };
    } catch (error: any) {
      console.error('❌ Connection failed:', error);
      const errorMessage = error.message || 'Failed to connect wallet';
      setWallet({
        isConnected: false,
        publicKey: null,
        network: null,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setWallet({
      isConnected: false,
      publicKey: null,
      network: null,
      isLoading: false,
      error: null,
    });

    // Clear localStorage
    localStorage.removeItem('stellar_wallet_connected');
    localStorage.removeItem('stellar_wallet_publicKey');

    // Clear cookies
    deleteCookie('stellar_wallet_connected');
    deleteCookie('stellar_wallet_publicKey');
    deleteCookie('authenticated_wallet');
  };

  // Sign transaction
  const signTx = async (xdr: string, networkPassphrase?: string) => {
    try {
      const signedXdr = await freighterApi.signTransaction(xdr, {
        networkPassphrase: networkPassphrase || 'Test SDF Network ; September 2015',
      });
      return signedXdr;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign transaction');
    }
  };

  // Sign message for authentication
  const signMessage = async (message: string): Promise<string> => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🖊️ Requesting message signature from Freighter...');

      // Use Freighter's signMessage API
      const result = await freighterApi.signMessage(message);

      console.log('✅ Message signed successfully');

      // Freighter returns the signature in base64 format
      if (!result.signedMessage) {
        throw new Error('No signature returned from Freighter');
      }

      return typeof result.signedMessage === 'string'
        ? result.signedMessage
        : result.signedMessage.toString('base64');
    } catch (error: any) {
      console.error('❌ Failed to sign message:', error);
      throw new Error(error.message || 'Failed to sign message');
    }
  };  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem('stellar_wallet_connected');

      if (wasConnected === 'true') {
        try {
          const connected = await freighterApi.isConnected();

          if (connected) {
            const addressResponse = await freighterApi.getAddress();
            const publicKey = addressResponse.address;
            const networkDetails = await freighterApi.getNetwork();
            const network = networkDetails.network || 'TESTNET';

            setWallet({
              isConnected: true,
              publicKey,
              network,
              isLoading: false,
              error: null,
            });
          } else {
            setWallet(prev => ({ ...prev, isLoading: false }));
          }
        } catch (error) {
          setWallet(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setWallet(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkConnection();
  }, []);

  return {
    ...wallet,
    connect,
    disconnect,
    signTransaction: signTx,
    signMessage,
    checkFreighterInstalled,
  };
}
