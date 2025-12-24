// Stellar SDK Client Configuration
import { Server, Networks } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '@/lib/constants';

export const stellarServer = new Server(STELLAR_CONFIG.horizonUrl);

export const getNetworkPassphrase = () => {
  return STELLAR_CONFIG.network === 'mainnet'
    ? Networks.PUBLIC
    : Networks.TESTNET;
};

export const getStellarNetwork = () => {
  return STELLAR_CONFIG.network;
};
