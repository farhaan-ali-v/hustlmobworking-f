import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import StripeProvider from './components/StripeProvider.tsx';
import { TranslationProvider } from './components/TranslationProvider.tsx';
import { LingoProviderWrapper, loadDictionary } from 'lingo.dev/react/client';
import * as Sentry from '@sentry/react';
import { WalletProvider } from '@txnlab/use-wallet';
import { PeraWalletConnect } from '@perawallet/connect';
import { BlockchainLoggerProvider } from './components/BlockchainLoggerProvider.tsx'; // ✅ Correct import

// Initialize Sentry
Sentry.init({
  dsn: "https://9212e6b7c7de8e29a2a6ad0e5562294d@o4509580473925632.ingest.us.sentry.io/4509580770541568",
  sendDefaultPii: true,
  integrations: [
    new Sentry.BrowserTracing({ tracesSampleRate: 0.5 }),
    new Sentry.Replay({ sessionSampleRate: 0.1, errorSampleRate: 1.0 }),
  ],
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.5,
  beforeSend(event) {
    if (import.meta.env.DEV) {
      console.log("Sentry event:", event);
    }
    return event;
  },
  release: import.meta.env.VITE_APP_VERSION || "hustl@dev",
});

// Initialize wallet
const pera = new PeraWalletConnect();

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorDiv = document.createElement('div');
  errorDiv.textContent = 'Error: Root element not found!';
  document.body.appendChild(errorDiv);
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<p>An error has occurred. Our team has been notified.</p>}>
        <WalletProvider
          providers={[pera]}
          nodeConfig={{
            network: 'testnet',
            nodeServer: 'https://testnet-api.nodely.io',
            nodeToken: 'BOLTqzcvtetizg512',
          }}
        >
          <BlockchainLoggerProvider>
            <LingoProviderWrapper loadDictionary={(locale) => loadDictionary(locale)}>
              <TranslationProvider>
                <StripeProvider>
                  <App />
                </StripeProvider>
              </TranslationProvider>
            </LingoProviderWrapper>
          </BlockchainLoggerProvider>
        </WalletProvider>
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
}
