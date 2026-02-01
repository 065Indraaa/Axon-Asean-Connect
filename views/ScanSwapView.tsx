import React, { useState } from 'react';
import { ArrowLeft, QrCode, XCircle, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { Button, Header, Card } from '../components/UIComponents';
import * as solanaService from '../services/cryptoService';
import { UserSession } from '../types';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

interface ScanSwapViewProps {
  onBack: () => void;
  user: UserSession;
  balances: { sol: number; idrx: number };
  onRefresh: () => void;
  setBalances: React.Dispatch<React.SetStateAction<{ sol: number; idrx: number }>>;
}

export const ScanSwapView: React.FC<ScanSwapViewProps> = ({ onBack, user, balances, onRefresh, setBalances }) => {
  const [step, setStep] = useState<'scan' | 'confirm_sol' | 'confirm_qris' | 'swap_needed' | 'success'>('scan');
  const [txDetails, setTxDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const processInput = (input: string) => {
    // 1. Check if input is IDRX QRIS (Simulated by prefix "IDRX:")
    if (input.startsWith('IDRX:') || input.includes('QRIS')) {
        const amount = 50000; // Mock parsed amount
        setTxDetails({ type: 'IDRX', to: 'Merchant', amount });
        if (balances.idrx < amount) {
            setStep('swap_needed');
        } else {
            setStep('confirm_qris');
        }
        return;
    }

    // 2. Check if Solana Address
    try {
        new web3.PublicKey(input);
        setTxDetails({ type: 'SOL', to: input, amount: 0.1 }); // Default send amount for demo
        setStep('confirm_sol');
    } catch {
        alert("Invalid Solana Address or QR Code");
    }
  };

  const handleSolTransfer = async () => {
    setLoading(true);
    try {
        const kp = web3.Keypair.fromSecretKey(bs58.decode(user.privateKeyBase58));
        await solanaService.sendSol(kp, txDetails.to, txDetails.amount);
        setStep('success');
        onRefresh();
    } catch (e) {
        alert("Transfer failed: " + e);
    } finally {
        setLoading(false);
    }
  };

  const handleIdrxPayment = async () => {
      // Simulate IDRX Payment (Just deducting local balance for demo as we don't have real IDRX mint authority on devnet easily)
      setLoading(true);
      setTimeout(() => {
          setBalances(prev => ({ ...prev, idrx: prev.idrx - txDetails.amount }));
          setStep('success');
          setLoading(false);
      }, 1000);
  };

  const handleSwap = async () => {
     setLoading(true);
     // Calc needed SOL
     const needed = (txDetails.amount - balances.idrx) / 1600000; // Mock Rate
     try {
         const kp = web3.Keypair.fromSecretKey(bs58.decode(user.privateKeyBase58));
         await solanaService.simulateSwapSolToIdrx(kp, needed, txDetails.amount);
         // "Mint" the missing IDRX to user state
         setBalances(prev => ({ sol: prev.sol - needed, idrx: prev.idrx + (txDetails.amount - prev.idrx) + 1000 })); // +1000 buffer
         setStep('confirm_qris');
     } catch (e) {
         alert("Swap failed: " + e);
     } finally {
         setLoading(false);
     }
  };

  // VIEWS
  if (step === 'scan') {
    return (
      <div className="h-screen flex flex-col bg-black relative">
        <button 
          className="absolute top-4 left-4 z-20 text-white p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95" 
          onClick={onBack}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-neutral-800 animate-pulse opacity-20"></div>
           <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative z-10 flex items-center justify-center">
             <div className="w-60 h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_red] animate-pulse" />
             <QrCode className="w-12 h-12 text-white/20" />
           </div>
           
           <div className="absolute bottom-8 w-full px-4 space-y-4 z-20">
                <div className="bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <p className="text-center text-white text-sm mb-3 font-medium">Developer Simulation Mode</p>
                    <div className="flex gap-3">
                        <button 
                          className="flex-1 py-3 bg-white text-black rounded-xl text-xs font-bold active:scale-95 transition-transform" 
                          onClick={() => processInput("IDRX:MERCHANT01")}
                        >
                            Simulate QRIS
                        </button>
                        <button 
                          className="flex-1 py-3 bg-neutral-800 text-white border border-white/20 rounded-xl text-xs font-bold active:scale-95 transition-transform" 
                          onClick={() => processInput("mvines9ez1GcuGeR4xpE6Ete25N2del65")}
                        >
                            Simulate SOL Addr
                        </button>
                    </div>
                </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'swap_needed') {
      const missing = txDetails.amount - balances.idrx;
      const costSol = (missing / 1600000) * 1.05;

      return (
        <div className="pb-28 pt-4 px-1">
            <Header title="Insufficient IDRX" onBack={() => setStep('scan')} />
            <div className="space-y-6 mt-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                <p className="text-sm font-medium text-red-400">Transaction requires {txDetails.amount.toLocaleString()} IDRX</p>
                <p className="text-xs text-red-400/70">Swap SOL automatically to complete payment.</p>
                </div>
            </div>
            <Card>
                <h3 className="text-sm font-semibold mb-4 text-secondary uppercase tracking-wider">Bridge & Swap</h3>
                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-border">
                    <div className="flex flex-col">
                         <span className="text-xl font-bold">{costSol.toFixed(4)}</span>
                         <span className="text-xs text-secondary">SOL</span>
                    </div>
                    <ArrowDownLeft className="w-5 h-5 text-secondary" />
                    <div className="flex flex-col text-right">
                         <span className="text-xl font-bold">{missing.toLocaleString()}</span>
                         <span className="text-xs text-secondary">IDRX</span>
                    </div>
                </div>
            </Card>
            <Button fullWidth onClick={handleSwap} isLoading={loading}>Swap & Pay Instantly</Button>
            </div>
        </div>
      );
  }

  if (step === 'confirm_sol' || step === 'confirm_qris') {
      const isSol = step === 'confirm_sol';
      return (
        <div className="pb-28 pt-4">
            <Header title={isSol ? "Send SOL" : "Pay QRIS"} onBack={() => setStep('scan')} />
            <div className="mt-8 text-center flex flex-col items-center px-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <span className="text-4xl font-bold text-black">{isSol ? "S" : "Q"}</span>
                </div>
                <h2 className="text-lg font-medium text-secondary mb-1">Paying to</h2>
                <h2 className="text-xl font-bold text-white mb-6 bg-surface px-4 py-2 rounded-lg border border-border break-all max-w-full">
                  {txDetails.to}
                </h2>
                
                <div className="w-full h-px bg-border mb-6"></div>

                <p className="text-4xl sm:text-5xl font-mono font-bold mb-2 tracking-tighter">
                    {txDetails.amount.toLocaleString()} 
                </p>
                <span className="text-lg text-secondary font-medium mb-12 block">{isSol ? "SOL" : "IDRX"}</span>

                <Button 
                  fullWidth 
                  onClick={isSol ? handleSolTransfer : handleIdrxPayment} 
                  isLoading={loading}
                  className="max-w-sm"
                >
                    Confirm {isSol ? "Transfer" : "Payment"}
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300 px-4">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-black" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white">Sent!</h2>
        <p className="text-secondary mt-2">Transaction confirmed on Solana</p>
      </div>
      <Button variant="outline" onClick={onBack} className="mt-8 max-w-sm">Return Home</Button>
    </div>
  );
};