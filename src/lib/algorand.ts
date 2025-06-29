import algosdk from 'algosdk';
import { AlgoAmount, getAlgorandClients } from '@algorandfoundation/algokit-utils';

// Algorand TestNet configuration
const ALGORAND_NETWORK = 'testnet';
const API_KEY = 'BOLTqzcvtetizg512';
const NODE_SERVER = 'https://testnet-api.nodely.io';
const NODE_PORT = '';
const NODE_TOKEN = API_KEY;
const INDEXER_SERVER = 'https://testnet-idx.nodely.io';
const INDEXER_PORT = '';
const INDEXER_TOKEN = API_KEY;

/**
 * Initialize Algorand clients using AlgoKit
 */
export const initAlgorandClients = async () => {
  try {
    const { algod, indexer } = getAlgorandClients({
      network: ALGORAND_NETWORK,
      algod: {
        server: NODE_SERVER,
        port: NODE_PORT,
        token: NODE_TOKEN
      },
      indexer: {
        server: INDEXER_SERVER,
        port: INDEXER_PORT,
        token: INDEXER_TOKEN
      }
    });
    
    return { algod, indexer };
  } catch (error) {
    console.error('Error initializing Algorand clients:', error);
    throw error;
  }
};

/**
 * Send a note-only transaction to Algorand TestNet
 * @param senderAddress The sender's Algorand address
 * @param note The note to include in the transaction (will be converted to Uint8Array)
 * @param signCallback Function to sign the transaction
 */
export const sendNoteTransaction = async (
  senderAddress: string,
  note: string,
  signCallback: (txnToSign: Uint8Array) => Promise<Uint8Array>
): Promise<string> => {
  try {
    const { algod } = await initAlgorandClients();
    
    // Get suggested parameters
    const suggestedParams = await algod.getTransactionParams().do();
    
    // Create a payment transaction with 0 amount (note-only)
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: senderAddress,
      to: senderAddress, // Send to self for a note-only transaction
      amount: 0, // 0 Algos
      note: new TextEncoder().encode(note),
      suggestedParams
    });
    
    // Sign the transaction
    const signedTxn = await signCallback(txn.toByte());
    
    // Submit the transaction
    const { txId } = await algod.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(algod, txId, 4);
    
    console.log('Note transaction confirmed with txID:', txId);
    return txId;
  } catch (error) {
    console.error('Error sending note transaction:', error);
    throw error;
  }
};

/**
 * Log payment method addition to Algorand blockchain
 * @param userId User ID
 * @param paymentType Payment method type
 * @param signCallback Function to sign the transaction
 */
export const logPaymentMethodToBlockchain = async (
  userId: string,
  paymentType: string,
  senderAddress: string,
  signCallback: (txnToSign: Uint8Array) => Promise<Uint8Array>
): Promise<string | null> => {
  try {
    // Create the note as a JSON string
    const note = JSON.stringify({
      uid: userId,
      type: paymentType,
      timestamp: new Date().toISOString()
    });
    
    // Send the transaction
    const txId = await sendNoteTransaction(senderAddress, note, signCallback);
    return txId;
  } catch (error) {
    console.error('Error logging payment method to blockchain:', error);
    return null;
  }
};