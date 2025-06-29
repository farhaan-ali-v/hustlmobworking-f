import React from 'react';
import { WalletProvider } from '@txnlab/use-wallet';
import { PeraWalletConnect } from '@perawallet/connect';
import { BlockchainLoggerProvider } from './components/BlockchainLoggerProvider';
import StripeProvider from './components/StripeProvider';
import { TranslationProvider } from './components/TranslationProvider';
import { LingoProviderWrapper, loadDictionary } from 'lingo.dev/react/client';
import * as Sentry from '@sentry/react';

const pera = new PeraWalletConnect();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider
      providers={[pera]}
      nodeConfig={{
        network: 'testnet',
        nodeServer: 'https://testnet-api.nodely.io',
        nodeToken: 'BOLTqzcvtetizg512',
      }}
    >
      <Sentry.ErrorBoundary fallback={<p>An error has occurred. Our team has been notified.</p>}>
        <BlockchainLoggerProvider>
          <LingoProviderWrapper loadDictionary={(locale) => loadDictionary(locale)}>
            <TranslationProvider>
              <StripeProvider>{children}</StripeProvider>
            </TranslationProvider>
          </LingoProviderWrapper>
        </BlockchainLoggerProvider>
      </Sentry.ErrorBoundary>
    </WalletProvider>
  );
};