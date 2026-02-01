import React, { useState, useEffect, useCallback } from 'react';
import { AppView, UserSession } from './types';
import * as solanaService from './services/cryptoService';
import * as authService from './services/authService';
import { NavBar } from './components/NavBar';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { AxonSnapView } from './views/AxonSnapView';
import { ScanSwapView } from './views/ScanSwapView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStep, setLoginStep] = useState(''); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balances, setBalances] = useState({ sol: 0, idrx: 0 }); 
  const [showBalance, setShowBalance] = useState(true);

  // Initialize Wallet from LocalStorage
  useEffect(() => {
    const storedSk = localStorage.getItem('axon_sk');
    if (storedSk) {
        // Auto login if key exists locally to speed up UX
        handleLogin('auto');
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
        const kp = web3.Keypair.fromSecretKey(bs58.decode(user.privateKeyBase58));
        const sol = await solanaService.getSolBalance(kp.publicKey);
        setBalances(prev => ({ ...prev, sol }));
    } catch (e) {
        console.error(e);
    } finally {
        setIsRefreshing(false);
    }
  }, [user]);

  // Handlers
  const handleLogin = async (provider: string) => {
    setIsLoggingIn(true);
    setLoginStep('Securing environment...');

    try {
      let email: string | undefined;
      let twitterHandle: string | undefined;
      let useDemoMode = false;
      let firebaseUid: string | undefined;
      
      // REAL AUTHENTICATION FLOW
      if (provider === 'google' || provider === 'twitter') {
          if (authService.isConfigured()) {
              setLoginStep(`Connecting to ${provider === 'google' ? 'Google' : 'X'}...`);
              try {
                  const firebaseUser = provider === 'google' 
                      ? await authService.signInWithGoogle()
                      : await authService.signInWithTwitter();
                  
                  email = firebaseUser.email || undefined;
                  firebaseUid = firebaseUser.uid;
                  
                  if (provider === 'twitter') {
                      twitterHandle = firebaseUser.displayName || '@user';
                  }

              } catch (authError: any) {
                  const errCode = authError?.code;
                  const errMessage = authError?.message || '';

                  if (errCode === 'auth/unauthorized-domain' || errMessage.includes('unauthorized-domain')) {
                      console.warn("Note: Domain not authorized in Firebase. Automatically switching to Demo Mode.");
                      useDemoMode = true;
                  } else if (errCode === 'auth/popup-closed-by-user') {
                      setIsLoggingIn(false);
                      return;
                  } else {
                      console.error("Login Error:", authError);
                      setIsLoggingIn(false);
                      alert(`Authentication cancelled or failed: ${errMessage}`);
                      return;
                  }
              }
          } else {
              useDemoMode = true;
          }

          if (useDemoMode) {
              setLoginStep('Establishing secure session...');
              await new Promise(r => setTimeout(r, 800));
              if (provider === 'google') email = 'privacy.user@gmail.com';
              if (provider === 'twitter') twitterHandle = '@solana_priv';
              // Demo mode generates random UID or uses a fixed one for consistent demoing
              firebaseUid = 'demo-user-123';
          }
      }

      setLoginStep('Syncing encrypted vault...');
      if (provider !== 'auto') await new Promise(r => setTimeout(r, 600));

      // Get or Create Solana Wallet
      let keypair: web3.Keypair;
      
      if (firebaseUid && provider !== 'auto') {
          // If we have a cloud identity, ensure we get the SAME wallet
          keypair = await solanaService.getOrSyncWallet(firebaseUid);
      } else {
          // Fallback / Auto-login from local storage / Demo
          const result = solanaService.getOrGenerateWalletLocal();
          keypair = result.keypair;
      }

      const pubKeyStr = keypair.publicKey.toString();
      
      setUser({
        email: email,
        twitterHandle: twitterHandle,
        walletAddress: pubKeyStr,
        privateKeyBase58: bs58.encode(keypair.secretKey),
        isAuthenticated: true
      });
      
      // Initial Balance Check
      const bal = await solanaService.getSolBalance(keypair.publicKey);
      setBalances({ sol: bal, idrx: 0 }); // Default IDRX 0, privacy first

      setView(AppView.DASHBOARD);
    } catch (e) {
      console.error("Login critical failure", e);
      alert("Login encountered an error. See console.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
      await authService.logout();
      // Remove local key to prevent account leakage on shared devices.
      // Next login will fetch fresh from cloud based on user ID.
      localStorage.removeItem('axon_sk');
      setUser(null);
      setView(AppView.LOGIN);
  };

  // Render Logic
  const renderContent = () => {
    switch (view) {
      case AppView.LOGIN:
        return <LoginView onLogin={handleLogin} isLoggingIn={isLoggingIn} loginStep={loginStep} />;
      
      case AppView.DASHBOARD:
        return user ? (
          <DashboardView 
            user={user} 
            balances={balances} 
            showBalance={showBalance} 
            toggleShowBalance={() => setShowBalance(!showBalance)}
            onNavigate={setView}
            refresh={refreshBalances}
            isRefreshing={isRefreshing}
          />
        ) : null;
      
      case AppView.AXON_SNAP:
        return user ? (
          <AxonSnapView 
            onBack={() => setView(AppView.DASHBOARD)} 
            user={user}
            solBalance={balances.sol}
            onRefresh={refreshBalances}
          />
        ) : null;

      case AppView.SCAN:
      case AppView.SWAP: 
        return user ? (
          <ScanSwapView 
            onBack={() => setView(AppView.DASHBOARD)}
            user={user}
            balances={balances}
            onRefresh={refreshBalances}
            setBalances={setBalances}
          />
        ) : null;
      
      case AppView.HISTORY:
        return user ? <HistoryView user={user} onBack={() => setView(AppView.DASHBOARD)} /> : null;

      case AppView.SETTINGS:
          return user ? <SettingsView user={user} onLogout={handleLogout} onBack={() => setView(AppView.DASHBOARD)} /> : null;

      default:
        return <div className="p-10 text-center">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans selection:bg-white/20">
      <div className="max-w-md mx-auto min-h-screen bg-[#050505] shadow-2xl relative border-x border-[#262626]">
        <div className="h-full px-4 pt-4 relative">
          {renderContent()}
        </div>
        
        {user && view !== AppView.LOGIN && view !== AppView.SCAN && view !== AppView.SWAP && (
          <NavBar currentView={view} onChangeView={setView} />
        )}
      </div>
    </div>
  );
};

export default App;