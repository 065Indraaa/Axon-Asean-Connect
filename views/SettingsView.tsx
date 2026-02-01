import React, { useState } from 'react';
import { Eye, EyeOff, Lock, LogOut } from 'lucide-react';
import { Button, Card, Header } from '../components/UIComponents';
import { UserSession } from '../types';

interface SettingsViewProps {
  user: UserSession;
  onLogout: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, onBack }) => {
    const [showKey, setShowKey] = useState(false);

    const copyPrivateKey = async () => {
        try {
            await navigator.clipboard.writeText(user.privateKeyBase58);
            // Simple feedback
            const button = document.activeElement as HTMLButtonElement;
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to copy private key:', err);
        }
    };

    const copyPublicKey = async () => {
        try {
            await navigator.clipboard.writeText(user.walletAddress);
            // Simple feedback
            const button = document.activeElement as HTMLButtonElement;
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to copy public key:', err);
        }
    };

    return (
        <div className="pb-28 pt-4">
            <Header title="Config" onBack={onBack} />
            <div className="space-y-6 mt-4">
                <Card>
                    <h3 className="font-medium mb-4 text-white">Account Security</h3>
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl break-all border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] uppercase tracking-wider text-secondary">Public Key</p>
                                <button 
                                    onClick={copyPublicKey}
                                    className="text-xs text-white/60 hover:text-white transition-colors active:scale-95"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="font-mono text-xs text-white select-all">{user.walletAddress}</p>
                        </div>
                        
                        <div>
                             <Button 
                               variant="outline" 
                               fullWidth 
                               onClick={() => setShowKey(!showKey)} 
                               className="mb-2"
                             >
                                 {showKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                 {showKey ? "Hide Private Key" : "Export Private Key"}
                             </Button>
                             {showKey && (
                                 <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl mt-2 animate-in fade-in">
                                     <div className="flex justify-between items-center mb-2">
                                         <p className="text-xs text-red-400 font-bold flex items-center gap-2">
                                            <Lock className="w-3 h-3" />
                                            MASTER PRIVATE KEY
                                         </p>
                                         <button 
                                             onClick={copyPrivateKey}
                                             className="text-xs text-red-300/60 hover:text-red-300 transition-colors active:scale-95"
                                         >
                                             Copy
                                         </button>
                                     </div>
                                     <p className="font-mono text-[10px] break-all select-all text-red-200/80">{user.privateKeyBase58}</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-medium mb-4 text-white">Account Info</h3>
                    <div className="space-y-3">
                        {user.email && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Email</span>
                                <span className="text-sm text-white">{user.email}</span>
                            </div>
                        )}
                        {user.twitterHandle && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">X Handle</span>
                                <span className="text-sm text-white">{user.twitterHandle}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary">Network</span>
                            <span className="text-sm text-white">Solana Devnet</span>
                        </div>
                    </div>
                </Card>

                <Button 
                  variant="ghost" 
                  fullWidth 
                  onClick={onLogout} 
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Disconnect Wallet
                </Button>
            </div>
        </div>
    );
};