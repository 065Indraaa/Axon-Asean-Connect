import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import bs58 from 'bs58';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from './authService';
import { Transaction, Currency } from '../types';

// Connect to Devnet (Privacy Note: In production, use a private RPC endpoint like Helius to prevent IP leakage to public nodes)
const CONNECTION = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// Mock IDRX Mint Address
const IDRX_MINT_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"; 

// We default to SolanaFM or Solscan for external verification as they offer detailed views, 
// but the app prioritizes internal views.
export const SOLANA_EXPLORER_URL = "https://solana.fm/tx";

// --- Wallet Management ---

/**
 * Gets the wallet associated with the authenticated user ID.
 * Prioritizes Cloud Data (Account-based) over LocalStorage (Device-based).
 */
export const getOrSyncWallet = async (userId: string): Promise<web3.Keypair> => {
  const db = getDb();
  let secretKeyString = '';
  
  if (db && userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.encryptedKey) {
          // 1. Found in Cloud -> This is the source of truth for this Account.
          console.log("✅ Wallet found in Firebase. Syncing to device...");
          secretKeyString = data.encryptedKey;
          
          // Force sync cloud key to local storage to ensure device matches account
          localStorage.setItem('axon_sk', secretKeyString);
        }
      } 
      
      // 2. Not found in Cloud? 
      if (!secretKeyString) {
        console.log("☁️ New User or Guest Migration. Checking local...");
        // Check if we have a local guest wallet to migrate
        const storedKey = localStorage.getItem('axon_sk');
        
        if (storedKey) {
          console.log("📦 Migrating Local Guest Wallet to Cloud Account...");
          secretKeyString = storedKey;
        } else {
          console.log("🆕 Generating brand new wallet for Account...");
          const kp = web3.Keypair.generate();
          secretKeyString = bs58.encode(kp.secretKey);
          localStorage.setItem('axon_sk', secretKeyString);
        }

        // 3. Save/Sync to Cloud (Persist Account Data)
        await setDoc(userDocRef, {
          walletAddress: web3.Keypair.fromSecretKey(bs58.decode(secretKeyString)).publicKey.toString(),
          encryptedKey: secretKeyString, 
          lastLogin: new Date().toISOString()
        }, { merge: true });
        console.log("💾 Wallet saved to Firebase!");
      }

    } catch (e) {
      console.error("Cloud sync failed:", e);
      // Fallback only if absolutely necessary, but warn user
    }
  }

  // Fallback: If still no key (e.g. DB error or Offline), check local
  if (!secretKeyString) {
     const storedKey = localStorage.getItem('axon_sk');
     if (storedKey) {
       secretKeyString = storedKey;
     } else {
       // Only generate local if we aren't enforcing cloud strictness, or as last resort
       const kp = web3.Keypair.generate();
       secretKeyString = bs58.encode(kp.secretKey);
       localStorage.setItem('axon_sk', secretKeyString);
     }
  }

  return web3.Keypair.fromSecretKey(bs58.decode(secretKeyString));
};

// Fallback for demo mode without auth
export const getOrGenerateWalletLocal = (): { keypair: web3.Keypair, isNew: boolean } => {
  const storedKey = localStorage.getItem('axon_sk');
  if (storedKey) {
    try {
        const secretKey = bs58.decode(storedKey);
        return { keypair: web3.Keypair.fromSecretKey(secretKey), isNew: false };
    } catch (e) {
        console.error("Corrupt key found, regenerating safe key.");
    }
  }
  
  const keypair = web3.Keypair.generate();
  localStorage.setItem('axon_sk', bs58.encode(keypair.secretKey));
  return { keypair, isNew: true };
};

export const exportPrivateKey = (): string => {
  return localStorage.getItem('axon_sk') || '';
};

// --- Balances ---

export const getSolBalance = async (publicKey: web3.PublicKey): Promise<number> => {
  try {
    const balance = await CONNECTION.getBalance(publicKey);
    return balance / web3.LAMPORTS_PER_SOL;
  } catch (e) {
    console.error("Failed to get SOL balance", e);
    return 0;
  }
};

// --- Transactions ---

export const getHistory = async (publicKey: web3.PublicKey): Promise<Transaction[]> => {
  try {
    // Fetch signatures
    const signatures = await CONNECTION.getSignaturesForAddress(publicKey, { limit: 10 });
    
    return signatures.map(sig => ({
      id: sig.signature,
      type: sig.err ? 'unknown' : 'send', // Simplified type inference
      amount: 0, // RPC doesn't give amount in simple signature fetch, usually requires parsing
      currency: Currency.SOL,
      date: new Date(sig.blockTime! * 1000).toLocaleString(),
      status: sig.err ? 'failed' : 'confirmed',
      privacyLevel: 'obfuscated', // Internal UI will treat this as private
      signature: sig.signature
    }));
  } catch (e) {
    console.error("Failed to fetch history", e);
    return [];
  }
};

export const sendSol = async (fromKeypair: web3.Keypair, toAddress: string, amount: number): Promise<string> => {
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new web3.PublicKey(toAddress),
      lamports: Math.floor(amount * web3.LAMPORTS_PER_SOL),
    })
  );

  const signature = await web3.sendAndConfirmTransaction(CONNECTION, transaction, [fromKeypair]);
  return signature;
};

// --- Axon Snap (On-Chain) ---

export const createSnap = async (fromKeypair: web3.Keypair, amount: number): Promise<{ tempKey: string, signature: string }> => {
  const tempKeypair = web3.Keypair.generate();
  const signature = await sendSol(fromKeypair, tempKeypair.publicKey.toString(), amount);
  
  return {
    tempKey: bs58.encode(tempKeypair.secretKey),
    signature
  };
};

export const claimSnap = async (claimerKeypair: web3.Keypair, tempPrivateKeyBase58: string): Promise<string> => {
  const tempSecretKey = bs58.decode(tempPrivateKeyBase58);
  const tempKeypair = web3.Keypair.fromSecretKey(tempSecretKey);

  const balance = await CONNECTION.getBalance(tempKeypair.publicKey);
  if (balance === 0) throw new Error("Snap already claimed or empty");

  const lamportsToSend = balance - 5000; // Minus fee
  if (lamportsToSend <= 0) throw new Error("Not enough funds to cover gas");

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: tempKeypair.publicKey,
      toPubkey: claimerKeypair.publicKey,
      lamports: lamportsToSend,
    })
  );

  const signature = await web3.sendAndConfirmTransaction(CONNECTION, transaction, [tempKeypair]);
  return signature;
};

// --- Swap / IDRX Logic ---

export const simulateSwapSolToIdrx = async (userKeypair: web3.Keypair, solAmount: number, idrxAmount: number): Promise<string> => {
  const burnTx = await sendSol(userKeypair, "1nc1nerator11111111111111111111111111111111", solAmount);
  return burnTx;
};

// Helpers
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};