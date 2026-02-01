import React from 'react';
import { 
  ShieldCheck, 
  RefreshCcw, 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  Zap, 
  ArrowDownLeft 
} from 'lucide-react';
import { Card } from '../components/UIComponents';
import * as solanaService from '../services/cryptoService';
import { AppView, UserSession } from '../types';

interface DashboardViewProps {
  user: UserSession;
  balances: { sol: number; idrx: number };
  showBalance: boolean;
  toggleShowBalance: () => void;
  onNavigate: (view: AppView) => void;
  refresh: () => void;
  isRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  user, 
  balances, 
  showBalance, 
  toggleShowBalance, 
  onNavigate, 
  refresh, 
  isRefreshing, 
}) => {
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      // Simple feedback without external toast library
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="text-green-400 text-xs">Copied!</span>';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2 animate-in slide-in-from-bottom-5 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-sm text-white">
            {user.email ? user.email[0].toUpperCase() : user.twitterHandle ? user.twitterHandle[1].toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-xs text-secondary font-medium">Private Session</p>
            <p className="text-sm font-semibold text-white truncate max-w-[120px]">
              {user.email?.split('@')[0] || user.twitterHandle}
            </p>
          </div>
        </div>
        <button 
          onClick={copyAddress}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border hover:bg-neutral-800 active:scale-95 transition-all" 
        >
          <span className="text-[10px] font-mono text-secondary">{solanaService.formatAddress(user.walletAddress)}</span>
          <Copy className="w-3 h-3 text-secondary" />
        </button>
      </div>

      {/* Balance Card - Mobile Optimized */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <Card className="relative bg-[#0F0F0F] border-border/50 min-h-[200px] flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>
          
          <div className="relative z-10 space-y-1">
             <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-secondary tracking-wider uppercase">Shielded Balance</span>
                <div className="flex gap-1">
                  <button 
                    onClick={toggleShowBalance} 
                    className="p-2 hover:bg-white/10 rounded-full text-secondary transition-colors active:scale-95"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={refresh} 
                    className={`p-2 hover:bg-white/10 rounded-full text-secondary transition-colors active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                    disabled={isRefreshing}
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
             </div>
             
             <div className="flex items-baseline gap-2 mt-3">
               <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                 {showBalance ? balances.sol.toFixed(4) : '••••'} 
               </span>
               <span className="text-lg font-medium text-secondary">SOL</span>
             </div>
             <p className="text-sm font-mono text-secondary/70">
                ≈ {showBalance ? balances.idrx.toLocaleString() : '••••'} IDRX
             </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 mt-6">
             <button 
              onClick={() => onNavigate(AppView.SCAN)}
              className="h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-medium text-sm flex items-center justify-center transition-all active:scale-[0.98]"
             >
               <ArrowUpRight className="w-4 h-4 mr-2" /> Pay / Send
             </button>
             <button 
              onClick={() => onNavigate(AppView.AXON_SNAP)}
              className="h-12 bg-surface text-white hover:bg-neutral-800 border border-border rounded-xl font-medium text-sm flex items-center justify-center transition-all active:scale-[0.98]"
             >
               <Zap className="w-4 h-4 mr-2" /> Axon Snap
             </button>
          </div>
        </Card>
      </div>

      {/* Menu Grid - Mobile Optimized */}
      <div>
        <h3 className="text-sm font-medium text-secondary mb-4 uppercase tracking-wider pl-1">Services</h3>
        <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onNavigate(AppView.SWAP)} 
              className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-start gap-3 hover:bg-neutral-800 hover:border-white/20 transition-all group text-left active:scale-[0.98]"
            >
                <div className="p-2 bg-neutral-900 rounded-lg group-hover:bg-neutral-800 transition-colors">
                  <RefreshCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium block text-white">Swap</span>
                  <span className="text-[10px] text-secondary">Exchange Tokens</span>
                </div>
            </button>
            <button 
              onClick={() => onNavigate(AppView.HISTORY)} 
              className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-start gap-3 hover:bg-neutral-800 hover:border-white/20 transition-all group text-left active:scale-[0.98]"
            >
                <div className="p-2 bg-neutral-900 rounded-lg group-hover:bg-neutral-800 transition-colors">
                  <ArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium block text-white">Private Ledger</span>
                  <span className="text-[10px] text-secondary">View Transactions</span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};