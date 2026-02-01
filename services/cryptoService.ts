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
 * STRICT MODE: Only trusts Cloud Data. Ignores LocalStorage for retrieval 
 * to ensure User A's wallet is never given to User B on the same device.
 */
export const getOrSyncWallet = async (userId: string): Promise<web3.Keypair> => {
  const db = getDb();
  let secretKeyString = '';
  
  if (!db || !userId) {
      throw new Error("Cannot sync wallet: DB or UserID missing");
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.encryptedKey) {
        // 1. Found in Cloud -> Retrieve the account's specific wallet
        console.log("✅ Identity verified. Retrieving cloud wallet for user:", userId);
        secretKeyString = data.encryptedKey;
      }
    } 
    
    // 2. Not found in Cloud? Generate NEW specific to this account.
    // We EXPLICITLY do not check localStorage here to prevent "Guest Wallet" from
    // accidentally becoming the account wallet if the device was shared.
    if (!secretKeyString) {
      console.log("🆕 New Account detected. Generating fresh wallet for user:", userId);
      
      const kp = web3.Keypair.generate();
      secretKeyString = bs58.encode(kp.secretKey);

      // 3. Save new wallet to Cloud immediately with user-specific data
      await setDoc(userDocRef, {
        userId: userId, // Store the user ID for reference
        walletAddress: kp.publicKey.toString(),
        encryptedKey: secretKeyString, 
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });
      console.log("💾 Wallet bound to account and saved to Firebase for user:", userId);
    } else {
      // Update last login for existing users
      await setDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }

    // 4. Update Local Session (Only after we confirmed the correct key)
    // Store with user-specific key to prevent cross-contamination
    localStorage.setItem(`axon_sk_${userId}`, secretKeyString);
    // Also store current user ID for auto-login
    localStorage.setItem('axon_current_user', userId);

  } catch (e) {
    console.error("Cloud sync critical failure:", e);
    throw new Error("Failed to retrieve account wallet.");
  }

  return web3.Keypair.fromSecretKey(bs58.decode(secretKeyString));
};

// Fallback for unauthenticated / guest / demo mode only
export const getOrGenerateWalletLocal = (): { keypair: web3.Keypair, isNew: boolean } => {
  // Check if there's a current user and try to get their specific wallet first
  const currentUser = localStorage.getItem('axon_current_user');
  if (currentUser) {
    const userSpecificKey = localStorage.getItem(`axon_sk_${currentUser}`);
    if (userSpecificKey) {
      try {
        const secretKey = bs58.decode(userSpecificKey);
        return { keypair: web3.Keypair.fromSecretKey(secretKey), isNew: false };
      } catch (e) {
        console.error("Corrupt user-specific key found, will generate new.");
      }
    }
  }

  // Fallback to generic key for guest mode
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
  // Try to get current user's specific key first
  const currentUser = localStorage.getItem('axon_current_user');
  if (currentUser) {
    const userSpecificKey = localStorage.getItem(`axon_sk_${currentUser}`);
    if (userSpecificKey) return userSpecificKey;
  }
  
  // Fallback to generic key
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