import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@txnlab/use-wallet';
import { logPaymentMethodToBlockchain } from '../lib/algorand';
import toast from 'react-hot-toast';

interface BlockchainLoggerContextType {
  logPaymentMethod: (userId: string, paymentType: string) => Promise<string | null>;
  isWalletConnected: boolean;
  connectWallet: () => void;
  activeAddress: string | null;
}

const BlockchainLoggerContext = createContext<BlockchainLoggerContextType>({
  logPaymentMethod: async () => null,
  isWalletConnected: false,
  connectWallet: () => {},
  activeAddress: null
});

export const useBlockchainLogger = () => useContext(BlockchainLoggerContext);

interface WalletConnectProviderProps {
  children: React.ReactNode;
}

export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({ children }) => {
  const { activeAccount, signTransactions, connect, providers } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize wallet connection silently
    const initWallet = async () => {
      try {
        // Try to reconnect to previously connected wallet
        if (providers && providers.length > 0 && !activeAccount) {
          // Find Pera wallet provider
          const peraProvider = providers.find(p => p.metadata.id === 'pera-wallet');
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
  }, [providers, activeAccount, connect]);

  const connectWallet = async () => {
    try {
      if (providers && providers.length > 0) {
        // Find Pera wallet provider
        const peraProvider = providers.find(p => p.metadata.id === 'pera-wallet');
        if (peraProvider) {
          await connect(peraProvider.id);
          toast.success('Wallet connected successfully');
        } else {
          // Use the first available provider if Pera is not available
          await connect(providers[0].id);
          toast.success('Wallet connected successfully');
        }
      } else {
        toast.error('No wallet providers available');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const logPaymentMethod = async (userId: string, paymentType: string): Promise<string | null> => {
    if (!activeAccount || !signTransactions) {
      console.warn('Wallet not connected, cannot log to blockchain');
      return null;
    }

    try {
      const txId = await logPaymentMethodToBlockchain(
        userId,
        paymentType,
        activeAccount.address,
        signTransactions
      );
      
      if (txId) {
        console.log(`Payment method logged to blockchain with txID: ${txId}`);
        return txId;
      }
      return null;
    } catch (error) {
      console.error('Error logging payment method to blockchain:', error);
      return null;
    }
  };

  return (
    <BlockchainLoggerContext.Provider 
      value={{ 
        logPaymentMethod,
        isWalletConnected: !!activeAccount,
        connectWallet,
        activeAddress: activeAccount?.address || null
      }}
    >
      {children}
    </BlockchainLoggerContext.Provider>
  );
};