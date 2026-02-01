import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Card, Header } from '../components/UIComponents';
import * as solanaService from '../services/cryptoService';
import { UserSession, SnapDrop } from '../types';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

interface AxonSnapViewProps {
  onBack: () => void;
  user: UserSession;
  solBalance: number;
  onRefresh: () => void;
}

export const AxonSnapView: React.FC<AxonSnapViewProps> = ({ onBack, user, solBalance, onRefresh }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSnap, setCreatedSnap] = useState<SnapDrop | null>(null);

  const handleCreate = async () => {
    if (!amount) return;
    const val = parseFloat(amount);
    if (val > solBalance) return;

    setLoading(true);
    try {
      const fromKeypair = web3.Keypair.fromSecretKey(bs58.decode(user.privateKeyBase58));
      
      // Call service to create snap (Transfer SOL to temp wallet)
      const { tempKey, signature } = await solanaService.createSnap(fromKeypair, val);
      
      // Generate link (Mock URL structure, but real key)
      const link = `https://axon.app/claim?k=${tempKey}&a=${val}`;
      
      setCreatedSnap({
        id: signature,
        amount: val,
        tempPrivateKey: tempKey,
        link: link,
        createdAt: new Date().toISOString(),
        isClaimed: false
      });
      onRefresh();
    } catch (e) {
      alert("Failed to create snap: " + e);
    } finally {
      setLoading(false);
    }
  };

  if (createdSnap) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300 pb-20">
        <div className="text-center space-y-2">
          <div className="relative">
             <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
             <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <Zap className="w-12 h-12 text-black fill-black" />
             </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Snap Ready!</h2>
          <p className="text-secondary max-w-xs mx-auto">Funds have been moved to a temporary burner wallet.</p>
        </div>

        <Card className="w-full max-w-xs bg-[#0F0F0F] border-dashed border-2 border-neutral-700 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
           <div className="flex flex-col items-center p-4 space-y-4">
             <div className="bg-white p-3 rounded-xl shadow-lg">
                <QRCodeSVG value={createdSnap.tempPrivateKey} size={160} />
             </div>
             <div className="w-full text-center">
               <p className="text-xs text-secondary mb-2 uppercase tracking-wide">Snap Private Key</p>
               <div className="bg-black/80 border border-white/10 p-3 rounded-lg text-[10px] font-mono break-all text-neutral-400 select-all">
                 {createdSnap.tempPrivateKey}
               </div>
             </div>
           </div>
        </Card>

        <Button fullWidth onClick={() => setCreatedSnap(null)}>Create Another</Button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4">
      <Header title="Axon Snap (SOL)" onBack={onBack} />
      <div className="space-y-6 mt-4">
        <div className="p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl border border-white/5 relative overflow-hidden">
          <Zap className="absolute top-4 right-4 w-24 h-24 text-white/5 rotate-12" />
          <p className="text-sm text-secondary mb-1">Available to Snap</p>
          <div className="flex items-baseline gap-2">
             <p className="text-3xl font-mono font-bold text-white">{solBalance.toFixed(4)}</p>
             <span className="text-sm text-secondary">SOL</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input 
            label="Amount (SOL)" 
            type="number" 
            placeholder="0.0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-mono"
          />
          <div className="flex gap-2">
             {[0.1, 0.5, 1.0].map(val => (
                 <button key={val} onClick={() => setAmount(val.toString())} className="flex-1 py-2 bg-surface border border-border rounded-lg text-xs hover:bg-neutral-800 transition-colors">
                     {val} SOL
                 </button>
             ))}
          </div>
          <p className="text-xs text-secondary leading-relaxed bg-surface p-3 rounded-xl border border-border">
            <span className="font-bold text-white">How it works:</span> Creating a snap moves funds to a temporary on-chain wallet. The recipient scans the QR to sweep the wallet contents instantly.
          </p>
        </div>

        <Button fullWidth onClick={handleCreate} isLoading={loading} disabled={!amount || parseFloat(amount) > solBalance}>
          Generate Snap Link
        </Button>
      </div>
    </div>
  );
};