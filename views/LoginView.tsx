import React from 'react';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/UIComponents';
import { isConfigured } from '../services/authService';

interface LoginViewProps {
  onLogin: (provider: string) => void;
  isLoggingIn: boolean;
  loginStep: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoggingIn, loginStep }) => {
  const configured = isConfigured();

  if (isLoggingIn) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
          <div className="relative w-20 h-20 bg-surface border border-border rounded-2xl flex items-center justify-center z-10">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        </div>
        
        <div className="text-center space-y-2 max-w-[240px]">
          <h3 className="text-lg font-medium text-white">Authenticating</h3>
          <p className="text-sm text-secondary font-mono h-6">{loginStep}</p>
        </div>

        <div className="w-full max-w-[200px] bg-surface rounded-full h-1 overflow-hidden">
          <div className="h-full bg-white animate-[width_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-10 justify-between relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="space-y-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-white to-neutral-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <ShieldCheck className="w-8 h-8 text-black" />
        </div>
        
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-4 text-white">
            Axon <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600">Privacy</span>
          </h1>
          <p className="text-secondary text-lg leading-relaxed font-light">
            Web3 onboarding reimagined. <br/>
            Login with social, own your keys.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
           <Badge variant="neutral">Non-Custodial</Badge>
           <Badge variant="neutral">End-to-End Encrypted</Badge>
           <Badge variant="neutral">Solana Devnet</Badge>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {!configured && (
             <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex gap-3 items-start mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                   <p className="text-xs font-bold text-yellow-500">Configuration Required</p>
                   <p className="text-[10px] text-yellow-200/70 leading-normal">
                      To use Real Google/X Auth, update <code>firebaseConfig</code> in <code>services/authService.ts</code>. Using Demo mode for now.
                   </p>
                </div>
             </div>
        )}

        <button 
          onClick={() => onLogin('google')} 
          disabled={isLoggingIn}
          className="w-full h-14 bg-white hover:bg-neutral-200 text-black rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        
        <button 
          onClick={() => onLogin('twitter')} 
          disabled={isLoggingIn}
          className="w-full h-14 bg-surface border border-border hover:bg-neutral-800 text-white rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Continue with X
        </button>

        <p className="text-center text-[10px] text-secondary mt-6 max-w-xs mx-auto leading-normal">
          By continuing, a non-custodial wallet will be locally generated. Axon does not store your private keys.
        </p>
      </div>
    </div>
  );
};