// Stellar Wallet Integration (Freighter)

export interface WalletConnection {
  publicKey: string;
  isConnected: boolean;
}

export const connectWallet = async (): Promise<WalletConnection> => {
  // Check if Freighter is installed
  if (typeof window === 'undefined' || !window.freighter) {
    throw new Error('Freighter wallet not installed');
  }

  try {
    const publicKey = await window.freighter.getPublicKey();
    return {
      publicKey,
      isConnected: true,
    };
  } catch (error) {
    throw new Error('Failed to connect wallet');
  }
};

export const signTransaction = async (xdr: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.freighter) {
    throw new Error('Freighter wallet not installed');
  }

  try {
    const signedXdr = await window.freighter.signTransaction(xdr);
    return signedXdr;
  } catch (error) {
    throw new Error('Failed to sign transaction');
  }
};

// Type declaration for Freighter
declare global {
  interface Window {
    freighter?: {
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string) => Promise<string>;
      isConnected: () => Promise<boolean>;
    };
  }
}
