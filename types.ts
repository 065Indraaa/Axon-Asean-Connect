export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  AXON_SNAP = 'AXON_SNAP',
  SCAN = 'SCAN',
  SWAP = 'SWAP',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}

export enum Currency {
  SOL = 'SOL',
  IDRX = 'IDRX',
  USDC = 'USDC'
}

export interface UserSession {
  email?: string;
  twitterHandle?: string;
  walletAddress: string;
  privateKeyBase58: string;
  isAuthenticated: boolean;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'snap_create' | 'snap_claim' | 'unknown';
  amount: number;
  currency: Currency;
  date: string;
  status: 'confirmed' | 'pending' | 'failed';
  privacyLevel: 'public' | 'obfuscated' | 'shielded';
  signature?: string;
}

export interface SnapDrop {
  id: string;
  amount: number;
  tempPrivateKey: string; // The key embedded in the link
  link: string;
  createdAt: string;
  isClaimed: boolean;
}