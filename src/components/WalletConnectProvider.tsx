import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet, WalletClientProvider } from '@txnlab/use-wallet';
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

interface WalletConnectProviderProps {
  children: React.ReactNode;
}

export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({ children }) => {
  const walletContext = useWallet();

  // Protect against uninitialized WalletProvider
  if (!walletContext) {
    console.warn("WalletProvider not initialized. Skipping Algorand wallet setup.");
    return <>{children}</>;
  }

  const { activeAddress, signer, providers, connect } = walletContext;
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initWallet = async () => {
      try {
        if (providers && providers.length > 0 && !activeAddress) {
          const peraProvider = providers.find((p) => p.id === 'pera-wallet');
          if (peraProvider) {
            await connect(peraProvider.id);
          }
        }
      } catch (error) {
        console.warn('Silent wallet connection failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initWallet();
  }, [providers, activeAddress, connect]);

  const connectWallet = async () => {
    try {
      if (providers && providers.length > 0) {
        const peraProvider = providers.find((p) => p.id === 'pera-wallet');
        if (peraProvider) {
          await connect(peraProvider.id);
          toast.success('Wallet connected successfully');
          return;
        }
        await connect(providers[0].id);
        toast.success('Wallet connected successfully');
        return;
      }
      toast.error('No wallet providers available');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const logPaymentMethod = async (userId: string, paymentType: string): Promise<string | null> => {
    if (!activeAddress || !signer) {
      console.warn('Wallet not connected, cannot log to blockchain');
      return null;
    }

    try {
      const txId = await logPaymentMethodToBlockchain(
        userId,
        paymentType,
        activeAddress,
        signer
      );

      if (txId) {
        console.log(`Payment method logged to blockchain with txID: ${txId}`);
        toast.success('Payment method logged to blockchain');
        return txId;
      }
      return null;
    } catch (error) {
      console.error('Error logging payment method to blockchain:', error);
      toast.error('Failed to log to blockchain');
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
