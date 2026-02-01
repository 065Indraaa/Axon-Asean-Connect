import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  TwitterAuthProvider,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyC512LZJ66kBJVAhrXTZC5NLXtXqPCVxp4",
  authDomain: "axon-3f00e.firebaseapp.com",
  projectId: "axon-3f00e",
  storageBucket: "axon-3f00e.firebasestorage.app",
  messagingSenderId: "387732033019",
  appId: "1:387732033019:web:d883de79620d6dfc394f5e",
  measurementId: "G-76ZT530PTC"
};

// Initialize Firebase
let auth: any;
let app: any;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (e) {
    console.warn("Firebase Init Failed. Check configuration.", e);
}

// Helper to check if config is valid
export const isConfigured = () => {
    return !!auth;
};

export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) throw new Error("Firebase not initialized");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const signInWithTwitter = async (): Promise<User> => {
  if (!auth) throw new Error("Firebase not initialized");
  const provider = new TwitterAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
    if (auth) {
        await firebaseSignOut(auth);
    }
};
