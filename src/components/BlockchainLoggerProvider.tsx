import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@txnlab/use-wallet';
import { logPaymentMethodToBlockchain } from '../lib/algorand';
import toast from 'react-hot-toast';

interface BlockchainLoggerContextType {
  logPaymentMethod: (userId: string, paymentType: string) => Promise<string | null>;
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
  activeAddress: string | null;
}

const BlockchainLoggerContext = createContext<BlockchainLoggerContextType>({
  logPaymentMethod: async () => null,
  isWalletConnected: false,
  connectWallet: async () => {},
  activeAddress: null,
});

export const useBlockchainLogger = () => useContext(BlockchainLoggerContext);

interface Props {
  children: React.ReactNode;
}

export const BlockchainLoggerProvider: React.FC<Props> = ({ children }) => {
  const { activeAddress, signer, providers, connect } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (providers && providers.length > 0 && !activeAddress) {
          const pera = providers.find((p) => p.id === 'pera-wallet');
          if (pera) await connect(pera.id);
        }
      } catch (e) {
        console.warn('Silent wallet init failed', e);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [providers, activeAddress, connect]);

  const connectWallet = async () => {
    try {
      const pera = providers?.find((p) => p.id === 'pera-wallet');
      if (pera) {
        await connect(pera.id);
        toast.success('Wallet connected');
        return;
      }
      toast.error('No wallet provider available');
    } catch (e) {
      console.error(e);
      toast.error('Wallet connection failed');
    }
  };

  const logPaymentMethod = async (userId: string, type: string) => {
    if (!signer || !activeAddress) return null;
    try {
      const txId = await logPaymentMethodToBlockchain(userId, type, activeAddress, signer);
      toast.success('Logged to blockchain');
      return txId;
    } catch (e) {
      console.error(e);
      toast.error('Logging failed');
      return null;
    }
  };

  return (
    <BlockchainLoggerContext.Provider
      value={{
        logPaymentMethod,
        isWalletConnected: !!activeAddress,
        connectWallet,
        activeAddress,
      }}
    >
      {children}
    </BlockchainLoggerContext.Provider>
  );
};
