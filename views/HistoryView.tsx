import React, { useState, useEffect } from 'react';
import { Loader2, XCircle, ArrowUpRight, Shield, ExternalLink, X } from 'lucide-react';
import { Card, Header, Button } from '../components/UIComponents';
import * as solanaService from '../services/cryptoService';
import { UserSession, Transaction } from '../types';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

interface HistoryViewProps {
  user: UserSession;
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, onBack }) => {
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const kp = web3.Keypair.fromSecretKey(bs58.decode(user.privateKeyBase58));
                const data = await solanaService.getHistory(kp.publicKey);
                setHistory(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const openExternalExplorer = (signature: string) => {
        const url = `${solanaService.SOLANA_EXPLORER_URL}/${signature}?cluster=devnet`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="pb-28 pt-4 relative">
             <Header title="Private Ledger" onBack={onBack} />
             
             {loading ? (
                 <div className="flex flex-col items-center justify-center pt-20 text-secondary gap-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p>Syncing encrypted data...</p>
                 </div>
             ) : (
                <div className="space-y-3 mt-4">
                {history.map((tx) => (
                    <Card 
                      key={tx.id} 
                      className="flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors active:scale-[0.98]" 
                      onClick={() => setSelectedTx(tx)}
                    >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.status === 'failed' ? 'bg-red-500/10' : 'bg-white/5'}`}>
                           {tx.status === 'failed' ? <XCircle className="w-4 h-4 text-red-500"/> : <ArrowUpRight className="w-4 h-4 text-white"/>}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium text-sm text-white">Transfer</p>
                            <p className="text-[10px] text-secondary font-mono truncate max-w-[120px]">
                              {tx.signature?.slice(0,8)}...{tx.signature?.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-secondary">{tx.date.split(',')[0]}</p>
                        <span className="text-[10px] flex items-center justify-end gap-1 text-secondary mt-1">
                           <Shield className="w-3 h-3" /> Encrypted
                        </span>
                    </div>
                    </Card>
                ))}
                {history.length === 0 && <p className="text-center text-secondary py-10">No transaction history found.</p>}
                </div>
             )}

             {/* Privacy Inspector Modal */}
             {selectedTx && (
                 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                     <div className="w-full max-w-md bg-[#111] border-t sm:border border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
                         <div className="flex items-center justify-between">
                             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-400" />
                                Privacy Inspector
                             </h3>
                             <button 
                               onClick={() => setSelectedTx(null)} 
                               className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-all"
                             >
                                 <X className="w-5 h-5 text-secondary" />
                             </button>
                         </div>

                         <div className="space-y-4">
                             <div className="bg-black border border-border rounded-xl p-4">
                                 <p className="text-[10px] text-secondary uppercase tracking-widest mb-2">Signature Hash</p>
                                 <p className="font-mono text-xs text-white break-all select-all">{selectedTx.signature}</p>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-surface border border-border rounded-xl p-3">
                                     <p className="text-[10px] text-secondary">Status</p>
                                     <p className={`text-sm font-medium ${selectedTx.status === 'confirmed' ? 'text-green-400' : 'text-red-400'}`}>
                                         {selectedTx.status.toUpperCase()}
                                     </p>
                                 </div>
                                 <div className="bg-surface border border-border rounded-xl p-3">
                                     <p className="text-[10px] text-secondary">Privacy Level</p>
                                     <p className="text-sm font-medium text-white">Standard</p>
                                 </div>
                             </div>

                             <div className="bg-yellow-900/10 border border-yellow-500/10 rounded-xl p-3">
                                <p className="text-[10px] text-yellow-500/80 leading-relaxed">
                                    <span className="font-bold">Privacy Note:</span> Viewing this transaction on a public explorer will reveal your IP address and metadata to third-party node providers.
                                </p>
                             </div>
                         </div>

                         <div className="flex gap-3">
                             <Button variant="secondary" fullWidth onClick={() => setSelectedTx(null)}>Close</Button>
                             <Button 
                               variant="outline" 
                               fullWidth 
                               onClick={() => openExternalExplorer(selectedTx.signature || '')}
                             >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Public View
                             </Button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};